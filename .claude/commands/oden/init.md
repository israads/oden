---
allowed-tools: Bash, Read, Write, LS, Glob, AskUserQuestion, Task, TodoWrite
description: Wizard interactivo para crear proyectos desde cero con metodología Oden
---

# Oden Forge - Enhanced Project Initialization Wizard

Wizard interactivo inteligente que detecta proyectos existentes, sugiere MCPs/skills y guía la creación profesional siguiendo la metodología Documentation-First Development.

## Usage

```
/oden:init [nombre-proyecto]
/oden:init agents [category]  # Instalar agentes especializados
/oden:init mcp [category]     # Instalar MCPs recomendados
/oden:init update            # Actualizar proyecto existente
```

## Filosofía Core

> "Documenta y diseña COMPLETAMENTE antes de codificar"

Este wizard NO genera código. Genera la **documentación completa** que permitirá desarrollar con claridad.

---

## PASO 0: Enhanced Pre-Flight Analysis & Setup

### 0.1 Existing Project Detection

**CRÍTICO**: Antes de cualquier otra acción, detectar estado actual del proyecto:

```bash
echo "🔍 ODEN FORGE - ANÁLISIS INICIAL DEL PROYECTO"
echo "═══════════════════════════════════════════════"
echo ""

# Check for existing Oden structure
oden_exists=false
git_exists=false
repo_url=""

# Detect existing Oden Forge structure
if [ -d ".claude" ] && [ -f ".claude/CLAUDE.md" ]; then
  oden_exists=true
  echo "✅ Estructura Oden Forge detectada"

  # Check completeness
  if [ -d "docs" ] && [ -f "docs/README.md" ]; then
    echo "✅ Documentación estructura /docs presente"
  else
    echo "⚠️  Estructura /docs faltante (necesaria para compatibilidad multi-LLM)"
  fi

  if [ -f "docs/reference/technical-decisions.md" ]; then
    echo "✅ Technical decisions existentes"
  else
    echo "⚠️  Technical decisions no encontradas"
  fi

  if [ -d ".claude/prds" ] && [ "$(ls -A .claude/prds 2>/dev/null)" ]; then
    echo "✅ PRDs existentes encontrados"
  else
    echo "ℹ️  No hay PRDs existentes"
  fi
fi

# Check for Git repository
if [ -d ".git" ]; then
  git_exists=true
  repo_url=$(git remote get-url origin 2>/dev/null || echo "")
  echo "✅ Repositorio Git detectado"
  if [ -n "$repo_url" ]; then
    echo "📡 Remote: $repo_url"
  else
    echo "ℹ️  Sin remote configurado"
  fi
fi

# Check for existing tech stack
tech_stack_detected=""
if [ -f "package.json" ]; then
  tech_stack_detected="Node.js/JavaScript"
elif [ -f "go.mod" ]; then
  tech_stack_detected="Go"
elif [ -f "Cargo.toml" ]; then
  tech_stack_detected="Rust"
elif [ -f "pubspec.yaml" ]; then
  tech_stack_detected="Flutter/Dart"
elif [ -f "Gemfile" ]; then
  tech_stack_detected="Ruby"
fi

if [ -n "$tech_stack_detected" ]; then
  echo "🛠️  Stack detectado: $tech_stack_detected"
fi

echo ""
```

### 0.2 Project State Decision

Based on detection results, present appropriate options:

