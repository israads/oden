---
name: oden-team-coordination
status: backlog
created: 2026-02-19T15:20:46Z
updated: 2026-02-19T17:45:45Z
progress: 0%
prd: .claude/prds/oden-team-coordination.md
github: https://github.com/israds/oden/issues/2
subagents_used: prd-analyzer, context-gatherer, requirement-mapper, work-stream-architect, task-decomposer
context_optimization: true
orchestration_phases: 3
total_analysis_agents: 5
---

# Epic: Oden Team Coordination System

## 🎯 Overview

Transform Oden from a powerful solo developer tool into the first comprehensive **team coordination platform** that combines documentation-first methodology with intelligent multi-repository orchestration. This epic addresses the $500K-$2M annual loss in mid-sized engineering teams due to poor coordination by extending Oden's proven foundation with AI-driven team intelligence.

**Key Differentiators:** Documentation-first + AI coordination + multi-repo support in a single CLI-native platform, capturing market share from fragmented solutions like Linear ($8-16/user/month), ZenHub ($8.33-25/user/month), and Nx ($19/user/month).

**Strategic Focus:** GitHub-centric, cost-optimized approach with immediate value through `/oden:architect install` for intelligent architecture setup.

## 🏗️ Architecture Decisions

Based on comprehensive analysis of existing Oden infrastructure, this epic leverages **78% of existing codebase** while adding targeted team coordination intelligence.

### Data Model Extensions
**Extends existing `.claude/` file-based system - NO database required**

```yaml
# New: .claude/team/config.yml
team:
  name: "team-name"
  repositories:
    - name: "backend"
      url: "github.com/org/backend"
      role: "primary"
      expertise_areas: ["api", "database"]
    - name: "frontend"
      url: "github.com/org/frontend"
      role: "secondary"
      expertise_areas: ["ui", "components"]
  members:
    - github: "john-dev"
      expertise: ["backend", "api"]
      capacity: "40h/week"
    - github: "jane-ui"
      expertise: ["frontend", "design"]
      capacity: "35h/week"

# Enhanced: .claude/epics/{name}/multi-repo.md
multi_repo_coordination:
  repositories: [backend, frontend, mobile]
  cross_links:
    - from: "backend#123"
      to: "frontend#456"
      type: "api_contract"
  dependencies:
    - task: "API implementation"
      blocks: ["UI integration", "Mobile app"]
```

### API Design Extensions
**Builds on existing GitHub CLI integration patterns**

```typescript
// New: Enhanced GitHub App Integration
interface GitHubTeamCoordination {
  // Extends existing single-repo patterns
  multi_repo_epic_creation(): Promise<MultiRepoEpic>;
  codeowners_analysis(): Promise<ExpertiseMatrix>;
  cross_repo_issue_linking(): Promise<CrossRepoLinks>;
  ai_task_assignment(): Promise<TaskAssignments>;
}

// Enhanced: Dual Command Structure
/oden:work epic-name        // Solo developer (unchanged)
/oden:team:work epic-name   // Team coordination (new)
/oden:architect install     // Intelligent setup (enhanced)
```

### Frontend Extensions
**Leverages existing dashboard foundation in `web/src/App.js`**

- **CLI Enhancements:** Team-aware progress visualization, capacity monitoring
- **Web Dashboard:** Real-time multi-repository progress tracking for stakeholders
- **Export APIs:** Enhanced reporting for Linear, Notion, Monday.com integrations

### Infrastructure Approach
**Cost-Optimized GitHub-Native Strategy**

- **GitHub App:** Native integration superior to browser extensions (ZenHub approach)
- **No External Database:** File-based system maintains cost efficiency
- **MCP Intelligence:** Context7 + project-specific MCP recommendations
- **Local Processing:** Minimize external API calls through intelligent caching

## 🔄 Work Streams
*Designed for optimal parallel execution with minimal coordination overhead*

### Stream 1: Foundation Layer (Priority: Critical)
**Parallel:** Yes (Start immediately)
**Files:** `.claude/team/`, `lib/team/config/`, `.claude/commands/oden/team/`
**Agent Type:** backend-architect

**Focus:** Core infrastructure enabling all other streams
- Team configuration system extending existing `.claude/settings.json` patterns
- **Enhanced `/oden:architect install`** with intelligent MCP recommendations ⭐ **HIGH PRIORITY**
- Dual command structure (`/oden:*` + `/oden:team:*`) with 100% backward compatibility

