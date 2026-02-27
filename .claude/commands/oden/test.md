---
allowed-tools: Bash, Read, Write, Task, Glob, Grep
description: Sistema de testing completo con generación automática y auto-fix - testing robusto basado en lógica de negocio
---

# Test - Sistema de Testing Completo con Auto-Fix

Sistema completo de testing que genera tests automáticamente basados en specs y lógica de negocio, ejecuta tests y auto-corrige fallos.

## Usage

```bash
# Generar tests de módulo específico
/oden:test <module-name>

# Generar tests de todo el sistema (con confirmación)
/oden:test

# Ejecutar tests con auto-fix si fallan
/oden:test run

# Generar estrategia de testing
/oden:test strategy

# Analizar cobertura de tests
/oden:test coverage

# Generar tests desde specs
/oden:test generate <module-name>
```

## 🎯 Propósito: Testing Enterprise-Grade

Sistema que combina:
- ✅ **Test Generation**: Automática desde specs y lógica de negocio
- ✅ **Smart Framework Selection**: Vitest, Jest, Cypress según el stack
- ✅ **Auto-Fix**: Corrección automática de tests fallidos
- ✅ **Business Logic Aware**: Tests que entienden la lógica de negocio
- ✅ **Spec-Driven**: Tests generados desde especificaciones técnicas

## 📊 Comando: /oden:test (Generate All Tests)

### Preflight Validation

1. **Check for existing tests**: Detectar estructura de tests existente
2. **Identify framework**: Auto-detectar o sugerir framework de testing
3. **Read project specs**: Leer specs disponibles para contexto
4. **Get datetime**: `date -u +"%Y-%m-%dT%H:%M:%SZ"` for test generation timestamp

### User Confirmation for Full System

```bash
echo "🧪 ODEN FORGE - SISTEMA DE TESTING COMPLETO"
echo "════════════════════════════════════════════"
echo ""
echo "📊 Análisis del proyecto:"
echo "  - Módulos detectados: [count] módulos"
echo "  - Specs disponibles: [count] especificaciones"
echo "  - Framework sugerido: [Vitest|Jest|Cypress] (auto-detectado)"
echo "  - Cobertura objetivo: 85%+"
echo ""
echo "🚨 ADVERTENCIA: Esto generará tests para TODO el sistema"
echo "   Esto puede tomar 15-30 minutos y crear muchos archivos"
echo ""
echo "¿Proceder con generación completa de tests? [y/N]: "
```

### Phase 1: Test Strategy & Framework Selection

Launch specialized subagent for test strategy:

```markdown
Launch subagent: test-engineer

Task: Analyze project and create comprehensive test strategy

Requirements:
- Read all specs in docs/reference/modules/
- Read technical-decisions.md for stack information
- Analyze existing codebase structure (if accessible)
- Identify business logic patterns
- Recommend optimal test framework:
  * Vitest for Vite/Vue projects
  * Jest for React/Node projects
  * Cypress for E2E testing
  * Playwright for modern E2E
  * Framework-specific options for other stacks

- Create test architecture plan:
  * Unit tests for business logic
  * Integration tests for API endpoints
  * E2E tests for user workflows
  * Performance tests for critical paths

- Output comprehensive test strategy with framework rationale

Context: Generate enterprise-grade testing strategy based on actual project needs
```

### Phase 2: Module-by-Module Test Generation

For each module, launch specialized test generation:

```markdown
Launch subagent: test-generator

Task: Generate comprehensive tests for module: $MODULE_NAME

Requirements:
- Read module spec: docs/reference/modules/$MODULE_NAME-spec.md
- Read related PRDs and epics for business context
- Understand business logic and edge cases
- Generate test files following framework best practices:
  * Unit tests for all functions/methods
  * Integration tests for module interactions
  * Mock external dependencies appropriately
  * Test error handling and edge cases
  * Include performance tests where relevant

- Follow naming conventions:
  * $MODULE_NAME.test.js/ts for unit tests
  * $MODULE_NAME.integration.test.js for integration
  * $MODULE_NAME.e2e.test.js for end-to-end

- Include test data factories and fixtures
- Generate comprehensive test coverage (target 85%+)
- Output working test files ready for execution

Context: Tests must validate business logic, not just code coverage
```

