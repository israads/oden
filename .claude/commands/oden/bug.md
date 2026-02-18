# /oden:bug - Quick Bug Resolution

Sistema de resolución rápida de bugs y problemas de desarrollo sin overhead de PRD/Epic completo.

## Usage

```bash
/oden:bug [descripción del problema]

# Ejemplos
/oden:bug el proyecto no levanta
/oden:bug tests fallan en authentication module
/oden:bug performance lento en dashboard
/oden:bug error importing react components

# Flags opcionales
/oden:bug --quick "npm start error"     # Skip confirmaciones
/oden:bug --verbose "build issues"     # Más detalles de diagnóstico
/oden:bug --dry-run "db connection"    # Solo diagnóstico, no fix
```

## Filosofía

**"Fix Fast, Learn Fast"** - Diagnosticar y resolver problemas comunes con mínimo friction, manteniendo el contexto del proyecto.

---

## IMPLEMENTACIÓN

### Agentes Especializados

1. **bug-detective-agent**
   - Analiza estructura del proyecto
   - Parsea mensajes de error
   - Identifica causa raíz
   - Categoriza tipo de problema

2. **quick-fix-agent**
   - Aplica fixes automatizados
   - Actualiza configuraciones
   - Genera/modifica archivos
   - Maneja dependencias

3. **validator-agent**
   - Verifica efectividad del fix
   - Ejecuta health checks
   - Corre test suites
   - Proporciona confirmación

### Pipeline de Análisis

#### 1. Context Detection
```yaml
Análisis del proyecto:
  - Lee package.json → Identifica framework
  - Revisa config files → Detecta build system
  - Escanea directorios → Patrones de arquitectura
  - Analiza .env files → Setup de environment
  - Revisa logs → Historial de errores recientes

Framework Detection:
  React:
    Indicators: "react" in dependencies
    Config: vite.config.js, webpack.config.js
    Issues: Missing deps, port conflicts

  Next.js:
    Indicators: "next" in dependencies
    Config: next.config.js, .env.local
    Issues: Hydration, API routes, build errors

  Node.js:
    Indicators: "express", "fastify", "koa"
    Config: ecosystem.config.js, docker-compose.yml
    Issues: Port binding, database connection

  React Native:
    Indicators: "react-native" in dependencies
    Config: metro.config.js, ios/android folders
    Issues: Metro bundler, simulator, builds
```

#### 2. Error Pattern Matching
```yaml
Common Patterns:
  "Port already in use":
    Solution: Kill process or change port
    Commands: ["lsof -i :3000", "kill -9 PID", "PORT=3001 npm start"]

  "Module not found":
    Solution: Install missing dependency or fix import
    Commands: ["npm install", "yarn add", "check import paths"]

  "ENOENT: no such file":
    Solution: Create missing file/directory
    Commands: ["mkdir -p", "touch", "cp template"]

  Database Connection:
    Checks: DB running, connection string, network, credentials
    Fixes: Start service, update config, test connectivity
```

#### 3. Solution Application
```yaml
Fix Strategy:
  1. Categorizar problema (startup, build, runtime, config)
  2. Seleccionar solución basada en éxito histórico
  3. Mostrar plan de acción al usuario
  4. Aplicar fix con confirmación
  5. Validar que funciona
  6. Rollback si falla
```

### Knowledge Base
```yaml
Error Database:
  - Pattern matching regex
  - Framework-specific solutions
  - Success rate tracking
  - Solution effectiveness history
  - Learning from user feedback

Solution Templates:
  - Automated commands
  - File templates to create
  - Configuration updates
  - Dependency installations
  - Validation steps
```

---

## CASOS DE USO PRINCIPALES

### Startup Issues
- "el proyecto no levanta" → Missing .env, port conflicts, deps
- "npm start falla" → Scripts, dependencies, node version
- "docker container no arranca" → Dockerfile, ports, volumes

### Build/Deploy Issues
- "build falla en CI" → Environment, dependencies, scripts
- "tests no pasan" → Config, missing files, environment
- "linter errors" → Config files, rules, dependencies

### Runtime Issues
- "API returns 500" → Logs analysis, database, auth
- "componente no renderiza" → Import errors, props, state
- "database connection error" → Service, credentials, network

### Configuration Issues
- "eslint no funciona" → Config files, dependencies, rules
- "typescript errors" → tsconfig, types, imports
- "imports no resuelven" → Paths, aliases, case sensitivity

---

## FLUJO DE INTERACCIÓN EJEMPLO

```bash
$ /oden:bug el proyecto no levanta

🔍 Analizando proyecto...
   ✅ Detectado: Next.js 14 + TypeScript
   ✅ Package.json válido
   ❌ Error encontrado: Missing .env.local

💡 Diagnóstico:
   - Falta archivo .env.local
   - Variables requeridas: DATABASE_URL, NEXTAUTH_SECRET
   - Template disponible: .env.example

🛠️ Soluciones sugeridas:
   1. Copiar .env.example → .env.local (RECOMENDADO)
   2. Crear .env.local desde cero
   3. Ver documentación de setup

¿Aplicar solución 1? (y/n): y

✅ Aplicando fix...
   - Copiado .env.example → .env.local
   - Generado NEXTAUTH_SECRET aleatorio
   - DATABASE_URL configurado para desarrollo

🧪 Validando...
   - npm run dev: ✅ Funciona
   - Build test: ✅ Sin errores
   - Basic tests: ✅ Pasan

✅ Problema resuelto!
   Comando de verificación: npm run dev
```

---

## SUCCESS METRICS

### Effectiveness
- **Success Rate:** 80% de issues resueltos automáticamente
- **Time to Resolution:** <2 minutos para problemas comunes
- **User Satisfaction:** >8.5/10 satisfaction score

### Coverage
- **Error Patterns:** 90% de issues comunes de desarrollo
- **Frameworks:** React, Next.js, Node.js, React Native
- **Issue Categories:**
  - Startup: 95% coverage
  - Build: 85% coverage
  - Config: 90% coverage
  - Dependencies: 80% coverage

---

## IMPLEMENTATION ROADMAP

### Week 1: Core MVP
- [ ] Command structure y parsing
- [ ] Basic context detection (React, Next.js, Node.js)
- [ ] Initial error pattern database (5-10 patterns)
- [ ] Simple automated fixes
- [ ] Basic validation system

### Week 2: Enhanced Detection
- [ ] Expand framework support
- [ ] Log file analysis
- [ ] Environment validation
- [ ] Configuration repair
- [ ] Dependency issue detection
- [ ] 20+ error patterns

### Week 3: Intelligence & Polish
- [ ] Success rate tracking
- [ ] Rollback system
- [ ] Comprehensive validation
- [ ] Learning capabilities
- [ ] Performance optimization
- [ ] Documentation y examples

---

## TESTING STRATEGY

### Automated Tests
- Unit tests para cada error pattern
- Integration tests con proyectos reales
- Performance benchmarks
- Rollback functionality tests

### Manual Testing
- User experience testing
- Edge case scenarios
- Cross-platform compatibility
- Framework-specific testing

---

## PRÓXIMOS PASOS

1. **Crear GitHub Issue** con esta especificación
2. **Fork del proyecto** para development
3. **Implementar MVP** (Semana 1)
4. **Testing con proyectos reales**
5. **Pull Request** con documentación completa

Esta funcionalidad va a reducir significativamente el tiempo de debugging diario y hacer el desarrollo mucho más fluido.