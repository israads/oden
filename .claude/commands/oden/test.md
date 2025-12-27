---
allowed-tools: Bash, Read, Write, Edit, LS, Glob, Grep, Task, TodoWrite
description: Testing - estrategia, ejecución y análisis
---

# Oden Forge - Testing

Comandos para testing completo del proyecto.

## Usage

```
/oden:test [subcommand]
```

## Subcomandos

### `/oden:test strategy`

Crea estrategia de testing para el proyecto.

**Usa:** `test-engineer` agent

**Genera:**
- `docs/reference/testing-strategy.md`
- Estructura de tests recomendada
- Cobertura mínima por módulo
- Tipos de tests por feature

### `/oden:test run [scope]`

Ejecuta tests y analiza resultados.

**Usa:** `test-runner` agent

**Scope:**
- (vacío) - Todos los tests
- `unit` - Solo unit tests
- `integration` - Solo integration
- `e2e` - Solo end-to-end
- `module {name}` - Tests de un módulo

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                     TEST RESULTS                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ✅ Passed: 45                                               ║
║  ❌ Failed: 3                                                ║
║  ⏭️  Skipped: 2                                              ║
║                                                              ║
║  Coverage: 78%                                               ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  FAILURES:                                                   ║
║                                                              ║
║  1. auth.test.ts:45                                          ║
║     Expected: 200                                            ║
║     Received: 401                                            ║
║     → Posible causa: Token expirado                          ║
║                                                              ║
║  2. orders.test.ts:123                                       ║
║     Expected: "completed"                                    ║
║     Received: "pending"                                      ║
║     → Posible causa: Estado no actualizado                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### `/oden:test fix`

Analiza tests fallidos y sugiere fixes.

**Usa:** `debugger` + `code-analyzer` agents

**Proceso:**
1. Lee output de último test run
2. Analiza cada fallo
3. Identifica causa raíz
4. Sugiere fix específico

### `/oden:test coverage`

Analiza cobertura y sugiere tests faltantes.

**Usa:** `test-engineer` agent

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                   COVERAGE ANALYSIS                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  MODULE              COVERAGE    TARGET    STATUS            ║
║  ─────────────────────────────────────────────────────────── ║
║  auth                92%         80%       ✅                ║
║  orders              67%         80%       ❌ (-13%)         ║
║  payments            85%         80%       ✅                ║
║  users               45%         80%       ❌ (-35%)         ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  TESTS SUGERIDOS:                                            ║
║                                                              ║
║  orders:                                                     ║
║  - [ ] Test: cancelOrder con items parciales                 ║
║  - [ ] Test: refund cuando ya hay refund parcial             ║
║  - [ ] Test: transición ACTIVE → COMPLETED                   ║
║                                                              ║
║  users:                                                      ║
║  - [ ] Test: updateProfile con campos inválidos              ║
║  - [ ] Test: deleteUser con órdenes activas                  ║
║  - [ ] Test: cambio de rol                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### `/oden:test generate [module]`

Genera tests basados en specs.

**Usa:** `test-engineer` agent

**Lee:**
- `docs/reference/modules/{module}-spec.md`
- Especialmente secciones de:
  - Validaciones
  - Estados y transiciones
  - Edge cases
  - Testing checklist

**Genera:**
- Unit tests para validaciones
- Integration tests para flujos
- Tests de transiciones de estado

---

## Integración con Specs

Los tests se generan basándose en las especificaciones:

### De la Spec → A Tests

| Sección Spec | Tipo de Test |
|--------------|--------------|
| Validaciones de campo | Unit tests |
| Transiciones de estado | State machine tests |
| API endpoints | Integration tests |
| Flujos de usuario | E2E tests |
| Edge cases | Específicos por caso |

### Ejemplo

Si la spec dice:
```markdown
### 5.1 Validaciones de Campo
| Campo | Regla | Mensaje |
| name | No vacío | "El nombre es requerido" |
| name | Max 100 chars | "El nombre no puede exceder 100 caracteres" |
```

Genera:
```typescript
describe('Order validations', () => {
  it('should require name', () => {
    expect(() => createOrder({ name: '' }))
      .toThrow('El nombre es requerido');
  });

  it('should reject name > 100 chars', () => {
    expect(() => createOrder({ name: 'a'.repeat(101) }))
      .toThrow('El nombre no puede exceder 100 caracteres');
  });
});
```

---

## Flujo Recomendado

1. **Al crear spec:** `/oden:spec orders`
2. **Generar tests:** `/oden:test generate orders`
3. **Implementar código:** (desarrollo)
4. **Ejecutar tests:** `/oden:test run`
5. **Si fallan:** `/oden:test fix`
6. **Verificar coverage:** `/oden:test coverage`

---

## Guardar Resultados

Los resultados de tests se guardan en:
```
docs/development/current/{feature}/TEST_RESULTS_{fecha}.md
```

Para referencia en daily logs.
