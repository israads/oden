---
allowed-tools: Read, LS, Glob, Grep
description: Verificar que todo esté listo antes de codificar
---

# Oden Forge - Pre-Code Checklist

Verifica que toda la documentación esté completa antes de escribir código.

## Usage

```
/oden:checklist
```

## Propósito

> "Solo cuando TODO esté ✅, empezar a codificar."

Este comando verifica que se ha completado toda la fase de documentación según la metodología Oden.

## Verificaciones

### 1. Technical Decisions (2000+ líneas)

```bash
# Verificar existencia
test -f docs/reference/technical-decisions.md

# Contar líneas
wc -l docs/reference/technical-decisions.md
# Target: >= 2000 líneas
```

Verificar contenido:
- [ ] Stack tecnológico documentado
- [ ] Schema de BD completo
- [ ] Interfaces TypeScript definidas
- [ ] Patrones de arquitectura
- [ ] APIs diseñadas
- [ ] Seguridad considerada

### 2. Competitive Analysis (1000+ líneas)

```bash
test -f docs/reference/competitive-analysis.md
wc -l docs/reference/competitive-analysis.md
# Target: >= 1000 líneas
```

Verificar contenido:
- [ ] 3+ competidores analizados
- [ ] Matriz de features
- [ ] Diferenciadores identificados

### 3. User Stories

```bash
test -f docs/reference/user-stories.md
```

Verificar contenido:
- [ ] 2+ user personas
- [ ] User stories principales
- [ ] Criterios de aceptación

### 4. Module Specifications (800+ líneas c/u)

```bash
# Listar specs
ls docs/reference/modules/

# Verificar líneas de cada uno
for f in docs/reference/modules/*.md; do
  echo "$f: $(wc -l < $f) líneas"
done
# Target: >= 800 líneas cada uno
```

Módulos requeridos según technical-decisions.md

### 5. Implementation Plan

```bash
test -f docs/reference/implementation-plan.md
wc -l docs/reference/implementation-plan.md
```

Verificar contenido:
- [ ] Timeline semana por semana
- [ ] Tareas con estimaciones
- [ ] Dependencias mapeadas
- [ ] Milestones definidos
- [ ] Riesgos identificados

### 6. Estructura de Documentación

```bash
# Verificar estructura
ls -la docs/
ls -la docs/guides/
ls -la docs/reference/
ls -la docs/reference/modules/
ls -la docs/development/current/
ls -la docs/development/completed/
```

## Output

### Si TODO está listo ✅

```
╔══════════════════════════════════════════════════════════════╗
║                  ✅ CHECKLIST COMPLETADO                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📄 Technical Decisions     ✅  2,450 líneas                 ║
║  📊 Competitive Analysis    ✅  1,230 líneas                 ║
║  👥 User Stories            ✅  890 líneas                   ║
║  📋 Module Specs            ✅  3 módulos (avg 950 líneas)   ║
║  📅 Implementation Plan     ✅  680 líneas                   ║
║  📁 Doc Structure           ✅  Completa                     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎉 ¡Estás listo para codificar!                            ║
║                                                              ║
║  Siguiente paso:                                             ║
║  1. Crea tu primer feature branch                            ║
║  2. Empieza con las tareas de Semana 1                       ║
║  3. Usa /oden:daily al final de cada día                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Si FALTA algo ❌

```
╔══════════════════════════════════════════════════════════════╗
║                  ❌ CHECKLIST INCOMPLETO                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📄 Technical Decisions     ⚠️  1,200 líneas (need 2000+)    ║
║  📊 Competitive Analysis    ✅  1,230 líneas                 ║
║  👥 User Stories            ❌  No encontrado                ║
║  📋 Module Specs            ⚠️  2/3 módulos completos        ║
║  📅 Implementation Plan     ✅  680 líneas                   ║
║  📁 Doc Structure           ✅  Completa                     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🚫 NO empezar a codificar todavía                          ║
║                                                              ║
║  Acciones requeridas:                                        ║
║                                                              ║
║  1. /oden:architect                                          ║
║     → Completar technical-decisions.md (+800 líneas)         ║
║                                                              ║
║  2. /oden:analyze                                            ║
║     → Crear user-stories.md                                  ║
║                                                              ║
║  3. /oden:spec payments                                      ║
║     → Falta spec del módulo payments                         ║
║                                                              ║
║  Luego vuelve a ejecutar /oden:checklist                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Criterios de Aprobación

| Documento | Mínimo | Ideal |
|-----------|--------|-------|
| technical-decisions.md | 2000 líneas | 3000+ |
| competitive-analysis.md | 1000 líneas | 1500+ |
| user-stories.md | Existe | 500+ líneas |
| {module}-spec.md | 800 líneas c/u | 1000+ c/u |
| implementation-plan.md | Existe | 500+ líneas |

## Excepciones

Para proyectos pequeños (MVP rápido), se puede aprobar con:
- technical-decisions.md: 1000+ líneas
- competitive-analysis.md: 500+ líneas
- Al menos 1 spec de módulo: 500+ líneas

Pero documentar la decisión de reducir documentación.

## Filosofía

> "Documentación > 8,000 líneas antes de primera línea de código"

Este checklist existe porque:
1. Documentar primero evita retrabajo
2. Specs claras = desarrollo más rápido
3. Decisiones informadas = menos bugs
4. El desarrollador sabe EXACTAMENTE qué construir

No es burocracia, es eficiencia.
