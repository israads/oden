const fs = require('fs-extra');
const path = require('path');
const EnhancedQuestions = require('../prd/enhanced-questions');
const ContextAdapter = require('../prd/context-adapter');

class PRDCommand {
    constructor() {
        this.enhancedQuestions = new EnhancedQuestions();
        this.contextAdapter = new ContextAdapter();
    }

    async execute(args, tools) {
        const featureName = args[0];

        // Preflight validation
        if (!featureName) {
            throw new Error('Usage: /oden:prd <feature_name>');
        }

        if (!this.isValidFeatureName(featureName)) {
            throw new Error('Feature name must be kebab-case. Examples: user-auth, payment-v2');
        }

        const prdPath = `.claude/prds/${featureName}.md`;
        if (await fs.pathExists(prdPath)) {
            // In real implementation, would prompt user for overwrite
            console.log(`PRD already exists: ${prdPath}`);
            return;
        }

        await fs.ensureDir('.claude/prds');

        try {
            // Phase 1: Parallel Research
            console.log('🔍 Phase 1: Launching parallel research...');
            const researchResults = await this.conductParallelResearch(featureName, tools);

            // Phase 2: Enhanced Brainstorming
            console.log('💡 Phase 2: Conducting enhanced brainstorming...');
            const brainstormResults = await this.conductEnhancedBrainstorming(featureName, researchResults, tools);

            // Phase 3: PRD Assembly
            console.log('📋 Phase 3: Assembling comprehensive PRD...');
            await this.assemblePRD(featureName, researchResults, brainstormResults);

            return this.generateSuccessOutput(featureName, researchResults, brainstormResults);

        } catch (error) {
            console.error('❌ PRD creation failed:', error.message);
            throw error;
        }
    }

    isValidFeatureName(name) {
        return /^[a-z][a-z0-9-]*$/.test(name);
    }

    async conductParallelResearch(featureName, tools) {
        // Launch three research subagents in parallel using Task tool
        const [competitiveResults, contextResults, domainResults] = await Promise.all([
            this.launchCompetitiveResearch(featureName, tools),
            this.launchContextAnalysis(featureName, tools),
            this.launchDomainResearch(featureName, tools)
        ]);

        return {
            competitive: competitiveResults,
            context: contextResults,
            domain: domainResults
        };
    }

    async launchCompetitiveResearch(featureName, tools) {
        // Use Task tool to launch competitive-researcher subagent
        const prompt = `
Research competitive landscape for: ${featureName}

Requirements:
- Find and analyze 3-5 relevant competitors
- Document their approach, user flows, key features
- Identify gaps, opportunities, and differentiation points
- Research industry best practices and standards
- Note pricing models, user feedback, and success metrics
- Output: Competitive analysis with actionable insights

Focus on practical implementation lessons, not just feature lists.
        `;

        const result = await tools.Task({
            description: `Competitive research for ${featureName}`,
            subagent_type: "search-specialist",
            prompt: prompt.trim()
        });

        return this.parseResearchResults(result, 'competitive');
    }

    async launchContextAnalysis(featureName, tools) {
        const prompt = `
Analyze existing project context for: ${featureName}

Requirements:
- Read docs/reference/technical-decisions.md for stack/architecture constraints
- Scan .claude/prds/ for related features and potential overlaps
- Read project CLAUDE.md for conventions and methodologies
- Identify existing technical patterns to leverage
- Check for integration points with existing features
- Output: Project context summary with technical constraints

Ensure new PRD aligns with existing technical and product strategy.
        `;

        const result = await tools.Task({
            description: `Context analysis for ${featureName}`,
            subagent_type: "technical-researcher",
            prompt: prompt.trim()
        });

        return this.parseResearchResults(result, 'context');
    }

    async launchDomainResearch(featureName, tools) {
        const prompt = `
Research market trends and user needs for: ${featureName}

Requirements:
- Research market size, trends, and growth for domain
- Identify target user personas and their pain points
- Find industry benchmarks and success metrics
- Research regulatory/compliance requirements if applicable
- Identify technical challenges and solutions in the domain
- Output: Market research with user insights and success criteria

Ground PRD in real market data and user needs.
        `;

        const result = await tools.Task({
            description: `Domain research for ${featureName}`,
            subagent_type: "data-analyst",
            prompt: prompt.trim()
        });

        return this.parseResearchResults(result, 'domain');
    }

    parseResearchResults(result, type) {
        // Extract key insights from subagent research results
        // In real implementation, would parse structured output
        return {
            type,
            insights: result?.insights || [],
            recommendations: result?.recommendations || [],
            data: result?.data || {},
            summary: result?.summary || `${type} research completed`
        };
    }

