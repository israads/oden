const fs = require('fs-extra');
const path = require('path');
const FeatureConfig = require('../init/feature-config');
const TeamConfig = require('../init/team-config');

class InitCommand {
    constructor() {
        this.featureConfig = new FeatureConfig();
        this.teamConfig = new TeamConfig();
    }

    async execute(args, tools) {
        const subcommand = args[0];
        const category = args[1];

        // Handle subcommands
        if (subcommand === 'agents') {
            return this.handleAgentsSubcommand(category, tools);
        }

        if (subcommand === 'mcp') {
            return this.handleMcpSubcommand(category, tools);
        }

        // Main init wizard
        const projectName = subcommand;
        return this.runInitWizard(projectName, tools);
    }

    async runInitWizard(projectName, tools) {
        try {
            console.log('🚀 Starting Oden Forge Project Initialization Wizard...');

            // Step 1: Project basics
            const projectInfo = await this.gatherProjectInfo(projectName, tools);

            // Step 2: Stack recommendation
            const stackInfo = await this.recommendStack(projectInfo, tools);

            // Step 3: Experience level and scope
            const experienceInfo = await this.gatherExperienceAndScope(tools);

            // Step 4: Features and integrations
            const featuresInfo = await this.gatherFeaturesAndIntegrations(projectInfo, tools);

            // Step 5: NEW - Productivity features configuration
            const productivityConfig = await this.configureProductivityFeatures(
                projectInfo, stackInfo, experienceInfo, tools
            );

            // Step 6: NEW - Team configuration
            const teamConfiguration = await this.configureTeamSettings(tools);

            // Step 7: Generate comprehensive configuration
            const fullConfig = this.generateFullConfiguration(
                projectInfo,
                stackInfo,
                experienceInfo,
                featuresInfo,
                productivityConfig,
                teamConfiguration
            );

            // Step 8: Create project structure
            await this.createProjectStructure(fullConfig);

            // Step 9: Save configuration files
            await this.saveConfiguration(fullConfig);

            return this.generateSuccessOutput(fullConfig);

        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }

    async gatherProjectInfo(projectName, tools) {
        // Implementation from existing init command
        // This would contain the existing project info gathering logic
        return {
            name: projectName || 'my-project',
            description: 'A new project created with Oden Forge',
            objective: 'Productividad/trabajo', // Would be gathered from user
            access: 'Navegador escritorio',
            created: new Date().toISOString()
        };
    }

    async recommendStack(projectInfo, tools) {
        // Implementation from existing init command
        // Stack recommendation logic based on project objectives
        return {
            frontend: 'React',
            backend: 'Supabase',
            database: 'PostgreSQL',
            hosting: 'Vercel',
            justification: 'SPA for productivity app with real-time features'
        };
    }

    async gatherExperienceAndScope(tools) {
        // Implementation from existing init command
        return {
            experience: 'Intermedio',
            scope: 'MVP',
            timeline: '6-8 weeks',
            competitors: ['Notion', 'Linear', 'Asana']
        };
    }

    async gatherFeaturesAndIntegrations(projectInfo, tools) {
        // Implementation from existing init command
        return {
            features: ['Dashboard principal', 'CRUD de entidades', 'Roles y permisos'],
            integrations: ['OpenAI', 'Resend']
        };
    }

    async configureProductivityFeatures(projectInfo, stackInfo, experienceInfo, tools) {
        console.log('🔧 Configuring productivity features...');

        // Generate feature selection questions
        const selectionQuestions = this.featureConfig.generateFeatureSelectionQuestions({
            objective: projectInfo.objective,
            experience: experienceInfo.experience
        });

        // Present feature selection
        console.log('\n📋 Available Productivity Features:');
        const enabledFeatures = ['bug_diagnosis', 'brainstorming']; // Mock user selection

        // Generate configuration questions for enabled features
        const configQuestions = this.featureConfig.generateAllQuestions(enabledFeatures, {
            objective: projectInfo.objective,
            framework: stackInfo.frontend
        });

        // Mock user responses (in real implementation, would use AskUserQuestion tool)
        const responses = {
            'bug_diagnosis.auto_fix': false,
            'bug_diagnosis.notification_level': 'all',
            'brainstorming.question_depth': 'enhanced'
        };

        // Apply responses to generate configuration
        const productivityConfig = this.featureConfig.applyResponses(responses, enabledFeatures);

        // Generate recommendations
        const recommendations = this.featureConfig.generateRecommendations({
            objective: projectInfo.objective,
            experience: experienceInfo.experience
        });

        console.log('\n💡 Feature Recommendations:');
        recommendations.forEach(rec => {
            console.log(`  • ${rec.feature}: ${rec.reason}`);
        });

        return {
            enabledFeatures,
            configuration: productivityConfig,
            recommendations
        };
    }

    async configureTeamSettings(tools) {
        console.log('👥 Configuring team settings...');

        const teamQuestions = this.teamConfig.generateTeamQuestions();

        // Mock user responses (in real implementation, would use AskUserQuestion tool)
        const responses = {
            is_team_project: false,
            team_name: '',
            conflict_resolution: 'prompt',
            shared_features: [],
            member_roles: false
        };

        const teamConfiguration = this.teamConfig.applyTeamConfiguration(responses, {});

        return teamConfiguration;
    }

    generateFullConfiguration(projectInfo, stackInfo, experienceInfo, featuresInfo, productivityConfig, teamConfig) {
        const config = {
            project: {
                name: projectInfo.name,
                type: this.inferProjectType(projectInfo.objective),
                description: projectInfo.description,
                created: projectInfo.created,
                team: teamConfig.team?.name || null
            },
            stack: stackInfo,
            features: {
                // Merge existing features with productivity features
                ...productivityConfig.configuration.features,
                // Add project-specific features
                v1_features: featuresInfo.features,
                integrations: featuresInfo.integrations
            },
            team: teamConfig.team,
            experience: {
                level: experienceInfo.experience,
                scope: experienceInfo.scope,
                timeline: experienceInfo.timeline,
                competitors: experienceInfo.competitors
            },
            version: '1.0.0'
        };

        return config;
    }

    inferProjectType(objective) {
        const typeMapping = {
            'Descubrir contenido': 'content-site',
            'Realizar transacciones': 'e-commerce',
            'Productividad/trabajo': 'productivity-app',
            'Comunicación/social': 'social-app',
            'Tracking/monitoreo': 'monitoring-app',
            'Servicio para sistemas': 'api-service'
        };

        return typeMapping[objetivo] || 'web-app';
    }

    async createProjectStructure(config) {
        console.log('📁 Creating project structure...');

        // Create documentation directories (existing logic)
        await fs.ensureDir('docs/guides');
        await fs.ensureDir('docs/reference/modules');
        await fs.ensureDir('docs/development/current');
        await fs.ensureDir('docs/development/completed');
        await fs.ensureDir('docs/archived');
        await fs.ensureDir('docs/temp');

        // Create Claude directories (existing logic)
        await fs.ensureDir('.claude/commands');
        await fs.ensureDir('.claude/scripts');
        await fs.ensureDir('.claude/rules');
        await fs.ensureDir('.claude/context');

        // NEW: Create productivity feature directories
        if (config.features.bug_diagnosis?.enabled) {
            await fs.ensureDir('.claude/diagnosis');
            await fs.ensureDir('.claude/diagnosis/patterns');
            await fs.ensureDir('.claude/diagnosis/backups');
        }

        if (config.features.brainstorming?.enabled) {
            await fs.ensureDir('.claude/brainstorming');
            await fs.ensureDir('.claude/brainstorming/sessions');
        }

        if (config.features.pipeline?.enabled) {
            await fs.ensureDir('.claude/pipeline');
            await fs.ensureDir('.claude/pipeline/reports');
        }

        if (config.features.export?.enabled) {
            await fs.ensureDir('.claude/exports');
            await fs.ensureDir('.claude/exports/templates');
        }

        console.log('✅ Project structure created');
    }

    async saveConfiguration(config) {
        console.log('💾 Saving configuration...');

        // Save main configuration using team config handler
        await this.teamConfig.saveConfigurations(config, config.team?.enabled);

        // Create technical-decisions.md with enhanced content (existing logic + new features)
        await this.createTechnicalDecisionsFile(config);

        // Create CLAUDE.md with updated commands (existing logic)
        await this.createClaudeFile(config);

        // NEW: Create feature-specific configuration files
        await this.createFeatureConfigFiles(config);

        console.log('✅ Configuration saved');
    }

    async createFeatureConfigFiles(config) {
        // Create bug patterns file if bug diagnosis is enabled
        if (config.features.bug_diagnosis?.enabled) {
            const bugPatternsPath = '.claude/diagnosis/patterns/custom-patterns.json';
            await fs.writeJson(bugPatternsPath, {
                patterns: [],
                last_updated: new Date().toISOString(),
                version: '1.0.0'
            }, { spaces: 2 });
        }

        // Create brainstorming templates if brainstorming is enabled
        if (config.features.brainstorming?.enabled) {
            const templatesPath = '.claude/brainstorming/templates.json';
            await fs.writeJson(templatesPath, {
                templates: {},
                project_context: {
                    type: config.project.type,
                    stack: config.stack
                },
                last_updated: new Date().toISOString()
            }, { spaces: 2 });
        }

        // Create pipeline configuration if pipeline is enabled
        if (config.features.pipeline?.enabled) {
            const pipelineConfigPath = '.claude/pipeline/config.json';
            await fs.writeJson(pipelineConfigPath, {
                stages: config.features.pipeline.stages,
                agents: config.features.pipeline.agents,
                timeout_minutes: config.features.pipeline.timeout_minutes,
                fail_fast: config.features.pipeline.fail_fast,
                last_updated: new Date().toISOString()
            }, { spaces: 2 });
        }
    }

    async createTechnicalDecisionsFile(config) {
        // Enhanced technical-decisions.md with productivity features section
        const content = `# Technical Decisions - ${config.project.name}

**Estado:** 🟡 En Progreso
**Última actualización:** ${new Date().toISOString()}

---

## 1. Visión General

### 1.1 Descripción
${config.project.description}

### 1.2 Objetivo Principal
${config.experience.competitors ? `Competidores analizados: ${config.experience.competitors.join(', ')}` : ''}

### 1.3 Scope
**Modalidad:** ${config.experience.scope}
**Timeline estimado:** ${config.experience.timeline}

---

## 2. Stack Tecnológico

### 2.1 Frontend
- **Framework:** ${config.stack.frontend}
- **Justificación:** ${config.stack.justification}

### 2.2 Backend
- **Plataforma:** ${config.stack.backend}
- **Database:** ${config.stack.database}

### 2.3 Hosting
- **Plataforma:** ${config.stack.hosting}

---

## 3. Features V1

${config.features.v1_features?.map(feature => `- [ ] ${feature}`).join('\n') || '- Features to be defined'}

---

## 4. Integraciones

${config.features.integrations?.map(integration => `- ${integration}`).join('\n') || '- No external integrations'}

---

## 5. Productivity Features Configuration

### 5.1 Bug Diagnosis & Auto-Fix
- **Enabled:** ${config.features.bug_diagnosis?.enabled ? '✅' : '❌'}
${config.features.bug_diagnosis?.enabled ? `
- **Auto-fix:** ${config.features.bug_diagnosis.auto_fix ? 'Enabled' : 'Manual approval required'}
- **Backup creation:** ${config.features.bug_diagnosis.backup_before_fix ? 'Always' : 'Disabled'}
- **Notifications:** ${config.features.bug_diagnosis.notification_level}
` : ''}

### 5.2 Enhanced Brainstorming
- **Enabled:** ${config.features.brainstorming?.enabled ? '✅' : '❌'}
${config.features.brainstorming?.enabled ? `
- **Question depth:** ${config.features.brainstorming.question_depth}
- **Session timeout:** ${config.features.brainstorming.session_timeout / 60} minutes
- **Auto-export notes:** ${config.features.brainstorming.auto_export_notes ? 'Yes' : 'No'}
` : ''}

### 5.3 Quality Pipeline
- **Enabled:** ${config.features.pipeline?.enabled ? '✅' : '❌'}
${config.features.pipeline?.enabled ? `
- **Stages:** ${config.features.pipeline.stages.join(', ')}
- **Agents:** ${config.features.pipeline.agents.join(', ')}
- **Timeout:** ${config.features.pipeline.timeout_minutes} minutes
- **Fail fast:** ${config.features.pipeline.fail_fast ? 'Yes' : 'No'}
` : ''}

### 5.4 Development Dashboard
- **Enabled:** ${config.features.dashboard?.enabled ? '✅' : '❌'}
${config.features.dashboard?.enabled ? `
- **Auto-start:** ${config.features.dashboard.auto_start ? 'Yes' : 'No'}
- **Port:** ${config.features.dashboard.port}
- **Notifications:** ${config.features.dashboard.show_notifications ? 'Enabled' : 'Disabled'}
` : ''}

### 5.5 Documentation Export
- **Enabled:** ${config.features.export?.enabled ? '✅' : '❌'}
${config.features.export?.enabled ? `
- **Default format:** ${config.features.export.default_format}
- **Branding:** ${config.features.export.branding?.enabled ? `${config.features.export.branding.company}` : 'Disabled'}
- **Auto-export:** ${config.features.export.auto_export ? 'Yes' : 'No'}
` : ''}

---

## 6. Team Configuration

### 6.1 Team Settings
- **Team project:** ${config.team?.enabled ? '✅' : '❌'}
${config.team?.enabled ? `
- **Team name:** ${config.team.name}
- **Conflict resolution:** ${config.team.conflict_resolution}
- **Shared features:** ${config.team.shared_features?.join(', ') || 'None'}
- **Created by:** ${config.team.created_by}
` : ''}

---

## 7. Arquitectura

[Pendiente: Completar con /oden:architect]

---

## 8. Schema de Base de Datos

[Pendiente: Completar con /oden:architect]

---

## 9. Próximos Pasos

1. [ ] /oden:architect - Completar arquitectura y schema
2. [ ] /oden:prd [feature] - Crear PRD con brainstorming mejorado
3. [ ] /oden:epic [feature] - Epic técnico con work streams
4. [ ] /oden:work [epic] - Desarrollo orquestado con Teams

---

**Creado:** ${config.project.created}
**Generado por:** Oden Forge Extended Wizard v${config.version}
`;

        await fs.writeFile('docs/reference/technical-decisions.md', content);
    }

    async createClaudeFile(config) {
        const content = `# ${config.project.name}

Sistema de desarrollo profesional usando la metodología Documentation-First Development y Oden Forge.

## Filosofía Core

> "Documenta y diseña COMPLETAMENTE antes de codificar"

## Stack Tecnológico

- **Frontend:** ${config.stack.frontend}
- **Backend:** ${config.stack.backend}
- **Database:** ${config.stack.database}
- **Hosting:** ${config.stack.hosting}

## Productivity Features Habilitadas

${Object.entries(config.features)
    .filter(([key, feature]) => key !== 'v1_features' && key !== 'integrations' && feature?.enabled)
    .map(([key, feature]) => `- ✅ ${this.getFeatureName(key)}`)
    .join('\n') || '- Ninguna feature de productividad habilitada'}

## Team Configuration

${config.team?.enabled ? `
- **Team:** ${config.team.name}
- **Conflict Resolution:** ${config.team.conflict_resolution}
- **Shared Config:** ${config.team.shared_config ? 'Yes' : 'No'}
` : '- **Individual Project**'}

## Comandos Disponibles

### Setup y Configuración
- \`/oden:init\` - Wizard de inicialización
- \`/oden:architect\` - Technical decisions + DB schema
- \`/oden:mcp [sub]\` - Gestionar MCPs

### Development Pipeline
- \`/oden:prd [nombre]\` - PRD con brainstorming ${config.features.brainstorming?.enabled ? 'mejorado' : 'estándar'}
- \`/oden:epic [nombre]\` - Epic técnico con work streams
- \`/oden:sync [nombre]\` - Sincronizar con GitHub Issues

### Durante Desarrollo
- \`/oden:work [epic/issue]\` - Orquestador inteligente con Teams
- \`/oden:bug\` - ${config.features.bug_diagnosis?.enabled ? 'Sistema de diagnóstico automático' : 'Comando no habilitado'}
- \`/oden:brainstorm\` - ${config.features.brainstorming?.enabled ? 'Motor de brainstorming inteligente' : 'Comando no habilitado'}
- \`/oden:debug\` - Debug con cola inteligente
- \`/oden:daily\` - Registrar progreso del día

## Reglas de Oro

### ✅ SIEMPRE
1. Documenta TODO antes de codificar
2. Usa las productivity features configuradas
3. Sigue la metodología Documentation-First

### ❌ NUNCA
1. No empieces a codificar sin specs completas
2. No ignores las configuraciones de team
3. No dupliques información

## Estructura de Documentación

\`\`\`
docs/
├── README.md
├── guides/
├── reference/
│   ├── technical-decisions.md
│   └── modules/
├── development/
│   ├── current/
│   └── completed/
└── archived/
\`\`\`

---

**Creado:** ${config.project.created}
**Configuración:** ${config.team?.enabled ? 'Team Project' : 'Individual Project'}
**Oden Forge Version:** ${config.version}
`;

        await fs.writeFile('CLAUDE.md', content);
    }

    getFeatureName(key) {
        const names = {
            bug_diagnosis: 'Bug Diagnosis & Auto-Fix',
            brainstorming: 'Enhanced Brainstorming',
            pipeline: 'Quality Pipeline',
            dashboard: 'Development Dashboard',
            export: 'Documentation Export'
        };
        return names[key] || key;
    }

    generateSuccessOutput(config) {
        const enabledFeatures = Object.entries(config.features)
            .filter(([key, feature]) => key !== 'v1_features' && key !== 'integrations' && feature?.enabled)
            .map(([key]) => this.getFeatureName(key));

        return `
╔══════════════════════════════════════════════════════════════╗
║              ✅ PROYECTO INICIALIZADO CON ÉXITO               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Proyecto: ${config.project.name.padEnd(49)} ║
║  Tipo: ${config.project.type.padEnd(53)} ║
║  Stack: ${config.stack.frontend} + ${config.stack.backend.padEnd(42)} ║
║                                                              ║
║  PRODUCTIVITY FEATURES HABILITADAS:                          ║
${enabledFeatures.map(feature => `║  • ${feature.padEnd(58)} ║`).join('\n')}
║                                                              ║
║  CONFIGURACIÓN:                                              ║
║  • Team Project: ${(config.team?.enabled ? 'Yes' : 'No').padEnd(44)} ║
║  • Configuration Files: .oden-config.json                   ║
║  • Documentation Structure: ✅                               ║
║                                                              ║
║  ARCHIVOS CREADOS:                                           ║
║  • docs/reference/technical-decisions.md                     ║
║  • CLAUDE.md                                                 ║
║  • .oden-config.json                                         ║
${config.team?.enabled ? '║  • .oden-config.personal.json (Git-ignored)                  ║' : ''}
║                                                              ║
║  PRÓXIMO PASO:                                               ║
║                                                              ║
║  /oden:architect                                             ║
║                                                              ║
║  Esto completará tu documentación técnica antes del código  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🚀 Ready to build with enhanced productivity features!

Productivity Features Guide:
${enabledFeatures.length > 0 ? enabledFeatures.map(feature => `  • Use enhanced features throughout your development workflow`).join('\n') : '  • Consider enabling features in .oden-config.json for enhanced productivity'}

${config.team?.enabled ? `
Team Configuration:
  • Team config: .oden-config.json (commit this to Git)
  • Personal config: .oden-config.personal.json (Git-ignored)
  • Share the team config with your team members
` : ''}

Next Steps:
  1. Run: /oden:architect (complete technical architecture)
  2. Create your first feature: /oden:prd [feature-name]
  3. Start development: /oden:work [epic-name]
        `;
    }

    async handleAgentsSubcommand(category, tools) {
        // Existing agents subcommand logic
        console.log(`Installing agents for category: ${category || 'all'}`);
        return 'Agents installation completed';
    }

    async handleMcpSubcommand(category, tools) {
        // Existing MCP subcommand logic
        console.log(`Installing MCPs for category: ${category || 'all'}`);
        return 'MCPs installation completed';
    }
}

module.exports = InitCommand;