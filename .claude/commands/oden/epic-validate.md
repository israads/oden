---
allowed-tools: Bash, Read, Write, Task
description: Validar Epic para implementabilidad, dependencias y coherencia técnica - post-generación review automático
---

# Epic Validate - Technical Implementation Validation

Valida un Epic generado para implementabilidad técnica, dependencias correctas y coherencia arquitectural usando análisis especializado automático.

## Usage
```
/oden:epic-validate <feature_name>
```

## 🎯 Propósito: Implementation-Ready Epics

Después de generar un Epic con `/oden:epic`, este comando ejecuta **validación técnica automática** para asegurar:
- ✅ **Implementabilidad**: Tasks son técnicamente viables y bien definidas
- ✅ **Dependencies**: Dependencias correctas y no-circulares entre tasks
- ✅ **Architecture**: Coherente con technical-decisions.md existente
- ✅ **Parallelization**: Work streams optimizados para desarrollo paralelo
- ✅ **Testability**: Acceptance criteria son testables automáticamente

## Preflight Validation

1. **Epic exists**: Check `.claude/epics/$ARGUMENTS/epic.md` - if not found: "❌ Epic not found. Create first: /oden:epic $ARGUMENTS"
2. **PRD validation**: Check if PRD was validated (recommended but not required)
3. **Get datetime**: `date -u +"%Y-%m-%dT%H:%M:%SZ"` for validation timestamp

## Phase 1: Technical Viability Analysis 🔧

Launch specialized subagent for comprehensive technical analysis:

### 1.1 Technical Viability Auditor
```markdown
Launch subagent: backend-architect

Task: Comprehensive technical implementability analysis

Requirements:
- Read .claude/epics/$ARGUMENTS/epic.md completely
- Read docs/reference/technical-decisions.md for architectural constraints
- Analyze each work stream and task for technical viability:
  * Database changes are feasible with existing schema
  * API contracts are implementable with current stack
  * Frontend requirements align with chosen frameworks
  * File patterns don't conflict across streams
  * Agent assignments match task complexity

- Check task sizing accuracy (XS<2h, S=2-4h, M=4-8h, L=1-2d, XL=2-3d)
- Verify acceptance criteria are technically testable
- Identify unrealistic technical requirements
- Output structured technical viability report

Context: Epic must lead to successful parallel development
```

## Phase 2: Dependencies & Architecture Review 🏗️

Launch parallel analysis for dependencies and architectural coherence:

### 2.1 Dependency Validator
```markdown
Launch subagent: fullstack-developer

Task: Validate task dependencies and parallelization strategy

Requirements:
- Analyze all task dependencies in epic
- Detect circular dependencies between tasks/streams
- Verify parallel work streams don't create file conflicts
- Check dependency timing is realistic:
  * Data model tasks before API tasks
  * API tasks before UI tasks
  * Core features before advanced features

- Validate critical path makes sense
- Identify bottleneck tasks that block multiple streams
- Check if estimated effort aligns with dependencies
- Output dependency analysis with conflict resolution

Context: Parallel development must be efficient without conflicts
```

### 2.2 Architecture Coherence Checker
```markdown
Launch subagent: backend-architect

Task: Verify architectural coherence and best practices

Requirements:
- Read existing codebase patterns (if accessible)
- Compare epic architecture with technical-decisions.md
- Validate proposed data model changes:
  * Migration strategy is sound
  * New tables/fields align with existing schema
  * Relationships make sense
  * Indexes are properly planned

- Check API design follows existing patterns
- Verify frontend approach matches current architecture
- Identify deviations from established patterns
- Output architectural coherence report

Context: Epic should extend existing system, not rebuild it
```

## Phase 3: Testability & Quality Assessment 🧪

### 2.3 Testability Analyzer
```markdown
Launch subagent: test-engineer

Task: Assess epic testability and quality assurance readiness

Requirements:
- Review all acceptance criteria for testability
- Check if requirements can be automated:
  * Unit tests for business logic
  * Integration tests for API endpoints
  * UI tests for user workflows
  * Performance tests for non-functional requirements

- Identify missing test scenarios (edge cases, error handling)
- Verify test data requirements are defined
- Assess test environment needs
- Output testability report with test strategy recommendations

Context: Epic must produce testable, quality software
```

