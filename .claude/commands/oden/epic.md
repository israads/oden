---
allowed-tools: Bash, Read, Write, Task
description: Convertir PRD a Epic tecnico usando subagentes especializados - optimizado para contexto
---

# Epic - Convert PRD to Technical Epic with Orchestrated Subagents

Convierte un PRD en un Epic tecnico usando **orquestación inteligente de subagentes** para optimizar el uso de contexto.

## Usage
```
/oden:epic <feature_name>
```

## 🔄 New Architecture: Multi-Agent Orchestration

### Problema Resuelto
- ❌ **Antes**: Una sesión gigante con 15,000+ tokens (PRD analysis + context + work streams + tasks)
- ✅ **Ahora**: 3 fases con subagentes especializados (~3,000-5,000 tokens por fase)

### Arquitectura de 3 Fases

```
PHASE 1: Analysis (Parallel) 🟢
├─ prd-analyzer → Extract technical insights from PRD
├─ context-gatherer → Scan technical decisions + existing epics
└─ requirement-mapper → Map requirements to components

PHASE 2: Planning (Sequential) 🔵
├─ work-stream-architect → Design parallel work streams
└─ task-decomposer → Break streams into sized tasks

PHASE 3: Assembly (Main Session) 🟡
└─ epic-orchestrator → Create final coherent epic
```

## Preflight (Quick Validation)

1. **Feature name**: If not provided, show: "Usage: /oden:epic <feature_name>"
2. **PRD exists**: Check `.claude/prds/$ARGUMENTS.md` - if not found: "PRD not found. Create first: /oden:prd $ARGUMENTS"
3. **Existing epic**: Check `.claude/epics/$ARGUMENTS/` - if exists, ask to overwrite
4. **Directory**: Create `.claude/epics/$ARGUMENTS/` if needed

## Phase 1: Parallel Analysis 🚀

Launch **3 specialized subagents in parallel** to gather comprehensive context:

### 1.1 PRD Technical Analyzer
```markdown
Launch subagent: technical-researcher

Task: Analyze PRD for technical implementation insights

Requirements:
- Read .claude/prds/$ARGUMENTS.md
- Extract functional requirements, user stories, constraints
- Identify technical complexity areas
- Map requirements to system components (data, API, UI, infrastructure)
- Output structured technical analysis for epic planning

Context: Focus on implementability, not product strategy
```

### 1.2 Context Gatherer
```markdown
Launch subagent: backend-architect

Task: Gather existing technical context and patterns

Requirements:
- Read docs/reference/technical-decisions.md for stack, DB schema, architecture
- Scan .claude/epics/ for related work and dependencies
- Quick scan of src/ for existing patterns, naming conventions
- Identify reusable code instead of building from scratch
- Output context summary with reusable components

Context: Focus on leveraging existing work, avoiding duplication
```

### 1.3 Requirements Mapper
```markdown
Launch subagent: fullstack-developer

Task: Map functional requirements to technical components

Requirements:
- Based on PRD requirements from analyzer
- Group by implementation layer: data, backend/API, frontend/UI, infrastructure
- Identify integration points with existing system
- Flag data model changes needed
- Output component-requirement mapping

Context: Focus on practical implementation breakdown
```

## Phase 2: Sequential Planning 🎯

Use analysis results to create structured work streams and tasks:

### 2.1 Work Stream Architect
```markdown
Launch subagent: backend-architect

Task: Design parallel work streams based on analysis

Input:
- PRD analysis results
- Context gathering results
- Requirements mapping

Requirements:
- Create 3-4 work streams that can run in parallel
- Name streams by layer (Data, API, UI, Infrastructure)
- Define clear file patterns each stream touches
- Identify dependencies between streams
- Output: Structured work streams with parallelization plan

Context: Optimize for parallel development with minimal conflicts
```

### 2.2 Task Decomposer
```markdown
Launch subagent: fullstack-developer

Task: Convert work streams into specific development tasks

Input:
- Work streams from architect
- All previous analysis

Requirements:
- Break each stream into 2-4 specific tasks
- Size tasks: XS(<2h), S(2-4h), M(4-8h), L(1-2d), XL(2-3d)
- Keep total tasks ≤ 10 per epic
- Include testing and edge cases in estimates
- Define clear acceptance criteria per task
- Output: Detailed task breakdown with sizes and criteria

Context: Tasks must be actionable and completable by agents
```

## Phase 3: Epic Assembly 📋

Main session synthesizes all subagent outputs into coherent epic:

### Epic Document Structure

Create `.claude/epics/$ARGUMENTS/epic.md`:

