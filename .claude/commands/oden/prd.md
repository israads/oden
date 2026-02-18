---
allowed-tools: Bash, Read, Write, Task
description: Crear PRD con brainstorming inteligente usando subagentes especializados - optimizado para contexto
---

# PRD - Product Requirements Document with Orchestrated Subagents

Crea un PRD completo con **investigación inteligente y brainstorming optimizado** usando subagentes especializados para máximo contexto.

## Usage
```
/oden:prd <feature_name>
```

## 🔄 New Architecture: Multi-Agent Research & Brainstorming

### Problema Resuelto
- ❌ **Antes**: Una sesión hace research + brainstorming + writing (10,000+ tokens)
- ✅ **Ahora**: 3 fases con investigación paralela + brainstorming contextual

### Arquitectura de 3 Fases

```
PHASE 1: Research (Parallel) 🟢
├─ competitive-researcher → Investigate 3-5 competitors
├─ context-analyzer → Scan existing PRDs + technical decisions
└─ domain-researcher → Market research + user insights

PHASE 2: Brainstorming (Interactive) 🔵
└─ prd-interviewer → Smart questions based on research

PHASE 3: Assembly (Main Session) 🟡
└─ prd-assembler → Create coherent PRD document
```

## Preflight (Quick Validation)

1. **Feature name**: Must be kebab-case (lowercase, numbers, hyphens, starts with letter)
   - If invalid: "Feature name must be kebab-case. Examples: user-auth, payment-v2"
2. **Existing PRD**: Check `.claude/prds/$ARGUMENTS.md` - if exists, ask to overwrite
3. **Directory**: Create `.claude/prds/` if needed

## Phase 1: Parallel Research 🔍

Launch **3 specialized subagents in parallel** for comprehensive market and technical research:

### 1.1 Competitive Researcher
```markdown
Launch subagent: search-specialist

Task: Research competitive landscape and best practices

Requirements:
- Find and analyze 3-5 relevant competitors for $ARGUMENTS feature
- Document their approach, user flows, key features
- Identify gaps, opportunities, and differentiation points
- Research industry best practices and standards
- Note pricing models, user feedback, and success metrics
- Output: Competitive analysis with actionable insights

Context: Focus on practical implementation lessons, not just feature lists
```

### 1.2 Context Analyzer
```markdown
Launch subagent: technical-researcher

Task: Analyze existing project context and related work

Requirements:
- Read docs/reference/technical-decisions.md for stack/architecture constraints
- Scan .claude/prds/ for related features and potential overlaps
- Read project CLAUDE.md for conventions and methodologies
- Identify existing technical patterns to leverage
- Check for integration points with existing features
- Output: Project context summary with technical constraints

Context: Ensure new PRD aligns with existing technical and product strategy
```

### 1.3 Domain Researcher
```markdown
Launch subagent: data-analyst

Task: Research market trends, user needs, and success metrics

Requirements:
- Research market size, trends, and growth for $ARGUMENTS domain
- Identify target user personas and their pain points
- Find industry benchmarks and success metrics
- Research regulatory/compliance requirements if applicable
- Identify technical challenges and solutions in the domain
- Output: Market research with user insights and success criteria

Context: Ground PRD in real market data and user needs
```

## Phase 2: Enhanced Brainstorming Session 🧠

**NEW: Enhanced Question System Integration** - Leverages intelligent question generation with research context:

### 2.1 Context-Aware Question Generation

The enhanced question system analyzes research results and project context to generate 5-8 highly targeted questions:

```javascript
// Enhanced question generation process
const projectContext = await contextAdapter.analyzeProject();
const questions = await enhancedQuestions.generateContextualQuestions(
    featureName,
    projectContext,
    researchResults
);

// Question categories adapted based on research:
// - Business value (informed by market research)
// - User impact (from competitive analysis)
// - Technical feasibility (from context analysis)
// - Success metrics (using industry benchmarks)
// - Integration requirements (from existing system analysis)
```

### 2.2 Intelligent Question Adaptation

Questions are automatically customized based on research findings:

