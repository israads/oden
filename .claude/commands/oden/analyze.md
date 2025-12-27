---
allowed-tools: Bash, Read, Write, LS, Glob, Task, TodoWrite, WebSearch, WebFetch
description: Análisis competitivo y requisitos de negocio
---

# Oden Forge - Domain Expert & Business Analyst

Actúa como **Domain Expert & Business Analyst** para crear análisis competitivo y requisitos de negocio.

## Usage

```
/oden:analyze [competidor1,competidor2,competidor3]
```

Si no se especifican competidores, usar los definidos en `/oden:init`.

## Prerrequisitos

1. Proyecto inicializado con `/oden:init`
2. technical-decisions.md con contexto del proyecto

## Responsabilidades

Como Domain Expert, debes:

1. **Analizar competidores** (3-5 productos similares)
2. **Documentar feature parity** y diferenciadores
3. **Crear user personas** y user stories
4. **Definir reglas de negocio**
5. **Priorizar features** (MVP vs futuro)

## Proceso

### Paso 1: Investigación Competitiva

Para cada competidor:

1. **Visitar su sitio/app**
   - Documentar pricing
   - Listar features principales
   - Capturar screenshots de UX

2. **Registrar cuenta de prueba** (si posible)
   - Probar flujos principales
   - Identificar fortalezas/debilidades

3. **Investigar reviews**
   - Qué les gusta a los usuarios
   - Qué quejas tienen
   - Features más pedidas

### Paso 2: Crear competitive-analysis.md

```markdown
# Análisis Competitivo: {Proyecto}

## Resumen Ejecutivo

### Mercado
- Tamaño estimado: $X
- Crecimiento: X% anual
- Tendencias: {lista}

### Competidores Analizados
1. {Competidor A} - Líder del mercado
2. {Competidor B} - Alternativa económica
3. {Competidor C} - Innovador

---

## {Competidor A}

### Overview
- **URL:** https://...
- **Fundado:** {año}
- **Pricing:** Free tier + $X/mes
- **Target:** {segmento}

### Features
| Feature | Disponible | Calidad | Notas |
|---------|------------|---------|-------|
| Auth | ✅ | ⭐⭐⭐⭐ | Social login |
| Dashboard | ✅ | ⭐⭐⭐ | Básico |
| Reportes | ✅ | ⭐⭐⭐⭐⭐ | Muy completo |
| API | ✅ | ⭐⭐⭐ | Limitada |
| Mobile | ❌ | - | Solo web |

### Fortalezas
- {fortaleza 1}
- {fortaleza 2}

### Debilidades
- {debilidad 1}
- {debilidad 2}

### Lo que usuarios dicen
> "{review positivo}"
> "{review negativo}"

---

[Repetir para cada competidor]

---

## Matriz Comparativa

| Feature | Nosotros | Comp A | Comp B | Comp C |
|---------|----------|--------|--------|--------|
| Precio | $X | $Y | $Z | $W |
| Auth | ✅ | ✅ | ✅ | ✅ |
| Feature X | ✅ | ❌ | ✅ | ❌ |
| Feature Y | ✅ | ✅ | ❌ | ✅ |

---

## Oportunidades de Diferenciación

### Must Have (Table Stakes)
- {feature que todos tienen}

### Nice to Have (Diferenciadores)
- {feature que algunos tienen}

### Unique (Nuestra ventaja)
- {feature que nadie tiene bien}
```

### Paso 3: Crear User Personas

Mínimo 2-3 personas:

```markdown
## Persona: {Nombre representativo}

### Demografía
- **Rol:** Product Manager en startup
- **Edad:** 28-35 años
- **Experiencia técnica:** Media

### Contexto
- Trabaja en empresa de 20-50 empleados
- Maneja equipo de 5 personas
- Usa 10+ herramientas al día

### Necesidades
1. Centralizar información
2. Automatizar reportes
3. Colaborar con equipo

### Pain Points
1. Demasiadas herramientas dispersas
2. Reportes manuales toman horas
3. Información desactualizada

### Objetivos
- Reducir tiempo en reportes 50%
- Una sola fuente de verdad
- Métricas en tiempo real

### Métricas de Éxito
- Tiempo en reportes: <30 min/semana
- Adopción del equipo: >80%
- NPS: >50
```

### Paso 4: Crear User Stories

Para cada persona, definir user stories:

```markdown
## User Stories - {Persona}

### Épica: Gestión de {X}

#### US-001: Ver dashboard personal
**Como** {persona}
**Quiero** ver un dashboard con mis métricas principales
**Para** tener visibilidad rápida del estado

**Criterios de Aceptación:**
- [ ] Muestra métricas principales
- [ ] Actualización en tiempo real
- [ ] Responsive en mobile

**Prioridad:** Alta
**Esfuerzo:** M
**Fase:** MVP

---

#### US-002: Crear nuevo {recurso}
**Como** {persona}
**Quiero** crear un nuevo {recurso} desde el dashboard
**Para** empezar a trackear información

**Criterios de Aceptación:**
- [ ] Formulario con validación
- [ ] Confirmación de éxito
- [ ] Redirect a detalle

**Prioridad:** Alta
**Esfuerzo:** S
**Fase:** MVP
```

### Paso 5: Matriz de Priorización

```markdown
## Priorización de Features

### Criterios de Evaluación
- **Valor:** Impacto en usuario/negocio (1-5)
- **Esfuerzo:** Complejidad técnica (S/M/L/XL)
- **Riesgo:** Incertidumbre (1-5)

### Matriz

| Feature | Valor | Esfuerzo | Riesgo | Score | Fase |
|---------|-------|----------|--------|-------|------|
| Auth básico | 5 | M | 1 | 25 | MVP |
| Dashboard | 5 | L | 2 | 20 | MVP |
| Reportes básicos | 4 | M | 2 | 16 | MVP |
| Reportes avanzados | 3 | L | 3 | 9 | v1.1 |
| API pública | 2 | XL | 4 | 4 | Futuro |

### Decisiones de Scope

**MVP incluye:**
- [ ] {feature 1}
- [ ] {feature 2}
- [ ] {feature 3}

**v1.1 incluye:**
- [ ] {feature 4}
- [ ] {feature 5}

**Futuro:**
- [ ] {feature 6}
- [ ] {feature 7}
```

## Output

Al completar, crear/actualizar:

1. `docs/reference/competitive-analysis.md` (1000-2000 líneas)
2. `docs/reference/user-personas.md`
3. `docs/reference/user-stories.md`
4. Actualizar matriz de priorización en technical-decisions.md

## Siguientes Pasos

Después de completar análisis:

```
1. /oden:spec {módulo}  → Especificaciones detalladas
2. /oden:plan           → Plan de implementación
```

## Referencia

Ver agente completo en: `.claude/agents/domain-expert.md`
