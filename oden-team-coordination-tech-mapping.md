# Oden Team Coordination - Technical Component Mapping

## Executive Summary

Based on the PRD requirements for oden-team-coordination, this document maps functional requirements to technical implementation components, identifies integration points with the existing Oden system, and provides implementation priorities for the team-aware multi-repository coordination system.

**Key Challenge**: Extend Oden from a solo developer tool to team coordination platform while maintaining backward compatibility and zero learning curve for existing users.

---

## 1. Data Layer Requirements

### 1.1 New Data Models

#### Team Configuration Model
```yaml
# .claude/team/config.yml
team:
  name: "engineering-team"
  repositories:
    - url: "https://github.com/org/backend"
      role: "primary"
      codeowners: "src/CODEOWNERS"
    - url: "https://github.com/org/frontend"
      role: "secondary"
      codeowners: "CODEOWNERS"
  members:
    - github: "john-dev"
      role: "backend-lead"
      expertise: ["api", "database", "devops"]
      capacity: 40  # hours/week
    - github: "jane-ui"
      role: "frontend-lead"
      expertise: ["react", "typescript", "design"]
      capacity: 35
```

#### Multi-Repository Epic Model
```markdown
# .claude/epics/{name}/multi-repo.md
---
type: multi-repo-epic
repositories:
  - repo: "org/backend"
    branch: "epic/{name}"
    tasks: [1, 3, 5]
  - repo: "org/frontend"
    branch: "epic/{name}"
    tasks: [2, 4, 6]
coordination:
  lead_repo: "org/backend"
  sync_strategy: "pull_request"
dependencies:
  - task: 2
    depends_on: [1, 3]
    type: "api_contract"
---
```

#### GitHub Sync Extension
```yaml
# Extend existing .claude/epics/{name}/github-mapping.md
repositories:
  backend:
    repo: "org/backend"
    epic_issue: 15
    branch: "epic/payment-integration"
    tasks:
      - local_id: 1
        github_issue: 16
        assignee: "john-dev"
      - local_id: 3
        github_issue: 18
        assignee: "john-dev"
  frontend:
    repo: "org/frontend"
    epic_issue: 8
    branch: "epic/payment-integration"
    tasks:
      - local_id: 2
        github_issue: 9
        assignee: "jane-ui"
```

### 1.2 Expertise & Assignment Data

#### Code Ownership Analysis
```json
# .claude/team/expertise-cache.json
{
  "repositories": {
    "org/backend": {
      "codeowners_parsed": {
        "src/api/*": ["john-dev", "backend-team"],
        "src/db/*": ["john-dev"],
        "tests/*": ["qa-team"]
      },
      "commit_analysis": {
        "john-dev": {
          "files": ["src/api/users.ts", "src/db/schema.sql"],
          "frequency": 45,
          "complexity_score": 8.2
        }
      }
    }
  },
  "team_expertise": {
    "john-dev": {
      "primary": ["backend", "database"],
      "secondary": ["devops"],
      "capacity": 40,
      "current_load": 25
    }
  }
}
```

### 1.3 Cross-Repository Dependencies
```yaml
# .claude/epics/{name}/dependencies.yml
cross_repo_deps:
  - from_task: 2  # Frontend login form
    to_task: 1    # Backend auth API
    type: "api_contract"
    contract_file: "contracts/auth-api.json"
  - from_task: 4  # Frontend payments
    to_task: 3    # Backend payment service
    type: "data_schema"
    shared_types: "types/payment.ts"
```

**Data Model Changes Required:**
- ✅ New team configuration system
- ✅ Multi-repository epic tracking
- ✅ Expertise and capacity modeling
- ✅ Cross-repository dependency tracking
- ⚠️ **NO new database tables** - uses existing file-based system

---

## 2. API Layer Requirements

### 2.1 GitHub Integration Enhancement

#### GitHub App Architecture
```typescript
// New: lib/github/team-app.ts
interface GitHubTeamApp {
  // Enhanced beyond current single-repo approach
  createMultiRepoEpic(epicData: MultiRepoEpic): Promise<GitHubSyncResult>;
  syncCrossRepoIssues(epic: string): Promise<SyncStatus>;
  analyzeCodeOwnership(repos: Repository[]): Promise<OwnershipMap>;
  trackCrossRepoDependencies(epic: string): Promise<DependencyGraph>;
}

interface GitHubSyncResult {
  repositories: Array<{
    repo: string;
    epic_issue: number;
    tasks_created: number;
    branch_created: string;
  }>;
  cross_links_created: number;
  errors: Array<SyncError>;
}
```