```bash
if [ "$oden_exists" = true ]; then
  echo "🎯 PROYECTO ODEN EXISTENTE DETECTADO"
  echo "═══════════════════════════════════════"
  echo ""
  echo "Opciones disponibles:"
  echo ""
  echo "  [U] Update/Upgrade    - Actualizar estructura existente con nuevas features"
  echo "                         (añade validación automática, /docs structure, etc.)"
  echo ""
  echo "  [M] Maintain/Configure - Revisar MCPs/Skills instalados y configurar faltantes"
  echo ""
  echo "  [R] Rebuild           - PELIGROSO: Recrear estructura desde cero"
  echo "                         (respaldará archivos existentes en /backup)"
  echo ""
  echo "  [C] Cancel            - Cancelar sin cambios"
  echo ""
  echo "Selecciona opción [U/M/R/C]: "
  read project_action

  case $project_action in
    "U"|"u"|"")
      echo "🔄 Actualizando proyecto existente..."
      init_mode="update"
      ;;
    "M"|"m")
      echo "⚙️ Revisando configuración de MCPs y Skills..."
      init_mode="maintain"
      ;;
    "R"|"r")
      echo "⚠️ ADVERTENCIA: Esto recreará la estructura completa"
      echo "Se creará backup en ./oden-backup-$(date +%Y%m%d-%H%M%S)/"
      echo "¿Estás seguro? [y/N]: "
      read confirm_rebuild
      if [ "$confirm_rebuild" = "y" ] || [ "$confirm_rebuild" = "Y" ]; then
        echo "🗂️ Creando backup..."
        backup_dir="./oden-backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$backup_dir"
        cp -r .claude docs* 2>/dev/null "$backup_dir/" || true
        echo "📦 Backup creado en: $backup_dir"
        init_mode="rebuild"
      else
        echo "❌ Operación cancelada"
        exit 0
      fi
      ;;
    "C"|"c")
      echo "❌ Operación cancelada"
      exit 0
      ;;
    *)
      echo "❌ Opción inválida. Cancelando."
      exit 1
      ;;
  esac
else
  echo "🆕 PROYECTO NUEVO - Inicializando estructura completa"
  init_mode="new"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

### 0.3 Repository Connection & Analysis (if needed)

```bash
if [ "$init_mode" = "maintain" ] || [ "$init_mode" = "update" ]; then
  echo "📡 ANÁLISIS DE REPOSITORIO PARA RECOMENDACIONES"
  echo "═════════════════════════════════════════════"

  if [ -z "$repo_url" ]; then
    echo ""
    echo "Para mejorar las recomendaciones de MCPs y Skills, puedo analizar tu repositorio."
    echo "¿Tienes un repositorio remoto que quieras conectar? [y/N]: "
    read connect_repo

    if [ "$connect_repo" = "y" ] || [ "$connect_repo" = "Y" ]; then
      echo ""
      echo "Ingresa la URL del repositorio (GitHub, GitLab, etc.):"
      read new_repo_url

      if [ -n "$new_repo_url" ]; then
        git remote add origin "$new_repo_url" 2>/dev/null || git remote set-url origin "$new_repo_url" 2>/dev/null
        repo_url="$new_repo_url"
        echo "✅ Repositorio conectado: $repo_url"
      fi
    fi
  fi

  # Analyze repository for better recommendations
  if [ -n "$repo_url" ]; then
    echo ""
    echo "🔍 Analizando repositorio para recomendaciones personalizadas..."

    # Launch repository analyzer subagent
  fi
fi
```

```markdown
Launch subagent: repo-analyzer

Task: Analyze repository to suggest optimal MCPs and Skills

Requirements:
- Analyze repository URL and structure if accessible
- Read package.json, go.mod, Cargo.toml, etc. to understand stack
- Check for specific frameworks/libraries to suggest relevant MCPs:
  * Database libraries → Database MCPs (PostgreSQL, MySQL, etc.)
  * API frameworks → API development MCPs
  * Frontend frameworks → Frontend-specific skills
  * Testing frameworks → Testing enhancement MCPs
  * Docker files → DevOps MCPs

- Analyze project complexity to suggest appropriate skills:
  * Monorepo structure → Specialized coordination skills
  * Microservices → Distributed system skills
  * Heavy data processing → Data engineering MCPs
  * Real-time features → WebSocket/realtime MCPs

- Check existing MCPs/Skills to avoid duplicates
- Prioritize recommendations by project relevance
- Output structured recommendation list

Context: Provide personalized MCP/Skill recommendations based on actual project needs
```

### 0.4 MCP & Skills Installation Recommendations

After analysis (or for new projects), present intelligent recommendations:

```bash
echo "🛠️ RECOMENDACIONES DE MCPs Y SKILLS"
echo "══════════════════════════════════════"
echo ""

