const fs = require('fs').promises;
const path = require('path');

/**
 * Question Generator - Creates contextual and intelligent questions for brainstorming
 *
 * Generates questions based on feature type, project context, and user responses
 * with smart follow-ups and adaptive conversation flow.
 */
class QuestionGenerator {
    constructor() {
        this.templatesPath = path.join(__dirname, '../../data/brainstorm-templates.json');
        this.templates = null;
    }

    /**
     * Load question templates
     * @returns {Promise<Object>} - Question templates
     */
    async loadTemplates() {
        if (this.templates) {
            return this.templates;
        }

        try {
            const data = await fs.readFile(this.templatesPath, 'utf8');
            this.templates = JSON.parse(data);
            return this.templates;
        } catch (error) {
            // Return default templates if file doesn't exist
            this.templates = this.getDefaultTemplates();
            return this.templates;
        }
    }

    /**
     * Generate contextual questions for brainstorming session
     * @param {string} featureName - Feature being brainstormed
     * @param {Object} context - Project context
     * @param {number} questionCount - Number of questions to generate
     * @returns {Promise<Array>} - Array of question objects
     */
    async generateQuestions(featureName, context, questionCount = 6) {
        const templates = await this.loadTemplates();
        const questions = [];

        // Determine feature category
        const featureCategory = this.categorizeFeature(featureName);

        // Always include core question categories
        const coreCategories = [
            'problem_definition',
            'user_personas',
            'technical_implementation',
            'success_criteria'
        ];

        // Add context-specific categories
        const contextualCategories = this.getContextualCategories(featureCategory, context);
        const allCategories = [...coreCategories, ...contextualCategories];

        // Select questions up to the limit
        const selectedCategories = allCategories.slice(0, questionCount);

        for (const category of selectedCategories) {
            const question = await this.generateQuestionForCategory(
                category,
                featureName,
                featureCategory,
                context,
                templates
            );

            if (question) {
                questions.push(question);
            }
        }

        return questions;
    }

    /**
     * Categorize feature based on name and keywords
     * @param {string} featureName - Feature name
     * @returns {string} - Feature category
     */
    categorizeFeature(featureName) {
        const lowerName = featureName.toLowerCase();

        // Authentication & Security
        if (lowerName.includes('auth') || lowerName.includes('login') ||
            lowerName.includes('signin') || lowerName.includes('security')) {
            return 'authentication';
        }

        // Payment & E-commerce
        if (lowerName.includes('payment') || lowerName.includes('checkout') ||
            lowerName.includes('billing') || lowerName.includes('subscription')) {
            return 'payment';
        }

        // User Interface & Experience
        if (lowerName.includes('dashboard') || lowerName.includes('ui') ||
            lowerName.includes('interface') || lowerName.includes('design')) {
            return 'user_interface';
        }

        // API & Integration
        if (lowerName.includes('api') || lowerName.includes('integration') ||
            lowerName.includes('webhook') || lowerName.includes('sync')) {
            return 'api_integration';
        }

        // Analytics & Reporting
        if (lowerName.includes('analytics') || lowerName.includes('report') ||
            lowerName.includes('metrics') || lowerName.includes('tracking')) {
            return 'analytics';
        }

        // Messaging & Communication
        if (lowerName.includes('notification') || lowerName.includes('email') ||
            lowerName.includes('message') || lowerName.includes('chat')) {
            return 'communication';
        }

        // Data Management
        if (lowerName.includes('data') || lowerName.includes('database') ||
            lowerName.includes('storage') || lowerName.includes('backup')) {
            return 'data_management';
        }

        // Search & Discovery
        if (lowerName.includes('search') || lowerName.includes('filter') ||
            lowerName.includes('discovery') || lowerName.includes('browse')) {
            return 'search_discovery';
        }

        return 'general';
    }