#### AI Assignment Engine
```typescript
// New: lib/team/assignment-engine.ts
interface AssignmentEngine {
  analyzeEpicComplexity(epic: EpicSpec): Promise<ComplexityAnalysis>;
  generateWorkStreams(epic: EpicSpec): Promise<WorkStream[]>;
  assignToTeamMembers(streams: WorkStream[]): Promise<Assignment[]>;
  optimizeForCapacity(assignments: Assignment[]): Promise<OptimizedAssignment[]>;
}

interface ComplexityAnalysis {
  total_files: number;
  estimated_hours: number;
  repository_distribution: Record<string, number>;
  skill_requirements: string[];
  dependency_complexity: 'low' | 'medium' | 'high';
}
```

### 2.2 Team Command API Extensions

#### New Team Commands
```typescript
// Extends existing /oden: command structure
interface TeamCommands {
  "/oden:team:prd": (name: string) => Promise<void>;
  "/oden:team:epic": (name: string) => Promise<void>;
  "/oden:team:work": (target: string) => Promise<void>;
  "/oden:team:sync": (name: string) => Promise<void>;
  "/oden:team:dashboard": () => Promise<void>;
}

// Enhanced versions of existing commands
interface EnhancedCommands {
  "/oden:work": (target: string, mode?: 'solo' | 'team') => Promise<void>;
  "/oden:sync": (name: string, scope?: 'local' | 'multi-repo') => Promise<void>;
}
```

#### Architecture Setup Intelligence
```typescript
// New: /oden:architect install implementation
interface ArchitectureIntelligence {
  analyzeTechStack(projectPath: string): Promise<TechStackAnalysis>;
  recommendMCPs(techStack: TechStackAnalysis): Promise<MCPRecommendation[]>;
  createSpecializedAgents(architecture: ProjectArchitecture): Promise<AgentSpec[]>;
  optimizeForTeamSize(teamConfig: TeamConfig): Promise<OptimizationPlan>;
}

interface TechStackAnalysis {
  languages: string[];
  frameworks: string[];
  databases: string[];
  services: string[];
  team_size_estimate: number;
  complexity_score: number;
}
```

### 2.3 Integration Points with Existing System

#### Command System Extension
```bash
# Existing command structure maintained
.claude/commands/oden/
├── work.md          # Enhanced with team mode
├── sync.md          # Enhanced with multi-repo
├── architect.md     # Enhanced with install mode
└── team/            # New team-specific commands
    ├── epic.md
    ├── work.md
    ├── sync.md
    └── dashboard.md
```

#### Agent Orchestration Enhancement
```typescript
// Extends existing Task/Teams system
interface EnhancedOrchestration {
  // Current: Single repo, single team member
  createSoloWorkStream(epic: string): Promise<WorkStream>;

  // New: Multi-repo, multi-team member
  createTeamWorkStreams(epic: string): Promise<TeamWorkStream[]>;
  coordinateParallelWork(streams: TeamWorkStream[]): Promise<CoordinationPlan>;
  syncAcrossRepositories(plan: CoordinationPlan): Promise<SyncResult>;
}
```

---

## 3. UI Layer Requirements

### 3.1 CLI Extensions

#### Enhanced Command Interface
```bash
# Backward compatible - existing commands work unchanged
/oden:work payment-integration        # Solo mode (existing)
/oden:team:work payment-integration   # Team mode (new)

# Enhanced commands with team context
/oden:work payment-integration --team-mode auto
/oden:sync payment-integration --multi-repo
/oden:dashboard --team-view
```

#### Progress Tracking CLI
```bash
# New team status commands
/oden:team:status                     # Team-wide status
/oden:team:capacity                   # Team capacity analysis
/oden:team:conflicts                  # Cross-repo conflict detection
```

### 3.2 Web Dashboard

