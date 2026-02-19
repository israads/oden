/**
 * Solution template for missing dependency errors
 * Analyzes missing modules and installs appropriate packages
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs-extra');

const execAsync = promisify(exec);

async function installMissingDependency(context) {
    const solution = {
        steps: [],
        rollbackSteps: [],
        validation: null
    };

    try {
        // Extract module name from error
        const moduleName = extractModuleName(context.errorText);
        if (!moduleName) {
            return {
                success: false,
                message: 'Could not identify missing module from error message',
                steps: solution.steps
            };
        }

        console.log(`🔍 Analyzing missing module: ${moduleName}`);

        // Step 1: Check if it's a built-in Node.js module
        const builtInCheck = checkBuiltInModule(moduleName);
        if (builtInCheck.isBuiltIn) {
            return {
                success: false,
                message: `${moduleName} is a built-in Node.js module. ${builtInCheck.suggestion}`,
                steps: solution.steps
            };
        }

        // Step 2: Determine package manager
        const packageManager = await detectPackageManager(context);
        console.log(`📦 Using package manager: ${packageManager}`);

        // Step 3: Resolve actual package name
        const packageName = await resolvePackageName(moduleName, context);
        console.log(`📋 Resolved package name: ${packageName}`);

        // Step 4: Check if package exists
        const packageExists = await checkPackageExists(packageName);
        if (!packageExists.exists) {
            return {
                success: false,
                message: `Package '${packageName}' does not exist on npm. ${packageExists.suggestion}`,
                steps: solution.steps
            };
        }

        // Step 5: Install the package
        const installStep = {
            description: `Install ${packageName} using ${packageManager}`,
            command: generateInstallCommand(packageManager, packageName, context),
            packageName,
            packageManager,
            async execute() {
                console.log(`⬇️  Installing ${packageName}...`);
                const { stdout, stderr } = await execAsync(this.command, {
                    cwd: context.projectRoot || process.cwd(),
                    timeout: 120000 // 2 minute timeout
                });
                return { stdout, stderr };
            }
        };
        solution.steps.push(installStep);

        const installResult = await installStep.execute();
        console.log(`✅ Successfully installed ${packageName}`);

        // Step 6: Verify installation
        solution.validation = async () => {
            try {
                require.resolve(moduleName);
                return {
                    success: true,
                    message: `Module ${moduleName} is now available`
                };
            } catch (error) {
                return {
                    success: false,
                    message: `Module ${moduleName} still cannot be resolved`
                };
            }
        };

        // Rollback step
        solution.rollbackSteps.push({
            description: `Uninstall ${packageName}`,
            command: generateUninstallCommand(packageManager, packageName),
            async execute() {
                const { stdout } = await execAsync(this.command, {
                    cwd: context.projectRoot || process.cwd()
                });
                return stdout;
            }
        });

        return {
            success: true,
            message: `Successfully installed ${packageName}. The module ${moduleName} should now be available.`,
            steps: solution.steps,
            rollbackSteps: solution.rollbackSteps,
            validation: solution.validation,
            installedPackage: packageName
        };

    } catch (error) {
        return {
            success: false,
            message: `Failed to install missing dependency: ${error.message}`,
            steps: solution.steps,
            error: error.message
        };
    }
}

function extractModuleName(errorText) {
    // Common patterns for module not found errors
    const patterns = [
        /Cannot find module ['"]([^'"]+)['"]/,
        /Module not found.*['"]([^'"]+)['"]/,
        /Error: Cannot resolve module ['"]([^'"]+)['"]/,
        /MODULE_NOT_FOUND.*['"]([^'"]+)['"]/,
        /Cannot resolve dependency ['"]([^'"]+)['"]/
    ];

    for (const pattern of patterns) {
        const match = errorText.match(pattern);
        if (match && match[1]) {
            // Clean up module name (remove path parts)
            let moduleName = match[1];

            // Handle scoped packages
            if (moduleName.startsWith('@')) {
                const parts = moduleName.split('/');
                if (parts.length >= 2) {
                    return `${parts[0]}/${parts[1]}`;
                }
            }

            // Handle relative imports (not missing dependencies)
            if (moduleName.startsWith('.') || moduleName.startsWith('/')) {
                return null;
            }

            // Handle subpath imports (e.g., 'lodash/debounce' -> 'lodash')
            return moduleName.split('/')[0];
        }
    }

    return null;
}

function checkBuiltInModule(moduleName) {
    const builtInModules = [
        'fs', 'path', 'os', 'crypto', 'util', 'events', 'stream', 'buffer',
        'querystring', 'url', 'http', 'https', 'net', 'tls', 'cluster',
        'child_process', 'readline', 'repl', 'vm', 'zlib', 'assert'
    ];

    if (builtInModules.includes(moduleName)) {
        return {
            isBuiltIn: true,
            suggestion: 'This is a built-in Node.js module. Check your Node.js version and import syntax.'
        };
    }

    return { isBuiltIn: false };
}

async function detectPackageManager(context) {
    if (context.packageManager) {
        return context.packageManager;
    }

    try {
        // Check for lock files to determine package manager
        const yarnLockExists = await fs.pathExists('yarn.lock');
        const pnpmLockExists = await fs.pathExists('pnpm-lock.yaml');

        if (yarnLockExists) return 'yarn';
        if (pnpmLockExists) return 'pnpm';

        return 'npm'; // Default
    } catch (error) {
        return 'npm';
    }
}

async function resolvePackageName(moduleName, context) {
    // Common module name mappings
    const nameMap = {
        'react-scripts': 'react-scripts',
        'webpack-dev-server': 'webpack-dev-server',
        'babel-core': '@babel/core',
        'babel-preset-env': '@babel/preset-env',
        'babel-preset-react': '@babel/preset-react',
        'eslint-config-airbnb': 'eslint-config-airbnb-base'
    };

    // Check for common TypeScript types packages
    if (context.hasTypeScript && !moduleName.startsWith('@types/')) {
        const typesPackage = `@types/${moduleName}`;
        return typesPackage;
    }

    return nameMap[moduleName] || moduleName;
}

async function checkPackageExists(packageName) {
    try {
        const { stdout } = await execAsync(`npm view ${packageName} name`, { timeout: 10000 });
        return {
            exists: stdout.trim() === packageName,
            suggestion: ''
        };
    } catch (error) {
        // Suggest alternatives for common misspellings
        const suggestions = {
            'react-dom': 'react-dom',
            'react-router': 'react-router-dom',
            'material-ui': '@mui/material',
            'bootstrap': 'bootstrap',
            'jquery': 'jquery'
        };

        const suggestion = suggestions[packageName.toLowerCase()];
        return {
            exists: false,
            suggestion: suggestion ? `Did you mean '${suggestion}'?` : 'Check the package name spelling.'
        };
    }
}

function generateInstallCommand(packageManager, packageName, context) {
    const isDev = context.isDevelopment ||
                 packageName.includes('eslint') ||
                 packageName.includes('babel') ||
                 packageName.includes('webpack') ||
                 packageName.startsWith('@types/');

    switch (packageManager) {
        case 'yarn':
            return `yarn add ${isDev ? '--dev ' : ''}${packageName}`;
        case 'pnpm':
            return `pnpm add ${isDev ? '--save-dev ' : ''}${packageName}`;
        case 'npm':
        default:
            return `npm install ${isDev ? '--save-dev ' : '--save '}${packageName}`;
    }
}

function generateUninstallCommand(packageManager, packageName) {
    switch (packageManager) {
        case 'yarn':
            return `yarn remove ${packageName}`;
        case 'pnpm':
            return `pnpm remove ${packageName}`;
        case 'npm':
        default:
            return `npm uninstall ${packageName}`;
    }
}

module.exports = {
    name: 'install-missing-dependency',
    description: 'Analyze and install missing Node.js dependencies',
    execute: installMissingDependency,
    platforms: ['win32', 'darwin', 'linux'],
    requirements: ['Node.js', 'npm/yarn/pnpm', 'Internet connection'],
    riskLevel: 'low',
    category: 'dependencies'
};