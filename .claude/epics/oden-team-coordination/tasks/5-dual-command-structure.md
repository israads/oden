---
name: dual-command-structure
epic: oden-team-coordination
task_number: 3
work_stream: foundation-layer
status: open
priority: critical
size: M (4-8h)
agent_type: backend-architect
created: 2026-02-19T15:47:57Z
updated: 2026-02-19T17:47:06Z
depends_on: []
blocks: [9]
execution_group: A
github: https://github.com/israds/oden/issues/5
---

# Task 3: Dual Command Structure

## 🎯 Overview

Implement a dual command structure that enables both solo and team development workflows with seamless auto-detection and 100% backward compatibility. The system introduces `/oden:team:*` commands for team coordination while maintaining all existing `/oden:*` commands unchanged.

## 🏗️ Technical Specifications

### Command Architecture Design

#### Dual Command Pattern
```bash
# Solo Developer Commands (unchanged)
/oden:architect install       # Individual architecture setup
/oden:prd [name]             # Personal PRD creation
/oden:epic [name]            # Solo epic management
/oden:work [epic]            # Individual work orchestration

# Team Coordination Commands (new)
/oden:team:architect install # Team-optimized architecture setup
/oden:team:prd [name]        # Collaborative PRD creation
/oden:team:epic [name]       # Multi-repository epic management
/oden:team:work [epic]       # Team work orchestration
```

#### Auto-Detection Logic
```javascript
/**
 * Command Router with Intelligent Mode Detection
 * Automatically routes commands based on project context
 */
class CommandRouter {
  constructor() {
    this.teamConfigPath = '.claude/team/config.yml';
    this.detectionCache = new Map();
    this.fallbackMode = 'solo';
  }

  async routeCommand(command, args) {
    const mode = await this.detectWorkflowMode();

    // Handle explicit team commands
    if (command.startsWith('/oden:team:')) {
      return this.executeTeamCommand(command.replace('/oden:team:', '/oden:'), args, true);
    }

    // Handle standard commands with intelligent routing
    if (mode === 'team' && this.isTeamCapableCommand(command)) {
      console.log('🔄 Team mode detected - using team-optimized workflow');
      return this.executeTeamCommand(command, args, false);
    }

    // Default to solo mode
    return this.executeSoloCommand(command, args);
  }

  async detectWorkflowMode() {
    // Cache detection for performance
    const cacheKey = 'workflow_mode';
    if (this.detectionCache.has(cacheKey)) {
      return this.detectionCache.get(cacheKey);
    }

    const fs = require('fs').promises;

    try {
      // Check for team configuration
      const teamConfigExists = await this.fileExists(this.teamConfigPath);
      if (!teamConfigExists) {
        this.detectionCache.set(cacheKey, 'solo');
        return 'solo';
      }

      // Validate team configuration
      const teamConfig = await this.loadTeamConfig();
      const isValidTeamConfig = this.validateTeamConfig(teamConfig);

      const mode = isValidTeamConfig ? 'team' : 'solo';
      this.detectionCache.set(cacheKey, mode);

      return mode;
    } catch (error) {
      console.warn('⚠️ Team configuration detection failed, falling back to solo mode');
      this.detectionCache.set(cacheKey, 'solo');
      return 'solo';
    }
  }

  isTeamCapableCommand(command) {
    const teamCapableCommands = [
      '/oden:architect',
      '/oden:prd',
      '/oden:epic',
      '/oden:work',
      '/oden:sync',
      '/oden:tasks'
    ];

    return teamCapableCommands.some(cmd => command.startsWith(cmd));
  }

  async executeTeamCommand(command, args, explicit = false) {
    // Load team coordination modules
    const TeamArchitect = require('./team/commands/architect');
    const TeamEpic = require('./team/commands/epic');
    const TeamWork = require('./team/commands/work');

    const commandMap = {
      '/oden:architect': TeamArchitect,
      '/oden:prd': TeamPRD,
      '/oden:epic': TeamEpic,
      '/oden:work': TeamWork,
      '/oden:sync': TeamSync,
      '/oden:tasks': TeamTasks
    };

    const baseCommand = this.extractBaseCommand(command);
    const CommandClass = commandMap[baseCommand];

    if (!CommandClass) {
      if (explicit) {
        throw new Error(`Team command not implemented: ${command}`);
      }
      // Fallback to solo command
      return this.executeSoloCommand(command, args);
    }

    const commandInstance = new CommandClass({
      explicit_team_mode: explicit,
      team_config: await this.loadTeamConfig()
    });

    return commandInstance.execute(args);
  }

  async executeSoloCommand(command, args) {
    // Load existing solo command modules (unchanged)
    const SoloArchitect = require('./commands/architect');
    const SoloEpic = require('./commands/epic');
    const SoloWork = require('./commands/work');

    // Existing command routing logic (unchanged)
    const commandMap = {
      '/oden:architect': SoloArchitect,
      '/oden:prd': SoloPRD,
      '/oden:epic': SoloEpic,
      '/oden:work': SoloWork
    };

    const baseCommand = this.extractBaseCommand(command);
    const CommandClass = commandMap[baseCommand];

    if (!CommandClass) {
      throw new Error(`Unknown command: ${command}`);
    }

    const commandInstance = new CommandClass();
    return commandInstance.execute(args);
  }

  extractBaseCommand(command) {
    // Extract base command from variations
    // /oden:team:epic -> /oden:epic
    // /oden:epic:tasks -> /oden:epic
    return command.split(':').slice(0, 2).join(':');
  }

  async loadTeamConfig() {
    const fs = require('fs').promises;
    const yaml = require('js-yaml');

    try {
      const configContent = await fs.readFile(this.teamConfigPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      return null;
    }
  }

  validateTeamConfig(config) {
    if (!config || !config.team) return false;
    if (!config.team.repositories || config.team.repositories.length === 0) return false;
    if (!config.team.members || config.team.members.length === 0) return false;
    return true;
  }

  async fileExists(path) {
    const fs = require('fs').promises;
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = CommandRouter;
```

