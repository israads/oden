# Test - Intelligent Testing Framework

Sistema de testing inteligente con auto-generación de tests y optimización de tokens para el desarrollo Documentation-First.

## Usage
```
/oden:test <subcommand> [options]
```

## Subcommands

- `/oden:test generate [path]` - Auto-generar tests desde código existente
- `/oden:test run [pattern]` - Ejecutar tests con optimización inteligente
- `/oden:test coverage` - Analysis de coverage con insights
- `/oden:test fix` - Auto-fix tests fallidos
- `/oden:test setup` - Setup completo del testing framework
- `/oden:test pre-commit` - Configurar pre-commit hooks
- `/oden:test performance [target]` - Performance testing
- `/oden:test e2e [spec]` - End-to-end testing con Playwright
- `/oden:test watch` - Watch mode durante desarrollo
- `/oden:test strategy` - Generar estrategia de testing personalizada

## Quick Start

### Setup Inicial
```bash
/oden:test setup                 # Detecta framework y configura todo
/oden:test strategy              # Genera estrategia personalizada
/oden:test generate src/         # Auto-genera tests para src/
/oden:test pre-commit            # Instala hooks automáticos
```

### Flujo de Desarrollo
```bash
/oden:test watch                 # Durante desarrollo
/oden:test run --changed         # Solo tests de archivos modificados
/oden:test coverage --report     # Coverage con recomendaciones
/oden:test fix                   # Fix automático de tests fallidos
```

---

## Core Principles

### 1. **Token Optimization**
- **Pattern Recognition**: Reutiliza templates para tipos similares de funciones
- **Incremental Generation**: Solo genera tests para código nuevo/modificado
- **Smart Prioritization**: Prioriza funciones críticas vs utilitarias
- **Template Reuse**: Biblioteca de templates por tipo de función

### 2. **Intelligent Analysis**
- **Code Analysis**: Entiende propósito de funciones antes de generar tests
- **Documentation Integration**: Lee specs y technical-decisions.md para context
- **Epic Awareness**: Considera contexto completo del epic actual
- **Risk Assessment**: Identifica código de alto riesgo que necesita más tests

### 3. **Framework Agnostic**
- **Auto-Detection**: Detecta Jest, Vitest, Mocha, etc.
- **Best Practices**: Aplica mejores prácticas del framework detectado
- **Migration Support**: Ayuda a migrar entre frameworks
- **Custom Configuration**: Adapta a configuraciones específicas del proyecto

---

## Implementation Flow

### Auto-Generation Process

#### 1. Code Analysis
```bash
# Analiza archivo y detecta patrones
- Function complexity level
- Input/output types
- Error conditions
- Integration points
- Business logic vs utility functions
```

#### 2. Test Template Selection
```bash
# Selecciona template basado en analysis
- CRUD operations → CRUD test template
- Validation functions → Validation test template
- API endpoints → API test template
- Pure functions → Unit test template
- Integration points → Integration test template
```

#### 3. Smart Generation
```bash
# Genera tests optimizados
- Minimal token usage per test
- Maximum coverage per generated test
- Context-aware test scenarios
- Edge case identification
```

#### 4. Quality Validation
```bash
# Valida tests generados
- Syntax correctness
- Framework compliance
- Coverage completeness
- Performance impact assessment
```

---

## Commands Deep Dive

### `/oden:test generate [path]`

**Purpose**: Auto-genera tests inteligentes para código existente

**Options**:
- `--smart` - Solo genera donde agrega valor real
- `--coverage` - Focus en mejorar coverage específico
- `--type=unit|integration|e2e` - Tipo específico de tests
- `--framework=jest|vitest|mocha` - Force framework específico
- `--tokens=optimize` - Modo ultra-optimizado de tokens

**Algorithm**:
1. **Scan & Analyze**: Analiza archivos en path especificado
2. **Risk Assessment**: Calcula risk score de cada función
3. **Priority Matrix**: Determina qué funciones necesitan tests
4. **Template Selection**: Selecciona templates más eficientes
5. **Generation**: Genera tests con mínimos tokens
6. **Validation**: Verifica que tests sean funcionales

**Example Output**:
```bash
🔍 Analyzing src/auth/...

📊 ANALYSIS RESULTS:
  - 12 functions found
  - 8 need test coverage (66% risk score)
  - 4 already well tested (skip)

🧪 GENERATING TESTS:
  ✅ validateEmail() → 3 test cases (high priority)
  ✅ hashPassword() → 4 test cases (security critical)
  ✅ verifyToken() → 5 test cases (integration points)
  ⏭️ logger.debug() → skipped (utility function)

📈 RESULTS:
  - 12 tests generated
  - Estimated token usage: 450 tokens
  - Coverage improvement: +34%
  - Critical path coverage: 100%

Next: /oden:test run --validate
```

### `/oden:test run [pattern]`

**Purpose**: Ejecución inteligente de tests con optimización