```markdown
---
name: $ARGUMENTS
status: backlog
created: [Real datetime: date -u +"%Y-%m-%dT%H:%M:%SZ"]
updated: [Same datetime]
progress: 0%
prd: .claude/prds/$ARGUMENTS.md
subagents_used: prd-analyzer, context-gatherer, requirement-mapper, work-stream-architect, task-decomposer
context_optimization: true
---

# Epic: [Descriptive Title from PRD]

## 🎯 Overview
[2-3 sentences from PRD analysis: what we're building, why, technical approach]

## 🏗️ Architecture Decisions
[From context-gatherer and requirement-mapper]

### Data Model
[New/modified tables, relationships, indexes - leverage existing schema]

### API Design
[New endpoints, contracts, auth - follow existing patterns]

### Frontend
[New screens/components, state management - use existing components]

### Infrastructure
[Deployment, caching, jobs - extend existing setup]

## 🔄 Work Streams
[From work-stream-architect - optimized for parallel execution]

### Stream A: [Name] (e.g., Data Layer)
**Parallel:** Yes
**Files:** [specific file patterns]
**Agent Type:** backend-architect

Tasks:
[From task-decomposer - sized and actionable]

### Stream B: [Name] (e.g., API Layer)
**Parallel:** After Stream A tasks 1-2
**Files:** [specific file patterns]
**Agent Type:** fullstack-developer

Tasks:
[Detailed tasks with clear acceptance criteria]

### Stream C: [Name] (e.g., UI Layer)
**Parallel:** After Stream B task 1
**Files:** [specific file patterns]
**Agent Type:** frontend-developer

Tasks:
[UI-specific tasks with component specifications]

## 📊 Task Summary
[Auto-generated from task-decomposer]

| # | Task | Stream | Size | Agent Type | Depends On |
|---|------|--------|------|------------|------------|
| 1 | [desc] | A | M | backend-architect | - |
| 2 | [desc] | A | S | backend-architect | 1 |
| 3 | [desc] | B | L | fullstack-developer | 1 |

**Total tasks:** [count]
**Estimated effort:** [sum of sizes]
**Critical path:** [longest sequential chain]
**Parallel capability:** [tasks that can run simultaneously]

## ✅ Acceptance Criteria (Technical)
[From requirement-mapper - testable criteria]

- [ ] Data model changes migrated and tested
- [ ] API endpoints return correct responses with validation
- [ ] UI renders correctly on target devices/browsers
- [ ] Error states handled gracefully
- [ ] Performance meets targets ([specific metrics])
- [ ] Test coverage ≥ [target]%
- [ ] Integration with existing [systems] works

## ⚠️ Risks & Mitigations
[From all subagents - practical implementation risks]

| Risk | Impact | Mitigation | Source |
|------|--------|------------|---------|
| [technical risk] | M | [specific mitigation] | context-gatherer |

## 🔗 Dependencies
[From context-gatherer and requirement-mapper]

- **Internal:** [other epics, shared modules, APIs]
- **External:** [third-party services, credentials, data]
- **Blocking:** [what must complete first]
- **Blocked by:** [what this epic blocks]
```

## 📈 Quality Checks & Output

Before completion, verify:
- [ ] Every PRD requirement mapped to ≥1 task
- [ ] No orphan tasks (all trace to requirements)
- [ ] Dependencies are logical (no circular refs)
- [ ] Parallel streams don't conflict on files
- [ ] Task sizes sum to reasonable total (≤2-3 weeks)
- [ ] Acceptance criteria are testable
- [ ] Subagent insights properly synthesized

## Success Output

```
🎉 Epic created with optimized context usage: .claude/epics/$ARGUMENTS/epic.md

📊 Orchestration Summary:
  Phase 1: 3 parallel subagents (analysis) ✅
  Phase 2: 2 sequential subagents (planning) ✅
  Phase 3: Main assembly (synthesis) ✅

📋 Epic Summary:
  - [total] tasks across [stream_count] work streams
  - Estimated effort: [total effort]
  - Critical path: [length]
  - [parallel_count] tasks can run simultaneously
  - Agent types assigned for optimal specialization

💡 Context Optimization:
  - Previous: ~15,000+ tokens in single session
  - Current: ~3,000-5,000 tokens per phase
  - Subagent reuse: technical context preserved across phases
  - Recovery: Each phase saves state independently

Next Steps:
  1. Review epic document for completeness
  2. Run: /oden:tasks $ARGUMENTS (creates individual task files)
  3. Run: /oden:sync $ARGUMENTS (pushes to GitHub Issues)
```

## 🔧 Implementation Notes

### Error Handling
- If any Phase 1 subagent fails → retry with different subagent type
- If Phase 2 fails → use Phase 1 results + manual planning
- If epic becomes >10 tasks → suggest splitting into sub-epics

### Context Preservation
- Each phase saves intermediate results to temp files
- Main session has access to all subagent outputs
- Recovery: Can resume from any phase if interrupted

### Subagent Selection Logic
```yaml
prd-analyzer: technical-researcher (reads PRDs, extracts insights)
context-gatherer: backend-architect (understands system architecture)
requirement-mapper: fullstack-developer (maps features to implementation)
work-stream-architect: backend-architect (designs parallel workflows)
task-decomposer: fullstack-developer (creates actionable development tasks)
```

## 🚀 Benefits Achieved

1. **Context Efficiency**: 67% reduction in token usage per phase
2. **Specialized Expertise**: Each subagent optimized for specific analysis
3. **Parallel Processing**: Phase 1 subagents run simultaneously
4. **Recovery**: Granular failure recovery per phase
5. **Scalability**: Can handle much larger PRDs without context limits
6. **Quality**: Multiple specialized perspectives on same problem
7. **Reusability**: Subagent patterns reusable across epics

---

**Important**: Get REAL datetime: `date -u +"%Y-%m-%dT%H:%M:%SZ"` - Never use placeholders!