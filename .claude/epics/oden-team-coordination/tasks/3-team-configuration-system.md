---
name: team-configuration-system
epic: oden-team-coordination
task_number: 1
work_stream: foundation-layer
status: open
priority: critical
size: M (4-8h)
agent_type: backend-architect
created: 2026-02-19T15:47:57Z
updated: 2026-02-19T17:45:45Z
github: https://github.com/israds/oden/issues/3
depends_on: []
blocks: [4, 6, 8]
execution_group: A
---

# Task 1: Team Configuration System

## 🎯 Overview

Create the foundational team configuration system that extends Oden's existing `.claude/settings.json` patterns to support multi-repository team coordination. This system enables defining team members, repositories, expertise areas, and capacity tracking - the foundation for all team coordination features.

## 🏗️ Technical Specifications

### File Structure to Create
```
.claude/
├── team/
│   ├── config.yml          # Main team configuration
│   ├── members.yml         # Team member definitions
│   └── repositories.yml    # Multi-repo definitions
lib/
├── team/
│   ├── config/
│   │   ├── team-loader.js  # Configuration loading logic
│   │   ├── validator.js    # Configuration validation
│   │   └── migrator.js     # Legacy settings migration
│   └── models/
│       ├── team.js         # Team data model
│       ├── member.js       # Team member model
│       └── repository.js   # Repository model
```

### Core Data Models

#### Team Configuration Schema (.claude/team/config.yml)
```yaml
# Team Configuration Schema - extends existing .claude/settings.json patterns
team:
  name: "team-alpha"
  organization: "company-org"
  created: "2026-02-19T15:47:57Z"

  # Repository coordination
  repositories:
    - name: "backend"
      url: "github.com/company-org/backend"
      role: "primary"           # primary, secondary, shared
      expertise_areas: ["api", "database", "auth"]
      tech_stack: ["nodejs", "postgresql", "docker"]
    - name: "frontend"
      url: "github.com/company-org/frontend"
      role: "secondary"
      expertise_areas: ["ui", "components", "state"]
      tech_stack: ["react", "typescript", "tailwind"]
    - name: "mobile"
      url: "github.com/company-org/mobile-app"
      role: "shared"
      expertise_areas: ["mobile", "api-client"]
      tech_stack: ["react-native", "expo"]

  # Team member definitions
  members:
    - github: "john-backend"
      name: "John Developer"
      expertise: ["backend", "api", "database"]
      capacity: "40h/week"
      timezone: "UTC-5"
      role: "senior-engineer"
    - github: "jane-frontend"
      name: "Jane UI Developer"
      expertise: ["frontend", "design", "ux"]
      capacity: "35h/week"
      timezone: "UTC-8"
      role: "frontend-lead"

  # Coordination settings
  coordination:
    default_assignment_strategy: "expertise_based"  # expertise_based, round_robin, manual
    capacity_tracking: true
    cross_repo_linking: true
    auto_github_sync: true

  # Integration settings
  integrations:
    github:
      organization: "company-org"
      app_installation_id: null  # Set during GitHub App setup
    notifications:
      slack_webhook: null
      email_enabled: false
```

#### Member Model (lib/team/models/member.js)
```javascript
/**
 * Team Member Model
 * Represents individual team members with expertise and capacity
 */
class TeamMember {
  constructor({
    github,
    name,
    expertise = [],
    capacity = "40h/week",
    timezone = "UTC",
    role = "developer"
  }) {
    this.github = github;
    this.name = name;
    this.expertise = expertise;
    this.capacity = capacity;
    this.timezone = timezone;
    this.role = role;
    this.current_assignments = [];
    this.capacity_utilized = 0;
  }

  // Core Methods
  hasExpertise(area) {
    return this.expertise.includes(area);
  }

  getCapacityHours() {
    const match = this.capacity.match(/(\d+)h/);
    return match ? parseInt(match[1]) : 40;
  }

  isAvailable(requiredHours) {
    const available = this.getCapacityHours() - this.capacity_utilized;
    return available >= requiredHours;
  }

  assignTask(taskId, estimatedHours) {
    this.current_assignments.push({
      task_id: taskId,
      hours: estimatedHours,
      assigned_at: new Date().toISOString()
    });
    this.capacity_utilized += estimatedHours;
  }

  // Expertise matching score (0-100)
  getExpertiseScore(requiredAreas) {
    if (!requiredAreas || requiredAreas.length === 0) return 0;
    const matches = requiredAreas.filter(area => this.hasExpertise(area)).length;
    return Math.round((matches / requiredAreas.length) * 100);
  }
}

module.exports = TeamMember;
```