## Phase 4: Synthesis & Validation Report 📊

Main session synthesizes all analysis into actionable validation:

### Epic Validation Report Structure

Create `.claude/epics/$ARGUMENTS/epic-validation.md`:

```markdown
---
name: $ARGUMENTS-epic-validation
epic: $ARGUMENTS
validated_at: [Real datetime from system]
validation_status: [IMPLEMENTATION_READY|NEEDS_FIXES|MAJOR_REWORK]
technical_viability: [0-100]%
dependency_health: [0-100]%
architecture_coherence: [0-100]%
testability_score: [0-100]%
overall_readiness: [0-100]%
---

# Epic Validation Report: $ARGUMENTS

## 🎯 Implementation Readiness Summary

**Overall Assessment:** [IMPLEMENTATION_READY/NEEDS_FIXES/MAJOR_REWORK]
- Technical Viability: [score]% ([issue_count] technical concerns)
- Dependencies: [score]% ([conflict_count] dependency issues)
- Architecture: [score]% ([deviation_count] architectural concerns)
- Testability: [score]% ([gap_count] testing gaps)

**Recommendation:** [PROCEED_TO_TASKS/FIX_ISSUES/REDESIGN_EPIC]

## 🔧 Technical Viability Analysis

### ✅ Technically Sound Tasks
[From technical-auditor: tasks that are well-defined and implementable]

### ⚠️ Technical Concerns
[From technical-auditor: specific technical issues with solutions]

**Critical technical issues:**
- [ ] [technical issue 1 with specific resolution]
- [ ] [technical issue 2 with specific resolution]

### 📏 Task Sizing Assessment
| Task | Current Size | Recommended | Reason |
|------|-------------|-------------|---------|
| [task] | [size] | [new_size] | [justification] |

## 🔗 Dependency Analysis

### Dependency Graph Health
[From dependency-validator: overview of dependency structure]

### ❌ Dependency Conflicts
[From dependency-validator: circular dependencies, timing issues]

### 🚧 Parallelization Issues
[From dependency-validator: file conflicts, coordination problems]

**Critical dependency fixes:**
- [ ] [dependency issue 1 with specific fix]
- [ ] [dependency issue 2 with specific fix]

## 🏗️ Architectural Coherence

### ✅ Aligned with Existing Architecture
[From architecture-checker: what follows established patterns]

### ⚠️ Architectural Deviations
[From architecture-checker: deviations from technical-decisions.md]

### 💾 Data Model Validation
- Migration strategy: [SOUND/NEEDS_WORK/PROBLEMATIC]
- Schema changes: [COMPATIBLE/MINOR_ISSUES/BREAKING]
- Performance impact: [LOW/MEDIUM/HIGH]

**Architecture improvements needed:**
- [ ] [architectural issue 1 with specific change]
- [ ] [architectural issue 2 with specific change]

## 🧪 Testability Assessment

### Test Strategy Completeness
[From testability-analyzer: what testing is well-defined]

### Missing Test Coverage
[From testability-analyzer: test gaps that need addressing]

### Automation Readiness
- Unit tests: [READY/PARTIAL/NOT_READY]
- Integration tests: [READY/PARTIAL/NOT_READY]
- E2E tests: [READY/PARTIAL/NOT_READY]

**Testing improvements required:**
- [ ] [test gap 1 with specific test type needed]
- [ ] [test gap 2 with specific test type needed]

## 🔄 Recommended Actions

### If IMPLEMENTATION_READY (Score ≥85%)
✅ Epic ready for task creation and development
→ Next: `/oden:tasks $ARGUMENTS`

### If NEEDS_FIXES (Score 60-84%)
⚠️ Address specific issues before development
→ Fix technical issues: `/oden:epic-fix $ARGUMENTS`
→ Re-validate: `/oden:epic-validate $ARGUMENTS`

### If MAJOR_REWORK (Score <60%)
❌ Significant epic redesign required
→ Redesign epic: `/oden:epic $ARGUMENTS --redesign`
→ Consider splitting into smaller epics

## 🚀 Implementation Confidence Metrics

### Development Risk Assessment
- **Technical Risk**: [LOW/MEDIUM/HIGH]
- **Dependency Risk**: [LOW/MEDIUM/HIGH]
- **Architecture Risk**: [LOW/MEDIUM/HIGH]
- **Testing Risk**: [LOW/MEDIUM/HIGH]

### Estimated Success Probability
- **On-time delivery**: [XX]%
- **Meeting all requirements**: [XX]%
- **No major rework needed**: [XX]%

### Critical Success Factors
- [ ] [success factor 1 - how to ensure]
- [ ] [success factor 2 - how to ensure]
```