# Based on analysis results or stack detection
echo "📊 Basado en tu proyecto, recomiendo estos MCPs y Skills:"
echo ""
```

#### Smart MCP Recommendations

```bash
# Generate recommendations based on detected/selected stack
case $tech_stack_detected in
  "Node.js/JavaScript")
    echo "🔧 MCPs Recomendados para Node.js:"
    echo "   ✅ @modelcontextprotocol/server-postgres (Base de datos)"
    echo "   ✅ @modelcontextprotocol/server-brave-search (Búsqueda web)"
    echo "   ✅ @modelcontextprotocol/server-filesystem (Gestión archivos)"
    if grep -q "next\|react" package.json 2>/dev/null; then
      echo "   ✅ @modelcontextprotocol/server-memory (Estado global)"
    fi
    if grep -q "prisma\|sequelize\|typeorm" package.json 2>/dev/null; then
      echo "   ✅ @modelcontextprotocol/server-sqlite (Desarrollo local)"
    fi
    ;;

  "Go")
    echo "🔧 MCPs Recomendados para Go:"
    echo "   ✅ @modelcontextprotocol/server-postgres (Base de datos)"
    echo "   ✅ @modelcontextprotocol/server-filesystem (Gestión archivos)"
    echo "   ✅ @modelcontextprotocol/server-brave-search (APIs externas)"
    ;;

  "Flutter/Dart")
    echo "🔧 MCPs Recomendados para Flutter:"
    echo "   ✅ @modelcontextprotocol/server-firebase (Backend móvil)"
    echo "   ✅ @modelcontextprotocol/server-memory (Estado app)"
    echo "   ✅ @modelcontextprotocol/server-filesystem (Assets/storage)"
    ;;

  *)
    echo "🔧 MCPs Universales Recomendados:"
    echo "   ✅ @modelcontextprotocol/server-filesystem (Gestión archivos)"
    echo "   ✅ @modelcontextprotocol/server-brave-search (Investigación)"
    echo "   ✅ @modelcontextprotocol/server-memory (Contexto persistente)"
    ;;
esac

echo ""
echo "🎯 Skills Recomendados para Desarrollo:"
echo "   ✅ claude-developer-platform (APIs y SDKs)"
echo "   ✅ test-engineer (Testing avanzado)"
echo "   ✅ code-reviewer (Quality assurance)"
if [ "$tech_stack_detected" = "Node.js/JavaScript" ]; then
  echo "   ✅ frontend-developer (React/Vue/Angular)"
  echo "   ✅ backend-architect (Node.js/Express)"
elif [ "$tech_stack_detected" = "Go" ]; then
  echo "   ✅ backend-architect (Go APIs)"
  echo "   ✅ devops-engineer (Deployment)"
fi

echo ""
echo "¿Proceder con instalación de MCPs y Skills recomendados? [Y/n]: "
read install_recommendations

if [ "$install_recommendations" != "n" ] && [ "$install_recommendations" != "N" ]; then
  echo ""
  echo "🚀 INSTALANDO MCPs Y SKILLS RECOMENDADOS"
  echo "═══════════════════════════════════════════"

  # Install recommended MCPs
  /oden:mcp install recommended

  # Install recommended Skills
  # This would call the skill installation system
  echo "✅ Skills configurados para desarrollo optimal"
else
  echo "ℹ️  Saltando instalación automática - puedes instalar después con:"
  echo "   /oden:mcp install [mcp-name]"
  echo "   /oden:init agents [category]"
fi
```

### 0.5 Enhanced Documentation Structure Setup

```bash
echo ""
echo "📁 CONFIGURANDO ESTRUCTURA DE DOCUMENTACIÓN"
echo "══════════════════════════════════════════════"

# Create enhanced docs structure for multi-LLM compatibility
mkdir -p docs/reference docs/guides docs/development/current docs/development/completed docs/archived docs/temp

