# Oden Forge Workflow - Guía Completa paso a paso

Flujo completo de trabajo con Oden Forge desde la idea inicial hasta el deployment, con validación automática en cada fase.

## 🎯 Overview del Workflow

```
IDEA → PRD → VALIDATION → EPIC → VALIDATION → TASKS → SYNC → DEVELOPMENT → QA → DEPLOY
  1      2        3        4        5         6      7          8        9     10
```

**Tiempo total estimado:** 10-20 semanas dependiendo del scope
- **Pre-Development (Fases 1-7):** 1-3 semanas
- **Development (Fases 8-9):** 8-18 semanas
- **Deployment (Fase 10):** 1 semana

## 📋 Fase 1: Product Requirements Document (PRD)

### 1.1 Crear PRD con Research Inteligente
```bash
/oden:prd feature-name
```

**Lo que sucede internamente:**
1. **Research paralelo** (3 subagentes simultáneos):
   - Competitive researcher → Analiza 3-5 competidores
   - Context analyzer → Revisa technical-decisions.md existente
   - Domain researcher → Market trends y user insights

2. **Smart brainstorming** (1 subagente contextual):
   - PRD interviewer → Preguntas inteligentes basadas en research

3. **Assembly** (sesión principal):
   - Sintetiza research + brainstorming → PRD comprehensive

**Output esperado:**
- `.claude/prds/feature-name.md` (2000-4000 líneas)
- Research insights aplicados
- User stories con acceptance criteria
- Success metrics con industry benchmarks
- Technical constraints identificados

### 1.2 Qué Contiene un PRD de Calidad

#### Executive Summary
- Value proposition clara
- Brief overview basado en research
- Market opportunity quantified

#### Problem Statement
- What problem, why now
- Evidence from market research
- Competitive landscape gaps identified

#### User Stories & Personas
- ≥3 personas basadas en domain research
- ≥5 user stories formato: "As a [persona], I want [feature] so that [benefit]"
- User journeys informados por competitive analysis

#### Requirements
- **Functional**: ≥5 core features con acceptance criteria
- **Non-Functional**: Performance, security, scalability targets
- **Technical Integration**: Cómo conecta con existing system

#### Success Criteria
- ≥3 measurable KPIs
- Industry benchmarks from research
- Business metrics + Technical metrics

## 📊 Fase 2: PRD Validation (Automática)

```bash
/oden:prd-validate feature-name
```

**Validation automática con 3 subagentes paralelos:**

### 2.1 Completeness Analysis
- Check ALL required sections present
- Assess depth vs surface-level coverage
- Flag missing or underdeveloped areas
- **Target**: ≥80% completeness

### 2.2 Consistency Check
- Detect internal contradictions
- Verify alignment across sections
- Check technical feasibility vs constraints
- **Target**: ≥85% consistency

### 2.3 Quality Assessment
- Evaluate against professional standards
- Check acceptance criteria testability
- Verify measurable success metrics
- **Target**: ≥80% quality

**Quality Gate:** **≥85% overall score** para continuar

### 2.4 Si Validation Falla

#### Score 60-84% (REVIEW_NEEDED)
```bash
# Fix común issues automáticamente
/oden:prd-validate feature-name --auto-fix

# O fix manual de issues específicos
/oden:prd-fix feature-name

# Re-validate después de fixes
/oden:prd-validate feature-name
```

#### Score <60% (MAJOR_GAPS)
```bash
# Major revision needed
/oden:prd feature-name --revise

# O break into smaller PRDs
/oden:prd feature-name-auth
/oden:prd feature-name-payments
```

## 🏗️ Fase 3: Technical Epic Creation

```bash
/oden:epic feature-name
```

**Orquestación de 3 fases con subagentes especializados:**

### 3.1 Analysis Phase (3 subagentes paralelos)
- **PRD Analyzer**: Extract technical insights
- **Context Gatherer**: Scan technical-decisions.md + existing code
- **Requirements Mapper**: Map features to technical components

### 3.2 Planning Phase (2 subagentes secuenciales)
- **Work Stream Architect**: Design 3-4 parallel streams
- **Task Decomposer**: Break streams into sized tasks (XS/S/M/L/XL)

### 3.3 Assembly Phase (sesión principal)
- Synthesize all subagent outputs
- Create coherent technical epic
- Define agent assignments per stream

**Output esperado:**
- `.claude/epics/feature-name/epic.md`
- 3-4 work streams optimized for parallel development
- 6-12 tasks con sizing y dependencies
- Architecture decisions coherentes
- Clear acceptance criteria por task

## 🔧 Fase 4: Epic Validation (Técnica)

```bash
/oden:epic-validate feature-name
```

**Validation técnica con 3 subagentes especializados:**

