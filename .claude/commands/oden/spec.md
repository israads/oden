---
allowed-tools: Bash, Read, Write, LS, Glob, Grep, Task, TodoWrite
description: Crear especificaciones detalladas por módulo (800-1200 líneas)
---

# Oden Forge - Feature Specification Writer

Actúa como **Feature Specification Writer** para crear especificaciones técnicas detalladas.

## Usage

```
/oden:spec {nombre-modulo}
```

Ejemplos:
- `/oden:spec auth` - Especificación del módulo de autenticación
- `/oden:spec orders` - Especificación del módulo de órdenes
- `/oden:spec dashboard` - Especificación del dashboard

## Prerrequisitos

1. technical-decisions.md completo (`/oden:architect`)
2. User stories definidas (`/oden:analyze`)

## Responsabilidades

Como Spec Writer, debes crear:

1. **Especificación de 800-1200 líneas** para el módulo
2. **Diagrama de estados** si hay entidades con estados
3. **Todas las validaciones** con mensajes de error
4. **Flujos de UI/UX** completos
5. **Comportamiento offline** si aplica
6. **Matriz de permisos** por rol

## Proceso

### Paso 1: Análisis del Módulo

Lee technical-decisions.md y user-stories.md para entender:
- Qué entidades maneja el módulo
- Qué user stories cubre
- Dependencias con otros módulos

### Paso 2: Estructura de la Especificación

Crea `docs/reference/modules/{modulo}-spec.md`:

```markdown
# Especificación: {Nombre del Módulo}

**Estado:** 🟡 En Progreso
**Última actualización:** {fecha}
**Líneas:** ~{X} (target: 800-1200)

---

## 1. Overview

### 1.1 Propósito
{Por qué existe este módulo}

### 1.2 Alcance
**Incluye:**
- {funcionalidad 1}
- {funcionalidad 2}

**NO incluye:**
- {exclusión 1}
- {exclusión 2}

### 1.3 User Stories Relacionadas
- US-{X}: {título}
- US-{Y}: {título}

### 1.4 Dependencias
- Módulo {X}: {cómo depende}
- Servicio {Y}: {cómo depende}

---

## 2. Modelo de Datos

### 2.1 Entidad Principal

```typescript
interface {Entidad} {
  id: string;
  // campos específicos
  status: {Entidad}Status;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

enum {Entidad}Status {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

### 2.2 Detalle de Campos

| Campo | Tipo | Requerido | Default | Validación | Descripción |
|-------|------|-----------|---------|------------|-------------|
| id | UUID | ✅ | auto | - | Identificador único |
| name | string | ✅ | - | 1-100 chars | Nombre del recurso |
| status | enum | ✅ | 'draft' | valores válidos | Estado actual |
| amount | decimal | ✅ | - | > 0 | Monto en MXN |

### 2.3 Relaciones

```
{Entidad} 1──────* {SubEntidad}
    │
    └──1 User (created_by)
```

---

## 3. Estados y Transiciones

### 3.1 Diagrama

```
     ┌─────────┐
     │  DRAFT  │──────────────────────┐
     └────┬────┘                      │
          │ submit()                  │ delete()
          ▼                           ▼
     ┌─────────┐     reject()    ┌─────────┐
     │ PENDING │────────────────▶│ DELETED │
     └────┬────┘                 └─────────┘
          │ approve()
          ▼
     ┌─────────┐     complete()  ┌───────────┐
     │ ACTIVE  │────────────────▶│ COMPLETED │
     └────┬────┘                 └───────────┘
          │ cancel()
          ▼
     ┌──────────┐
     │CANCELLED │
     └──────────┘
```

### 3.2 Tabla de Transiciones

| De | A | Acción | Condiciones | Side Effects |
|----|---|--------|-------------|--------------|
| DRAFT | PENDING | submit() | Campos válidos | Notificar revisor |
| DRAFT | DELETED | delete() | Owner o Admin | Soft delete |
| PENDING | ACTIVE | approve() | Rol: Admin | Log auditoría |
| PENDING | DRAFT | reject() | Rol: Admin | Notificar owner |
| ACTIVE | COMPLETED | complete() | Criterios met | Calcular totales |
| ACTIVE | CANCELLED | cancel() | Owner o Admin | Revertir cambios |

### 3.3 Acciones por Estado

| Estado | Acciones Disponibles |
|--------|---------------------|
| DRAFT | ver, editar, eliminar, submit |
| PENDING | ver, aprobar*, rechazar* |
| ACTIVE | ver, editar**, completar, cancelar |
| COMPLETED | ver |
| CANCELLED | ver, reactivar* |

*Solo Admin
**Solo campos específicos

---

## 4. Flujos de Usuario

### 4.1 Crear {Entidad}

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO: CREAR {ENTIDAD}                   │
└─────────────────────────────────────────────────────────────┘

Usuario                              Sistema
   │                                    │
   │──[Click "Nuevo {entidad}"]────────▶│
   │                                    │
   │◀─[Muestra formulario vacío]────────│
   │                                    │
   │──[Completa campos requeridos]─────▶│
   │                                    │
   │──[Click "Guardar"]────────────────▶│
   │                                    │
   │     ┌─[Validar campos]─────────────│
   │     │                              │
   │     ├─[Si válido]                  │
   │     │   ├─[Guardar en BD]          │
   │     │   ├─[Crear audit log]        │
   │     │   └─[Retornar éxito]         │
   │     │                              │
   │◀────┴─[Redirect a detalle]─────────│
   │      [Toast: "Creado exitosamente"]│
   │                                    │
   │     ├─[Si inválido]                │
   │     │   └─[Retornar errores]       │
   │     │                              │
   │◀────┴─[Mostrar errores inline]─────│
   │                                    │
```

### 4.2 Editar {Entidad}

[Flujo similar con validación de permisos]

### 4.3 Cambiar Estado

[Flujo para cada transición de estado]

---

## 5. Validaciones

### 5.1 Validaciones de Campo

| Campo | Regla | Código | Mensaje (ES) |
|-------|-------|--------|--------------|
| name | Requerido | REQUIRED | "El nombre es requerido" |
| name | Min 1 char | MIN_LENGTH | "El nombre debe tener al menos 1 carácter" |
| name | Max 100 chars | MAX_LENGTH | "El nombre no puede exceder 100 caracteres" |
| email | Formato válido | INVALID_FORMAT | "El formato del email no es válido" |
| amount | Mayor a 0 | MIN_VALUE | "El monto debe ser mayor a $0" |
| amount | Max 999999.99 | MAX_VALUE | "El monto máximo es $999,999.99" |

### 5.2 Validaciones de Negocio

| Código | Regla | Mensaje |
|--------|-------|---------|
| BR001 | No duplicar nombre activo | "Ya existe un {entidad} con este nombre" |
| BR002 | Solo owner puede submit | "Solo el creador puede enviar a revisión" |
| BR003 | No editar completado | "No se puede editar un {entidad} completado" |

### 5.3 Formato de Errores

```typescript
// Error de validación
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Error de validación",
    details: [
      { field: "name", code: "REQUIRED", message: "El nombre es requerido" },
      { field: "amount", code: "MIN_VALUE", message: "El monto debe ser mayor a $0" }
    ]
  }
}

