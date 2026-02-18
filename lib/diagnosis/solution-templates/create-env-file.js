/**
 * Solution template for missing .env file errors
 * Creates .env file from .env.example or provides template
 */

const fs = require('fs-extra');
const path = require('path');

async function createEnvFile(context) {
    const solution = {
        steps: [],
        rollbackSteps: [],
        validation: null
    };

    try {
        const projectRoot = context.projectRoot || process.cwd();
        const envPath = path.join(projectRoot, '.env');
        const envExamplePath = path.join(projectRoot, '.env.example');

        console.log('🔍 Analyzing environment file requirements...');

        // Step 1: Check if .env already exists
        const envExists = await fs.pathExists(envPath);
        if (envExists) {
            return {
                success: true,
                message: '.env file already exists',
                steps: solution.steps
            };
        }

        // Step 2: Check for .env.example
        const exampleExists = await fs.pathExists(envExamplePath);
        let envContent = '';

        const createEnvStep = {
            description: 'Create .env file',
            sourcePath: exampleExists ? envExamplePath : null,
            targetPath: envPath,
            async execute() {
                if (this.sourcePath) {
                    // Copy from .env.example
                    console.log('📋 Using .env.example as template');
                    const exampleContent = await fs.readFile(this.sourcePath, 'utf8');
                    envContent = processEnvExample(exampleContent, context);
                } else {
                    // Generate basic template
                    console.log('🎯 Generating basic .env template');
                    envContent = generateBasicEnvTemplate(context);
                }

                await fs.writeFile(this.targetPath, envContent, 'utf8');
                return `Created .env file with ${envContent.split('\n').length} variables`;
            }
        };
        solution.steps.push(createEnvStep);

        const result = await createEnvStep.execute();
        console.log(`✅ ${result}`);

        // Step 3: Create .gitignore entry if needed
        const gitignoreStep = {
            description: 'Update .gitignore to exclude .env',
            async execute() {
                const gitignorePath = path.join(projectRoot, '.gitignore');
                const gitignoreExists = await fs.pathExists(gitignorePath);

                if (gitignoreExists) {
                    const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
                    if (!gitignoreContent.includes('.env')) {
                        const updatedContent = gitignoreContent + '\n# Environment variables\n.env\n';
                        await fs.writeFile(gitignorePath, updatedContent, 'utf8');
                        return 'Added .env to .gitignore';
                    }
                    return '.env already in .gitignore';
                } else {
                    await fs.writeFile(gitignorePath, '.env\n', 'utf8');
                    return 'Created .gitignore with .env entry';
                }
            }
        };
        solution.steps.push(gitignoreStep);

        const gitignoreResult = await gitignoreStep.execute();
        console.log(`📝 ${gitignoreResult}`);

        // Validation
        solution.validation = async () => {
            const exists = await fs.pathExists(envPath);
            if (exists) {
                const content = await fs.readFile(envPath, 'utf8');
                const varCount = content.split('\n').filter(line =>
                    line.trim() && !line.trim().startsWith('#')
                ).length;
                return {
                    success: true,
                    message: `.env file exists with ${varCount} environment variables`
                };
            }
            return {
                success: false,
                message: '.env file was not created successfully'
            };
        };

        // Rollback
        solution.rollbackSteps.push({
            description: 'Remove created .env file',
            async execute() {
                if (await fs.pathExists(envPath)) {
                    await fs.remove(envPath);
                    return 'Removed .env file';
                }
                return '.env file does not exist';
            }
        });

        const variables = extractEnvironmentVariables(envContent);

        return {
            success: true,
            message: `Successfully created .env file with ${variables.length} environment variables`,
            steps: solution.steps,
            rollbackSteps: solution.rollbackSteps,
            validation: solution.validation,
            nextSteps: [
                'Review the .env file and update values as needed',
                'Ensure your application loads environment variables correctly',
                'Never commit the .env file to version control'
            ],
            environmentVariables: variables
        };

    } catch (error) {
        return {
            success: false,
            message: `Failed to create .env file: ${error.message}`,
            steps: solution.steps,
            error: error.message
        };
    }
}

