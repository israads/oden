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

## Phase 2: Smart Brainstorming Session 💡

Use research results to conduct focused, intelligent brainstorming:

### 2.1 Contextual PRD Interviewer
```markdown
You are a product manager conducting a smart brainstorming session for: **$ARGUMENTS**

Based on the research phase results:
- Competitive landscape: [insights from competitive-researcher]
- Technical context: [constraints from context-analyzer]
- Market research: [trends from domain-researcher]

### Adaptive Smart Questions

Ask 3-5 focused questions that leverage research insights:

**If competitive analysis found gaps:**
- "Competitors X and Y both struggle with [specific issue]. How should we solve this differently?"

**If technical constraints exist:**
- "Given our [existing stack/architecture], what's the most feasible approach for [key feature]?"

**If market research shows trends:**
- "[Market trend] is growing 40% YoY. How do we position against this opportunity?"

**Core question areas (adapt based on research):**
- **Problem**: What specific user pain does this solve? (reference research findings)
- **Users**: Who benefits most? (use personas from domain research)
- **Scope**: What's MVP vs full vision? (informed by competitive analysis)
- **Constraints**: Timeline, budget, technical limitations? (from context analysis)
- **Success**: How do we measure this worked? (use industry benchmarks)

### Question Guidelines:
- Reference specific research findings in questions
- Don't ask about things already known from technical-decisions.md
- Focus on decisions that research couldn't answer
- Keep total questions to 3-5 for focused session

Context: Use research to ask smarter, more targeted questions
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

## 📊 Automatic Quality Validation

**CRITICAL**: Every PRD gets automatic validation for enterprise readiness.

After PRD creation, **automatically execute validation**:

```bash
echo ""
echo "🔍 Running automatic PRD validation for quality assurance..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Launch automatic validation
/oden:prd-validate $ARGUMENTS
```

### Quality Gates (Must Pass Before Epic Creation)

**Validation executes 3 parallel subagents:**
- ✅ **Completeness Auditor**: Checks all required sections are comprehensive
- ✅ **Consistency Checker**: Detects contradictions and technical conflicts
- ✅ **Quality Assessor**: Validates professional standards and testability

**Minimum Standards for PASS:**
- Completeness ≥80%: All sections present and developed
- Consistency ≥85%: No critical contradictions
- Quality ≥80%: Requirements specific and testable
- **Overall ≥85%**: Ready for technical epic creation

### If Validation Fails
```bash
# Score 60-84% (Review Needed)
echo "⚠️ PRD needs improvement. Running auto-fix..."
/oden:prd-validate $ARGUMENTS --auto-fix

# Score <60% (Major Gaps)
echo "❌ PRD requires significant rework"
echo "Consider: /oden:prd $ARGUMENTS --revise"
```

## Success Output

```
🎉 PRD Created & Validated: .claude/prds/$ARGUMENTS.md

📊 Research Summary:
  Phase 1: Competitive + Context + Domain research (parallel) ✅
  Phase 2: Smart brainstorming with research context ✅
  Phase 3: Research-informed PRD assembly ✅

🔍 Automatic Validation Results:
  Overall Score: [XX]% ([PASS/REVIEW_NEEDED/MAJOR_GAPS])
  └─ Completeness: [XX]% - [status]
  └─ Consistency: [XX]% - [status]
  └─ Quality: [XX]% - [status]

📋 PRD Summary:
  - Problem: [one sentence from brainstorming]
  - Users: [personas from domain research]
  - Requirements: [count] functional + [count] non-functional
  - Success metrics: [key benchmarks from market research]
  - Differentiation: [competitive advantage identified]

💡 Quality Assurance:
  - Enterprise-ready: [Y/N] (based on validation score)
  - Implementation-ready: [Y/N] (≥85% overall score)
  - Auto-fixes applied: [count] improvements
  - Critical issues: [count] requiring attention

🚀 Next Steps:
  [If PASS ≥85%]: ✅ Ready - Run `/oden:epic $ARGUMENTS`
  [If REVIEW]: ⚠️ Fix issues first - Run `/oden:prd-validate $ARGUMENTS`
  [If MAJOR_GAPS]: ❌ Rework needed - Consider `/oden:prd $ARGUMENTS --revise`

📋 Deliverables:
  - PRD document: .claude/prds/$ARGUMENTS.md
  - Validation report: .claude/prds/$ARGUMENTS-validation.md
  - Quality score: [XX]% enterprise readiness
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
3. **Smart Questions**: Research-informed rather than generic brainstorming
4. **Decision Quality**: Market data + competitive intelligence backing decisions
5. **Technical Alignment**: PRD considers existing architecture from day 1
6. **Scalable Process**: Can handle complex domains with deep research needs
7. **Reusable Insights**: Research can inform future related PRDs

---

**Important**: This creates research-backed PRDs rather than assumption-based documents, leading to better technical epics and implementation decisions.