**Tasks:**
1. **Team Configuration System** (M: 4-8h)
2. **Enhanced /oden:architect install** (L: 1-2d) ⭐ **IMMEDIATE VALUE**
3. **Dual Command Structure** (M: 4-8h)

### Stream 2: Intelligence Layer (Priority: High)
**Parallel:** After Stream 1 config ready
**Files:** `lib/team/assignment/`, `lib/team/expertise/`, `lib/github/analysis/`
**Agent Type:** fullstack-developer

**Focus:** AI assignment engine - core competitive differentiator
- CODEOWNERS parsing across multiple repositories
- Commit history analysis for expertise detection
- AI assignment algorithm achieving >80% accuracy
- Capacity planning and workload optimization

**Tasks:**
4. **CODEOWNERS Analysis Engine** (L: 1-2d)
5. **AI Assignment Logic** (L: 1-2d) - Sequential after Task 4

### Stream 3: Orchestration Layer (Priority: High)
**Parallel:** After Stream 1 foundation
**Files:** `lib/epic/multi-repo/`, `lib/orchestration/team/`, `lib/sync/cross-repo/`
**Agent Type:** backend-architect

**Focus:** Multi-repository coordination extending existing agent orchestration
- Epic decomposition across 2-20 repositories
- Cross-repository task distribution and dependency management
- Enhanced agent orchestration for team contexts
- Progress aggregation maintaining GitHub as source of truth

**Tasks:**
6. **Multi-Repo Epic Creation** (XL: 2-3d)
7. **Cross-Repository Task Distribution** (L: 1-2d) - Sequential after Task 6

### Stream 4: Interface Layer (Priority: Medium)
**Parallel:** After Stream 1 commands ready
**Files:** `web/src/team/`, `lib/github/`, `.claude/commands/oden/team/*.md`
**Agent Type:** fullstack-developer

**Focus:** User interfaces extending existing web dashboard
- GitHub App integration with native permissions
- Team CLI enhancements with progress visualization
- Web dashboard for stakeholder visibility
- API layer for optional third-party integrations

**Tasks:**
8. **GitHub App Integration** (XL: 2-3d)
9. **Team CLI Enhancements** (M: 4-8h) - After CLI structure established

## 📊 Task Summary

| # | Task | Stream | Size | Agent Type | Depends On | Priority |
|---|------|--------|------|------------|------------|----------|
| 1 | Team Configuration System | Foundation | M (4-8h) | backend-architect | - | Critical |
| 2 | Enhanced /oden:architect install ⭐ | Foundation | L (1-2d) | backend-architect | - | **HIGH** |
| 3 | Dual Command Structure | Foundation | M (4-8h) | backend-architect | - | Critical |
| 4 | CODEOWNERS Analysis Engine | Intelligence | L (1-2d) | fullstack-developer | 1 | High |
| 5 | AI Assignment Logic | Intelligence | L (1-2d) | fullstack-developer | 4 | High |
| 6 | Multi-Repo Epic Creation | Orchestration | XL (2-3d) | backend-architect | 1 | High |
| 7 | Cross-Repository Task Distribution | Orchestration | L (1-2d) | backend-architect | 6 | High |
| 8 | GitHub App Integration | Interface | XL (2-3d) | fullstack-developer | 1 | Medium |
| 9 | Team CLI Enhancements | Interface | M (4-8h) | fullstack-developer | 3 | Medium |

**Total tasks:** 9
**Estimated effort:** 12-18 days
**Critical path:** Tasks 1 → 6 → 7 (longest sequential chain: 6-8 days)
**Parallel capability:** Up to 3 tasks can run simultaneously

### Execution Groups for Optimal Parallelization

**Group A (Start Immediately - Week 1):**
- Task 1: Team Configuration System
- Task 2: Enhanced /oden:architect install ⭐ **IMMEDIATE VALUE**
- Task 3: Dual Command Structure

**Group B (Week 2 - After Task 1):**
- Task 4: CODEOWNERS Analysis Engine
- Task 6: Multi-Repo Epic Creation
- Task 8: GitHub App Integration

**Group C (Week 3 - Sequential Dependencies):**
- Task 5: AI Assignment Logic (after Task 4)
- Task 7: Cross-Repository Task Distribution (after Task 6)

**Group D (Week 3-4 - Final Integration):**
- Task 9: Team CLI Enhancements (after CLI structure)

## ✅ Acceptance Criteria (Technical)