    /**
     * Get contextual question categories based on feature and project context
     * @param {string} featureCategory - Feature category
     * @param {Object} context - Project context
     * @returns {Array} - Additional question categories
     */
    getContextualCategories(featureCategory, context) {
        const categories = [];

        // Add scope boundaries for all features
        categories.push('scope_boundaries');

        // Project type specific categories
        if (context.projectType === 'mobile-app') {
            categories.push('mobile_considerations');
        } else if (context.projectType === 'web-app') {
            categories.push('web_considerations');
        } else if (context.projectType === 'backend-api') {
            categories.push('api_considerations');
        }

        // Feature-specific categories
        switch (featureCategory) {
            case 'authentication':
                categories.push('security_compliance', 'user_experience');
                break;
            case 'payment':
                categories.push('security_compliance', 'financial_considerations');
                break;
            case 'user_interface':
                categories.push('user_experience', 'accessibility');
                break;
            case 'api_integration':
                categories.push('technical_constraints', 'performance_requirements');
                break;
            case 'analytics':
                categories.push('data_privacy', 'performance_requirements');
                break;
            case 'communication':
                categories.push('user_experience', 'scalability');
                break;
        }

        // Framework-specific considerations
        if (context.framework === 'next.js') {
            categories.push('seo_considerations');
        } else if (context.framework === 'react-native') {
            categories.push('platform_compatibility');
        }

        return categories;
    }

    /**
     * Generate a question for a specific category
     * @param {string} category - Question category
     * @param {string} featureName - Feature name
     * @param {string} featureCategory - Feature category
     * @param {Object} context - Project context
     * @param {Object} templates - Question templates
     * @returns {Promise<Object>} - Question object
     */
    async generateQuestionForCategory(category, featureName, featureCategory, context, templates) {
        const categoryTemplates = templates[category];
        if (!categoryTemplates) {
            return null;
        }

        // Find appropriate template based on feature category and context
        let template = categoryTemplates.default;

        // Look for feature-specific template
        if (categoryTemplates[featureCategory]) {
            template = categoryTemplates[featureCategory];
        }

        // Look for framework-specific template
        const frameworkKey = `${featureCategory}_${context.framework}`;
        if (categoryTemplates[frameworkKey]) {
            template = categoryTemplates[frameworkKey];
        }

        // Replace placeholders in template
        const question = this.fillTemplate(template, {
            featureName,
            featureCategory,
            framework: context.framework,
            projectType: context.projectType,
            projectName: context.projectName || 'your project'
        });

        return {
            id: `${category}_${Date.now()}`,
            category,
            question: question.question,
            context: question.context,
            options: question.options,
            followUpTriggers: question.followUpTriggers || []
        };
    }

    /**
     * Fill template with context variables
     * @param {Object} template - Question template
     * @param {Object} variables - Template variables
     * @returns {Object} - Filled template
     */
    fillTemplate(template, variables) {
        const filled = JSON.parse(JSON.stringify(template));

        // Replace variables in question text
        filled.question = this.replaceVariables(filled.question, variables);

        // Replace variables in context if present
        if (filled.context) {
            filled.context = this.replaceVariables(filled.context, variables);
        }

        // Replace variables in options if present
        if (filled.options) {
            filled.options = filled.options.map(option =>
                this.replaceVariables(option, variables)
            );
        }

        return filled;
    }

    /**
     * Replace template variables in text
     * @param {string} text - Text with variables
     * @param {Object} variables - Variable values
     * @returns {string} - Text with variables replaced
     */
    replaceVariables(text, variables) {
        return text.replace(/\{(\w+)\}/g, (match, variable) => {
            return variables[variable] || match;
        });
    }

    /**
     * Generate follow-up question based on user response
     * @param {Object} question - Original question
     * @param {string} response - User response
     * @param {Object} context - Project context
     * @returns {Promise<Object|null>} - Follow-up question or null
     */
    async generateFollowUp(question, response, context) {
        const followUpTriggers = question.followUpTriggers || [];
        const lowerResponse = response.toLowerCase();

        for (const trigger of followUpTriggers) {
            // Check if response matches trigger condition
            const matches = trigger.conditions.some(condition => {
                if (condition.type === 'contains') {
                    return condition.keywords.some(keyword =>
                        lowerResponse.includes(keyword.toLowerCase())
                    );
                } else if (condition.type === 'length') {
                    return condition.operator === 'less_than' ?
                        response.length < condition.value :
                        response.length > condition.value;
                }
                return false;
            });

            if (matches) {
                return {
                    type: trigger.type,
                    question: this.replaceVariables(trigger.question, {
                        response: response.slice(0, 50) + (response.length > 50 ? '...' : ''),
                        framework: context.framework,
                        projectType: context.projectType
                    }),
                    context: trigger.context,
                    insights: trigger.insights || []
                };
            }
        }

        // Generate generic follow-up for vague responses
        if (response.length < 20 || this.isVagueResponse(response)) {
            return {
                type: 'clarification',
                question: `Could you provide more specific details about "${response}"? This will help create a more targeted solution.`,
                context: 'Specific details lead to better implementation decisions'
            };
        }

        return null;
    }