### 4.1 Technical Viability Analysis
- Check cada task es implementable
- Verify task sizing accuracy
- Assess technical complexity
- **Target**: ≥85% viability

### 4.2 Dependencies & Architecture Review
- Validate task dependencies (no circular)
- Check parallel streams don't conflict
- Verify alignment con technical-decisions.md
- **Target**: ≥80% dependency health + ≥85% architecture

### 4.3 Testability Assessment
- Review acceptance criteria testability
- Check automation readiness
- Identify test gaps
- **Target**: ≥80% testability

**Quality Gate:** **≥85% overall readiness** para development

### 4.4 Si Epic Validation Falla

#### Score 60-84% (NEEDS_FIXES)
```bash
# Fix specific technical issues
/oden:epic-fix feature-name

# Re-validate
/oden:epic-validate feature-name
```

#### Score <60% (MAJOR_REWORK)
```bash
# Redesign epic
/oden:epic feature-name --redesign

# O split into smaller epics
```

## 📝 Fase 5: Task Decomposition

```bash
/oden:tasks feature-name
```

**Task creation con 2 subagentes:**

### 5.1 Individual Task Creation
- Convert work streams → detailed task files
- Add specific acceptance criteria
- Define file patterns per task
- Assign appropriate agent types

### 5.2 Dependency & Conflict Analysis
- Detect task-level dependencies
- Identify potential file conflicts
- Optimize parallel execution plan

**Output esperado:**
- `.claude/epics/feature-name/tasks/` directory
- Individual `.md` file per task
- Dependency mapping
- Agent assignment optimization

## 🔗 Fase 6: GitHub Synchronization

```bash
/oden:sync feature-name
```

**Sync with GitHub Issues:**

### 6.1 Create GitHub Issues
- One issue per task
- Include acceptance criteria
- Add appropriate labels
- Assign to project/milestone

### 6.2 Link Local Tasks
- Map local task files ↔ GitHub issues
- Create bidirectional tracking
- Enable progress sync

**Output esperado:**
- GitHub issues created
- Local-remote mapping established
- Project board updated

## 🚀 Fase 7: Orchestrated Development

```bash
/oden:work epic/feature-name --mode auto
```

### 7.1 Complexity Analysis & Mode Selection

#### Automatic Complexity Detection
```bash
# System analyzes:
- Total files affected (1-2 = simple, 3-5 = medium, 6+ = complex)
- Dependencies between tasks
- Agent coordination needed
```

#### Mode Options
- **Auto**: Oden decides everything (recommended)
- **Config**: You configure agents and streams
- **Smart**: Oden suggests, you approve

### 7.2 Branch & Workspace Setup
```bash
# Auto-create branch
git checkout -b epic/feature-name
git push -u origin epic/feature-name

# Setup tracking
# .claude/epics/feature-name/work-session.md created
```

### 7.3 Agent Orchestration

#### Single Agent (1-2 files)
```bash
# One specialized agent handles everything
Task: "Complete feature-name implementation"
Agent: [best_match_agent]
```

#### Parallel Agents (3-5 files)
```bash
# Two agents work simultaneously
Task 1: "Database + API layer"
Agent: backend-architect

Task 2: "Frontend + UI components"
Agent: frontend-developer
```

#### Teams Coordination (6+ files)
```bash
# Multiple agents with coordination
Stream 1: Database Layer (backend-architect)
Stream 2: API Layer (backend-architect)
Stream 3: Frontend Layer (frontend-developer)
Stream 4: Tests (test-engineer)

# Automatic dependency management
# Stream 2 waits for Stream 1 completion
# Stream 3 waits for Stream 2 API contracts
```

### 7.4 Development Monitoring

#### Real-time Progress
```
Work session active: epic/feature-name

Agents:
  Stream 1: Database (backend-architect) .... ✅ completed
  Stream 2: API (backend-architect) ......... 🔄 working
  Stream 3: Frontend (frontend-developer) ... ⏳ waiting
  Stream 4: Tests (test-engineer) ........... ⏳ waiting

Commits: 8 total
  latest: "Issue #42: Add payment endpoints validation"

Progress: 1/4 streams completed, 2 active
```

#### Automatic Coordination
- File conflict detection
- Dependency-aware task scheduling
- Progress updates in work-session.md
- Commit frequency monitoring

## ✅ Fase 8: Quality Assurance (Automática)

### 8.1 Automated Testing
```bash
# Auto-detect test framework and run
npm test        # Node.js projects
go test ./...   # Go projects
cargo test      # Rust projects
pytest          # Python projects
```

**Si tests fallan:**
```bash
# Auto-launch debugger agent
Task: "Fix test failures"
Agent: debugger
Context: Test output analysis + common failure patterns
```

### 8.2 Code Review Automático
```bash
# Comprehensive code review
Task: "Review epic/feature-name changes"
Agent: code-reviewer
Checks: Security, performance, best practices, architecture compliance
```

