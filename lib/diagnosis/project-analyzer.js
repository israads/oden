const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

/**
 * Project Analyzer - Analyzes project structure and environment context
 *
 * Detects project type, framework, build tools, dependencies, environment setup,
 * and other contextual information needed for intelligent bug diagnosis.
 */
class ProjectAnalyzer {
    constructor() {
        this.cwd = process.cwd();
    }

    /**
     * Analyze the current project for context information
     * @returns {Promise<Object>} - Comprehensive project context
     */
    async analyze() {
        const context = {
            cwd: this.cwd,
            framework: 'unknown',
            projectType: 'unknown',
            packageManager: 'npm',
            nodeVersion: process.version,
            os: process.platform,
            dependencies: {},
            devDependencies: {},
            scripts: {},
            configFiles: [],
            hasDockerfile: false,
            hasEnvFile: false,
            buildTool: 'none',
            complexity: 'small',
            recentLogs: []
        };

        try {
            // Analyze package.json
            await this.analyzePackageJson(context);

            // Detect framework and project type
            await this.detectFramework(context);

            // Detect package manager
            await this.detectPackageManager(context);

            // Analyze configuration files
            await this.analyzeConfigFiles(context);

            // Check for common files
            await this.checkCommonFiles(context);

            // Analyze project complexity
            await this.analyzeComplexity(context);

            // Check recent error logs
            await this.checkRecentLogs(context);

            return context;

        } catch (error) {
            console.error('Warning: Project analysis incomplete:', error.message);
            return context;
        }
    }

