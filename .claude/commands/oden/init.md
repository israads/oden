---
allowed-tools: Bash, Read, Write, LS, Glob, AskUserQuestion, Task, TodoWrite
description: Wizard interactivo para crear proyectos desde cero con metodología Oden
---

# Oden Forge - Project Initialization Wizard

Wizard interactivo que guía al usuario a crear un proyecto profesional siguiendo la metodología Documentation-First Development.

## Usage

```
/oden:init [nombre-proyecto]
```

## Filosofía Core

> "Documenta y diseña COMPLETAMENTE antes de codificar"

Este wizard NO genera código. Genera la **documentación completa** que permitirá desarrollar con claridad.

## Wizard Flow

### PASO 1: Información Básica

Pregunta al usuario:

**1.1 Nombre del Proyecto**
Si no se proporcionó como argumento, preguntar:
- Nombre del proyecto (slug: lowercase, guiones)
- Descripción breve (1-2 oraciones)

**1.2 Tipo de Proyecto**
Opciones:
- **Web Application**: Frontend-focused (React, Next.js, Vue, Svelte)
- **Mobile App**: iOS/Android (React Native, Flutter, Native)
- **Backend/API**: Servicios y APIs (Node.js, Python, Go, Rust)
- **Full-Stack**: Frontend + Backend integrado
- **CLI Tool**: Herramienta de línea de comandos

**1.3 Dominio/Industria**
Opciones con ejemplos:
- E-commerce / Retail
- SaaS / B2B
- FinTech / Pagos
- Healthcare
- Education
- Social / Community
- Productivity / Tools
- Gaming
- IoT / Hardware
- Otro (especificar)

---

### PASO 2: Nivel de Experiencia

Adapta el nivel de detalle y enseñanza según experiencia:

**2.1 ¿Cuál es tu nivel de experiencia?**

- **Principiante** (0-2 años):
  - Explicaciones detalladas de cada decisión
  - Guías de System Design incluidas
  - Recursos de aprendizaje en cada paso
  - Más preguntas de validación

- **Intermedio** (2-5 años):
  - Guías contextuales cuando sea relevante
  - Mejores prácticas destacadas
  - Balance entre guía y autonomía

- **Avanzado** (5+ años):
  - Solo decisiones clave
  - Flujo rápido
  - Asume conocimiento de patrones

---

### PASO 3: Scope del Proyecto

**3.1 ¿MVP o Modo Turbo?**

Explica claramente las diferencias:

**MVP (Minimum Viable Product)**
- Timeline: 8-10 semanas
- Features: 30-40% del producto final
- Objetivo: Validar mercado rápidamente
- Riesgo: Deuda técnica alta
- Ideal para: Startups, validación de ideas

**Modo Turbo**
- Timeline: 14-20 semanas
- Features: 100% profesional desde día 1
- Objetivo: Producto enterprise-ready
- Beneficio: +1000% más profesional
- Ideal para: Productos establecidos, B2B

**3.2 Competidores a analizar**

Pide 3-5 competidores o productos similares para análisis competitivo.

---

### PASO 4: Requerimientos Técnicos

Basado en tipo de proyecto, hacer preguntas específicas:

#### Para Web/Full-Stack:

**4.1 Frontend Framework**
- React (Recommended para ecosistema amplio)
- Next.js (React + SSR + API routes)
- Vue.js (Curva de aprendizaje suave)
- Svelte/SvelteKit (Performance, sintaxis simple)
- Angular (Enterprise, TypeScript-first)

**4.2 Styling**
- Tailwind CSS (Recommended - utility-first)
- CSS Modules
- Styled Components
- Sass/SCSS
- UI Library (shadcn/ui, MUI, Chakra)

**4.3 State Management**
- React Context (Simple, built-in)
- Zustand (Recommended - simple, performant)
- Redux Toolkit (Complex state, time-travel)
- Jotai/Recoil (Atomic state)
- TanStack Query (Server state)

#### Para Backend/API:

**4.4 Backend Framework**
- Node.js + Express (Flexible, grande ecosistema)
- Node.js + Fastify (Performance)
- Python + FastAPI (Recommended - modern, fast)
- Python + Django (Batteries included)
- Go + Gin/Echo (Performance, concurrency)
- Rust + Actix/Axum (Maximum performance)

**4.5 Database**
- PostgreSQL (Recommended - versatile, reliable)
- MySQL/MariaDB (Traditional, widely supported)
- MongoDB (Document store, flexible schema)
- SQLite (Simple, embedded)
- Supabase (Postgres + Auth + Realtime)
- PlanetScale (MySQL, serverless)

**4.6 Authentication**
- Supabase Auth (Recommended - simple, complete)
- Auth0 (Enterprise, flexible)
- Clerk (Modern, developer-friendly)
- NextAuth.js (Next.js specific)
- Custom JWT (Full control)

