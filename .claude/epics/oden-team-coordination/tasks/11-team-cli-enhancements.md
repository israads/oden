---
name: team-cli-enhancements
epic: oden-team-coordination
task_number: 9
work_stream: interface-layer
status: open
priority: medium
size: M (4-8h)
agent_type: fullstack-developer
created: 2026-02-19T15:47:57Z
updated: 2026-02-19T17:54:33Z
github: https://github.com/israds/oden/issues/11
depends_on: [3]
blocks: []
execution_group: D
---

# Task 9: Team CLI Enhancements

## 🎯 Overview

Enhance Oden's CLI interface with team-specific features that provide intuitive progress visualization, capacity monitoring, team member coordination, and multi-repository status display. These enhancements maintain Oden's philosophy of CLI-native excellence while adding sophisticated team coordination capabilities that complement the GitHub App integration.

## 🏗️ Technical Specifications

### Enhanced CLI Architecture

#### File Structure
```
.claude/
├── commands/oden/team/
│   ├── dashboard.md              # Team dashboard command
│   ├── status.md                 # Multi-repo status command
│   ├── capacity.md               # Team capacity monitoring
│   ├── assign.md                 # Interactive task assignment
│   └── sync.md                   # Team synchronization commands
├── scripts/oden/team/
│   ├── dashboard.sh              # Team dashboard script
│   ├── status-aggregator.sh     # Multi-repo status aggregation
│   ├── capacity-monitor.sh      # Capacity monitoring script
│   └── assignment-helper.sh     # Assignment assistance script
lib/
├── cli/
│   ├── team/
│   │   ├── dashboard-renderer.js  # Team dashboard rendering
│   │   ├── progress-visualizer.js # Progress visualization
│   │   ├── capacity-calculator.js # Capacity calculations
│   │   └── status-aggregator.js   # Multi-repo status aggregation
│   ├── interface/
│   │   ├── team-interface.js     # Enhanced team CLI interface
│   │   ├── interactive-prompts.js # Interactive team operations
│   │   ├── color-theme.js        # Team-aware color themes
│   │   └── ascii-art.js          # Team coordination ASCII art
│   └── visualization/
│       ├── progress-charts.js    # CLI-based progress charts
│       ├── capacity-bars.js      # Capacity visualization bars
│       ├── timeline-renderer.js  # Timeline visualization
│       └── dependency-graph.js   # Dependency graph rendering
web/
├── src/team/
│   ├── components/
│   │   ├── TeamDashboard.jsx     # Web team dashboard
│   │   ├── ProgressOverview.jsx  # Progress overview component
│   │   ├── CapacityView.jsx      # Team capacity visualization
│   │   └── StatusAggregator.jsx  # Multi-repo status display
│   └── hooks/
│       ├── useTeamStatus.js      # Team status data hook
│       ├── useProgressData.js    # Progress data management
│       └── useCapacityData.js    # Capacity data management
```

