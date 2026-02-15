---
allowed-tools: Bash, Read, Write, Task
description: Descomponer Epic en tasks individuales usando subagentes especializados - optimizado para contexto
---

# Tasks - Epic to Individual Tasks Decomposition with Orchestrated Subagents

Descompone un Epic en tasks/issues individuales usando **orquestación inteligente de subagentes** para máxima granularidad y contexto optimizado.

## Usage
```
/oden:tasks <feature_name>
```

## 🔄 New Architecture: Specialized Task Decomposition

### Problema Resuelto
- ❌ **Antes**: Integrado en `/oden:epic` → sesión gigante + context overload
- ✅ **Ahora**: Comando separado con subagentes especializados en descomposición

### Arquitectura de 3 Fases

```
PHASE 1: Analysis (Single) 🟢
└─ epic-analyzer → Deep analysis of existing epic structure

PHASE 2: Decomposition (Parallel) 🔵
├─ task-creator → Convert work streams to detailed tasks
└─ dependency-analyzer → Detect task dependencies and conflicts

PHASE 3: Assembly (Main Session) 🟡
└─ tasks-orchestrator → Create task files + GitHub mapping
```

## Preflight (Quick Validation)

1. **Feature name**: If not provided, show: "Usage: /oden:tasks <feature_name>"
2. **Epic exists**: Check `.claude/epics/$ARGUMENTS/epic.md` - if not found: "Epic not found. Create first: /oden:epic $ARGUMENTS"
3. **Epic status**: Must have work streams defined
4. **Tasks directory**: Create `.claude/epics/$ARGUMENTS/tasks/` if needed

## Phase 1: Epic Deep Analysis 🔍

Launch specialized subagent to analyze epic structure:

### 1.1 Epic Analyzer
```markdown
Launch subagent: technical-researcher

Task: Deep analysis of epic for task decomposition

Requirements:
- Read .claude/epics/$ARGUMENTS/epic.md completely
- Extract all work streams with their tasks
- Identify task sizes, dependencies, file patterns
- Analyze acceptance criteria and technical requirements
- Map tasks to appropriate agent types
- Output structured epic analysis for task creation

Context: Focus on actionable task breakdown, not strategy
```

## Phase 2: Parallel Task Creation 🛠️

Use epic analysis to create detailed individual tasks:

### 2.1 Task Creator
```markdown
Launch subagent: fullstack-developer

Task: Convert work streams into individual task files

Input:
- Epic analysis with work streams and tasks
- Technical requirements and acceptance criteria

Requirements:
- Create detailed task file for each task in epic
- Include specific acceptance criteria, file patterns, agent assignments
- Add technical specifications and implementation guidance
- Define clear scope boundaries and edge cases
- Generate task frontmatter with sizing and dependencies
- Output: Individual task files ready for implementation

Context: Tasks must be immediately actionable by assigned agent types
```

### 2.2 Dependency Analyzer
```markdown
Launch subagent: backend-architect

Task: Analyze task dependencies and file conflicts

Input:
- Epic analysis results
- Task definitions from task creator

Requirements:
- Detect dependencies between tasks (data flow, API contracts, etc.)
- Identify potential file conflicts between parallel tasks
- Create dependency graph with critical path
- Recommend task execution order for optimal parallelization
- Flag tasks that must be sequential vs. parallel
- Output: Dependency mapping and execution recommendations

Context: Optimize for maximum parallelization while avoiding conflicts
```

## Phase 3: Task Files Assembly 📁

Main session creates final task structure and GitHub integration:

### Task File Structure

Create individual files in `.claude/epics/$ARGUMENTS/tasks/`:

```
.claude/epics/$ARGUMENTS/tasks/
├── 001-database-schema.md
├── 002-api-endpoints.md
├── 003-ui-components.md
├── 004-integration-tests.md
├── dependencies.json
└── github-mapping.json
```

### Individual Task File Template

```markdown
---
task_id: 001
name: database-schema
epic: $ARGUMENTS
status: pending
size: M (4-8h)
agent_type: backend-architect
depends_on: []
blocks: [002, 003]
files: ["src/models/", "migrations/", "src/types/"]
created: [Real datetime: date -u +"%Y-%m-%dT%H:%M:%SZ"]
---

# Task: [Descriptive Task Name]

## 🎯 Objective
[Clear 1-2 sentence description of what this task accomplishes]

## 📋 Acceptance Criteria
[From epic analysis - specific, testable criteria]
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Specific deliverable 3]

## 🏗️ Technical Specifications
[From task creator - detailed implementation guidance]

### Data Model Changes
[If applicable - specific schema changes, migrations needed]

### API Contracts
[If applicable - specific endpoints, request/response formats]

### UI Components
[If applicable - specific components, props, state management]

### Files to Modify/Create
[Specific file paths and what changes are needed]
- `src/models/User.ts` - Add new fields for authentication
- `migrations/003_add_auth_tables.sql` - Create auth tables
- `src/types/auth.ts` - TypeScript types for auth system

## 🔗 Dependencies
[From dependency analyzer]

### Depends On (Must complete first):
[Tasks that must finish before this one can start]

### Blocks (This task blocks):
[Tasks that cannot start until this one completes]

### Parallel Capable:
[Tasks that can run simultaneously with this one]

## 🧪 Testing Requirements
[Specific testing needs for this task]
- [ ] Unit tests for [specific functionality]
- [ ] Integration tests for [specific flows]
- [ ] Manual testing checklist

## 📝 Implementation Notes
[From task creator - helpful guidance for the assigned agent]
- Follow existing patterns in `src/models/` for consistency
- Use existing database connection utilities
- Reference `src/types/common.ts` for shared type patterns

## ⚠️ Potential Issues
[From dependency analyzer - known risks or complications]
- Risk: Database migration may conflict with existing data
- Mitigation: Run migration in transaction, add rollback script

## 🎯 Definition of Done
- [ ] All acceptance criteria met
- [ ] Code follows project standards
- [ ] Tests written and passing
- [ ] Documentation updated if needed
- [ ] PR created and reviewed
```