**Framework-Specific Questions:**
- For React/Next.js: "How should this feature leverage SSR/SSG for SEO?"
- For mobile apps: "Which native device capabilities are critical for this feature?"

**Domain-Specific Questions:**
- For payment features: "What compliance standards (PCI DSS) must we meet?"
- For auth features: "What security standards and MFA requirements apply?"

**Research-Informed Questions:**
- "Competitor X achieves 40% conversion with [specific pattern]. Should we adopt this approach?"
- "Market research shows [trend] growing 60% YoY. How do we position against this?"
- "Your existing [technical stack] constrains us to [limitation]. What's the best workaround?"

### 2.3 Advanced Brainstorming Interviewer
```markdown
You are conducting an enhanced brainstorming session for: **$ARGUMENTS**

## Research Context Available:
- Competitive landscape: [insights with specific competitor examples]
- Technical context: [framework, constraints, integration points]
- Market research: [trends, benchmarks, opportunities]

## Enhanced Contextual Questions:
[5-8 intelligently generated questions based on:]
- Project framework detection (React vs Vue vs mobile)
- Feature category analysis (auth vs payments vs analytics)
- Competitive gap identification
- Technical constraint mapping
- Industry benchmark integration

## Question Priority System:
- **High Priority (3-4 questions)**: Critical decisions affecting architecture
- **Medium Priority (2-3 questions)**: Important but flexible decisions
- **Contextual (1-2 questions)**: Unique to this project's situation

## Interactive Flow:
- Present questions in priority order
- Generate follow-up questions based on responses
- Reference specific research findings in follow-ups
- Validate responses against competitive benchmarks

Context: Use enhanced question engine + research to generate the most targeted, valuable brainstorming session possible
```

## Phase 3: PRD Assembly 📋

Main session synthesizes all research and brainstorming into comprehensive PRD:

### PRD Document Structure

Create `.claude/prds/$ARGUMENTS.md`:

```markdown
---
name: $ARGUMENTS
description: [One-line summary from brainstorming]
status: backlog
created: [Real datetime: date -u +"%Y-%m-%dT%H:%M:%SZ"]
competitive_analysis: true
market_research: true
subagents_used: competitive-researcher, context-analyzer, domain-researcher, prd-interviewer
---

# PRD: $ARGUMENTS

## 📊 Executive Summary
[Value proposition and brief overview based on research and brainstorming]

## 🎯 Problem Statement
[What problem, why now, evidence from market research]

### Market Context
[From domain-researcher: market size, trends, growth]

### Competitive Landscape
[From competitive-researcher: key players, gaps, opportunities]

## 👥 User Stories & Personas
[From brainstorming session informed by domain research]

### Primary Personas
[Based on domain research and brainstorming]

### User Journeys
[Informed by competitive analysis of successful flows]

### Acceptance Criteria
[Specific, testable criteria per story]

## ⚙️ Requirements

### Functional Requirements
[Core features with clear acceptance criteria]

#### Inspired by Competitive Analysis:
[Features/patterns learned from competitive research]

#### Technical Integration Points:
[From context-analyzer: how this connects to existing system]

### Non-Functional Requirements
[Performance, security, scalability, accessibility]

#### Industry Standards:
[Benchmarks from market research]

#### Technical Constraints:
[From context-analyzer: stack limitations, existing patterns]

## 📈 Success Criteria
[Measurable KPIs from market research + brainstorming]

### Industry Benchmarks:
[From domain research: what "good" looks like]

### Business Metrics:
[Revenue, user adoption, engagement targets]

### Technical Metrics:
[Performance, reliability, scalability targets]

## 🚧 Constraints & Assumptions

### Technical Constraints:
[From context-analyzer: stack, architecture, integration limitations]

### Market Constraints:
[From domain research: regulatory, competitive, timeline factors]

### Resource Constraints:
[From brainstorming: budget, timeline, team limitations]

## ❌ Out of Scope
[What we explicitly won't build - informed by competitive analysis]

### Competitive Features We're Skipping:
[Features competitors have that we're intentionally not building]

### Future Considerations:
[Features that might be added in later versions]

## 🔗 Dependencies

### Internal Dependencies:
[From context-analyzer: other PRDs, shared systems, technical components]

### External Dependencies:
[Third-party services, APIs, data sources identified in research]

## 💡 Research Insights

### Competitive Intelligence:
[Key learnings from competitive analysis that influenced decisions]

### Market Opportunities:
[Specific opportunities identified in domain research]

### Technical Considerations:
[Architecture insights from context analysis]

## 📋 Next Steps
1. Review PRD with stakeholders for completeness
2. Create technical epic: `/oden:epic $ARGUMENTS`
3. Begin implementation planning
```