#### Enhanced Team CLI Interface (lib/cli/team/team-interface.js)
```javascript
/**
 * Enhanced Team CLI Interface
 * Provides sophisticated team coordination through CLI
 */
class TeamCLIInterface {
  constructor(teamConfig, expertiseMatrix) {
    this.team_config = teamConfig;
    this.expertise_matrix = expertiseMatrix;

    // Initialize components
    this.dashboard_renderer = new DashboardRenderer();
    this.progress_visualizer = new ProgressVisualizer();
    this.capacity_calculator = new CapacityCalculator(teamConfig);
    this.status_aggregator = new StatusAggregator();
    this.interactive_prompts = new InteractivePrompts();

    // CLI styling
    this.colors = this.initializeColorTheme();
    this.ascii_art = new ASCIIArt();
  }

  /**
   * Display comprehensive team dashboard
   * @param {Object} options - Dashboard display options
   */
  async displayTeamDashboard(options = {}) {
    const {
      detailed = false,
      repositories = null,
      time_range = '7d',
      interactive = false
    } = options;

    console.log(this.ascii_art.getTeamHeader());
    console.log(this.colors.title('🎯 Oden Team Coordination Dashboard'));
    console.log('='.repeat(60));

    // Team overview
    await this.displayTeamOverview();

    // Active epics
    await this.displayActiveEpics(repositories);

    // Team capacity
    await this.displayTeamCapacity();

    // Progress summary
    await this.displayProgressSummary(time_range);

    // Multi-repository status
    await this.displayMultiRepoStatus(repositories);

    if (detailed) {
      // Detailed sections
      await this.displayDetailedMetrics();
      await this.displayRecentActivity(time_range);
      await this.displayUpcomingMilestones();
    }

    if (interactive) {
      await this.displayInteractiveActions();
    }

    console.log('\n' + '='.repeat(60));
    console.log(this.colors.success('✅ Dashboard updated') + ` - ${new Date().toLocaleTimeString()}`);
  }

  /**
   * Display team overview section
   */
  async displayTeamOverview() {
    const team = this.team_config.team;

    console.log('\n' + this.colors.section('👥 Team Overview'));
    console.log(`Team: ${this.colors.highlight(team.name)}`);
    console.log(`Members: ${this.colors.number(team.members.length)}`);
    console.log(`Repositories: ${this.colors.number(team.repositories.length)}`);

    // Team member status
    const memberStatus = await this.getMemberStatusSummary();
    const availableMembers = memberStatus.filter(m => m.status === 'available').length;
    const busyMembers = memberStatus.filter(m => m.status === 'busy').length;
    const offlineMembers = memberStatus.filter(m => m.status === 'offline').length;

    console.log('\nMember Availability:');
    if (availableMembers > 0) {
      console.log(`  ${this.colors.success('●')} Available: ${this.colors.number(availableMembers)}`);
    }
    if (busyMembers > 0) {
      console.log(`  ${this.colors.warning('●')} Busy: ${this.colors.number(busyMembers)}`);
    }
    if (offlineMembers > 0) {
      console.log(`  ${this.colors.muted('●')} Offline: ${this.colors.number(offlineMembers)}`);
    }
  }

  /**
   * Display active epics
   * @param {Array} repositories - Filter by repositories
   */
  async displayActiveEpics(repositories = null) {
    console.log('\n' + this.colors.section('🚀 Active Epics'));

    const activeEpics = await this.getActiveEpics(repositories);

    if (activeEpics.length === 0) {
      console.log(this.colors.muted('  No active epics found.'));
      return;
    }

    for (const epic of activeEpics) {
      console.log(`\n  ${this.colors.highlight(epic.name)}`);
      console.log(`    Progress: ${this.renderProgressBar(epic.progress, 30)} ${epic.progress}%`);
      console.log(`    Repositories: ${this.colors.number(epic.repositories.length)}`);
      console.log(`    Tasks: ${this.colors.number(epic.completed_tasks)}/${this.colors.number(epic.total_tasks)}`);

      if (epic.blocked_tasks > 0) {
        console.log(`    ${this.colors.error('⚠️')} Blocked: ${this.colors.number(epic.blocked_tasks)}`);
      }

      if (epic.overdue_tasks > 0) {
        console.log(`    ${this.colors.error('🕐')} Overdue: ${this.colors.number(epic.overdue_tasks)}`);
      }
    }
  }

  /**
   * Display team capacity overview
   */
  async displayTeamCapacity() {
    console.log('\n' + this.colors.section('⚡ Team Capacity'));

    const capacityData = await this.capacity_calculator.calculateTeamCapacity();

    console.log(`Overall Utilization: ${this.renderCapacityBar(capacityData.overall_utilization)} ${capacityData.overall_utilization}%`);
    console.log(`Available Capacity: ${this.colors.success(capacityData.available_hours + 'h')} this week`);

    // Individual member capacity
    if (capacityData.members.length <= 8) { // Only show individual if team is small
      console.log('\nMember Capacity:');
      for (const member of capacityData.members) {
        const utilizationBar = this.renderCapacityBar(member.utilization, 20);
        const status = member.utilization > 90 ? this.colors.error('●') :
                     member.utilization > 75 ? this.colors.warning('●') :
                     this.colors.success('●');

        console.log(`  ${status} ${member.name.padEnd(15)} ${utilizationBar} ${member.utilization}% (${member.available}h available)`);
      }
    }

    // Capacity warnings
    if (capacityData.warnings.length > 0) {
      console.log('\n' + this.colors.warning('⚠️  Capacity Warnings:'));
      for (const warning of capacityData.warnings) {
        console.log(`  • ${warning}`);
      }
    }
  }

  /**
   * Display progress summary
   * @param {string} timeRange - Time range for progress analysis
   */
  async displayProgressSummary(timeRange) {
    console.log('\n' + this.colors.section('📊 Progress Summary'));

    const progressData = await this.progress_visualizer.getProgressData(timeRange);

    // Overall progress metrics
    console.log(`Tasks Completed: ${this.colors.success(progressData.completed)} this ${timeRange}`);
    console.log(`Average Completion Time: ${this.colors.highlight(progressData.avg_completion_time)} days`);
    console.log(`Velocity: ${this.colors.number(progressData.velocity)} tasks/week`);

    // Progress trend
    const trendIndicator = progressData.trend > 0 ? '📈' : progressData.trend < 0 ? '📉' : '➡️';
    const trendColor = progressData.trend > 0 ? this.colors.success : progressData.trend < 0 ? this.colors.error : this.colors.muted;
    console.log(`Trend: ${trendIndicator} ${trendColor(progressData.trend_description)}`);

    // Progress by repository
    if (progressData.repositories.length > 1) {
      console.log('\nRepository Progress:');
      for (const repo of progressData.repositories) {
        const progress = this.renderProgressBar(repo.completion_percentage, 20);
        console.log(`  ${repo.name.padEnd(20)} ${progress} ${repo.completion_percentage}%`);
      }
    }
  }

  /**
   * Display multi-repository status
   * @param {Array} repositories - Filter by repositories
   */
  async displayMultiRepoStatus(repositories = null) {
    console.log('\n' + this.colors.section('🏭 Multi-Repository Status'));

    const statusData = await this.status_aggregator.aggregateStatus(repositories);

    // Overall health
    const healthIndicator = statusData.overall_health === 'healthy' ? '💚' :
                          statusData.overall_health === 'warning' ? '💛' :
                          '❤️';

    console.log(`Overall Health: ${healthIndicator} ${this.colors.highlight(statusData.overall_health.toUpperCase())}`);

    // Repository details
    for (const repo of statusData.repositories) {
      const status = repo.status === 'healthy' ? this.colors.success('●') :
                    repo.status === 'warning' ? this.colors.warning('●') :
                    this.colors.error('●');

      console.log(`\n  ${status} ${this.colors.highlight(repo.name)}`);
      console.log(`    Branch: ${repo.current_branch}`);
      console.log(`    Last Update: ${repo.last_update}`);
      console.log(`    Open Issues: ${this.colors.number(repo.open_issues)}`);
      console.log(`    Open PRs: ${this.colors.number(repo.open_prs)}`);

      if (repo.issues && repo.issues.length > 0) {
        console.log(`    Issues: ${repo.issues.slice(0, 3).map(i => `#${i.number}`).join(', ')}`);
      }
    }
  }

  /**
   * Display detailed metrics (for detailed mode)
   */
  async displayDetailedMetrics() {
    console.log('\n' + this.colors.section('📈 Detailed Metrics'));

    const metrics = await this.getDetailedMetrics();

    // Performance metrics
    console.log('\nPerformance:');
    console.log(`  Cycle Time: ${metrics.cycle_time} days (avg)`);
    console.log(`  Lead Time: ${metrics.lead_time} days (avg)`);
    console.log(`  Throughput: ${metrics.throughput} tasks/week`);

    // Quality metrics
    console.log('\nQuality:');
    console.log(`  Defect Rate: ${metrics.defect_rate}%`);
    console.log(`  Rework Rate: ${metrics.rework_rate}%`);
    console.log(`  Test Coverage: ${metrics.test_coverage}%`);

    // Collaboration metrics
    console.log('\nCollaboration:');
    console.log(`  Cross-Repo Tasks: ${metrics.cross_repo_tasks}`);
    console.log(`  Pair Programming: ${metrics.pair_programming}%`);
    console.log(`  Code Reviews: ${metrics.code_reviews} (avg/task)`);
  }

  /**
   * Display interactive actions menu
   */
  async displayInteractiveActions() {
    console.log('\n' + this.colors.section('🎮 Quick Actions'));

    const actions = [
      { key: 'a', description: 'Assign task to team member', action: 'assign_task' },
      { key: 's', description: 'Sync epic progress', action: 'sync_epic' },
      { key: 'c', description: 'Check team capacity', action: 'check_capacity' },
      { key: 'r', description: 'Refresh dashboard', action: 'refresh' },
      { key: 'h', description: 'Show help', action: 'help' },
      { key: 'q', description: 'Quit', action: 'quit' }
    ];

    for (const action of actions) {
      console.log(`  [${this.colors.highlight(action.key)}] ${action.description}`);
    }

    const choice = await this.interactive_prompts.promptForChoice('Choose an action:', actions);
    await this.executeInteractiveAction(choice);
  }

  /**
   * Execute interactive action
   * @param {Object} action - Selected action
   */
  async executeInteractiveAction(action) {
    switch (action.action) {
      case 'assign_task':
        await this.interactiveTaskAssignment();
        break;
      case 'sync_epic':
        await this.interactiveEpicSync();
        break;
      case 'check_capacity':
        await this.displayTeamCapacity();
        break;
      case 'refresh':
        await this.displayTeamDashboard({ interactive: true });
        break;
      case 'help':
        await this.displayHelp();
        break;
      case 'quit':
        console.log(this.colors.muted('👋 Goodbye!'));
        process.exit(0);
        break;
    }
  }

  /**
   * Interactive task assignment
   */
  async interactiveTaskAssignment() {
    console.log('\n' + this.colors.section('📋 Interactive Task Assignment'));

    // Get unassigned tasks
    const unassignedTasks = await this.getUnassignedTasks();

    if (unassignedTasks.length === 0) {
      console.log(this.colors.success('✅ All tasks are assigned!'));
      return;
    }

    // Select task
    const task = await this.interactive_prompts.promptForSelection('Select a task:', unassignedTasks, 'title');

    // Get suitable assignees
    const suitableMembers = await this.getSuitableAssignees(task);

    // Select assignee
    const assignee = await this.interactive_prompts.promptForSelection('Select assignee:', suitableMembers, 'name');

    // Perform assignment
    console.log(`\n${this.colors.info('🔄')} Assigning task "${task.title}" to ${assignee.name}...`);

    try {
      const result = await this.assignTask(task, assignee);
      if (result.success) {
        console.log(`${this.colors.success('✅')} Task assigned successfully!`);
        console.log(`   GitHub Issue: ${result.github_url}`);
      } else {
        console.log(`${this.colors.error('❌')} Assignment failed: ${result.reason}`);
      }
    } catch (error) {
      console.log(`${this.colors.error('❌')} Assignment failed: ${error.message}`);
    }
  }

  /**
   * Render progress bar
   * @param {number} percentage - Progress percentage (0-100)
   * @param {number} width - Bar width in characters
   * @returns {string} Rendered progress bar
   */
  renderProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    if (percentage >= 80) return this.colors.success(bar);
    if (percentage >= 50) return this.colors.warning(bar);
    return this.colors.error(bar);
  }

  /**
   * Render capacity bar
   * @param {number} utilization - Capacity utilization (0-100)
   * @param {number} width - Bar width in characters
   * @returns {string} Rendered capacity bar
   */
  renderCapacityBar(utilization, width = 20) {
    const filled = Math.round((utilization / 100) * width);
    const empty = width - filled;

    const bar = '▓'.repeat(filled) + '░'.repeat(empty);

    if (utilization >= 95) return this.colors.error(bar);
    if (utilization >= 85) return this.colors.warning(bar);
    if (utilization >= 70) return this.colors.success(bar);
    return this.colors.muted(bar);
  }

  /**
   * Initialize color theme
   * @returns {Object} Color functions
   */
  initializeColorTheme() {
    const chalk = require('chalk');

    return {
      title: chalk.bold.cyan,
      section: chalk.bold.yellow,
      highlight: chalk.bold.white,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      info: chalk.blue,
      muted: chalk.gray,
      number: chalk.bold.magenta
    };
  }

  // Data retrieval methods
  async getMemberStatusSummary() {
    // This would integrate with team status tracking
    return this.team_config.team.members.map(member => ({
      name: member.name || member.github,
      github: member.github,
      status: 'available', // This would be calculated based on actual data
      current_tasks: 2,
      capacity_utilization: 75
    }));
  }

  async getActiveEpics(repositories) {
    // This would fetch active epics from the epic system
    return [
      {
        name: 'Team Coordination System',
        progress: 65,
        repositories: repositories || this.team_config.team.repositories,
        total_tasks: 25,
        completed_tasks: 16,
        blocked_tasks: 2,
        overdue_tasks: 1
      }
    ];
  }

  async getDetailedMetrics() {
    // This would calculate detailed team metrics
    return {
      cycle_time: 3.2,
      lead_time: 5.1,
      throughput: 12,
      defect_rate: 2.3,
      rework_rate: 8.1,
      test_coverage: 87,
      cross_repo_tasks: 15,
      pair_programming: 23,
      code_reviews: 2.1
    };
  }

  async getUnassignedTasks() {
    // This would fetch unassigned tasks
    return [
      {
        id: 'task-123',
        title: 'Implement user authentication API',
        repository: 'backend',
        priority: 'high',
        estimated_hours: 8
      },
      {
        id: 'task-124',
        title: 'Create login form component',
        repository: 'frontend',
        priority: 'medium',
        estimated_hours: 4
      }
    ];
  }

  async getSuitableAssignees(task) {
    // This would use the expertise matrix to find suitable assignees
    return this.team_config.team.members.filter(member => {
      // Simple filtering - in reality this would use the AI assignment system
      return member.expertise && member.expertise.some(skill =>
        task.title.toLowerCase().includes(skill.toLowerCase())
      );
    }).map(member => ({
      ...member,
      name: member.name || member.github,
      suitability_score: 85 // This would be calculated
    }));
  }

  async assignTask(task, assignee) {
    // This would integrate with the assignment system
    return {
      success: true,
      github_url: `https://github.com/org/${task.repository}/issues/123`
    };
  }
}

