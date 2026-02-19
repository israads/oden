/**
 * Quality Specialized Agent
 *
 * Measures code complexity, maintainability metrics, style consistency,
 * test coverage, dependency health, documentation completeness, and refactoring opportunities.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const BaseSpecializedAgent = require('./base-agent');
const fs = require('fs').promises;
const path = require('path');

class QualityAgent extends BaseSpecializedAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'quality-agent',
            description: 'Code quality metrics and maintainability analyzer'
        });

        // Code quality patterns and metrics
        this.qualityPatterns = {
            // Code complexity indicators
            complexity: [
                { pattern: /if\s*\([^)]*&&[^)]*&&/g, weight: 2, message: 'Complex conditional with multiple AND operators' },
                { pattern: /if\s*\([^)]*\|\|[^)]*\|\|/g, weight: 2, message: 'Complex conditional with multiple OR operators' },
                { pattern: /switch\s*\([^)]*\)\s*{[^}]*case[^}]*case[^}]*case/gs, weight: 3, message: 'Large switch statement' },
                { pattern: /for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/gs, weight: 3, message: 'Nested loops increase complexity' },
                { pattern: /while\s*\([^)]*\)\s*{[^}]*while\s*\([^)]*\)/gs, weight: 3, message: 'Nested while loops' },
                { pattern: /try\s*{[^}]*catch[^}]*catch/gs, weight: 2, message: 'Multiple catch blocks' }
            ],

            // Code style and consistency
            styleConsistency: [
                { pattern: /var\s+\w+/g, severity: 'medium', message: 'Use const/let instead of var' },
                { pattern: /==\s*[^=]/g, severity: 'low', message: 'Use strict equality (===) instead of loose equality (==)' },
                { pattern: /console\.log\(/g, severity: 'low', message: 'Remove console.log statements before production' },
                { pattern: /debugger;/g, severity: 'medium', message: 'Remove debugger statements' },
                { pattern: /TODO|FIXME|HACK|XXX/gi, severity: 'low', message: 'Unresolved TODO/FIXME comments' }
            ],

            // Best practices violations
            bestPractices: [
                { pattern: /new Date\(\)\.getTime\(\)/g, severity: 'low', message: 'Use Date.now() instead of new Date().getTime()' },
                { pattern: /parseInt\([^,)]*\)(?!.*,\s*10)/g, severity: 'medium', message: 'Always specify radix in parseInt()' },
                { pattern: /isNaN\(/g, severity: 'medium', message: 'Use Number.isNaN() instead of global isNaN()' },
                { pattern: /Array\.prototype\.(map|filter|reduce)\.call/g, severity: 'low', message: 'Use array spread or Array.from() instead of prototype methods' },
                { pattern: /delete\s+\w+\[/g, severity: 'medium', message: 'Avoid delete operator on object properties' }
            ],

            // Error handling patterns
            errorHandling: [
                { pattern: /try\s*{[^}]*}\s*catch\s*\([^)]*\)\s*{[^}]*}/g, good: true, message: 'Try-catch block found' },
                { pattern: /\.catch\(/g, good: true, message: 'Promise error handling found' },
                { pattern: /throw\s+new\s+Error/g, good: true, message: 'Proper error throwing' },
                { pattern: /catch\s*\([^)]*\)\s*{\s*}/g, good: false, message: 'Empty catch block - should handle or re-throw' }
            ],

            // Code duplication indicators
            duplication: [
                { pattern: /function\s+(\w+)[^}]*{([^}]*)}[\s\S]*function\s+\w+[^}]*{\2}/g, message: 'Potentially duplicated function logic' },
                { pattern: /(const|let|var)\s+\w+\s*=\s*([^;]+);[\s\S]*\1\s+\w+\s*=\s*\2;/g, message: 'Duplicated variable assignments' }
            ],

            // Documentation patterns
            documentation: [
                { pattern: /\/\*\*[\s\S]*?\*\//g, good: true, message: 'JSDoc comment found' },
                { pattern: /\/\/ TODO:/gi, good: false, message: 'TODO comment - should be tracked properly' },
                { pattern: /\/\/ FIXME:/gi, good: false, message: 'FIXME comment - indicates technical debt' },
                { pattern: /README\.md/i, good: true, message: 'README documentation' }
            ]
        };

        // Complexity thresholds
        this.complexityThresholds = {
            low: 5,
            medium: 10,
            high: 15,
            critical: 20
        };

        // Quality metrics tracking
        this.qualityMetrics = {
            totalLines: 0,
            codeLines: 0,
            commentLines: 0,
            blankLines: 0,
            functions: 0,
            classes: 0,
            complexity: 0,
            testFiles: 0,
            documentationFiles: 0,
            todoCount: 0,
            duplicatedBlocks: 0,
            codeSmells: 0
        };

        // File type patterns for analysis
        this.fileTypes = {
            source: ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.rb', '.php', '.java', '.cs'],
            test: ['.test.js', '.test.ts', '.spec.js', '.spec.ts', '_test.go', '_test.py', 'Test.java', 'Test.cs'],
            config: ['.json', '.yml', '.yaml', '.toml', '.ini', '.config.js', '.config.ts'],
            documentation: ['.md', '.txt', '.rst', '.adoc']
        };
    }

    getAgentType() {
        return 'quality';
    }

    getRequiredTools() {
        return ['node']; // Basic Node.js for file processing
    }

    /**
     * Perform comprehensive quality analysis
     */
    async performAnalysis(projectInfo) {
        const analyses = [
            this.measureComplexity(projectInfo),
            this.analyzeCodeStyle(projectInfo),
            this.checkBestPractices(projectInfo),
            this.analyzeDuplication(projectInfo),
            this.assessTestCoverage(projectInfo),
            this.evaluateDocumentation(projectInfo),
            this.analyzeDependencyHealth(projectInfo),
            this.identifyRefactoringOpportunities(projectInfo),
            this.calculateMaintainabilityIndex(projectInfo),
            this.generateProjectHealthScore(projectInfo)
        ];

        const results = await Promise.allSettled(analyses);

        // Process results and handle any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Quality analysis step ${index + 1} failed:`, result.reason);
            }
        });

        return this.results;
    }

    /**
     * Measure cyclomatic complexity and other complexity metrics
     */
    async measureComplexity(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                const complexity = this.calculateCyclomaticComplexity(content);
                const linesOfCode = this.countLinesOfCode(content);
                const functionCount = this.countFunctions(content);

                this.qualityMetrics.totalLines += lines.length;
                this.qualityMetrics.codeLines += linesOfCode.code;
                this.qualityMetrics.commentLines += linesOfCode.comments;
                this.qualityMetrics.blankLines += linesOfCode.blank;
                this.qualityMetrics.functions += functionCount;
                this.qualityMetrics.complexity += complexity;

                // Report high complexity files
                if (complexity > this.complexityThresholds.high) {
                    this.addFinding(
                        complexity > this.complexityThresholds.critical ? 'critical' : 'high',
                        'high-complexity',
                        `High cyclomatic complexity: ${complexity}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider breaking down complex functions into smaller, more manageable pieces',
                            fixSuggestion: 'Extract methods, reduce nesting, simplify conditional logic',
                            confidence: 0.8,
                            impact: 'high',
                            effort: 'high',
                            tags: ['complexity', 'maintainability', 'refactoring'],
                            metadata: {
                                complexityScore: complexity,
                                linesOfCode: linesOfCode.code,
                                functionCount
                            }
                        }
                    );
                }

                // Check for long functions
                const longFunctions = this.findLongFunctions(content, lines);
                for (const longFunc of longFunctions) {
                    this.addFinding(
                        longFunc.length > 100 ? 'high' : 'medium',
                        'long-function',
                        `Long function: ${longFunc.length} lines`,
                        {
                            file: path.relative(projectInfo.root, file),
                            line: longFunc.startLine,
                            recommendation: 'Break down long functions into smaller, focused functions',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['function-length', 'maintainability'],
                            metadata: { functionLength: longFunc.length, functionName: longFunc.name }
                        }
                    );
                }

                // Check for deeply nested code
                const maxNesting = this.calculateMaxNesting(content);
                if (maxNesting > 4) {
                    this.addFinding(
                        maxNesting > 6 ? 'high' : 'medium',
                        'deep-nesting',
                        `Deep nesting level: ${maxNesting}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Reduce nesting levels using early returns and guard clauses',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['nesting', 'readability', 'complexity'],
                            metadata: { maxNesting }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not measure complexity in ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze code style and consistency
     */
    async analyzeCodeStyle(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check style patterns
                for (const [category, patterns] of Object.entries(this.qualityPatterns.styleConsistency)) {
                    for (const patternInfo of patterns) {
                        const matches = [...content.matchAll(new RegExp(patternInfo.pattern, 'g'))];

                        if (matches.length > 0) {
                            this.qualityMetrics.codeSmells += matches.length;

                            this.addFinding(
                                patternInfo.severity,
                                'code-style',
                                `${patternInfo.message} (${matches.length} occurrences)`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    recommendation: this.getStyleRecommendation(patternInfo.pattern),
                                    confidence: 0.8,
                                    impact: patternInfo.severity,
                                    effort: 'low',
                                    tags: ['code-style', 'consistency', 'best-practices'],
                                    metadata: { occurrences: matches.length }
                                }
                            );
                        }
                    }
                }

                // Check indentation consistency
                const indentationIssues = this.analyzeIndentation(lines);
                if (indentationIssues.inconsistent > 0) {
                    this.addFinding(
                        'low',
                        'indentation-consistency',
                        `Inconsistent indentation: ${indentationIssues.inconsistent} lines`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Use consistent indentation (spaces or tabs, not mixed)',
                            confidence: 0.6,
                            impact: 'low',
                            effort: 'low',
                            tags: ['formatting', 'consistency'],
                            metadata: indentationIssues
                        }
                    );
                }

                // Check line length
                const longLines = lines.filter(line => line.length > 120).length;
                if (longLines > 0) {
                    this.addFinding(
                        'low',
                        'line-length',
                        `${longLines} lines exceed 120 characters`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Break long lines for better readability',
                            confidence: 0.5,
                            impact: 'low',
                            effort: 'low',
                            tags: ['formatting', 'readability'],
                            metadata: { longLineCount: longLines }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze code style in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check adherence to best practices
     */
    async checkBestPractices(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check best practice patterns
                for (const patternInfo of this.qualityPatterns.bestPractices) {
                    const matches = [...content.matchAll(new RegExp(patternInfo.pattern, 'g'))];

                    if (matches.length > 0) {
                        this.addFinding(
                            patternInfo.severity,
                            'best-practices',
                            `${patternInfo.message} (${matches.length} occurrences)`,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: this.getBestPracticeRecommendation(patternInfo.pattern),
                                confidence: 0.8,
                                impact: patternInfo.severity,
                                effort: 'low',
                                tags: ['best-practices', 'code-quality'],
                                metadata: { occurrences: matches.length }
                            }
                        );
                    }
                }

                // Check error handling patterns
                for (const errorPattern of this.qualityPatterns.errorHandling) {
                    const matches = [...content.matchAll(new RegExp(errorPattern.pattern, 'g'))];

                    if (matches.length > 0) {
                        this.addFinding(
                            errorPattern.good ? 'info' : 'medium',
                            'error-handling',
                            `${errorPattern.message} (${matches.length} occurrences)`,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: errorPattern.good
                                    ? 'Good error handling practice'
                                    : 'Improve error handling implementation',
                                confidence: 0.7,
                                impact: errorPattern.good ? 'low' : 'medium',
                                effort: 'low',
                                tags: ['error-handling', 'robustness'],
                                metadata: { occurrences: matches.length }
                            }
                        );
                    }
                }

                // Check for unused variables (basic heuristic)
                const unusedVars = this.findUnusedVariables(content);
                if (unusedVars.length > 0) {
                    this.addFinding(
                        'low',
                        'unused-variables',
                        `${unusedVars.length} potentially unused variables`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Remove unused variables to reduce clutter',
                            confidence: 0.5,
                            impact: 'low',
                            effort: 'low',
                            tags: ['unused-code', 'cleanup'],
                            metadata: { unusedVariables: unusedVars.slice(0, 5) } // Limit to first 5
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not check best practices in ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze code duplication
     */
    async analyzeDuplication(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');
        const codeBlocks = [];

        // Collect code blocks from all files
        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const blocks = this.extractCodeBlocks(content, file);
                codeBlocks.push(...blocks);
            } catch (error) {
                console.warn(`Could not analyze duplication in ${file}:`, error.message);
            }
        }

        // Find similar blocks
        const duplicatedBlocks = this.findSimilarBlocks(codeBlocks);

        for (const duplicate of duplicatedBlocks) {
            this.qualityMetrics.duplicatedBlocks++;

            this.addFinding(
                duplicate.similarity > 0.9 ? 'high' : 'medium',
                'code-duplication',
                `Duplicated code block found (${Math.round(duplicate.similarity * 100)}% similar)`,
                {
                    file: path.relative(projectInfo.root, duplicate.file1),
                    line: duplicate.line1,
                    recommendation: 'Extract common code into reusable function or module',
                    fixSuggestion: 'Create a shared utility function or component',
                    confidence: 0.7,
                    impact: 'medium',
                    effort: 'medium',
                    tags: ['duplication', 'dry-principle', 'refactoring'],
                    metadata: {
                        similarityScore: duplicate.similarity,
                        duplicateFile: path.relative(projectInfo.root, duplicate.file2),
                        duplicateLine: duplicate.line2
                    }
                }
            );
        }
    }

    /**
     * Assess test coverage and test quality
     */
    async assessTestCoverage(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');
        const testFiles = await this.getFilesByType(projectInfo.root, 'test');

        this.qualityMetrics.testFiles = testFiles.length;

        // Basic test coverage heuristic
        const sourceFileCount = sourceFiles.length;
        const testFileCount = testFiles.length;
        const testCoverageRatio = sourceFileCount > 0 ? testFileCount / sourceFileCount : 0;

        if (testCoverageRatio < 0.3) {
            this.addFinding(
                'high',
                'low-test-coverage',
                `Low test coverage: ${testFileCount} test files for ${sourceFileCount} source files`,
                {
                    recommendation: 'Increase test coverage to at least 30% of source files',
                    fixSuggestion: 'Write unit tests for critical functions and components',
                    confidence: 0.6,
                    impact: 'high',
                    effort: 'high',
                    tags: ['test-coverage', 'quality-assurance', 'testing'],
                    metadata: {
                        sourceFiles: sourceFileCount,
                        testFiles: testFileCount,
                        coverageRatio: Math.round(testCoverageRatio * 100)
                    }
                }
            );
        }

        // Analyze test file quality
        for (const testFile of testFiles) {
            try {
                const content = await fs.readFile(testFile, 'utf8');

                const testPatterns = [
                    { pattern: /describe\(|it\(|test\(/g, type: 'test cases' },
                    { pattern: /expect\(|assert\(/g, type: 'assertions' },
                    { pattern: /mock|stub|spy/gi, type: 'mocking' },
                    { pattern: /beforeEach|afterEach|setUp|tearDown/gi, type: 'setup/cleanup' }
                ];

                const testMetrics = {};
                for (const testPattern of testPatterns) {
                    const matches = content.match(testPattern.pattern) || [];
                    testMetrics[testPattern.type] = matches.length;
                }

                // Check for proper test structure
                if (testMetrics['test cases'] === 0) {
                    this.addFinding(
                        'medium',
                        'test-structure',
                        'Test file contains no recognizable test cases',
                        {
                            file: path.relative(projectInfo.root, testFile),
                            recommendation: 'Add proper test cases using describe/it or test() functions',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['test-structure', 'test-quality']
                        }
                    );
                }

                if (testMetrics['assertions'] === 0) {
                    this.addFinding(
                        'high',
                        'missing-assertions',
                        'Test file has no assertions',
                        {
                            file: path.relative(projectInfo.root, testFile),
                            recommendation: 'Add assertions to verify expected behavior',
                            confidence: 0.8,
                            impact: 'high',
                            effort: 'low',
                            tags: ['assertions', 'test-quality']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze test file ${testFile}:`, error.message);
            }
        }
    }

    /**
     * Evaluate documentation completeness
     */
    async evaluateDocumentation(projectInfo) {
        const docFiles = await this.getFilesByType(projectInfo.root, 'documentation');
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');

        this.qualityMetrics.documentationFiles = docFiles.length;

        // Check for essential documentation files
        const essentialDocs = ['README.md', 'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md'];
        const missingDocs = [];

        for (const docName of essentialDocs) {
            const docExists = docFiles.some(file => path.basename(file).toLowerCase() === docName.toLowerCase());
            if (!docExists) {
                missingDocs.push(docName);
            }
        }

        if (missingDocs.length > 0) {
            this.addFinding(
                missingDocs.includes('README.md') ? 'high' : 'medium',
                'missing-documentation',
                `Missing essential documentation: ${missingDocs.join(', ')}`,
                {
                    recommendation: 'Create essential documentation files for better project maintainability',
                    fixSuggestion: 'Start with README.md explaining project setup and usage',
                    confidence: 0.8,
                    impact: missingDocs.includes('README.md') ? 'high' : 'medium',
                    effort: 'medium',
                    tags: ['documentation', 'project-health', 'onboarding'],
                    metadata: { missingDocuments: missingDocs }
                }
            );
        }

        // Analyze inline documentation
        let totalComments = 0;
        let functionsWithDocs = 0;
        let totalFunctions = 0;

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Count JSDoc comments
                const jsdocComments = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
                totalComments += jsdocComments;

                // Count functions and their documentation
                const functions = this.extractFunctions(content);
                totalFunctions += functions.length;
                functionsWithDocs += functions.filter(func => func.hasDocumentation).length;
            } catch (error) {
                console.warn(`Could not analyze documentation in ${file}:`, error.message);
            }
        }

        const docRatio = totalFunctions > 0 ? functionsWithDocs / totalFunctions : 0;

        if (docRatio < 0.5 && totalFunctions > 10) {
            this.addFinding(
                'medium',
                'low-inline-documentation',
                `Low inline documentation: ${Math.round(docRatio * 100)}% of functions documented`,
                {
                    recommendation: 'Add JSDoc comments to functions, especially public APIs',
                    confidence: 0.6,
                    impact: 'medium',
                    effort: 'high',
                    tags: ['inline-documentation', 'jsdoc', 'api-documentation'],
                    metadata: {
                        totalFunctions,
                        documentedFunctions: functionsWithDocs,
                        documentationRatio: Math.round(docRatio * 100)
                    }
                }
            );
        }
    }

    /**
     * Analyze dependency health
     */
    async analyzeDependencyHealth(projectInfo) {
        const packageJsonPath = path.join(projectInfo.root, 'package.json');

        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            const depCount = Object.keys(allDeps).length;
            const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
            const prodDepCount = Object.keys(packageJson.dependencies || {}).length;

            // Check for excessive dependencies
            if (depCount > 100) {
                this.addFinding(
                    'medium',
                    'excessive-dependencies',
                    `High number of dependencies: ${depCount}`,
                    {
                        recommendation: 'Review and remove unused dependencies',
                        confidence: 0.6,
                        impact: 'medium',
                        effort: 'medium',
                        tags: ['dependencies', 'bundle-size', 'maintenance'],
                        metadata: { totalDependencies: depCount, production: prodDepCount, development: devDepCount }
                    }
                );
            }

            // Check for outdated or problematic dependencies
            const problematicDeps = [
                'lodash', 'moment', 'request', 'node-sass', 'bower'
            ];

            const foundProblematic = problematicDeps.filter(dep => allDeps[dep]);
            if (foundProblematic.length > 0) {
                this.addFinding(
                    'medium',
                    'problematic-dependencies',
                    `Potentially outdated dependencies: ${foundProblematic.join(', ')}`,
                    {
                        recommendation: 'Consider modern alternatives for better performance and security',
                        fixSuggestion: 'Replace with: lodash-es, dayjs, axios, dart-sass',
                        confidence: 0.7,
                        impact: 'medium',
                        effort: 'medium',
                        tags: ['dependencies', 'modernization', 'performance'],
                        metadata: { problematicDependencies: foundProblematic }
                    }
                );
            }

            // Check dependency versioning strategy
            const looseVersions = Object.entries(allDeps).filter(([dep, version]) =>
                version.startsWith('^') || version.startsWith('~')
            ).length;

            const exactVersions = Object.entries(allDeps).filter(([dep, version]) =>
                !version.startsWith('^') && !version.startsWith('~') && !version.startsWith('>')
            ).length;

            if (exactVersions / depCount > 0.8) {
                this.addFinding(
                    'low',
                    'rigid-versioning',
                    'Most dependencies use exact versions - consider allowing patch updates',
                    {
                        recommendation: 'Use semver ranges (^) for patch and minor updates',
                        confidence: 0.5,
                        impact: 'low',
                        effort: 'low',
                        tags: ['dependencies', 'versioning', 'maintenance']
                    }
                );
            }
        } catch (error) {
            console.warn('Could not analyze dependency health:', error.message);
        }
    }

    /**
     * Identify refactoring opportunities
     */
    async identifyRefactoringOpportunities(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Large files
                if (lines.length > 500) {
                    this.addFinding(
                        'medium',
                        'large-file',
                        `Large file: ${lines.length} lines`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider splitting large files into smaller, focused modules',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'high',
                            tags: ['file-size', 'refactoring', 'modularity'],
                            metadata: { lineCount: lines.length }
                        }
                    );
                }

                // God classes/objects (too many methods/properties)
                const methodCount = (content.match(/^\s*(function\s+\w+|[a-zA-Z_$][\w$]*\s*:\s*function|\w+\s*\([^)]*\)\s*{)/gm) || []).length;
                if (methodCount > 20) {
                    this.addFinding(
                        'medium',
                        'god-class',
                        `Class/module with too many methods: ${methodCount}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Break down large classes into smaller, focused components',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'high',
                            tags: ['god-class', 'single-responsibility', 'refactoring'],
                            metadata: { methodCount }
                        }
                    );
                }

                // Feature envy (accessing external data too much)
                const externalAccess = (content.match(/\w+\.\w+\.\w+/g) || []).length;
                const totalStatements = (content.match(/;|\n/g) || []).length;

                if (totalStatements > 0 && (externalAccess / totalStatements) > 0.3) {
                    this.addFinding(
                        'low',
                        'feature-envy',
                        'High external data access - possible feature envy',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider moving functionality closer to the data it uses',
                            confidence: 0.4,
                            impact: 'low',
                            effort: 'medium',
                            tags: ['feature-envy', 'coupling', 'refactoring'],
                            metadata: { externalAccessRatio: Math.round((externalAccess / totalStatements) * 100) }
                        }
                    );
                }

                // Magic numbers
                const magicNumbers = content.match(/\b\d{2,}\b/g) || [];
                const uniqueMagicNumbers = [...new Set(magicNumbers)].filter(num =>
                    !['100', '200', '300', '400', '500', '1000'].includes(num)
                );

                if (uniqueMagicNumbers.length > 5) {
                    this.addFinding(
                        'low',
                        'magic-numbers',
                        `Multiple magic numbers found: ${uniqueMagicNumbers.slice(0, 3).join(', ')}...`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Replace magic numbers with named constants',
                            confidence: 0.6,
                            impact: 'low',
                            effort: 'low',
                            tags: ['magic-numbers', 'readability', 'constants'],
                            metadata: { magicNumberCount: uniqueMagicNumbers.length }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not identify refactoring opportunities in ${file}:`, error.message);
            }
        }
    }

    /**
     * Calculate maintainability index
     */
    async calculateMaintainabilityIndex(projectInfo) {
        const sourceFiles = await this.getFilesByType(projectInfo.root, 'source');
        let totalMaintainabilityIndex = 0;
        let fileCount = 0;

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                const complexity = this.calculateCyclomaticComplexity(content);
                const linesOfCode = this.countLinesOfCode(content);
                const commentRatio = linesOfCode.comments / Math.max(linesOfCode.code, 1);

                // Simplified maintainability index calculation
                // Based on: 171 - 5.2 * ln(Halstead Volume) - 0.23 * CC - 16.2 * ln(Lines of Code) + 50 * sin(sqrt(2.4 * Comment%))
                const maintainabilityIndex = Math.max(0,
                    100 - (complexity * 2) - (linesOfCode.code / 100) + (commentRatio * 20)
                );

                totalMaintainabilityIndex += maintainabilityIndex;
                fileCount++;

                if (maintainabilityIndex < 40) {
                    this.addFinding(
                        'high',
                        'low-maintainability',
                        `Low maintainability index: ${Math.round(maintainabilityIndex)}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Improve code structure, reduce complexity, add documentation',
                            confidence: 0.7,
                            impact: 'high',
                            effort: 'high',
                            tags: ['maintainability', 'code-health', 'refactoring'],
                            metadata: {
                                maintainabilityIndex: Math.round(maintainabilityIndex),
                                complexity,
                                linesOfCode: linesOfCode.code,
                                commentRatio: Math.round(commentRatio * 100)
                            }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not calculate maintainability index for ${file}:`, error.message);
            }
        }

        const avgMaintainabilityIndex = fileCount > 0 ? totalMaintainabilityIndex / fileCount : 0;
        this.qualityMetrics.maintainabilityIndex = Math.round(avgMaintainabilityIndex);
    }

    /**
     * Generate overall project health score
     */
    async generateProjectHealthScore(projectInfo) {
        const metrics = this.qualityMetrics;

        // Calculate various health indicators
        const testCoverageScore = Math.min(100, (metrics.testFiles / Math.max(1, metrics.totalLines / 1000)) * 100);
        const documentationScore = Math.min(100, (metrics.documentationFiles / Math.max(1, metrics.totalLines / 2000)) * 100);
        const complexityScore = Math.max(0, 100 - (metrics.complexity / Math.max(1, metrics.functions)) * 10);
        const codeSmellScore = Math.max(0, 100 - (metrics.codeSmells / Math.max(1, metrics.codeLines / 100)));

        const overallScore = Math.round(
            (testCoverageScore * 0.3) +
            (documentationScore * 0.2) +
            (complexityScore * 0.3) +
            (codeSmellScore * 0.2)
        );

        this.addFinding(
            overallScore < 60 ? 'high' : overallScore < 80 ? 'medium' : 'info',
            'project-health-score',
            `Project health score: ${overallScore}/100`,
            {
                recommendation: overallScore < 60
                    ? 'Project needs significant quality improvements'
                    : overallScore < 80
                        ? 'Project has good quality with room for improvement'
                        : 'Project maintains good quality standards',
                confidence: 0.7,
                impact: overallScore < 60 ? 'high' : 'medium',
                effort: 'ongoing',
                tags: ['project-health', 'quality-score', 'metrics'],
                metadata: {
                    overallScore,
                    testCoverageScore: Math.round(testCoverageScore),
                    documentationScore: Math.round(documentationScore),
                    complexityScore: Math.round(complexityScore),
                    codeSmellScore: Math.round(codeSmellScore),
                    metrics
                }
            }
        );
    }

    /**
     * Helper methods for quality analysis
     */

    calculateCyclomaticComplexity(content) {
        let complexity = 1; // Base complexity

        const complexityPatterns = [
            /if\s*\(/g,
            /else\s+if\s*\(/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /&&/g,
            /\|\|/g,
            /\?.*:/g, // Ternary operator
            /switch\s*\(/g
        ];

        for (const pattern of complexityPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }

        return complexity;
    }

    countLinesOfCode(content) {
        const lines = content.split('\n');
        let code = 0;
        let comments = 0;
        let blank = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '') {
                blank++;
            } else if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
                comments++;
            } else {
                code++;
            }
        }

        return { code, comments, blank };
    }

    countFunctions(content) {
        const functionPatterns = [
            /function\s+\w+/g,
            /const\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
            /let\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
            /\w+\s*:\s*function/g,
            /\w+\s*:\s*\([^)]*\)\s*=>/g
        ];

        let functionCount = 0;
        for (const pattern of functionPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                functionCount += matches.length;
            }
        }

        return functionCount;
    }

    findLongFunctions(content, lines) {
        const functions = [];
        const functionPattern = /function\s+(\w+)[^{]*{|(\w+)\s*:\s*function[^{]*{|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g;
        let match;

        while ((match = functionPattern.exec(content)) !== null) {
            const functionName = match[1] || match[2] || match[3] || 'anonymous';
            const startLine = this.findLineNumber(lines, match[0]);

            // Simple brace matching to find function end
            const functionEnd = this.findFunctionEnd(content, match.index);
            const endLine = this.findLineNumber(lines, content.substring(match.index, functionEnd));
            const length = endLine - startLine + 1;

            if (length > 50) { // Functions longer than 50 lines
                functions.push({
                    name: functionName,
                    startLine,
                    length
                });
            }
        }

        return functions;
    }

    findFunctionEnd(content, startIndex) {
        let braceCount = 0;
        let inString = false;
        let stringChar = '';

        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];

            if (!inString) {
                if (char === '"' || char === "'" || char === '`') {
                    inString = true;
                    stringChar = char;
                } else if (char === '{') {
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        return i;
                    }
                }
            } else if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        }

        return content.length;
    }

    calculateMaxNesting(content) {
        let maxNesting = 0;
        let currentNesting = 0;
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            if (!inString) {
                if (char === '"' || char === "'" || char === '`') {
                    inString = true;
                    stringChar = char;
                } else if (char === '{') {
                    currentNesting++;
                    maxNesting = Math.max(maxNesting, currentNesting);
                } else if (char === '}') {
                    currentNesting--;
                }
            } else if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        }

        return maxNesting;
    }

    analyzeIndentation(lines) {
        let tabLines = 0;
        let spaceLines = 0;
        let inconsistent = 0;

        for (const line of lines) {
            if (line.trim() === '') continue;

            const leadingWhitespace = line.match(/^(\s*)/)[1];
            if (leadingWhitespace.length === 0) continue;

            const hasTabs = leadingWhitespace.includes('\t');
            const hasSpaces = leadingWhitespace.includes(' ');

            if (hasTabs && hasSpaces) {
                inconsistent++;
            } else if (hasTabs) {
                tabLines++;
            } else if (hasSpaces) {
                spaceLines++;
            }
        }

        return {
            tabLines,
            spaceLines,
            inconsistent,
            mixedStyle: tabLines > 0 && spaceLines > 0
        };
    }

    findUnusedVariables(content) {
        // Very basic heuristic - looks for variables that are declared but never referenced
        const variableDeclarations = content.match(/(?:const|let|var)\s+(\w+)/g) || [];
        const unused = [];

        for (const declaration of variableDeclarations) {
            const varName = declaration.split(/\s+/)[1];
            const usagePattern = new RegExp(`\\b${varName}\\b`, 'g');
            const usages = content.match(usagePattern) || [];

            if (usages.length === 1) { // Only the declaration
                unused.push(varName);
            }
        }

        return unused;
    }

    extractCodeBlocks(content, fileName) {
        const blocks = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length - 5; i++) { // At least 5 lines for a block
            const block = lines.slice(i, i + 10).join('\n'); // 10-line blocks
            if (block.trim().length > 50) { // Ignore very short blocks
                blocks.push({
                    content: block,
                    file: fileName,
                    line: i + 1,
                    hash: this.simpleHash(block.replace(/\s+/g, ' ')) // Normalize whitespace
                });
            }
        }

        return blocks;
    }

    findSimilarBlocks(blocks) {
        const similar = [];

        for (let i = 0; i < blocks.length - 1; i++) {
            for (let j = i + 1; j < blocks.length; j++) {
                if (blocks[i].file !== blocks[j].file) { // Different files
                    const similarity = this.calculateStringSimilarity(
                        blocks[i].content,
                        blocks[j].content
                    );

                    if (similarity > 0.7) { // 70% similarity threshold
                        similar.push({
                            file1: blocks[i].file,
                            line1: blocks[i].line,
                            file2: blocks[j].file,
                            line2: blocks[j].line,
                            similarity
                        });
                    }
                }
            }
        }

        return similar;
    }

    calculateStringSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
        const words2 = str2.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);

        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = Math.max(words1.length, words2.length);

        return commonWords.length / totalWords;
    }

    extractFunctions(content) {
        const functions = [];
        const functionPattern = /(\/\*\*[\s\S]*?\*\/)?\s*(function\s+(\w+)|(\w+)\s*:\s*function|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>)/g;
        let match;

        while ((match = functionPattern.exec(content)) !== null) {
            const hasDocumentation = !!match[1];
            const functionName = match[3] || match[4] || match[5] || 'anonymous';

            functions.push({
                name: functionName,
                hasDocumentation
            });
        }

        return functions;
    }

    async getFilesByType(rootDir, type) {
        const files = [];
        const extensions = this.fileTypes[type] || [];

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
                        const matchesType = type === 'test'
                            ? extensions.some(ext => entry.name.includes(ext))
                            : extensions.includes(path.extname(entry.name));

                        if (matchesType) {
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

    findLineNumber(lines, searchText) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    getStyleRecommendation(pattern) {
        const recommendations = {
            'var\\s+\\w+': 'Use const or let instead of var for block scoping',
            '==\\s*[^=]': 'Use strict equality (===) to avoid type coercion',
            'console\\.log\\(': 'Remove console.log statements or use a proper logging library',
            'debugger;': 'Remove debugger statements before production deployment'
        };

        for (const [key, recommendation] of Object.entries(recommendations)) {
            if (new RegExp(key).test(pattern.source || pattern)) {
                return recommendation;
            }
        }

        return 'Follow established code style guidelines';
    }

    getBestPracticeRecommendation(pattern) {
        const recommendations = {
            'new Date\\(\\)\\.getTime\\(\\)': 'Use Date.now() for better performance',
            'parseInt\\([^,)]*\\)': 'Always specify radix parameter in parseInt()',
            'isNaN\\(': 'Use Number.isNaN() instead of global isNaN()',
            'delete\\s+\\w+\\[': 'Use Map or Set instead of delete operator for better performance'
        };

        for (const [key, recommendation] of Object.entries(recommendations)) {
            if (new RegExp(key).test(pattern.source || pattern)) {
                return recommendation;
            }
        }

        return 'Follow JavaScript best practices and modern standards';
    }

    /**
     * Get general quality recommendations
     */
    async getGeneralRecommendations() {
        const metrics = this.qualityMetrics;
        const recommendations = [];

        if (metrics.testFiles === 0) {
            recommendations.push({
                priority: 'high',
                category: 'testing',
                title: 'Implement Testing Framework',
                description: 'No test files detected - testing is crucial for code quality',
                action: 'Set up Jest, Mocha, or similar testing framework',
                estimated_effort: 'medium',
                impact: 'high'
            });
        }

        if (metrics.documentationFiles === 0) {
            recommendations.push({
                priority: 'high',
                category: 'documentation',
                title: 'Create Project Documentation',
                description: 'Missing essential documentation for maintainability',
                action: 'Start with README.md and add inline code comments',
                estimated_effort: 'medium',
                impact: 'high'
            });
        }

        if (metrics.codeSmells > metrics.codeLines / 50) {
            recommendations.push({
                priority: 'medium',
                category: 'code-quality',
                title: 'Address Code Quality Issues',
                description: 'High number of code smells detected',
                action: 'Set up ESLint or similar linting tools',
                estimated_effort: 'low',
                impact: 'medium'
            });
        }

        return recommendations;
    }

    validateProject(projectInfo) {
        // Quality agent can analyze any project with source code
        return projectInfo && projectInfo.root;
    }
}

module.exports = QualityAgent;