#### Stakeholder Visibility Interface
```typescript
// New: dashboard/team-dashboard.tsx
interface TeamDashboard {
  components: {
    EpicProgress: React.FC<{epic: string}>;
    TeamCapacity: React.FC<{team: TeamConfig}>;
    CrossRepoDependencies: React.FC<{epic: string}>;
    RealTimeUpdates: React.FC<{repositories: Repository[]}>;
  };
}

// Dashboard features
interface DashboardFeatures {
  epic_progress_tracking: boolean;
  cross_repo_visualization: boolean;
  team_capacity_monitoring: boolean;
  real_time_github_sync: boolean;
  conflict_detection_alerts: boolean;
}
```

#### Export & Integration APIs
```typescript
// New: api/integrations/
interface IntegrationAPIs {
  "/api/linear/sync": (epic: string) => Promise<LinearSync>;
  "/api/notion/export": (epic: string) => Promise<NotionExport>;
  "/api/monday/sync": (epic: string) => Promise<MondaySync>;
}
```

### 3.3 CLI Progress Enhancement

#### Real-Time Team Updates
```bash
# Enhanced progress output
Team Epic: payment-integration (3 repositories)

Progress by Repository:
  backend (org/backend)     ████████░░ 80% (4/5 tasks)
    Stream A: API Layer    ✅ Complete (john-dev)
    Stream B: Database     🔄 In Progress (john-dev)

  frontend (org/frontend)   ██████░░░░ 60% (3/5 tasks)
    Stream C: UI Components ✅ Complete (jane-ui)
    Stream D: Integration   🔄 In Progress (jane-ui)

  mobile (org/mobile)       ░░░░░░░░░░ 0% (0/2 tasks)
    Stream E: SDK          ⏳ Waiting (depends on backend)

Conflicts: 0 detected
Next Sync: 2 minutes
```

---

## 4. Infrastructure Requirements

### 4.1 GitHub App Development

#### Native GitHub Integration
```typescript
// Infrastructure: GitHub App setup
interface GitHubAppInfrastructure {
  app_id: string;
  private_key: string;
  webhook_secret: string;

  permissions: {
    issues: 'write';
    pull_requests: 'write';
    contents: 'write';
    metadata: 'read';
  };

  events: [
    'issues',
    'pull_request',
    'push',
    'repository'
  ];
}
```

#### Multi-Repository Coordination
```typescript
// Infrastructure: Cross-repo sync
interface MultiRepoSync {
  repositories: Repository[];
  sync_strategy: 'webhook' | 'polling' | 'hybrid';
  conflict_resolution: 'manual' | 'auto-merge' | 'queue';
  rate_limiting: {
    github_api: number;
    parallel_repos: number;
  };
}
```

### 4.2 Deployment Architecture

#### Cost-Effective GitHub-Centric Approach
```yaml
# infrastructure/team-coordination.yml
deployment:
  type: "github-native"
  components:
    - github_app: "oden-team-coordinator"
    - webhook_handler: "serverless"
    - data_storage: "repository-files"  # No external DB
    - dashboard: "static-site"          # GitHub Pages

cost_optimization:
  no_external_database: true
  no_premium_integrations: true
  github_actions_only: true
  file_based_storage: true
```

#### Scalability Considerations
```typescript
interface ScalabilityLimits {
  max_repositories_per_epic: 20;
  max_team_members: 50;
  max_parallel_streams: 10;
  github_api_rate_limit: 5000; // per hour
  file_system_storage: true;   // No database overhead
}
```

### 4.3 Development Workflow

#### CI/CD Integration
```yaml
# .github/workflows/team-coordination.yml
name: Team Coordination Tests
on:
  push:
    branches: [epic/*]
  pull_request:
    types: [opened, synchronize]

jobs:
  test-cross-repo-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Test Multi-Repo Epic Creation
      - name: Test Team Assignment Engine
      - name: Test Conflict Detection
      - name: Test GitHub App Integration
```

---

## 5. Integration Complexity Assessment

### 5.1 High Complexity Integrations

#### 🔴 **Critical: Multi-Repository Epic Orchestration**
**Complexity Score: 9/10**

**Challenge**: Coordinating work across 2-20 repositories while maintaining GitHub as source of truth.

**Technical Challenges**:
- Cross-repository issue linking without losing GitHub native features
- Dependency tracking across different repositories
- Branch synchronization and merge conflict prevention
- Rate limiting across multiple GitHub APIs