    /**
     * Analyze package.json for dependencies and scripts
     * @param {Object} context - Context object to populate
     */
    async analyzePackageJson(context) {
        try {
            const packageJsonPath = path.join(this.cwd, 'package.json');
            const content = await fs.readFile(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(content);

            context.projectName = packageJson.name;
            context.version = packageJson.version;
            context.dependencies = packageJson.dependencies || {};
            context.devDependencies = packageJson.devDependencies || {};
            context.scripts = packageJson.scripts || {};
            context.engines = packageJson.engines || {};

            // Check for specific package managers in package.json
            if (packageJson.packageManager) {
                context.packageManager = packageJson.packageManager.split('@')[0];
            }

        } catch (error) {
            // No package.json found or invalid JSON
            context.hasPackageJson = false;
        }
    }

    /**
     * Detect framework and project type from dependencies and file structure
     * @param {Object} context - Context object to populate
     */
    async detectFramework(context) {
        const deps = { ...context.dependencies, ...context.devDependencies };

        // React-based frameworks
        if (deps.next || deps['@next/core']) {
            context.framework = 'next.js';
            context.projectType = 'web-app';
        } else if (deps.react && deps['react-dom']) {
            context.framework = 'react';
            context.projectType = 'web-app';
        } else if (deps.react && deps['react-native']) {
            context.framework = 'react-native';
            context.projectType = 'mobile-app';
        } else if (deps['@expo/cli'] || deps.expo) {
            context.framework = 'expo';
            context.projectType = 'mobile-app';
        }

        // Vue.js
        else if (deps.vue || deps.nuxt) {
            context.framework = deps.nuxt ? 'nuxt' : 'vue';
            context.projectType = 'web-app';
        }

        // Angular
        else if (deps['@angular/core']) {
            context.framework = 'angular';
            context.projectType = 'web-app';
        }

        // Node.js backend frameworks
        else if (deps.express) {
            context.framework = 'express';
            context.projectType = 'backend-api';
        } else if (deps.fastify) {
            context.framework = 'fastify';
            context.projectType = 'backend-api';
        } else if (deps.koa) {
            context.framework = 'koa';
            context.projectType = 'backend-api';
        }

        // Static site generators
        else if (deps.gatsby) {
            context.framework = 'gatsby';
            context.projectType = 'static-site';
        } else if (deps.astro) {
            context.framework = 'astro';
            context.projectType = 'static-site';
        }

        // Other frameworks
        else if (deps.svelte || deps['@sveltejs/kit']) {
            context.framework = deps['@sveltejs/kit'] ? 'sveltekit' : 'svelte';
            context.projectType = 'web-app';
        }

        // Mobile frameworks
        else if (deps.flutter || await this.fileExists('pubspec.yaml')) {
            context.framework = 'flutter';
            context.projectType = 'mobile-app';
        }

        // Python frameworks
        else if (await this.fileExists('requirements.txt') || await this.fileExists('pyproject.toml')) {
            context.framework = 'python';
            context.projectType = 'backend-api';

            // Check for specific Python frameworks
            const reqContent = await this.readFileIfExists('requirements.txt');
            if (reqContent) {
                if (reqContent.includes('fastapi')) context.framework = 'fastapi';
                else if (reqContent.includes('django')) context.framework = 'django';
                else if (reqContent.includes('flask')) context.framework = 'flask';
            }
        }

        // If still unknown, check file structure
        if (context.framework === 'unknown') {
            await this.detectFrameworkFromFiles(context);
        }
    }

    /**
     * Detect framework from file structure when package.json analysis isn't conclusive
     * @param {Object} context - Context object to populate
     */
    async detectFrameworkFromFiles(context) {
        const indicators = [
            { files: ['next.config.js', 'next.config.ts'], framework: 'next.js', type: 'web-app' },
            { files: ['nuxt.config.js', 'nuxt.config.ts'], framework: 'nuxt', type: 'web-app' },
            { files: ['angular.json'], framework: 'angular', type: 'web-app' },
            { files: ['gatsby-config.js'], framework: 'gatsby', type: 'static-site' },
            { files: ['astro.config.js', 'astro.config.ts'], framework: 'astro', type: 'static-site' },
            { files: ['svelte.config.js'], framework: 'svelte', type: 'web-app' },
            { files: ['vite.config.js', 'vite.config.ts'], framework: 'vite', type: 'web-app' },
            { files: ['webpack.config.js'], framework: 'webpack', type: 'web-app' },
            { files: ['Dockerfile'], framework: 'docker', type: 'containerized' }
        ];

        for (const indicator of indicators) {
            for (const file of indicator.files) {
                if (await this.fileExists(file)) {
                    context.framework = indicator.framework;
                    context.projectType = indicator.type;
                    return;
                }
            }
        }
    }

    /**
     * Detect package manager from lock files
     * @param {Object} context - Context object to populate
     */
    async detectPackageManager(context) {
        if (await this.fileExists('yarn.lock')) {
            context.packageManager = 'yarn';
        } else if (await this.fileExists('pnpm-lock.yaml')) {
            context.packageManager = 'pnpm';
        } else if (await this.fileExists('bun.lockb')) {
            context.packageManager = 'bun';
        } else if (await this.fileExists('package-lock.json')) {
            context.packageManager = 'npm';
        }
    }

    /**
     * Analyze configuration files present in the project
     * @param {Object} context - Context object to populate
     */
    async analyzeConfigFiles(context) {
        const configFiles = [
            // Build tools
            'vite.config.js', 'vite.config.ts',
            'webpack.config.js', 'webpack.config.ts',
            'rollup.config.js', 'rollup.config.ts',
            'esbuild.config.js',

            // Framework configs
            'next.config.js', 'next.config.ts',
            'nuxt.config.js', 'nuxt.config.ts',
            'gatsby-config.js', 'gatsby-config.ts',
            'astro.config.js', 'astro.config.ts',

            // TypeScript
            'tsconfig.json', 'jsconfig.json',

            // Linting and formatting
            '.eslintrc.js', '.eslintrc.json', 'eslint.config.js',
            '.prettierrc', '.prettierrc.json',

            // Testing
            'jest.config.js', 'jest.config.ts',
            'vitest.config.js', 'vitest.config.ts',
            'playwright.config.js', 'playwright.config.ts',

            // Deployment
            'vercel.json', 'netlify.toml',
            'docker-compose.yml', 'Dockerfile',

            // Environment
            '.env', '.env.local', '.env.development', '.env.production'
        ];

        const existingConfigs = [];

        for (const file of configFiles) {
            if (await this.fileExists(file)) {
                existingConfigs.push(file);

                // Detect build tool
                if (file.startsWith('vite.config')) context.buildTool = 'vite';
                else if (file.startsWith('webpack.config')) context.buildTool = 'webpack';
                else if (file.startsWith('rollup.config')) context.buildTool = 'rollup';
            }
        }

        context.configFiles = existingConfigs;
    }

    /**
     * Check for common project files
     * @param {Object} context - Context object to populate
     */
    async checkCommonFiles(context) {
        // Docker
        context.hasDockerfile = await this.fileExists('Dockerfile');

        // Environment files
        context.hasEnvFile = await this.fileExists('.env') ||
                            await this.fileExists('.env.local') ||
                            await this.fileExists('.env.development');

        // TypeScript
        context.hasTypeScript = await this.fileExists('tsconfig.json') ||
                               Object.keys(context.dependencies).some(dep => dep.includes('typescript')) ||
                               Object.keys(context.devDependencies).some(dep => dep.includes('typescript'));

        // Testing frameworks
        context.testingFramework = 'none';
        if (context.dependencies.jest || context.devDependencies.jest) {
            context.testingFramework = 'jest';
        } else if (context.dependencies.vitest || context.devDependencies.vitest) {
            context.testingFramework = 'vitest';
        } else if (context.dependencies.playwright || context.devDependencies.playwright) {
            context.testingFramework = 'playwright';
        }

        // Git repository
        context.isGitRepo = await this.fileExists('.git');
    }

    /**
     * Analyze project complexity based on structure and dependencies
     * @param {Object} context - Context object to populate
     */
    async analyzeComplexity(context) {
        let complexityScore = 0;

        // Dependency count
        const totalDeps = Object.keys(context.dependencies).length + Object.keys(context.devDependencies).length;
        if (totalDeps > 50) complexityScore += 3;
        else if (totalDeps > 20) complexityScore += 2;
        else if (totalDeps > 10) complexityScore += 1;

        // Configuration files
        if (context.configFiles.length > 10) complexityScore += 2;
        else if (context.configFiles.length > 5) complexityScore += 1;

        // Multiple frameworks/tools
        if (context.hasTypeScript) complexityScore += 1;
        if (context.testingFramework !== 'none') complexityScore += 1;
        if (context.hasDockerfile) complexityScore += 1;

        // File structure (approximate)
        try {
            const srcExists = await this.fileExists('src');
            const libExists = await this.fileExists('lib');
            const componentsExists = await this.fileExists('components') || await this.fileExists('src/components');

            if (srcExists || libExists || componentsExists) complexityScore += 1;
        } catch (error) {
            // Ignore errors
        }

        // Determine complexity level
        if (complexityScore >= 6) context.complexity = 'large';
        else if (complexityScore >= 3) context.complexity = 'medium';
        else context.complexity = 'small';
    }

    /**
     * Check for recent error logs
     * @param {Object} context - Context object to populate
     */
    async checkRecentLogs(context) {
        const logFiles = [
            'npm-debug.log',
            'yarn-error.log',
            'pnpm-debug.log',
            '.next/trace'
        ];

        const recentLogs = [];

        for (const logFile of logFiles) {
            try {
                const stats = await fs.stat(path.join(this.cwd, logFile));
                const daysDiff = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

                if (daysDiff < 7) { // Recent logs from last week
                    const content = await fs.readFile(path.join(this.cwd, logFile), 'utf8');
                    recentLogs.push({
                        file: logFile,
                        modified: stats.mtime,
                        content: content.slice(-1000) // Last 1000 characters
                    });
                }
            } catch (error) {
                // Log file doesn't exist or can't read
                continue;
            }
        }

        context.recentLogs = recentLogs;
    }

    /**
     * Check if a file exists
     * @param {string} filePath - Path to check
     * @returns {Promise<boolean>} - Whether file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(path.join(this.cwd, filePath));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Read file content if it exists
     * @param {string} filePath - Path to read
     * @returns {Promise<string|null>} - File content or null
     */
    async readFileIfExists(filePath) {
        try {
            return await fs.readFile(path.join(this.cwd, filePath), 'utf8');
        } catch {
            return null;
        }
    }

    /**
     * Get environment information
     * @returns {Object} - Environment details
     */
    getEnvironmentInfo() {
        return {
            nodeVersion: process.version,
            npmVersion: process.env.npm_version || 'unknown',
            os: process.platform,
            architecture: process.arch,
            cwd: process.cwd(),
            env: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                CI: process.env.CI || false,
                PATH: process.env.PATH ? process.env.PATH.split(path.delimiter).slice(0, 5) : []
            }
        };
    }