// Error de negocio
{
  error: {
    code: "BUSINESS_RULE_VIOLATION",
    rule: "BR001",
    message: "Ya existe un {entidad} con este nombre"
  }
}
```

---

## 6. API Endpoints

### 6.1 Lista de Endpoints

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | /api/{entidades} | Listar | ✅ | All |
| GET | /api/{entidades}/:id | Obtener | ✅ | All |
| POST | /api/{entidades} | Crear | ✅ | All |
| PUT | /api/{entidades}/:id | Actualizar | ✅ | Owner/Admin |
| DELETE | /api/{entidades}/:id | Eliminar | ✅ | Admin |
| POST | /api/{entidades}/:id/submit | Enviar | ✅ | Owner |
| POST | /api/{entidades}/:id/approve | Aprobar | ✅ | Admin |

### 6.2 GET /api/{entidades}

**Query Parameters:**
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| page | number | 1 | Página actual |
| limit | number | 20 | Items por página (max 100) |
| status | string | - | Filtrar por estado |
| search | string | - | Buscar por nombre |
| sort | string | -created_at | Campo de ordenamiento |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "status": "draft",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 6.3 POST /api/{entidades}

**Request:**
```json
{
  "name": "string",
  "description": "string?",
  "amount": "number"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "status": "draft",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response 400:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": [...]
  }
}
```

---

## 7. UI/UX

### 7.1 Componentes

| Componente | Descripción | Estados |
|------------|-------------|---------|
| {Entidad}List | Lista paginada | loading, empty, error, success |
| {Entidad}Card | Card individual | default, hover, selected |
| {Entidad}Form | Formulario CRUD | create, edit, view |
| {Entidad}Detail | Vista detalle | loading, error, success |
| {Entidad}StatusBadge | Badge de estado | por cada status |

### 7.2 Estados de UI

```
Loading:
┌────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────┘