**Options**:
- `--changed` - Solo tests de archivos modificados
- `--affected` - Tests afectados por cambios (dependency analysis)
- `--critical` - Solo tests de paths críticos
- `--watch` - Watch mode continuo
- `--parallel=N` - Paralelización
- `--timeout=N` - Timeout personalizado

**Smart Execution**:
```bash
# Dependency Analysis
1. Detecta archivos modificados desde último commit
2. Analiza dependency graph
3. Identifica tests afectados
4. Ejecuta solo tests relevantes
5. Report con tiempo ahorrado

# Example:
Modified: src/auth/validator.js
Affected tests:
  - auth/validator.test.js (direct)
  - integration/auth-flow.test.js (indirect)
  - e2e/login-process.test.js (integration)

Running 3/47 tests (⚡ 94% faster)
```

### `/oden:test coverage`

**Purpose**: Analysis de coverage con insights accionables

**Features**:
- **Visual Coverage Map**: Mapa visual de coverage
- **Critical Path Analysis**: Coverage de funcionalidades críticas
- **Improvement Suggestions**: Qué testear próximo para máximo impacto
- **Documentation Integration**: Compara coverage vs documented specs

**Example Output**:
```bash
📊 COVERAGE ANALYSIS

Overall Coverage: ████████░░ 78%

📋 BY MODULE:
  auth/         ██████████ 95% (excellent)
  payments/     ██████░░░░ 67% (needs improvement)
  dashboard/    ████░░░░░░ 45% (critical gaps)

🎯 IMPROVEMENT RECOMMENDATIONS:
  1. payments/processor.js:45-67 → Add error handling tests (HIGH impact)
  2. dashboard/charts.js → Add integration tests (MEDIUM impact)
  3. auth/session.js:12-15 → Edge case coverage (LOW impact)

📈 IMPACT PREDICTION:
  - Fix #1: +12% overall coverage
  - Fix #1+2: +19% overall coverage
  - All fixes: +23% overall coverage

Next: /oden:test generate payments/processor.js --coverage
```

### `/oden:test fix`

**Purpose**: Auto-fix tests fallidos con análisis de causa raíz

**Process**:
1. **Error Analysis**: Analiza stack trace y identifica causa
2. **Pattern Matching**: Compara con base de errores conocidos
3. **Fix Generation**: Genera fix basado en patterns
4. **Validation**: Verifica que fix resuelve problema
5. **Learning**: Aprende de fix para futuros casos

**Example**:
```bash
🚨 FAILED TESTS DETECTED

❌ auth/validator.test.js
   Error: ReferenceError: bcrypt is not defined

🔍 ANALYSIS:
   - Missing import statement
   - Likely caused by recent refactoring
   - Similar pattern in 3 other test files

🛠️ PROPOSED FIX:
   Add: const bcrypt = require('bcrypt');
   Location: Line 2, after existing imports

Apply fix? [Y/n]: Y

✅ FIXED: auth/validator.test.js
   - Added missing bcrypt import
   - Tests now passing: ████████ 8/8

🧠 LEARNING: Added "missing bcrypt import" to fix patterns
```

### `/oden:test pre-commit`

**Purpose**: Setup hooks que validan calidad antes de commits

**Features**:
- **Lint-staged Integration**: Solo tests de archivos staged
- **Fast Execution**: Optimizado para pre-commit speed
- **Quality Gates**: Configurable quality thresholds
- **Smart Bypass**: Bypass para commits urgentes con warnings

**Setup Process**:
```bash
🔧 SETTING UP PRE-COMMIT HOOKS

1. Installing husky... ✅
2. Configuring lint-staged... ✅
3. Setting up quality gates... ✅
4. Creating bypass mechanism... ✅

📋 HOOK CONFIGURATION:
  ✅ Run tests for staged files
  ✅ Check coverage thresholds (>80%)
  ✅ Validate test quality
  ✅ Performance regression check

🚨 QUALITY GATES:
  - Tests must pass: ENFORCED
  - Coverage threshold: 80% (configurable)
  - Performance regression: 20% threshold
  - Test quality score: >7/10

💡 BYPASS OPTION:
  git commit --no-verify (with warning log)

Setup complete! Next commit will trigger validation.
```

### `/oden:test strategy`

**Purpose**: Genera estrategia de testing personalizada para el proyecto

**Analysis Includes**:
- **Project Type**: Web app, API, mobile, library, etc.
- **Tech Stack**: Framework detection and best practices
- **Risk Profile**: Business critical vs supporting functions
- **Team Size**: Testing approach for team size
- **Documentation State**: Integration with existing docs

