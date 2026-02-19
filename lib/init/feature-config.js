const fs = require('fs-extra');

class FeatureConfig {
    constructor() {
        this.availableFeatures = {
            bug_diagnosis: {
                name: 'Bug Diagnosis & Auto-Fix',
                description: 'Automatic diagnosis and fixing of common development issues',
                settings: {
                    enabled: true,
                    auto_fix: false,
                    backup_before_fix: true,
                    rollback_on_failure: true,
                    notification_level: 'all' // 'all', 'failures_only', 'none'
                },
                questions: [
                    {
                        key: 'auto_fix',
                        question: 'Should bug fixes be applied automatically?',
                        type: 'boolean',
                        default: false,
                        help: 'If enabled, common issues will be fixed without confirmation. A backup is always created.'
                    },
                    {
                        key: 'notification_level',
                        question: 'What level of notifications do you want?',
                        type: 'choice',
                        options: [
                            { value: 'all', label: 'All attempts and results' },
                            { value: 'failures_only', label: 'Only when fixes fail' },
                            { value: 'none', label: 'Silent operation' }
                        ],
                        default: 'all'
                    }
                ]
            },
            brainstorming: {
                name: 'Enhanced Brainstorming',
                description: 'Intelligent ideation and contextual questioning for feature development',
                settings: {
                    enabled: true,
                    question_depth: 'enhanced', // 'basic', 'enhanced', 'deep'
                    session_timeout: 1800, // 30 minutes
                    auto_export_notes: true
                },
                questions: [
                    {
                        key: 'question_depth',
                        question: 'How deep should brainstorming sessions be?',
                        type: 'choice',
                        options: [
                            { value: 'basic', label: 'Basic (3-5 questions, 10 min)' },
                            { value: 'enhanced', label: 'Enhanced (5-8 questions, 20 min)' },
                            { value: 'deep', label: 'Deep (8-12 questions, 30+ min)' }
                        ],
                        default: 'enhanced'
                    }
                ]
            },
            pipeline: {
                name: 'Quality Pipeline',
                description: 'Automated code quality checks with specialized agents',
                settings: {
                    enabled: true,
                    stages: ['pre-commit', 'pre-PR'],
                    agents: ['security', 'performance'],
                    timeout_minutes: 10,
                    fail_fast: false
                },
                questions: [
                    {
                        key: 'stages',
                        question: 'When should quality checks run?',
                        type: 'multi-choice',
                        options: [
                            { value: 'pre-commit', label: 'Before each commit' },
                            { value: 'pre-PR', label: 'Before creating PRs' },
                            { value: 'pre-deploy', label: 'Before deployment' },
                            { value: 'manual', label: 'Only when manually triggered' }
                        ],
                        default: ['pre-commit', 'pre-PR']
                    },
                    {
                        key: 'agents',
                        question: 'Which quality agents should be enabled?',
                        type: 'multi-choice',
                        options: [
                            { value: 'security', label: 'Security vulnerabilities' },
                            { value: 'performance', label: 'Performance issues' },
                            { value: 'accessibility', label: 'Accessibility compliance' },
                            { value: 'best-practices', label: 'Code best practices' },
                            { value: 'documentation', label: 'Documentation completeness' }
                        ],
                        default: ['security', 'performance']
                    }
                ]
            },
            dashboard: {
                name: 'Development Dashboard',
                description: 'Real-time development progress and metrics dashboard',
                settings: {
                    enabled: true,
                    auto_start: true,
                    port: 3333,
                    host: 'localhost',
                    metrics_retention_days: 30,
                    show_notifications: true
                },
                questions: [
                    {
                        key: 'auto_start',
                        question: 'Auto-start dashboard with /oden:work sessions?',
                        type: 'boolean',
                        default: true,
                        help: 'Dashboard provides real-time progress monitoring'
                    },
                    {
                        key: 'port',
                        question: 'Dashboard port (default: 3333)?',
                        type: 'number',
                        default: 3333,
                        validation: (value) => value >= 3000 && value <= 9999
                    }
                ]
            },
            export: {
                name: 'Documentation Export',
                description: 'Export PRDs, specs, and documentation to various formats',
                settings: {
                    enabled: true,
                    default_format: 'pdf',
                    branding: {
                        enabled: false,
                        company: '',
                        logo_path: ''
                    },
                    auto_export: false
                },
                questions: [
                    {
                        key: 'default_format',
                        question: 'Default export format for documentation?',
                        type: 'choice',
                        options: [
                            { value: 'pdf', label: 'PDF (best for sharing)' },
                            { value: 'notion', label: 'Notion (collaborative)' },
                            { value: 'confluence', label: 'Confluence (enterprise)' },
                            { value: 'docx', label: 'Word Document' },
                            { value: 'markdown', label: 'Enhanced Markdown' }
                        ],
                        default: 'pdf'
                    },
                    {
                        key: 'branding.enabled',
                        question: 'Enable client/company branding on exports?',
                        type: 'boolean',
                        default: false
                    },
                    {
                        key: 'branding.company',
                        question: 'Company name for branding?',
                        type: 'string',
                        condition: (config) => config.branding?.enabled,
                        help: 'Will appear on exported document headers'
                    }
                ]
            }
        };
    }

