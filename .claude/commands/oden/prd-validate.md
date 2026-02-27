---
allowed-tools: Bash, Read, Write, Task
description: Validar PRD para completitud, contradicciones y calidad - post-generación review automático
---

# PRD Validate - Post-Generation Quality Assurance

Valida un PRD generado para completitud, contradicciones y calidad usando análisis especializado automático.

## Usage
```
/oden:prd-validate <feature_name>
```

## 🎯 Propósito: Calidad Enterprise

Después de generar un PRD con `/oden:prd`, este comando ejecuta **validación automática** para asegurar:
- ✅ **Completitud**: Todas las secciones críticas están presentes y desarrolladas
- ✅ **Consistencia**: No hay contradicciones entre secciones
- ✅ **Calidad**: Cumple estándares de PRDs profesionales
- ✅ **Implementabilidad**: Técnicamente viable según technical-decisions.md

## Preflight Validation

1. **PRD exists**: Check `.claude/prds/$ARGUMENTS.md` - if not found: "❌ PRD not found. Create first: /oden:prd $ARGUMENTS"
2. **Get datetime**: `date -u +"%Y-%m-%dT%H:%M:%SZ"` for validation timestamp

## Phase 1: Completeness Analysis 📋

Launch specialized subagent for comprehensive completeness check:

### 1.1 Completeness Auditor
```markdown
Launch subagent: technical-researcher

Task: Comprehensive PRD completeness analysis

Requirements:
- Read .claude/prds/$ARGUMENTS.md completely
- Check ALL required sections are present and non-trivial:
  * Problem Statement (>100 words with market context)
  * User Stories & Personas (≥3 user personas, ≥5 user stories)
  * Functional Requirements (≥5 core features with acceptance criteria)
  * Non-Functional Requirements (performance, security, scalability)
  * Success Criteria (≥3 measurable KPIs)
  * Dependencies (internal/external identified)
  * Out of Scope (explicit exclusions)

- Flag missing or underdeveloped sections
- Assess depth: surface-level vs comprehensive coverage
- Output structured completeness report with specific gaps

Context: PRD must be implementation-ready, not conceptual
```

## Phase 2: Consistency & Quality Review 🔍

Launch parallel analysis for consistency and technical viability:

### 2.1 Consistency Checker
```markdown
Launch subagent: backend-architect

Task: Detect contradictions and consistency issues

Requirements:
- Analyze entire PRD for internal contradictions
- Check alignment between:
  * Problem statement vs proposed solution
  * User stories vs functional requirements
  * Success criteria vs actual features
  * Constraints vs requirements
  * Technical dependencies vs proposed architecture

- Read docs/reference/technical-decisions.md (if exists)
- Verify PRD aligns with existing technical stack
- Flag any impossible/conflicting technical requirements
- Output contradiction report with specific conflicts

Context: Identify issues before implementation starts
```

### 2.2 Quality Assessor
```markdown
Launch subagent: fullstack-developer

Task: Assess PRD quality and implementability

Requirements:
- Evaluate PRD against professional standards:
  * Acceptance criteria are testable (GIVEN-WHEN-THEN format)
  * Requirements are specific and measurable
  * User stories follow proper format (As a... I want... So that...)
  * Success metrics are quantifiable and achievable
  * Dependencies are realistic and available

- Check for vague language ("user-friendly", "fast", "scalable")
- Verify technical feasibility of all features
- Assess if requirements can actually be implemented
- Output quality report with improvement recommendations

Context: PRD should guide implementation without ambiguity
```

## Phase 3: Synthesis & Action Plan 📊

Main session synthesizes all analysis into actionable improvements:

### Validation Report Structure

Create `.claude/prds/$ARGUMENTS-validation.md`:

```markdown
---
name: $ARGUMENTS-validation
prd: $ARGUMENTS
validated_at: [Real datetime from system]
validation_status: [PASS|REVIEW_NEEDED|MAJOR_GAPS]
completeness_score: [0-100]%
consistency_score: [0-100]%
quality_score: [0-100]%
overall_score: [0-100]%
---

# PRD Validation Report: $ARGUMENTS

## 🎯 Validation Summary

**Overall Assessment:** [PASS/REVIEW_NEEDED/MAJOR_GAPS]
- Completeness: [score]% ([missing_count] gaps found)
- Consistency: [score]% ([contradiction_count] issues found)
- Quality: [score]% ([quality_count] improvements needed)

**Recommendation:** [APPROVED_FOR_EPIC/NEEDS_REVISION/MAJOR_REWORK]

## 📋 Completeness Analysis

### ✅ Complete Sections
[From completeness-auditor: sections that are comprehensive]

### ❌ Missing/Underdeveloped Sections
[From completeness-auditor: specific gaps with required improvements]

**Critical gaps that block implementation:**
- [ ] [specific gap 1 with required action]
- [ ] [specific gap 2 with required action]

## ⚠️ Consistency Issues

### Internal Contradictions
[From consistency-checker: specific contradictions found]

### Technical Alignment Issues
[From consistency-checker: conflicts with existing technical decisions]

**Critical issues that need resolution:**
- [ ] [contradiction 1 with specific fix needed]
- [ ] [contradiction 2 with specific fix needed]

## 💡 Quality Improvements

### Language & Specificity
[From quality-assessor: vague language to make specific]

### Testability Issues
[From quality-assessor: acceptance criteria that need improvement]

### Implementation Clarity
[From quality-assessor: requirements that need clarification]

**High-impact improvements:**
- [ ] [improvement 1 with specific action]
- [ ] [improvement 2 with specific action]

## 🚀 Next Steps

### If PASS (Score ≥85%)
✅ PRD ready for implementation
→ Next: `/oden:epic $ARGUMENTS`

### If REVIEW_NEEDED (Score 60-84%)
⚠️ Address identified issues before proceeding
→ Fix gaps: `/oden:prd-fix $ARGUMENTS`
→ Re-validate: `/oden:prd-validate $ARGUMENTS`

### If MAJOR_GAPS (Score <60%)
❌ Significant rework required
→ Major revision: `/oden:prd $ARGUMENTS --revise`
→ Consider breaking into smaller PRDs
```

## Auto-Fix Integration

If validation finds common issues, offer automatic fixes:

### Auto-Fixable Issues
- ✅ Missing acceptance criteria templates
- ✅ User story format standardization
- ✅ Vague language replacement with specifics
- ✅ Success criteria quantification

```bash
if [[ $overall_score -lt 85 && $fixable_issues -gt 0 ]]; then
  echo ""
  echo "🔧 Auto-fix available for $fixable_issues common issues"
  echo ""
  echo "Apply automatic improvements? [Y/n]: "
  read apply_fixes
  if [[ "$apply_fixes" != "n" ]]; then
    # Launch auto-fix subagent
  fi
fi
```

## Quality Gates

### Minimum Standards for PASS
- Completeness ≥80%: All required sections present and developed
- Consistency ≥85%: No critical contradictions
- Quality ≥80%: Requirements are specific and testable
- Overall ≥85%: Ready for technical epic creation

### Escalation Triggers
- Score <60%: Recommend PRD rewrite
- >5 critical contradictions: Block epic creation
- Missing core sections: Force completion before proceeding

## Success Output

```
🔍 PRD Validation Complete: .claude/prds/$ARGUMENTS-validation.md

📊 Validation Results:
  Overall Score: [XX]% ([STATUS])

  Completeness: [XX]%
  └─ [X] sections complete, [Y] gaps found

  Consistency: [XX]%
  └─ [X] contradictions found, [Y] technical conflicts

  Quality: [XX]%
  └─ [X] improvements suggested, [Y] critical issues

🎯 Recommendation: [APPROVED_FOR_EPIC|NEEDS_REVISION|MAJOR_REWORK]

Next Steps:
  [If APPROVED]: Run `/oden:epic $ARGUMENTS` to proceed
  [If REVISION]: Fix issues and re-validate
  [If REWORK]: Consider `/oden:prd $ARGUMENTS --revise`

📋 Validation artifacts:
  - Full report: .claude/prds/$ARGUMENTS-validation.md
  - Auto-fix available: [Y/N] ([count] issues fixable)
  - Estimated fix time: [time estimate]
```

## Integration with Other Commands

### From /oden:prd
Add to end of PRD generation:
```bash
echo ""
echo "🔍 Running automatic validation..."
# Auto-run validation
/oden:prd-validate $ARGUMENTS
```

### From /oden:epic
Block epic creation if PRD validation failed:
```bash
validation_file=".claude/prds/$ARGUMENTS-validation.md"
if [ -f "$validation_file" ]; then
  status=$(grep '^validation_status:' "$validation_file" | cut -d: -f2 | tr -d ' ')
  if [ "$status" = "MAJOR_GAPS" ]; then
    echo "❌ PRD validation failed. Fix issues first: /oden:prd-validate $ARGUMENTS"
    exit 1
  fi
fi
```

## Error Handling

- If PRD file corrupted/unreadable → detailed error with recovery steps
- If subagents fail → fallback to basic structural checks
- If validation takes >5min → progress updates every 30s

---

**Critical**: This ensures every PRD meets enterprise standards before implementation begins, preventing costly rework during development phases.