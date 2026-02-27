# Metodología Oden Forge - Documentation-First Development

La metodología Documentation-First Development de Oden Forge transforma cómo creamos software profesional: documentando y validando COMPLETAMENTE antes de escribir código.

## 🎯 Filosofía Core

> **"Documenta y diseña COMPLETAMENTE antes de codificar"**

### Problemas que Resuelve

**❌ Desarrollo Tradicional:**
- Código sin documentación
- Requisitos ambiguos
- Refactorización constante
- Bugs por falta de planificación
- Arquitectura inconsistente
- Testing como afterthought

**✅ Documentation-First:**
- Especificaciones exhaustivas antes de código
- Validación automática de completitud
- Arquitectura coherente desde día 1
- Testing strategy definida pre-implementación
- Research-backed decisions
- Quality gates automáticos

## 🔄 Fases del Proyecto

### FASE 1: Pre-Desarrollo (1-2 semanas)

#### 1.1 Research & Product Requirements Document (PRD)
```bash
/oden:prd feature-name
```

**Qué se genera:**
- Research de 3-5 competidores automático
- Market analysis y user personas
- Problem statement con evidencia
- Functional & non-functional requirements
- Success criteria measurable
- Dependencies y constraints

**Validation automática:**
```bash
/oden:prd-validate feature-name
```
- ✅ Completitud ≥80% (todas las secciones desarrolladas)
- ✅ Consistencia ≥85% (sin contradicciones)
- ✅ Calidad ≥80% (requirements específicos y testeable)
- ✅ **Overall ≥85% para continuar**

#### 1.2 Technical Architecture & Epic
```bash
/oden:epic feature-name
```

**Qué se genera:**
- Arquitectura técnica detallada
- Data model changes con migrations
- API contracts y endpoints
- Frontend component structure
- Work streams para desarrollo paralelo
- Task breakdown con sizing (XS/S/M/L/XL)

**Validation técnica automática:**
```bash
/oden:epic-validate feature-name
```
- ✅ Technical Viability ≥85% (tasks implementable)
- ✅ Dependencies ≥80% (sin dependencias circulares)
- ✅ Architecture ≥85% (coherente con technical-decisions.md)
- ✅ Testability ≥80% (acceptance criteria testeable)

#### 1.3 Individual Task Decomposition
```bash
/oden:tasks feature-name
```

**Qué se genera:**
- Tasks individuales con acceptance criteria específicos
- File patterns por task
- Agent assignments optimizados
- Dependency mapping detallado
- Time estimates realistas

### FASE 2: Implementación (8-18 semanas según scope)

#### 2.1 Orchestrated Development
```bash
/oden:work epic/feature-name --mode auto
```

**Desarrollo paralelo inteligente:**
- Multiple agents trabajando simultáneamente
- File conflict avoidance automático
- Progress tracking en tiempo real
- Automatic testing integration
- Quality gates durante desarrollo

#### 2.2 Continuous Validation
Durante desarrollo:
- Tests automáticos después de cada stream
- Code review automático pre-merge
- Architecture compliance checks
- Performance monitoring

### FASE 3: Post-Desarrollo

#### 3.1 Documentation Migration
```bash
# Mover documentos completados
mv docs/development/current/feature-name docs/development/completed/
```

#### 3.2 Retrospective & Lessons Learned
```bash
/oden:daily  # Durante desarrollo
# Genera retrospectivas automáticas
```

## 📊 Quality Gates & Métricas

### Pre-Development Quality Gates

#### PRD Quality Gate (≥85% overall)
- **Completitud ≥80%**: Todas las secciones críticas presentes
  - Problem Statement >100 words con market context
  - ≥3 user personas, ≥5 user stories
  - ≥5 core features con acceptance criteria
  - Non-functional requirements (performance, security, scalability)
  - ≥3 measurable KPIs
  - Dependencies identificadas

- **Consistencia ≥85%**: Sin contradicciones internas
  - Problem statement ↔ proposed solution alignment
  - User stories ↔ functional requirements consistency
  - Success criteria ↔ actual features alignment
  - Constraints ↔ requirements compatibility

- **Calidad ≥80%**: Professional standards
  - Acceptance criteria testeable (GIVEN-WHEN-THEN format)
  - Requirements específicos y measurables
  - User stories formato correcto (As a... I want... So that...)
  - Success metrics cuantificables y achievable

#### Epic Quality Gate (≥85% readiness)
- **Technical Viability ≥85%**: Implementable con stack actual
  - Database changes feasible con existing schema
  - API contracts implementable con current stack
  - Frontend requirements align con chosen frameworks
  - Task sizing accurate (XS<2h, S=2-4h, M=4-8h, L=1-2d, XL=2-3d)

- **Dependencies ≥80%**: Dependency graph saludable
  - Sin circular dependencies
  - Timing dependencies lógicas (data model → API → UI)
  - Critical path identificado
  - Parallel work streams sin file conflicts

- **Architecture ≥85%**: Coherente con decisiones existentes
  - Aligns con docs/reference/technical-decisions.md
  - Data model changes son sound
  - API design follows established patterns
  - Frontend approach matches current architecture

- **Testability ≥80%**: Testing strategy completa
  - Unit tests para business logic
  - Integration tests para API endpoints
  - UI tests para user workflows
  - Performance tests para non-functional requirements

### Development Quality Gates

