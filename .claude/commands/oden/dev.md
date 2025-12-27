---
allowed-tools: Bash, Read, Write, Edit, LS, Glob, Grep, Task, TodoWrite
description: Comandos de desarrollo - invocar agentes especializados durante implementación
---

# Oden Forge - Development Commands

Comandos para invocar agentes especializados durante la fase de implementación.

## Usage

```
/oden:dev [subcommand]
```

## Subcomandos Disponibles

### Desarrollo de Código

| Comando | Agente | Uso |
|---------|--------|-----|
| `/oden:dev fullstack` | fullstack-developer | Desarrollo end-to-end |
| `/oden:dev frontend` | frontend-developer | UI/React components |
| `/oden:dev backend` | backend-architect | APIs y servicios |
| `/oden:dev mobile` | mobile-developer | React Native/Flutter |
| `/oden:dev ios` | ios-developer | Swift/SwiftUI nativo |

### Base de Datos

| Comando | Agente | Uso |
|---------|--------|-----|
| `/oden:dev db` | database-architect | Diseño de schema |
| `/oden:dev db-optimize` | database-optimization | Optimizar queries |
| `/oden:dev supabase` | supabase-schema-architect | Supabase específico |

### Testing y QA

| Comando | Agente | Uso |
|---------|--------|-----|
| `/oden:dev test` | test-engineer | Estrategia de testing |
| `/oden:dev test-run` | test-runner | Ejecutar tests |
| `/oden:dev debug` | debugger | Debugging de errores |
| `/oden:dev review` | code-reviewer | Code review |

### DevOps

| Comando | Agente | Uso |
|---------|--------|-----|
| `/oden:dev devops` | devops-engineer | CI/CD, infraestructura |
| `/oden:dev deploy` | deployment-engineer | Deployments |
| `/oden:dev perf` | performance-engineer | Performance tuning |

### Análisis

| Comando | Agente | Uso |
|---------|--------|-----|
| `/oden:dev analyze-code` | code-analyzer | Análisis de código |
| `/oden:dev errors` | error-detective | Detectar errores en logs |
| `/oden:dev research` | technical-researcher | Investigación técnica |

### Utilidades

| Comando | Agente | Uso |
|---------|--------|-----|
| `/oden:dev git` | git-flow-manager | Git workflow |
| `/oden:dev docs` | technical-writer | Documentación técnica |
| `/oden:dev parallel` | parallel-worker | Trabajo paralelo |

---

## Instrucciones de Ejecución

Cuando el usuario ejecuta `/oden:dev [subcommand]`, debes:

1. **Identificar el agente** correspondiente al subcommand
2. **Cargar el contexto** del proyecto actual (technical-decisions.md, specs)
3. **Invocar el agente** usando Task tool con el agente apropiado
4. **Pasar contexto relevante** al agente

### Ejemplo de Invocación

Para `/oden:dev fullstack`:

```
Usa el Task tool con subagent_type="fullstack-developer" para:
1. Revisar el contexto actual del proyecto
2. Implementar la feature/tarea solicitada
3. Seguir las specs del módulo correspondiente
4. Reportar progreso
```

---

## Mapeo de Subcomandos a Agentes

```yaml
fullstack: fullstack-developer
frontend: frontend-developer
backend: backend-architect
mobile: mobile-developer
ios: ios-developer
db: database-architect
db-optimize: database-optimization
supabase: supabase-schema-architect
test: test-engineer
test-run: test-runner
debug: debugger
review: code-reviewer
devops: devops-engineer
deploy: deployment-engineer
perf: performance-engineer
analyze-code: code-analyzer
errors: error-detective
research: technical-researcher
git: git-flow-manager
docs: technical-writer
parallel: parallel-worker
```

---

## Contexto a Pasar

Al invocar cualquier agente, incluir:

1. **Proyecto actual**
   - Nombre del proyecto
   - Stack tecnológico (de technical-decisions.md)

2. **Feature actual**
   - Qué se está implementando
   - Spec relevante (de docs/reference/modules/)

3. **Progreso**
   - DAY_X actual
   - Tareas completadas/pendientes

---

## Uso Típico

```bash
# Desarrollo frontend
/oden:dev frontend
> "Implementa el componente OrderCard según la spec de orders"

# Debugging
/oden:dev debug
> "El test de auth está fallando en línea 45"

# Code review antes de PR
/oden:dev review
> "Revisa los cambios del módulo de pagos"

# Optimizar queries lentas
/oden:dev db-optimize
> "La query de órdenes tarda 2s, necesito optimizarla"
```

---

## Integración con Daily Log

Después de usar un agente de desarrollo:

1. Documenta el trabajo realizado
2. Ejecuta `/oden:daily` al final del día
3. El progreso se registra automáticamente
