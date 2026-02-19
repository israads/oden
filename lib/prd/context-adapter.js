const fs = require('fs').promises;
const path = require('path');

/**
 * Context Adapter - Adapts PRD questions based on project context
 *
 * Analyzes project structure, existing documentation, and technical decisions
 * to customize PRD questions for maximum relevance and value.
 */
class ContextAdapter {
    constructor() {
        this.cwd = process.cwd();
    }

    /**
     * Analyze project context for PRD question adaptation
     * @returns {Promise<Object>} - Project context for question generation
     */
    async analyzeProjectContext() {
        const context = {
            // Technical context
            framework: 'unknown',
            projectType: 'unknown',
            hasTypeScript: false,
            hasTests: false,
            buildTool: 'none',
            packageManager: 'npm',

            // Architecture context
            hasDatabase: false,
            hasAuth: false,
            hasAPI: false,
            hasPayments: false,
            integrations: [],

            // Documentation context
            hasCompetitiveAnalysis: false,
            hasTechnicalDecisions: false,
            hasExistingPRDs: false,
            existingFeatures: [],

            // Business context
            businessModel: 'unknown',
            targetUsers: 'unknown',
            maturityLevel: 'startup',
            complexity: 'medium'
        };

        try {
            // Analyze technical stack
            await this.analyzeTechnicalStack(context);

            // Analyze project structure
            await this.analyzeProjectStructure(context);

            // Analyze existing documentation
            await this.analyzeExistingDocumentation(context);

            // Analyze business context
            await this.analyzeBusinessContext(context);

            // Determine maturity and complexity
            this.assessProjectMaturity(context);

            return context;

        } catch (error) {
            console.warn('Context analysis incomplete:', error.message);
            return context;
        }
    }

    /**
     * Analyze technical stack from package.json and config files
     * @param {Object} context - Context object to populate
     */
    async analyzeTechnicalStack(context) {
        try {
            // Read package.json
            const packageJsonPath = path.join(this.cwd, 'package.json');
            const packageContent = await fs.readFile(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageContent);

            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            // Detect framework
            context.framework = this.detectFramework(dependencies);
            context.projectType = this.detectProjectType(context.framework, dependencies);

            // Detect TypeScript
            context.hasTypeScript = 'typescript' in dependencies ||
                                   await this.fileExists('tsconfig.json');

            // Detect testing framework
            context.hasTests = 'jest' in dependencies ||
                              'vitest' in dependencies ||
                              'playwright' in dependencies ||
                              await this.fileExists('__tests__') ||
                              await this.fileExists('tests');

            // Detect build tool
            context.buildTool = this.detectBuildTool(dependencies);

            // Detect package manager
            context.packageManager = await this.detectPackageManager();

            // Detect common integrations
            context.integrations = this.detectIntegrations(dependencies);

            // Detect architecture patterns
            context.hasDatabase = this.hasDatabase(dependencies);
            context.hasAuth = this.hasAuth(dependencies);
            context.hasAPI = this.hasAPI(dependencies, context.framework);
            context.hasPayments = this.hasPayments(dependencies);

        } catch (error) {
            // Package.json not found or invalid - use defaults
        }
    }

    /**
     * Detect framework from dependencies
     * @param {Object} dependencies - Package dependencies
     * @returns {string} - Detected framework
     */
    detectFramework(dependencies) {
        if (dependencies.next || dependencies['@next/core']) return 'next.js';
        if (dependencies.nuxt) return 'nuxt';
        if (dependencies['@angular/core']) return 'angular';
        if (dependencies.vue) return 'vue';
        if (dependencies.svelte) return 'svelte';
        if (dependencies.gatsby) return 'gatsby';
        if (dependencies.react && dependencies['react-native']) return 'react-native';
        if (dependencies.expo) return 'expo';
        if (dependencies.react) return 'react';
        if (dependencies.express) return 'express';
        if (dependencies.fastify) return 'fastify';
        if (dependencies.koa) return 'koa';

        return 'unknown';
    }

    /**
     * Detect project type from framework and dependencies
     * @param {string} framework - Detected framework
     * @param {Object} dependencies - Package dependencies
     * @returns {string} - Project type
     */
    detectProjectType(framework, dependencies) {
        if (framework === 'react-native' || framework === 'expo') return 'mobile-app';
        if (framework === 'express' || framework === 'fastify' || framework === 'koa') return 'backend-api';
        if (framework === 'gatsby') return 'static-site';

        // Check for specific patterns
        if (dependencies['@shopify/cli'] || dependencies['@shopify/app']) return 'shopify-app';
        if (dependencies.electron) return 'desktop-app';

        return 'web-app';
    }

