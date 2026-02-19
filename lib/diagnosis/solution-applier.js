const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

/**
 * Solution Applier - Applies fixes with backup and rollback capabilities
 *
 * Handles the application of solutions including file modifications,
 * command execution, configuration updates, and provides rollback functionality.
 */
class SolutionApplier {
    constructor() {
        this.backupDir = path.join(process.cwd(), '.oden-backup');
        this.lastBackup = null;
    }

    /**
     * Apply a solution with backup and rollback capabilities
     * @param {Object} solution - Solution configuration
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Application result
     */
    async apply(solution, context) {
        try {
            console.log('🔄 Creating backup...');
            await this.createBackup(solution.affectedFiles || []);

            console.log('🛠️ Applying solution steps...');
            const changes = [];

            for (let i = 0; i < solution.steps.length; i++) {
                const step = solution.steps[i];
                console.log(`   Step ${i + 1}/${solution.steps.length}: ${step.description}`);

                const result = await this.executeStep(step, context);

                if (!result.success) {
                    // Rollback on failure
                    console.log('❌ Step failed, rolling back...');
                    await this.rollback();
                    return {
                        success: false,
                        error: `Step ${i + 1} failed: ${result.error}`,
                        changes: []
                    };
                }

                changes.push(result);
            }

            return {
                success: true,
                changes,
                backupId: this.lastBackup
            };

        } catch (error) {
            console.log('❌ Unexpected error, rolling back...');
            await this.rollback();
            return {
                success: false,
                error: error.message,
                changes: []
            };
        }
    }