Empty:
┌────────────────────────────────────┐
│                                    │
│       📭 Sin {entidades}           │
│                                    │
│   Crea tu primer {entidad}         │
│                                    │
│      [+ Crear {entidad}]           │
│                                    │
└────────────────────────────────────┘

Error:
┌────────────────────────────────────┐
│                                    │
│       ❌ Error al cargar           │
│                                    │
│   No se pudieron cargar los datos  │
│                                    │
│         [Reintentar]               │
│                                    │
└────────────────────────────────────┘
```

### 7.3 Responsive

| Breakpoint | Layout |
|------------|--------|
| <640px | Stack vertical, cards full width |
| 640-1024px | 2 columnas |
| >1024px | Sidebar + content |

---

## 8. Permisos

### 8.1 Matriz de Permisos

| Acción | Admin | Manager | User | Guest |
|--------|-------|---------|------|-------|
| Listar | Todos | Todos | Propios | ❌ |
| Ver | Todos | Todos | Propios | ❌ |
| Crear | ✅ | ✅ | ✅ | ❌ |
| Editar | Todos | Propios | Propios | ❌ |
| Eliminar | Todos | ❌ | ❌ | ❌ |
| Aprobar | ✅ | ✅ | ❌ | ❌ |

### 8.2 Row Level Security

```sql
-- Users can see their own records
CREATE POLICY "{entidades}_select_own" ON {entidades}
  FOR SELECT USING (
    auth.uid() = created_by
    OR auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Only creators can update their draft records
CREATE POLICY "{entidades}_update_own" ON {entidades}
  FOR UPDATE USING (
    (auth.uid() = created_by AND status = 'draft')
    OR auth.jwt() ->> 'role' = 'admin'
  );
```

---

## 9. Offline Behavior

### 9.1 Funcionalidad Offline

| Acción | Offline | Sync Strategy |
|--------|---------|---------------|
| Ver lista | ✅ (cache) | Background refresh |
| Ver detalle | ✅ (cache) | Background refresh |
| Crear | ✅ (queue) | On reconnect |
| Editar | ✅ (queue) | Last-write-wins |
| Eliminar | ❌ | Requiere conexión |
| Aprobar | ❌ | Requiere conexión |

### 9.2 Indicadores

```
🟢 Sincronizado
🟡 Sincronizando... (2 pendientes)
🔴 Sin conexión (3 cambios locales)
```

---

## 10. Edge Cases

| Caso | Comportamiento | Test |
|------|----------------|------|
| Nombre con emojis | Permitir, sanitizar XSS | ✅ |
| Doble click en submit | Deshabilitar botón | ✅ |
| Sesión expira durante edición | Guardar borrador local | ✅ |
| Otro usuario edita mismo recurso | Notificar conflicto | ✅ |
| Pérdida de conexión durante save | Queue y reintentar | ✅ |

---

## 11. Testing Checklist

### Unit Tests
- [ ] Validaciones de cada campo
- [ ] Transiciones de estado válidas
- [ ] Transiciones inválidas rechazadas
- [ ] Cálculos de negocio

### Integration Tests
- [ ] CRUD completo via API
- [ ] Permisos por rol
- [ ] Paginación y filtros

### E2E Tests
- [ ] Flujo crear → submit → aprobar
- [ ] Manejo de errores UI
- [ ] Responsive mobile

---

## 12. Métricas

### Eventos a Trackear

| Evento | Propiedades | Propósito |
|--------|-------------|-----------|
| {entidad}_created | id, user_id | Uso |
| {entidad}_submitted | id | Conversión |
| {entidad}_approved | id, approver | Workflow |
| {entidad}_error | code, context | Debug |

---

**Creado:** {fecha}
**Autor:** Spec Writer Agent
**Líneas:** {X}
```

## Output

El archivo debe tener:
- [ ] 800-1200 líneas
- [ ] Todos los campos documentados
- [ ] Diagrama de estados (si aplica)
- [ ] Validaciones con mensajes en español
- [ ] Endpoints con request/response
- [ ] Permisos definidos
- [ ] Edge cases identificados
- [ ] Testing checklist

## Siguientes Pasos

Repetir para cada módulo principal:
```
/oden:spec auth
/oden:spec users
/oden:spec {modulo-principal}
```

Luego:
```
/oden:plan
```

## Referencia

Ver agente completo en: `.claude/agents/spec-writer.md`