#### Repository Model (lib/team/models/repository.js)
```javascript
/**
 * Repository Model
 * Represents repositories in the team coordination system
 */
class Repository {
  constructor({
    name,
    url,
    role = "secondary",
    expertise_areas = [],
    tech_stack = []
  }) {
    this.name = name;
    this.url = url;
    this.role = role; // primary, secondary, shared
    this.expertise_areas = expertise_areas;
    this.tech_stack = tech_stack;
    this.owner = this.extractOwner(url);
    this.repo_name = this.extractRepoName(url);
  }

  extractOwner(url) {
    const match = url.match(/github\.com\/([^/]+)/);
    return match ? match[1] : null;
  }

  extractRepoName(url) {
    const match = url.match(/github\.com\/[^/]+\/([^/]+)/);
    return match ? match[1].replace('.git', '') : null;
  }

  requiresExpertise(area) {
    return this.expertise_areas.includes(area);
  }

  usesTechStack(tech) {
    return this.tech_stack.includes(tech);
  }

  getGitHubPath() {
    return `${this.owner}/${this.repo_name}`;
  }

  isPrimary() {
    return this.role === "primary";
  }
}

module.exports = Repository;
```

### Configuration Loader (lib/team/config/team-loader.js)
```javascript
/**
 * Team Configuration Loader
 * Handles loading and parsing team configuration files
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const TeamMember = require('../models/member');
const Repository = require('../models/repository');

class TeamConfigLoader {
  constructor(claudeDir = '.claude') {
    this.claudeDir = claudeDir;
    this.teamDir = path.join(claudeDir, 'team');
  }

  // Load complete team configuration
  async loadTeamConfig() {
    try {
      const configPath = path.join(this.teamDir, 'config.yml');

      if (!fs.existsSync(configPath)) {
        return this.createDefaultConfig();
      }

      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(configContent);

      return this.parseTeamConfig(config);
    } catch (error) {
      console.error('Error loading team configuration:', error.message);
      throw new Error(`Failed to load team configuration: ${error.message}`);
    }
  }

  // Parse configuration into models
  parseTeamConfig(config) {
    const teamConfig = config.team;

    return {
      name: teamConfig.name,
      organization: teamConfig.organization,
      created: teamConfig.created,

      // Parse repositories
      repositories: teamConfig.repositories.map(repo => new Repository(repo)),

      // Parse members
      members: teamConfig.members.map(member => new TeamMember(member)),

      // Coordination settings
      coordination: teamConfig.coordination || {},

      // Integrations
      integrations: teamConfig.integrations || {}
    };
  }

  // Create default configuration for first-time setup
  createDefaultConfig() {
    return {
      name: "my-team",
      organization: null,
      created: new Date().toISOString(),
      repositories: [],
      members: [],
      coordination: {
        default_assignment_strategy: "expertise_based",
        capacity_tracking: true,
        cross_repo_linking: true,
        auto_github_sync: true
      },
      integrations: {
        github: {
          organization: null,
          app_installation_id: null
        },
        notifications: {
          slack_webhook: null,
          email_enabled: false
        }
      }
    };
  }

  // Save configuration
  async saveTeamConfig(config) {
    try {
      // Ensure directory exists
      if (!fs.existsSync(this.teamDir)) {
        fs.mkdirSync(this.teamDir, { recursive: true });
      }

      const configPath = path.join(this.teamDir, 'config.yml');
      const yamlContent = yaml.dump({ team: config }, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });

      fs.writeFileSync(configPath, yamlContent, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving team configuration:', error.message);
      throw new Error(`Failed to save team configuration: ${error.message}`);
    }
  }

  // Validate configuration structure
  validateConfig(config) {
    const errors = [];

    if (!config.name || typeof config.name !== 'string') {
      errors.push('Team name is required and must be a string');
    }

    if (!Array.isArray(config.repositories)) {
      errors.push('Repositories must be an array');
    }

    if (!Array.isArray(config.members)) {
      errors.push('Members must be an array');
    }

    // Validate repositories
    config.repositories.forEach((repo, index) => {
      if (!repo.name || !repo.url) {
        errors.push(`Repository ${index}: name and url are required`);
      }
      if (repo.role && !['primary', 'secondary', 'shared'].includes(repo.role)) {
        errors.push(`Repository ${index}: role must be 'primary', 'secondary', or 'shared'`);
      }
    });

    // Validate members
    config.members.forEach((member, index) => {
      if (!member.github) {
        errors.push(`Member ${index}: github username is required`);
      }
      if (!Array.isArray(member.expertise)) {
        errors.push(`Member ${index}: expertise must be an array`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = TeamConfigLoader;
```

## 🎯 Acceptance Criteria

### Core Requirements
- [ ] **Configuration Loading**: System successfully loads team configuration from `.claude/team/config.yml`
- [ ] **Data Validation**: Configuration validation prevents invalid team setups with clear error messages
- [ ] **Model Integration**: Team, Member, and Repository models work together seamlessly
- [ ] **Backward Compatibility**: Existing `.claude/settings.json` functionality remains unchanged
- [ ] **Error Handling**: Graceful handling of missing or corrupted configuration files

