---
allowed-tools: Bash, Read, Write, LS, Glob, Grep, Task
description: Git workflow - branches, PRs, y gestión de código
---

# Oden Forge - Git Workflow

Comandos para gestión de Git siguiendo mejores prácticas.

## Usage

```
/oden:git [subcommand]
```

## Subcomandos

### `/oden:git start [feature-name]`

Inicia trabajo en una nueva feature.

**Usa:** `git-flow-manager` agent

**Proceso:**
1. Asegura que main está actualizado
2. Crea branch `feature/{name}`
3. Crea carpeta en `docs/development/current/{name}/`
4. Inicializa README.md del feature

```bash
# Equivalente a:
git checkout main
git pull origin main
git checkout -b feature/{name}
mkdir -p docs/development/current/{name}
```

### `/oden:git sync`

Sincroniza branch actual con main.

**Proceso:**
1. Fetch de origin
2. Rebase sobre main
3. Resuelve conflictos si los hay

```bash
git fetch origin
git rebase origin/main
```

### `/oden:git pr`

Prepara y crea Pull Request.

**Usa:** `git-flow-manager` + `code-reviewer` agents

**Proceso:**
1. Ejecuta `/oden:review` automáticamente
2. Genera descripción de PR basada en:
   - Commits del branch
   - DAY_X_COMPLETED.md files
   - Spec del módulo
3. Crea PR en GitHub

**Template de PR:**
```markdown
## Summary
{Resumen de cambios basado en commits}

## Changes
- {Lista de cambios principales}

## Spec Reference
- `docs/reference/modules/{module}-spec.md`

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing completed

## Screenshots
{Si hay cambios de UI}

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
```

### `/oden:git status`

Muestra estado detallado del proyecto.

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                      GIT STATUS                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  BRANCH: feature/payments                                    ║
║  BASE: main (3 commits behind)                               ║
║                                                              ║
║  COMMITS EN BRANCH: 8                                        ║
║  ├─ abc1234 feat: Add payment form                           ║
║  ├─ def5678 feat: Integrate Stripe                           ║
║  ├─ ghi9012 fix: Handle declined cards                       ║
║  └─ ... (5 more)                                             ║
║                                                              ║
║  ARCHIVOS MODIFICADOS: 12                                    ║
║  ├─ src/components/PaymentForm.tsx                           ║
║  ├─ src/services/stripeService.ts                            ║
║  └─ ... (10 more)                                            ║
║                                                              ║
║  ESTADO:                                                     ║
║  ├─ Staged: 2 files                                          ║
║  ├─ Modified: 3 files                                        ║
║  └─ Untracked: 1 file                                        ║
║                                                              ║
║  DAILY LOGS: 3 (DAY_1 → DAY_3)                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### `/oden:git log`

Muestra historial con contexto de proyecto.

**Output:**
```
HISTORIAL DE FEATURE: payments

Semana 1:
├─ DAY_1 (2024-01-15)
│  ├─ abc1234 feat: Add payment form
│  └─ def5678 feat: Integrate Stripe
│
├─ DAY_2 (2024-01-16)
│  ├─ ghi9012 fix: Handle declined cards
│  └─ jkl3456 test: Add payment tests
│
└─ DAY_3 (2024-01-17)
   └─ mno7890 refactor: Extract payment utils

Total: 5 commits, 12 files changed
Progress: 60% of spec completed
```

### `/oden:git finish`

Finaliza feature y limpia.

**Proceso:**
1. Verifica PR merged
2. Mueve docs a `completed/`
3. Elimina branch local
4. Actualiza main

```bash
git checkout main
git pull origin main
git branch -d feature/{name}
mv docs/development/current/{name} docs/development/completed/
```

---

## Convenciones de Commits

### Formato
```
{type}: {description}

{body opcional}
```

### Types
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `refactor`: Refactoring sin cambio de funcionalidad
- `test`: Tests
- `docs`: Documentación
- `style`: Formato, sin cambio de código
- `chore`: Tareas de mantenimiento

### Ejemplos
```
feat: Add payment processing with Stripe
fix: Handle edge case when order is empty
refactor: Extract validation logic to separate module
test: Add unit tests for payment service
docs: Update API documentation for payments
```

---

## Branch Naming

### Features
```
feature/{module}-{description}
```
Ejemplos:
- `feature/auth-social-login`
- `feature/orders-bulk-actions`
- `feature/payments-stripe`

### Fixes
```
fix/{issue-number}-{description}
```
Ejemplos:
- `fix/123-login-redirect`
- `fix/456-payment-timeout`

### Hotfixes
```
hotfix/{description}
```
Para fixes urgentes en producción.

---

## Integración con Daily Log

Los commits del día se documentan en `/oden:daily`:

```markdown
### Commits del Día
```
abc1234 feat: Add payment form
def5678 feat: Integrate Stripe
ghi9012 fix: Handle declined cards
```
```

---

## Flujo Típico

```bash
# 1. Iniciar feature
/oden:git start payments

# 2. Durante desarrollo (cada día)
git add .
git commit -m "feat: Add payment form"
/oden:daily

# 3. Sincronizar periódicamente
/oden:git sync

# 4. Antes de PR
/oden:review
/oden:git pr

# 5. Después de merge
/oden:git finish
```
