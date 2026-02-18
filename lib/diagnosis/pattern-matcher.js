const fs = require('fs').promises;
const path = require('path');
const PatternDatabase = require('./pattern-database');

/**
 * Enhanced Pattern Matcher - Database-powered error pattern recognition
 *
 * Integrates with SQLite database for improved pattern matching, handles fuzzy matching
 * of error descriptions, maintains success statistics, and provides learning capabilities.
 */
class PatternMatcher {
    constructor(dbPath = null) {
        this.database = new PatternDatabase(dbPath);
        this.initialized = false;
        this.patterns = null; // Fallback JSON patterns
        this.patternsPath = path.join(__dirname, '../../data/bug-patterns.json');
    }

    /**
     * Initialize the pattern matcher with database
     */
    async initialize() {
        if (this.initialized) return;

        try {
            await this.database.initialize();
            this.initialized = true;
            console.log('✅ Pattern matcher initialized with database');
        } catch (error) {
            console.warn('⚠️  Database initialization failed, using JSON fallback:', error.message);
            await this.loadJSONFallback();
            this.initialized = true;
        }
    }

    /**
     * Load patterns from JSON file as fallback
     */
    async loadJSONFallback() {
        try {
            const data = await fs.readFile(this.patternsPath, 'utf8');
            this.patterns = JSON.parse(data);
            console.log(`📋 Loaded ${this.patterns.length} patterns from JSON fallback`);
        } catch (error) {
            console.warn('Could not load JSON fallback patterns:', error.message);
            this.patterns = [];
        }
    }