    /**
     * Detect build tool
     * @param {Object} dependencies - Package dependencies
     * @returns {string} - Build tool
     */
    detectBuildTool(dependencies) {
        if (dependencies.vite || dependencies['@vitejs/plugin-react']) return 'vite';
        if (dependencies.webpack || dependencies['webpack-cli']) return 'webpack';
        if (dependencies.rollup) return 'rollup';
        if (dependencies.esbuild) return 'esbuild';
        if (dependencies.parcel) return 'parcel';

        return 'none';
    }

    /**
     * Detect package manager from lock files
     * @returns {Promise<string>} - Package manager
     */
    async detectPackageManager() {
        if (await this.fileExists('yarn.lock')) return 'yarn';
        if (await this.fileExists('pnpm-lock.yaml')) return 'pnpm';
        if (await this.fileExists('bun.lockb')) return 'bun';
        return 'npm';
    }

    /**
     * Detect common integrations
     * @param {Object} dependencies - Package dependencies
     * @returns {Array} - Array of detected integrations
     */
    detectIntegrations(dependencies) {
        const integrations = [];

        // Authentication
        if (dependencies['next-auth'] || dependencies.passport) integrations.push('authentication');
        if (dependencies.auth0) integrations.push('auth0');
        if (dependencies.supabase) integrations.push('supabase');

        // Database
        if (dependencies.prisma) integrations.push('prisma');
        if (dependencies.mongoose) integrations.push('mongodb');
        if (dependencies.pg || dependencies['postgres']) integrations.push('postgresql');

        // Payment
        if (dependencies.stripe) integrations.push('stripe');
        if (dependencies.paypal) integrations.push('paypal');

        // Analytics
        if (dependencies['@analytics/core'] || dependencies['google-analytics']) integrations.push('analytics');
        if (dependencies.mixpanel) integrations.push('mixpanel');

        // UI/CSS
        if (dependencies['@mui/material']) integrations.push('material-ui');
        if (dependencies.tailwindcss) integrations.push('tailwind');
        if (dependencies['@chakra-ui/react']) integrations.push('chakra-ui');

        // Testing
        if (dependencies.jest) integrations.push('jest');
        if (dependencies.cypress) integrations.push('cypress');
        if (dependencies.playwright) integrations.push('playwright');

        return integrations;
    }

    /**
     * Check if project has database integration
     * @param {Object} dependencies - Package dependencies
     * @returns {boolean} - Has database
     */
    hasDatabase(dependencies) {
        return !!(dependencies.prisma ||
                  dependencies.mongoose ||
                  dependencies.pg ||
                  dependencies.mysql2 ||
                  dependencies.sqlite3 ||
                  dependencies.supabase);
    }

    /**
     * Check if project has authentication
     * @param {Object} dependencies - Package dependencies
     * @returns {boolean} - Has authentication
     */
    hasAuth(dependencies) {
        return !!(dependencies['next-auth'] ||
                  dependencies.passport ||
                  dependencies.auth0 ||
                  dependencies.supabase ||
                  dependencies.firebase);
    }

    /**
     * Check if project has API capabilities
     * @param {Object} dependencies - Package dependencies
     * @param {string} framework - Project framework
     * @returns {boolean} - Has API
     */
    hasAPI(dependencies, framework) {
        return framework === 'express' ||
               framework === 'fastify' ||
               framework === 'koa' ||
               framework === 'next.js' || // API routes
               !!(dependencies.apollo || dependencies['@apollo/server']);
    }

    /**
     * Check if project has payment processing
     * @param {Object} dependencies - Package dependencies
     * @returns {boolean} - Has payments
     */
    hasPayments(dependencies) {
        return !!(dependencies.stripe ||
                  dependencies.paypal ||
                  dependencies['@stripe/stripe-js']);
    }

    /**
     * Analyze project structure
     * @param {Object} context - Context object to populate
     */
    async analyzeProjectStructure(context) {
        try {
            // Check common directory structures
            const directories = ['src', 'lib', 'components', 'pages', 'app', 'api', 'styles', 'public'];
            const existingDirs = [];

            for (const dir of directories) {
                if (await this.fileExists(dir)) {
                    existingDirs.push(dir);
                }
            }

            context.projectStructure = existingDirs;

            // Analyze structure complexity
            if (existingDirs.length > 6) {
                context.structuralComplexity = 'high';
            } else if (existingDirs.length > 3) {
                context.structuralComplexity = 'medium';
            } else {
                context.structuralComplexity = 'low';
            }

        } catch (error) {
            context.structuralComplexity = 'low';
        }
    }