    /**
     * Check if response is too vague
     * @param {string} response - User response
     * @returns {boolean} - Whether response is vague
     */
    isVagueResponse(response) {
        const vaguePatterns = [
            'not sure', 'maybe', 'i think', 'probably',
            'something', 'anything', 'whatever', 'stuff',
            'things', 'ok', 'good', 'fine', 'yes', 'no'
        ];

        const lowerResponse = response.toLowerCase().trim();

        // Very short responses
        if (lowerResponse.length < 10) {
            return true;
        }

        // Contains only vague words
        return vaguePatterns.some(pattern => lowerResponse === pattern) ||
               vaguePatterns.filter(pattern => lowerResponse.includes(pattern)).length > 2;
    }

    /**
     * Get default question templates when file is not available
     * @returns {Object} - Default templates
     */
    getDefaultTemplates() {
        return {
            problem_definition: {
                default: {
                    question: "What specific problem does {featureName} solve for your users?",
                    context: "Understanding the core problem helps prioritize features and measure success",
                    options: [
                        "Users can't accomplish a critical task",
                        "Current solution is too slow/complex",
                        "Missing feature that competitors have",
                        "Technical debt or system limitation"
                    ],
                    followUpTriggers: [
                        {
                            type: "clarification",
                            conditions: [{ type: "length", operator: "less_than", value: 20 }],
                            question: "Can you describe a specific scenario where users encounter this problem?"
                        }
                    ]
                }
            },

            user_personas: {
                default: {
                    question: "Who are the primary users that will benefit from {featureName}?",
                    context: "Different user types have different needs and technical comfort levels",
                    options: [
                        "End customers/consumers",
                        "Business administrators",
                        "Technical developers/API users",
                        "Internal team members"
                    ]
                }
            },

            technical_implementation: {
                default: {
                    question: "How should {featureName} integrate with your current {framework} architecture?",
                    context: "Integration approach affects development time and system complexity"
                },
                authentication: {
                    question: "What authentication methods should {featureName} support?",
                    context: "Balance security, user experience, and implementation complexity",
                    options: [
                        "Email/password only",
                        "Social login (Google, GitHub, etc.)",
                        "Passwordless/magic links",
                        "Multi-factor authentication",
                        "Enterprise SSO"
                    ]
                }
            },

            success_criteria: {
                default: {
                    question: "How will you measure if {featureName} is successful?",
                    context: "Clear success metrics guide development priorities and future iterations",
                    followUpTriggers: [
                        {
                            type: "metrics_deep_dive",
                            conditions: [{ type: "contains", keywords: ["users", "engagement"] }],
                            question: "What specific user engagement metrics matter most for your {projectType}?"
                        }
                    ]
                }
            },

            scope_boundaries: {
                default: {
                    question: "For the first version of {featureName}, what features are must-haves vs nice-to-haves?",
                    context: "Clear scope boundaries prevent feature creep and ensure timely delivery"
                }
            },

            user_experience: {
                default: {
                    question: "What should the user experience flow look like for {featureName}?",
                    context: "UX decisions made early prevent costly redesigns later"
                }
            },

            security_compliance: {
                authentication: {
                    question: "What security and compliance requirements apply to {featureName}?",
                    context: "Security requirements vary by industry and user data types",
                    options: [
                        "GDPR compliance (EU users)",
                        "SOC 2 compliance",
                        "Industry-specific regulations",
                        "Basic security best practices",
                        "No specific compliance needed"
                    ]
                }
            }
        };
    }
}

module.exports = QuestionGenerator;