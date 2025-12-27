---
allowed-tools: Bash, Read, Write, Edit, LS, Glob, Grep, Task
description: Code review automático antes de PR
---

# Oden Forge - Code Review

Ejecuta un code review completo usando múltiples agentes especializados.

## Usage

```
/oden:review [scope]
```

Scope puede ser:
- `staged` - Solo cambios staged (default)
- `branch` - Todo el branch actual vs main
- `file path/to/file` - Un archivo específico
- `module nombre` - Un módulo completo

## Proceso

### Paso 1: Identificar Cambios

```bash
# Para staged
git diff --cached --name-only

# Para branch
git diff main...HEAD --name-only

# Para archivo específico
# Usar el path proporcionado
```

### Paso 2: Ejecutar Reviews en Paralelo

Invocar múltiples agentes simultáneamente:

1. **code-reviewer** - Review general de calidad
   - Legibilidad
   - Mejores prácticas
   - Bugs potenciales

2. **architect-review** - Review de arquitectura
   - Patrones correctos
   - Consistencia con technical-decisions.md
   - Separación de concerns

3. **code-analyzer** - Análisis profundo
   - Bugs potenciales
   - Security issues
   - Performance concerns

### Paso 3: Consolidar Resultados

Crear reporte unificado:

```markdown
# Code Review Report

**Fecha:** {fecha}
**Scope:** {staged/branch/file}
**Archivos revisados:** {N}

---

## 🔴 Crítico (Bloquea merge)

| Archivo | Línea | Issue | Sugerencia |
|---------|-------|-------|------------|
| {file} | {line} | {issue} | {fix} |

## 🟡 Advertencias (Revisar)

| Archivo | Línea | Issue | Sugerencia |
|---------|-------|-------|------------|
| {file} | {line} | {issue} | {fix} |

## 🟢 Sugerencias (Opcional)

| Archivo | Línea | Mejora |
|---------|-------|--------|
| {file} | {line} | {suggestion} |

---

## Verificación contra Specs

| Módulo | Spec | Cumple |
|--------|------|--------|
| {module} | {spec-file} | ✅/❌ |

---

## Resumen

- **Issues críticos:** {N}
- **Advertencias:** {N}
- **Sugerencias:** {N}
- **Recomendación:** ✅ Listo para merge / ❌ Requiere cambios
```

### Paso 4: Acciones Sugeridas

Si hay issues críticos:
```
❌ No hacer merge hasta resolver:
1. {issue 1} en {file}:{line}
2. {issue 2} en {file}:{line}
```

Si solo hay warnings:
```
⚠️ Considera revisar antes de merge:
1. {warning 1}
2. {warning 2}
```

Si todo OK:
```
✅ Listo para merge
No se encontraron issues críticos.
```

## Integración con Specs

El review verifica que el código cumpla con:
- `docs/reference/technical-decisions.md`
- `docs/reference/modules/{module}-spec.md`

Específicamente:
- Patrones de arquitectura definidos
- Validaciones especificadas
- Manejo de errores según spec
- Nombres y convenciones

## Output

El reporte se guarda en:
```
docs/development/current/{feature}/REVIEW_{fecha}.md
```

Y se muestra en consola un resumen.