    async conductEnhancedBrainstorming(featureName, researchResults, tools) {
        // Use enhanced question system to generate contextual questions
        const projectContext = await this.contextAdapter.analyzeProject();
        const questions = await this.enhancedQuestions.generateContextualQuestions(
            featureName,
            projectContext,
            researchResults
        );

        console.log(`📝 Generated ${questions.length} contextual questions based on research findings`);

        // Launch brainstorming subagent with enhanced questions
        const brainstormPrompt = this.buildBrainstormPrompt(featureName, researchResults, questions);

        const result = await tools.Task({
            description: `Enhanced brainstorming for ${featureName}`,
            subagent_type: "prd-interviewer",
            prompt: brainstormPrompt
        });

        return {
            questions: questions,
            responses: result?.responses || {},
            insights: result?.insights || [],
            decisions: result?.decisions || {},
            userStories: result?.userStories || [],
            successCriteria: result?.successCriteria || []
        };
    }

    buildBrainstormPrompt(featureName, researchResults, questions) {
        return `
You are conducting an enhanced brainstorming session for: **${featureName}**

## Research Context:
### Competitive Landscape:
${researchResults.competitive.summary}

### Technical Context:
${researchResults.context.summary}

### Market Research:
${researchResults.domain.summary}

## Enhanced Contextual Questions:

${questions.map((q, i) => `
**${i + 1}. ${q.question}**
Context: ${q.context}
Priority: ${q.priority}
${q.options ? `Options:\n${q.options.map(opt => `- ${opt}`).join('\n')}` : ''}
`).join('\n')}

## Instructions:
- Ask these questions in an interactive, conversational way
- Reference specific research findings when relevant
- Focus on decisions that research couldn't fully answer
- Capture detailed responses for PRD assembly
- Generate user stories based on responses
- Define measurable success criteria

## Output Format:
Provide structured responses including:
- User personas (informed by domain research)
- Problem statements (backed by competitive analysis)
- Feature requirements (considering technical constraints)
- Success metrics (using industry benchmarks)
- User stories with acceptance criteria

Context: Use research insights to validate and enhance all brainstorming outputs.
        `;
    }

    async assemblePRD(featureName, researchResults, brainstormResults) {
        const currentDate = new Date().toISOString();

        const prdContent = this.generatePRDContent(featureName, currentDate, researchResults, brainstormResults);

        await fs.writeFile(`.claude/prds/${featureName}.md`, prdContent);
        console.log(`✅ PRD created: .claude/prds/${featureName}.md`);
    }