#### Para Mobile:

**4.7 Mobile Framework**
- React Native (Recommended - web skills transfer)
- Flutter (Performance, single codebase)
- iOS Native (Swift/SwiftUI)
- Android Native (Kotlin)
- Expo (React Native simplified)

**4.8 Backend para Mobile**
- Supabase (Recommended - realtime, auth, storage)
- Firebase (Google ecosystem)
- AWS Amplify (AWS ecosystem)
- Custom API

---

### PASO 5: Features Clave

**5.1 ¿Qué features son CRÍTICAS para v1?**

Lista interactiva donde usuario marca:
- [ ] Autenticación de usuarios
- [ ] Roles y permisos
- [ ] Dashboard/Admin panel
- [ ] Pagos/Subscripciones
- [ ] Notificaciones (email/push)
- [ ] Búsqueda/Filtros
- [ ] Exportación de datos
- [ ] Multi-idioma
- [ ] Modo offline
- [ ] Real-time updates
- [ ] Analytics/Métricas
- [ ] API pública
- Otras (especificar)

**5.2 ¿Integraciones externas necesarias?**
- Pasarelas de pago (Stripe, PayPal, MercadoPago)
- Email (SendGrid, Resend, AWS SES)
- Storage (S3, Cloudinary, Supabase Storage)
- Maps (Google Maps, Mapbox)
- AI/ML (OpenAI, Anthropic, Hugging Face)
- Otras

---

### PASO 6: Infraestructura

**6.1 Hosting/Deployment**
- Vercel (Recommended para Next.js)
- Netlify (JAMstack)
- Railway (Simple, databases included)
- Render (Full-stack)
- AWS (Enterprise, scalable)
- GCP/Azure
- Self-hosted

**6.2 CI/CD**
- GitHub Actions (Recommended)
- GitLab CI
- CircleCI
- Ninguno por ahora

---

### PASO 7: Resumen y Confirmación

Muestra resumen completo de todas las decisiones:

```
╔══════════════════════════════════════════════════════════════╗
║                    ODEN FORGE - RESUMEN                      ║
╠══════════════════════════════════════════════════════════════╣
║ Proyecto: {nombre}                                           ║
║ Tipo: {tipo}                                                 ║
║ Dominio: {dominio}                                           ║
║ Scope: {mvp/turbo}                                           ║
╠══════════════════════════════════════════════════════════════╣
║ STACK TECNOLÓGICO                                            ║
║ ├─ Frontend: {framework}                                     ║
║ ├─ Backend: {framework}                                      ║
║ ├─ Database: {db}                                            ║
║ ├─ Auth: {auth}                                              ║
║ └─ Hosting: {hosting}                                        ║
╠══════════════════════════════════════════════════════════════╣
║ FEATURES V1                                                  ║
║ {lista de features seleccionadas}                            ║
╠══════════════════════════════════════════════════════════════╣
║ COMPETIDORES A ANALIZAR                                      ║
║ {lista de competidores}                                      ║
╚══════════════════════════════════════════════════════════════╝
```

Preguntar: "¿Confirmas estas decisiones para comenzar?"

---

## PASO 8: Generación de Estructura

Una vez confirmado, crear:

### 8.1 Estructura de Directorios

```bash
mkdir -p {proyecto}/docs/{guides,reference/modules,development/{current,completed},archived,temp}
mkdir -p {proyecto}/.claude/{commands,scripts,agents,rules,context}
```

### 8.2 Archivos Iniciales

Crear estos archivos con contenido inicial:

1. **docs/README.md** - Índice de documentación
2. **docs/reference/technical-decisions.md** - Template con secciones vacías
3. **docs/reference/competitive-analysis.md** - Template
4. **docs/reference/implementation-plan.md** - Template
5. **CLAUDE.md** - Instrucciones del proyecto

### 8.3 Contenido de technical-decisions.md (Template)

