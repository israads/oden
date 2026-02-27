# Oden Forge Documentation

Sistema completo de metodología Documentation-First Development para crear proyectos profesionales usando Claude Code y compatible con otros LLMs.

## 📚 Estructura de Documentación

### `/docs/reference/` - Decisiones Técnicas y Referencias
Documentos fundamentales que definen la arquitectura y decisiones del proyecto:
- `technical-decisions.md` - Decisiones técnicas, stack, arquitectura, schema BD
- `competitive-analysis.md` - Análisis de competidores y benchmarks
- `implementation-plan.md` - Plan de implementación semana por semana
- `modules/` - Especificaciones detalladas por módulo (800+ líneas cada una)

### `/docs/guides/` - Guías de Uso
Guías paso a paso para usar Oden Forge:
- `getting-started.md` - Cómo empezar con Oden Forge
- `methodology.md` - Filosofía Documentation-First Development
- `workflow.md` - Flujo completo PRD → Epic → Tasks → Development
- `validation.md` - Sistema de validación y quality assurance

### `/docs/development/current/` - Trabajo Activo
Documentos de trabajo actual en progreso:
- PRDs en desarrollo
- Epics activos
- Tasks in-progress
- Session tracking

### `/docs/development/completed/` - Trabajo Completado
Archivo de trabajo completado:
- PRDs implementados
- Epics cerrados
- Retrospectivas
- Lessons learned

### `/docs/archived/` - Material Histórico
Documentos obsoletos pero conservados para referencia:
- Versiones anteriores de decisiones técnicas
- PRDs cancelados
- Experimentos descartados

### `/docs/temp/` - Temporal
Archivos temporales y work-in-progress (mantener ≤5 archivos):
- Borradores
- Notas de research
- Experimentos

## 🛠️ Comandos Principales de Oden Forge

### Ciclo Principal de Desarrollo
```bash
# 1. Crear PRD con research inteligente
/oden:prd feature-name

# 2. Validar PRD automáticamente
/oden:prd-validate feature-name

# 3. Convertir a Epic técnico
/oden:epic feature-name

# 4. Validar Epic técnicamente
/oden:epic-validate feature-name

# 5. Descomponer en tasks individuales
/oden:tasks feature-name

# 6. Sincronizar con GitHub Issues
/oden:sync feature-name

# 7. Ejecutar desarrollo orquestado
/oden:work epic/feature-name
```

### Comandos de Setup y Arquitectura
```bash
# Setup inicial del proyecto
/oden:init

# Crear decisiones técnicas y arquitectura
/oden:architect

# Gestionar MCPs
/oden:mcp install|status|update|recommend
```

### Comandos de Desarrollo y Debug
```bash
# Debug sistema con orquestación
/oden:debug

# Ayuda y documentación
/oden:help
```

## 🎯 Filosofía: Documentation-First Development

> **"Documenta y diseña COMPLETAMENTE antes de codificar"**

### Principios Core
1. **Documentation-First**: Todo se documenta antes de codificar
2. **Research-Backed**: Decisiones basadas en análisis de competidores y mercado
3. **Validation-Driven**: Validación automática de completitud y coherencia
4. **Implementation-Ready**: Documentos listos para implementación inmediata

### Flujo de Validación Automática
- **PRD Validation**: Completitud, consistencia, calidad
- **Epic Validation**: Implementabilidad técnica, dependencias, arquitectura
- **Continuous Quality**: Auto-review y mejora continua

## 📊 Métricas de Calidad

### Estándares Mínimos Pre-Desarrollo
- `technical-decisions.md`: 2000-4000 líneas
- Análisis competitivo: 3-5 competidores analizados
- Specs de módulos: 800+ líneas cada una
- Total pre-código: 8000+ líneas de documentación

### Quality Gates
- **PRD Validation**: ≥85% score para aprobar
- **Epic Validation**: ≥85% implementation readiness
- **Consistency**: 0 contradicciones críticas
- **Testability**: 100% acceptance criteria testeable

## 🔄 Integración con Otros LLMs

Esta estructura `/docs` está diseñada para ser compatible con cualquier LLM:

### Para GPT-4/GPT-o1
```
Contexto del proyecto disponible en:
- docs/README.md (este archivo)
- docs/reference/technical-decisions.md
- docs/development/current/ (trabajo activo)
```