module.exports = TeamCLIInterface;
```

#### Team Dashboard Script (.claude/scripts/oden/team/dashboard.sh)
```bash
#!/bin/bash
set -euo pipefail

# Team Dashboard Script
# Displays comprehensive team coordination dashboard

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"

# Configuration
DETAILED=false
REPOSITORIES=""
TIME_RANGE="7d"
INTERACTIVE=false
REFRESH_INTERVAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

show_help() {
    cat << EOF
Oden Team Dashboard

USAGE:
    /oden:team:dashboard [OPTIONS]

OPTIONS:
    -d, --detailed          Show detailed metrics and analysis
    -r, --repositories REPOS Comma-separated list of repositories to focus on
    -t, --time-range RANGE  Time range for analysis (1d, 7d, 30d, 90d)
    -i, --interactive       Enable interactive mode with quick actions
    --refresh SECONDS       Auto-refresh every N seconds (0 disables)
    -h, --help             Show this help message

EXAMPLES:
    /oden:team:dashboard                           # Basic team dashboard
    /oden:team:dashboard --detailed                # Detailed dashboard
    /oden:team:dashboard -r backend,frontend       # Focus on specific repos
    /oden:team:dashboard --interactive             # Interactive dashboard
    /oden:team:dashboard --refresh 30              # Auto-refresh every 30 seconds

INTERACTIVE COMMANDS:
    [a] Assign task        [s] Sync epic progress    [c] Check capacity
    [r] Refresh dashboard  [h] Show help            [q] Quit
EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--detailed)
                DETAILED=true
                shift
                ;;
            -r|--repositories)
                REPOSITORIES="$2"
                shift 2
                ;;
            -t|--time-range)
                TIME_RANGE="$2"
                shift 2
                ;;
            -i|--interactive)
                INTERACTIVE=true
                shift
                ;;
            --refresh)
                REFRESH_INTERVAL="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Check if team configuration exists
