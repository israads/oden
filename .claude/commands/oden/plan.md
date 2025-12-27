---
allowed-tools: Bash, Read, Write, LS, Glob, Grep, Task, TodoWrite
description: Crear plan de implementación semana por semana
---

# Oden Forge - Implementation Planner

Actúa como **Implementation Planner** para crear el plan de implementación detallado.

## Usage

```
/oden:plan
```

## Prerrequisitos

1. technical-decisions.md completo (`/oden:architect`)
2. competitive-analysis.md completo (`/oden:analyze`)
3. Especificaciones de módulos completas (`/oden:spec`)

## Responsabilidades

Como Implementation Planner, debes:

1. **Crear plan semana por semana** realista
2. **Dividir en tareas diarias** (max 1 día c/u)
3. **Identificar dependencias** entre tareas
4. **Definir milestones** con criterios de éxito
5. **Calcular tiempos** con buffers (20-30%)

## Proceso

### Paso 1: Inventario de Trabajo

Lee toda la documentación y lista:
- Módulos a implementar
- Features por módulo
- Dependencias técnicas
- Riesgos identificados

### Paso 2: Estimación

Para cada feature/tarea:

| Complejidad | Tiempo Base | Con Buffer |
|-------------|-------------|------------|
| Trivial | 2h | 2.5h |
| Simple | 4h | 5h |
| Medio | 8h (1 día) | 10h |
| Complejo | 16h (2 días) | 20h |
| Muy complejo | 24h+ (3+ días) | 30h+ |

### Multiplicadores:
- Nueva tecnología: 1.5x
- Integración externa: 1.3x
- Alta incertidumbre: 1.2x

### Paso 3: Secuenciación

Ordenar tareas considerando:
1. Dependencias técnicas
2. Valor de negocio
3. Riesgo (alto riesgo primero)
4. Disponibilidad de recursos

### Paso 4: Crear implementation-plan.md

```markdown
# Plan de Implementación: {Proyecto}

**Estado:** 🟢 Aprobado
**Última actualización:** {fecha}
**Modalidad:** {MVP/Modo Turbo}
**Duración:** {X} semanas

---

## 1. Resumen Ejecutivo

### Timeline de Alto Nivel

```
┌────────────────────────────────────────────────────────────┐
│                    TIMELINE DEL PROYECTO                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Sem 1-2    │████████│ Foundation                         │
│  Sem 3-4    │████████│ Core Features                      │
│  Sem 5-6    │████████│ Feature A                          │
│  Sem 7-8    │████████│ Feature B                          │
│  Sem 9-10   │████████│ Polish + Launch                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Milestones

| # | Milestone | Semana | Criterio de Éxito |
|---|-----------|--------|-------------------|
| M1 | Foundation Ready | 2 | Setup + CI/CD + Auth básico |
| M2 | Core Complete | 4 | CRUD principal funcionando |
| M3 | Feature Complete | 8 | Todas las features v1 |
| M4 | Launch Ready | 10 | QA passed, 0 bugs críticos |

---

## 2. Fase 1: Foundation (Semanas 1-2)

### Objetivo
Setup completo del proyecto con CI/CD y autenticación.

### Semana 1

#### Día 1-2: Project Setup

| ID | Tarea | Est. | Deps | Criterio Done |
|----|-------|------|------|---------------|
| 1.1 | Crear repo con template | 2h | - | Repo en GitHub |
| 1.2 | Setup estructura carpetas | 2h | 1.1 | Estructura según spec |
| 1.3 | Configurar TypeScript | 1h | 1.2 | Build sin errores |
| 1.4 | Setup ESLint + Prettier | 1h | 1.2 | Linting funciona |
| 1.5 | Configurar testing | 2h | 1.3 | Tests corren |

**Total: 8h**

#### Día 3-4: Database + Infra

| ID | Tarea | Est. | Deps | Criterio Done |
|----|-------|------|------|---------------|
| 1.6 | Setup Supabase/DB | 2h | - | Conexión OK |
| 1.7 | Crear schema inicial | 4h | 1.6 | Migraciones aplicadas |
| 1.8 | Setup variables de entorno | 1h | - | .env.example |
| 1.9 | Configurar ORM | 2h | 1.6, 1.7 | Queries funcionan |
| 1.10 | Setup GitHub Actions | 2h | 1.5 | Tests en PR |

**Total: 11h**

#### Día 5: Deploy + Buffer

| ID | Tarea | Est. | Deps | Criterio Done |
|----|-------|------|------|---------------|
| 1.11 | Setup Vercel/hosting | 2h | 1.1 | Deploy preview |
| 1.12 | Configurar staging | 1h | 1.11 | Deploy automático |
| 1.13 | Buffer imprevistos | 2h | - | - |
| 1.14 | Documentar setup | 1h | Todo | README actualizado |

**Total: 6h**

---

### Semana 2

#### Día 1-2: Authentication

| ID | Tarea | Est. | Deps | Criterio Done |
|----|-------|------|------|---------------|
| 2.1 | Integrar auth provider | 4h | 1.6 | Config completa |
| 2.2 | Implementar registro | 4h | 2.1 | Usuario puede registrar |
| 2.3 | Implementar login | 3h | 2.1 | Usuario puede login |
| 2.4 | Implementar logout | 1h | 2.3 | Sesión termina |

**Total: 12h**

#### Día 3-4: Auth Avanzado

