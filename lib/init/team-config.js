const fs = require('fs-extra');
const path = require('path');

class TeamConfig {
    constructor() {
        this.teamConfigFile = '.oden-config.json';
        this.personalConfigFile = '.oden-config.personal.json';
    }

    /**
     * Generate team configuration questions
     */
    generateTeamQuestions() {
        return [
            {
                key: 'is_team_project',
                question: 'Is this a team project?',
                type: 'boolean',
                default: false,
                help: 'Team projects share configuration via Git and handle conflicts gracefully'
            },
            {
                key: 'team_name',
                question: 'What is your team name?',
                type: 'string',
                condition: (responses) => responses.is_team_project,
                validation: (value) => value.length >= 2,
                help: 'Used for identifying team members and shared configurations'
            },
            {
                key: 'conflict_resolution',
                question: 'How should configuration conflicts be resolved?',
                type: 'choice',
                condition: (responses) => responses.is_team_project,
                options: [
                    {
                        value: 'prompt',
                        label: 'Prompt me to choose (recommended)',
                        description: 'Show both versions and let me decide'
                    },
                    {
                        value: 'team_wins',
                        label: 'Team config always wins',
                        description: 'Automatically use team settings'
                    },
                    {
                        value: 'personal_wins',
                        label: 'My settings always win',
                        description: 'Keep my personal preferences'
                    },
                    {
                        value: 'merge',
                        label: 'Intelligent merge',
                        description: 'Merge non-conflicting settings automatically'
                    }
                ],
                default: 'prompt'
            },
            {
                key: 'shared_features',
                question: 'Which features should be shared across the team?',
                type: 'multi-choice',
                condition: (responses) => responses.is_team_project,
                options: [
                    {
                        value: 'bug_diagnosis',
                        label: 'Bug diagnosis preferences',
                        description: 'Consistent auto-fix and notification settings'
                    },
                    {
                        value: 'pipeline',
                        label: 'Quality pipeline configuration',
                        description: 'Same agents and stages for everyone'
                    },
                    {
                        value: 'export',
                        label: 'Export branding and formats',
                        description: 'Consistent documentation appearance'
                    },
                    {
                        value: 'dashboard',
                        label: 'Dashboard settings',
                        description: 'Same port and monitoring preferences'
                    }
                ],
                default: ['pipeline', 'export'],
                help: 'Non-shared features remain personal preferences'
            },
            {
                key: 'member_roles',
                question: 'Define team member roles (optional)?',
                type: 'boolean',
                condition: (responses) => responses.is_team_project,
                default: false,
                help: 'Roles can customize which features are available to different team members'
            }
        ];
    }

    /**
     * Apply team configuration settings
     */
    applyTeamConfiguration(responses, baseConfig) {
        if (!responses.is_team_project) {
            return {
                ...baseConfig,
                team: {
                    enabled: false,
                    shared_config: false
                }
            };
        }

        const teamConfig = {
            ...baseConfig,
            team: {
                enabled: true,
                name: responses.team_name,
                shared_config: true,
                conflict_resolution: responses.conflict_resolution || 'prompt',
                shared_features: responses.shared_features || ['pipeline', 'export'],
                member_roles: responses.member_roles || false,
                created_by: process.env.USER || process.env.USERNAME || 'unknown',
                created_at: new Date().toISOString()
            }
        };

        return teamConfig;
    }

    /**
     * Check for existing team configuration
     */
    async checkExistingTeamConfig() {
        try {
            const teamConfigExists = await fs.pathExists(this.teamConfigFile);
            const personalConfigExists = await fs.pathExists(this.personalConfigFile);

            let existingTeamConfig = null;
            let existingPersonalConfig = null;

            if (teamConfigExists) {
                existingTeamConfig = await fs.readJson(this.teamConfigFile);
            }

            if (personalConfigExists) {
                existingPersonalConfig = await fs.readJson(this.personalConfigFile);
            }

            return {
                hasTeamConfig: teamConfigExists,
                hasPersonalConfig: personalConfigExists,
                teamConfig: existingTeamConfig,
                personalConfig: existingPersonalConfig
            };
        } catch (error) {
            console.warn('Error reading existing configurations:', error.message);
            return {
                hasTeamConfig: false,
                hasPersonalConfig: false,
                teamConfig: null,
                personalConfig: null
            };
        }
    }

    /**
     * Handle configuration conflicts
     */
    async resolveConfigConflict(teamConfig, personalConfig, conflictResolution) {
        switch (conflictResolution) {
            case 'team_wins':
                return teamConfig;

            case 'personal_wins':
                return { ...teamConfig, ...personalConfig };

            case 'merge':
                return this.intelligentMerge(teamConfig, personalConfig);

            case 'prompt':
            default:
                return await this.promptForResolution(teamConfig, personalConfig);
        }
    }