**Implementation Strategy**:
```typescript
// Phased approach - start with 2 repos, scale to N
interface MultiRepoPhasing {
  Phase1: "2-3 repositories, basic linking";
  Phase2: "5-10 repositories, dependency tracking";
  Phase3: "20+ repositories, advanced coordination";
}
```

#### 🔴 **Critical: AI Assignment Engine**
**Complexity Score: 8/10**

**Challenge**: Intelligent work distribution based on expertise, capacity, and dependencies.

**Technical Challenges**:
- CODEOWNERS parsing across different repository structures
- Commit history analysis for expertise detection
- Capacity planning with real-time workload tracking
- Dependency resolution for optimal task sequencing

**Data Sources Needed**:
```typescript
interface AssignmentDataSources {
  github_api: {
    codeowners_files: string[];
    commit_history: CommitData[];
    pr_reviews: ReviewData[];
    issue_assignments: AssignmentHistory[];
  };
  team_config: {
    declared_expertise: string[];
    capacity_hours: number;
    timezone: string;
  };
  project_analysis: {
    file_complexity: Record<string, number>;
    dependency_graph: DependencyNode[];
  };
}
```

### 5.2 Medium Complexity Integrations

#### 🟡 **Medium: GitHub App Architecture**
**Complexity Score: 6/10**

**Challenge**: Native GitHub integration without browser extension dependency.

**Advantages Over Competitors**:
- Superior to ZenHub's browser extension approach
- Deeper integration than Linear's basic GitHub sync
- Native GitHub experience vs external tools

**Implementation Focus**:
```typescript
interface GitHubAppFeatures {
  priority_high: [
    "multi-repo issue creation",
    "cross-repo linking",
    "CODEOWNERS integration"
  ];
  priority_medium: [
    "automated PR creation",
    "branch synchronization",
    "conflict detection"
  ];
  priority_low: [
    "advanced analytics",
    "custom GitHub integrations"
  ];
}
```

#### 🟡 **Medium: Backward Compatibility**
**Complexity Score: 5/10**

**Challenge**: All existing `/oden:` commands must work unchanged.

**Integration Strategy**:
```typescript
// Command routing system
interface CommandRouting {
  "/oden:work": {
    auto_detect_mode: "solo" | "team";
    fallback_behavior: "solo";
    team_triggers: [
      "multi_repo_epic_detected",
      "team_config_present",
      "explicit_team_flag"
    ];
  };
}
```

### 5.3 Low Complexity Integrations

#### 🟢 **Low: CLI Extensions**
**Complexity Score: 3/10**

**Rationale**: Building on existing command structure, well-established patterns.

#### 🟢 **Low: File-Based Storage**
**Complexity Score: 2/10**

**Rationale**: Extends existing `.claude/` directory structure, no database needed.

---

## 6. Implementation Priority Recommendations

### Phase 1: Foundation (Months 1-3)
**Priority: Critical - Must Have**

1. **Intelligent Architecture Setup** (`/oden:architect install`)
   - **Effort**: 3-4 weeks
   - **Risk**: Low
   - **Value**: High (cost optimization focus)
   - **Dependencies**: Existing architect command

2. **Basic Team Configuration System**
   - **Effort**: 2 weeks
   - **Risk**: Low
   - **Value**: High (enables all other features)
   - **Dependencies**: File-based config system

3. **Dual Command Structure** (`/oden:team:*` vs `/oden:*`)
   - **Effort**: 2-3 weeks
   - **Risk**: Low
   - **Value**: High (backward compatibility)
   - **Dependencies**: Command routing system

4. **Basic Multi-Repo Epic Creation**
   - **Effort**: 4-5 weeks
   - **Risk**: Medium
   - **Value**: High (core differentiator)
   - **Dependencies**: GitHub App, team config

### Phase 2: Intelligence (Months 4-6)
**Priority: High - Strong Differentiation**

5. **AI Assignment Engine MVP**
   - **Effort**: 5-6 weeks
   - **Risk**: High
   - **Value**: High (key competitive advantage)
   - **Dependencies**: GitHub API access, expertise modeling

6. **Cross-Repository Dependency Tracking**
   - **Effort**: 4-5 weeks
   - **Risk**: Medium
   - **Value**: Medium-High
   - **Dependencies**: Multi-repo epics