### Dependencies Mapping File

Create `.claude/epics/$ARGUMENTS/tasks/dependencies.json`:

```json
{
  "epic": "$ARGUMENTS",
  "total_tasks": 8,
  "critical_path_days": 12,
  "parallel_streams": 3,
  "dependencies": {
    "001": {
      "depends_on": [],
      "blocks": ["002", "003", "006"],
      "parallel_with": ["004"],
      "agent_type": "backend-architect"
    },
    "002": {
      "depends_on": ["001"],
      "blocks": ["005", "006"],
      "parallel_with": ["003"],
      "agent_type": "fullstack-developer"
    }
  },
  "execution_plan": [
    {
      "phase": 1,
      "parallel_tasks": ["001", "004"],
      "estimated_days": 4
    },
    {
      "phase": 2,
      "parallel_tasks": ["002", "003"],
      "estimated_days": 4
    }
  ]
}
```

### GitHub Integration Mapping

Create `.claude/epics/$ARGUMENTS/tasks/github-mapping.json`:

```json
{
  "epic_name": "$ARGUMENTS",
  "epic_file": ".claude/epics/$ARGUMENTS/epic.md",
  "tasks": [
    {
      "task_id": "001",
      "file": "001-database-schema.md",
      "github_issue": null,
      "title": "Database Schema for Authentication System",
      "labels": ["backend", "database", "epic:$ARGUMENTS"],
      "assignee": null,
      "milestone": "$ARGUMENTS Epic"
    }
  ],
  "sync_status": "pending",
  "last_sync": null
}
```

## 📊 Quality Checks & Output

Before completion, verify:
- [ ] Each epic task has corresponding task file
- [ ] All task files have complete acceptance criteria
- [ ] Dependencies are logical and acyclic
- [ ] File patterns don't conflict between parallel tasks
- [ ] Agent types appropriately assigned
- [ ] Total effort aligns with epic estimates
- [ ] GitHub mapping ready for sync

## Success Output

```
🎉 Tasks decomposed with optimized context: .claude/epics/$ARGUMENTS/tasks/

📊 Orchestration Summary:
  Phase 1: Epic analysis completed ✅
  Phase 2: Task creation + dependency analysis (parallel) ✅
  Phase 3: Task files + mapping created ✅

📋 Tasks Summary:
  - [total] individual task files created
  - [streams] work streams with [parallel] parallel tasks
  - Critical path: [days] days
  - Agent types: [backend: X, frontend: Y, fullstack: Z]

🗂️ Files Created:
  - .claude/epics/$ARGUMENTS/tasks/*.md ([count] task files)
  - .claude/epics/$ARGUMENTS/tasks/dependencies.json
  - .claude/epics/$ARGUMENTS/tasks/github-mapping.json

💡 Context Optimization:
  - Epic analysis: specialized subagent for deep understanding
  - Task creation: parallel decomposition + dependency analysis
  - Ready for immediate GitHub sync and agent assignment

Next Steps:
  1. Review task files for completeness and accuracy
  2. Run: /oden:sync $ARGUMENTS (push tasks to GitHub Issues)
  3. Use /oden:work with specific task IDs for implementation
```

## 🔧 Implementation Notes

### Error Handling
- If epic analysis fails → verify epic completeness, suggest /oden:epic regeneration
- If task creation generates >15 tasks → suggest epic splitting
- If circular dependencies detected → flag and require manual resolution

### Context Preservation
- Epic analysis saves complete structure understanding
- Task creation preserves technical context across all tasks
- Dependency analysis maintains consistency across work streams

### Agent Type Assignment Logic
```yaml
Database/Schema tasks: backend-architect
API endpoints: fullstack-developer
UI components: frontend-developer
Integration: fullstack-developer
Testing: test-engineer
DevOps/Deploy: devops-engineer
Complex business logic: backend-architect
```

## 🚀 Benefits Achieved

1. **Granular Control**: Each task is individually actionable
2. **Context Efficiency**: Specialized subagents focus on specific aspects
3. **Dependency Clarity**: Clear understanding of task relationships
4. **Parallel Optimization**: Maximum parallelization without conflicts
5. **Agent Specialization**: Tasks matched to optimal agent types
6. **GitHub Ready**: Direct integration mapping for issue sync
7. **Recovery**: Individual task failure doesn't affect others

---

**Important**: This command creates the bridge between epic planning and actual development execution through /oden:work and /oden:sync.