| ID | Tarea | Est. | Deps | Criterio Done |
|----|-------|------|------|---------------|
| 2.5 | Reset password | 4h | 2.1 | Flow completo |
| 2.6 | Protected routes | 2h | 2.3 | Redirect funciona |
| 2.7 | Roles básicos | 4h | 2.3 | Admin vs User |
| 2.8 | Profile page | 2h | 2.3 | Ver/editar perfil |

**Total: 12h**

#### Día 5: Review + Tests

| ID | Tarea | Est. | Deps | Criterio Done |
|----|-------|------|------|---------------|
| 2.9 | Tests de auth | 3h | 2.1-2.8 | Coverage > 80% |
| 2.10 | Code review | 2h | Todo | PRs mergeados |
| 2.11 | Buffer | 2h | - | - |

**Total: 7h**

### Entregables Semana 2 (M1)
- [ ] Repo con CI/CD
- [ ] Database con schema
- [ ] Auth completo
- [ ] Deploy staging funcionando
- [ ] Tests pasando

---

## 3. Fase 2: Core Features (Semanas 3-4)

[Estructura similar para cada semana]

---

## 4. Fase 3: Feature Development (Semanas 5-8)

[Estructura similar para cada semana]

---

## 5. Fase 4: Polish + Launch (Semanas 9-10)

[Estructura similar con focus en QA y preparación]

---

## 6. Dependencias

### Grafo de Dependencias

```
Setup (1.1-1.5)
    │
    ├──▶ Database (1.6-1.9)──▶ Auth (2.1-2.8)──▶ Core CRUD (3.x)
    │                                               │
    └──▶ CI/CD (1.10-1.12)                         ├──▶ Feature A (5.x)
                                                    │
                                                    ├──▶ Feature B (6.x)
                                                    │
                                                    └──▶ Feature C (7.x)
```

### Dependencias Críticas

| Tarea | Bloquea | Impacto si late |
|-------|---------|-----------------|
| 1.7 Schema | Todo lo que usa DB | Alto |
| 2.1 Auth | Features con usuarios | Alto |
| 3.x Core CRUD | Todas las features | Alto |

---

## 7. Riesgos y Mitigación

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Auth integration issues | Media | Alto | Usar servicio managed, tener backup plan |
| DB performance | Baja | Alto | Índices desde día 1, monitoring |
| Scope creep | Alta | Medio | Specs firmadas, change control |
| Key person unavailable | Media | Alto | Documentar todo, pair programming |

### Contingencias

- **Si auth tarda más:** Usar auth básico, mejorar después
- **Si feature X compleja:** Simplificar para MVP, completar en v1.1
- **Si bugs críticos:** Buffer de 20% está para esto

---

## 8. Definition of Done

### Por Tarea
- [ ] Código implementado según spec
- [ ] Tests escritos (si aplica)
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Desplegado en staging

### Por Milestone
- [ ] Todas las tareas del milestone done
- [ ] Tests de integración pasando
- [ ] Demo exitosa con stakeholders
- [ ] Docs actualizadas
- [ ] No bugs críticos

---

## 9. Recursos

### Equipo
| Rol | % Tiempo | Semanas |
|-----|----------|---------|
| Full-stack | 100% | 1-10 |
| Designer | 50% | 1-4 |
| QA | 50% | 8-10 |

### Servicios
| Servicio | Costo/mes | Total (10 sem) |
|----------|-----------|----------------|
| Supabase | $25 | $62.50 |
| Vercel | $0-20 | $50 |
| GitHub | $0 | $0 |
| **Total** | | ~$115 |

---

## 10. Métricas de Seguimiento

### Weekly Check

| Métrica | Target | Cómo medir |
|---------|--------|------------|
| Tasks completed | 80%+ | GitHub Projects |
| PRs merged | All | GitHub |
| Critical bugs | 0 | Issues |
| Tests passing | 100% | CI/CD |

### Burndown

```
Tareas
│
40 ├──●
   │    ╲
30 ├─────●
   │       ╲
20 ├─────────●
   │           ╲
10 ├─────────────●
   │               ╲
 0 ├─────────────────●
   └───┬───┬───┬───┬───┬
      S2  S4  S6  S8  S10
```

---

## 11. Comunicación

| Ceremonia | Frecuencia | Duración |
|-----------|------------|----------|
| Daily standup | Diario | 15 min |
| Weekly review | Semanal | 1h |
| Milestone review | Por milestone | 2h |

---

## 12. Checklist Pre-Código

Antes de empezar a codificar, verificar:

- [ ] technical-decisions.md > 2000 líneas
- [ ] competitive-analysis.md completo
- [ ] Specs de módulos principales > 800 líneas c/u
- [ ] Este plan revisado y aprobado
- [ ] Stack tecnológico confirmado
- [ ] Accesos a servicios listos
- [ ] Repo y CI/CD configurados

Solo cuando TODO esté ✅, ejecutar:
```
/oden:checklist
```

Y si pasa, empezar a codificar.

---

**Creado:** {fecha}
**Autor:** Implementation Planner Agent
**Aprobado por:** {nombre/fecha}
```

## Output

El plan debe incluir:
- [ ] Timeline visual
- [ ] Semanas detalladas con tareas diarias
- [ ] Estimaciones con buffers
- [ ] Dependencias mapeadas
- [ ] Riesgos identificados
- [ ] Definition of Done clara
- [ ] Métricas de seguimiento

## Siguientes Pasos

Después del plan:

```
/oden:checklist  → Verificar todo listo
/oden:daily      → Empezar a registrar progreso
```

## Referencia

Ver agente completo en: `.claude/agents/implementation-planner.md`