    /**
     * Analyze existing documentation
     * @param {Object} context - Context object to populate
     */
    async analyzeExistingDocumentation(context) {
        try {
            // Check for technical decisions
            const techDecisionsPath = 'docs/reference/technical-decisions.md';
            if (await this.fileExists(techDecisionsPath)) {
                context.hasTechnicalDecisions = true;

                const content = await fs.readFile(techDecisionsPath, 'utf8');
                context.technicalDecisionsContent = content.substring(0, 1000); // First 1000 chars
            }

            // Check for competitive analysis
            const competitiveAnalysisPath = 'docs/reference/competitive-analysis.md';
            if (await this.fileExists(competitiveAnalysisPath)) {
                context.hasCompetitiveAnalysis = true;
            }

            // Check for existing PRDs
            const prdsPath = '.claude/prds';
            if (await this.fileExists(prdsPath)) {
                try {
                    const prdFiles = await fs.readdir(prdsPath);
                    context.existingFeatures = prdFiles
                        .filter(file => file.endsWith('.md'))
                        .map(file => file.replace('.md', ''));
                    context.hasExistingPRDs = context.existingFeatures.length > 0;
                } catch (error) {
                    // Directory exists but can't read
                }
            }

            // Check documentation maturity
            const docsPath = 'docs';
            if (await this.fileExists(docsPath)) {
                try {
                    const docFiles = await this.countMarkdownFiles(docsPath);
                    if (docFiles > 10) {
                        context.documentationMaturity = 'comprehensive';
                    } else if (docFiles > 3) {
                        context.documentationMaturity = 'moderate';
                    } else {
                        context.documentationMaturity = 'minimal';
                    }
                } catch (error) {
                    context.documentationMaturity = 'minimal';
                }
            }

        } catch (error) {
            // Documentation analysis failed
        }
    }

    /**
     * Count markdown files recursively
     * @param {string} dirPath - Directory path
     * @returns {Promise<number>} - Count of markdown files
     */
    async countMarkdownFiles(dirPath) {
        let count = 0;

        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    count += await this.countMarkdownFiles(fullPath);
                } else if (entry.name.endsWith('.md')) {
                    count++;
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't read
        }

