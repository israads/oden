---
allowed-tools: Read, LS, Glob, Grep, Task, WebSearch, WebFetch
description: Investigación técnica - buscar soluciones, comparar opciones
---

# Oden Forge - Technical Research

Comandos para investigación técnica durante el desarrollo.

## Usage

```
/oden:research [subcommand] [topic]
```

## Subcomandos

### `/oden:research how [pregunta]`

Investiga cómo implementar algo específico.

**Usa:** `technical-researcher` + `search-specialist` agents

**Ejemplo:**
```
/oden:research how "implementar WebSockets con Supabase"
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║         INVESTIGACIÓN: WebSockets con Supabase               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  RESUMEN                                                     ║
║  Supabase ofrece Realtime subscriptions basado en Postgres   ║
║  LISTEN/NOTIFY. No son WebSockets puros pero similar.        ║
║                                                              ║
║  IMPLEMENTACIÓN                                              ║
║                                                              ║
║  1. Habilitar Realtime en tabla:                             ║
║  ```sql                                                      ║
║  ALTER PUBLICATION supabase_realtime                         ║
║  ADD TABLE orders;                                           ║
║  ```                                                         ║
║                                                              ║
║  2. Suscribirse desde cliente:                               ║
║  ```typescript                                               ║
║  const channel = supabase                                    ║
║    .channel('orders-changes')                                ║
║    .on('postgres_changes',                                   ║
║      { event: '*', schema: 'public', table: 'orders' },      ║
║      (payload) => console.log(payload)                       ║
║    )                                                         ║
║    .subscribe();                                             ║
║  ```                                                         ║
║                                                              ║
║  CONSIDERACIONES                                             ║
║  - Límite de 200 conexiones en plan gratuito                 ║
║  - Payload máximo 1MB                                        ║
║  - Requiere RLS configurado                                  ║
║                                                              ║
║  RECURSOS                                                    ║
║  - https://supabase.com/docs/guides/realtime                 ║
║  - https://github.com/supabase/realtime                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### `/oden:research compare [option1] vs [option2]`

Compara dos tecnologías/enfoques.

**Usa:** `technical-researcher` + `data-analyst` agents

**Ejemplo:**
```
/oden:research compare "Zustand vs Redux Toolkit"
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║            COMPARACIÓN: Zustand vs Redux Toolkit             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  CRITERIO           ZUSTAND         REDUX TOOLKIT            ║
║  ──────────────────────────────────────────────────────────  ║
║  Bundle size        ~1KB            ~11KB                    ║
║  Boilerplate        Mínimo          Moderado                 ║
║  Learning curve     Baja            Media                    ║
║  DevTools           ✅ (extensión)  ✅ (mejor)               ║
║  TypeScript         ✅ Excelente    ✅ Excelente             ║
║  Middleware         Básico          Robusto                  ║
║  Async handling     Nativo          RTK Query                ║
║  Ecosistema         Pequeño         Grande                   ║
║  Community          Creciendo       Establecida              ║
║                                                              ║
║  CUÁNDO USAR CADA UNO                                        ║
║                                                              ║
║  ZUSTAND:                                                    ║
║  - Proyectos pequeños/medianos                               ║
║  - Prototipado rápido                                        ║
║  - State simple sin mucha lógica                             ║
║  - Bundle size es crítico                                    ║
║                                                              ║
║  REDUX TOOLKIT:                                              ║
║  - Proyectos grandes/enterprise                              ║
║  - State complejo con mucha lógica                           ║
║  - Necesitas DevTools avanzados                              ║
║  - Equipo ya conoce Redux                                    ║
║                                                              ║
║  RECOMENDACIÓN PARA TU PROYECTO                              ║
║  Basado en: {tipo de proyecto del technical-decisions.md}    ║
║  → {recomendación específica}                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### `/oden:research best-practice [topic]`

Busca best practices para un tema.

**Usa:** `technical-researcher` agent

**Ejemplo:**
```
/oden:research best-practice "error handling React"
```

### `/oden:research library [name]`

Investiga una librería específica.

**Usa:** `technical-researcher` agent + Context7

**Output:**
- Qué hace
- Cómo instalar
- Ejemplos de uso
- Pros/contras
- Alternativas

### `/oden:research docs [library] [topic]`

Busca documentación específica.

**Usa:** Context7 MCP si disponible

**Ejemplo:**
```
/oden:research docs "next.js" "app router"
```

### `/oden:research security [area]`

Investiga consideraciones de seguridad.

**Usa:** `technical-researcher` + `penetration-tester` agents

**Areas:**
- `auth` - Autenticación segura
- `api` - Seguridad de API
- `data` - Protección de datos
- `frontend` - XSS, CSRF, etc.

---

## Integración con Proyecto

La investigación considera el contexto del proyecto:

1. **Stack tecnológico** - De technical-decisions.md
2. **Tipo de proyecto** - Web, mobile, etc.
3. **Scope** - MVP vs Modo Turbo
4. **Constraints** - Performance, bundle size, etc.

Las recomendaciones se adaptan a tu proyecto específico.

---

## Guardar Investigación

Investigaciones importantes se guardan en:
```
docs/reference/research/{topic}.md
```

Para referencia futura y evitar re-investigar lo mismo.

---

## Uso Típico

```bash
# Antes de elegir tecnología
/oden:research compare "Prisma vs Drizzle"

# Cuando no sabes cómo hacer algo
/oden:research how "upload files to S3"

# Para seguir mejores prácticas
/oden:research best-practice "React performance"

# Para entender una librería
/oden:research library "tanstack-query"
```