### Phase 1: Foundation (Tasks 1-3)
- [ ] **Backward Compatibility:** All existing `/oden:*` commands work unchanged (100% compatibility)
- [ ] **Architecture Intelligence:** `/oden:architect install` provides intelligent MCP recommendations based on tech stack detection
- [ ] **Team Configuration:** Support 2-20 repositories with team member expertise and capacity tracking
- [ ] **Command Routing:** Auto-detection between solo and team modes works seamlessly

### Phase 2: Intelligence & Orchestration (Tasks 4-7)
- [ ] **AI Assignment Accuracy:** >80% assignment accuracy based on CODEOWNERS + commit history analysis
- [ ] **Multi-Repo Coordination:** Epic creation across 2-20 repositories with automated GitHub issue linking
- [ ] **Cross-Repository Dependencies:** Dependency detection and visualization across multiple repositories
- [ ] **Progress Aggregation:** Real-time progress tracking consolidated from multiple repositories

### Phase 3: Integration & Interfaces (Tasks 8-9)
- [ ] **GitHub App Integration:** Native GitHub App handling multi-repository permissions and webhooks
- [ ] **Performance Standards:** Command response time <2 seconds, epic analysis <30 seconds
- [ ] **Team Coordination:** Reduce coordination overhead from 8+ hours/week to <2 hours/week
- [ ] **Scalability:** Support 2-50 developers across 2-20 repositories

### Quality Gates
- [ ] **Test Coverage:** >90% test coverage for all team coordination features
- [ ] **API Reliability:** GitHub synchronization handles rate limits and recovers from failures gracefully
- [ ] **Documentation Coverage:** Maintain 100% documentation-first compliance
- [ ] **Security:** Secure token management across multiple repositories with proper access controls

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation | Source |
|------|--------|------------|---------|
| **AI Assignment Complexity** | High | Start with rule-based system, evolve to ML; manual override always available | task-decomposer |
| **GitHub API Rate Limits** | Medium | Intelligent caching, webhook-based updates, progressive sync | prd-analyzer |
| **Multi-Repo State Consistency** | Medium | GitHub as single source of truth, conflict detection, rollback procedures | context-gatherer |
| **Team Adoption Friction** | Low | Zero learning curve for existing users, gradual feature introduction | requirement-mapper |
| **Backward Compatibility** | High | 100% existing command compatibility, extensive testing, fallback modes | work-stream-architect |

### Technical Risk Mitigation Strategies

**High-Risk Components:**
1. **AI Assignment Engine (Task 5):**
   - Fallback: Rule-based assignment using CODEOWNERS patterns
   - Validation: Manual assignment override always available
   - Testing: >80% accuracy target with real repository data

2. **Multi-Repository Orchestration (Tasks 6-7):**
   - Approach: Incremental scaling (2 repos → N repos)
   - Fallback: Single-repository mode as backup
   - Recovery: Atomic operations with rollback capabilities

**Medium-Risk Components:**
- **GitHub Integration (Task 8):** Use existing patterns from `lib/github/`, implement rate limiting
- **Complex Dependencies:** Clear dependency mapping, automated conflict detection

## 🔗 Dependencies

### Internal Dependencies (Existing Oden Foundation)
- **Agent Orchestration:** Extends `lib/pipeline/agent-coordinator.js` patterns ✅
- **Command System:** Leverages `.claude/commands/oden/` infrastructure ✅
- **GitHub Integration:** Builds on existing `gh` CLI wrapper patterns ✅
- **Configuration Management:** Extends `lib/init/team-config.js` system ✅
- **File Conventions:** Maintains `.claude/` directory standards and frontmatter patterns ✅

### External Dependencies
- **GitHub API:** Core integration for multi-repository coordination and CODEOWNERS access
- **Git Repositories:** Multi-repository access for analysis and coordination
- **GitHub App Permissions:** Installation and webhook access across team repositories
- **Team Directory Services:** GitHub Organizations, potential SSO integration for enterprise

### Blocking Dependencies
- **None:** All tasks can start with existing Oden foundation
- **Critical Path:** Task 1 (Team Config) enables most other streams
- **High Value:** Task 2 (/oden:architect install) provides immediate cost optimization

### Blocked by This Epic
- **Advanced Analytics:** Team productivity analytics and benchmarking (V2)
- **AI Code Review:** Automated code quality analysis across teams (V2)
- **Integration Marketplace:** Third-party plugin ecosystem (V2)

## 💡 Context Optimization Achievement

