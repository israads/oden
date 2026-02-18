const fs = require('fs').promises;
const path = require('path');

/**
 * Context Analyzer - Analyzes project context for intelligent brainstorming
 *
 * Examines existing documentation, project structure, and technical decisions
 * to provide context for generating relevant brainstorming questions.
 */
class ContextAnalyzer {
    constructor() {
        this.cwd = process.cwd();
    }

    /**
     * Analyze project context for brainstorming
     * @returns {Promise<Object>} - Project context object
     */
    async analyze() {
        const context = {
            framework: 'unknown',
            projectType: 'unknown',
            projectName: 'unknown',
            hasExistingDocs: false,
            existingFeatures: [],
            technicalDecisions: {},
            competitiveInsights: [],
            teamSize: 'unknown',
            timeline: 'unknown'
        };

        try {
            // Analyze package.json
            await this.analyzePackageJson(context);

            // Analyze existing documentation
            await this.analyzeDocumentation(context);

            // Analyze existing PRDs
            await this.analyzeExistingPRDs(context);

            // Analyze technical decisions
            await this.analyzeTechnicalDecisions(context);

            // Analyze competitive analysis
            await this.analyzeCompetitiveAnalysis(context);

            // Analyze project structure
            await this.analyzeProjectStructure(context);

            return context;

        } catch (error) {
            console.error('Warning: Context analysis incomplete:', error.message);
            return context;
        }
    }

