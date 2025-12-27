---
allowed-tools: Bash, Read, Write, LS, Glob, Grep, TodoWrite
description: Registrar progreso diario (DAY_X_COMPLETED.md)
---

# Oden Forge - Daily Logger

Actúa como **Daily Logger** para documentar el progreso del día.

## Usage

```
/oden:daily
```

## Cuándo Usar

Ejecutar al final de cada día de desarrollo para:
- Documentar lo completado
- Registrar métricas
- Identificar bloqueantes
- Planificar mañana

## Proceso

### Paso 1: Identificar Feature Actual

Detectar en qué feature se está trabajando:
```bash
# Ver si hay carpeta de desarrollo activa
ls docs/development/current/
```

### Paso 2: Determinar Número de Día

```bash
# Contar DAY_X existentes
ls docs/development/current/{feature}/DAY_*.md 2>/dev/null | wc -l
```

El nuevo archivo será `DAY_{N+1}_COMPLETED.md`

### Paso 3: Recopilar Información

Preguntar o detectar:

1. **Tareas completadas**
   - ¿Qué terminaste hoy?
   - ¿Qué commits hiciste?

2. **Archivos modificados**
   ```bash
   git diff --stat HEAD~{commits_hoy}
   ```

3. **Métricas**
   ```bash
   # Líneas agregadas/eliminadas
   git diff --shortstat HEAD~{commits_hoy}
   ```

4. **Aprendizajes**
   - ¿Decisiones importantes?
   - ¿Problemas resueltos?
   - ¿Tips para el futuro?

5. **Issues**
   - ¿Bugs encontrados?
   - ¿Bloqueantes activos?

6. **Próximos pasos**
   - ¿Qué harás mañana?
   - ¿Qué depende de otros?

### Paso 4: Crear DAY_X_COMPLETED.md

```markdown
# Day {X} - {YYYY-MM-DD}

**Feature:** {nombre}
**Autor:** {nombre}

---

## ✅ Completado

### Tareas Finalizadas
- [x] {Tarea 1}
- [x] {Tarea 2}
- [x] {Tarea 3}

### Archivos Creados/Modificados
```
{output de git diff --stat}
```

### Commits del Día
```
{output de git log --oneline --since="00:00"}
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Líneas agregadas | +{X} |
| Líneas eliminadas | -{Y} |
| Archivos nuevos | {N} |
| Archivos modificados | {M} |
| Tests nuevos | {T} |
| Tiempo de trabajo | {H}h |

---

## 💡 Aprendizajes

### Decisiones Tomadas
{Si hubo decisiones importantes}

### Tips Descubiertos
{Patrones útiles, shortcuts, etc.}

---

## 🐛 Issues

### Resueltos
| Issue | Solución |
|-------|----------|
| {desc} | {cómo se resolvió} |

### Pendientes
| Issue | Severidad | Workaround |
|-------|-----------|------------|
| {desc} | {alta/media/baja} | {si existe} |

---

## 🚧 Bloqueantes

{Si hay bloqueantes activos}

---

## ⏭️ Próximos Pasos

### Mañana
1. [ ] {Tarea 1}
2. [ ] {Tarea 2}
3. [ ] {Tarea 3}

### Dependencias
- {Esperando X de Y}

---

**Actualizado:** {timestamp}
```

### Paso 5: Actualizar Índices

1. Actualizar `docs/development/current/{feature}/README.md`:
   ```markdown
   ## Daily Logs
   - [Day 1](./DAY_1_COMPLETED.md) - {resumen}
   - [Day 2](./DAY_2_COMPLETED.md) - {resumen}
   ...
   ```

2. Actualizar implementation-plan.md si hay cambios de timeline

## Automatización

### Script de Ayuda

El comando puede usar este script para recopilar métricas:

```bash
#!/bin/bash
# .claude/scripts/oden/daily-metrics.sh

echo "=== MÉTRICAS DEL DÍA ==="
echo ""

# Commits de hoy
echo "📝 Commits:"
git log --oneline --since="00:00" 2>/dev/null || echo "No commits hoy"
echo ""

# Archivos modificados
echo "📁 Archivos modificados:"
git diff --stat HEAD~$(git log --oneline --since="00:00" | wc -l) 2>/dev/null || echo "Sin cambios"
echo ""

# Líneas de código
echo "📊 Líneas:"
git diff --shortstat HEAD~$(git log --oneline --since="00:00" | wc -l) 2>/dev/null || echo "Sin cambios"
```

## Checklist

Antes de terminar el día:

- [ ] DAY_X_COMPLETED.md creado
- [ ] Todas las tareas listadas
- [ ] Métricas registradas
- [ ] Issues documentados
- [ ] Próximos pasos definidos
- [ ] Archivo commiteado

## Tips

1. **Hazlo diario** - No acumules varios días
2. **Sé específico** - "Implementé login" > "Trabajé en auth"
3. **Incluye contexto** - Por qué se tomaron decisiones
4. **Registra problemas** - Ayuda al futuro tú
5. **Planifica mañana** - Termina el día con claridad

## Referencia

Ver agente completo en: `.claude/agents/daily-logger.md`