## 🔧 Comando: /oden:test <module-name> (Generate Module Tests)

### Module-Specific Test Generation

```bash
# Validate module exists
if [ ! -f "docs/reference/modules/$ARGUMENTS-spec.md" ]; then
  echo "❌ Module spec not found: docs/reference/modules/$ARGUMENTS-spec.md"
  echo "Available modules:"
  ls docs/reference/modules/ | grep -E ".*-spec\.md$" | sed 's/-spec\.md$//' | sed 's/^/  - /'
  exit 1
fi
```

### Single Module Test Strategy

```markdown
Launch subagent: test-generator

Task: Generate comprehensive tests for module: $ARGUMENTS

Requirements:
- Read module spec: docs/reference/modules/$ARGUMENTS-spec.md
- Read technical-decisions.md for tech stack context
- Identify business logic patterns in the spec
- Generate appropriate test categories:
  * Unit tests for core business logic
  * Integration tests for external interactions
  * Mock tests for dependencies
  * Edge case tests for error conditions

- Select optimal framework based on stack:
  * Auto-detect package.json dependencies
  * Suggest Vitest for modern JavaScript/TypeScript
  * Include proper setup and teardown
  * Generate test utilities and helpers

- Create test files with proper structure:
  * Clear test descriptions
  * Arrange-Act-Assert pattern
  * Comprehensive test data
  * Business scenario coverage

- Output summary of test coverage and rationale

Context: Focus on testing business logic, not just implementation details
```

### Expected Output Structure

Create test files in appropriate directory structure:
```
tests/
├── unit/
│   └── $MODULE_NAME.test.js
├── integration/
│   └── $MODULE_NAME.integration.test.js
├── fixtures/
│   └── $MODULE_NAME-data.js
└── helpers/
    └── $MODULE_NAME-helpers.js
```

## 🚀 Comando: /oden:test run (Execute Tests with Auto-Fix)

### Test Execution Pipeline

#### Phase 1: Framework Detection & Execution

```bash
echo "🧪 Executing tests with auto-fix capability..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Auto-detect testing framework and execute
test_framework=""
test_command=""

# Detect framework
if [ -f "package.json" ]; then
  if grep -q "vitest" package.json; then
    test_framework="vitest"
    test_command="npm run test"
  elif grep -q "jest" package.json; then
    test_framework="jest"
    test_command="npm test"
  elif grep -q "cypress" package.json; then
    test_framework="cypress"
    test_command="npm run test:e2e"
  fi
elif [ -f "go.mod" ]; then
  test_framework="go-test"
  test_command="go test ./..."
elif [ -f "Cargo.toml" ]; then
  test_framework="cargo"
  test_command="cargo test"
elif [ -f "pubspec.yaml" ]; then
  test_framework="flutter"
  test_command="flutter test"
elif [ -f "Gemfile" ]; then
  test_framework="rspec"
  test_command="bundle exec rspec"
fi

echo "📊 Testing Framework: $test_framework"
echo "🔧 Command: $test_command"
echo ""

# Execute tests
echo "▶️ Running tests..."
$test_command > /tmp/test-output.log 2>&1
test_exit_code=$?
```

#### Phase 2: Auto-Fix Failed Tests

If tests fail (exit code != 0):

```bash
if [ $test_exit_code -ne 0 ]; then
  echo "❌ Tests failed (exit code: $test_exit_code)"
  echo ""
  echo "🔍 Analyzing failures for auto-fix..."

  # Launch auto-fix subagent
fi
```

```markdown
Launch subagent: test-fixer

Task: Analyze test failures and automatically fix them

Requirements:
- Read full test output from /tmp/test-output.log
- Read all relevant specs and business logic documentation
- Read technical-decisions.md for context
- Analyze failure patterns:
  * Import/export errors → Fix path issues
  * Missing dependencies → Add proper mocks
  * Business logic mismatches → Align with specs
  * Type errors → Fix TypeScript issues
  * Async/timing issues → Add proper awaits

- Apply fixes based on failure analysis:
  * Update import paths
  * Fix mock configurations
  * Correct business logic in tests
  * Add missing test setup
  * Fix async test patterns

- Re-run tests after each fix to validate
- Continue until all tests pass or manual intervention needed
- Document what was fixed and why

Context: Fix tests while maintaining business logic correctness and spec compliance
```

