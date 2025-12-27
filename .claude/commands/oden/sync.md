---
allowed-tools: Bash, Read, Write, LS, Task
description: Sincronizar proyecto con GitHub usando flujo CCPM
---

# Oden Forge - Sync

Sincroniza el proyecto con GitHub integrando con los comandos de CCPM.

## Usage

```
/oden:sync [subcommand]
```

## Subcomandos

### `/oden:sync setup`

Configura el proyecto para sincronización con GitHub.

**Verifica:**
- Git repo inicializado
- Remote origin configurado
- GitHub CLI autenticado
- Labels creados en repo

**Ejecuta:**
```bash
# Verificar git repo
git remote get-url origin || echo "❌ No remote. Run: git remote add origin <url>"

# Verificar gh auth
gh auth status || echo "❌ Not authenticated. Run: gh auth login"

# Crear labels si no existen
gh label create "epic" --color "0E8A16" --description "Epic issue" 2>/dev/null || true
gh label create "task" --color "1D76DB" --description "Task issue" 2>/dev/null || true
gh label create "feature" --color "A2EEEF" --description "New feature" 2>/dev/null || true
gh label create "bug" --color "D73A4A" --description "Bug fix" 2>/dev/null || true
```

---

### `/oden:sync prd [nombre]`

Crea o actualiza un PRD (Product Requirement Document).

**Integra con CCPM:**
```
/pm:prd-new {nombre}
```

**Flujo:**
1. Brainstorming sobre el feature
2. Crear PRD en `.claude/prds/{nombre}.md`
3. Incluir: problema, user stories, requisitos, éxito

---

### `/oden:sync epic [nombre]`

Convierte PRD a Epic técnico.

**Integra con CCPM:**
```
/pm:prd-parse {nombre}
```

**Flujo:**
1. Lee PRD existente
2. Análisis técnico
3. Crea epic en `.claude/epics/{nombre}/epic.md`

---

### `/oden:sync tasks [nombre]`

Descompone Epic en tasks individuales.

**Integra con CCPM:**
```
/pm:epic-decompose {nombre}
```

**Flujo:**
1. Lee epic existente
2. Crea tasks en `.claude/epics/{nombre}/001.md`, `002.md`, etc.
3. Identifica dependencias y paralelismo

---

### `/oden:sync github [nombre]`

Sincroniza con GitHub (crea issues).

**Integra con CCPM:**
```
/pm:epic-sync {nombre}
```

**Flujo:**
1. Crea issue de Epic en GitHub
2. Crea sub-issues para cada task
3. Aplica labels: `epic`, `task`, `epic:{nombre}`
4. Renombra archivos locales con issue numbers
5. Crea worktree para desarrollo

**Output:**
```
✅ Synced to GitHub
  - Epic: #123
  - Tasks: 5 sub-issues created
  - Worktree: ../epic-{nombre}

Next: /oden:sync start {nombre}
```

---

### `/oden:sync start [nombre]`

Inicia desarrollo en el epic.

**Integra con CCPM:**
```
/pm:epic-start {nombre}
```

**Flujo:**
1. Cambia al worktree del epic
2. Muestra tasks disponibles
3. Puede iniciar agentes paralelos para tasks independientes

---

### `/oden:sync issue [número]`

Trabaja en un issue específico.

**Integra con CCPM:**
```
/pm:issue-start {número}
```

**Flujo:**
1. Lee el issue
2. Crea branch para el issue
3. Inicia desarrollo según spec

---

### `/oden:sync close [número]`

Cierra un issue completado.

**Integra con CCPM:**
```
/pm:issue-close {número}
```

**Flujo:**
1. Verifica que está completo
2. Actualiza estado local
3. Cierra issue en GitHub

---

### `/oden:sync status`

Muestra estado de sincronización.

**Integra con CCPM:**
```
/pm:status
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                    SYNC STATUS                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  EPICS ACTIVOS:                                              ║
║  ├─ auth (#123) - 3/5 tasks complete                        ║
║  └─ payments (#130) - 0/4 tasks complete                    ║
║                                                              ║
║  ISSUES IN PROGRESS:                                         ║
║  ├─ #124: Login form                                         ║
║  └─ #125: Password reset                                     ║
║                                                              ║
║  SYNC STATUS:                                                ║
║  ├─ Local → GitHub: ✅ Up to date                           ║
║  └─ GitHub → Local: ✅ Up to date                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Flujo Completo Oden + CCPM

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INICIALIZAR PROYECTO                                    │
│     /oden:init                                              │
│     → Wizard de proyecto                                    │
│     → Estructura de docs                                    │
│     → Stack tecnológico                                     │
│                                                             │
│  2. DOCUMENTACIÓN (Metodología Oden)                        │
│     /oden:architect   → technical-decisions.md              │
│     /oden:analyze     → competitive-analysis.md             │
│     /oden:spec auth   → auth-spec.md                        │
│     /oden:plan        → implementation-plan.md              │
│     /oden:checklist   → ✅ Ready                            │
│                                                             │
│  3. CREAR FEATURE (CCPM)                                    │
│     /oden:sync prd auth      → Crear PRD                    │
│     /oden:sync epic auth     → Crear Epic                   │
│     /oden:sync tasks auth    → Descomponer tasks            │
│     /oden:sync github auth   → Push a GitHub                │
│                                                             │
│  4. DESARROLLO                                              │
│     /oden:sync start auth    → Iniciar desarrollo           │
│     /oden:dev fullstack      → Implementar                  │
│     /oden:test run           → Testing                      │
│     /oden:daily              → Log diario                   │
│                                                             │
│  5. COMPLETAR                                               │
│     /oden:sync close #123    → Cerrar issue                 │
│     /oden:git pr             → Create PR                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integración con CCPM

Oden Forge **no duplica** funcionalidad de CCPM. En su lugar:

| Oden Forge | CCPM Subyacente |
|------------|-----------------|
| `/oden:sync prd` | `/pm:prd-new` |
| `/oden:sync epic` | `/pm:prd-parse` |
| `/oden:sync tasks` | `/pm:epic-decompose` |
| `/oden:sync github` | `/pm:epic-sync` |
| `/oden:sync start` | `/pm:epic-start` |
| `/oden:sync issue` | `/pm:issue-start` |
| `/oden:sync close` | `/pm:issue-close` |
| `/oden:sync status` | `/pm:status` |

**Beneficio:** Si ya usas CCPM, puedes usar sus comandos directamente.
Oden Forge solo agrega el wrapper para consistencia de namespace.

---

## Requisitos

1. **CCPM instalado** en `~/.claude/commands/pm/`
2. **GitHub CLI** (`gh`) instalado y autenticado
3. **Git** repo inicializado con remote

## Verificar Requisitos

```bash
# Verificar CCPM
ls ~/.claude/commands/pm/epic-sync.md && echo "✅ CCPM installed"

# Verificar gh
gh auth status && echo "✅ GitHub CLI ready"

# Verificar git remote
git remote get-url origin && echo "✅ Git remote configured"
```