    /**
     * Execute a single solution step
     * @param {Object} step - Step configuration
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Step execution result
     */
    async executeStep(step, context) {
        try {
            switch (step.type) {
                case 'command':
                    return await this.executeCommand(step, context);

                case 'file_create':
                    return await this.createFile(step, context);

                case 'file_modify':
                    return await this.modifyFile(step, context);

                case 'file_delete':
                    return await this.deleteFile(step, context);

                case 'package_install':
                    return await this.installPackage(step, context);

                case 'env_update':
                    return await this.updateEnvironment(step, context);

                case 'config_update':
                    return await this.updateConfig(step, context);

                case 'permission_fix':
                    return await this.fixPermissions(step, context);

                default:
                    throw new Error(`Unknown step type: ${step.type}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute a command step
     * @param {Object} step - Command step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Execution result
     */
    async executeCommand(step, context) {
        try {
            // Replace variables in command
            const command = this.replaceVariables(step.command, context);

            const { stdout, stderr } = await exec(command, {
                cwd: process.cwd(),
                timeout: step.timeout || 30000,
                maxBuffer: 1024 * 1024 // 1MB buffer
            });

            return {
                success: true,
                type: 'command',
                command,
                output: stdout,
                error: stderr
            };

        } catch (error) {
            return {
                success: false,
                type: 'command',
                command: step.command,
                error: error.message
            };
        }
    }

    /**
     * Create a new file
     * @param {Object} step - File creation step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Creation result
     */
    async createFile(step, context) {
        try {
            const filePath = this.replaceVariables(step.path, context);
            const content = this.replaceVariables(step.content || '', context);

            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            // Create file
            await fs.writeFile(filePath, content);

            return {
                success: true,
                type: 'file_create',
                path: filePath,
                size: content.length
            };

        } catch (error) {
            return {
                success: false,
                type: 'file_create',
                error: error.message
            };
        }
    }

    /**
     * Modify an existing file
     * @param {Object} step - File modification step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Modification result
     */
    async modifyFile(step, context) {
        try {
            const filePath = this.replaceVariables(step.path, context);

            // Read current content
            const currentContent = await fs.readFile(filePath, 'utf8');

            let newContent = currentContent;

            // Apply modifications based on operation
            switch (step.operation) {
                case 'replace':
                    const searchPattern = new RegExp(step.search, step.flags || 'g');
                    newContent = currentContent.replace(searchPattern, step.replace);
                    break;

                case 'append':
                    newContent = currentContent + step.content;
                    break;

                case 'prepend':
                    newContent = step.content + currentContent;
                    break;

                case 'insert_at_line':
                    const lines = currentContent.split('\n');
                    lines.splice(step.line - 1, 0, step.content);
                    newContent = lines.join('\n');
                    break;

                default:
                    throw new Error(`Unknown file operation: ${step.operation}`);
            }

            // Write modified content
            await fs.writeFile(filePath, newContent);

            return {
                success: true,
                type: 'file_modify',
                path: filePath,
                operation: step.operation,
                changes: newContent.length - currentContent.length
            };

        } catch (error) {
            return {
                success: false,
                type: 'file_modify',
                error: error.message
            };
        }
    }

    /**
     * Delete a file
     * @param {Object} step - File deletion step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Deletion result
     */
    async deleteFile(step, context) {
        try {
            const filePath = this.replaceVariables(step.path, context);

            // Check if file exists
            await fs.access(filePath);

            // Delete file
            await fs.unlink(filePath);

            return {
                success: true,
                type: 'file_delete',
                path: filePath
            };

        } catch (error) {
            return {
                success: false,
                type: 'file_delete',
                error: error.message
            };
        }
    }

    /**
     * Install package using appropriate package manager
     * @param {Object} step - Package installation step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Installation result
     */
    async installPackage(step, context) {
        try {
            const packageManager = context.packageManager || 'npm';
            const packages = Array.isArray(step.packages) ? step.packages.join(' ') : step.packages;
            const devFlag = step.dev ? (packageManager === 'npm' ? '--save-dev' : '--dev') : '';

            const command = `${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} ${packages} ${devFlag}`.trim();

            const { stdout, stderr } = await exec(command, {
                cwd: process.cwd(),
                timeout: 120000, // 2 minutes for package installation
                maxBuffer: 2 * 1024 * 1024 // 2MB buffer
            });

            return {
                success: true,
                type: 'package_install',
                packages,
                packageManager,
                output: stdout
            };

        } catch (error) {
            return {
                success: false,
                type: 'package_install',
                error: error.message
            };
        }
    }

    /**
     * Update environment variables
     * @param {Object} step - Environment update step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Update result
     */
    async updateEnvironment(step, context) {
        try {
            const envFile = step.file || '.env';
            let content = '';

            // Read existing env file if it exists
            try {
                content = await fs.readFile(envFile, 'utf8');
            } catch (error) {
                // File doesn't exist, create new
                content = '';
            }

            // Add or update environment variables
            for (const [key, value] of Object.entries(step.variables)) {
                const envValue = this.replaceVariables(value, context);
                const pattern = new RegExp(`^${key}=.*$`, 'm');

                if (pattern.test(content)) {
                    // Update existing variable
                    content = content.replace(pattern, `${key}=${envValue}`);
                } else {
                    // Add new variable
                    content += content.endsWith('\n') || content === '' ? '' : '\n';
                    content += `${key}=${envValue}\n`;
                }
            }

            await fs.writeFile(envFile, content);

            return {
                success: true,
                type: 'env_update',
                file: envFile,
                variables: Object.keys(step.variables)
            };

        } catch (error) {
            return {
                success: false,
                type: 'env_update',
                error: error.message
            };
        }
    }

    /**
     * Update configuration file (JSON)
     * @param {Object} step - Config update step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Update result
     */
    async updateConfig(step, context) {
        try {
            const configFile = this.replaceVariables(step.file, context);

            // Read existing config
            const configContent = await fs.readFile(configFile, 'utf8');
            const config = JSON.parse(configContent);

            // Apply updates
            const updates = this.replaceVariables(step.updates, context);
            this.deepMerge(config, updates);

            // Write updated config
            await fs.writeFile(configFile, JSON.stringify(config, null, 2));

            return {
                success: true,
                type: 'config_update',
                file: configFile,
                updates: Object.keys(updates)
            };

        } catch (error) {
            return {
                success: false,
                type: 'config_update',
                error: error.message
            };
        }
    }

    /**
     * Fix file permissions
     * @param {Object} step - Permission fix step
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Fix result
     */
    async fixPermissions(step, context) {
        try {
            const targetPath = this.replaceVariables(step.path, context);
            const mode = step.mode || '755';

            const command = `chmod ${mode} "${targetPath}"`;

            await exec(command);

            return {
                success: true,
                type: 'permission_fix',
                path: targetPath,
                mode
            };

        } catch (error) {
            return {
                success: false,
                type: 'permission_fix',
                error: error.message
            };
        }
    }

    /**
     * Create backup of affected files
     * @param {Array} filePaths - Files to backup
     * @returns {Promise<string>} - Backup ID
     */
    async createBackup(filePaths = []) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupId = `backup_${timestamp}`;
        const backupPath = path.join(this.backupDir, backupId);

        await fs.mkdir(backupPath, { recursive: true });

        // Backup specific files
        for (const filePath of filePaths) {
            try {
                const fullPath = path.resolve(filePath);
                const relativePath = path.relative(process.cwd(), fullPath);
                const backupFile = path.join(backupPath, relativePath);

                // Ensure backup directory structure
                await fs.mkdir(path.dirname(backupFile), { recursive: true });

                // Copy file
                await fs.copyFile(fullPath, backupFile);
            } catch (error) {
                // Skip files that don't exist yet
                continue;
            }
        }

        // Create backup metadata
        const metadata = {
            id: backupId,
            timestamp,
            files: filePaths,
            cwd: process.cwd()
        };

        await fs.writeFile(
            path.join(backupPath, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        this.lastBackup = backupId;
        return backupId;
    }

    /**
     * Rollback to last backup
     * @param {string} backupId - Optional specific backup ID
     * @returns {Promise<Object>} - Rollback result
     */
    async rollback(backupId = null) {
        try {
            const targetBackupId = backupId || this.lastBackup;

            if (!targetBackupId) {
                return {
                    success: false,
                    error: 'No backup available for rollback'
                };
            }

            const backupPath = path.join(this.backupDir, targetBackupId);
            const metadataPath = path.join(backupPath, 'metadata.json');

            // Read backup metadata
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

            console.log(`🔄 Rolling back to backup: ${targetBackupId}`);

            // Restore each file
            const restoredFiles = [];
            for (const filePath of metadata.files) {
                try {
                    const backupFile = path.join(backupPath, filePath);
                    const targetFile = path.resolve(filePath);

                    // Check if backup file exists
                    await fs.access(backupFile);

                    // Restore file
                    await fs.copyFile(backupFile, targetFile);
                    restoredFiles.push(filePath);
                } catch (error) {
                    // File might not have existed in backup
                    console.log(`   Warning: Could not restore ${filePath}: ${error.message}`);
                }
            }

            console.log(`✅ Rollback complete: ${restoredFiles.length} files restored`);

            return {
                success: true,
                backupId: targetBackupId,
                restoredFiles
            };

        } catch (error) {
            return {
                success: false,
                error: `Rollback failed: ${error.message}`
            };
        }
    }

    /**
     * Replace variables in string templates
     * @param {string|Object} template - Template string or object
     * @param {Object} context - Variable context
     * @returns {string|Object} - Template with variables replaced
     */
    replaceVariables(template, context) {
        if (typeof template === 'object' && template !== null) {
            const result = {};
            for (const [key, value] of Object.entries(template)) {
                result[key] = this.replaceVariables(value, context);
            }
            return result;
        }

        if (typeof template !== 'string') {
            return template;
        }

        return template.replace(/\$\{(\w+)\}/g, (match, variable) => {
            return context[variable] !== undefined ? context[variable] : match;
        });
    }

    /**
     * Deep merge objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} - Merged object
     */
    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    /**
     * List available backups
     * @returns {Promise<Array>} - Array of backup metadata
     */
    async listBackups() {
        try {
            const backups = [];
            const entries = await fs.readdir(this.backupDir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory() && entry.name.startsWith('backup_')) {
                    try {
                        const metadataPath = path.join(this.backupDir, entry.name, 'metadata.json');
                        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
                        backups.push(metadata);
                    } catch (error) {
                        // Skip invalid backups
                        continue;
                    }
                }
            }

            return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            return [];
        }
    }

    /**
     * Clean old backups (keep last 10)
     * @returns {Promise<void>}
     */
    async cleanBackups() {
        try {
            const backups = await this.listBackups();

            if (backups.length > 10) {
                const toDelete = backups.slice(10);

                for (const backup of toDelete) {
                    const backupPath = path.join(this.backupDir, backup.id);
                    await fs.rm(backupPath, { recursive: true });
                }

                console.log(`🧹 Cleaned ${toDelete.length} old backups`);
            }
        } catch (error) {
            console.error('Warning: Could not clean old backups:', error.message);
        }
    }
}

module.exports = SolutionApplier;