### File Structure Implementation

#### Command Structure
```
.claude/
├── commands/oden/
│   ├── architect.md          # Solo architect command (unchanged)
│   ├── epic.md              # Solo epic command (unchanged)
│   ├── work.md              # Solo work command (unchanged)
│   └── team/                # New team command namespace
│       ├── architect.md     # Team architect documentation
│       ├── epic.md          # Team epic documentation
│       ├── work.md          # Team work documentation
│       └── sync.md          # Team synchronization documentation
lib/
├── commands/                # Existing solo commands (unchanged)
│   ├── architect.js
│   ├── epic.js
│   └── work.js
├── team/commands/           # New team command implementations
│   ├── architect.js         # Team-aware architect command
│   ├── epic.js              # Multi-repository epic management
│   ├── work.js              # Team work orchestration
│   └── sync.js              # Cross-repository synchronization
└── routing/
    ├── command-router.js    # Main command routing logic
    ├── mode-detector.js     # Workflow mode detection
    └── compatibility.js     # Backward compatibility layer
```

#### Team Command Base Class
```javascript
/**
 * Base Team Command Class
 * Provides common functionality for all team commands
 */
class BaseTeamCommand {
  constructor(options = {}) {
    this.explicit_team_mode = options.explicit_team_mode || false;
    this.team_config = options.team_config;
    this.solo_fallback_enabled = true;
  }

  async execute(args) {
    try {
      // Validate team configuration
      if (!this.team_config || !this.validateTeamConfig(this.team_config)) {
        return this.handleInvalidTeamConfig(args);
      }

      // Execute team-specific logic
      return await this.executeTeamLogic(args);
    } catch (error) {
      console.error(`Team command execution failed: ${error.message}`);

      if (this.solo_fallback_enabled && !this.explicit_team_mode) {
        console.log('🔄 Falling back to solo mode...');
        return this.executeSoloFallback(args);
      }

      throw error;
    }
  }

  async executeTeamLogic(args) {
    // To be implemented by specific team commands
    throw new Error('executeTeamLogic must be implemented by subclass');
  }

  async executeSoloFallback(args) {
    // Load corresponding solo command and execute
    const SoloCommand = this.getSoloCommandClass();
    const soloCommand = new SoloCommand();
    return soloCommand.execute(args);
  }

  getSoloCommandClass() {
    // To be implemented by specific team commands
    throw new Error('getSoloCommandClass must be implemented by subclass');
  }

  validateTeamConfig(config) {
    if (!config || !config.team) return false;
    if (!Array.isArray(config.team.repositories) || config.team.repositories.length === 0) return false;
    if (!Array.isArray(config.team.members) || config.team.members.length === 0) return false;
    return true;
  }

  handleInvalidTeamConfig(args) {
    if (this.explicit_team_mode) {
      console.error('❌ Team command requires valid team configuration');
      console.log('💡 Run /oden:team:init to set up team configuration');
      return process.exit(1);
    }

    console.log('⚠️ No valid team configuration found, using solo mode');
    return this.executeSoloFallback(args);
  }

  // Team-specific utilities
  async getTeamRepositories() {
    return this.team_config.team.repositories || [];
  }

  async getTeamMembers() {
    return this.team_config.team.members || [];
  }

  async getPrimaryRepository() {
    const repos = await this.getTeamRepositories();
    return repos.find(repo => repo.role === 'primary') || repos[0];
  }
}

module.exports = BaseTeamCommand;
```