# Create main compatibility README
```

## PASO 1: Enhanced Project Understanding

El objetivo es entender QUÉ necesita el usuario para RECOMENDAR el stack correcto.

### 1.1 Nombre y Descripción

Si no se proporcionó como argumento:
- Nombre del proyecto (slug: lowercase, guiones)
- Descripción breve: "¿Qué problema resuelve tu producto?"

### 1.2 Objetivo Principal del Producto

**Pregunta:** "¿Cuál es el objetivo principal de tu producto para los usuarios?"

Opciones:
- **Descubrir contenido**: Blog, noticias, catálogo, landing pages (SEO crítico)
- **Realizar transacciones**: Compras, reservas, pedidos, pagos
- **Productividad/trabajo**: Dashboard, herramientas, gestión de datos
- **Comunicación/social**: Chat, comunidad, red social
- **Tracking/monitoreo**: Seguimiento de ubicación, métricas en tiempo real
- **Servicio para sistemas**: API, microservicio, backend para terceros

### 1.3 Acceso Principal de Usuarios

**Pregunta:** "¿Cómo accederán principalmente tus usuarios?"

Opciones:
- **Navegador escritorio**: Desde computadora principalmente
- **Navegador móvil**: Desde celular pero en browser
- **App instalada**: Necesitan app en su teléfono
- **Web + App**: Ambos canales son importantes
- **Solo API**: No hay interfaz de usuario directa

### 1.4 Funcionalidades Nativas (solo si eligió app o web+app)

**Pregunta:** "¿Necesitas alguna de estas funcionalidades del dispositivo?"

Opciones (múltiple selección):
- **Cámara/fotos frecuente**: Escanear, tomar fotos constantemente
- **GPS en tiempo real**: Tracking de ubicación continuo
- **Notificaciones push críticas**: Alertas que no pueden fallar
- **Modo offline obligatorio**: Funcionar sin internet
- **Sensores del dispositivo**: Acelerómetro, giroscopio, NFC
- **Ninguna especial**: Funcionalidades estándar

### 1.5 Actualizaciones de la App (solo si eligió app)

**Pregunta:** "¿Qué tan frecuente necesitas actualizar la app?"

Opciones:
- **Muy frecuente**: Updates semanales, A/B testing, iteración rápida
- **Normal**: Updates mensuales, proceso estándar de tiendas OK
- **Poco frecuente**: App estable, pocos cambios

---

## PASO 2: Recomendación de Stack

Basado en las respuestas, mostrar recomendación con justificación:

### Matriz de Decisión

```
SI objetivo = "Descubrir contenido" Y acceso = web:
  → Next.js + Supabase
  → Razón: SSR para SEO, hosting en Vercel, DB y auth integrados

SI objetivo = "Transacciones" Y acceso = "App instalada":
  SI necesita_nativas_criticas (cámara frecuente, GPS tiempo real, sensores):
    SI solo_iOS:
      → Swift/SwiftUI + Supabase
      → Razón: Máximo rendimiento y acceso a APIs nativas de iOS
    SI solo_Android:
      → Kotlin + Supabase
      → Razón: Máximo rendimiento y acceso a APIs nativas de Android
    SINO:
      → Flutter + Supabase
      → Razón: Nativo compilado, excelente acceso a hardware, una codebase
  SINO:
    → React Native + Expo + Supabase
    → Razón: Updates OTA sin pasar por tiendas, desarrollo rápido, ecosistema React

SI objetivo = "Transacciones" Y acceso = "Web + App":
  SI updates_frecuentes:
    → Next.js (PWA) + React Native/Expo + Supabase
    → Razón: Web con PWA, app con OTA updates, backend compartido
  SINO:
    → Next.js + React Native + Supabase
    → Razón: Código compartido donde sea posible, experiencias nativas

SI objetivo = "Productividad/trabajo":
  → React + Supabase (o Next.js si necesita SEO)
  → Razón: SPA rápida, sin necesidad de SSR, Supabase para auth y DB

SI objetivo = "Comunicación/social":
  SI acceso incluye app:
    → React Native + Expo + Supabase (Realtime)
    → Razón: Realtime de Supabase, push notifications, OTA updates
  SINO:
    → Next.js + Supabase (Realtime)
    → Razón: WebSockets para chat, SEO para perfiles públicos