#### During Development
- **Commit Quality**: Cada commit sigue formato "Issue #N: description"
- **Test Coverage**: Minimum 80% para nuevas features
- **Code Review**: Automatic review antes de merge
- **Performance**: No degradation detectada

#### Pre-Merge Quality Gate
- **All Tests Pass**: Unit + Integration + E2E
- **Code Review Approved**: Security + Performance + Best practices
- **No Critical Issues**: Security scan clean
- **Documentation Updated**: Si es necesario

## 🛠️ Herramientas y Automación

### Validation Automática

#### PRD Validation Pipeline
1. **Completeness Analysis**: Specialized subagent checks all required sections
2. **Consistency Check**: Detects contradictions across sections
3. **Quality Assessment**: Evaluates against professional standards
4. **Auto-Fix Suggestions**: Common issues auto-fixable

#### Epic Validation Pipeline
1. **Technical Viability**: Can be implemented with current stack
2. **Dependency Analysis**: Detects circular dependencies, conflicts
3. **Architecture Review**: Aligns with existing technical decisions
4. **Testability Check**: All acceptance criteria can be tested

### Development Orchestration

#### Intelligent Agent Assignment
```yaml
database_work:
  agent: backend-architect
  patterns: ["migrations/*", "src/db/*", "*.sql"]

api_work:
  agent: backend-architect
  patterns: ["src/api/*", "src/services/*", "src/routes/*"]

frontend_work:
  agent: frontend-developer
  patterns: ["src/components/*", "src/pages/*", "src/hooks/*"]

fullstack_work:
  agent: fullstack-developer
  patterns: ["src/**"]

test_work:
  agent: test-engineer
  patterns: ["tests/*", "*.test.*", "*.spec.*"]
```

#### Parallel Work Coordination
- **File Pattern Separation**: Each agent works on different file patterns
- **Dependency-Aware Scheduling**: Dependent tasks wait for prerequisites
- **Conflict Detection**: Automatic detection of file access conflicts
- **Progress Monitoring**: Real-time progress tracking across streams

## 📈 Decisión: MVP vs Modo Turbo

### MVP (8-10 semanas)
- **Scope**: 30-40% de features planificadas
- **Ventajas**: Rápido al mercado, validación temprana
- **Trade-offs**: Mayor deuda técnica, limitaciones funcionales
- **Ideal para**: Startups, validación de ideas, proof of concepts

### Modo Turbo (14-20 semanas)
- **Scope**: 100% features profesionales
- **Ventajas**: Enterprise-ready desde día 1, menor deuda técnica
- **Trade-offs**: Mayor time-to-market, mayor inversión inicial
- **Ideal para**: Productos establecidos, B2B solutions, sistemas críticos

## 🎯 Checklist Pre-Código

Antes de escribir la primera línea de código:

### Documentación Base
- [ ] `docs/reference/technical-decisions.md` >2000 líneas
- [ ] Database schema completo con migrations
- [ ] Análisis de 3+ competidores documentado
- [ ] User personas y stories definidas
- [ ] Stack tecnológico justificado

### Especificaciones por Módulo
- [ ] Specs de módulos >800 líneas cada una
- [ ] Máquinas de estado para entidades complejas
- [ ] Edge cases documentados
- [ ] Error handling strategies definidas
- [ ] API contracts especificados

### Quality Assurance
- [ ] PRD validation ≥85% score
- [ ] Epic validation ≥85% readiness
- [ ] Sin contradicciones críticas
- [ ] 100% acceptance criteria testeable
- [ ] Performance targets definidos

### Implementation Readiness
- [ ] Work streams sin file conflicts
- [ ] Dependencies mapeadas correctamente
- [ ] Agent assignments optimizados
- [ ] Testing strategy completa
- [ ] Deployment plan definido

**Solo cuando TODO esté ✅, empezar a codificar.**

## 🔄 Continuous Improvement

### Metrics Tracking
- **Documentation Quality**: PRD/Epic validation scores trend
- **Development Velocity**: Tasks completed vs estimated
- **Quality Indicators**: Bug rate, test coverage, performance
- **Time to Market**: Pre-development time vs total project time

### Retrospectives Automáticas
```bash
/oden:daily  # Tracks daily progress
```
Genera automáticamente:
- Files modified tracking
- Progress analysis con metrics
- Blockers detection
- Success/failure patterns

### Methodology Evolution
- **Lessons Learned**: Documented en docs/development/completed/
- **Process Improvements**: Based on retrospective data
- **Tool Enhancement**: Subagent specialization refinement
- **Quality Gate Tuning**: Threshold optimization based on results

---

## 🎯 Resultados Esperados

### Calidad del Software
- **Bug Reduction**: 60-80% fewer bugs vs traditional development
- **Architecture Consistency**: 95% compliance with technical decisions
- **Test Coverage**: Consistent >80% coverage
- **Performance**: Meets targets from day 1

### Development Efficiency
- **Rework Reduction**: 70% less refactoring needed
- **Developer Productivity**: Clear specs = faster implementation
- **Parallel Development**: Multiple streams working simultaneously
- **Knowledge Sharing**: Documentation enables team scaling

### Business Impact
- **Time to Market**: Predictable delivery timelines
- **Quality Assurance**: Enterprise-ready software from launch
- **Stakeholder Confidence**: Clear progress tracking and validation
- **Technical Debt**: Minimal accumulation due to upfront planning

**La metodología Oden Forge Documentation-First garantiza que cada línea de código escrita tenga propósito, contexto y validación previa, resultando en software profesional y mantenible.**