#### Team Architect Command Implementation
```javascript
/**
 * Team Architect Command
 * Extends solo architect with team-specific features
 */
const BaseTeamCommand = require('./base-team-command');
const SoloArchitect = require('../../commands/architect');

class TeamArchitect extends BaseTeamCommand {
  constructor(options) {
    super(options);
    this.command_name = 'architect';
  }

  async executeTeamLogic(args) {
    const subcommand = args[0] || 'help';

    switch (subcommand) {
      case 'install':
        return this.executeTeamInstall(args.slice(1));
      case 'analyze':
        return this.executeTeamAnalyze(args.slice(1));
      case 'sync':
        return this.executeTeamSync(args.slice(1));
      default:
        return this.executeTeamHelp();
    }
  }

  async executeTeamInstall(args) {
    console.log('🏗️ Team Architect Install');
    console.log('=========================');

    const repositories = await this.getTeamRepositories();
    const members = await this.getTeamMembers();

    console.log(`🎯 Setting up architecture for ${repositories.length} repositories`);
    console.log(`👥 Optimizing for ${members.length} team members`);

    // Enhanced installation with team context
    const enhancedArgs = [
      ...args,
      '--team-mode',
      `--team-size=${members.length}`,
      `--repo-count=${repositories.length}`
    ];

    // Use enhanced architect install from Task 2
    const EnhancedArchitect = require('../../architect/enhanced-installer');
    const installer = new EnhancedArchitect({
      team_config: this.team_config
    });

    return installer.execute(enhancedArgs);
  }

  async executeTeamAnalyze(args) {
    console.log('🔍 Team Architecture Analysis');
    console.log('============================');

    const repositories = await this.getTeamRepositories();
    const analysis_results = [];

    for (const repo of repositories) {
      console.log(`\n📊 Analyzing ${repo.name}...`);

      // This would integrate with repository analysis
      const repo_analysis = await this.analyzeRepository(repo);
      analysis_results.push({
        repository: repo.name,
        analysis: repo_analysis
      });
    }

    // Consolidate team-wide architecture insights
    return this.consolidateArchitectureAnalysis(analysis_results);
  }

  async executeTeamSync(args) {
    console.log('🔄 Team Architecture Synchronization');
    console.log('===================================');

    // Synchronize architectural decisions across repositories
    const repositories = await this.getTeamRepositories();

    for (const repo of repositories) {
      console.log(`\n⚙️ Syncing architecture for ${repo.name}...`);
      await this.syncRepositoryArchitecture(repo);
    }

    console.log('\n✅ Team architecture synchronization complete');
  }

  getSoloCommandClass() {
    return SoloArchitect;
  }

  async analyzeRepository(repo) {
    // Repository-specific analysis logic
    return {
      tech_stack: ['nodejs', 'express', 'postgresql'],
      complexity: 'medium',
      recommendations: ['Add API documentation', 'Implement caching layer']
    };
  }

  async consolidateArchitectureAnalysis(analyses) {
    // Team-wide architecture consolidation
    console.log('\n📋 Team Architecture Summary');
    console.log('============================');

    for (const analysis of analyses) {
      console.log(`\n${analysis.repository}:`);
      console.log(`  Tech Stack: ${analysis.analysis.tech_stack.join(', ')}`);
      console.log(`  Complexity: ${analysis.analysis.complexity}`);
      console.log(`  Recommendations: ${analysis.analysis.recommendations.length}`);
    }

    return analyses;
  }

  async syncRepositoryArchitecture(repo) {
    // Implementation for syncing architecture across repositories
    console.log(`  ✅ ${repo.name} synchronized`);
  }
}

module.exports = TeamArchitect;
```