```markdown
# Technical Decisions - {Proyecto}

**Estado:** 🟡 En Progreso
**Última actualización:** {fecha}

---

## 1. Visión General

### 1.1 Descripción del Proyecto
{descripción}

### 1.2 Objetivos Principales
- [ ] Objetivo 1
- [ ] Objetivo 2

### 1.3 Scope
**Modalidad:** {MVP/Modo Turbo}
**Timeline estimado:** {X semanas}

---

## 2. Stack Tecnológico

### 2.1 Frontend
- **Framework:** {selección}
- **Justificación:** {por qué}
- **Alternativas consideradas:** {otras opciones}

### 2.2 Backend
- **Framework:** {selección}
- **Justificación:** {por qué}

### 2.3 Base de Datos
- **Sistema:** {selección}
- **Justificación:** {por qué}

### 2.4 Autenticación
- **Solución:** {selección}
- **Justificación:** {por qué}

### 2.5 Hosting/Infraestructura
- **Plataforma:** {selección}
- **Justificación:** {por qué}

---

## 3. Arquitectura

### 3.1 Diagrama de Alto Nivel
[Pendiente: Crear con Technical Architect]

### 3.2 Patrones de Diseño
[Pendiente: Definir patrones]

### 3.3 Estructura de Carpetas
[Pendiente: Definir estructura]

---

## 4. Schema de Base de Datos

### 4.1 Entidades Principales
[Pendiente: Definir con Technical Architect]

### 4.2 Relaciones
[Pendiente]

### 4.3 Índices
[Pendiente]

---

## 5. API Design

### 5.1 Endpoints Principales
[Pendiente: Definir con Technical Architect]

### 5.2 Autenticación de API
[Pendiente]

---

## 6. Features por Fase

### Fase 1 (Semanas 1-4)
{features críticas}

### Fase 2 (Semanas 5-8)
{features secundarias}

### Fase 3+
{features futuras}

---

## 7. Dependencias

### 7.1 Dependencias de Producción
[Pendiente]

### 7.2 Dependencias de Desarrollo
[Pendiente]

---

## 8. Consideraciones de Seguridad

[Pendiente: Definir con Technical Architect]

---

## 9. Performance Targets

- Latencia API: < 100ms
- Time to Interactive: < 3s
- Lighthouse Score: > 90

---

## 10. Próximos Pasos

1. [ ] Completar análisis competitivo (/oden:analyze)
2. [ ] Detallar arquitectura (/oden:architect)
3. [ ] Crear especificaciones de módulos (/oden:spec)
4. [ ] Crear plan de implementación (/oden:plan)

---

**Creado:** {fecha}
**Autor:** Oden Forge Wizard
```

---

## PASO 9: Siguiente Acción

Mostrar guía de próximos pasos:

```
╔══════════════════════════════════════════════════════════════╗
║              ✅ PROYECTO INICIALIZADO                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Tu proyecto {nombre} está listo para diseñar.               ║
║                                                              ║
║  PRÓXIMOS PASOS (en orden):                                  ║
║                                                              ║
║  1. /oden:architect                                          ║
║     → Completa technical-decisions.md                        ║
║     → Define schema de BD completo                           ║
║     → Diseña arquitectura detallada                          ║
║                                                              ║
║  2. /oden:analyze                                            ║
║     → Analiza competidores                                   ║
║     → Define user stories                                    ║
║     → Identifica diferenciadores                             ║
║                                                              ║
║  3. /oden:spec [módulo]                                      ║
║     → Crea specs de 800-1200 líneas por módulo               ║
║     → Define máquinas de estado                              ║
║     → Documenta edge cases                                   ║
║                                                              ║
║  4. /oden:plan                                               ║
║     → Plan semana por semana                                 ║
║     → Define milestones                                      ║
║     → Identifica dependencias                                ║
║                                                              ║
║  5. /oden:checklist                                          ║
║     → Verifica que TODO esté documentado                     ║
║     → Solo entonces, empieza a codificar                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Comportamiento según Nivel de Experiencia

### Para Principiantes

En cada paso, incluir:
- **Por qué importa**: Explicación de la decisión
- **Trade-offs**: Pros y contras de cada opción
- **Recursos**: Links a documentación/tutoriales
- **System Design tip**: Concepto relevante de arquitectura

Ejemplo:
```
💡 SYSTEM DESIGN TIP:
PostgreSQL vs MongoDB - ¿Cuándo usar cada uno?

PostgreSQL (relacional):
- Datos estructurados con relaciones claras
- Transacciones ACID importantes
- Queries complejos frecuentes

MongoDB (documentos):
- Schema flexible, cambia frecuentemente
- Datos jerárquicos/anidados
- Horizontal scaling prioritario

Para tu proyecto tipo {tipo}, PostgreSQL es mejor porque...
```

### Para Intermedios

- Tips contextuales solo cuando sean relevantes
- Mejores prácticas en cada sección
- Sin explicaciones básicas

### Para Avanzados

- Flujo directo de preguntas
- Sin explicaciones adicionales
- Asume conocimiento de trade-offs

---

## Error Handling

### Si el directorio ya existe:
```
⚠️ El directorio {nombre} ya existe.
¿Qué deseas hacer?
1. Sobrescribir (perderás contenido existente)
2. Usar otro nombre
3. Cancelar
```

### Si falta información crítica:
No avanzar al siguiente paso hasta tener respuesta válida.

---

## Output Final

Al completar exitosamente:
1. Directorio del proyecto creado
2. Estructura docs/ completa
3. Templates de documentación listos
4. CLAUDE.md configurado
5. Guía de próximos pasos mostrada
