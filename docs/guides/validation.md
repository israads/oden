# Sistema de Validación Automática - Oden Forge

Sistema completo de validación automática que garantiza calidad enterprise en cada fase del desarrollo, desde PRDs hasta implementación técnica.

## 🎯 Filosofía de Validación

> **"Validar automáticamente, corregir inmediatamente, proceder con confianza"**

### Problemas que Resuelve

**❌ Sin Validación:**
- PRDs incompletos que generan bugs
- Epics técnicamente imposibles
- Contradicciones descubiertas durante desarrollo
- Acceptance criteria no testeable
- Dependencias circulares que bloquean desarrollo
- Deuda técnica por arquitectura inconsistente

**✅ Con Validación Automática:**
- Documentos enterprise-ready antes de implementación
- Issues detectados y corregidos pre-desarrollo
- Confianza técnica del 85%+ antes de empezar
- Reducción del 70% en bugs post-implementación
- Desarrollo paralelo sin conflictos
- Arquitectura coherente desde día 1

## 📊 Sistema de Validación de 2 Niveles

### Nivel 1: PRD Validation (Product Level)
```bash
/oden:prd-validate feature-name
```
**Objetivo**: Asegurar PRDs completos, consistentes y de calidad profesional

### Nivel 2: Epic Validation (Technical Level)
```bash
/oden:epic-validate feature-name
```
**Objetivo**: Garantizar implementabilidad técnica y arquitectura coherente

## 🔍 PRD Validation - Product Requirements Quality

### Validation Pipeline (3 Subagentes Paralelos)

#### 1. Completeness Auditor (Technical Researcher)
**Verifica que todas las secciones críticas estén presentes y desarrolladas:**

##### Required Sections & Standards
- **Problem Statement**: >100 words con market context
- **User Stories & Personas**: ≥3 personas, ≥5 user stories format correcto
- **Functional Requirements**: ≥5 core features con acceptance criteria
- **Non-Functional Requirements**: Performance, security, scalability targets
- **Success Criteria**: ≥3 measurable KPIs con industry benchmarks
- **Dependencies**: Internal/external claramente identificadas
- **Out of Scope**: Explicit exclusions para evitar scope creep

##### Completeness Scoring
- **90-100%**: All sections comprehensive, ready for epic creation
- **80-89%**: Minor gaps, easy to fix
- **70-79%**: Several sections need development
- **<70%**: Major completeness issues

#### 2. Consistency Checker (Backend Architect)
**Detecta contradicciones internas y conflicts técnicos:**

##### Internal Consistency Checks
- Problem statement ↔ proposed solution alignment
- User stories ↔ functional requirements mapping
- Success criteria ↔ actual features coherence
- Constraints ↔ requirements compatibility
- Technical dependencies ↔ proposed architecture feasibility

##### Technical Alignment
- Reads `docs/reference/technical-decisions.md` (if exists)
- Verifies PRD aligns with existing tech stack
- Identifies impossible/conflicting technical requirements
- Checks integration feasibility with current system

##### Consistency Scoring
- **90-100%**: No contradictions found
- **85-89%**: Minor alignment issues
- **70-84%**: Several contradictions need resolution
- **<70%**: Major consistency problems

#### 3. Quality Assessor (Fullstack Developer)
**Evalúa contra professional standards y implementability:**

##### Professional Standards Checks
- **Acceptance Criteria Format**: GIVEN-WHEN-THEN structure
- **Requirements Specificity**: No vague language ("user-friendly", "fast")
- **User Stories Format**: "As a [persona], I want [feature] so that [benefit]"
- **Success Metrics**: Quantifiable and achievable targets
- **Dependencies**: Realistic and available resources

##### Implementation Readiness
- All requirements can actually be implemented
- Technical complexity is realistic
- Resource requirements are reasonable
- Timeline feasibility assessment

##### Quality Scoring
- **90-100%**: Professional-grade, implementation-ready
- **80-89%**: Minor quality improvements needed
- **70-79%**: Several quality issues to address
- **<70%**: Significant quality problems

### PRD Validation Output

#### Validation Report Structure
`.claude/prds/feature-name-validation.md`

```yaml
---
validation_status: PASS|REVIEW_NEEDED|MAJOR_GAPS
completeness_score: 85%
consistency_score: 90%
quality_score: 82%
overall_score: 86%
---

## Validation Summary
Overall: PASS (86% - Ready for Epic Creation)

## Critical Issues (Block Epic Creation)
- None found ✅

## Improvement Opportunities
- Add more specific success metrics (Quality)
- Clarify integration dependencies (Consistency)

## Auto-Fix Available
- 3 common issues can be fixed automatically
```

#### Quality Gates
- **PASS (≥85% overall)**: ✅ Ready for `/oden:epic feature-name`
- **REVIEW_NEEDED (60-84%)**: ⚠️ Fix issues first, then proceed
- **MAJOR_GAPS (<60%)**: ❌ Significant rework required

#### Auto-Fix Capabilities
```bash
/oden:prd-validate feature-name --auto-fix
```
**Can automatically fix:**
- Missing acceptance criteria templates
- User story format standardization
- Vague language → specific language replacement
- Success criteria quantification
- Dependency formatting