**Review outcomes:**
- **APPROVE**: Ready for merge
- **APPROVE with warnings**: Merge with noted issues
- **REQUEST_CHANGES**: Critical issues must be fixed

### 8.3 Pull Request Creation
```bash
# Auto-create PR with analysis
gh pr create --title "Feature: feature-name" --body "
## Summary
[Generated from work-session analysis]

## Changes by Stream
### Database Layer
- [specific changes]

### API Layer
- [specific changes]

## Issues Addressed
- Closes #41
- Closes #42

## Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Code review: APPROVE

## Review Notes
[Any warnings from code review]
"
```

## 🎯 Fase 9: Deployment & Closure

### 9.1 Post-Merge Actions
```bash
# After PR merge
/oden:work epic/feature-name --complete

# Automatic actions:
# 1. Close related GitHub issues
# 2. Update epic progress to 100%
# 3. Move documentation to completed/
# 4. Clean up branch
```

### 9.2 Documentation Migration
```bash
# Move completed work
mv docs/development/current/feature-name docs/development/completed/
mv .claude/epics/feature-name/work-session.md docs/development/completed/feature-name/
```

### 9.3 Retrospective
```bash
/oden:daily  # Generates automatic retrospective
```

**Generated retrospective includes:**
- Development velocity analysis
- Quality metrics achieved
- Issues encountered and resolved
- Lessons learned for next epic
- Process improvement suggestions

## 📊 Quality Metrics Throughout Workflow

### Pre-Development Quality Gates
- **PRD Validation**: ≥85% (completeness + consistency + quality)
- **Epic Validation**: ≥85% (viability + dependencies + architecture)
- **Zero Critical Issues**: No contradictions or impossible requirements

### Development Quality Metrics
- **Test Coverage**: Minimum 80% for new features
- **Code Review**: Must pass APPROVE threshold
- **Performance**: No degradation from baseline
- **Security**: Zero critical security issues

### Post-Development Success Criteria
- **All Issues Closed**: 100% of GitHub issues resolved
- **Documentation Complete**: All specs implemented
- **Quality Targets Met**: Performance, security, functionality
- **Team Velocity**: On-time delivery within estimates

## 🚨 Error Handling & Recovery

### Common Issues & Solutions

#### PRD Validation Fails
```bash
# Common fixes:
- Add missing user personas
- Quantify vague success metrics
- Resolve requirement contradictions
- Add technical constraints section
```

#### Epic Validation Fails
```bash
# Common fixes:
- Correct task sizing (break down XL tasks)
- Resolve circular dependencies
- Align architecture with technical-decisions.md
- Add missing acceptance criteria
```

#### Development Agent Failures
```bash
# Recovery options:
1. Retry with same agent
2. Switch to different agent type
3. Manual intervention if needed
4. Continue other streams while fixing
```

#### Test Failures
```bash
# Auto-debug pipeline:
1. Auto-analyze test output
2. Launch debugger agent
3. Apply automatic fixes
4. Re-run tests
5. If still failing → manual intervention
```

### Workflow Recovery Points
- **After PRD**: Can restart from validation
- **After Epic**: Can modify tasks without rebuilding
- **During Development**: Can pause/resume work streams
- **Before Merge**: Can fix issues without losing progress

## 🎯 Success Indicators

### You're on the Right Track When:
- ✅ PRD validation score ≥85% on first try
- ✅ Epic validation shows ≥85% readiness
- ✅ Development agents work without conflicts
- ✅ Tests pass on first run after implementation
- ✅ Code review shows APPROVE status
- ✅ All GitHub issues close automatically

### Warning Signs:
- ⚠️ Multiple validation failures (PRD/Epic needs more work)
- ⚠️ Frequent agent conflicts (task decomposition issues)
- ⚠️ Test failures after completion (acceptance criteria problems)
- ⚠️ Code review REQUEST_CHANGES (quality issues)

## 📈 Workflow Optimization Tips

### For Faster Development:
1. **Invest in PRD quality** - Better PRDs = faster epics
2. **Validate early and often** - Catch issues before development
3. **Use auto mode** - Trust the orchestration system
4. **Keep tasks sized small** - XS/S tasks complete faster
5. **Run validation after each phase** - Don't skip quality gates

### For Higher Quality:
1. **Research competitors thoroughly** - Better solutions from market analysis
2. **Define acceptance criteria precisely** - Clearer implementation targets
3. **Use technical validation** - Prevent architecture issues
4. **Test continuously** - Catch issues early
5. **Review automatically** - Consistent quality standards

---

**🎯 El workflow Oden Forge garantiza que cada proyecto avance sistemáticamente desde idea hasta deployment con validación continua de calidad y implementación técnica sound.**