check_team_config() {
    if [[ ! -f ".claude/team/config.yml" ]]; then
        echo -e "${RED}❌ Team configuration not found${NC}"
        echo -e "${BLUE}💡 Run ${WHITE}/oden:team:init${BLUE} to set up team configuration${NC}"
        exit 1
    fi
}

# Display team dashboard
display_dashboard() {
    # Clear screen if interactive
    if [[ "$INTERACTIVE" == "true" ]]; then
        clear
    fi

    # Call the Node.js dashboard implementation
    local args="--time-range=$TIME_RANGE"

    if [[ "$DETAILED" == "true" ]]; then
        args="$args --detailed"
    fi

    if [[ -n "$REPOSITORIES" ]]; then
        args="$args --repositories=$REPOSITORIES"
    fi

    if [[ "$INTERACTIVE" == "true" ]]; then
        args="$args --interactive"
    fi

    node "$SCRIPT_DIR/../../../lib/cli/team/team-interface.js" dashboard $args
}

# Auto-refresh loop
auto_refresh_loop() {
    if [[ "$REFRESH_INTERVAL" -gt 0 ]]; then
        echo -e "${BLUE}🔄 Auto-refresh enabled (${REFRESH_INTERVAL}s intervals)${NC}"
        echo -e "${GRAY}Press Ctrl+C to stop${NC}"

        while true; do
            display_dashboard
            sleep "$REFRESH_INTERVAL"
        done
    else
        display_dashboard
    fi
}