#### Phase 3: Success Reporting

```bash
if [ $final_exit_code -eq 0 ]; then
  echo "✅ All tests passing after auto-fix!"
else
  echo "⚠️ Some tests still failing - manual intervention needed"
fi
```

## 📈 Comando: /oden:test coverage (Coverage Analysis)

### Coverage Analysis with Business Logic Insights

```markdown
Launch subagent: test-analyzer

Task: Analyze test coverage and business logic coverage

Requirements:
- Execute coverage tools (nyc, jest --coverage, etc.)
- Read all module specs to understand business requirements
- Analyze coverage report against business logic:
  * Which business rules are tested
  * Which edge cases are missing
  * What error conditions are uncovered
  * Which integration points need testing

- Generate business-focused coverage report:
  * Overall coverage percentage
  * Business logic coverage (separate metric)
  * Critical path coverage
  * Error handling coverage
  * Integration coverage

- Suggest specific tests to improve meaningful coverage
- Prioritize recommendations by business impact

Context: Focus on business value, not just code coverage percentage
```

## 🎯 Comando: /oden:test strategy (Generate Test Strategy)

### Comprehensive Test Strategy Creation

```markdown
Launch subagent: test-architect

Task: Create comprehensive testing strategy for the project

Requirements:
- Read all project documentation (specs, technical decisions, PRDs)
- Analyze codebase architecture and patterns
- Understand business domain and critical workflows
- Create multi-layered test strategy:
  * Unit Testing Strategy
  * Integration Testing Strategy
  * E2E Testing Strategy
  * Performance Testing Strategy
  * Security Testing Strategy

- Define testing standards:
  * Coverage targets by layer
  * Testing naming conventions
  * Mock strategy and guidelines
  * CI/CD integration approach
  * Test data management

- Create testing roadmap:
  * Phase 1: Critical path tests
  * Phase 2: Comprehensive coverage
  * Phase 3: Advanced scenarios
  * Maintenance and evolution plan

Output: Comprehensive test strategy document

Context: Create professional testing strategy aligned with business needs
```

## 📋 Integration with Development Pipeline

### From /oden:work (Enhanced)

Add automatic testing integration to work orchestrator:

```bash
# After all development streams complete
echo ""
echo "🧪 Running automatic test verification..."
/oden:test run

# If tests fail, auto-fix attempt
if [ $? -ne 0 ]; then
  echo "⚠️ Tests failed - attempting auto-fix..."
  /oden:test run --auto-fix
fi

# Only proceed to PR creation if tests pass
if [ $? -eq 0 ]; then
  echo "✅ All tests passing - ready for PR creation"
else
  echo "❌ Tests still failing - manual intervention required"
  exit 1
fi
```

### From /oden:epic (Test Planning)

Add test planning to epic creation:

```bash
# After epic validation passes
echo ""
echo "🧪 Generating test strategy for epic..."

# Launch test planning subagent
```

```markdown
Launch subagent: test-planner

Task: Create testing plan for epic: $ARGUMENTS

Requirements:
- Read epic document: .claude/epics/$ARGUMENTS/epic.md
- Understand work streams and technical implementation
- Plan testing approach for each work stream:
  * Database changes → migration and schema tests
  * API development → endpoint and integration tests
  * Frontend work → component and E2E tests
  * Infrastructure → deployment and performance tests

- Estimate testing effort per work stream
- Identify test dependencies and sequencing
- Plan test data requirements
- Output testing tasks to be added to work streams

Context: Integrate testing into development workflow from planning stage
```

## 🔧 Framework-Specific Implementations

### Vitest Configuration

If Vitest is detected/selected:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom', // or 'node' based on needs
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    setupFiles: ['./test/setup.js'],
    globals: true
  }
})
```

### Jest Configuration

If Jest is detected/selected:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['**/__tests__/**/*.(js|ts)', '**/*.(test|spec).(js|ts)']
}
```

