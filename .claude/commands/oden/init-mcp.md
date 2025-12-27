---
allowed-tools: Bash, Read, Write, LS
description: Instalar MCPs recomendados para desarrollo
---

# Oden Forge - Init MCP

Instala y configura MCPs (Model Context Protocol servers) recomendados para desarrollo.

## Usage

```
/oden:init-mcp [category]
```

Categories:
- (vacío) - Mostrar todos los MCPs disponibles
- `essential` - MCPs esenciales para cualquier proyecto
- `design` - MCPs de diseño (Figma)
- `backend` - MCPs de backend (Supabase)
- `productivity` - MCPs de productividad (Notion)
- `devops` - MCPs de DevOps (Vercel)
- `testing` - MCPs de testing (Playwright, Chrome DevTools)
- `mobile` - MCPs de mobile (iOS Simulator)

## MCPs Disponibles

### Essential - `essential`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `context7` | HTTP | Documentación actualizada de librerías | API Key (gratis) |

### Design - `design`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `figma` | HTTP | Acceso a diseños de Figma | Cuenta Figma |

### Backend - `backend`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `supabase` | NPX | Gestión de Supabase DB | Access Token + Project Ref |

### Productivity - `productivity`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `notion` | HTTP | Acceso a Notion | Cuenta Notion |

### DevOps - `devops`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `vercel` | HTTP | Deploy y gestión Vercel | Cuenta Vercel |

### Testing - `testing`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `playwright` | NPX | Testing E2E con Playwright | Node.js |
| `chrome-devtools` | NPX | Control de Chrome DevTools | Chrome instalado |

### Mobile - `mobile`

| MCP | Tipo | Descripción | Requiere |
|-----|------|-------------|----------|
| `ios-simulator` | NPX | Control de iOS Simulator | Xcode + macOS |

---

## Configuración de MCPs

### Tipo HTTP (servicios remotos)

Estos MCPs se conectan a servicios via URL. Se agregan a `~/.claude.json`:

```json
{
  "mcpServers": {
    "{nombre}": {
      "type": "http",
      "url": "{url}"
    }
  }
}
```

### Tipo NPX (comandos locales)

Estos MCPs ejecutan comandos localmente:

```json
{
  "mcpServers": {
    "{nombre}": {
      "command": "npx",
      "args": ["-y", "{package}@latest"],
      "env": {
        "VAR": "value"
      }
    }
  }
}
```

---

## Instalación por MCP

### Context7 (Documentación de librerías)

**Recomendado para:** Todos los proyectos

```bash
# 1. Obtener API Key gratis en https://context7.com
# 2. Agregar a configuración de proyecto
```

**Configuración:**
```json
{
  "context7": {
    "type": "http",
    "url": "https://mcp.context7.com/mcp",
    "headers": {
      "CONTEXT7_API_KEY": "{tu-api-key}"
    }
  }
}
```

**Uso:**
- Buscar documentación actualizada de cualquier librería
- Ejemplos de código actualizados
- Compatible con Next.js, React, Supabase, etc.

---

### Figma (Diseños)

**Recomendado para:** Proyectos con diseño UI/UX

```json
{
  "figma": {
    "type": "http",
    "url": "https://mcp.figma.com/mcp"
  }
}
```

**Uso:**
- Acceder a componentes de Figma
- Extraer estilos y colores
- Convertir diseños a código

---

### Supabase (Base de datos)

**Recomendado para:** Proyectos con Supabase

```bash
# 1. Obtener Access Token en https://supabase.com/dashboard/account/tokens
# 2. Obtener Project Ref de tu proyecto
```

**Configuración:**
```json
{
  "supabase": {
    "command": "npx",
    "args": [
      "-y",
      "@supabase/mcp-server-supabase@latest",
      "--read-only",
      "--project-ref={tu-project-ref}"
    ],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "{tu-access-token}"
    }
  }
}
```

**Uso:**
- Consultar schema de BD
- Ejecutar queries (read-only por defecto)
- Ver tablas y relaciones

---

### Playwright (Testing E2E)

**Recomendado para:** Testing de aplicaciones web

```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-server-playwright@latest"]
  }
}
```

**Uso:**
- Testing end-to-end automatizado
- Screenshots y grabación de videos
- Testing cross-browser (Chrome, Firefox, Safari)
- Assertions y validaciones

---

### iOS Simulator (Mobile Testing)

**Recomendado para:** Desarrollo y testing de apps iOS