## Auto-Improvement Integration

If validation finds common fixable issues:

### Auto-Fixable Epic Issues
- ✅ Task sizing adjustments based on complexity analysis
- ✅ Dependency ordering optimization
- ✅ File pattern conflicts resolution
- ✅ Missing acceptance criteria addition
- ✅ Agent assignment optimization

```bash
if [[ $overall_readiness -lt 85 && $auto_fixable_issues -gt 0 ]]; then
  echo ""
  echo "🔧 Auto-fix available for $auto_fixable_issues epic issues"
  echo ""
  echo "Apply automatic improvements? [Y/n]: "
  read apply_fixes
  if [[ "$apply_fixes" != "n" ]]; then
    # Launch epic auto-fix subagent
  fi
fi
```

## Quality Gates for Development

### Minimum Standards for IMPLEMENTATION_READY
- Technical Viability ≥85%: All tasks are implementable
- Dependencies ≥80%: No circular dependencies, logical flow
- Architecture ≥85%: Aligns with existing technical decisions
- Testability ≥80%: Acceptance criteria are testable
- Overall ≥85%: Ready for parallel development

### Development Blockers
- Circular dependencies: Block task creation
- Technical impossibilities: Force epic redesign
- Major architectural conflicts: Require technical decision review

## Success Output

```
🔍 Epic Validation Complete: .claude/epics/$ARGUMENTS/epic-validation.md

📊 Implementation Readiness:
  Overall Score: [XX]% ([STATUS])

  Technical Viability: [XX]%
  └─ [X] tasks viable, [Y] technical concerns

  Dependencies: [XX]%
  └─ [X] dependency issues, [Y] parallelization conflicts

  Architecture: [XX]%
  └─ [X] aligned decisions, [Y] deviations found

  Testability: [XX]%
  └─ [X] test gaps, [Y] automation-ready

🎯 Recommendation: [PROCEED_TO_TASKS|FIX_ISSUES|REDESIGN_EPIC]

🚀 Development Confidence:
  On-time delivery probability: [XX]%
  Technical risk level: [LOW/MEDIUM/HIGH]

Next Steps:
  [If READY]: Run `/oden:tasks $ARGUMENTS` to create tasks
  [If FIXES]: Address issues and re-validate
  [If REWORK]: Consider epic redesign

📋 Validation artifacts:
  - Full report: .claude/epics/$ARGUMENTS/epic-validation.md
  - Auto-fix available: [Y/N] ([count] issues fixable)
  - Critical issues: [count] requiring manual attention
```

## Integration with Development Pipeline

### From /oden:epic
Add to end of Epic generation:
```bash
echo ""
echo "🔍 Running automatic technical validation..."
/oden:epic-validate $ARGUMENTS
```

### From /oden:tasks
Block task creation if epic validation failed:
```bash
validation_file=".claude/epics/$ARGUMENTS/epic-validation.md"
if [ -f "$validation_file" ]; then
  status=$(grep '^validation_status:' "$validation_file" | cut -d: -f2 | tr -d ' ')
  if [ "$status" = "MAJOR_REWORK" ]; then
    echo "❌ Epic validation failed. Fix issues first: /oden:epic-validate $ARGUMENTS"
    exit 1
  fi
fi
```

### From /oden:work
Check epic validation before starting development:
```bash
# If no validation exists, auto-run it
validation_file=".claude/epics/$EPIC_NAME/epic-validation.md"
if [ ! -f "$validation_file" ]; then
  echo "🔍 No validation found. Running epic validation..."
  /oden:epic-validate $EPIC_NAME
fi
```

---

**Critical**: This ensures every Epic is technically sound and development-ready before costly implementation work begins, preventing architectural issues and development bottlenecks.