    /**
     * Intelligent merge of team and personal configurations
     */
    intelligentMerge(teamConfig, personalConfig) {
        const merged = { ...teamConfig };

        // Personal preferences that don't conflict with team settings
        const personalPreferences = [
            'dashboard.auto_start',
            'dashboard.show_notifications',
            'brainstorming.session_timeout',
            'bug_diagnosis.notification_level'
        ];

        for (const pref of personalPreferences) {
            const personalValue = this.getNestedProperty(personalConfig, pref);
            if (personalValue !== undefined) {
                this.setNestedProperty(merged, pref, personalValue);
            }
        }

        return merged;
    }

    /**
     * Prompt user for conflict resolution (simplified for this implementation)
     */
    async promptForResolution(teamConfig, personalConfig) {
        // In a real implementation, this would show a UI for conflict resolution
        // For now, return the team config with a note
        console.log('Configuration conflict detected. Using team configuration.');
        console.log('You can customize personal preferences in .oden-config.personal.json');

        return teamConfig;
    }

    /**
     * Generate team configuration file structure
     */
    generateTeamConfigStructure(config, isTeamProject) {
        if (!isTeamProject) {
            return config;
        }

        // Separate shared and personal configurations
        const sharedFeatures = config.team?.shared_features || [];
        const teamConfig = {
            project: config.project,
            team: config.team,
            features: {}
        };

        const personalConfig = {
            features: {}
        };

        // Distribute features between team and personal configs
        Object.entries(config.features || {}).forEach(([featureKey, featureConfig]) => {
            if (sharedFeatures.includes(featureKey)) {
                teamConfig.features[featureKey] = featureConfig;
            } else {
                personalConfig.features[featureKey] = featureConfig;
            }
        });

        return {
            teamConfig,
            personalConfig,
            shouldCreatePersonalConfig: Object.keys(personalConfig.features).length > 0
        };
    }

    /**
     * Save configuration files
     */
    async saveConfigurations(config, isTeamProject) {
        try {
            if (isTeamProject) {
                const { teamConfig, personalConfig, shouldCreatePersonalConfig } =
                    this.generateTeamConfigStructure(config, true);

                // Save team configuration (Git-committed)
                await fs.writeJson(this.teamConfigFile, teamConfig, { spaces: 2 });
                console.log(`✅ Team configuration saved: ${this.teamConfigFile}`);

                // Save personal configuration (Git-ignored)
                if (shouldCreatePersonalConfig) {
                    await fs.writeJson(this.personalConfigFile, personalConfig, { spaces: 2 });
                    console.log(`✅ Personal configuration saved: ${this.personalConfigFile}`);
                }

                // Create or update .gitignore
                await this.updateGitignore();

            } else {
                // Single configuration file for individual projects
                await fs.writeJson(this.teamConfigFile, config, { spaces: 2 });
                console.log(`✅ Project configuration saved: ${this.teamConfigFile}`);
            }

        } catch (error) {
            console.error('Failed to save configuration files:', error.message);
            throw error;
        }
    }

    /**
     * Update .gitignore to exclude personal configuration
     */
    async updateGitignore() {
        try {
            const gitignorePath = '.gitignore';
            const personalConfigLine = '.oden-config.personal.json';

            let gitignoreContent = '';
            if (await fs.pathExists(gitignorePath)) {
                gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
            }

            // Check if personal config is already ignored
            if (!gitignoreContent.includes(personalConfigLine)) {
                gitignoreContent += gitignoreContent.endsWith('\n') ? '' : '\n';
                gitignoreContent += `\n# Oden personal configuration\n${personalConfigLine}\n`;

                await fs.writeFile(gitignorePath, gitignoreContent);
                console.log('✅ Updated .gitignore to exclude personal configuration');
            }

        } catch (error) {
            console.warn('Could not update .gitignore:', error.message);
        }
    }

    /**
     * Load merged configuration for runtime use
     */
    async loadRuntimeConfiguration() {
        try {
            const existing = await this.checkExistingTeamConfig();

            if (!existing.hasTeamConfig) {
                throw new Error('No Oden configuration found. Run /oden:init first.');
            }

            let runtimeConfig = existing.teamConfig;

            // Merge personal configuration if it exists
            if (existing.hasPersonalConfig && existing.personalConfig) {
                runtimeConfig = this.intelligentMerge(runtimeConfig, existing.personalConfig);
            }

            return runtimeConfig;

        } catch (error) {
            console.error('Failed to load runtime configuration:', error.message);
            throw error;
        }
    }

    /**
     * Validate team configuration
     */
    validateTeamConfiguration(config) {
        const errors = [];

        if (config.team?.enabled) {
            if (!config.team.name || config.team.name.length < 2) {
                errors.push('Team name must be at least 2 characters long');
            }

            if (!config.team.conflict_resolution ||
                !['prompt', 'team_wins', 'personal_wins', 'merge'].includes(config.team.conflict_resolution)) {
                errors.push('Invalid conflict resolution strategy');
            }

            if (!Array.isArray(config.team.shared_features)) {
                errors.push('Shared features must be an array');
            }
        }

        return errors;
    }

    /**
     * Utility methods for nested property access
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    }
}

module.exports = TeamConfig;