### Command Registration System

#### Main Command Entry Point (.claude/commands/oden/main.js)
```javascript
/**
 * Main Oden Command Entry Point
 * Handles command routing and execution
 */
const CommandRouter = require('../../lib/routing/command-router');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);

  if (!command) {
    console.log('Usage: /oden:<command> [args...]');
    process.exit(1);
  }

  const router = new CommandRouter();

  try {
    const result = await router.routeCommand(command, commandArgs);

    if (result && typeof result === 'object' && result.exit_code !== undefined) {
      process.exit(result.exit_code);
    }

    process.exit(0);
  } catch (error) {
    console.error(`❌ Command execution failed: ${error.message}`);

    if (process.env.DEBUG) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main();
}

module.exports = { main };
```

## 🎯 Acceptance Criteria

### Core Functionality
- [ ] **Backward Compatibility**: All existing `/oden:*` commands work exactly as before with zero breaking changes
- [ ] **Auto-Detection**: System automatically detects team vs solo mode based on presence of valid team configuration
- [ ] **Explicit Team Commands**: `/oden:team:*` commands work correctly and provide team-specific functionality
- [ ] **Graceful Fallback**: Team commands fall back to solo mode when team configuration is invalid or missing

### Command Routing
- [ ] **Intelligent Routing**: Standard commands automatically use team mode when team configuration is detected
- [ ] **Performance**: Command detection and routing complete in <100ms
- [ ] **Caching**: Mode detection is cached for performance and consistency within command execution
- [ ] **Error Handling**: Clear error messages when team commands are used without proper configuration

### Team Command Features
- [ ] **Team Context**: Team commands have access to team configuration (repositories, members, coordination settings)
- [ ] **Multi-Repository Support**: Team commands can operate across multiple repositories as configured
- [ ] **Member Awareness**: Team commands consider team member expertise and capacity when relevant
- [ ] **Solo Fallback**: Team commands gracefully fall back to solo mode when team context is unavailable

### Quality Standards
- [ ] **Test Coverage**: >90% test coverage for command routing and mode detection
- [ ] **Documentation**: Complete documentation for both solo and team command variations
- [ ] **User Experience**: Clear feedback about which mode is being used and why
- [ ] **Performance**: No measurable performance impact on existing solo commands

## 🧪 Testing Requirements