## 📊 Success Output Examples

### Module Test Generation
```
🧪 Module Tests Generated: $MODULE_NAME

📋 Test Files Created:
  - tests/unit/$MODULE_NAME.test.js (15 tests)
  - tests/integration/$MODULE_NAME.integration.test.js (8 tests)
  - tests/fixtures/$MODULE_NAME-data.js (test data)

📊 Coverage Focus:
  - Business logic: 12 core functions tested
  - Edge cases: 8 error conditions covered
  - Integration points: 5 external dependencies mocked
  - Performance: 3 critical path benchmarks

🎯 Business Scenarios Covered:
  - User authentication flow (5 tests)
  - Payment processing (7 tests)
  - Error handling (6 tests)

▶️ Run tests: /oden:test run
📈 Check coverage: /oden:test coverage
```

### Test Run with Auto-Fix
```
🧪 Test Execution Complete with Auto-Fix

📊 Results:
  - Total tests: 127
  - Passed: 127 ✅
  - Failed: 0
  - Auto-fixed: 3 issues

🔧 Auto-Fixes Applied:
  - Import path corrections (2 files)
  - Mock configuration update (1 file)
  - Async test timing fix (1 file)

📈 Coverage: 87% (exceeds 85% target)
  - Business logic: 92%
  - Integration: 84%
  - E2E workflows: 89%

✅ All tests passing - ready for development/deployment
```

### Coverage Analysis
```
📊 Test Coverage Analysis

Overall Coverage: 87%
├─ Business Logic: 92% ✅
├─ Integration: 84% ⚠️
├─ E2E Workflows: 89% ✅
└─ Error Handling: 78% ⚠️

🎯 Business Priority Coverage:
  - Authentication: 95% ✅
  - Payment Flow: 91% ✅
  - User Management: 89% ✅
  - Data Processing: 82% ⚠️

📋 Recommendations (High Impact):
  1. Add error handling tests for payment failures
  2. Test integration with external API timeouts
  3. Add E2E tests for admin workflows

⚡ Quick wins available:
  - 3 tests could boost coverage to 90%
  - Est. time: 2 hours
```

## ⚠️ Error Handling & Recovery

### Common Issues & Auto-Fixes

#### Framework Detection Failure
```bash
if [ -z "$test_framework" ]; then
  echo "❌ Could not detect testing framework"
  echo ""
  echo "🔧 Suggested frameworks based on your stack:"
  # Auto-suggest based on package.json or file structure
  echo "   - Vitest (recommended for modern projects)"
  echo "   - Jest (standard for React/Node)"
  echo ""
  echo "Install testing framework? [y/N]: "
fi
```

#### Test Generation Failure
```bash
if [ $generation_failed -eq 1 ]; then
  echo "❌ Test generation failed for $MODULE_NAME"
  echo ""
  echo "🔍 Possible causes:"
  echo "   - Module spec missing or incomplete"
  echo "   - Complex business logic needs manual intervention"
  echo "   - Framework setup incomplete"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Check spec: docs/reference/modules/$MODULE_NAME-spec.md"
  echo "   2. Verify framework setup"
  echo "   3. Generate basic test template manually"
fi
```

#### Auto-Fix Limitations
```bash
if [ $auto_fix_failed -eq 1 ]; then
  echo "⚠️ Auto-fix could not resolve all test failures"
  echo ""
  echo "🔍 Manual intervention needed for:"
  # List specific failures that couldn't be auto-fixed
  echo "   - Complex business logic mismatch (requires spec review)"
  echo "   - External service integration (needs environment setup)"
  echo ""
  echo "📋 Guidance:"
  echo "   1. Review failing tests in context of business specs"
  echo "   2. Check external dependencies and mocks"
  echo "   3. Verify test environment configuration"
fi
```

---

**🧪 El sistema de testing de Oden Forge garantiza cobertura enterprise-grade con generación automática inteligente, auto-fix capabilities, y enfoque en lógica de negocio real, no solo coverage percentages.**