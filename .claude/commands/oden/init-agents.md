---
allowed-tools: Bash, Read, Write, LS, Glob
description: Instalar agentes útiles para desarrollo de aplicaciones
---

# Oden Forge - Init Agents

Instala una colección curada de agentes especializados para desarrollo de aplicaciones.

## Usage

```
/oden:init-agents [category]
```

Categories:
- (vacío) - Instalar todos los agentes recomendados
- `core` - Solo agentes esenciales
- `frontend` - Agentes de frontend
- `backend` - Agentes de backend
- `mobile` - Agentes de mobile
- `devops` - Agentes de DevOps
- `data` - Agentes de datos

## Agentes Disponibles

### Core (Esenciales) - `core`

Agentes fundamentales para cualquier proyecto:

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `fullstack-developer` | Desarrollo end-to-end | Implementación general |
| `code-reviewer` | Code review | Revisar PRs y código |
| `debugger` | Debugging | Resolver errores |
| `test-engineer` | Testing | Estrategia y tests |
| `code-analyzer` | Análisis de código | Buscar bugs potenciales |
| `technical-writer` | Documentación | Escribir docs |
| `git-flow-manager` | Git workflow | Branches y PRs |

### Frontend - `frontend`

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `frontend-developer` | React/Vue/Svelte | UI components |
| `ui-ux-designer` | Diseño de interfaces | UX/UI |
| `javascript-pro` | JavaScript avanzado | ES6+, async |
| `graphql-architect` | GraphQL | APIs GraphQL |

### Backend - `backend`

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `backend-architect` | Arquitectura backend | APIs, servicios |
| `database-architect` | Diseño de BD | Schemas, queries |
| `database-optimization` | Optimización BD | Performance |
| `python-pro` | Python | FastAPI, Django |
| `php-pro` | PHP | Laravel, etc. |

### Mobile - `mobile`

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `mobile-developer` | Cross-platform | React Native, Flutter |
| `ios-developer` | iOS nativo | Swift, SwiftUI |

### DevOps - `devops`

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `devops-engineer` | CI/CD, infra | Pipelines |
| `deployment-engineer` | Deployments | Releases |
| `performance-engineer` | Performance | Optimización |

### Data - `data`

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `data-engineer` | Data pipelines | ETL |
| `data-analyst` | Análisis | Métricas |
| `data-scientist` | ML/Stats | Modelos |

### Especialistas

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `ai-engineer` | LLM/RAG | Integrar IA |
| `mcp-expert` | MCP servers | Integraciones |
| `prompt-engineer` | Prompts | Optimizar prompts |
| `search-specialist` | Búsqueda web | Investigación |
| `technical-researcher` | Research técnico | Evaluar opciones |
| `error-detective` | Logs/errores | Debug avanzado |
| `penetration-tester` | Seguridad | Auditorías |

### Utilidades

| Agente | Descripción | Uso |
|--------|-------------|-----|
| `parallel-worker` | Trabajo paralelo | Multi-tareas |
| `file-analyzer` | Análisis archivos | Logs, outputs |
| `test-runner` | Ejecutar tests | CI/tests |
| `context-manager` | Contexto | Sesiones largas |

---

## Instrucciones de Instalación

### Verificar directorio de agentes

```bash
# Verificar que existe el directorio
mkdir -p ~/.claude/agents

# Listar agentes actuales
ls ~/.claude/agents/*.md 2>/dev/null | wc -l
```

### Descargar Agentes

Los agentes se descargan desde el repositorio de Oden Forge:

```bash
ODEN_REPO="https://raw.githubusercontent.com/tu-usuario/oden-forge/main"

# Core agents
for agent in fullstack-developer code-reviewer debugger test-engineer code-analyzer technical-writer git-flow-manager; do
  curl -sL "$ODEN_REPO/agents/$agent.md" -o ~/.claude/agents/$agent.md
done
```

### Alternativamente: Copiar desde local

Si tienes Oden Forge clonado:

```bash
cp /path/to/oden-forge/.claude/agents/*.md ~/.claude/agents/
```

---

## Proceso de Instalación

### Paso 1: Detectar agentes existentes

```bash
echo "=== Agentes actuales ==="
ls ~/.claude/agents/*.md 2>/dev/null | while read f; do
  basename "$f" .md
done
```

### Paso 2: Selección por categoría

Si el usuario especificó categoría:
- `core`: Instalar solo los 7 agentes esenciales
- `frontend`: Core + 4 agentes de frontend
- `backend`: Core + 5 agentes de backend
- `mobile`: Core + 2 agentes de mobile
- `devops`: Core + 3 agentes de devops
- `data`: Core + 3 agentes de data
- (vacío): Todos los agentes recomendados

### Paso 3: Copiar agentes

Los agentes incluidos en Oden Forge están en:
```
oden-forge/.claude/agents-library/
```

Copiar a:
```
~/.claude/agents/
```

### Paso 4: Verificar instalación

```bash
echo "=== Agentes instalados ==="
ls ~/.claude/agents/*.md | wc -l
echo "agentes instalados"
```

---

## Output

```
╔══════════════════════════════════════════════════════════════╗
║               ODEN FORGE - AGENTS INSTALLED                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ✅ Instalados: {N} agentes                                  ║
║                                                              ║
║  CORE:                                                       ║
║  ├─ fullstack-developer                                      ║
║  ├─ code-reviewer                                            ║
║  ├─ debugger                                                 ║
║  ├─ test-engineer                                            ║
║  ├─ code-analyzer                                            ║
║  ├─ technical-writer                                         ║
║  └─ git-flow-manager                                         ║
║                                                              ║
║  {CATEGORY}:                                                 ║
║  ├─ {agent1}                                                 ║
║  └─ {agent2}                                                 ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  USO:                                                        ║
║  Los agentes están disponibles vía /oden:dev                 ║
║                                                              ║
║  Ejemplos:                                                   ║
║  /oden:dev fullstack  → Desarrollo end-to-end                ║
║  /oden:dev debug      → Debugging                            ║
║  /oden:dev test       → Testing                              ║
║  /oden:dev review     → Code review                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Agentes Ya Instalados

Si el usuario ya tiene agentes (como los de CCPM), este comando:
1. Lista los existentes
2. Pregunta si quiere agregar los nuevos
3. No sobrescribe sin confirmación

---

## Crear Agentes Personalizados

Para crear un agente personalizado:

```markdown
# ~/.claude/agents/mi-agente.md

---
name: mi-agente
description: Descripción del agente
model: sonnet
tools: Read, Write, Edit, Bash
---

# Mi Agente

## Rol
{Descripción del rol}

## Responsabilidades
1. {responsabilidad 1}
2. {responsabilidad 2}

## Proceso
{Cómo trabaja}

## Output
{Qué produce}
```

---

## Notas

- Los agentes se invocan con `Task` tool y `subagent_type`
- Requieren Claude Code con soporte de agentes
- Los agentes son archivos `.md` en `~/.claude/agents/`
