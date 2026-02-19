const fs = require('fs').promises;
const path = require('path');

/**
 * Enhanced Questions - Intelligent PRD question generation system
 *
 * Generates 5-8 contextual questions for PRD creation with follow-up logic,
 * brainstorming integration, and adaptive questioning based on project context.
 */
class EnhancedQuestions {
    constructor() {
        this.questionTemplatesPath = path.join(__dirname, '../../data/prd-question-templates.json');
        this.questionTemplates = null;
        this.brainstormSessionPath = path.join(process.cwd(), '.claude/brainstorm/latest-session.json');
    }

    /**
     * Generate enhanced questions for PRD creation
     * @param {string} featureName - Feature being planned
     * @param {Object} projectContext - Project context from analysis
     * @returns {Promise<Array>} - Array of intelligent questions
     */
    async generateQuestions(featureName, projectContext) {
        const templates = await this.loadQuestionTemplates();

        // Check for existing brainstorming session
        const brainstormSession = await this.loadBrainstormSession(featureName);

        // Determine feature category and context
        const featureCategory = this.categorizeFeature(featureName);
        const contextFactors = this.analyzeContextFactors(projectContext, brainstormSession);

        // Generate core questions (always included)
        const coreQuestions = await this.generateCoreQuestions(
            featureName,
            featureCategory,
            contextFactors,
            templates
        );

        // Generate contextual questions based on project and feature
        const contextualQuestions = await this.generateContextualQuestions(
            featureName,
            featureCategory,
            contextFactors,
            templates
        );

        // Combine and prioritize questions
        const allQuestions = [...coreQuestions, ...contextualQuestions];

        // Select top 8 questions based on relevance and context
        const selectedQuestions = this.selectOptimalQuestions(
            allQuestions,
            contextFactors,
            8
        );

        // Add follow-up logic to each question
        selectedQuestions.forEach(question => {
            question.followUpTriggers = this.generateFollowUpTriggers(
                question,
                featureCategory,
                contextFactors
            );
        });

        return selectedQuestions;
    }

    /**
     * Load question templates
     * @returns {Promise<Object>} - Question templates
     */
    async loadQuestionTemplates() {
        if (this.questionTemplates) {
            return this.questionTemplates;
        }

        try {
            const data = await fs.readFile(this.questionTemplatesPath, 'utf8');
            this.questionTemplates = JSON.parse(data);
            return this.questionTemplates;
        } catch (error) {
            // Return default templates if file doesn't exist
            this.questionTemplates = this.getDefaultQuestionTemplates();
            return this.questionTemplates;
        }
    }

    /**
     * Load existing brainstorming session if available
     * @param {string} featureName - Feature name
     * @returns {Promise<Object|null>} - Brainstorming session or null
     */
    async loadBrainstormSession(featureName) {
        try {
            // First try to load the latest session
            const latestContent = await fs.readFile(this.brainstormSessionPath, 'utf8');
            const latestSession = JSON.parse(latestContent);

            // Check if it matches the current feature
            const sessionFeatureName = latestSession.featureName.toLowerCase().replace(/\s+/g, '-');
            const targetFeatureName = featureName.toLowerCase().replace(/\s+/g, '-');

            if (sessionFeatureName.includes(targetFeatureName) ||
                targetFeatureName.includes(sessionFeatureName)) {
                return latestSession;
            }

            // If not matching, look for specific session
            const brainstormDir = path.dirname(this.brainstormSessionPath);
            const files = await fs.readdir(brainstormDir);

            const matchingFile = files.find(file =>
                file.includes(targetFeatureName) && file.endsWith('.json')
            );

            if (matchingFile) {
                const content = await fs.readFile(path.join(brainstormDir, matchingFile), 'utf8');
                return JSON.parse(content);
            }

        } catch (error) {
            // No brainstorming session found
        }

        return null;
    }