7. **Enhanced Work Orchestration**
   - **Effort**: 3-4 weeks
   - **Risk**: Medium
   - **Value**: High (extends existing `/oden:work`)
   - **Dependencies**: Team assignment engine

### Phase 3: Professional Features (Months 7-12)
**Priority: Medium - Business Model**

8. **Web Dashboard for Stakeholders**
   - **Effort**: 6-8 weeks
   - **Risk**: Low
   - **Value**: Medium (stakeholder buy-in)
   - **Dependencies**: API layer, authentication

9. **Advanced Conflict Detection**
   - **Effort**: 4-5 weeks
   - **Risk**: Medium
   - **Value**: Medium-High
   - **Dependencies**: Cross-repo tracking

10. **Integration APIs** (Linear, Notion, Monday.com)
    - **Effort**: 3-4 weeks each
    - **Risk**: Low-Medium
    - **Value**: Low-Medium (nice to have)
    - **Dependencies**: Core system stability

### Phase 4: Scale & Polish (Months 12+)
**Priority: Low - Optimization**

11. **Advanced Analytics & Reporting**
12. **Mobile Dashboard App**
13. **Advanced GitHub App Features**
14. **Enterprise SSO Integration**

---

## 7. Risk Assessment & Mitigation

### Technical Risks

**🔴 High Risk: GitHub API Rate Limits**
- **Impact**: Could limit scalability with large teams
- **Mitigation**: Implement intelligent caching, batch operations, webhook-based updates
- **Fallback**: Graceful degradation to manual sync

**🔴 High Risk: AI Assignment Accuracy**
- **Impact**: Poor assignments could hurt adoption
- **Mitigation**: Start with explicit rules, gradually add ML, allow manual override
- **Fallback**: Manual assignment mode always available

**🟡 Medium Risk: Cross-Repo Complexity**
- **Impact**: Hard to debug issues across multiple repositories
- **Mitigation**: Comprehensive logging, clear error messages, rollback capabilities
- **Fallback**: Single-repo mode as backup

### Business Risks

**🟡 Medium Risk: Team Adoption Friction**
- **Impact**: Teams may resist changing workflows
- **Mitigation**: Zero learning curve for solo developers, gradual team feature adoption
- **Strategy**: Start with existing Oden users, add team features incrementally

**🟡 Medium Risk: Competition Response**
- **Impact**: Linear/ZenHub could add similar features
- **Mitigation**: Focus on documentation-first differentiation, open-source community
- **Strategy**: Build sustainable moat through methodology, not just features

---

## 8. Success Metrics & Validation

### Technical Metrics

**Performance Targets**:
- Epic decomposition: <30 seconds for 10+ repositories
- Assignment accuracy: >80% (validated by team leads)
- Sync latency: <5 seconds GitHub to local
- Conflict prevention: 90% reduction in cross-repo merge conflicts

**Quality Targets**:
- Test coverage: >90% for all team coordination features
- API reliability: 99.9% uptime for GitHub sync
- Backward compatibility: 100% existing command compatibility

### Business Metrics

**Adoption Targets**:
- Month 6: 100+ GitHub stars, 10 active teams
- Month 12: 1000+ GitHub stars, 50 active teams
- Month 18: 5000+ GitHub stars, 200+ active teams

**Value Delivery Targets**:
- Coordination time reduction: 8+ hours/week → <2 hours/week
- Epic delivery acceleration: 40% faster vs manual coordination
- Documentation compliance: Maintain 100% documentation-first methodology

---

## Conclusion

The Oden Team Coordination system represents a significant but manageable extension to the existing Oden architecture. By focusing on GitHub-native integration and building incrementally on proven foundations, we can deliver a differentiated team coordination platform while maintaining the core value proposition of documentation-first development.

**Key Success Factors**:
1. **Phased Implementation**: Start with high-value, low-risk features
2. **Backward Compatibility**: Maintain existing user experience
3. **Cost Optimization**: GitHub-centric approach minimizes external dependencies
4. **Intelligence Focus**: AI assignment engine as key differentiator
5. **Community Building**: Open-source approach with professional services model

**Next Steps**:
1. Create technical epic: `/oden:epic oden-team-coordination`
2. Implement Phase 1 foundation components
3. Validate with early adopter teams
4. Iterate based on real-world usage feedback