# Handle interruption gracefully
trap 'echo -e "\n${GRAY}👋 Dashboard stopped${NC}"; exit 0' INT

# Main execution
main() {
    # Parse arguments
    parse_args "$@"

    # Validate team configuration
    check_team_config

    # Show startup message
    echo -e "${CYAN}"
    cat << 'EOF'
   ___      _            _____
  / _ \  __| | ___ _ __ |_   _|__ __ _ _ __ ___
 | | | |/ _` |/ _ \ '_ \  | |/ _ / _` | '_ ` _ \
 | |_| | (_| |  __/ | | | | |  __/ (_| | | | | |
  \___/ \__,_|\___|_| |_| |_|\___\__,_|_| |_| |_|

EOF
    echo -e "${WHITE}Team Coordination Dashboard${NC}"
    echo -e "${NC}"

    # Start dashboard
    auto_refresh_loop
}

# Execute main function with all arguments
main "$@"
```

## 🎯 Acceptance Criteria

### CLI Enhancement Core
- [ ] **Team Dashboard**: Comprehensive team dashboard with progress, capacity, and status visualization
- [ ] **Multi-Repository Status**: Aggregate status display across all team repositories
- [ ] **Capacity Monitoring**: Real-time team capacity tracking with utilization warnings
- [ ] **Interactive Operations**: Interactive CLI mode for task assignment and coordination actions

### Visualization Features
- [ ] **Progress Charts**: CLI-based progress visualization with ASCII charts and bars
- [ ] **Capacity Bars**: Team member capacity visualization with color-coded status
- [ ] **Timeline Display**: Project timeline and milestone visualization in CLI
- [ ] **Status Indicators**: Clear visual indicators for team, repository, and epic status

### User Experience
- [ ] **Responsive Design**: Dashboard adapts to different terminal sizes and capabilities
- [ ] **Color Theme Support**: Consistent color theming with accessibility considerations
- [ ] **Auto-refresh Mode**: Optional auto-refresh capability for live monitoring
- [ ] **Help Integration**: Contextual help and command documentation

### Integration Quality
- [ ] **Real-time Data**: Dashboard displays real-time data from team coordination systems
- [ ] **GitHub Sync**: Synchronizes with GitHub App data for accurate status display
- [ ] **Cross-Platform**: Works consistently across macOS, Linux, and Windows terminals
- [ ] **Performance**: Dashboard loads and updates within 3 seconds

## 🧪 Testing Requirements

### Unit Tests
```javascript
// team-cli-interface.test.js
describe('TeamCLIInterface', () => {
  test('renders team dashboard correctly', async () => {
    // Test dashboard rendering
  });

  test('displays progress visualization', async () => {
    // Test progress bars and charts
  });

  test('shows capacity monitoring', async () => {
    // Test capacity calculations and display
  });

  test('handles interactive actions', async () => {
    // Test interactive command handling
  });
});