## 🔧 Epic Validation - Technical Implementation Readiness

### Technical Validation Pipeline (4 Subagentes Especializados)

#### 1. Technical Viability Auditor (Backend Architect)
**Analiza implementabilidad técnica de cada task:**

##### Technical Feasibility Checks
- Database changes feasible with existing schema
- API contracts implementable with current stack
- Frontend requirements align with chosen frameworks
- File patterns don't conflict across streams
- Agent assignments match task complexity

##### Task Sizing Accuracy
- **XS (<2h)**: Simple changes, bug fixes
- **S (2-4h)**: Small features, minor integrations
- **M (4-8h)**: Standard features, API endpoints
- **L (1-2d)**: Complex features, major integrations
- **XL (2-3d)**: Very complex features (should be broken down)

##### Acceptance Criteria Testability
- All criteria can be automated
- Test data requirements defined
- Performance benchmarks measurable

#### 2. Dependency Validator (Fullstack Developer)
**Valida dependencies y parallelization strategy:**

##### Dependency Analysis
- **Circular Dependencies**: Detect and flag
- **Timing Dependencies**: Data model → API → UI logical flow
- **Resource Dependencies**: Shared files, databases, services
- **Critical Path**: Identify bottleneck tasks

##### Parallelization Optimization
- Work streams can run simultaneously
- File conflict detection and avoidance
- Agent coordination requirements
- Estimated parallel efficiency

#### 3. Architecture Coherence Checker (Backend Architect)
**Verifica coherencia arquitectural:**

##### Existing System Integration
- Reads `docs/reference/technical-decisions.md`
- Compares epic architecture with established patterns
- Identifies deviations from technical standards
- Validates data model evolution strategy

##### Architecture Quality Checks
- **Migration Strategy**: Sound database evolution
- **API Design**: Follows existing patterns and conventions
- **Frontend Architecture**: Matches current component structure
- **Performance Impact**: Acceptable system load increase

#### 4. Testability Analyzer (Test Engineer)
**Asegura testing strategy completa:**

##### Test Coverage Assessment
- **Unit Tests**: Business logic coverage
- **Integration Tests**: API endpoint validation
- **UI Tests**: User workflow automation
- **Performance Tests**: Non-functional requirement validation

##### Test Automation Readiness
- Test environment requirements defined
- Test data strategy clear
- Automation pipeline compatibility
- Edge case coverage

### Epic Validation Output

#### Technical Validation Report Structure
`.claude/epics/feature-name/epic-validation.md`

```yaml
---
validation_status: IMPLEMENTATION_READY|NEEDS_FIXES|MAJOR_REWORK
technical_viability: 88%
dependency_health: 85%
architecture_coherence: 92%
testability_score: 80%
overall_readiness: 86%
---

## Implementation Readiness Summary
Overall: IMPLEMENTATION_READY (86% - Proceed to Development)

## Development Confidence Metrics
- On-time delivery probability: 87%
- Technical risk level: LOW
- Parallel development conflicts: 0 detected

## Critical Technical Issues
- None found ✅

## Architecture Alignment
- ✅ Follows technical-decisions.md patterns
- ✅ Data model evolution is sound
- ✅ API design matches existing conventions

## Auto-Fix Available
- 2 task sizing adjustments
- 1 dependency optimization
```

#### Technical Quality Gates
- **IMPLEMENTATION_READY (≥85%)**: ✅ Ready for `/oden:tasks feature-name`
- **NEEDS_FIXES (60-84%)**: ⚠️ Fix technical issues first
- **MAJOR_REWORK (<60%)**: ❌ Architectural redesign required

#### Auto-Fix Capabilities
```bash
/oden:epic-validate feature-name --auto-fix
```
**Can automatically fix:**
- Task sizing adjustments based on complexity analysis
- Dependency ordering optimization
- File pattern conflict resolution
- Missing acceptance criteria addition
- Agent assignment optimization

## 🎯 Validation Integration Workflow

### Automatic Validation Chain
```bash
# 1. Create PRD with automatic validation
/oden:prd feature-name
  └─ Auto-runs: /oden:prd-validate feature-name

# 2. Create Epic with automatic validation (only if PRD passed)
/oden:epic feature-name
  └─ Auto-runs: /oden:epic-validate feature-name

# 3. Create Tasks (only if Epic validation passed)
/oden:tasks feature-name

# 4. Development (only if all validations passed)
/oden:work epic/feature-name
```

### Quality Gate Enforcement
```bash
# Epic creation blocked if PRD validation failed
if PRD_VALIDATION_STATUS == "MAJOR_GAPS":
  echo "❌ PRD validation failed. Fix issues first: /oden:prd-validate feature-name"
  exit 1

# Task creation blocked if Epic validation failed
if EPIC_VALIDATION_STATUS == "MAJOR_REWORK":
  echo "❌ Epic validation failed. Fix issues first: /oden:epic-validate feature-name"
  exit 1

# Development blocked if no validations exist
if ! VALIDATION_EXISTS:
  echo "🔍 No validation found. Running validation first..."
  auto_run_validation()
```