    /**
     * Analyze port usage for port conflict detection
     * @returns {Promise<Array>} - Array of used ports
     */
    async analyzePortUsage() {
        try {
            // Common development ports to check
            const commonPorts = [3000, 3001, 8000, 8080, 5000, 5173, 4200, 4000, 9000];
            const usedPorts = [];

            for (const port of commonPorts) {
                const isUsed = await this.isPortInUse(port);
                if (isUsed) {
                    usedPorts.push(port);
                }
            }

            return usedPorts;
        } catch (error) {
            return [];
        }
    }

    /**
     * Check if a port is in use
     * @param {number} port - Port number to check
     * @returns {Promise<boolean>} - Whether port is in use
     */
    isPortInUse(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();

            server.listen(port, () => {
                server.once('close', () => resolve(false));
                server.close();
            });

            server.on('error', () => {
                resolve(true);
            });
        });
    }

    /**
     * Get Git repository information
     * @returns {Promise<Object>} - Git repository details
     */
    async getGitInfo() {
        if (!await this.fileExists('.git')) {
            return { isGitRepo: false };
        }

        try {
            const { exec } = require('util').promisify(require('child_process').exec);

            const [branch, status, remotes] = await Promise.all([
                exec('git branch --show-current').then(r => r.stdout.trim()).catch(() => 'unknown'),
                exec('git status --porcelain').then(r => r.stdout.trim()).catch(() => ''),
                exec('git remote -v').then(r => r.stdout.trim()).catch(() => '')
            ]);

            return {
                isGitRepo: true,
                branch,
                hasChanges: status.length > 0,
                changedFiles: status.split('\n').filter(l => l.trim()).length,
                remotes: remotes.split('\n').map(line => {
                    const [name, url] = line.split('\t');
                    return { name, url: url?.replace(/\s*\(.*\)/, '') };
                }).filter(r => r.name)
            };
        } catch (error) {
            return { isGitRepo: true, error: error.message };
        }
    }
}

module.exports = ProjectAnalyzer;