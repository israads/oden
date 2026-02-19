const fs = require('fs').promises;
const path = require('path');
const QuestionGenerator = require('../brainstorm/question-generator');
const ContextAnalyzer = require('../brainstorm/context-analyzer');
const SuggestionEngine = require('../brainstorm/suggestion-engine');

/**
 * /oden:brainstorm - Intelligent Brainstorming Engine
 *
 * Conducts interactive ideation sessions with contextual questions,
 * alternative suggestions, risk identification, and seamless PRD integration.
 */
class BrainstormCommand {
    constructor() {
        this.questionGenerator = new QuestionGenerator();
        this.contextAnalyzer = new ContextAnalyzer();
        this.suggestionEngine = new SuggestionEngine();
        this.sessionDir = path.join(process.cwd(), '.claude/brainstorm');
    }

    /**
     * Execute the brainstorming session
     * @param {string} featureName - Feature to brainstorm
     * @param {Object} options - Command options (quick, deep, research)
     * @returns {Promise<Object>} - Session results
     */
    async execute(featureName, options = {}) {
        console.log(`🎯 Starting brainstorming session: ${featureName}\n`);

        try {
            // Ensure session directory exists
            await fs.mkdir(this.sessionDir, { recursive: true });

            // Phase 1: Context Analysis
            console.log('🔍 Analyzing project context...');
            const context = await this.contextAnalyzer.analyze();

            // Phase 2: Initialize Session
            const session = await this.initializeSession(featureName, context, options);

            console.log(`\n📋 Detected: ${context.framework} ${context.projectType} project`);
            console.log(`💭 Generating ${session.questionCount} contextual questions...\n`);

            // Phase 3: Interactive Question Session
            const conversationResults = await this.conductConversation(session, context);

            // Phase 4: Alternative Exploration
            console.log('\n🔄 Exploring implementation alternatives...');
            const alternatives = await this.suggestionEngine.generateAlternatives(
                featureName,
                conversationResults,
                context
            );

            // Phase 5: Risk Assessment
            console.log('\n🚨 Identifying potential risks...');
            const risks = await this.suggestionEngine.identifyRisks(
                featureName,
                conversationResults,
                context
            );

            // Phase 6: Session Synthesis
            const synthesis = await this.synthesizeSession(
                session,
                conversationResults,
                alternatives,
                risks
            );

            // Phase 7: Save Session
            await this.saveSession(session);

            console.log('\n✅ Brainstorming session complete!');
            console.log('\n📋 Session Summary:');
            this.displaySummary(synthesis);

            console.log('\n🚀 Next Steps:');
            console.log(`   1. Review insights and decisions`);
            console.log(`   2. Run: /oden:prd ${featureName.replace(/\s+/g, '-').toLowerCase()}`);
            console.log(`   3. All brainstorming context will be automatically included`);

            return {
                success: true,
                session,
                synthesis,
                nextCommand: `/oden:prd ${featureName.replace(/\s+/g, '-').toLowerCase()}`
            };

        } catch (error) {
            console.error('❌ Brainstorming session failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Initialize brainstorming session
     * @param {string} featureName - Feature to brainstorm
     * @param {Object} context - Project context
     * @param {Object} options - Session options
     * @returns {Promise<Object>} - Session object
     */
    async initializeSession(featureName, context, options) {
        const timestamp = new Date().toISOString();
        const sessionId = `session_${Date.now()}`;

        // Determine question count based on options
        let questionCount = 6; // Default
        if (options.quick) questionCount = 4;
        if (options.deep) questionCount = 10;

        const session = {
            id: sessionId,
            featureName,
            startedAt: timestamp,
            options,
            questionCount,
            context,
            questions: [],
            responses: [],
            decisions: {},
            insights: []
        };

        return session;
    }

    /**
     * Conduct interactive conversation with user
     * @param {Object} session - Session object
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Conversation results
     */
    async conductConversation(session, context) {
        const questions = await this.questionGenerator.generateQuestions(
            session.featureName,
            context,
            session.questionCount
        );

        const responses = [];
        const insights = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            console.log(`\n${i + 1}/${questions.length}: ${question.category.toUpperCase()}`);
            console.log(question.question);

            if (question.context) {
                console.log(`💡 Context: ${question.context}`);
            }

            if (question.options && question.options.length > 0) {
                question.options.forEach((option, idx) => {
                    console.log(`   ${String.fromCharCode(97 + idx)}) ${option}`);
                });
            }

            // Get user response
            const response = await this.getUserInput();
            responses.push({
                questionId: question.id,
                question: question.question,
                response,
                category: question.category,
                timestamp: new Date().toISOString()
            });

            // Generate follow-up if needed
            const followUp = await this.questionGenerator.generateFollowUp(
                question,
                response,
                context
            );

            if (followUp) {
                console.log(`\n💭 ${followUp.type}: ${followUp.question}`);
                const followUpResponse = await this.getUserInput();

                responses.push({
                    questionId: `${question.id}_followup`,
                    question: followUp.question,
                    response: followUpResponse,
                    category: 'follow_up',
                    parentQuestion: question.id,
                    timestamp: new Date().toISOString()
                });

                // Extract insights from follow-up
                if (followUp.insights) {
                    insights.push(...followUp.insights);
                }
            }

            // Extract key insights from response
            const responseInsights = this.extractInsights(question, response);
            if (responseInsights.length > 0) {
                insights.push(...responseInsights);
            }
        }

        session.questions = questions;
        session.responses = responses;
        session.insights = insights;

        return {
            questions,
            responses,
            insights,
            keyDecisions: this.extractKeyDecisions(responses)
        };
    }

    /**
     * Get user input with readline interface
     * @returns {Promise<string>} - User response
     */
    getUserInput() {
        return new Promise((resolve) => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('\n→ Your response: ', (answer) => {
                readline.close();
                resolve(answer.trim());
            });
        });
    }

    /**
     * Extract key insights from question-response pairs
     * @param {Object} question - Question object
     * @param {string} response - User response
     * @returns {Array} - Array of insights
     */
    extractInsights(question, response) {
        const insights = [];

        // Business insights
        if (question.category === 'business_value' && response.toLowerCase().includes('revenue')) {
            insights.push({
                type: 'business',
                insight: 'Revenue impact is a key consideration',
                confidence: 0.8
            });
        }

        // Technical insights
        if (question.category === 'technical_constraints' && response.toLowerCase().includes('api')) {
            insights.push({
                type: 'technical',
                insight: 'API integration complexity identified',
                confidence: 0.7
            });
        }

        // UX insights
        if (question.category === 'user_experience' && response.toLowerCase().includes('mobile')) {
            insights.push({
                type: 'ux',
                insight: 'Mobile-first approach required',
                confidence: 0.9
            });
        }

        return insights;
    }

    /**
     * Extract key decisions from responses
     * @param {Array} responses - User responses
     * @returns {Object} - Key decisions
     */
    extractKeyDecisions(responses) {
        const decisions = {};

        responses.forEach(response => {
            // Extract specific decisions based on question categories
            switch (response.category) {
                case 'problem_definition':
                    decisions.problemType = this.classifyProblem(response.response);
                    break;

                case 'user_personas':
                    decisions.targetUsers = this.extractUserTypes(response.response);
                    break;

                case 'technical_implementation':
                    decisions.technicalApproach = this.extractTechnicalApproach(response.response);
                    break;

                case 'success_criteria':
                    decisions.successMetrics = this.extractMetrics(response.response);
                    break;

                case 'scope_boundaries':
                    decisions.mvpScope = this.extractScope(response.response);
                    break;
            }
        });

        return decisions;
    }

    /**
     * Classify problem type from response
     * @param {string} response - User response
     * @returns {string} - Problem classification
     */
    classifyProblem(response) {
        const lowercaseResponse = response.toLowerCase();

        if (lowercaseResponse.includes('user') && lowercaseResponse.includes('pain')) {
            return 'user_experience';
        } else if (lowercaseResponse.includes('business') || lowercaseResponse.includes('revenue')) {
            return 'business_process';
        } else if (lowercaseResponse.includes('technical') || lowercaseResponse.includes('system')) {
            return 'technical_debt';
        } else if (lowercaseResponse.includes('new') || lowercaseResponse.includes('missing')) {
            return 'feature_gap';
        }

        return 'general_improvement';
    }

    /**
     * Extract user types from response
     * @param {string} response - User response
     * @returns {Array} - Array of user types
     */
    extractUserTypes(response) {
        const userTypes = [];
        const lowercaseResponse = response.toLowerCase();

        if (lowercaseResponse.includes('admin') || lowercaseResponse.includes('administrator')) {
            userTypes.push('administrator');
        }
        if (lowercaseResponse.includes('end user') || lowercaseResponse.includes('customer')) {
            userTypes.push('end_user');
        }
        if (lowercaseResponse.includes('developer') || lowercaseResponse.includes('api')) {
            userTypes.push('developer');
        }
        if (lowercaseResponse.includes('manager') || lowercaseResponse.includes('supervisor')) {
            userTypes.push('manager');
        }

        return userTypes.length > 0 ? userTypes : ['general_user'];
    }

    /**
     * Extract technical approach from response
     * @param {string} response - User response
     * @returns {string} - Technical approach
     */
    extractTechnicalApproach(response) {
        const lowercaseResponse = response.toLowerCase();

        if (lowercaseResponse.includes('microservice') || lowercaseResponse.includes('api')) {
            return 'microservices';
        } else if (lowercaseResponse.includes('monolith') || lowercaseResponse.includes('single')) {
            return 'monolithic';
        } else if (lowercaseResponse.includes('serverless') || lowercaseResponse.includes('lambda')) {
            return 'serverless';
        } else if (lowercaseResponse.includes('existing') || lowercaseResponse.includes('integrate')) {
            return 'integration';
        }

        return 'standard';
    }

    /**
     * Extract success metrics from response
     * @param {string} response - User response
     * @returns {Array} - Array of metrics
     */
    extractMetrics(response) {
        const metrics = [];
        const lowercaseResponse = response.toLowerCase();

        if (lowercaseResponse.includes('conversion') || lowercaseResponse.includes('%')) {
            metrics.push('conversion_rate');
        }
        if (lowercaseResponse.includes('user') || lowercaseResponse.includes('adoption')) {
            metrics.push('user_adoption');
        }
        if (lowercaseResponse.includes('time') || lowercaseResponse.includes('speed')) {
            metrics.push('performance');
        }
        if (lowercaseResponse.includes('error') || lowercaseResponse.includes('reliability')) {
            metrics.push('reliability');
        }
        if (lowercaseResponse.includes('revenue') || lowercaseResponse.includes('cost')) {
            metrics.push('financial_impact');
        }

        return metrics.length > 0 ? metrics : ['general_success'];
    }

    /**
     * Extract MVP scope from response
     * @param {string} response - User response
     * @returns {Object} - MVP scope definition
     */
    extractScope(response) {
        const lowercaseResponse = response.toLowerCase();

        return {
            mustHaves: this.extractFeatureList(response, ['must', 'critical', 'essential', 'required']),
            niceToHaves: this.extractFeatureList(response, ['nice', 'would like', 'eventually', 'future']),
            complexity: lowercaseResponse.includes('simple') ? 'low' :
                       lowercaseResponse.includes('complex') ? 'high' : 'medium'
        };
    }

    /**
     * Extract feature list from response based on keywords
     * @param {string} response - User response
     * @param {Array} keywords - Keywords to look for
     * @returns {Array} - Array of features
     */
    extractFeatureList(response, keywords) {
        const features = [];
        const sentences = response.split(/[.!?;]/);

        sentences.forEach(sentence => {
            if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
                // Extract potential features from sentence
                const words = sentence.split(' ').filter(word => word.length > 3);
                if (words.length > 0) {
                    features.push(sentence.trim());
                }
            }
        });

        return features;
    }