    /**
     * Get available features based on project context
     */
    getAvailableFeatures(projectContext) {
        // All features are available for now
        // Future: could filter based on project type, tech stack, etc.
        return this.availableFeatures;
    }

    /**
     * Generate configuration questions for a specific feature
     */
    generateFeatureQuestions(featureKey, projectContext = {}) {
        const feature = this.availableFeatures[featureKey];
        if (!feature) {
            throw new Error(`Unknown feature: ${featureKey}`);
        }

        return feature.questions.map(question => ({
            ...question,
            feature: featureKey,
            featureName: feature.name
        }));
    }

    /**
     * Generate all configuration questions for enabled features
     */
    generateAllQuestions(enabledFeatures, projectContext = {}) {
        const questions = [];

        for (const featureKey of enabledFeatures) {
            const featureQuestions = this.generateFeatureQuestions(featureKey, projectContext);
            questions.push(...featureQuestions);
        }

        return questions;
    }

    /**
     * Apply user responses to feature configuration
     */
    applyResponses(responses, enabledFeatures) {
        const config = { features: {} };

        for (const featureKey of enabledFeatures) {
            const feature = this.availableFeatures[featureKey];
            const featureConfig = { ...feature.settings };

            // Apply user responses to feature config
            for (const question of feature.questions) {
                const responseKey = `${featureKey}.${question.key}`;
                if (responses.hasOwnProperty(responseKey)) {
                    this.setNestedProperty(featureConfig, question.key, responses[responseKey]);
                }
            }

            config.features[featureKey] = featureConfig;
        }

        return config;
    }

    /**
     * Set nested property using dot notation (e.g., "branding.enabled")
     */
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

    /**
     * Generate feature selection questions
     */
    generateFeatureSelectionQuestions(projectContext) {
        const features = this.getAvailableFeatures(projectContext);

        return [
            {
                key: 'enabled_features',
                question: 'Which productivity features do you want to enable?',
                type: 'multi-choice',
                options: Object.entries(features).map(([key, feature]) => ({
                    value: key,
                    label: feature.name,
                    description: feature.description
                })),
                default: ['bug_diagnosis', 'brainstorming'], // Sensible defaults
                help: 'You can always enable/disable features later by editing .oden-config.json'
            }
        ];
    }

    /**
     * Validate feature configuration
     */
    validateConfiguration(config) {
        const errors = [];

        // Validate dashboard port
        if (config.features?.dashboard?.enabled && config.features?.dashboard?.port) {
            const port = config.features.dashboard.port;
            if (port < 3000 || port > 9999) {
                errors.push('Dashboard port must be between 3000 and 9999');
            }
        }

        // Validate branding settings
        if (config.features?.export?.branding?.enabled) {
            if (!config.features.export.branding.company) {
                errors.push('Company name is required when branding is enabled');
            }
        }

        // Validate pipeline stages and agents
        if (config.features?.pipeline?.enabled) {
            if (!config.features.pipeline.stages || config.features.pipeline.stages.length === 0) {
                errors.push('At least one pipeline stage must be enabled');
            }
            if (!config.features.pipeline.agents || config.features.pipeline.agents.length === 0) {
                errors.push('At least one quality agent must be enabled');
            }
        }

        return errors;
    }

    /**
     * Generate feature recommendation based on project type
     */
    generateRecommendations(projectContext) {
        const recommendations = [];

        // Recommend based on project type
        switch (projectContext.objective) {
            case 'Productividad/trabajo':
                recommendations.push({
                    feature: 'dashboard',
                    reason: 'Dashboard is essential for productivity applications'
                });
                recommendations.push({
                    feature: 'export',
                    reason: 'Documentation export helps with stakeholder communication'
                });
                break;

            case 'Realizar transacciones':
                recommendations.push({
                    feature: 'pipeline',
                    reason: 'Security and quality checks are critical for payment systems',
                    suggested_agents: ['security', 'performance']
                });
                recommendations.push({
                    feature: 'bug_diagnosis',
                    reason: 'Auto-fix capabilities reduce downtime in transaction systems'
                });
                break;

            case 'Comunicación/social':
                recommendations.push({
                    feature: 'brainstorming',
                    reason: 'Enhanced brainstorming helps design better user experiences'
                });
                recommendations.push({
                    feature: 'pipeline',
                    reason: 'Accessibility and performance are crucial for social apps',
                    suggested_agents: ['accessibility', 'performance']
                });
                break;
        }

        // Recommend based on experience level
        if (projectContext.experience === 'Principiante') {
            recommendations.push({
                feature: 'bug_diagnosis',
                reason: 'Auto-fix helps beginners learn from common mistakes'
            });
        }

        return recommendations;
    }
}

module.exports = FeatureConfig;