    generatePRDContent(featureName, currentDate, research, brainstorm) {
        return `---
name: ${featureName}
description: ${brainstorm.decisions.oneLine || 'Feature description from brainstorming'}
status: backlog
created: ${currentDate}
competitive_analysis: true
market_research: true
enhanced_questions: true
subagents_used: competitive-researcher, context-analyzer, domain-researcher, prd-interviewer
---

# PRD: ${featureName}

## 📊 Executive Summary
${brainstorm.decisions.executiveSummary || 'Value proposition and brief overview based on research and brainstorming'}

## 🎯 Problem Statement
${brainstorm.decisions.problemStatement || 'What problem, why now, evidence from market research'}

### Market Context
${research.domain.summary}

### Competitive Landscape
${research.competitive.summary}

## 👥 User Stories & Personas

### Primary Personas
${brainstorm.userStories.map(story => `
**${story.persona}**
- ${story.description}
- Pain Points: ${story.painPoints?.join(', ') || 'N/A'}
- Goals: ${story.goals?.join(', ') || 'N/A'}
`).join('\n')}

### User Journeys
${brainstorm.userStories.map(story => `
**${story.title}**
As a ${story.persona}, I want ${story.want} so that ${story.benefit}

*Acceptance Criteria:*
${story.acceptanceCriteria?.map(ac => `- ${ac}`).join('\n') || '- Criteria to be defined'}
`).join('\n')}

## ⚙️ Requirements

### Functional Requirements
${brainstorm.decisions.functionalRequirements?.map(req => `- ${req}`).join('\n') || '- Core features with clear acceptance criteria'}

#### Inspired by Competitive Analysis:
${research.competitive.insights?.map(insight => `- ${insight}`).join('\n') || '- Features/patterns learned from competitive research'}

#### Technical Integration Points:
${research.context.insights?.map(insight => `- ${insight}`).join('\n') || '- How this connects to existing system'}

### Non-Functional Requirements
${brainstorm.decisions.nonFunctionalRequirements?.map(req => `- ${req}`).join('\n') || '- Performance, security, scalability, accessibility'}

#### Industry Standards:
${research.domain.insights?.map(insight => `- ${insight}`).join('\n') || '- Benchmarks from market research'}

#### Technical Constraints:
${research.context.recommendations?.map(rec => `- ${rec}`).join('\n') || '- Stack limitations, existing patterns'}

## 📈 Success Criteria
${brainstorm.successCriteria?.map(criteria => `- ${criteria}`).join('\n') || '- Measurable KPIs from market research + brainstorming'}

### Industry Benchmarks:
${research.domain.data.benchmarks?.map(bench => `- ${bench}`).join('\n') || '- What "good" looks like'}

### Business Metrics:
- Revenue targets: ${brainstorm.decisions.revenueTarget || 'To be defined'}
- User adoption: ${brainstorm.decisions.adoptionTarget || 'To be defined'}
- Engagement: ${brainstorm.decisions.engagementTarget || 'To be defined'}

### Technical Metrics:
- Performance: ${brainstorm.decisions.performanceTarget || 'To be defined'}
- Reliability: ${brainstorm.decisions.reliabilityTarget || '99.9% uptime'}
- Scalability: ${brainstorm.decisions.scalabilityTarget || 'To be defined'}

## 🚧 Constraints & Assumptions

### Technical Constraints:
${research.context.recommendations?.filter(r => r.includes('constraint')).join('\n- ') || '- Stack, architecture, integration limitations'}

### Market Constraints:
${research.domain.insights?.filter(i => i.includes('constraint') || i.includes('regulation')).join('\n- ') || '- Regulatory, competitive, timeline factors'}

### Resource Constraints:
${brainstorm.decisions.resourceConstraints?.join('\n- ') || '- Budget, timeline, team limitations'}

## ❌ Out of Scope
${brainstorm.decisions.outOfScope?.join('\n- ') || '- What we explicitly won\'t build'}

### Competitive Features We're Skipping:
${research.competitive.insights?.filter(i => i.includes('skip') || i.includes('avoid')).join('\n- ') || '- Features competitors have that we\'re intentionally not building'}

### Future Considerations:
${brainstorm.decisions.futureConsiderations?.join('\n- ') || '- Features that might be added in later versions'}

## 🔗 Dependencies

### Internal Dependencies:
${research.context.insights?.filter(i => i.includes('dependency')).join('\n- ') || '- Other PRDs, shared systems, technical components'}

### External Dependencies:
${brainstorm.decisions.externalDependencies?.join('\n- ') || '- Third-party services, APIs, data sources'}

## 💡 Research Insights

### Competitive Intelligence:
${research.competitive.insights?.join('\n- ') || '- Key learnings from competitive analysis'}

### Market Opportunities:
${research.domain.insights?.join('\n- ') || '- Specific opportunities identified in domain research'}

### Technical Considerations:
${research.context.insights?.join('\n- ') || '- Architecture insights from context analysis'}

### Enhanced Question Insights:
${brainstorm.questions?.map(q => `- **${q.question}**: ${q.rationale || 'Contextual insight driving this question'}`).join('\n') || '- Insights from enhanced questioning system'}

## 📋 Next Steps
1. Review PRD with stakeholders for completeness
2. Create technical epic: \`/oden:epic ${featureName}\`
3. Begin implementation planning
`;
    }

    generateSuccessOutput(featureName, research, brainstorm) {
        return `
🎉 PRD created with comprehensive research: .claude/prds/${featureName}.md

📊 Research Summary:
  Phase 1: Competitive + Context + Domain research (parallel) ✅
  Phase 2: Enhanced brainstorming with ${brainstorm.questions.length} contextual questions ✅
  Phase 3: Research-informed PRD assembly ✅

🔍 Research Insights Applied:
  - Competitive analysis: ${research.competitive.insights?.length || 0} competitors analyzed
  - Market research: ${research.domain.insights?.length || 0} trends identified
  - Technical context: ${research.context.insights?.length || 0} integration points found
  - Enhanced questions: ${brainstorm.questions.length} targeted questions based on research

📋 PRD Summary:
  - Problem: ${brainstorm.decisions?.problemStatement || 'Defined from brainstorming'}
  - Users: ${brainstorm.userStories?.length || 0} personas from domain research
  - Requirements: ${brainstorm.decisions?.functionalRequirements?.length || 0} functional + ${brainstorm.decisions?.nonFunctionalRequirements?.length || 0} non-functional
  - Success metrics: ${brainstorm.successCriteria?.length || 0} KPIs defined
  - Differentiation: Competitive advantages identified

💡 Enhanced Question System:
  - Context-aware: Questions adapted to project framework and domain
  - Research-informed: Questions leverage competitive and market analysis
  - Priority-based: High-priority questions focus brainstorming effort
  - Follow-up enabled: Dynamic question flow based on responses

Next Steps:
  1. Review PRD for stakeholder alignment
  2. Run: /oden:epic ${featureName} (convert to technical implementation plan)
  3. Share competitive insights with product team
        `;
    }
}

module.exports = PRDCommand;