    /**
     * Synthesize session results into structured insights
     * @param {Object} session - Session object
     * @param {Object} conversationResults - Conversation results
     * @param {Array} alternatives - Implementation alternatives
     * @param {Array} risks - Identified risks
     * @returns {Object} - Session synthesis
     */
    async synthesizeSession(session, conversationResults, alternatives, risks) {
        const synthesis = {
            feature: session.featureName,
            problemType: conversationResults.keyDecisions.problemType || 'feature_enhancement',
            targetUsers: conversationResults.keyDecisions.targetUsers || ['general_user'],
            technicalApproach: conversationResults.keyDecisions.technicalApproach || 'standard',
            successMetrics: conversationResults.keyDecisions.successMetrics || ['general_success'],
            mvpScope: conversationResults.keyDecisions.mvpScope || { complexity: 'medium' },

            recommendedAlternative: alternatives.find(alt => alt.recommended) || alternatives[0],
            alternativesConsidered: alternatives.length,

            highRisks: risks.filter(risk => risk.impact === 'high').length,
            totalRisks: risks.length,

            keyInsights: conversationResults.insights.filter(insight => insight.confidence > 0.7),
            totalQuestions: conversationResults.questions.length,

            sessionDuration: Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60), // minutes

            readinessScore: this.calculateReadinessScore(conversationResults, alternatives, risks)
        };