## 📊 Quality Checks & Output

Before completion, verify:
- [ ] All research insights properly incorporated
- [ ] User stories have acceptance criteria based on competitive learnings
- [ ] Success criteria use industry benchmarks from research
- [ ] Technical constraints from existing system acknowledged
- [ ] No research findings ignored or contradicted
- [ ] Competitive differentiation clearly articulated

## Success Output

```
🎉 PRD created with comprehensive research: .claude/prds/$ARGUMENTS.md

📊 Research Summary:
  Phase 1: Competitive + Context + Domain research (parallel) ✅
  Phase 2: Smart brainstorming with research context ✅
  Phase 3: Research-informed PRD assembly ✅

🔍 Research Insights Applied:
  - Competitive analysis: [X] competitors analyzed
  - Market research: [industry trends, user personas, benchmarks]
  - Technical context: [integration points, constraints identified]
  - Smart questions: [Y] targeted questions based on research

📋 PRD Summary:
  - Problem: [one sentence from brainstorming]
  - Users: [personas from domain research]
  - Requirements: [count] functional + [count] non-functional
  - Success metrics: [key benchmarks from market research]
  - Differentiation: [competitive advantage identified]

💡 Context Optimization:
  - Previous: Single session research + brainstorming (~10,000 tokens)
  - Current: Parallel research + focused brainstorming (~4,000 tokens total)
  - Quality: Multiple specialized perspectives + market intelligence
  - Decisions: Research-backed rather than assumption-based

Next Steps:
  1. Review PRD for stakeholder alignment
  2. Run: /oden:epic $ARGUMENTS (convert to technical implementation plan)
  3. Share competitive insights with product team
```

## 🔧 Implementation Notes

### Error Handling
- If competitive research finds <3 competitors → expand search terms or adjacent markets
- If no technical context available → proceed with generic technical considerations
- If domain research limited → focus on user interviews and surveys in brainstorming

### Research Quality Gates
- Competitive analysis must find ≥3 relevant examples
- Market research should include quantitative data where available
- Technical context should identify ≥1 integration point or constraint

### Brainstorming Optimization
- Questions adapt based on research quality and findings
- If research is comprehensive, focus questions on decisions and tradeoffs
- If research is limited, ask broader exploratory questions

### Subagent Selection Logic
```yaml
competitive-researcher: search-specialist (expert web research, comparative analysis)
context-analyzer: technical-researcher (reads technical docs, understands architecture)
domain-researcher: data-analyst (market research, quantitative analysis, benchmarks)
prd-interviewer: general-purpose (adaptable, good at asking smart questions)
```

## 🚀 Benefits Achieved

1. **Research Quality**: Professional competitive and market analysis
2. **Context Efficiency**: Parallel research vs sequential brainstorming
3. **Enhanced Question Intelligence**: 5-8 context-aware questions vs 3-5 generic ones
4. **Framework-Specific Adaptation**: Questions adapt to React/Vue/mobile/backend contexts
5. **Domain Expertise Integration**: Payment/auth/analytics domain-specific questions
6. **Decision Quality**: Market data + competitive intelligence backing decisions
7. **Technical Alignment**: PRD considers existing architecture from day 1
8. **Scalable Process**: Can handle complex domains with deep research needs
9. **Reusable Insights**: Research can inform future related PRDs
10. **Priority-Based Flow**: High/medium/contextual question prioritization
11. **Follow-Up Intelligence**: Dynamic follow-up questions based on responses

---

**Important**: This creates research-backed PRDs rather than assumption-based documents, leading to better technical epics and implementation decisions.