    /**
     * Categorize feature for question generation
     * @param {string} featureName - Feature name
     * @returns {string} - Feature category
     */
    categorizeFeature(featureName) {
        const lowerName = featureName.toLowerCase();

        // Authentication & Security
        if (lowerName.includes('auth') || lowerName.includes('login') ||
            lowerName.includes('signup') || lowerName.includes('security')) {
            return 'authentication';
        }

        // Payment & Commerce
        if (lowerName.includes('payment') || lowerName.includes('checkout') ||
            lowerName.includes('billing') || lowerName.includes('subscription') ||
            lowerName.includes('commerce')) {
            return 'payment';
        }

        // User Interface & Experience
        if (lowerName.includes('dashboard') || lowerName.includes('ui') ||
            lowerName.includes('interface') || lowerName.includes('design') ||
            lowerName.includes('frontend')) {
            return 'user_interface';
        }

        // API & Integration
        if (lowerName.includes('api') || lowerName.includes('integration') ||
            lowerName.includes('webhook') || lowerName.includes('sync')) {
            return 'api_integration';
        }

        // Analytics & Reporting
        if (lowerName.includes('analytics') || lowerName.includes('report') ||
            lowerName.includes('metrics') || lowerName.includes('tracking') ||
            lowerName.includes('monitoring')) {
            return 'analytics';
        }

        // Communication & Messaging
        if (lowerName.includes('notification') || lowerName.includes('email') ||
            lowerName.includes('message') || lowerName.includes('chat') ||
            lowerName.includes('communication')) {
            return 'communication';
        }

        // Data & Content Management
        if (lowerName.includes('data') || lowerName.includes('content') ||
            lowerName.includes('cms') || lowerName.includes('management')) {
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
     * Analyze context factors for question generation
     * @param {Object} projectContext - Project context
     * @param {Object} brainstormSession - Brainstorming session data
     * @returns {Object} - Context factors
     */
    analyzeContextFactors(projectContext, brainstormSession) {
        const factors = {
            framework: projectContext.framework || 'unknown',
            projectType: projectContext.projectType || 'unknown',
            complexity: projectContext.complexity || 'medium',
            maturity: projectContext.maturity || 'early',
            hasExistingAuth: projectContext.featurePatterns?.authenticationExists || false,
            hasExistingPayments: projectContext.featurePatterns?.paymentExists || false,
            hasCompetitiveAnalysis: projectContext.hasCompetitiveAnalysis || false,
            hasBrainstormingContext: !!brainstormSession,
            integrations: projectContext.integrations || [],
            userTypes: ['general_user'], // Default
            businessContext: 'b2c', // Default
            priorityLevel: 'medium' // Default
        };

        // Extract additional context from brainstorming session
        if (brainstormSession) {
            factors.brainstormingInsights = {
                keyDecisions: brainstormSession.synthesis?.keyDecisions || {},
                identifiedRisks: brainstormSession.synthesis?.totalRisks || 0,
                targetUsers: brainstormSession.synthesis?.targetUsers || ['general_user'],
                technicalApproach: brainstormSession.synthesis?.technicalApproach || 'standard',
                readinessScore: brainstormSession.synthesis?.readinessScore || 50
            };

            // Determine business context from brainstorming
            if (factors.brainstormingInsights.targetUsers.includes('administrator') ||
                factors.brainstormingInsights.targetUsers.includes('business_user')) {
                factors.businessContext = 'b2b';
            }
        }

        // Determine priority level based on various factors
        if (factors.framework === 'unknown' || factors.maturity === 'startup') {
            factors.priorityLevel = 'high'; // Need more detailed planning
        } else if (factors.hasCompetitiveAnalysis && factors.hasBrainstormingContext) {
            factors.priorityLevel = 'low'; // Already well-researched
        }

        return factors;
    }

    /**
     * Generate core questions (always included)
     * @param {string} featureName - Feature name
     * @param {string} featureCategory - Feature category
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Question templates
     * @returns {Array} - Core questions
     */
    async generateCoreQuestions(featureName, featureCategory, contextFactors, templates) {
        const coreCategories = [
            'business_value',
            'user_impact',
            'success_metrics',
            'technical_feasibility'
        ];

        const questions = [];

        for (const category of coreCategories) {
            const template = this.selectBestTemplate(
                category,
                featureCategory,
                contextFactors,
                templates
            );

            if (template) {
                const question = this.buildQuestionFromTemplate(
                    template,
                    category,
                    featureName,
                    contextFactors
                );
                questions.push(question);
            }
        }

        return questions;
    }

    /**
     * Generate contextual questions based on feature and project context
     * @param {string} featureName - Feature name
     * @param {string} featureCategory - Feature category
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Question templates
     * @returns {Array} - Contextual questions
     */
    async generateContextualQuestions(featureName, featureCategory, contextFactors, templates) {
        const questions = [];

        // Category-specific questions
        const categoryQuestions = this.generateCategorySpecificQuestions(
            featureName,
            featureCategory,
            contextFactors,
            templates
        );
        questions.push(...categoryQuestions);

        // Framework-specific questions
        if (contextFactors.framework !== 'unknown') {
            const frameworkQuestions = this.generateFrameworkSpecificQuestions(
                featureName,
                contextFactors,
                templates
            );
            questions.push(...frameworkQuestions);
        }

        // Business context questions
        const businessQuestions = this.generateBusinessContextQuestions(
            featureName,
            contextFactors,
            templates
        );
        questions.push(...businessQuestions);

        // Integration and dependency questions
        const integrationQuestions = this.generateIntegrationQuestions(
            featureName,
            contextFactors,
            templates
        );
        questions.push(...integrationQuestions);

        return questions;
    }

    /**
     * Generate category-specific questions
     * @param {string} featureName - Feature name
     * @param {string} featureCategory - Feature category
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Question templates
     * @returns {Array} - Category-specific questions
     */
    generateCategorySpecificQuestions(featureName, featureCategory, contextFactors, templates) {
        const questions = [];

        switch (featureCategory) {
            case 'authentication':
                questions.push(
                    this.buildQuestionFromTemplate(
                        templates.authentication?.security_requirements ||
                        templates.default.security_considerations,
                        'security_requirements',
                        featureName,
                        contextFactors
                    ),
                    this.buildQuestionFromTemplate(
                        templates.authentication?.user_experience ||
                        templates.default.user_experience,
                        'auth_user_experience',
                        featureName,
                        contextFactors
                    )
                );
                break;

            case 'payment':
                questions.push(
                    this.buildQuestionFromTemplate(
                        templates.payment?.compliance_requirements ||
                        templates.default.compliance_considerations,
                        'payment_compliance',
                        featureName,
                        contextFactors
                    ),
                    this.buildQuestionFromTemplate(
                        templates.payment?.financial_impact ||
                        templates.default.business_impact,
                        'financial_impact',
                        featureName,
                        contextFactors
                    )
                );
                break;

            case 'api_integration':
                questions.push(
                    this.buildQuestionFromTemplate(
                        templates.api?.design_principles ||
                        templates.default.technical_architecture,
                        'api_design',
                        featureName,
                        contextFactors
                    ),
                    this.buildQuestionFromTemplate(
                        templates.api?.developer_experience ||
                        templates.default.user_experience,
                        'developer_experience',
                        featureName,
                        contextFactors
                    )
                );
                break;

            case 'user_interface':
                questions.push(
                    this.buildQuestionFromTemplate(
                        templates.ui?.accessibility_requirements ||
                        templates.default.accessibility_considerations,
                        'accessibility',
                        featureName,
                        contextFactors
                    ),
                    this.buildQuestionFromTemplate(
                        templates.ui?.responsive_design ||
                        templates.default.user_experience,
                        'responsive_design',
                        featureName,
                        contextFactors
                    )
                );
                break;

            default:
                // Add general contextual questions
                questions.push(
                    this.buildQuestionFromTemplate(
                        templates.default.user_experience,
                        'user_experience',
                        featureName,
                        contextFactors
                    )
                );
                break;
        }

        return questions.filter(q => q !== null);
    }

    /**
     * Generate framework-specific questions
     * @param {string} featureName - Feature name
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Question templates
     * @returns {Array} - Framework-specific questions
     */
    generateFrameworkSpecificQuestions(featureName, contextFactors, templates) {
        const questions = [];
        const framework = contextFactors.framework;

        if (framework === 'next.js') {
            questions.push(
                this.buildQuestionFromTemplate(
                    templates.frameworks?.nextjs?.seo_requirements ||
                    templates.default.technical_considerations,
                    'seo_optimization',
                    featureName,
                    contextFactors
                ),
                this.buildQuestionFromTemplate(
                    templates.frameworks?.nextjs?.ssr_considerations ||
                    templates.default.performance_requirements,
                    'ssr_strategy',
                    featureName,
                    contextFactors
                )
            );
        } else if (framework === 'react-native' || framework === 'expo') {
            questions.push(
                this.buildQuestionFromTemplate(
                    templates.frameworks?.mobile?.platform_requirements ||
                    templates.default.platform_considerations,
                    'mobile_platforms',
                    featureName,
                    contextFactors
                ),
                this.buildQuestionFromTemplate(
                    templates.frameworks?.mobile?.native_features ||
                    templates.default.technical_requirements,
                    'native_capabilities',
                    featureName,
                    contextFactors
                )
            );
        } else if (framework === 'express' || framework === 'fastify') {
            questions.push(
                this.buildQuestionFromTemplate(
                    templates.frameworks?.backend?.api_design ||
                    templates.default.api_considerations,
                    'backend_api_design',
                    featureName,
                    contextFactors
                ),
                this.buildQuestionFromTemplate(
                    templates.frameworks?.backend?.scalability ||
                    templates.default.scalability_requirements,
                    'backend_scalability',
                    featureName,
                    contextFactors
                )
            );
        }

        return questions.filter(q => q !== null);
    }

    /**
     * Generate business context questions
     * @param {string} featureName - Feature name
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Question templates
     * @returns {Array} - Business context questions
     */
    generateBusinessContextQuestions(featureName, contextFactors, templates) {
        const questions = [];

        if (contextFactors.businessContext === 'b2b') {
            questions.push(
                this.buildQuestionFromTemplate(
                    templates.business?.b2b_requirements ||
                    templates.default.business_requirements,
                    'b2b_features',
                    featureName,
                    contextFactors
                )
            );
        }

        // Add competitive analysis question if not available
        if (!contextFactors.hasCompetitiveAnalysis) {
            questions.push(
                this.buildQuestionFromTemplate(
                    templates.business?.competitive_analysis ||
                    templates.default.competitive_considerations,
                    'competitive_landscape',
                    featureName,
                    contextFactors
                )
            );
        }

        return questions.filter(q => q !== null);
    }

    /**
     * Generate integration and dependency questions
     * @param {string} featureName - Feature name
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Question templates
     * @returns {Array} - Integration questions
     */
    generateIntegrationQuestions(featureName, contextFactors, templates) {
        const questions = [];

        // If project has many integrations, ask about new ones
        if (contextFactors.integrations.length > 2) {
            questions.push(
                this.buildQuestionFromTemplate(
                    templates.integration?.existing_systems ||
                    templates.default.integration_requirements,
                    'system_integration',
                    featureName,
                    contextFactors
                )
            );
        }

        // Ask about external dependencies
        questions.push(
            this.buildQuestionFromTemplate(
                templates.integration?.external_dependencies ||
                templates.default.dependency_management,
                'external_dependencies',
                featureName,
                contextFactors
            )
        );

        return questions.filter(q => q !== null);
    }

    /**
     * Select best template for category and context
     * @param {string} category - Question category
     * @param {string} featureCategory - Feature category
     * @param {Object} contextFactors - Context factors
     * @param {Object} templates - Available templates
     * @returns {Object} - Selected template
     */
    selectBestTemplate(category, featureCategory, contextFactors, templates) {
        // Try feature-specific template first
        if (templates[featureCategory] && templates[featureCategory][category]) {
            return templates[featureCategory][category];
        }

        // Try framework-specific template
        if (contextFactors.framework !== 'unknown' &&
            templates.frameworks?.[contextFactors.framework]?.[category]) {
            return templates.frameworks[contextFactors.framework][category];
        }

        // Fall back to default template
        return templates.default?.[category] || null;
    }

    /**
     * Build question from template
     * @param {Object} template - Question template
     * @param {string} category - Question category
     * @param {string} featureName - Feature name
     * @param {Object} contextFactors - Context factors
     * @returns {Object} - Built question
     */
    buildQuestionFromTemplate(template, category, featureName, contextFactors) {
        if (!template) return null;

        const variables = {
            featureName,
            framework: contextFactors.framework,
            projectType: contextFactors.projectType,
            businessContext: contextFactors.businessContext
        };

        return {
            id: `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            category,
            question: this.fillTemplate(template.question, variables),
            context: template.context ? this.fillTemplate(template.context, variables) : null,
            options: template.options || null,
            priority: template.priority || 'medium',
            expectedAnswerType: template.expectedAnswerType || 'text',
            relevanceScore: this.calculateRelevanceScore(template, contextFactors)
        };
    }

    /**
     * Fill template variables
     * @param {string} template - Template string
     * @param {Object} variables - Variables to fill
     * @returns {string} - Filled template
     */
    fillTemplate(template, variables) {
        return template.replace(/\{(\w+)\}/g, (match, variable) => {
            return variables[variable] || match;
        });
    }

    /**
     * Calculate relevance score for question
     * @param {Object} template - Question template
     * @param {Object} contextFactors - Context factors
     * @returns {number} - Relevance score (0-100)
     */
    calculateRelevanceScore(template, contextFactors) {
        let score = 50; // Base score

        // Priority-based scoring
        if (template.priority === 'high') score += 20;
        else if (template.priority === 'low') score -= 10;

        // Context matching bonuses
        if (template.frameworks && template.frameworks.includes(contextFactors.framework)) {
            score += 15;
        }

        if (template.projectTypes && template.projectTypes.includes(contextFactors.projectType)) {
            score += 15;
        }

        if (template.businessContext && template.businessContext === contextFactors.businessContext) {
            score += 10;
        }

        // Brainstorming context bonus
        if (contextFactors.hasBrainstormingContext && template.category !== 'basic_requirements') {
            score += 10; // More sophisticated questions when brainstorming exists
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Select optimal questions based on relevance and diversity
     * @param {Array} questions - All generated questions
     * @param {Object} contextFactors - Context factors
     * @param {number} maxQuestions - Maximum questions to select
     * @returns {Array} - Selected questions
     */
    selectOptimalQuestions(questions, contextFactors, maxQuestions) {
        // Sort by relevance score
        questions.sort((a, b) => b.relevanceScore - a.relevanceScore);

        const selected = [];
        const categoriesUsed = new Set();

        // Select questions ensuring category diversity
        for (const question of questions) {
            if (selected.length >= maxQuestions) break;

            // Always include high-priority questions
            if (question.priority === 'high' || !categoriesUsed.has(question.category)) {
                selected.push(question);
                categoriesUsed.add(question.category);
            }
        }

        // Fill remaining slots with highest-scoring questions
        for (const question of questions) {
            if (selected.length >= maxQuestions) break;
            if (!selected.includes(question)) {
                selected.push(question);
            }
        }

        return selected.slice(0, maxQuestions);
    }

    /**
     * Generate follow-up triggers for a question
     * @param {Object} question - Question object
     * @param {string} featureCategory - Feature category
     * @param {Object} contextFactors - Context factors
     * @returns {Array} - Follow-up triggers
     */
    generateFollowUpTriggers(question, featureCategory, contextFactors) {
        const triggers = [];

        // Generic follow-up for vague responses
        triggers.push({
            type: 'clarification',
            condition: 'vague_response',
            followUpQuestion: `Could you provide more specific details about your answer to help create more targeted requirements?`,
            context: 'Specific details lead to better implementation decisions'
        });

        // Category-specific follow-ups
        if (question.category === 'business_value') {
            triggers.push({
                type: 'quantification',
                condition: 'mentions_metrics',
                followUpQuestion: `What specific metrics would indicate success for this business value?`,
                context: 'Quantifiable metrics help validate feature success'
            });
        }

        if (question.category === 'user_impact') {
            triggers.push({
                type: 'user_journey',
                condition: 'mentions_users',
                followUpQuestion: `Can you walk through how users would discover and use ${question.featureName}?`,
                context: 'User journey details inform UX design decisions'
            });
        }

        if (question.category === 'technical_feasibility') {
            triggers.push({
                type: 'technical_deep_dive',
                condition: 'mentions_complexity',
                followUpQuestion: `What specific technical challenges do you anticipate with this approach?`,
                context: 'Understanding technical risks helps with implementation planning'
            });
        }

        // Framework-specific follow-ups
        if (contextFactors.framework === 'next.js' && question.category.includes('seo')) {
            triggers.push({
                type: 'seo_strategy',
                condition: 'mentions_seo',
                followUpQuestion: `Which pages or content types need SEO optimization for ${question.featureName}?`,
                context: 'SEO strategy affects Next.js rendering choices (SSR vs SSG)'
            });
        }

        return triggers;
    }

    /**
     * Get default question templates
     * @returns {Object} - Default templates
     */
    getDefaultQuestionTemplates() {
        return {
            default: {
                business_value: {
                    question: "What specific business value will {featureName} provide to your organization?",
                    context: "Understanding business value helps prioritize features and measure ROI",
                    priority: "high",
                    expectedAnswerType: "business_impact"
                },
                user_impact: {
                    question: "How will {featureName} improve the experience for your users?",
                    context: "User impact drives adoption and satisfaction metrics",
                    priority: "high",
                    expectedAnswerType: "user_benefit"
                },
                success_metrics: {
                    question: "What metrics will indicate that {featureName} is successful?",
                    context: "Clear success metrics guide development priorities and validation",
                    priority: "high",
                    expectedAnswerType: "measurable_goals"
                },
                technical_feasibility: {
                    question: "What technical constraints or requirements should be considered for {featureName}?",
                    context: "Technical feasibility affects timeline, resources, and architectural decisions",
                    priority: "high",
                    expectedAnswerType: "technical_requirements"
                },
                user_experience: {
                    question: "What should the ideal user experience be like for {featureName}?",
                    context: "UX requirements inform design and development decisions",
                    priority: "medium",
                    expectedAnswerType: "ux_requirements"
                },
                competitive_considerations: {
                    question: "How does {featureName} compare to what competitors offer?",
                    context: "Competitive analysis helps identify differentiation opportunities",
                    priority: "medium",
                    expectedAnswerType: "competitive_analysis"
                },
                integration_requirements: {
                    question: "What existing systems or services will {featureName} need to integrate with?",
                    context: "Integration requirements affect architecture and development complexity",
                    priority: "medium",
                    expectedAnswerType: "integration_needs"
                },
                scalability_requirements: {
                    question: "What are the expected usage patterns and scale requirements for {featureName}?",
                    context: "Scale requirements influence architecture and infrastructure decisions",
                    priority: "medium",
                    expectedAnswerType: "scale_expectations"
                }
            }
        };
    }
}

module.exports = EnhancedQuestions;