    /**
     * Find matching patterns for a given error description and context
     * @param {string} description - User-provided error description
     * @param {Object} context - Project context from analyzer
     * @returns {Promise<Array>} - Array of matching patterns with confidence scores
     */
    async findMatches(description, context = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Try database first
            if (this.database.db) {
                const matches = await this.database.findMatchingPatterns(description, context);
                console.log(`🔍 Found ${matches.length} database pattern matches`);
                return matches;
            }

            // Fall back to JSON patterns
            return this.findJSONMatches(description, context);

        } catch (error) {
            console.error('Error finding pattern matches:', error);
            return this.findJSONMatches(description, context);
        }
    }

    /**
     * Find matches using JSON patterns (fallback)
     */
    async findJSONMatches(description, context) {
        if (!this.patterns) {
            await this.loadJSONFallback();
        }

        const matches = [];
        const normalizedDescription = description.toLowerCase();

        for (const pattern of this.patterns) {
            const confidence = this.calculateJSONConfidence(pattern, normalizedDescription, context);

            if (confidence > 0.3) {
                matches.push({
                    ...pattern,
                    confidence: Math.min(confidence, 1.0)
                });
            }
        }

        console.log(`📋 Found ${matches.length} JSON pattern matches`);
        return matches.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Calculate confidence score for JSON pattern match
     */
    calculateJSONConfidence(pattern, description, context) {
        let score = 0;

        // 1. Exact keyword matching
        const exactMatches = (pattern.keywords || []).filter(keyword =>
            description.includes(keyword.toLowerCase())
        );
        score += exactMatches.length * 0.3;

        // 2. Error signature matching (regex patterns)
        for (const signature of pattern.errorSignatures || []) {
            try {
                const regex = new RegExp(signature.pattern || signature, 'i');
                if (regex.test(description)) {
                    score += signature.weight || 0.4;
                }
            } catch (e) {
                continue;
            }
        }

        // 3. Fuzzy keyword matching
        const fuzzyMatches = this.calculateFuzzyMatches(pattern.keywords || [], description);
        score += fuzzyMatches * 0.15;

        // 4. Context relevance bonus
        score += this.calculateContextBonus(pattern, context);

        // 5. Success rate bonus
        score += (pattern.successRate || 0.5) * 0.1;

        // 6. Framework-specific bonus
        if (pattern.frameworks && context.framework &&
            pattern.frameworks.includes(context.framework)) {
            score += 0.15;
        }

        return score;
    }

    /**
     * Calculate fuzzy matching score for keywords
     */
    calculateFuzzyMatches(keywords, description) {
        let matches = 0;

        for (const keyword of keywords) {
            const keywordLower = keyword.toLowerCase();
            if (this.containsSimilar(description, keywordLower)) {
                matches += 0.5;
            }
        }

        return Math.min(matches, 1.0);
    }

    /**
     * Check if description contains similar terms
     */
    containsSimilar(description, keyword) {
        const variations = {
            'port': ['port', 'ports', 'socket', 'address'],
            'module': ['module', 'modules', 'package', 'dependency'],
            'file': ['file', 'files', 'directory', 'folder'],
            'build': ['build', 'compile', 'compilation', 'bundle'],
            'install': ['install', 'installation', 'npm', 'yarn'],
            'start': ['start', 'startup', 'launch', 'run'],
            'database': ['database', 'db', 'postgres', 'mysql', 'mongodb'],
            'auth': ['auth', 'authentication', 'login', 'signin'],
            'permission': ['permission', 'permissions', 'access', 'denied']
        };

        const relatedTerms = variations[keyword] || [keyword];

        return relatedTerms.some(term =>
            description.includes(term) ||
            this.calculateLevenshteinDistance(keyword, term) <= 2
        );
    }

    /**
     * Calculate context relevance bonus
     */
    calculateContextBonus(pattern, context) {
        let bonus = 0;

        if (pattern.nodeVersion && context.nodeVersion) {
            const patternVersion = parseInt(pattern.nodeVersion);
            const contextVersion = parseInt(context.nodeVersion);
            if (Math.abs(patternVersion - contextVersion) <= 2) {
                bonus += 0.1;
            }
        }

        if (pattern.os && context.os && pattern.os.includes(context.os)) {
            bonus += 0.05;
        }

        if (pattern.packageManager && context.packageManager === pattern.packageManager) {
            bonus += 0.05;
        }

        if (pattern.complexity && context.complexity === pattern.complexity) {
            bonus += 0.05;
        }

        return bonus;
    }

    /**
     * Simple Levenshtein distance calculation for fuzzy matching
     */
    calculateLevenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
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

        return matrix[b.length][a.length];
    }

    /**
     * Update success rate for a pattern after solution application
     * @param {string|number} patternId - Pattern identifier
     * @param {boolean} successful - Whether solution was successful
     * @param {Object} context - Project context
     * @param {number} executionTime - Time taken to apply solution
     * @returns {Promise<void>}
     */
    async updateSuccessRate(patternId, successful, context = {}, executionTime = 0) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            if (this.database.db) {
                // Use database for success rate tracking
                await this.database.recordApplication(
                    patternId,
                    context,
                    successful,
                    executionTime
                );
                console.log(`📊 Updated pattern ${patternId} success rate in database`);
            } else {
                // Fall back to JSON file update
                await this.updateJSONSuccessRate(patternId, successful);
            }
        } catch (error) {
            console.error('Warning: Could not update pattern success rate:', error.message);
        }
    }

    /**
     * Update success rate in JSON file (fallback)
     */
    async updateJSONSuccessRate(patternId, successful) {
        try {
            if (!this.patterns) {
                await this.loadJSONFallback();
            }

            const pattern = this.patterns.find(p => p.id === patternId);

            if (pattern) {
                pattern.totalApplications = (pattern.totalApplications || 0) + 1;
                pattern.successfulApplications = (pattern.successfulApplications || 0) + (successful ? 1 : 0);
                pattern.successRate = pattern.successfulApplications / pattern.totalApplications;
                pattern.lastUpdated = new Date().toISOString();

                await fs.writeFile(this.patternsPath, JSON.stringify(this.patterns, null, 2));
                console.log(`📋 Updated pattern ${patternId} in JSON file`);
            }
        } catch (error) {
            console.error('Warning: Could not update JSON pattern success rate:', error.message);
        }
    }

    /**
     * Add a new pattern to the database or JSON file
     * @param {Object} pattern - New pattern object
     * @returns {Promise<Object>} - Created pattern with ID
     */
    async addPattern(pattern) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            if (this.database.db) {
                const result = await this.database.addPattern(pattern);
                console.log(`✅ Added pattern '${pattern.name}' to database`);
                return result;
            } else {
                return this.addJSONPattern(pattern);
            }
        } catch (error) {
            console.error('Error adding pattern:', error.message);
            throw error;
        }
    }

    /**
     * Add pattern to JSON file (fallback)
     */
    async addJSONPattern(pattern) {
        if (!this.patterns) {
            await this.loadJSONFallback();
        }

        if (!pattern.id) {
            pattern.id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        pattern.successRate = pattern.successRate || 0.5;
        pattern.totalApplications = pattern.totalApplications || 0;
        pattern.successfulApplications = pattern.successfulApplications || 0;
        pattern.created = new Date().toISOString();
        pattern.lastUpdated = pattern.created;

        this.patterns.push(pattern);
        await fs.writeFile(this.patternsPath, JSON.stringify(this.patterns, null, 2));
        console.log(`📋 Added pattern '${pattern.name}' to JSON file`);

        return pattern;
    }

    /**
     * Get patterns by category
     * @param {string} category - Pattern category
     * @returns {Promise<Array>} - Filtered patterns
     */
    async getPatternsByCategory(category) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            if (this.database.db) {
                return await this.database.searchPatterns('', category);
            } else {
                if (!this.patterns) {
                    await this.loadJSONFallback();
                }
                return this.patterns.filter(p => p.category === category);
            }
        } catch (error) {
            console.error('Error getting patterns by category:', error);
            return [];
        }
    }

    /**
     * Get comprehensive pattern statistics
     * @returns {Promise<Object>} - Statistics summary
     */
    async getStatistics() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            if (this.database.db) {
                const healthInfo = await this.database.getHealthInfo();
                const categoryStats = await this.database.getPatternStatistics();
                const topPatterns = await this.database.getTopPatterns(10);

                return {
                    totalPatterns: healthInfo.total_patterns,
                    totalApplications: healthInfo.total_applications,
                    averageSuccessRate: healthInfo.avg_success_rate,
                    categories: healthInfo.categories,
                    topPerformingPatterns: topPatterns,
                    categoryBreakdown: categoryStats
                };
            } else {
                return this.getJSONStatistics();
            }
        } catch (error) {
            console.error('Error getting statistics:', error);
            return this.getJSONStatistics();
        }
    }

    /**
     * Get statistics from JSON patterns (fallback)
     */
    async getJSONStatistics() {
        if (!this.patterns) {
            await this.loadJSONFallback();
        }

        const stats = {
            totalPatterns: this.patterns.length,
            averageSuccessRate: 0,
            topPerformingPatterns: [],
            categories: {}
        };

        if (this.patterns.length === 0) return stats;

        const totalSuccess = this.patterns.reduce((sum, p) => sum + (p.successRate || 0.5), 0);
        stats.averageSuccessRate = totalSuccess / this.patterns.length;

        stats.topPerformingPatterns = this.patterns
            .filter(p => (p.totalApplications || 0) >= 5)
            .sort((a, b) => (b.successRate || 0.5) - (a.successRate || 0.5))
            .slice(0, 10)
            .map(p => ({
                id: p.id,
                name: p.name,
                successRate: p.successRate || 0.5,
                totalApplications: p.totalApplications || 0
            }));

        for (const pattern of this.patterns) {
            const category = pattern.category || 'uncategorized';
            if (!stats.categories[category]) {
                stats.categories[category] = {
                    count: 0,
                    averageSuccessRate: 0,
                    totalApplications: 0
                };
            }
            stats.categories[category].count++;
            stats.categories[category].totalApplications += pattern.totalApplications || 0;
        }

        for (const category in stats.categories) {
            const categoryPatterns = this.patterns.filter(p => (p.category || 'uncategorized') === category);
            const categorySuccess = categoryPatterns.reduce((sum, p) => sum + (p.successRate || 0.5), 0);
            stats.categories[category].averageSuccessRate = categorySuccess / categoryPatterns.length;
        }

        return stats;
    }

    /**
     * Search patterns by query string
     * @param {string} query - Search query
     * @param {string} category - Optional category filter
     * @returns {Promise<Array>} - Matching patterns
     */
    async searchPatterns(query, category = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            if (this.database.db) {
                return await this.database.searchPatterns(query, category);
            } else {
                if (!this.patterns) {
                    await this.loadJSONFallback();
                }

                let filtered = this.patterns.filter(p =>
                    (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
                    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
                );

                if (category) {
                    filtered = filtered.filter(p => p.category === category);
                }

                return filtered.slice(0, 20);
            }
        } catch (error) {
            console.error('Error searching patterns:', error);
            return [];
        }
    }

    /**
     * Get health information about the pattern system
     * @returns {Promise<Object>} - Health information
     */
    async getHealthInfo() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            if (this.database.db) {
                return await this.database.getHealthInfo();
            } else {
                return {
                    total_patterns: this.patterns ? this.patterns.length : 0,
                    total_applications: 0,
                    avg_success_rate: 0.5,
                    categories: 0,
                    source: 'json_fallback'
                };
            }
        } catch (error) {
            console.error('Error getting health info:', error);
            return { error: error.message };
        }
    }

    /**
     * Close database connections
     */
    async close() {
        if (this.database) {
            await this.database.close();
        }
    }
}

module.exports = PatternMatcher;