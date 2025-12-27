# Oden Forge

Sistema de skills para crear proyectos profesionales usando la metodología Documentation-First Development.

## Filosofía Core

> "Documenta y diseña COMPLETAMENTE antes de codificar"

## Comandos Disponibles

### Setup
- `/oden:init` - Wizard interactivo para crear proyecto
- `/oden:init-agents` - Instalar agentes de desarrollo
- `/oden:init-mcp` - Instalar MCPs recomendados
- `/oden:help` - Mostrar ayuda

### Pre-Desarrollo (ejecutar en orden)
1. `/oden:architect` - Technical decisions + DB schema
2. `/oden:analyze` - Análisis competitivo + user stories
3. `/oden:spec [módulo]` - Especificación de módulo
4. `/oden:plan` - Plan de implementación
5. `/oden:checklist` - Verificar todo listo

### GitHub Sync (integración CCPM)
- `/oden:sync prd [nombre]` - Crear PRD
- `/oden:sync epic [nombre]` - PRD → Epic técnico
- `/oden:sync tasks [nombre]` - Descomponer en tasks
- `/oden:sync github [nombre]` - Push a GitHub issues
- `/oden:sync start [nombre]` - Iniciar desarrollo
- `/oden:sync issue [#]` - Trabajar en issue
- `/oden:sync close [#]` - Cerrar issue
- `/oden:sync status` - Ver estado

### Durante Desarrollo
- `/oden:dev [agent]` - Invocar agente desarrollo
- `/oden:test [sub]` - Testing
- `/oden:debug [sub]` - Debugging
- `/oden:git [sub]` - Git workflow
- `/oden:research [topic]` - Investigación técnica
- `/oden:daily` - Registrar progreso del día

## Reglas de Oro

### ✅ SIEMPRE
1. Documenta TODO antes de codificar
2. Analiza 3+ competidores
3. Crea specs de 800+ líneas por módulo
4. Registra progreso diario

### ❌ NUNCA
1. No empieces a codificar sin specs completas
2. No documentes cambios triviales
3. No dupliques información

## Estructura de Documentación

```
docs/
├── README.md
├── guides/
├── reference/
│   ├── technical-decisions.md
│   ├── competitive-analysis.md
│   ├── implementation-plan.md
│   └── modules/
├── development/
│   ├── current/
│   └── completed/
├── archived/
└── temp/
```

## Métricas de Éxito

- technical-decisions.md: 2000+ líneas
- competitive-analysis.md: 1000+ líneas
- Specs de módulos: 800+ líneas c/u
- Total pre-código: 8000+ líneas