**Example Output**:
```markdown
# Testing Strategy - Generated by Oden

## Project Analysis
- **Type**: Full-stack web application
- **Stack**: Node.js, React, PostgreSQL
- **Risk Level**: High (financial transactions)
- **Team Size**: 5 developers
- **Documentation**: Good (87% spec coverage)

## Recommended Approach

### 1. Test Pyramid Structure
- **Unit Tests (70%)**: Focus on business logic, utilities, components
- **Integration Tests (20%)**: API endpoints, database interactions
- **E2E Tests (10%)**: Critical user journeys

### 2. Priority Matrix
**HIGH PRIORITY** (Test first):
- Payment processing logic
- Authentication flow
- Data validation functions

**MEDIUM PRIORITY** (Test after high):
- UI components
- Utility functions
- Configuration logic

**LOW PRIORITY** (Test if time permits):
- Logging functions
- Static content
- Development tools

### 3. Framework Recommendations
- **Unit**: Jest (already configured)
- **Integration**: Supertest for API testing
- **E2E**: Playwright (better than Cypress for your stack)
- **Performance**: Artillery for load testing

### 4. Coverage Targets
- **Overall**: 85% (industry standard for fintech)
- **Critical paths**: 95% (payment, auth flows)
- **UI components**: 70% (focus on business logic)

### 5. Implementation Plan
**Week 1**: Setup framework + critical path tests
**Week 2**: Unit tests for business logic
**Week 3**: Integration tests for APIs
**Week 4**: E2E tests for user journeys

## Commands to Execute
```bash
/oden:test setup
/oden:test generate src/payments/ --type=unit
/oden:test generate src/auth/ --type=integration
/oden:test e2e --setup
/oden:test pre-commit
```
```

---

## Integration with Oden Ecosystem

### Documentation-First Integration
- **Spec Alignment**: Tests validate implementation matches specs
- **Epic Context**: Considers current epic requirements
- **Technical Decisions**: Follows patterns from technical-decisions.md

### Agent Coordination
- **Test-First Development**: Agentes generan tests antes de código
- **Quality Gates**: Agentes no pueden proceder si tests fallan
- **Shared Context**: Tests sirven como documentación ejecutable

### Analytics Integration
- **Quality Metrics**: Tests contribuyen a quality dashboard
- **Velocity Tracking**: Test coverage impact en development speed
- **Risk Assessment**: Test coverage informan risk metrics

---

## Advanced Features

### Performance Testing
```bash
/oden:test performance api/         # Load testing for APIs
/oden:test performance --memory     # Memory leak detection
/oden:test performance --benchmark  # Benchmark against baselines
```

### E2E Testing
```bash
/oden:test e2e setup               # Setup Playwright
/oden:test e2e generate            # Generate E2E from user stories
/oden:test e2e visual              # Visual regression testing
```

### AI-Powered Features
- **Smart Test Generation**: AI entiende propósito del código
- **Bug Prediction**: Identifica código probable de fallar
- **Test Maintenance**: Auto-actualiza tests cuando código cambia
- **Quality Insights**: Sugerencias para mejorar test quality

---

## Error Handling

### Common Scenarios
- **Framework Not Detected**: Guía manual setup
- **Token Limit**: Batch generation con progress tracking
- **Test Failures**: Detailed debugging information
- **Performance Issues**: Optimization suggestions

### Fallback Strategies
- **Manual Templates**: Si auto-generation falla
- **Framework Migration**: Helpers para cambiar frameworks
- **Legacy Code**: Estrategias para código sin documentación
- **Integration Issues**: Debug helpers para dependency conflicts

---

## Configuration

### `.oden-test.json`
```json
{
  "framework": "jest",
  "coverage_threshold": 80,
  "token_optimization": true,
  "smart_generation": true,
  "pre_commit_hooks": true,
  "test_patterns": {
    "unit": "**/*.test.js",
    "integration": "**/*.integration.js",
    "e2e": "**/*.e2e.js"
  },
  "exclude_patterns": [
    "node_modules/**",
    "build/**",
    "*.config.js"
  ],
  "quality_gates": {
    "min_coverage": 80,
    "max_test_time": 30000,
    "performance_threshold": 0.8
  }
}
```

---

## Success Metrics

### Immediate Impact
- **Setup Time**: <5 minutes para proyecto nuevo
- **Generation Speed**: <30 segundos para 50 funciones
- **Token Efficiency**: 60% menos tokens vs generación manual
- **Quality Score**: >8/10 para tests generados

### Long-term Benefits
- **Coverage Improvement**: +40% average coverage increase
- **Bug Reduction**: 50% fewer production bugs
- **Development Speed**: 25% faster development cycles
- **Team Confidence**: Measurable improvement in deployment confidence

---

## Important Notes

- **Token Optimization** es prioritario en toda generación
- **Quality over Quantity** - mejor pocos tests excelentes que muchos mediocres
- **Integration Awareness** - considera impacto en ecosystem completo
- **Documentation Sync** - tests siempre alineados con specs
- **Performance First** - nunca sacrificar performance del desarrollo

---

*Testing Framework - Powering reliable Documentation-First Development*