### Para Claude/Anthropic
```
Sistema nativo - usa comandos /oden: directamente
Referencia completa en .claude/CLAUDE.md
```

### Para Copilot/GitHub Models
```
Documentación estructurada en docs/
Metodología explicada en docs/guides/
Código en desarrollo en docs/development/current/
```

### Para Gemini/Google
```
Estructura semántica clara
Referencias técnicas en docs/reference/
Guías paso a paso en docs/guides/
```

## 📁 Mapeo de Archivos Clave

### Archivos Críticos para Cualquier LLM
- `docs/README.md` - Este archivo (overview completo)
- `docs/reference/technical-decisions.md` - Arquitectura y decisiones técnicas
- `docs/guides/methodology.md` - Metodología Documentation-First
- `docs/development/current/` - Estado actual del proyecto

### Solo para Claude Code
- `.claude/CLAUDE.md` - Instrucciones específicas de Claude
- `.claude/commands/oden/` - Comandos nativos de Oden Forge
- `.claude/rules/` - Reglas de coordinación y operación

## 🚀 Getting Started (Para Cualquier LLM)

### 1. Leer Contexto del Proyecto
```markdown
Primero lee:
1. docs/README.md (este archivo)
2. docs/reference/technical-decisions.md (si existe)
3. docs/development/current/ (trabajo activo)
```

### 2. Entender la Metodología
```markdown
Metodología Oden: Documentation-First Development
- NUNCA empieces a codificar sin specs completas
- TODO se valida antes de implementar
- Research de competidores SIEMPRE
- Specs de 800+ líneas por módulo
```

### 3. Seguir el Flujo
```markdown
Flujo completo:
1. Research & Brainstorming → PRD
2. PRD Validation → Fixes si necesarios
3. Technical Analysis → Epic
4. Epic Validation → Architecture check
5. Task Decomposition → Individual tasks
6. Implementation → Orchestrated development
```

### 4. Mantener Calidad
```markdown
Quality Gates:
- PRD ≥85% completeness, consistency, quality
- Epic ≥85% technical viability, dependencies
- 0 contradicciones críticas
- 100% acceptance criteria testeable
```

## 📝 Formato de Documentos

### Frontmatter Estándar
Todos los documentos incluyen YAML frontmatter:
```yaml
---
name: feature-name
status: backlog|in-progress|completed
created: 2024-01-15T14:30:45Z
updated: 2024-01-15T14:30:45Z
validation_status: PASS|REVIEW_NEEDED|MAJOR_GAPS  # Si aplica
---
```

### Estructura de PRD
```markdown
# PRD: Feature Name

## 📊 Executive Summary
## 🎯 Problem Statement
## 👥 User Stories & Personas
## ⚙️ Requirements
## 📈 Success Criteria
## 🚧 Constraints & Assumptions
## ❌ Out of Scope
## 🔗 Dependencies
## 💡 Research Insights
```

### Estructura de Epic
```markdown
# Epic: Feature Name

## 🎯 Overview
## 🏗️ Architecture Decisions
## 🔄 Work Streams
## 📊 Task Summary
## ✅ Acceptance Criteria (Technical)
## ⚠️ Risks & Mitigations
## 🔗 Dependencies
```

## 🎛️ Configuración para Otros LLMs

### Variables de Entorno Recomendadas
```bash
export ODEN_DOCS_PATH="docs/"
export ODEN_METHODOLOGY="Documentation-First"
export ODEN_VALIDATION_THRESHOLD="85"
export ODEN_PRD_MIN_LINES="800"
export ODEN_SPEC_MIN_LINES="800"
```

### Contexto Mínimo para Cualquier LLM
```markdown
CONTEXTO CRÍTICO:
1. Metodología: Documentation-First Development
2. Flujo: PRD → Epic → Tasks → Development
3. Validación: Automática con thresholds de calidad
4. Research: Siempre analizar 3-5 competidores
5. Specs: Mínimo 800 líneas por módulo
6. Quality Gate: ≥85% en todas las validaciones
```

---

**🎯 Objetivo**: Crear proyectos profesionales enterprise-ready con documentación exhaustiva y validación automática de calidad.

**📧 Soporte**: Ver `.claude/CLAUDE.md` para instrucciones específicas de Claude o adaptar metodología a tu LLM preferido usando esta documentación.