```json
{
  "ios-simulator": {
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-server-ios-simulator@latest"]
  }
}
```

**Uso:**
- Controlar iOS Simulator programáticamente
- Tomar screenshots de apps
- Instalar y ejecutar apps
- Testing de UI móvil

**Requisitos:**
- macOS
- Xcode instalado
- iOS Simulator configurado

---

### Notion (Documentación)

**Recomendado para:** Equipos usando Notion

```json
{
  "notion": {
    "type": "http",
    "url": "https://mcp.notion.com/mcp"
  }
}
```

**Uso:**
- Acceder a páginas de Notion
- Leer documentación del equipo
- Crear notas

---

### Vercel (Deploy)

**Recomendado para:** Proyectos desplegados en Vercel

```json
{
  "vercel": {
    "type": "http",
    "url": "https://mcp.vercel.com/"
  }
}
```

**Uso:**
- Ver deployments
- Acceder a logs
- Gestionar proyectos

---

### Chrome DevTools (Browser)

**Recomendado para:** Testing y debugging de UI

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"]
  }
}
```

**Uso:**
- Controlar Chrome programáticamente
- Tomar screenshots
- Inspeccionar elementos
- Debugging de frontend

---

## Proceso de Instalación

### Paso 1: Verificar configuración actual

```bash
# Ver MCPs configurados globalmente
cat ~/.claude.json | grep -A 20 '"mcpServers"'

# Ver MCPs del proyecto actual
cat .claude.json 2>/dev/null | grep -A 20 '"mcpServers"'
```

### Paso 2: Elegir nivel de configuración

- **Global** (`~/.claude.json`): Disponible en todos los proyectos
- **Proyecto** (`.claude.json` o `~/.claude.json` bajo "projects"): Solo en proyecto específico

### Paso 3: Agregar configuración

Para agregar a nivel de proyecto, crear/editar `.mcp.json` en la raíz:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "tu-key-aqui"
      }
    },
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

### Paso 4: Reiniciar Claude Code

```bash
# Los MCPs se cargan al iniciar
# Salir y volver a entrar a Claude Code
```

---

## Verificar MCPs Activos

Dentro de Claude Code:
```
/mcp
```

Muestra los MCPs conectados y sus herramientas disponibles.

---

## MCPs Recomendados por Tipo de Proyecto

### Web App (Next.js/React)
```
context7        → Documentación actualizada
figma           → Diseños (si aplica)
vercel          → Deploy
playwright      → Testing E2E
chrome-devtools → Debugging
```

### Backend/API
```
context7    → Documentación
supabase    → Base de datos (si aplica)
```

### Mobile iOS
```
context7        → Documentación
figma           → Diseños
ios-simulator   → Testing en simulador
```

### Mobile React Native/Flutter
```
context7        → Documentación
figma           → Diseños
ios-simulator   → Testing iOS
chrome-devtools → Debugging web views
```

### Full Stack
```
context7        → Documentación
supabase        → Base de datos
figma           → Diseños
vercel          → Deploy
playwright      → Testing E2E
```

---

## Output

```
╔══════════════════════════════════════════════════════════════╗
║               ODEN FORGE - MCP INSTALLED                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  CONFIGURACIÓN AGREGADA A: .mcp.json                         ║
║                                                              ║
║  MCPs INSTALADOS:                                            ║
║  ├─ context7        → Documentación de librerías             ║
║  ├─ figma           → Acceso a diseños                       ║
║  └─ vercel          → Deploy management                      ║
║                                                              ║
║  PRÓXIMOS PASOS:                                             ║
║  1. Reiniciar Claude Code para cargar MCPs                   ║
║  2. Verificar con /mcp                                       ║
║  3. Configurar API keys si es necesario                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Notas

- Los MCPs HTTP requieren autenticación OAuth la primera vez
- Los MCPs NPX se ejecutan localmente
- Algunos MCPs requieren API keys (ej: Context7, Supabase)
- La configuración de MCPs está en `~/.claude.json` o `.mcp.json`

---

## Agregar MCP Personalizado

Si quieres agregar un MCP que no está en la lista:

```json
{
  "mi-mcp": {
    "type": "http",
    "url": "https://mcp.mi-servicio.com/mcp"
  }
}
```

O para MCPs locales:

```json
{
  "mi-mcp-local": {
    "command": "npx",
    "args": ["-y", "@org/mcp-server@latest"]
  }
}
```