        return count;
    }

    /**
     * Analyze business context from various sources
     * @param {Object} context - Context object to populate
     */
    async analyzeBusinessContext(context) {
        try {
            // Try to extract business context from README
            const readmePath = 'README.md';
            if (await this.fileExists(readmePath)) {
                const content = await fs.readFile(readmePath, 'utf8');
                context.businessModel = this.extractBusinessModel(content);
                context.targetUsers = this.extractTargetUsers(content);
            }

            // Try to extract from technical decisions
            if (context.technicalDecisionsContent) {
                const businessInfo = this.extractBusinessInfo(context.technicalDecisionsContent);
                if (businessInfo.businessModel !== 'unknown') {
                    context.businessModel = businessInfo.businessModel;
                }
                if (businessInfo.targetUsers !== 'unknown') {
                    context.targetUsers = businessInfo.targetUsers;
                }
            }

            // Infer from integrations and features
            if (context.hasPayments) {
                context.businessModel = context.businessModel === 'unknown' ? 'b2c-commerce' : context.businessModel;
            }

            if (context.integrations.includes('auth0') || context.hasExistingPRDs) {
                context.businessModel = context.businessModel === 'unknown' ? 'b2b-saas' : context.businessModel;
            }

        } catch (error) {
            // Business context analysis failed - use defaults
        }
    }

    /**
     * Extract business model from content
     * @param {string} content - Content to analyze
     * @returns {string} - Business model
     */
    extractBusinessModel(content) {
        const lower = content.toLowerCase();

        if (lower.includes('b2b') || lower.includes('business to business') ||
            lower.includes('enterprise') || lower.includes('saas')) {
            return 'b2b-saas';
        }

        if (lower.includes('marketplace') || lower.includes('platform')) {
            return 'marketplace';
        }

        if (lower.includes('ecommerce') || lower.includes('e-commerce') ||
            lower.includes('shop') || lower.includes('store')) {
            return 'b2c-commerce';
        }

        if (lower.includes('subscription') || lower.includes('recurring')) {
            return 'subscription';
        }

        if (lower.includes('consumer') || lower.includes('b2c')) {
            return 'b2c-app';
        }

        return 'unknown';
    }

    /**
     * Extract target users from content
     * @param {string} content - Content to analyze
     * @returns {string} - Target users
     */
    extractTargetUsers(content) {
        const lower = content.toLowerCase();

        if (lower.includes('developer') || lower.includes('api')) {
            return 'developers';
        }

        if (lower.includes('business') || lower.includes('enterprise') || lower.includes('admin')) {
            return 'business-users';
        }

        if (lower.includes('consumer') || lower.includes('customer') || lower.includes('user')) {
            return 'consumers';
        }

        if (lower.includes('creator') || lower.includes('content')) {
            return 'creators';
        }

        return 'unknown';
    }

    /**
     * Extract business information from technical decisions
     * @param {string} content - Technical decisions content
     * @returns {Object} - Business information
     */
    extractBusinessInfo(content) {
        return {
            businessModel: this.extractBusinessModel(content),
            targetUsers: this.extractTargetUsers(content)
        };
    }

    /**
     * Assess overall project maturity level
     * @param {Object} context - Context object to populate
     */
    assessProjectMaturity(context) {
        let maturityScore = 0;

        // Documentation maturity
        if (context.documentationMaturity === 'comprehensive') maturityScore += 3;
        else if (context.documentationMaturity === 'moderate') maturityScore += 2;
        else if (context.documentationMaturity === 'minimal') maturityScore += 1;

        // Technical setup maturity
        if (context.hasTypeScript) maturityScore += 1;
        if (context.hasTests) maturityScore += 1;
        if (context.buildTool !== 'none') maturityScore += 1;

        // Architecture maturity
        if (context.hasDatabase) maturityScore += 1;
        if (context.hasAuth) maturityScore += 1;
        if (context.hasAPI) maturityScore += 1;

        // Integration maturity
        if (context.integrations.length > 3) maturityScore += 2;
        else if (context.integrations.length > 0) maturityScore += 1;

        // Business maturity
        if (context.hasExistingPRDs) maturityScore += 2;
        if (context.hasCompetitiveAnalysis) maturityScore += 1;
        if (context.hasTechnicalDecisions) maturityScore += 2;

        // Classify maturity
        if (maturityScore >= 10) context.maturityLevel = 'mature';
        else if (maturityScore >= 6) context.maturityLevel = 'growing';
        else if (maturityScore >= 3) context.maturityLevel = 'early';
        else context.maturityLevel = 'startup';

        // Assess complexity
        let complexityScore = 0;

        if (context.integrations.length > 5) complexityScore += 3;
        else if (context.integrations.length > 2) complexityScore += 2;
        else if (context.integrations.length > 0) complexityScore += 1;

        if (context.structuralComplexity === 'high') complexityScore += 2;
        else if (context.structuralComplexity === 'medium') complexityScore += 1;

        if (context.hasDatabase && context.hasAuth && context.hasAPI) complexityScore += 2;
        if (context.hasPayments) complexityScore += 1;

        if (complexityScore >= 6) context.complexity = 'high';
        else if (complexityScore >= 3) context.complexity = 'medium';
        else context.complexity = 'low';
    }

    /**
     * Check if file or directory exists
     * @param {string} pathToCheck - Path to check
     * @returns {Promise<boolean>} - Whether path exists
     */
    async fileExists(pathToCheck) {
        try {
            await fs.access(path.join(this.cwd, pathToCheck));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get context summary optimized for question generation
     * @param {Object} fullContext - Full context object
     * @returns {Object} - Context summary
     */
    getContextSummary(fullContext) {
        return {
            // Core technical context
            framework: fullContext.framework,
            projectType: fullContext.projectType,
            complexity: fullContext.complexity,

            // Feature availability
            hasAuth: fullContext.hasAuth,
            hasPayments: fullContext.hasPayments,
            hasDatabase: fullContext.hasDatabase,
            hasAPI: fullContext.hasAPI,

            // Business context
            businessModel: fullContext.businessModel,
            targetUsers: fullContext.targetUsers,
            maturityLevel: fullContext.maturityLevel,

            // Documentation context
            hasCompetitiveAnalysis: fullContext.hasCompetitiveAnalysis,
            hasTechnicalDecisions: fullContext.hasTechnicalDecisions,
            existingFeatureCount: fullContext.existingFeatures.length,

            // Integration context
            integrations: fullContext.integrations,
            integrationCount: fullContext.integrations.length
        };
    }
}

module.exports = ContextAdapter;