function processEnvExample(exampleContent, context) {
    let processed = exampleContent;

    // Remove comments about filling in values
    processed = processed.replace(/# TODO: .*/gi, '');
    processed = processed.replace(/# REPLACE WITH .*/gi, '');

    // Provide some sensible defaults for common variables
    const defaults = {
        'NODE_ENV': 'development',
        'PORT': '3000',
        'DATABASE_URL': 'postgresql://localhost:5432/myapp_dev',
        'REDIS_URL': 'redis://localhost:6379',
        'JWT_SECRET': generateRandomString(32),
        'SESSION_SECRET': generateRandomString(32),
        'API_KEY': '# Replace with your API key',
        'NEXTAUTH_URL': 'http://localhost:3000',
        'NEXTAUTH_SECRET': generateRandomString(32)
    };

    // Apply defaults to empty or example values
    for (const [key, defaultValue] of Object.entries(defaults)) {
        const pattern = new RegExp(`^${key}=.*$`, 'gm');
        const match = processed.match(pattern);

        if (match) {
            const currentLine = match[0];
            const currentValue = currentLine.split('=')[1] || '';

            // Replace if empty, example, or placeholder
            if (!currentValue ||
                currentValue.includes('example') ||
                currentValue.includes('your-') ||
                currentValue.includes('replace') ||
                currentValue.includes('change')) {
                processed = processed.replace(pattern, `${key}=${defaultValue}`);
            }
        }
    }

    return processed;
}

function generateBasicEnvTemplate(context) {
    const template = [
        '# Environment Configuration',
        '# Copy this file to .env and update the values',
        '',
        '# Application Environment',
        'NODE_ENV=development',
        ''
    ];

    // Add common variables based on context
    if (context.hasReact || context.hasNext) {
        template.push('# Application Port');
        template.push('PORT=3000');
        template.push('');
    }

    if (context.hasDatabase) {
        template.push('# Database Configuration');
        template.push('DATABASE_URL=postgresql://localhost:5432/myapp_dev');
        template.push('');
    }

    if (context.hasAuth) {
        template.push('# Authentication');
        template.push(`JWT_SECRET=${generateRandomString(32)}`);
        template.push(`SESSION_SECRET=${generateRandomString(32)}`);
        template.push('');
    }

    if (context.hasNext) {
        template.push('# NextAuth Configuration');
        template.push('NEXTAUTH_URL=http://localhost:3000');
        template.push(`NEXTAUTH_SECRET=${generateRandomString(32)}`);
        template.push('');
    }

    template.push('# API Keys');
    template.push('# API_KEY=your_api_key_here');
    template.push('');

    template.push('# External Services');
    template.push('# REDIS_URL=redis://localhost:6379');
    template.push('# SMTP_HOST=smtp.example.com');
    template.push('# SMTP_PORT=587');
    template.push('# SMTP_USER=your_email@example.com');
    template.push('# SMTP_PASS=your_password');

    return template.join('\n');
}

function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}

function extractEnvironmentVariables(content) {
    const lines = content.split('\n');
    const variables = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, value] = trimmed.split('=', 2);
            variables.push({
                name: key,
                hasValue: value && value !== '# Replace with your API key',
                isSecret: key.toLowerCase().includes('secret') ||
                         key.toLowerCase().includes('password') ||
                         key.toLowerCase().includes('key')
            });
        }
    }

    return variables;
}

module.exports = {
    name: 'create-env-file',
    description: 'Create .env file from template or generate basic template',
    execute: createEnvFile,
    platforms: ['win32', 'darwin', 'linux'],
    requirements: ['File system access'],
    riskLevel: 'low',
    category: 'environment'
};