### Unit Tests
```javascript
// command-router.test.js
describe('CommandRouter', () => {
  test('detects solo mode when no team config exists', async () => {
    // Test solo mode detection
  });

  test('detects team mode with valid team configuration', async () => {
    // Test team mode detection
  });

  test('routes standard commands to team mode when detected', async () => {
    // Test automatic team routing
  });

  test('handles explicit team commands correctly', async () => {
    // Test /oden:team:* command routing
  });

  test('falls back to solo mode when team config is invalid', async () => {
    // Test fallback behavior
  });
});

// base-team-command.test.js
describe('BaseTeamCommand', () => {
  test('validates team configuration correctly', () => {
    // Test team config validation
  });

  test('executes solo fallback when needed', async () => {
    // Test fallback execution
  });

  test('provides team context to subcommands', async () => {
    // Test team context availability
  });
});
```

### Integration Tests
```javascript
// dual-command-integration.test.js
describe('Dual Command Integration', () => {
  test('complete workflow: solo -> team setup -> team commands', async () => {
    // Test full dual command lifecycle
  });

  test('backward compatibility with existing projects', async () => {
    // Test with existing Oden projects
  });

  test('team command fallback behavior', async () => {
    // Test various fallback scenarios
  });
});
```

### Edge Case Testing
1. **Missing Team Configuration**: Commands handle missing `.claude/team/config.yml` gracefully
2. **Corrupted Team Configuration**: Invalid YAML is handled with clear error messages
3. **Partial Team Configuration**: Missing repositories or members are handled appropriately
4. **Mixed Command Usage**: Using both solo and team commands in same session works correctly
5. **Performance Edge Cases**: Large team configurations don't impact command performance

## 🔌 Integration Points

### Existing Oden Infrastructure
- **Command System**: Extends existing command infrastructure without breaking changes
- **Configuration**: Works with existing `.claude/settings.json` and new team configuration
- **Error Handling**: Uses established error handling patterns and user feedback

### Team Configuration System
- **Task 1 Integration**: Relies on team configuration system for mode detection
- **Validation**: Uses team configuration validation from Task 1
- **Models**: Integrates with Team, Member, and Repository models

### Future Task Dependencies
- **Task 9 (Team CLI Enhancements)**: Blocked by this task's command structure
- **All Team Commands**: Foundation for team-specific implementations

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Breaking Changes**: Comprehensive backward compatibility testing
2. **Performance Impact**: Caching and optimization for mode detection
3. **Command Confusion**: Clear documentation and feedback about active mode

### Fallback Strategies
- **Detection Failures**: Always fall back to solo mode
- **Team Command Errors**: Graceful fallback to solo equivalents
- **Configuration Issues**: Clear error messages with recovery instructions

### Security Considerations
- **Configuration Access**: Validate team configuration file permissions
- **Command Injection**: Sanitize all command arguments properly
- **Team Context**: Ensure team information doesn't leak between projects

## 📊 Success Metrics

### Technical Metrics
- Command routing performance: <100ms detection time
- Zero breaking changes to existing commands
- 100% successful fallback behavior in error scenarios

### User Experience Metrics
- Clear mode feedback: Users understand which mode is active
- Seamless transition: No learning curve for team mode adoption
- Error clarity: Clear next steps when team commands fail

### Business Impact
- Foundation for team coordination features (enables Tasks 4-9)
- Adoption enabler: Teams can gradually adopt team features
- Maintains Oden's core philosophy while adding team capabilities

## 🎯 Definition of Done

- [ ] All acceptance criteria met and tested
- [ ] Backward compatibility verified with 10+ existing Oden projects
- [ ] Performance benchmarks met (100ms command routing)
- [ ] Unit tests >90% coverage, all passing
- [ ] Integration tests cover all command routing scenarios
- [ ] Edge case handling tested and documented
- [ ] Code review completed with architecture approval
- [ ] Documentation updated with dual command structure
- [ ] User experience validated with beta testing
- [ ] Team command base structure ready for specific implementations

This task establishes the essential command structure that enables all team coordination features while maintaining complete backward compatibility with Oden's existing solo developer workflow.