### Previous Approach vs Orchestrated Intelligence
```
❌ Previous (Single Session): ~15,000+ tokens
- Full PRD analysis + technical context + work streams + tasks
- Context overflow, incomplete analysis
- Linear processing, limited specialized expertise

✅ New (Orchestrated): ~3,000-5,000 tokens per phase
Phase 1: 3 parallel subagents (analysis) - ~12,000 total tokens
Phase 2: 2 sequential subagents (planning) - ~8,000 total tokens
Phase 3: Main assembly (synthesis) - ~5,000 tokens
- Specialized expertise per analysis area
- Parallel processing for efficiency
- Granular failure recovery
- 67% context reduction per phase
```

### Subagent Intelligence Applied
1. **PRD Technical Analyzer:** Extracted core requirements, complexity assessment, integration points
2. **Context Gatherer:** Identified 78% reusable codebase, extension points, existing patterns
3. **Requirements Mapper:** Mapped functional requirements to technical components with priorities
4. **Work Stream Architect:** Designed parallel streams with minimal coordination overhead
5. **Task Decomposer:** Created agent-executable tasks with clear acceptance criteria

### Knowledge Synthesis Quality
- **Comprehensive Analysis:** 5 specialized perspectives on same problem domain
- **Context Preservation:** Each phase builds on previous analysis
- **Recovery Capability:** Can resume from any phase if interrupted
- **Specialized Insights:** Backend, frontend, architecture, and planning expertise applied

## 📈 Success Metrics

### Business Impact (Open-Source + Professional Services)
- **Community Adoption:** Target 1,000+ GitHub stars in first 6 months
- **Coordination Efficiency:** Reduce team coordination time from 8+ hours/week to <2 hours/week
- **Assignment Accuracy:** AI assignment achieving >80% accuracy in real-world usage
- **Cost Optimization:** `/oden:architect install` driving measurable cost reduction

### Technical Performance
- **Response Time:** All team coordination commands <2 seconds
- **Epic Analysis:** Multi-repository epic decomposition <30 seconds
- **Scalability:** Support 2-50 developers across 2-20 repositories
- **Reliability:** 99.9% uptime for GitHub synchronization services

### Competitive Positioning
- **Market Differentiation:** Only solution combining documentation-first + multi-repo + AI coordination
- **Cost Advantage:** GitHub-native approach vs expensive fragmented solutions ($8-50/user/month)
- **Developer Experience:** CLI-native approach superior to browser extensions
- **Enterprise Value:** Professional services model targeting $500K ARR

## 🚀 Implementation Roadmap

### Week 1-2: Foundation & Immediate Value
**Focus:** Establish team infrastructure and deliver immediate cost optimization
- **Critical:** Task 2 (/oden:architect install) for immediate MCP recommendations
- **Foundation:** Tasks 1, 3 for team configuration and command structure
- **Outcome:** Teams can immediately benefit from intelligent architecture setup

### Week 3-4: Intelligence & Coordination
**Focus:** Core team coordination features and AI assignment
- **Intelligence:** Tasks 4, 5 for CODEOWNERS analysis and AI assignment
- **Orchestration:** Tasks 6, 7 for multi-repository epic coordination
- **Outcome:** Full team coordination workflow operational

### Week 5-6: Integration & Polish
**Focus:** GitHub integration and user interface enhancements
- **Integration:** Task 8 for native GitHub App
- **Interface:** Task 9 for enhanced CLI experience
- **Outcome:** Production-ready team coordination platform

### Professional Services Launch (Month 4-6)
- Enterprise team setup and customization services
- Advanced analytics and reporting capabilities
- Third-party integrations (Linear, Notion, Monday.com)

## 💼 Business Model Validation

**Open-Source Strategy:** Core team coordination features free, building community adoption
**Professional Services:** Setup, training, customization targeting $50K+ annual contracts
**Market Opportunity:** Address $500K-$2M annual loss in mid-sized engineering teams
**Competitive Advantage:** Only comprehensive documentation-first + team coordination solution

---

## 🎉 Context-Optimized Epic Summary

This epic leverages **orchestrated subagent intelligence** to transform a complex 15,000+ token analysis into focused, specialized insights. By extending Oden's proven foundation with targeted team coordination features, we address a significant market gap while maintaining cost efficiency and developer experience excellence.

**Key Innovation:** AI-driven team coordination built on documentation-first methodology, delivered through GitHub-native approach that outperforms expensive, fragmented competitive solutions.

**Immediate Value:** `/oden:architect install` provides instant cost optimization through intelligent MCP recommendations, creating adoption momentum for broader team coordination features.