SI objetivo = "Tracking/monitoreo":
  → React Native + Expo + Supabase
  → O Flutter si necesita sensores avanzados
  → Razón: Acceso a GPS, background location, push notifications

SI objetivo = "Servicio para sistemas":
  → Node.js (Fastify/Express) + PostgreSQL
  → O Python (FastAPI) + PostgreSQL
  → Razón: API pura, sin frontend, escalable
```

### Formato de Recomendación

```
╔══════════════════════════════════════════════════════════════╗
║                 STACK RECOMENDADO                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Basado en tus necesidades:                                  ║
║  • Objetivo: {objetivo}                                      ║
║  • Acceso: {acceso}                                          ║
║  • Nativas: {funcionalidades}                                ║
║                                                              ║
║  TE RECOMENDAMOS:                                            ║
║                                                              ║
║  Frontend: {framework}                                       ║
║  Backend:  Supabase (PostgreSQL + Auth + Realtime)          ║
║  Hosting:  {plataforma}                                      ║
║                                                              ║
║  ¿POR QUÉ?                                                   ║
║  {justificación específica}                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

¿Aceptas esta recomendación o prefieres otro stack?
1. Aceptar recomendación
2. Quiero usar otro framework (especificar)
3. Tengo dudas, explícame más
```

---

## PASO 3: Nivel de Experiencia

**Pregunta:** "¿Cuál es tu nivel de experiencia con este stack?"

- **Principiante** (primera vez con estas tecnologías):
  - Explicaciones detalladas de cada decisión
  - Guías de System Design incluidas
  - Recursos de aprendizaje en cada paso

- **Intermedio** (he usado tecnologías similares):
  - Guías contextuales cuando sea relevante
  - Mejores prácticas destacadas

- **Avanzado** (domino este stack):
  - Flujo rápido, solo decisiones clave
  - Sin explicaciones básicas

---

## PASO 4: Scope del Proyecto

### 4.1 MVP vs Modo Turbo

**Pregunta:** "¿Cuál es tu estrategia de lanzamiento?"

**MVP (Minimum Viable Product)**
- Timeline: 6-8 semanas
- Features: 30-40% del producto final
- Objetivo: Validar idea rápidamente
- Ideal para: Startups, validación de mercado

**Modo Completo**
- Timeline: 12-16 semanas
- Features: 100% profesional desde día 1
- Objetivo: Producto enterprise-ready
- Ideal para: Productos B2B, mercados establecidos

### 4.2 Competidores

**Pregunta:** "Nombra 2-3 productos similares o competidores"

Esto nos ayudará en el análisis competitivo posterior.

---

## PASO 5: Features Clave para V1

**Pregunta:** "¿Qué features son CRÍTICAS para tu primera versión?"

Mostrar opciones relevantes según el objetivo:

### Para Transacciones/E-commerce:
- [ ] Catálogo de productos
- [ ] Carrito de compras
- [ ] Checkout y pagos
- [ ] Historial de pedidos
- [ ] Notificaciones de estado

### Para Productividad:
- [ ] Dashboard principal
- [ ] CRUD de entidades
- [ ] Reportes/exportación
- [ ] Roles y permisos
- [ ] Búsqueda y filtros

### Para Social/Comunicación:
- [ ] Perfiles de usuario
- [ ] Feed/timeline
- [ ] Mensajería/chat
- [ ] Notificaciones
- [ ] Seguir/amigos

### Para Tracking:
- [ ] Mapa en tiempo real
- [ ] Historial de ubicaciones
- [ ] Alertas por zona
- [ ] Reportes de actividad

### Comunes a todos:
- [ ] Autenticación (email, social)
- [ ] Perfil de usuario
- [ ] Configuraciones
- [ ] Soporte/ayuda

---

## PASO 6: Integraciones

**Pregunta:** "¿Necesitas integrar con servicios externos?"

- **Pagos**: Stripe, MercadoPago, PayPal
- **Email**: Resend, SendGrid
- **Storage**: Supabase Storage, Cloudinary, S3
- **Maps**: Google Maps, Mapbox
- **AI**: OpenAI, Anthropic, Gemini
- **Analytics**: Mixpanel, Amplitude, PostHog
- **Ninguna por ahora**

---

## PASO 7: Resumen y Confirmación

```
╔══════════════════════════════════════════════════════════════╗
║                    RESUMEN DEL PROYECTO                      ║
╠══════════════════════════════════════════════════════════════╣
║ Proyecto: {nombre}                                           ║
║ Descripción: {descripción}                                   ║
║ Scope: {MVP/Completo} ({X semanas})                         ║
╠══════════════════════════════════════════════════════════════╣
║ STACK                                                        ║
║ ├─ Frontend: {framework}                                     ║
║ ├─ Backend: {backend}                                        ║
║ ├─ Database: {db}                                            ║
║ ├─ Auth: {auth}                                              ║
║ └─ Hosting: {hosting}                                        ║
╠══════════════════════════════════════════════════════════════╣
║ FEATURES V1                                                  ║
║ {lista de features}                                          ║
╠══════════════════════════════════════════════════════════════╣
║ INTEGRACIONES                                                ║
║ {lista de integraciones}                                     ║
╠══════════════════════════════════════════════════════════════╣
║ COMPETIDORES A ANALIZAR                                      ║
║ {lista}                                                      ║
╚══════════════════════════════════════════════════════════════╝