    /**
     * Analyze package.json for framework and project info
     * @param {Object} context - Context object to populate
     */
    async analyzePackageJson(context) {
        try {
            const packageJsonPath = path.join(this.cwd, 'package.json');
            const content = await fs.readFile(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(content);

            context.projectName = packageJson.name || 'unknown';
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            // Detect framework
            if (dependencies.next || dependencies['@next/core']) {
                context.framework = 'next.js';
                context.projectType = 'web-app';
            } else if (dependencies.react && dependencies['react-dom']) {
                context.framework = 'react';
                context.projectType = 'web-app';
            } else if (dependencies.react && dependencies['react-native']) {
                context.framework = 'react-native';
                context.projectType = 'mobile-app';
            } else if (dependencies.expo || dependencies['@expo/cli']) {
                context.framework = 'expo';
                context.projectType = 'mobile-app';
            } else if (dependencies.vue) {
                context.framework = 'vue';
                context.projectType = 'web-app';
            } else if (dependencies.angular || dependencies['@angular/core']) {
                context.framework = 'angular';
                context.projectType = 'web-app';
            } else if (dependencies.express) {
                context.framework = 'express';
                context.projectType = 'backend-api';
            } else if (dependencies.fastify) {
                context.framework = 'fastify';
                context.projectType = 'backend-api';
            }

            // Detect project complexity indicators
            const totalDeps = Object.keys(dependencies).length;
            if (totalDeps > 50) {
                context.complexity = 'high';
            } else if (totalDeps > 20) {
                context.complexity = 'medium';
            } else {
                context.complexity = 'low';
            }

            // Detect common integrations
            context.integrations = this.detectIntegrations(dependencies);

        } catch (error) {
            // Package.json not found or invalid - use defaults
            context.hasPackageJson = false;
        }
    }

    /**
     * Detect common integrations from dependencies
     * @param {Object} dependencies - Project dependencies
     * @returns {Array} - Array of detected integrations
     */
    detectIntegrations(dependencies) {
        const integrations = [];

        // Payment integrations
        if (dependencies.stripe) integrations.push('stripe');
        if (dependencies.paypal) integrations.push('paypal');

        // Database integrations
        if (dependencies.prisma) integrations.push('prisma');
        if (dependencies.mongoose) integrations.push('mongodb');
        if (dependencies.pg) integrations.push('postgresql');

        // Authentication
        if (dependencies['next-auth']) integrations.push('next-auth');
        if (dependencies.passport) integrations.push('passport');
        if (dependencies.supabase) integrations.push('supabase');

        // UI frameworks
        if (dependencies['@mui/material']) integrations.push('material-ui');
        if (dependencies.tailwindcss) integrations.push('tailwind');
        if (dependencies.chakra) integrations.push('chakra-ui');

        // Testing
        if (dependencies.jest) integrations.push('jest');
        if (dependencies.vitest) integrations.push('vitest');
        if (dependencies.playwright) integrations.push('playwright');

        return integrations;
    }

    /**
     * Analyze existing documentation structure
     * @param {Object} context - Context object to populate
     */
    async analyzeDocumentation(context) {
        const docsPath = path.join(this.cwd, 'docs');

        try {
            const docsExists = await this.pathExists(docsPath);
            if (docsExists) {
                context.hasExistingDocs = true;

                // Check for specific documentation types
                const docFiles = await this.getDocumentationFiles(docsPath);
                context.documentationTypes = docFiles;

                // Analyze documentation maturity
                if (docFiles.length > 10) {
                    context.documentationMaturity = 'comprehensive';
                } else if (docFiles.length > 3) {
                    context.documentationMaturity = 'moderate';
                } else {
                    context.documentationMaturity = 'minimal';
                }
            }

            // Check for README files
            const readmeExists = await this.pathExists(path.join(this.cwd, 'README.md'));
            if (readmeExists) {
                const readme = await fs.readFile(path.join(this.cwd, 'README.md'), 'utf8');
                context.projectDescription = this.extractProjectDescription(readme);
            }

        } catch (error) {
            context.hasExistingDocs = false;
        }
    }

    /**
     * Get documentation files recursively
     * @param {string} docsPath - Documentation directory path
     * @returns {Promise<Array>} - Array of documentation files
     */
    async getDocumentationFiles(docsPath) {
        const files = [];

        try {
            const entries = await fs.readdir(docsPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(docsPath, entry.name);

                if (entry.isDirectory()) {
                    const subFiles = await this.getDocumentationFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.name.endsWith('.md')) {
                    files.push({
                        name: entry.name,
                        path: fullPath,
                        type: this.classifyDocumentationType(entry.name)
                    });
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't read
        }

        return files;
    }

    /**
     * Classify documentation type based on filename
     * @param {string} filename - Documentation filename
     * @returns {string} - Document type classification
     */
    classifyDocumentationType(filename) {
        const lower = filename.toLowerCase();

        if (lower.includes('api') || lower.includes('endpoint')) return 'api_documentation';
        if (lower.includes('technical') || lower.includes('architecture')) return 'technical_documentation';
        if (lower.includes('user') || lower.includes('guide')) return 'user_documentation';
        if (lower.includes('deployment') || lower.includes('deploy')) return 'deployment_documentation';
        if (lower.includes('test') || lower.includes('testing')) return 'testing_documentation';
        if (lower.includes('security')) return 'security_documentation';

        return 'general_documentation';
    }

    /**
     * Extract project description from README
     * @param {string} readme - README content
     * @returns {string} - Extracted description
     */
    extractProjectDescription(readme) {
        const lines = readme.split('\n');

        // Look for description after title
        for (let i = 0; i < lines.length && i < 10; i++) {
            const line = lines[i].trim();

            // Skip empty lines and markdown headers
            if (!line || line.startsWith('#') || line.startsWith('![')) {
                continue;
            }

            // Return first substantial line as description
            if (line.length > 20) {
                return line.replace(/[*_`]/g, '').trim();
            }
        }

        return 'No description available';
    }

    /**
     * Analyze existing PRDs
     * @param {Object} context - Context object to populate
     */
    async analyzeExistingPRDs(context) {
        const prdsPath = path.join(this.cwd, '.claude/prds');

        try {
            const prdsExists = await this.pathExists(prdsPath);
            if (prdsExists) {
                const prdFiles = await fs.readdir(prdsPath);
                context.existingFeatures = prdFiles
                    .filter(file => file.endsWith('.md'))
                    .map(file => file.replace('.md', ''));

                // Analyze PRD patterns for insights
                if (context.existingFeatures.length > 0) {
                    context.featurePatterns = this.analyzeFeaturePatterns(context.existingFeatures);
                }
            }
        } catch (error) {
            context.existingFeatures = [];
        }
    }

    /**
     * Analyze patterns in existing features
     * @param {Array} features - Array of existing features
     * @returns {Object} - Feature patterns analysis
     */
    analyzeFeaturePatterns(features) {
        const patterns = {
            authenticationExists: false,
            paymentExists: false,
            apiExists: false,
            userManagementExists: false,
            analyticsExists: false,
            commonThemes: []
        };

        // Check for common feature types
        features.forEach(feature => {
            const lower = feature.toLowerCase();

            if (lower.includes('auth') || lower.includes('login') || lower.includes('signup')) {
                patterns.authenticationExists = true;
            }
            if (lower.includes('payment') || lower.includes('billing') || lower.includes('subscription')) {
                patterns.paymentExists = true;
            }
            if (lower.includes('api') || lower.includes('integration')) {
                patterns.apiExists = true;
            }
            if (lower.includes('user') || lower.includes('profile') || lower.includes('account')) {
                patterns.userManagementExists = true;
            }
            if (lower.includes('analytics') || lower.includes('tracking') || lower.includes('metrics')) {
                patterns.analyticsExists = true;
            }
        });

        // Identify common themes
        const words = features.join(' ').toLowerCase().split(/[\s-_]+/);
        const wordCount = {};

        words.forEach(word => {
            if (word.length > 3) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });

        patterns.commonThemes = Object.entries(wordCount)
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);

        return patterns;
    }

    /**
     * Analyze technical decisions document
     * @param {Object} context - Context object to populate
     */
    async analyzeTechnicalDecisions(context) {
        const techDecisionsPath = path.join(this.cwd, 'docs/reference/technical-decisions.md');

        try {
            const exists = await this.pathExists(techDecisionsPath);
            if (exists) {
                const content = await fs.readFile(techDecisionsPath, 'utf8');

                // Extract key technical decisions
                context.technicalDecisions = {
                    hasArchitecture: content.includes('## Architecture') || content.includes('# Architecture'),
                    hasDatabase: content.includes('Database') || content.includes('DB') || content.includes('PostgreSQL') || content.includes('MongoDB'),
                    hasAuth: content.includes('Authentication') || content.includes('Auth') || content.includes('JWT'),
                    hasAPI: content.includes('API') || content.includes('REST') || content.includes('GraphQL'),
                    hasDeployment: content.includes('Deployment') || content.includes('Hosting') || content.includes('AWS') || content.includes('Vercel'),
                    scope: this.extractScope(content),
                    timeline: this.extractTimeline(content)
                };

                // Extract specific technology choices
                context.technologyChoices = this.extractTechnologyChoices(content);
            }
        } catch (error) {
            context.technicalDecisions = {};
        }
    }

    /**
     * Extract scope information from technical decisions
     * @param {string} content - Technical decisions content
     * @returns {string} - Scope classification
     */
    extractScope(content) {
        const lower = content.toLowerCase();

        if (lower.includes('mvp') || lower.includes('minimum viable')) {
            return 'mvp';
        } else if (lower.includes('enterprise') || lower.includes('complete') || lower.includes('full-featured')) {
            return 'complete';
        } else if (lower.includes('phase') || lower.includes('incremental')) {
            return 'phased';
        }

        return 'unknown';
    }

    /**
     * Extract timeline information
     * @param {string} content - Content to analyze
     * @returns {string} - Timeline estimate
     */
    extractTimeline(content) {
        const timelineMatches = content.match(/(\d+)[\s-]*(week|month|day)s?/gi);

        if (timelineMatches && timelineMatches.length > 0) {
            return timelineMatches[0];
        }

        return 'unknown';
    }

    /**
     * Extract technology choices from content
     * @param {string} content - Content to analyze
     * @returns {Object} - Technology choices
     */
    extractTechnologyChoices(content) {
        const choices = {};
        const lower = content.toLowerCase();

        // Frontend frameworks
        if (lower.includes('next.js') || lower.includes('nextjs')) choices.frontend = 'next.js';
        else if (lower.includes('react')) choices.frontend = 'react';
        else if (lower.includes('vue')) choices.frontend = 'vue';
        else if (lower.includes('angular')) choices.frontend = 'angular';

        // Backend/Database
        if (lower.includes('supabase')) choices.backend = 'supabase';
        else if (lower.includes('firebase')) choices.backend = 'firebase';
        else if (lower.includes('express')) choices.backend = 'express';
        else if (lower.includes('fastify')) choices.backend = 'fastify';

        if (lower.includes('postgresql') || lower.includes('postgres')) choices.database = 'postgresql';
        else if (lower.includes('mongodb') || lower.includes('mongo')) choices.database = 'mongodb';
        else if (lower.includes('mysql')) choices.database = 'mysql';

        // Hosting
        if (lower.includes('vercel')) choices.hosting = 'vercel';
        else if (lower.includes('netlify')) choices.hosting = 'netlify';
        else if (lower.includes('aws')) choices.hosting = 'aws';
        else if (lower.includes('railway')) choices.hosting = 'railway';

        return choices;
    }

    /**
     * Analyze competitive analysis document
     * @param {Object} context - Context object to populate
     */
    async analyzeCompetitiveAnalysis(context) {
        const competitivePath = path.join(this.cwd, 'docs/reference/competitive-analysis.md');

        try {
            const exists = await this.pathExists(competitivePath);
            if (exists) {
                const content = await fs.readFile(competitivePath, 'utf8');

                // Extract competitor insights
                context.competitiveInsights = this.extractCompetitors(content);
                context.hasCompetitiveAnalysis = true;
            }
        } catch (error) {
            context.competitiveInsights = [];
            context.hasCompetitiveAnalysis = false;
        }
    }

    /**
     * Extract competitor information from content
     * @param {string} content - Competitive analysis content
     * @returns {Array} - Array of competitor insights
     */
    extractCompetitors(content) {
        const competitors = [];
        const sections = content.split(/#{1,3}\s+/);

        sections.forEach(section => {
            // Look for sections that might be competitors
            const lines = section.split('\n');
            const title = lines[0]?.trim();

            if (title && title.length > 0 && !title.toLowerCase().includes('competitive') && !title.toLowerCase().includes('analysis')) {
                competitors.push({
                    name: title,
                    content: section.substring(0, 200) // First 200 chars as summary
                });
            }
        });

        return competitors.slice(0, 5); // Return top 5 competitors
    }

    /**
     * Analyze project structure for additional context
     * @param {Object} context - Context object to populate
     */
    async analyzeProjectStructure(context) {
        try {
            // Check for common directories
            const commonDirs = ['src', 'lib', 'components', 'pages', 'app', 'api', 'tests', '__tests__'];
            const existingDirs = [];

            for (const dir of commonDirs) {
                if (await this.pathExists(path.join(this.cwd, dir))) {
                    existingDirs.push(dir);
                }
            }

            context.projectStructure = existingDirs;

            // Estimate project maturity
            if (existingDirs.includes('tests') || existingDirs.includes('__tests__')) {
                context.hasTests = true;
            }

            if (existingDirs.length > 5) {
                context.structureComplexity = 'complex';
            } else if (existingDirs.length > 2) {
                context.structureComplexity = 'moderate';
            } else {
                context.structureComplexity = 'simple';
            }

        } catch (error) {
            context.projectStructure = [];
        }
    }

    /**
     * Check if path exists
     * @param {string} pathToCheck - Path to check
     * @returns {Promise<boolean>} - Whether path exists
     */
    async pathExists(pathToCheck) {
        try {
            await fs.access(pathToCheck);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get project context summary for question generation
     * @param {Object} fullContext - Full context object
     * @returns {Object} - Summarized context for questions
     */
    getContextSummary(fullContext) {
        return {
            framework: fullContext.framework,
            projectType: fullContext.projectType,
            projectName: fullContext.projectName,
            complexity: fullContext.complexity || 'medium',
            hasAuth: fullContext.featurePatterns?.authenticationExists || fullContext.technicalDecisions?.hasAuth,
            hasPayments: fullContext.featurePatterns?.paymentExists,
            hasAPI: fullContext.featurePatterns?.apiExists || fullContext.technicalDecisions?.hasAPI,
            maturity: this.calculateProjectMaturity(fullContext),
            integrations: fullContext.integrations || []
        };
    }

    /**
     * Calculate overall project maturity
     * @param {Object} context - Full context object
     * @returns {string} - Maturity level
     */
    calculateProjectMaturity(context) {
        let maturityScore = 0;

        // Documentation maturity
        if (context.documentationMaturity === 'comprehensive') maturityScore += 3;
        else if (context.documentationMaturity === 'moderate') maturityScore += 2;
        else if (context.documentationMaturity === 'minimal') maturityScore += 1;

        // Technical decisions completeness
        if (context.technicalDecisions?.hasArchitecture) maturityScore += 2;
        if (context.technicalDecisions?.hasDatabase) maturityScore += 1;

        // Existing features
        if ((context.existingFeatures?.length || 0) > 5) maturityScore += 2;
        else if ((context.existingFeatures?.length || 0) > 2) maturityScore += 1;

        // Project structure
        if (context.structureComplexity === 'complex') maturityScore += 2;
        else if (context.structureComplexity === 'moderate') maturityScore += 1;

        // Testing
        if (context.hasTests) maturityScore += 1;

        // Classify maturity
        if (maturityScore >= 8) return 'mature';
        else if (maturityScore >= 5) return 'developing';
        else if (maturityScore >= 2) return 'early';
        else return 'startup';
    }
}

module.exports = ContextAnalyzer;