const sqlite3 = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');

class PatternDatabase {
    constructor(dbPath = 'data/bug-patterns.sqlite') {
        this.dbPath = dbPath;
        this.db = null;
    }

    /**
     * Initialize database connection and create tables if needed
     */
    async initialize() {
        try {
            await fs.ensureDir(path.dirname(this.dbPath));

            this.db = new sqlite3.Database(this.dbPath);

            await this.createTables();
            await this.createIndexes();

            console.log('✅ Pattern database initialized');
            return true;

        } catch (error) {
            console.error('Failed to initialize pattern database:', error);
            throw error;
        }
    }

    /**
     * Create database tables
     */
    async createTables() {
        return new Promise((resolve, reject) => {
            const createPatternsTable = `
                CREATE TABLE IF NOT EXISTS patterns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    category TEXT NOT NULL,
                    description TEXT NOT NULL,
                    error_signatures TEXT NOT NULL,
                    confidence_indicators TEXT NOT NULL,
                    solution_template TEXT NOT NULL,
                    validation_script TEXT,
                    success_rate REAL DEFAULT 0.0,
                    usage_count INTEGER DEFAULT 0,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createApplicationsTable = `
                CREATE TABLE IF NOT EXISTS pattern_applications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern_id INTEGER NOT NULL,
                    project_type TEXT,
                    success BOOLEAN NOT NULL,
                    execution_time INTEGER,
                    error_message TEXT,
                    context_data TEXT,
                    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (pattern_id) REFERENCES patterns (id)
                )
            `;

            const createStatsTable = `
                CREATE TABLE IF NOT EXISTS pattern_statistics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern_id INTEGER NOT NULL,
                    period TEXT NOT NULL,
                    applications INTEGER DEFAULT 0,
                    successes INTEGER DEFAULT 0,
                    avg_execution_time REAL DEFAULT 0.0,
                    last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (pattern_id) REFERENCES patterns (id)
                )
            `;

            this.db.serialize(() => {
                this.db.run(createPatternsTable);
                this.db.run(createApplicationsTable);
                this.db.run(createStatsTable, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    /**
     * Create database indexes for performance
     */
    async createIndexes() {
        return new Promise((resolve, reject) => {
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns (category)',
                'CREATE INDEX IF NOT EXISTS idx_patterns_success_rate ON patterns (success_rate)',
                'CREATE INDEX IF NOT EXISTS idx_applications_pattern_id ON pattern_applications (pattern_id)',
                'CREATE INDEX IF NOT EXISTS idx_applications_success ON pattern_applications (success)',
                'CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON pattern_applications (applied_at)'
            ];

            this.db.serialize(() => {
                indexes.forEach((indexSQL, i) => {
                    this.db.run(indexSQL, (err) => {
                        if (err && i === 0) reject(err);
                        if (i === indexes.length - 1) resolve();
                    });
                });
            });
        });
    }

    /**
     * Add a new pattern to the database
     */
    async addPattern(pattern) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO patterns (
                    name, category, description, error_signatures,
                    confidence_indicators, solution_template, validation_script
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                pattern.name,
                pattern.category,
                pattern.description,
                JSON.stringify(pattern.error_signatures),
                JSON.stringify(pattern.confidence_indicators),
                pattern.solution_template,
                pattern.validation_script || null
            ];

            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...pattern });
            });
        });
    }

    /**
     * Add multiple patterns in batch
     */
    async addPatterns(patterns) {
        const results = [];

        for (const pattern of patterns) {
            try {
                const result = await this.addPattern(pattern);
                results.push(result);
            } catch (error) {
                console.error(`Failed to add pattern ${pattern.name}:`, error.message);
                results.push({ error: error.message, pattern: pattern.name });
            }
        }

        return results;
    }

    /**
     * Find patterns matching error text
     */
    async findMatchingPatterns(errorText, projectContext = {}) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    id, name, category, description, error_signatures,
                    confidence_indicators, solution_template, validation_script,
                    success_rate, usage_count
                FROM patterns
                ORDER BY success_rate DESC, usage_count DESC
            `;

            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const matchedPatterns = [];

                for (const row of rows) {
                    const errorSignatures = JSON.parse(row.error_signatures);
                    const confidenceIndicators = JSON.parse(row.confidence_indicators);

                    const confidence = this.calculatePatternConfidence(
                        errorText,
                        errorSignatures,
                        confidenceIndicators,
                        projectContext
                    );

                    if (confidence > 0.1) { // Only include patterns with >10% confidence
                        matchedPatterns.push({
                            ...row,
                            error_signatures: errorSignatures,
                            confidence_indicators: confidenceIndicators,
                            confidence: confidence
                        });
                    }
                }

                // Sort by confidence score, then by success rate
                matchedPatterns.sort((a, b) => {
                    if (Math.abs(a.confidence - b.confidence) < 0.05) {
                        return b.success_rate - a.success_rate;
                    }
                    return b.confidence - a.confidence;
                });

                resolve(matchedPatterns.slice(0, 10)); // Return top 10 matches
            });
        });
    }

    /**
     * Calculate confidence score for a pattern match
     */
    calculatePatternConfidence(errorText, errorSignatures, confidenceIndicators, projectContext) {
        let baseConfidence = 0;
        let contextBonus = 0;

        // Check error signature matches
        for (const signature of errorSignatures) {
            const regex = new RegExp(signature, 'i');
            if (regex.test(errorText)) {
                baseConfidence = Math.max(baseConfidence, 0.8);
                break;
            }
        }

        // Fuzzy matching for partial matches
        if (baseConfidence < 0.5) {
            baseConfidence = this.calculateFuzzyMatch(errorText, errorSignatures);
        }

        // Context-based confidence boost
        for (const indicator of confidenceIndicators) {
            if (this.checkContextIndicator(indicator, projectContext)) {
                contextBonus += 0.15;
            }
        }

        return Math.min(baseConfidence + contextBonus, 1.0);
    }

    /**
     * Calculate fuzzy match score using Levenshtein distance
     */
    calculateFuzzyMatch(errorText, signatures) {
        let bestMatch = 0;

        for (const signature of signatures) {
            const similarity = this.calculateSimilarity(
                errorText.toLowerCase(),
                signature.toLowerCase()
            );

            if (similarity > 0.6) { // Only consider good fuzzy matches
                bestMatch = Math.max(bestMatch, similarity * 0.6); // Reduce confidence for fuzzy matches
            }
        }

        return bestMatch;
    }

    /**
     * Calculate string similarity using normalized Levenshtein distance
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Check if context indicator applies to current project
     */
    checkContextIndicator(indicator, projectContext) {
        const lowerIndicator = indicator.toLowerCase();

        // Check package.json dependencies
        if (lowerIndicator.includes('react') && projectContext.hasReact) return true;
        if (lowerIndicator.includes('next.js') && projectContext.hasNext) return true;
        if (lowerIndicator.includes('node.js') && projectContext.hasNode) return true;
        if (lowerIndicator.includes('express') && projectContext.hasExpress) return true;

        // Check file existence
        if (lowerIndicator.includes('package.json') && projectContext.hasPackageJson) return true;
        if (lowerIndicator.includes('.env') && projectContext.hasEnvFile) return true;

        // Check port usage
        if (lowerIndicator.includes('port') && projectContext.commonPorts) {
            return projectContext.commonPorts.some(port => lowerIndicator.includes(port.toString()));
        }

        return false;
    }

    /**
     * Record pattern application result
     */
    async recordApplication(patternId, projectContext, success, executionTime, errorMessage = null) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO pattern_applications (
                    pattern_id, project_type, success, execution_time, error_message, context_data
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const params = [
                patternId,
                projectContext.type || 'unknown',
                success,
                executionTime,
                errorMessage,
                JSON.stringify(projectContext)
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Update usage count and success rate
                    this.updatePatternStatistics(patternId);
                    resolve(this.lastID);
                }
            }.bind(this));
        });
    }

    /**
     * Update pattern statistics after application
     */
    async updatePatternStatistics(patternId) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE patterns
                SET
                    usage_count = usage_count + 1,
                    success_rate = (
                        SELECT CAST(SUM(success) AS REAL) / COUNT(*)
                        FROM pattern_applications
                        WHERE pattern_id = ?
                    ),
                    last_updated = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            this.db.run(sql, [patternId, patternId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Get pattern statistics
     */
    async getPatternStatistics(patternId = null) {
        return new Promise((resolve, reject) => {
            let sql, params;

            if (patternId) {
                sql = `
                    SELECT
                        p.*,
                        COUNT(pa.id) as total_applications,
                        SUM(CASE WHEN pa.success = 1 THEN 1 ELSE 0 END) as successful_applications,
                        AVG(pa.execution_time) as avg_execution_time
                    FROM patterns p
                    LEFT JOIN pattern_applications pa ON p.id = pa.pattern_id
                    WHERE p.id = ?
                    GROUP BY p.id
                `;
                params = [patternId];
            } else {
                sql = `
                    SELECT
                        p.category,
                        COUNT(p.id) as pattern_count,
                        COUNT(pa.id) as total_applications,
                        SUM(CASE WHEN pa.success = 1 THEN 1 ELSE 0 END) as successful_applications,
                        AVG(p.success_rate) as avg_success_rate
                    FROM patterns p
                    LEFT JOIN pattern_applications pa ON p.id = pa.pattern_id
                    GROUP BY p.category
                    ORDER BY avg_success_rate DESC
                `;
                params = [];
            }

            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get top performing patterns
     */
    async getTopPatterns(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    name, category, description, success_rate, usage_count,
                    (success_rate * 0.7 + (usage_count / 100.0) * 0.3) as score
                FROM patterns
                WHERE usage_count > 0
                ORDER BY score DESC
                LIMIT ?
            `;

            this.db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Search patterns by category or name
     */
    async searchPatterns(query, category = null) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT id, name, category, description, success_rate, usage_count
                FROM patterns
                WHERE (name LIKE ? OR description LIKE ?)
            `;
            let params = [`%${query}%`, `%${query}%`];

            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            sql += ' ORDER BY success_rate DESC, usage_count DESC LIMIT 20';

            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) console.error('Error closing database:', err);
                    resolve();
                });
            });
        }
    }

    /**
     * Get database health information
     */
    async getHealthInfo() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    (SELECT COUNT(*) FROM patterns) as total_patterns,
                    (SELECT COUNT(*) FROM pattern_applications) as total_applications,
                    (SELECT AVG(success_rate) FROM patterns) as avg_success_rate,
                    (SELECT COUNT(DISTINCT category) FROM patterns) as categories
            `;

            this.db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

module.exports = PatternDatabase;