¿Confirmas para crear la estructura del proyecto?
```

---

## PASO 8: Generación de Estructura

Una vez confirmado:

### 8.1 Crear Directorios

```bash
mkdir -p docs/{guides,reference/modules,development/{current,completed},archived,temp}
mkdir -p .claude/{commands,scripts,rules,context}
```

### 8.2 Crear Archivos Iniciales

1. **docs/README.md** - Índice de documentación
2. **docs/reference/technical-decisions.md** - Con decisiones del wizard
3. **docs/reference/competitive-analysis.md** - Template
4. **docs/reference/implementation-plan.md** - Template
5. **CLAUDE.md** - Instrucciones del proyecto

### 8.3 Contenido de technical-decisions.md

Generar con las decisiones tomadas:

```markdown
# Technical Decisions - {Proyecto}

**Estado:** 🟡 En Progreso
**Última actualización:** {fecha}

---

## 1. Visión General

### 1.1 Descripción
{descripción del usuario}

### 1.2 Objetivo Principal
{objetivo seleccionado}

### 1.3 Scope
**Modalidad:** {MVP/Completo}
**Timeline estimado:** {X semanas}

---

## 2. Stack Tecnológico

### 2.1 Frontend
- **Framework:** {selección}
- **Justificación:** {razón de la recomendación}

### 2.2 Backend
- **Plataforma:** {Supabase/otro}
- **Database:** PostgreSQL
- **Auth:** {método}

### 2.3 Hosting
- **Plataforma:** {Vercel/Expo/etc}
- **Justificación:** {razón}

---

## 3. Features V1

{lista de features seleccionadas con checkboxes}

---

## 4. Integraciones

{lista de integraciones}

---

## 5. Competidores a Analizar

{lista de competidores}

---

## 6. Arquitectura

[Pendiente: Completar con /oden:architect]

---

## 7. Schema de Base de Datos

[Pendiente: Completar con /oden:architect]

---

## 8. Próximos Pasos

1. [ ] /oden:architect - Completar arquitectura y schema
2. [ ] /oden:analyze - Análisis competitivo
3. [ ] /oden:spec [módulo] - Especificaciones detalladas
4. [ ] /oden:plan - Plan de implementación
5. [ ] /oden:checklist - Verificar antes de codificar

---

