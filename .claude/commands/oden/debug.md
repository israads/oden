---
allowed-tools: Bash, Read, Write, Edit, LS, Glob, Grep, Task
description: Debugging - analizar errores y encontrar soluciones
---

# Oden Forge - Debug

Herramientas de debugging para investigar y resolver errores.

## Usage

```
/oden:debug [subcommand] [context]
```

## Subcomandos

### `/oden:debug error [mensaje/stack]`

Analiza un error y sugiere soluciones.

**Usa:** `debugger` + `error-detective` agents

**Input:**
- Mensaje de error
- Stack trace
- Contexto del código

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                    ERROR ANALYSIS                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ERROR: TypeError: Cannot read property 'id' of undefined    ║
║                                                              ║
║  UBICACIÓN: src/services/orders.ts:145                       ║
║                                                              ║
║  CAUSA PROBABLE:                                             ║
║  El objeto `order` es undefined cuando se intenta acceder    ║
║  a `order.id`. Esto ocurre cuando:                           ║
║  1. La query no encontró el order                            ║
║  2. El ID pasado es inválido                                 ║
║  3. Hay un problema de timing/async                          ║
║                                                              ║
║  SOLUCIÓN SUGERIDA:                                          ║
║  ```typescript                                               ║
║  const order = await getOrder(orderId);                      ║
║  if (!order) {                                               ║
║    throw new NotFoundError(`Order ${orderId} not found`);    ║
║  }                                                           ║
║  // Ahora es seguro acceder a order.id                       ║
║  ```                                                         ║
║                                                              ║
║  ARCHIVOS A REVISAR:                                         ║
║  - src/services/orders.ts:145                                ║
║  - src/repositories/orderRepository.ts                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### `/oden:debug logs [file]`

Analiza archivos de log para encontrar patrones de error.

**Usa:** `error-detective` + `file-analyzer` agents

**Analiza:**
- Patrones de errores repetidos
- Correlación temporal
- Secuencia de eventos antes del error

### `/oden:debug trace [function]`

Traza el flujo de una función a través del código.

**Usa:** `code-analyzer` agent

**Output:**
```
TRACE: processOrder()

1. src/api/orders.ts:45 → processOrder(orderId)
   ↓
2. src/services/orderService.ts:78 → validateOrder(order)
   ↓
3. src/validators/orderValidator.ts:23 → checkItems(items)
   ↓
4. src/validators/orderValidator.ts:45 → validateItem(item) ❌ ERROR HERE
   ↓
   Error: "Invalid item quantity"

VARIABLES EN SCOPE:
- orderId: "abc-123"
- order: { id: "abc-123", items: [...] }
- item: { id: "xyz", quantity: -1 } ← PROBLEMA: quantity negativo
```

### `/oden:debug perf [area]`

Analiza problemas de performance.

**Usa:** `performance-engineer` agent

**Areas:**
- `api` - Latencia de endpoints
- `db` - Queries lentos
- `render` - Performance de UI
- `bundle` - Tamaño de bundle

### `/oden:debug compare [branch]`

Compara comportamiento entre branches para encontrar regresión.

**Usa:** `code-analyzer` agent

**Output:**
```
COMPARACIÓN: main vs feature/payments

ARCHIVOS MODIFICADOS:
- src/services/paymentService.ts (+45 -12)
- src/utils/calculations.ts (+8 -3)

CAMBIOS DE COMPORTAMIENTO:
1. paymentService.calculateTotal()
   - ANTES: Retornaba número
   - AHORA: Retorna string (posible bug)

2. calculations.roundAmount()
   - ANTES: 2 decimales
   - AHORA: 4 decimales (intencional?)

TESTS AFECTADOS:
- payment.test.ts:67 - Ahora falla
- calculations.test.ts:34 - Ahora falla
```

---

## Proceso de Debugging

### 1. Reproducir
```bash
/oden:debug error "TypeError: Cannot read property..."
```

### 2. Localizar
```bash
/oden:debug trace functionName
```

### 3. Entender
```bash
/oden:debug logs app.log
```

### 4. Comparar (si regresión)
```bash
/oden:debug compare main
```

### 5. Resolver
El agente sugiere el fix específico.

---

## Tips de Debugging

### Para errores de runtime:
1. Captura el stack trace completo
2. Identifica la línea exacta
3. Revisa el valor de variables en scope

### Para errores intermitentes:
1. Busca patrones en logs
2. Considera race conditions
3. Revisa timing de async operations

### Para regresiones:
1. Identifica el commit que introdujo el bug
2. Compara comportamiento antes/después
3. Revisa tests que deberían haber fallado

---

## Integración con Daily Log

Los debugging sessions se documentan en `/oden:daily`:

```markdown
## 🐛 Issues Encontrados

### Resueltos
| Issue | Causa | Solución |
|-------|-------|----------|
| TypeError en orders.ts:145 | Order undefined | Agregué validación null check |

### Pendientes
| Issue | Severidad | Investigación |
|-------|-----------|---------------|
| Timeout en pagos | Alta | Posible N+1 query |
```
