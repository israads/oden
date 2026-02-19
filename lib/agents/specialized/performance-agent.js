/**
 * Performance Specialized Agent
 *
 * Analyzes code for performance bottlenecks, bundle size optimization,
 * database query efficiency, memory leaks, and caching strategies.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const BaseSpecializedAgent = require('./base-agent');
const fs = require('fs').promises;
const path = require('path');

class PerformanceAgent extends BaseSpecializedAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'performance-agent',
            description: 'Performance bottleneck detection and optimization analyzer'
        });

        // Performance patterns to detect issues
        this.performancePatterns = {
            // Bundle size and optimization
            bundleSize: [
                { pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"`]lodash['"`]/, severity: 'medium', message: 'Import entire lodash library increases bundle size' },
                { pattern: /import\s+\{\s*[^}]{100,}\s*\}/, severity: 'low', message: 'Large destructured import may indicate unused dependencies' },
                { pattern: /require\(['"`][^'"`]*\/moment['"`]\)/, severity: 'high', message: 'Moment.js is large - consider date-fns or dayjs' },
                { pattern: /import.*['"`]moment['"`]/, severity: 'high', message: 'Moment.js adds significant bundle size' }
            ],

            // Database queries and N+1 problems
            database: [
                { pattern: /\.forEach\(.*\.(find|findOne|findById|query)\(/, severity: 'high', message: 'Potential N+1 query problem in loop' },
                { pattern: /for\s*\([^}]*\)\s*{[^}]*\.(find|findOne|findById|query)\(/, severity: 'high', message: 'Database query inside loop' },
                { pattern: /SELECT\s+\*\s+FROM/, severity: 'medium', message: 'SELECT * can be inefficient for large tables' },
                { pattern: /\.find\(\)\s*$/, severity: 'medium', message: 'Unbounded query without limit' }
            ],

            // React component optimization
            reactOptimization: [
                { pattern: /useEffect\(\(\)\s*=>\s*{[^}]*},\s*\[\]\)/, severity: 'low', message: 'useEffect with empty deps - consider useMemo/useCallback' },
                { pattern: /\{\s*\.\.\.props\s*\}/, severity: 'medium', message: 'Spreading all props can cause unnecessary re-renders' },
                { pattern: /useState\([^)]*\[\]/, severity: 'low', message: 'Consider useReducer for complex state arrays' },
                { pattern: /JSON\.parse\(.*JSON\.stringify/, severity: 'high', message: 'Inefficient deep cloning - use proper library' }
            ],

            // Memory leaks and resource management
            memoryLeaks: [
                { pattern: /setInterval\([^}]*\)(?![^}]*clearInterval)/, severity: 'high', message: 'setInterval without clearInterval can cause memory leaks' },
                { pattern: /setTimeout\([^}]*\)(?![^}]*clearTimeout)/, severity: 'medium', message: 'setTimeout should be cleared if component unmounts' },
                { pattern: /addEventListener\([^}]*\)(?![^}]*removeEventListener)/, severity: 'high', message: 'Event listener without cleanup' },
                { pattern: /new\s+Array\(\d{4,}\)/, severity: 'medium', message: 'Large array allocation may cause performance issues' }
            ],

            // Caching and memoization
            caching: [
                { pattern: /fetch\([^)]*\)(?![^}]*cache)/, severity: 'low', message: 'API call without caching strategy' },
                { pattern: /axios\.(get|post)\([^)]*\)(?![^}]*cache)/, severity: 'low', message: 'HTTP request without caching' },
                { pattern: /expensive.*calculation/, severity: 'medium', message: 'Consider memoizing expensive calculations' },
                { pattern: /\.sort\(\)\.filter\(\)\.map\(\)/, severity: 'medium', message: 'Chain of array operations - consider optimization' }
            ],

            // Synchronous operations
            blocking: [
                { pattern: /fs\.readFileSync/, severity: 'high', message: 'Synchronous file operation blocks event loop' },
                { pattern: /fs\.writeFileSync/, severity: 'high', message: 'Synchronous file write blocks event loop' },
                { pattern: /child_process\.execSync/, severity: 'high', message: 'Synchronous process execution blocks event loop' },
                { pattern: /JSON\.parse\(.*\.readFileSync/, severity: 'high', message: 'Synchronous JSON parsing blocks event loop' }
            ],

            // Frontend performance
            domPerformance: [
                { pattern: /document\.querySelector\([^)]*\)(?=.*loop|.*for|.*forEach)/, severity: 'medium', message: 'DOM query in loop - cache the result' },
                { pattern: /innerHTML\s*=/, severity: 'medium', message: 'innerHTML can be slow for frequent updates' },
                { pattern: /\.style\.\w+\s*=/, severity: 'low', message: 'Direct style manipulation - consider CSS classes' },
                { pattern: /getComputedStyle\(/, severity: 'low', message: 'getComputedStyle forces layout recalculation' }
            ],

            // Inefficient algorithms
            algorithms: [
                { pattern: /\.indexOf\([^)]*\)\s*!==\s*-1/, severity: 'low', message: 'Consider using .includes() for readability' },
                { pattern: /for\s*\([^}]*\)\s*{[^}]*for\s*\([^}]*\)/, severity: 'medium', message: 'Nested loops - O(n²) complexity' },
                { pattern: /\.find\([^)]*\)\.find\(/, severity: 'medium', message: 'Chained .find() calls are inefficient' },
                { pattern: /Object\.keys\([^)]*\)\.length/, severity: 'low', message: 'Use Object.entries() or for...in for better performance' }
            ]
        };

        // Bundle analysis thresholds (in KB)
        this.bundleThresholds = {
            critical: 1000, // 1MB
            high: 500,      // 500KB
            medium: 250,    // 250KB
            low: 100        // 100KB
        };

        // Performance metrics to track
        this.performanceMetrics = {
            bundleSize: 0,
            dependencies: 0,
            heavyDependencies: [],
            databaseQueries: 0,
            potentialN1Problems: 0,
            memoryLeakRisks: 0,
            cachingOpportunities: 0,
            blockingOperations: 0
        };
    }

    getAgentType() {
        return 'performance';
    }

    getRequiredTools() {
        return ['npm', 'node'];
    }

    /**
     * Perform comprehensive performance analysis
     */
    async performAnalysis(projectInfo) {
        const analyses = [
            this.analyzeBundleSize(projectInfo),
            this.scanForPerformanceIssues(projectInfo),
            this.analyzeDatabaseQueries(projectInfo),
            this.checkMemoryLeakRisks(projectInfo),
            this.analyzeCachingStrategy(projectInfo),
            this.checkBlockingOperations(projectInfo),
            this.analyzeReactPerformance(projectInfo),
            this.benchmarkCriticalPaths(projectInfo)
        ];

        const results = await Promise.allSettled(analyses);

        // Process results and handle any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Performance analysis step ${index + 1} failed:`, result.reason);
            }
        });

        return this.results;
    }

    /**
     * Analyze bundle size and dependencies
     */
    async analyzeBundleSize(projectInfo) {
        const packageJsonPath = path.join(projectInfo.root, 'package.json');

        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            this.performanceMetrics.dependencies = Object.keys(allDeps).length;

            // Check for heavy dependencies
            const heavyDependencies = [
                { name: 'moment', size: 232, alternative: 'dayjs (2KB) or date-fns (13KB)' },
                { name: 'lodash', size: 528, alternative: 'lodash-es with tree shaking' },
                { name: 'jquery', size: 287, alternative: 'native DOM APIs' },
                { name: 'bootstrap', size: 154, alternative: 'tailwindcss or custom CSS' },
                { name: 'material-ui', size: 1200, alternative: 'lighter UI library' },
                { name: 'antd', size: 1100, alternative: 'chakra-ui or mantine' }
            ];

            for (const dep of heavyDependencies) {
                if (allDeps[dep.name]) {
                    this.performanceMetrics.heavyDependencies.push(dep.name);

                    this.addFinding(
                        dep.size > 500 ? 'high' : 'medium',
                        'bundle-size',
                        `Heavy dependency: ${dep.name} (~${dep.size}KB)`,
                        {
                            file: 'package.json',
                            recommendation: `Consider alternative: ${dep.alternative}`,
                            fixSuggestion: `Replace ${dep.name} with lighter alternative`,
                            confidence: 0.8,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['bundle-size', 'dependencies', 'optimization'],
                            metadata: { dependencySize: dep.size, alternative: dep.alternative }
                        }
                    );
                }
            }

            // Analyze bundle configuration
            await this.analyzeBundleConfig(projectInfo);

        } catch (error) {
            console.warn('Could not analyze bundle size:', error.message);
        }
    }

    /**
     * Scan files for performance patterns
     */
    async scanForPerformanceIssues(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check each performance pattern category
                for (const [category, patterns] of Object.entries(this.performancePatterns)) {
                    for (const patternInfo of patterns) {
                        await this.checkPerformancePattern(file, content, lines, category, patternInfo, projectInfo);
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze database queries for N+1 problems
     */
    async analyzeDatabaseQueries(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Look for ORM usage patterns
                const ormPatterns = [
                    { pattern: /\.find\(\)/, orm: 'mongoose/sequelize' },
                    { pattern: /\.findOne\(/, orm: 'mongoose/sequelize' },
                    { pattern: /\.aggregate\(/, orm: 'mongoose' },
                    { pattern: /query\(['"`]SELECT/, orm: 'raw SQL' }
                ];

                let queryCount = 0;
                for (const orm of ormPatterns) {
                    const matches = content.match(new RegExp(orm.pattern, 'g'));
                    if (matches) {
                        queryCount += matches.length;
                    }
                }

                this.performanceMetrics.databaseQueries += queryCount;

                if (queryCount > 10) {
                    this.addFinding(
                        'medium',
                        'database-performance',
                        `High number of database queries (${queryCount}) in single file`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider query optimization, pagination, or caching',
                            fixSuggestion: 'Use batch queries, joins, or implement query caching',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['database', 'queries', 'optimization'],
                            metadata: { queryCount }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze database queries in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check for memory leak risks
     */
    async checkMemoryLeakRisks(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);
        let totalRisks = 0;

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check for common memory leak patterns
                const memoryLeakPatterns = [
                    {
                        pattern: /setInterval\(/,
                        cleanup: /clearInterval\(/,
                        type: 'interval timer'
                    },
                    {
                        pattern: /setTimeout\(/,
                        cleanup: /clearTimeout\(/,
                        type: 'timeout timer'
                    },
                    {
                        pattern: /addEventListener\(/,
                        cleanup: /removeEventListener\(/,
                        type: 'event listener'
                    },
                    {
                        pattern: /new\s+WebSocket\(/,
                        cleanup: /\.close\(\)/,
                        type: 'websocket connection'
                    }
                ];

                for (const leak of memoryLeakPatterns) {
                    const setterCount = (content.match(leak.pattern) || []).length;
                    const cleanupCount = (content.match(leak.cleanup) || []).length;

                    if (setterCount > cleanupCount) {
                        totalRisks += (setterCount - cleanupCount);

                        this.addFinding(
                            'high',
                            'memory-leaks',
                            `Potential memory leak: ${leak.type} without cleanup (${setterCount - cleanupCount} instances)`,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: `Ensure all ${leak.type}s are properly cleaned up`,
                                fixSuggestion: `Add cleanup in componentWillUnmount/useEffect cleanup/finally blocks`,
                                confidence: 0.8,
                                impact: 'high',
                                effort: 'low',
                                tags: ['memory-leaks', 'resource-management', 'cleanup'],
                                metadata: {
                                    setterCount,
                                    cleanupCount,
                                    leakType: leak.type
                                }
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not check memory leaks in ${file}:`, error.message);
            }
        }

        this.performanceMetrics.memoryLeakRisks = totalRisks;
    }

    /**
     * Analyze caching strategy
     */
    async analyzeCachingStrategy(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);
        let cachingOpportunities = 0;

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Look for API calls without caching
                const apiPatterns = [
                    /fetch\([^)]*\)/g,
                    /axios\.(get|post|put|delete)\([^)]*\)/g,
                    /http\.(get|post|put|delete)\([^)]*\)/g
                ];

                let apiCallCount = 0;
                for (const pattern of apiPatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        apiCallCount += matches.length;
                    }
                }

                // Check for caching keywords
                const hasCaching = /cache|memo|useMemo|useCallback|redis|memcache/.test(content);

                if (apiCallCount > 3 && !hasCaching) {
                    cachingOpportunities++;

                    this.addFinding(
                        'medium',
                        'caching-strategy',
                        `${apiCallCount} API calls without apparent caching strategy`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Implement caching for frequently accessed data',
                            fixSuggestion: 'Use React Query, SWR, or implement custom caching layer',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['caching', 'api-optimization', 'performance'],
                            metadata: { apiCallCount }
                        }
                    );
                }

                // Look for expensive calculations without memoization
                const expensivePatterns = [
                    /\.sort\(\).+\.filter\(\).+\.map\(/,
                    /for\s*\([^}]*\)\s*{[^}]*for\s*\(/,
                    /reduce\([^)]*\)/g
                ];

                for (const pattern of expensivePatterns) {
                    const matches = content.match(pattern);
                    if (matches && !hasCaching) {
                        this.addFinding(
                            'low',
                            'memoization',
                            'Expensive computation without memoization',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Consider memoizing expensive calculations',
                                fixSuggestion: 'Use useMemo, useCallback, or implement custom memoization',
                                confidence: 0.5,
                                impact: 'low',
                                effort: 'low',
                                tags: ['memoization', 'computation', 'optimization']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze caching in ${file}:`, error.message);
            }
        }

        this.performanceMetrics.cachingOpportunities = cachingOpportunities;
    }

    /**
     * Check for blocking operations
     */
    async checkBlockingOperations(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);
        let blockingOps = 0;

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                const blockingPatterns = [
                    { pattern: /\.readFileSync\(/, alternative: 'fs.readFile()' },
                    { pattern: /\.writeFileSync\(/, alternative: 'fs.writeFile()' },
                    { pattern: /execSync\(/, alternative: 'exec() with callback' },
                    { pattern: /JSON\.parse\(.*\.readFileSync/, alternative: 'async JSON parsing' }
                ];

                for (const blocking of blockingPatterns) {
                    const matches = content.match(new RegExp(blocking.pattern, 'g'));
                    if (matches) {
                        blockingOps += matches.length;

                        this.addFinding(
                            'high',
                            'blocking-operations',
                            `Synchronous operation blocks event loop: ${blocking.pattern.source}`,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: `Replace with asynchronous alternative: ${blocking.alternative}`,
                                fixSuggestion: `Use ${blocking.alternative} with async/await`,
                                confidence: 0.9,
                                impact: 'high',
                                effort: 'low',
                                tags: ['blocking', 'async', 'event-loop']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not check blocking operations in ${file}:`, error.message);
            }
        }

        this.performanceMetrics.blockingOperations = blockingOps;
    }

    /**
     * Analyze React-specific performance issues
     */
    async analyzeReactPerformance(projectInfo) {
        if (projectInfo.framework !== 'react' && projectInfo.framework !== 'nextjs') {
            return;
        }

        const sourceFiles = await this.getReactFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check for React performance anti-patterns
                const reactIssues = [
                    {
                        pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*\.map\(/,
                        message: 'Arrow function in render - creates new function on each render',
                        severity: 'medium',
                        fix: 'Move function outside component or use useCallback'
                    },
                    {
                        pattern: /onClick=\{[^}]*=>/,
                        message: 'Inline arrow function in onClick',
                        severity: 'low',
                        fix: 'Use useCallback or define function outside render'
                    },
                    {
                        pattern: /style=\{\{[^}]+\}\}/,
                        message: 'Inline style object - creates new object on each render',
                        severity: 'low',
                        fix: 'Move style object outside component or use CSS classes'
                    },
                    {
                        pattern: /useEffect\([^,]*,\s*\[.*\.\w+.*\]\)/,
                        message: 'useEffect dependency might cause unnecessary re-runs',
                        severity: 'medium',
                        fix: 'Consider using useCallback for object dependencies'
                    }
                ];

                for (const issue of reactIssues) {
                    const matches = [...content.matchAll(new RegExp(issue.pattern, 'g'))];
                    for (const match of matches) {
                        const lineNumber = this.findLineNumber(lines, match[0]);

                        this.addFinding(
                            issue.severity,
                            'react-performance',
                            issue.message,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: lineNumber,
                                codeSnippet: lines[lineNumber - 1]?.trim(),
                                recommendation: issue.fix,
                                confidence: 0.6,
                                impact: issue.severity,
                                effort: 'low',
                                tags: ['react', 'performance', 'rendering']
                            }
                        );
                    }
                }

                // Check for missing React.memo or useMemo opportunities
                const hasExpensiveOperations = /\.sort\(|\.filter\(.*\.map\(|\.reduce\(/.test(content);
                const hasReactMemo = /React\.memo|useMemo/.test(content);

                if (hasExpensiveOperations && !hasReactMemo) {
                    this.addFinding(
                        'medium',
                        'react-optimization',
                        'Component has expensive operations but no memoization',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider using React.memo, useMemo, or useCallback',
                            fixSuggestion: 'Wrap component with React.memo or memoize expensive calculations',
                            confidence: 0.5,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['react', 'memoization', 'optimization']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze React performance in ${file}:`, error.message);
            }
        }
    }

    /**
     * Benchmark critical paths (basic analysis)
     */
    async benchmarkCriticalPaths(projectInfo) {
        // This would involve more complex timing analysis
        // For now, we'll identify potentially critical paths

        const sourceFiles = await this.getSourceFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Look for main entry points and critical functions
                const criticalPatterns = [
                    { pattern: /app\.listen\(/, type: 'Server startup' },
                    { pattern: /ReactDOM\.render\(/, type: 'React app initialization' },
                    { pattern: /function.*middleware|const.*middleware/, type: 'Middleware function' },
                    { pattern: /router\.(get|post|put|delete)\(/, type: 'Route handler' }
                ];

                for (const critical of criticalPatterns) {
                    if (critical.pattern.test(content)) {
                        // Basic complexity analysis
                        const complexityScore = this.calculateComplexity(content);

                        if (complexityScore > 10) {
                            this.addFinding(
                                'medium',
                                'critical-path-performance',
                                `${critical.type} has high complexity (score: ${complexityScore})`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    recommendation: 'Consider breaking down complex logic',
                                    fixSuggestion: 'Split into smaller functions or add performance monitoring',
                                    confidence: 0.6,
                                    impact: 'medium',
                                    effort: 'medium',
                                    tags: ['complexity', 'critical-path', 'optimization'],
                                    metadata: { complexityScore }
                                }
                            );
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not benchmark critical paths in ${file}:`, error.message);
            }
        }
    }

    /**
     * Helper methods
     */

    async checkPerformancePattern(file, content, lines, category, patternInfo, projectInfo) {
        const matches = [...content.matchAll(new RegExp(patternInfo.pattern, 'g'))];

        for (const match of matches) {
            const lineNumber = this.findLineNumber(lines, match[0]);
            const line = lines[lineNumber - 1] || '';

            // Update metrics
            if (category === 'database') {
                this.performanceMetrics.potentialN1Problems++;
            }

            this.addFinding(
                patternInfo.severity,
                category,
                patternInfo.message,
                {
                    file: path.relative(projectInfo.root, file),
                    line: lineNumber,
                    codeSnippet: line.trim(),
                    recommendation: this.getRecommendationForPattern(category, patternInfo),
                    fixSuggestion: this.getFixSuggestion(category, patternInfo),
                    confidence: 0.7,
                    impact: patternInfo.severity,
                    effort: 'medium',
                    tags: [category, 'performance-pattern']
                }
            );
        }
    }

    async analyzeBundleConfig(projectInfo) {
        const webpackConfigPath = path.join(projectInfo.root, 'webpack.config.js');
        const nextConfigPath = path.join(projectInfo.root, 'next.config.js');

        try {
            let configContent = '';
            let configFile = '';

            try {
                configContent = await fs.readFile(webpackConfigPath, 'utf8');
                configFile = 'webpack.config.js';
            } catch (e) {
                try {
                    configContent = await fs.readFile(nextConfigPath, 'utf8');
                    configFile = 'next.config.js';
                } catch (e) {
                    return; // No config file found
                }
            }

            // Check for bundle optimization settings
            const optimizations = [
                { pattern: /splitChunks/, present: true, message: 'Code splitting is configured' },
                { pattern: /minimize:\s*true/, present: true, message: 'Minification is enabled' },
                { pattern: /treeshaking/, present: true, message: 'Tree shaking is configured' },
                { pattern: /analyzer/, present: true, message: 'Bundle analyzer is configured' }
            ];

            const missingOptimizations = optimizations.filter(opt =>
                !opt.pattern.test(configContent)
            );

            if (missingOptimizations.length > 0) {
                this.addFinding(
                    'medium',
                    'bundle-optimization',
                    `Missing bundle optimizations: ${missingOptimizations.length} features`,
                    {
                        file: configFile,
                        recommendation: 'Enable code splitting, minification, and tree shaking',
                        fixSuggestion: 'Configure webpack optimization settings',
                        confidence: 0.8,
                        impact: 'medium',
                        effort: 'medium',
                        tags: ['bundle', 'webpack', 'optimization']
                    }
                );
            }
        } catch (error) {
            console.warn('Could not analyze bundle config:', error.message);
        }
    }

    async getSourceFiles(rootDir) {
        const files = [];
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.rb', '.php', '.java'];

        async function walkDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
                            await walkDir(fullPath);
                        }
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not read directory ${dir}:`, error.message);
            }
        }

        await walkDir(rootDir);
        return files;
    }

    async getReactFiles(rootDir) {
        const files = await this.getSourceFiles(rootDir);
        return files.filter(file => {
            const ext = path.extname(file);
            return ['.jsx', '.tsx'].includes(ext) || file.includes('component');
        });
    }

    findLineNumber(lines, searchText) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }

    calculateComplexity(content) {
        // Simple cyclomatic complexity calculation
        const complexityPatterns = [
            /if\s*\(/g,
            /else\s+if/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /&&/g,
            /\|\|/g
        ];

        let complexity = 1; // Base complexity
        for (const pattern of complexityPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }

        return complexity;
    }

    getRecommendationForPattern(category, patternInfo) {
        const recommendations = {
            bundleSize: 'Optimize imports and consider lighter alternatives',
            database: 'Optimize queries, use batch operations, implement caching',
            reactOptimization: 'Use React performance hooks and best practices',
            memoryLeaks: 'Implement proper cleanup in useEffect or componentWillUnmount',
            caching: 'Implement caching strategies for repeated operations',
            blocking: 'Replace synchronous operations with asynchronous alternatives',
            domPerformance: 'Cache DOM queries and minimize direct style manipulation',
            algorithms: 'Optimize algorithm complexity and data structures'
        };

        return recommendations[category] || 'Review and optimize this performance issue';
    }

    getFixSuggestion(category, patternInfo) {
        const suggestions = {
            bundleSize: 'Use tree shaking, import only needed modules',
            database: 'Use .populate(), .include(), or batch queries',
            reactOptimization: 'Use React.memo, useMemo, useCallback',
            memoryLeaks: 'Add cleanup functions in useEffect return',
            caching: 'Use React Query, SWR, or implement custom cache',
            blocking: 'Use async/await with Promise-based alternatives',
            domPerformance: 'Cache selectors, use CSS classes instead of inline styles',
            algorithms: 'Use more efficient algorithms or data structures'
        };

        return suggestions[category] || 'Optimize this code pattern';
    }

    /**
     * Get general performance recommendations
     */
    async getGeneralRecommendations() {
        const recommendations = [
            {
                priority: 'high',
                category: 'general',
                title: 'Implement Performance Monitoring',
                description: 'Add performance monitoring to track real-world performance',
                action: 'Integrate tools like Lighthouse CI, Web Vitals, or APM solutions',
                estimated_effort: 'medium',
                impact: 'high'
            },
            {
                priority: 'medium',
                category: 'general',
                title: 'Set Up Bundle Analysis',
                description: 'Regular bundle analysis helps identify optimization opportunities',
                action: 'Add webpack-bundle-analyzer or similar tool to CI/CD',
                estimated_effort: 'low',
                impact: 'medium'
            },
            {
                priority: 'medium',
                category: 'general',
                title: 'Implement Caching Strategy',
                description: 'Proper caching can significantly improve performance',
                action: 'Implement HTTP caching, API response caching, or client-side caching',
                estimated_effort: 'high',
                impact: 'high'
            }
        ];

        return recommendations;
    }

    validateProject(projectInfo) {
        // Performance agent can analyze most project types
        return projectInfo && projectInfo.root;
    }
}

module.exports = PerformanceAgent;