        session.synthesis = synthesis;
        session.completedAt = new Date().toISOString();

        return synthesis;
    }

    /**
     * Calculate readiness score for PRD creation
     * @param {Object} conversationResults - Conversation results
     * @param {Array} alternatives - Alternatives considered
     * @param {Array} risks - Identified risks
     * @returns {number} - Readiness score (0-100)
     */
    calculateReadinessScore(conversationResults, alternatives, risks) {
        let score = 0;

        // Question completion (40 points max)
        const questionCompletionRate = conversationResults.responses.length / conversationResults.questions.length;
        score += Math.round(questionCompletionRate * 40);

        // Decision clarity (30 points max)
        const decisions = conversationResults.keyDecisions;
        const decisionKeys = Object.keys(decisions);
        const decisionCompleteness = decisionKeys.length / 5; // Expecting ~5 key decision categories
        score += Math.round(decisionCompleteness * 30);

        // Alternative consideration (20 points max)
        if (alternatives.length >= 2) score += 20;
        else if (alternatives.length >= 1) score += 10;

        // Risk awareness (10 points max)
        if (risks.length >= 3) score += 10;
        else if (risks.length >= 1) score += 5;

        return Math.min(score, 100);
    }

    /**
     * Display session summary
     * @param {Object} synthesis - Session synthesis
     */
    displaySummary(synthesis) {
        console.log(`   • Problem Type: ${synthesis.problemType.replace('_', ' ')}`);
        console.log(`   • Target Users: ${synthesis.targetUsers.join(', ')}`);
        console.log(`   • Technical Approach: ${synthesis.technicalApproach}`);
        console.log(`   • Success Metrics: ${synthesis.successMetrics.join(', ')}`);
        console.log(`   • Alternatives Considered: ${synthesis.alternativesConsidered}`);
        console.log(`   • Risks Identified: ${synthesis.totalRisks} (${synthesis.highRisks} high-impact)`);
        console.log(`   • Key Insights: ${synthesis.keyInsights.length}`);
        console.log(`   • Readiness Score: ${synthesis.readinessScore}% for PRD creation`);
        console.log(`   • Session Duration: ${synthesis.sessionDuration} minutes`);
    }

    /**
     * Save session to persistent storage
     * @param {Object} session - Session object to save
     * @returns {Promise<void>}
     */
    async saveSession(session) {
        const filename = `${session.featureName.replace(/\s+/g, '-').toLowerCase()}-${session.id}.json`;
        const filepath = path.join(this.sessionDir, filename);

        await fs.writeFile(filepath, JSON.stringify(session, null, 2));

        // Also create a latest session symlink for easy PRD integration
        const latestPath = path.join(this.sessionDir, 'latest-session.json');
        try {
            await fs.unlink(latestPath);
        } catch (error) {
            // File doesn't exist, ignore
        }
        await fs.writeFile(latestPath, JSON.stringify(session, null, 2));

        console.log(`\n💾 Session saved: ${filename}`);
    }

    /**
     * Load previous session for feature
     * @param {string} featureName - Feature name
     * @returns {Promise<Object|null>} - Previous session or null
     */
    async loadPreviousSession(featureName) {
        try {
            const sessionFiles = await fs.readdir(this.sessionDir);
            const featureSlug = featureName.replace(/\s+/g, '-').toLowerCase();

            const matchingFiles = sessionFiles.filter(file =>
                file.startsWith(featureSlug) && file.endsWith('.json')
            );

            if (matchingFiles.length > 0) {
                // Get most recent session
                const latestFile = matchingFiles.sort().reverse()[0];
                const content = await fs.readFile(path.join(this.sessionDir, latestFile), 'utf8');
                return JSON.parse(content);
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Resume incomplete session
     * @param {Object} session - Previous session
     * @returns {Promise<Object>} - Resumed session results
     */
    async resumeSession(session) {
        console.log(`🔄 Resuming brainstorming session for: ${session.featureName}`);
        console.log(`   Previous session: ${session.responses.length}/${session.questions.length} questions answered`);

        // Continue from where we left off
        const remainingQuestions = session.questions.slice(session.responses.length);

        if (remainingQuestions.length === 0) {
            console.log('✅ Session was already complete');
            return { success: true, session, resumed: true };
        }

        // Continue conversation
        for (let i = 0; i < remainingQuestions.length; i++) {
            const question = remainingQuestions[i];
            const questionIndex = session.responses.length + i + 1;

            console.log(`\n${questionIndex}/${session.questions.length}: ${question.category.toUpperCase()}`);
            console.log(question.question);

            const response = await this.getUserInput();
            session.responses.push({
                questionId: question.id,
                question: question.question,
                response,
                category: question.category,
                timestamp: new Date().toISOString()
            });
        }

        // Complete the session
        const conversationResults = {
            questions: session.questions,
            responses: session.responses,
            insights: session.insights || [],
            keyDecisions: this.extractKeyDecisions(session.responses)
        };

        const alternatives = await this.suggestionEngine.generateAlternatives(
            session.featureName,
            conversationResults,
            session.context
        );

        const risks = await this.suggestionEngine.identifyRisks(
            session.featureName,
            conversationResults,
            session.context
        );

        const synthesis = await this.synthesizeSession(session, conversationResults, alternatives, risks);
        await this.saveSession(session);

        return { success: true, session, synthesis, resumed: true };
    }
}

module.exports = BrainstormCommand;