### Technical Requirements
- [ ] **File Structure**: All specified directories and files are created correctly
- [ ] **YAML Parsing**: Configuration files use valid YAML format with proper schema validation
- [ ] **Model Relationships**: Members can be matched to repositories based on expertise areas
- [ ] **Capacity Tracking**: Member capacity and utilization calculations work accurately
- [ ] **Configuration Migration**: Legacy settings can be migrated to new team configuration format

### Quality Standards
- [ ] **Test Coverage**: >90% test coverage for all configuration loading and validation logic
- [ ] **Documentation**: Complete JSDoc comments for all public methods and classes
- [ ] **Error Messages**: Clear, actionable error messages for configuration issues
- [ ] **Performance**: Configuration loading completes in <100ms for teams with 50 members

## 🧪 Testing Requirements

### Unit Tests (lib/team/config/__tests__)
```javascript
// team-loader.test.js
describe('TeamConfigLoader', () => {
  test('loads valid team configuration', async () => {
    // Test loading valid config.yml
  });

  test('creates default config when none exists', async () => {
    // Test default configuration creation
  });

  test('validates configuration structure', () => {
    // Test various invalid configurations
  });

  test('saves configuration correctly', async () => {
    // Test configuration saving
  });
});

// member.test.js
describe('TeamMember', () => {
  test('calculates expertise scores correctly', () => {
    // Test expertise matching algorithm
  });

  test('tracks capacity utilization', () => {
    // Test capacity calculations
  });
});

// repository.test.js
describe('Repository', () => {
  test('extracts GitHub owner and repo name', () => {
    // Test URL parsing
  });

  test('matches expertise areas', () => {
    // Test expertise matching
  });
});
```

### Integration Tests
```javascript
// integration/team-config.test.js
describe('Team Configuration Integration', () => {
  test('full configuration lifecycle', async () => {
    // Test: create → load → modify → save → reload
  });

  test('member assignment to repositories', () => {
    // Test member-repository matching
  });
});
```

### Edge Cases to Handle
1. **Missing Configuration Files**: Graceful creation of defaults
2. **Corrupted YAML**: Clear error messages and recovery options
3. **Duplicate Members**: Validation prevents duplicate GitHub usernames
4. **Invalid Repository URLs**: URL format validation and correction suggestions
5. **Capacity Overflow**: Warnings when member capacity is exceeded
6. **Circular Dependencies**: Prevention of circular repository references

## 🔌 Integration Points

### Existing Oden Integration
- **Settings System**: Extends existing `.claude/settings.json` patterns without breaking compatibility
- **Command Infrastructure**: Uses existing `.claude/commands/oden/` structure for team commands
- **File Conventions**: Follows established `.claude/` directory standards and frontmatter patterns

### Future Task Dependencies
- **Task 4 (CODEOWNERS Analysis)**: Uses repository definitions for GitHub analysis
- **Task 6 (Multi-Repo Epic Creation)**: Relies on repository and member models
- **Task 8 (GitHub App Integration)**: Uses team configuration for app installation

### External Dependencies
- **js-yaml**: For YAML configuration parsing (already in package.json)
- **GitHub API**: Repository existence validation (optional enhancement)
- **File System**: Configuration file management

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Configuration Complexity**: Start with simple schema, add complexity incrementally
2. **YAML Parsing Errors**: Comprehensive validation and clear error messages
3. **Performance with Large Teams**: Optimize for teams up to 50 members

### Fallback Strategies
- **Missing Config**: Auto-generate sensible defaults
- **Invalid Config**: Fall back to single-developer mode with warnings
- **File Corruption**: Backup configuration on each successful save

### Security Considerations
- **GitHub Tokens**: Never store tokens in configuration files
- **Sensitive Data**: Validate no secrets are included in team configurations
- **File Permissions**: Ensure configuration files have appropriate read/write permissions

## 📊 Success Metrics

### Technical Metrics
- Configuration loading time: <100ms for 50-member teams
- Zero configuration corruption incidents
- 100% backward compatibility with existing Oden installations

### Business Metrics
- Foundation for all 8 subsequent tasks
- Enables team onboarding in <15 minutes
- Reduces initial team setup from 2+ hours to <30 minutes

## 🎯 Definition of Done

- [ ] All acceptance criteria met and tested
- [ ] Unit tests >90% coverage, all passing
- [ ] Integration tests cover complete configuration lifecycle
- [ ] Documentation complete with setup examples
- [ ] Backward compatibility verified with existing Oden projects
- [ ] Code review completed with team architecture approval
- [ ] Performance benchmarks met (100ms loading, 50-member support)
- [ ] Error handling tested with various failure scenarios

This task establishes the critical foundation that enables all team coordination features while maintaining Oden's core philosophy of simplicity and documentation-first development.