// dashboard-renderer.test.js
describe('DashboardRenderer', () => {
  test('renders progress bars correctly', () => {
    // Test progress bar rendering
  });

  test('handles different terminal sizes', () => {
    // Test responsive rendering
  });
});
```

### Integration Tests
```javascript
// team-cli-integration.test.js
describe('Team CLI Integration', () => {
  test('integrates with team configuration', async () => {
    // Test team config integration
  });

  test('displays real GitHub data', async () => {
    // Test GitHub integration data display
  });

  test('interactive mode works correctly', async () => {
    // Test interactive functionality
  });
});
```

### User Experience Tests
```javascript
// cli-ux.test.js
describe('CLI User Experience', () => {
  test('dashboard loads quickly', async () => {
    // Test performance requirements
  });

  test('color themes work correctly', () => {
    // Test color theme functionality
  });

  test('handles terminal resize', () => {
    // Test responsive behavior
  });
});
```

### Cross-Platform Testing
1. **macOS Terminal**: Test with native macOS terminal and iTerm2
2. **Linux Terminals**: Test with bash, zsh, and various Linux terminals
3. **Windows Terminals**: Test with PowerShell, Windows Terminal, and Git Bash
4. **CI/CD Environments**: Test in headless and limited terminal environments
5. **Different Screen Sizes**: Test with various terminal window sizes

## 🔌 Integration Points

### Dual Command Structure (Task 3)
- **Command Routing**: Uses dual command structure for team-specific CLI commands
- **Team Mode Detection**: Automatically enables team features when team configuration exists
- **Backward Compatibility**: Maintains compatibility with solo developer workflows

### GitHub App Integration (Task 8)
- **Real-time Data**: Displays data from GitHub App webhook events
- **Issue Status**: Shows GitHub issue status in team dashboard
- **Progress Tracking**: Integrates GitHub-based progress tracking

### Team Configuration System (Task 1)
- **Team Data**: Uses team configuration for dashboard display
- **Member Information**: Displays team member capacity and assignments
- **Repository Configuration**: Shows multi-repository status and coordination

### Cross-Repository Task Distribution (Task 7)
- **Task Assignment**: Integrates with task distribution for interactive assignment
- **Progress Visualization**: Shows distributed task progress across repositories
- **Coordination Status**: Displays cross-repository coordination status

## 🚨 Risk Mitigation

### User Experience Risks
1. **Terminal Compatibility**: Test across diverse terminal environments
2. **Performance Issues**: Optimize for fast rendering and data fetching
3. **Information Overload**: Use progressive disclosure and filtering options

### Technical Implementation Risks
1. **Real-time Data Sync**: Handle data synchronization failures gracefully
2. **CLI Rendering Issues**: Test with various terminal configurations
3. **Interactive Mode Complexity**: Provide clear navigation and error handling

### Integration Complexity
1. **Data Consistency**: Ensure consistent data across CLI and web interfaces
2. **GitHub API Dependencies**: Handle API failures and rate limiting
3. **Cross-Platform Issues**: Address platform-specific CLI behaviors

### Adoption and Usability
1. **Learning Curve**: Provide intuitive interfaces with helpful prompts
2. **Feature Discovery**: Make advanced features discoverable but not overwhelming
3. **Migration Path**: Support gradual adoption from solo to team workflows

## 📊 Success Metrics

### User Experience Metrics
- **Dashboard Load Time**: <3 seconds for complete dashboard rendering
- **Interactive Response**: <500ms response time for interactive actions
- **Terminal Compatibility**: 100% functionality across supported terminals
- **User Satisfaction**: >4.5/5 rating for CLI usability

### Feature Adoption
- **Dashboard Usage**: >70% of team users regularly use team dashboard
- **Interactive Mode**: >50% of users try interactive features
- **Capacity Monitoring**: >60% of teams use capacity monitoring features
- **Multi-Repository View**: >80% of multi-repo teams use aggregated status

### Technical Performance
- **Memory Usage**: <100MB memory usage for dashboard operations
- **CPU Efficiency**: <5% CPU usage during normal operation
- **Network Efficiency**: <1MB data transfer for typical dashboard refresh
- **Cross-Platform Consistency**: Identical functionality across all supported platforms

### Business Impact
- **Coordination Efficiency**: Reduction in time spent checking individual repositories
- **Team Awareness**: Improved visibility into team capacity and progress
- **Decision Speed**: Faster decision-making with real-time team status
- **Tool Consolidation**: Reduced need for external team coordination tools

## 🎯 Definition of Done

- [ ] All acceptance criteria met and validated
- [ ] Team dashboard displays comprehensive team coordination information
- [ ] Multi-repository status aggregation works across all team repositories
- [ ] Capacity monitoring provides accurate team utilization tracking
- [ ] Interactive mode enables task assignment and coordination actions
- [ ] Progress visualization uses effective CLI-based charts and indicators
- [ ] Auto-refresh mode provides live monitoring capabilities
- [ ] Color theming works consistently across different terminals
- [ ] Performance benchmarks met (3-second load time, 500ms interactivity)
- [ ] Cross-platform testing completed on macOS, Linux, and Windows
- [ ] Integration tests pass with all team coordination systems
- [ ] User experience validated with beta teams across different terminal setups
- [ ] Error handling covers network failures and data unavailability
- [ ] Help documentation integrated and accessible
- [ ] Code review completed with CLI/UX best practices validation

This task completes the team coordination epic by providing an intuitive, powerful CLI interface that maintains Oden's philosophy of CLI-native excellence while adding sophisticated team coordination capabilities that complement the GitHub App and other coordination systems.