**Creado:** {fecha}
**Generado por:** Oden Forge Wizard
```

---

## PASO 9: Siguiente Acción

```
╔══════════════════════════════════════════════════════════════╗
║              ✅ PROYECTO INICIALIZADO                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Proyecto: {nombre}                                          ║
║  Stack: {resumen del stack}                                  ║
║                                                              ║
║  ARCHIVOS CREADOS:                                           ║
║  • docs/reference/technical-decisions.md                     ║
║  • docs/reference/competitive-analysis.md                    ║
║  • docs/reference/implementation-plan.md                     ║
║  • CLAUDE.md                                                 ║
║                                                              ║
║  PRÓXIMO PASO:                                               ║
║                                                              ║
║  /oden:architect                                             ║
║                                                              ║
║  Esto completará:                                            ║
║  • Arquitectura detallada                                    ║
║  • Schema de base de datos                                   ║
║  • Estructura de carpetas del código                         ║
║  • Patrones de diseño a usar                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Comportamiento según Nivel

### Para Principiantes

Después de la recomendación de stack, explicar:

```
💡 ¿POR QUÉ ESTE STACK?

React Native + Expo:
• React Native te permite crear apps iOS y Android con JavaScript
• Expo simplifica el proceso: no necesitas Xcode ni Android Studio para empezar
• OTA Updates: puedes actualizar tu app sin pasar por las tiendas
• Gran comunidad y documentación

Supabase:
• Es como Firebase pero con PostgreSQL (base de datos relacional)
• Incluye: Base de datos, Autenticación, Storage, Realtime
• Tier gratuito generoso para empezar
• Dashboard visual para ver tus datos

¿Quieres que te explique más sobre alguna tecnología?
```

### Para Intermedios/Avanzados

Solo mostrar la recomendación y justificación breve, sin explicaciones básicas.

---

## Stacks Predefinidos (Referencia Rápida)

| Caso de Uso | Stack | Hosting |
|-------------|-------|---------|
| Web con SEO | Next.js + Supabase | Vercel |
| Web SPA (dashboard) | React + Supabase | Vercel/Netlify |
| Mobile (updates frecuentes) | React Native + Expo + Supabase | Expo EAS |
| Mobile (nativo crítico) | Flutter + Supabase | App Stores |
| Mobile iOS only | Swift + Supabase | App Store |
| Web + Mobile | Next.js + React Native + Supabase | Vercel + Expo |
| API/Backend only | Node.js/Python + PostgreSQL | Railway/Render |

---

## Error Handling

### Si el directorio ya existe:
```
⚠️ Ya existe un proyecto en este directorio.
¿Qué deseas hacer?
1. Continuar con el proyecto existente
2. Usar otro directorio
3. Cancelar
```

### Si el usuario rechaza la recomendación:
Preguntar qué stack prefiere y por qué, luego adaptar el flujo.

---

## AGENTS MODE: /oden:init agents [category]

Instala agentes especializados para desarrollo.

### Categories Disponibles:
- `core` - Agentes esenciales (fullstack-developer, code-reviewer, debugger)
- `frontend` - Frontend/UI (frontend-developer, ui-ux-designer)
- `backend` - Backend/APIs (backend-architect, database-architect)
- `mobile` - Mobile (mobile-developer, ios-developer)
- `devops` - DevOps (devops-engineer, deployment-engineer)
- `data` - Data (data-scientist, data-engineer)
- (vacío) - Mostrar todas las categorías

### Usage:
```bash
/oden:init agents core     # Solo esenciales
/oden:init agents         # Ver todas las opciones
```

---

## MCP MODE: /oden:init mcp [category]

Instala MCPs (Model Context Protocol servers) recomendados.

### Categories Disponibles:
- `essential` - MCPs básicos (memory, context7)
- `design` - Diseño (pencil, figma)
- `backend` - Backend (supabase, postgres)
- `testing` - Testing (chrome-devtools, playwright)
- `mobile` - Mobile (ios-simulator)
- `productivity` - Productivity (notion, linear)
- (vacío) - Mostrar todas las categorías

### Usage:
```bash
/oden:init mcp essential  # MCPs básicos
/oden:init mcp           # Ver todas las opciones
```

### Auto-Detection:
Basado en tu stack, se recomiendan automáticamente:
- **React/Next.js** → chrome-devtools, memory
- **Mobile** → ios-simulator, chrome-devtools
- **Supabase** → supabase MCP
- **Notion** → notion MCP