## 📈 Validation Metrics & Success Criteria

### Individual Document Metrics

#### PRD Quality Metrics
- **Completeness**: All required sections comprehensive
- **Consistency**: No internal contradictions
- **Quality**: Professional standards met
- **Target**: ≥85% overall for epic creation

#### Epic Readiness Metrics
- **Technical Viability**: Implementable with current stack
- **Dependency Health**: Optimal parallel development
- **Architecture**: Coherent with existing decisions
- **Testability**: Complete testing strategy
- **Target**: ≥85% readiness for development

### Project-Level Success Indicators

#### Process Efficiency
- **First-Pass Success Rate**: % documents passing validation immediately
- **Auto-Fix Effectiveness**: % issues resolved automatically
- **Quality Gate Compliance**: % projects following validation workflow
- **Target**: >80% first-pass success, >70% auto-fix resolution

#### Development Quality
- **Bug Reduction**: Fewer bugs vs non-validated projects
- **On-Time Delivery**: % projects delivered within estimates
- **Architecture Consistency**: % technical debt avoided
- **Target**: 70% bug reduction, 90% on-time delivery

### Continuous Improvement

#### Validation Optimization
- **Threshold Tuning**: Adjust quality gates based on success data
- **Subagent Specialization**: Improve validation accuracy over time
- **Auto-Fix Enhancement**: Expand automatic correction capabilities
- **Pattern Recognition**: Learn common issues and prevent proactively

#### Methodology Evolution
- **Success Pattern Analysis**: What validation patterns correlate with success
- **Failure Pattern Analysis**: What causes validation failures
- **Tool Enhancement**: Improve validation tools based on usage data
- **Process Refinement**: Optimize validation flow for efficiency

## 🚨 Troubleshooting Common Validation Issues

### PRD Validation Failures

#### Low Completeness Score (<80%)
**Common Issues:**
- Missing user personas or user stories
- Vague problem statement without market context
- No measurable success criteria
- Missing non-functional requirements

**Quick Fixes:**
```bash
# Add missing sections automatically
/oden:prd-validate feature-name --auto-fix

# For complex issues
/oden:prd feature-name --revise
```

#### Low Consistency Score (<85%)
**Common Issues:**
- Problem statement doesn't match proposed solution
- User stories conflict with functional requirements
- Success criteria don't align with actual features
- Technical constraints contradict requirements

**Resolution:**
```bash
# Review specific contradictions in validation report
# Make targeted fixes to conflicting sections
# Re-validate
/oden:prd-validate feature-name
```

#### Low Quality Score (<80%)
**Common Issues:**
- Acceptance criteria not testable
- Vague language in requirements
- User stories wrong format
- Success metrics not quantifiable

**Auto-Fixes Available:**
- Convert requirements to GIVEN-WHEN-THEN format
- Replace vague language with specific terms
- Standardize user story format
- Add quantifiable metrics

### Epic Validation Failures

#### Low Technical Viability (<85%)
**Common Issues:**
- Tasks too large (XL should be broken down)
- Technical impossibilities with current stack
- Incorrect task sizing estimates
- Non-testable acceptance criteria

**Resolution:**
```bash
# Break down large tasks
# Verify technical feasibility with team
# Adjust sizing based on complexity
/oden:epic-validate feature-name --auto-fix
```

#### Low Dependency Health (<80%)
**Common Issues:**
- Circular dependencies between tasks
- Illogical timing (UI before API)
- File conflicts in parallel streams
- Critical path bottlenecks

**Auto-Fixes Available:**
- Dependency ordering optimization
- File pattern conflict resolution
- Parallel stream optimization

#### Low Architecture Score (<85%)
**Common Issues:**
- Conflicts with technical-decisions.md
- Data model changes not sound
- API design doesn't follow patterns
- Integration approach inconsistent

**Resolution:**
- Review technical-decisions.md alignment
- Consult with technical architect
- Revise architecture to match established patterns

## 🎯 Best Practices for High Validation Scores

### PRD Best Practices

#### Research Phase
- Analyze ≥3 competitors thoroughly
- Document quantitative market data
- Identify specific user pain points
- Gather industry benchmarks

#### Writing Phase
- Use specific, measurable language
- Include concrete examples
- Define clear acceptance criteria
- Quantify all success metrics

#### Review Phase
- Check internal consistency
- Verify technical feasibility
- Validate testability of criteria
- Ensure completeness of all sections

### Epic Best Practices

#### Planning Phase
- Align with existing technical decisions
- Size tasks realistically (prefer S/M over L/XL)
- Plan for parallel development
- Define clear task boundaries

#### Architecture Phase
- Extend existing patterns, don't rebuild
- Plan database evolution carefully
- Design APIs following established conventions
- Consider performance impact

#### Testing Phase
- Define test strategy early
- Ensure all criteria are testable
- Plan test data requirements
- Consider edge cases and error handling

---

**🎯 El sistema de validación automática de Oden Forge garantiza que cada documento y plan técnico cumple con estándares enterprise antes de la implementación, resultando en desarrollo más eficiente y software de mayor calidad.**