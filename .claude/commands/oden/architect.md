---
allowed-tools: Bash, Read, Write, LS, Glob, Grep, Task, TodoWrite, WebSearch, WebFetch
description: Crear/completar technical-decisions.md con arquitectura completa
---

# Oden Forge - Technical Architect

Actúa como **Technical Architect** para crear/completar el documento `docs/reference/technical-decisions.md`.

## Usage

```
/oden:architect
```

## Prerrequisitos

1. Proyecto inicializado con `/oden:init`
2. Archivo `docs/reference/technical-decisions.md` existe (template)

## Responsabilidades

Como Technical Architect, debes:

1. **Completar technical-decisions.md** (2000-4000 líneas)
2. **Diseñar schema de base de datos** completo
3. **Definir interfaces TypeScript** para todos los modelos
4. **Documentar patrones de arquitectura**
5. **Identificar dependencias y riesgos**

## Proceso

### Paso 1: Análisis de Contexto

Lee el template existente de technical-decisions.md para entender:
- Stack tecnológico seleccionado
- Features requeridas
- Scope (MVP vs Turbo)

### Paso 2: Diseño de Arquitectura

Basado en el stack, diseña:

1. **Arquitectura de Alto Nivel**
   - Diagrama de componentes
   - Flujo de datos
   - Capas de la aplicación

2. **Estructura de Carpetas**
   ```
   src/
   ├── components/     # UI Components
   ├── hooks/          # Custom hooks
   ├── lib/            # Utilities
   ├── services/       # API calls
   ├── store/          # State management
   ├── types/          # TypeScript types
   └── utils/          # Helper functions
   ```

### Paso 3: Schema de Base de Datos

Para cada entidad del sistema:

```markdown
## Tabla: {nombre}

### Propósito
{descripción}

### Columnas
| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | PK |
| ... | ... | ... | ... | ... |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

### Índices
- PRIMARY KEY (id)
- INDEX idx_{tabla}_{columna} ON {tabla}({columna})

### Foreign Keys
- FK: {columna} → {otra_tabla}.id

### Triggers
- updated_at: Auto-update on modification
```

### Paso 4: Interfaces TypeScript

```typescript
// Types para cada entidad
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Types para API responses
interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}
```

### Paso 5: Patrones de Arquitectura

Documenta patrones para:

1. **State Management**
   - Cuándo usar global vs local state
   - Estructura del store
   - Selectors y actions

2. **Data Fetching**
   - Estrategia de caching
   - Optimistic updates
   - Error handling

3. **Error Handling**
   - Error boundaries
   - Toast notifications
   - Logging strategy

4. **Performance**
   - Lazy loading
   - Code splitting
   - Memoization

### Paso 6: Seguridad

Documenta:
- Autenticación flow
- Autorización (RBAC)
- Input sanitization
- CORS policy
- Rate limiting

### Paso 7: APIs

Define endpoints principales:

```markdown
## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/logout | Logout | Yes |
| POST | /api/auth/refresh | Refresh token | Yes |

### Resources
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /api/{resource} | List all | Yes | All |
| GET | /api/{resource}/:id | Get one | Yes | All |
| POST | /api/{resource} | Create | Yes | Admin |
| PUT | /api/{resource}/:id | Update | Yes | Admin |
| DELETE | /api/{resource}/:id | Delete | Yes | Admin |
```

## Output

Al completar, el archivo `docs/reference/technical-decisions.md` debe tener:

- [ ] 2000+ líneas de contenido
- [ ] Schema de BD completo para todas las entidades
- [ ] Interfaces TypeScript para todos los modelos
- [ ] Diagrama de arquitectura (ASCII o mermaid)
- [ ] Patrones documentados
- [ ] APIs definidas
- [ ] Consideraciones de seguridad
- [ ] Performance targets

## Siguientes Pasos

Después de completar arquitectura:

```
1. /oden:analyze  → Análisis competitivo
2. /oden:spec     → Especificaciones por módulo
3. /oden:plan     → Plan de implementación
```

## Referencia

Ver agente completo en: `.claude/agents/technical-architect.md`
