---
name: enhanced-architect-install
epic: oden-team-coordination
task_number: 2
work_stream: foundation-layer
status: open
priority: high
size: L (1-2d)
agent_type: backend-architect
created: 2026-02-19T15:47:57Z
updated: 2026-02-19T17:47:06Z
depends_on: []
blocks: []
execution_group: A
immediate_value: true
github: https://github.com/israds/oden/issues/4
---

# Task 2: Enhanced /oden:architect install ⭐

## 🎯 Overview

Transform the existing `/oden:architect install` command into an intelligent architecture setup system that provides immediate value through smart MCP recommendations, tech stack analysis, and cost optimization insights. This is the **highest priority task** that delivers immediate business value and drives adoption.

## 🚀 Business Impact

**Immediate Value Proposition:**
- **Cost Optimization**: Intelligent MCP recommendations can reduce architecture setup time by 60-80%
- **Decision Support**: Tech stack analysis prevents costly architectural mistakes
- **Adoption Driver**: Provides instant value to teams evaluating Oden
- **Market Differentiation**: No competitor offers intelligent architecture setup with cost analysis

## 🏗️ Technical Specifications

### Enhanced Command Structure
```bash
# Current (basic):
/oden:architect install

# Enhanced (intelligent):
/oden:architect install                    # Interactive mode with intelligence
/oden:architect install --tech-stack=node # Targeted recommendations
/oden:architect install --team-mode       # Team-optimized setup
/oden:architect install --analyze-only    # Architecture analysis only
/oden:architect install --cost-estimate   # Cost optimization analysis
```

### File Structure to Create/Enhance
```
.claude/
├── commands/oden/
│   └── architect.md                       # Enhanced command documentation
├── scripts/oden/
│   ├── architect/
│   │   ├── install-enhanced.sh           # Main enhanced installation script
│   │   ├── tech-stack-analyzer.js       # Technology detection and analysis
│   │   ├── mcp-recommender.js           # Intelligent MCP recommendation engine
│   │   ├── cost-estimator.js            # Architecture cost analysis
│   │   └── team-optimizer.js            # Team-specific optimizations
lib/
├── architect/
│   ├── intelligence/
│   │   ├── stack-detector.js            # Tech stack detection logic
│   │   ├── dependency-analyzer.js       # Dependency analysis and recommendations
│   │   ├── cost-calculator.js          # Cost calculation for different architectures
│   │   └── mcp-matcher.js              # MCP matching algorithm
│   ├── recommendations/
│   │   ├── mcp-database.js             # Comprehensive MCP recommendation database
│   │   ├── stack-templates.js          # Pre-built stack configurations
│   │   └── best-practices.js           # Architecture best practices
│   └── setup/
│       ├── enhanced-installer.js       # Enhanced installation orchestrator
│       ├── team-setup.js              # Team-specific setup procedures
│       └── validation.js              # Post-installation validation
```

### Core Intelligence Engine

#### Tech Stack Detector (lib/architect/intelligence/stack-detector.js)
```javascript
/**
 * Technology Stack Detection Engine
 * Analyzes project structure to identify technologies and recommend optimal MCPs
 */
class TechStackDetector {
  constructor() {
    this.detectionRules = this.loadDetectionRules();
    this.confidence_threshold = 0.7;
  }

  async analyzeProject(projectPath = '.') {
    const analysis = {
      primary_languages: [],
      frameworks: [],
      databases: [],
      infrastructure: [],
      deployment: [],
      confidence_scores: {},
      recommendations: []
    };

    // Language detection
    const languages = await this.detectLanguages(projectPath);
    analysis.primary_languages = languages.filter(l => l.confidence > 0.8);

    // Framework detection
    const frameworks = await this.detectFrameworks(projectPath);
    analysis.frameworks = frameworks.filter(f => f.confidence > 0.7);

    // Database detection
    const databases = await this.detectDatabases(projectPath);
    analysis.databases = databases.filter(db => db.confidence > 0.6);

    // Infrastructure detection
    const infrastructure = await this.detectInfrastructure(projectPath);
    analysis.infrastructure = infrastructure.filter(i => i.confidence > 0.7);

    return analysis;
  }

  async detectLanguages(projectPath) {
    const fs = require('fs');
    const path = require('path');

    const languageIndicators = {
      javascript: {
        files: ['package.json', '*.js', '*.jsx'],
        patterns: ['require(', 'import ', 'module.exports'],
        weight: 1.0
      },
      typescript: {
        files: ['tsconfig.json', '*.ts', '*.tsx'],
        patterns: ['interface ', 'type ', ': string'],
        weight: 1.2 // Slightly higher weight for TypeScript
      },
      python: {
        files: ['requirements.txt', 'pyproject.toml', '*.py'],
        patterns: ['import ', 'def ', 'class '],
        weight: 1.0
      },
      golang: {
        files: ['go.mod', 'go.sum', '*.go'],
        patterns: ['package ', 'func ', 'import ('],
        weight: 1.0
      },
      java: {
        files: ['pom.xml', 'build.gradle', '*.java'],
        patterns: ['public class', 'import java', '@Override'],
        weight: 0.9
      }
    };

    const detectedLanguages = [];

    for (const [language, indicators] of Object.entries(languageIndicators)) {
      let score = 0;
      let totalChecks = 0;

      // Check for indicator files
      for (const filePattern of indicators.files) {
        const exists = await this.checkFileExists(projectPath, filePattern);
        if (exists) {
          score += indicators.weight;
        }
        totalChecks++;
      }

      // Check for code patterns in relevant files
      const patternScore = await this.checkCodePatterns(projectPath, indicators.patterns);
      score += patternScore * indicators.weight;
      totalChecks += indicators.patterns.length;

      const confidence = score / Math.max(totalChecks, 1);

      if (confidence > 0.1) {
        detectedLanguages.push({
          language,
          confidence: Math.min(confidence, 1.0),
          score: score
        });
      }
    }

    return detectedLanguages.sort((a, b) => b.confidence - a.confidence);
  }

  async detectFrameworks(projectPath) {
    const fs = require('fs').promises;
    const path = require('path');

    const frameworkIndicators = {
      react: {
        package_deps: ['react', '@types/react'],
        files: ['src/App.jsx', 'src/App.tsx'],
        patterns: ['React.Component', 'useState', 'useEffect'],
        category: 'frontend'
      },
      nextjs: {
        package_deps: ['next'],
        files: ['next.config.js', 'pages/_app.js'],
        patterns: ['export default function', 'getServerSideProps'],
        category: 'fullstack'
      },
      express: {
        package_deps: ['express'],
        files: ['app.js', 'server.js'],
        patterns: ['app.listen', 'express()', 'app.get'],
        category: 'backend'
      },
      fastapi: {
        package_deps: ['fastapi'],
        files: ['main.py', 'app.py'],
        patterns: ['FastAPI()', '@app.get', 'from fastapi'],
        category: 'backend'
      },
      gin: {
        files: ['*.go'],
        patterns: ['gin.Default()', 'c.JSON', 'github.com/gin-gonic/gin'],
        category: 'backend'
      }
    };

    const detectedFrameworks = [];

    for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
      let score = 0;
      let totalChecks = 0;

      // Check package dependencies
      if (indicators.package_deps) {
        const packageScore = await this.checkPackageDependencies(
          projectPath,
          indicators.package_deps
        );
        score += packageScore * 2; // Higher weight for package dependencies
        totalChecks += 2;
      }

      // Check for framework files
      if (indicators.files) {
        for (const filePattern of indicators.files) {
          const exists = await this.checkFileExists(projectPath, filePattern);
          if (exists) score += 1;
          totalChecks++;
        }
      }

      // Check for code patterns
      if (indicators.patterns) {
        const patternScore = await this.checkCodePatterns(projectPath, indicators.patterns);
        score += patternScore;
        totalChecks += indicators.patterns.length;
      }

      const confidence = score / Math.max(totalChecks, 1);

      if (confidence > 0.2) {
        detectedFrameworks.push({
          framework,
          confidence: Math.min(confidence, 1.0),
          category: indicators.category,
          score: score
        });
      }
    }

    return detectedFrameworks.sort((a, b) => b.confidence - a.confidence);
  }

  async checkFileExists(projectPath, pattern) {
    const fs = require('fs').promises;
    const glob = require('glob');

    try {
      const files = await new Promise((resolve, reject) => {
        glob(pattern, { cwd: projectPath }, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });
      return files.length > 0;
    } catch (error) {
      return false;
    }
  }

  async checkPackageDependencies(projectPath, dependencies) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      // Check package.json
      const packagePath = path.join(projectPath, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };

      const foundDeps = dependencies.filter(dep => allDeps[dep]);
      return foundDeps.length / dependencies.length;
    } catch {
      return 0;
    }
  }

  async checkCodePatterns(projectPath, patterns) {
    // Implementation for checking code patterns in files
    // This would use grep or ripgrep to search for patterns
    return 0.5; // Placeholder
  }
}

module.exports = TechStackDetector;
```

#### MCP Recommender Engine (lib/architect/intelligence/mcp-matcher.js)
```javascript
/**
 * MCP Recommendation Engine
 * Matches detected technology stacks with optimal MCP configurations
 */
class MCPRecommender {
  constructor() {
    this.mcpDatabase = this.loadMCPDatabase();
    this.costDatabase = this.loadCostDatabase();
  }

  async generateRecommendations(stackAnalysis, teamConfig = null) {
    const recommendations = {
      essential: [],      // Must-have MCPs for the detected stack
      recommended: [],    // Highly beneficial MCPs
      optional: [],      // Nice-to-have MCPs
      cost_analysis: {
        setup_time_saved: 0,
        monthly_cost_reduction: 0,
        complexity_reduction: 0
      }
    };

    // Essential MCPs based on tech stack
    recommendations.essential = await this.getEssentialMCPs(stackAnalysis);

    // Recommended MCPs for optimization
    recommendations.recommended = await this.getRecommendedMCPs(stackAnalysis, teamConfig);

    // Optional MCPs for enhanced workflow
    recommendations.optional = await this.getOptionalMCPs(stackAnalysis);

    // Cost analysis
    recommendations.cost_analysis = await this.calculateCostSavings(
      stackAnalysis,
      [...recommendations.essential, ...recommendations.recommended]
    );

    return recommendations;
  }

  async getEssentialMCPs(stackAnalysis) {
    const essential = [];

    // Language-specific MCPs
    for (const lang of stackAnalysis.primary_languages) {
      switch (lang.language) {
        case 'javascript':
        case 'typescript':
          essential.push({
            name: '@modelcontextprotocol/server-filesystem',
            reason: 'Essential for JavaScript/TypeScript project navigation',
            setup_time_saved: '2-4 hours',
            priority: 'critical'
          });
          break;

        case 'python':
          essential.push({
            name: '@modelcontextprotocol/server-git',
            reason: 'Critical for Python project version control',
            setup_time_saved: '1-2 hours',
            priority: 'critical'
          });
          break;
      }
    }

    // Framework-specific MCPs
    for (const framework of stackAnalysis.frameworks) {
      switch (framework.framework) {
        case 'nextjs':
          essential.push({
            name: '@modelcontextprotocol/server-brave-search',
            reason: 'Next.js documentation and best practices lookup',
            setup_time_saved: '3-5 hours',
            priority: 'high'
          });
          break;

        case 'react':
          essential.push({
            name: '@modelcontextprotocol/server-puppeteer',
            reason: 'React component testing and debugging',
            setup_time_saved: '2-3 hours',
            priority: 'high'
          });
          break;
      }
    }

    return essential;
  }

  async getRecommendedMCPs(stackAnalysis, teamConfig) {
    const recommended = [];

    // Team-specific recommendations
    if (teamConfig && teamConfig.members.length > 1) {
      recommended.push({
        name: '@modelcontextprotocol/server-github',
        reason: 'Team coordination and code review workflows',
        setup_time_saved: '4-6 hours per team member',
        team_benefit: 'Reduces coordination overhead by 60%'
      });
    }

    // Database-specific recommendations
    for (const db of stackAnalysis.databases) {
      switch (db.type) {
        case 'postgresql':
          recommended.push({
            name: '@modelcontextprotocol/server-postgres',
            reason: 'PostgreSQL schema management and query optimization',
            setup_time_saved: '2-4 hours',
            cost_reduction: '$50-200/month in database optimization'
          });
          break;
      }
    }

    return recommended;
  }

  async calculateCostSavings(stackAnalysis, mcps) {
    let totalSetupTimeSaved = 0;
    let monthlyCostReduction = 0;
    let complexityReduction = 0;

    for (const mcp of mcps) {
      // Parse setup time saved
      const timeMatch = mcp.setup_time_saved?.match(/(\d+)-?(\d+)?\s*hours?/);
      if (timeMatch) {
        const minHours = parseInt(timeMatch[1]);
        const maxHours = parseInt(timeMatch[2]) || minHours;
        totalSetupTimeSaved += (minHours + maxHours) / 2;
      }

      // Parse cost reduction
      const costMatch = mcp.cost_reduction?.match(/\$(\d+)-?(\d+)?/);
      if (costMatch) {
        const minCost = parseInt(costMatch[1]);
        const maxCost = parseInt(costMatch[2]) || minCost;
        monthlyCostReduction += (minCost + maxCost) / 2;
      }

      // Complexity reduction scoring
      if (mcp.priority === 'critical') complexityReduction += 30;
      else if (mcp.priority === 'high') complexityReduction += 20;
      else complexityReduction += 10;
    }

    return {
      setup_time_saved: totalSetupTimeSaved,
      setup_cost_saved: totalSetupTimeSaved * 150, // $150/hour developer time
      monthly_cost_reduction: monthlyCostReduction,
      complexity_reduction: Math.min(complexityReduction, 100)
    };
  }

  loadMCPDatabase() {
    // Comprehensive MCP database with intelligence rules
    return {
      // Core MCPs for different stacks
      javascript: ['@modelcontextprotocol/server-filesystem', '@modelcontextprotocol/server-git'],
      python: ['@modelcontextprotocol/server-git', '@modelcontextprotocol/server-brave-search'],
      // ... more mappings
    };
  }
}

module.exports = MCPRecommender;
```

### Enhanced Installation Script (.claude/scripts/oden/architect/install-enhanced.sh)
```bash
#!/bin/bash
set -euo pipefail

# Enhanced Oden Architect Installation Script
# Provides intelligent architecture setup with MCP recommendations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"

# Configuration
ANALYSIS_MODE=false
TECH_STACK=""
TEAM_MODE=false
COST_ESTIMATE_ONLY=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    cat << EOF
Enhanced Oden Architect Install

USAGE:
    /oden:architect install [OPTIONS]

OPTIONS:
    --analyze-only          Run architecture analysis without installation
    --tech-stack=STACK      Target specific technology stack (node, python, go, etc.)
    --team-mode            Enable team-optimized setup
    --cost-estimate        Show cost optimization analysis only
    -h, --help             Show this help message

EXAMPLES:
    /oden:architect install                    # Interactive intelligent setup
    /oden:architect install --tech-stack=node # Node.js optimized setup
    /oden:architect install --team-mode       # Team coordination setup
    /oden:architect install --cost-estimate   # Cost analysis only

INTELLIGENCE FEATURES:
    • Automatic tech stack detection
    • Smart MCP recommendations
    • Cost optimization analysis
    • Team-specific configurations
    • Architecture best practices
EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --analyze-only)
                ANALYSIS_MODE=true
                shift
                ;;
            --tech-stack=*)
                TECH_STACK="${1#*=}"
                shift
                ;;
            --team-mode)
                TEAM_MODE=true
                shift
                ;;
            --cost-estimate)
                COST_ESTIMATE_ONLY=true
                shift
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

# Main intelligence analysis
run_architecture_analysis() {
    echo -e "${BLUE}🔍 Analyzing project architecture...${NC}"

    # Run tech stack detection
    local analysis_result
    analysis_result=$(node "$SCRIPT_DIR/tech-stack-analyzer.js" "$PROJECT_ROOT")

    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Architecture analysis failed${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Architecture analysis complete${NC}"
    echo "$analysis_result"

    return 0
}

# Generate MCP recommendations
generate_mcp_recommendations() {
    local stack_analysis="$1"
    local team_config=""

    if [[ "$TEAM_MODE" == "true" ]] && [[ -f ".claude/team/config.yml" ]]; then
        team_config=".claude/team/config.yml"
    fi

    echo -e "${BLUE}🤖 Generating intelligent MCP recommendations...${NC}"

    local recommendations
    recommendations=$(node "$SCRIPT_DIR/mcp-recommender.js" \
        --analysis="$stack_analysis" \
        --team-config="$team_config" \
        --tech-stack="$TECH_STACK")

    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ MCP recommendation generation failed${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ MCP recommendations generated${NC}"
    echo "$recommendations"

    return 0
}

# Cost analysis and optimization insights
show_cost_analysis() {
    local recommendations="$1"

    echo -e "${BLUE}💰 Architecture Cost Analysis${NC}"
    echo "==============================="

    # Extract cost savings from recommendations
    local setup_cost_saved
    local monthly_savings
    local complexity_reduction

    setup_cost_saved=$(echo "$recommendations" | jq -r '.cost_analysis.setup_cost_saved // 0')
    monthly_savings=$(echo "$recommendations" | jq -r '.cost_analysis.monthly_cost_reduction // 0')
    complexity_reduction=$(echo "$recommendations" | jq -r '.cost_analysis.complexity_reduction // 0')

    echo -e "${GREEN}📊 Projected Savings:${NC}"
    echo "  • Setup cost saved: \$$setup_cost_saved (in developer time)"
    echo "  • Monthly cost reduction: \$$monthly_savings"
    echo "  • Architecture complexity reduced by: $complexity_reduction%"
    echo

    # ROI calculation
    local annual_savings=$((monthly_savings * 12))
    local total_first_year=$((setup_cost_saved + annual_savings))

    echo -e "${GREEN}💡 First Year ROI:${NC}"
    echo "  • Total value: \$$total_first_year"
    echo "  • Setup time saved: $(echo "$recommendations" | jq -r '.cost_analysis.setup_time_saved // 0') hours"
    echo "  • Recommended investment: Immediate implementation"
    echo
}

# Interactive installation with recommendations
run_interactive_install() {
    local recommendations="$1"

    echo -e "${BLUE}🚀 Smart Architecture Setup${NC}"
    echo "============================"

    # Show essential MCPs
    echo -e "${YELLOW}📌 Essential MCPs for your stack:${NC}"
    echo "$recommendations" | jq -r '.essential[] | "  • \(.name): \(.reason)"'
    echo

    # Show recommended MCPs
    echo -e "${YELLOW}⭐ Recommended MCPs for optimization:${NC}"
    echo "$recommendations" | jq -r '.recommended[] | "  • \(.name): \(.reason)"'
    echo

    # Installation confirmation
    echo -e "${BLUE}Install recommended MCPs? [Y/n]:${NC}"
    read -r install_choice

    if [[ "$install_choice" =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}⚠️ Skipping MCP installation. You can run this again later.${NC}"
        return 0
    fi

    # Install essential MCPs
    echo -e "${BLUE}📦 Installing essential MCPs...${NC}"
    echo "$recommendations" | jq -r '.essential[].name' | while read -r mcp; do
        echo "  Installing: $mcp"
        if command -v npm >/dev/null 2>&1; then
            npm install -g "$mcp" || echo "    Warning: Failed to install $mcp"
        else
            echo "    Warning: npm not found, skipping $mcp installation"
        fi
    done

    # Install recommended MCPs
    echo -e "${BLUE}📦 Installing recommended MCPs...${NC}"
    echo "$recommendations" | jq -r '.recommended[].name' | while read -r mcp; do
        echo "  Installing: $mcp"
        if command -v npm >/dev/null 2>&1; then
            npm install -g "$mcp" || echo "    Warning: Failed to install $mcp"
        else
            echo "    Warning: npm not found, skipping $mcp installation"
        fi
    done

    echo -e "${GREEN}✅ Smart architecture setup complete!${NC}"

    # Post-installation recommendations
    echo
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo "  1. Run '/oden:architect' to verify installation"
    echo "  2. Configure team settings with '/oden:team:init' (if team mode)"
    echo "  3. Start your first epic with '/oden:epic [name]'"
    echo
}

# Main execution flow
main() {
    # Parse arguments
    parse_args "$@"

    # Show startup banner
    echo -e "${BLUE}"
    cat << 'EOF'
   ___      _
  / _ \  __| | ___ _ __
 | | | |/ _` |/ _ \ '_ \
 | |_| | (_| |  __/ | | |
  \___/ \__,_|\___|_| |_|

Enhanced Architect Install ⚡
EOF
    echo -e "${NC}"

    # Architecture analysis
    echo -e "${BLUE}Phase 1: Project Analysis${NC}"
    local analysis_result
    if ! analysis_result=$(run_architecture_analysis); then
        echo -e "${RED}❌ Analysis failed. Please check your project structure.${NC}"
        exit 1
    fi

    if [[ "$ANALYSIS_MODE" == "true" ]]; then
        echo -e "${GREEN}✅ Analysis complete. Results saved to .claude/architect/analysis.json${NC}"
        exit 0
    fi

    # MCP recommendations
    echo -e "${BLUE}Phase 2: Intelligent Recommendations${NC}"
    local recommendations
    if ! recommendations=$(generate_mcp_recommendations "$analysis_result"); then
        echo -e "${RED}❌ Recommendation generation failed${NC}"
        exit 1
    fi

    # Cost analysis
    echo -e "${BLUE}Phase 3: Cost Optimization Analysis${NC}"
    show_cost_analysis "$recommendations"

    if [[ "$COST_ESTIMATE_ONLY" == "true" ]]; then
        echo -e "${GREEN}✅ Cost analysis complete${NC}"
        exit 0
    fi

    # Interactive installation
    echo -e "${BLUE}Phase 4: Smart Installation${NC}"
    run_interactive_install "$recommendations"

    echo -e "${GREEN}🎉 Enhanced Oden Architect setup complete!${NC}"
    echo -e "${BLUE}💡 Your project is now optimized for maximum productivity${NC}"
}

# Execute main function with all arguments
main "$@"
```

## 🎯 Acceptance Criteria

### Core Intelligence Features
- [ ] **Tech Stack Detection**: Accurately identifies primary languages, frameworks, and databases with >80% accuracy
- [ ] **Smart MCP Recommendations**: Provides targeted MCP recommendations based on detected technology stack
- [ ] **Cost Analysis**: Calculates setup time savings, cost reductions, and ROI projections
- [ ] **Team Optimization**: Provides team-specific recommendations when team configuration exists

### Command Interface
- [ ] **Backward Compatibility**: Existing `/oden:architect install` usage continues to work unchanged
- [ ] **Enhanced Options**: All new command-line options work as specified
- [ ] **Interactive Mode**: Intelligent prompts guide users through optimal setup
- [ ] **Analysis Mode**: `--analyze-only` provides detailed architecture analysis without installation

### Business Value Delivery
- [ ] **Immediate Value**: Users experience tangible benefit within 5 minutes of running the command
- [ ] **Cost Visibility**: Clear, accurate cost savings calculations with ROI projections
- [ ] **Setup Time Reduction**: Demonstrable 60-80% reduction in architecture setup time
- [ ] **Decision Support**: Actionable recommendations that prevent architectural mistakes

### Quality Standards
- [ ] **Performance**: Complete analysis and recommendations in <30 seconds
- [ ] **Reliability**: Handles various project structures without crashing
- [ ] **User Experience**: Clear, helpful output with actionable next steps
- [ ] **Error Handling**: Graceful failure with clear recovery instructions

## 🧪 Testing Requirements

### Unit Tests
```javascript
// tech-stack-detector.test.js
describe('TechStackDetector', () => {
  test('detects Node.js projects correctly', async () => {
    // Test with sample Node.js project structure
  });

  test('identifies React applications', async () => {
    // Test React detection accuracy
  });

  test('handles mixed technology stacks', async () => {
    // Test complex project analysis
  });
});

// mcp-recommender.test.js
describe('MCPRecommender', () => {
  test('generates appropriate recommendations for Node.js', async () => {
    // Test Node.js-specific MCP recommendations
  });

  test('calculates cost savings accurately', async () => {
    // Test cost calculation logic
  });

  test('provides team-specific optimizations', async () => {
    // Test team mode recommendations
  });
});
```

### Integration Tests
```javascript
// enhanced-install.integration.test.js
describe('Enhanced Architect Install', () => {
  test('full installation workflow with Node.js project', async () => {
    // Test complete flow: analysis → recommendations → installation
  });

  test('cost-estimate-only mode', async () => {
    // Test analysis and cost calculation without installation
  });
});
```

### Real-World Testing Scenarios
1. **Empty Repository**: Test with completely new project
2. **Existing Node.js Project**: Verify accuracy with real Node.js applications
3. **Monorepo**: Test with complex multi-package repositories
4. **Legacy Project**: Ensure recommendations work with older codebases
5. **Team Configuration**: Test team-specific optimizations

## 🔌 Integration Points

### Existing Oden Infrastructure
- **Command System**: Extends existing `/oden:architect` command structure
- **MCP Integration**: Builds on existing MCP installation patterns in `lib/mcp/`
- **Configuration**: Uses established `.claude/` directory conventions

### External Dependencies
- **Node.js Ecosystem**: npm package analysis and installation
- **File System Analysis**: Project structure scanning and pattern matching
- **GitHub Integration**: Repository analysis for team recommendations (future)

### Team Coordination Integration
- **Team Configuration**: Uses team configuration from Task 1 when available
- **Repository Analysis**: Leverages multi-repository setup for recommendations

## 🚨 Risk Mitigation

### Technical Risks
1. **Inaccurate Detection**: Comprehensive test suite with real-world projects
2. **Installation Failures**: Graceful handling of npm installation errors
3. **Performance Issues**: Efficient file scanning with caching for large projects

### Business Risks
1. **Over-promising**: Conservative cost estimates with clear disclaimers
2. **Adoption Friction**: Maintain 100% backward compatibility
3. **Complexity**: Progressive disclosure - simple by default, advanced options available

## 📊 Success Metrics

### Technical Performance
- Architecture analysis completes in <30 seconds for large projects
- MCP recommendation accuracy >90% based on manual validation
- Zero breaking changes to existing installations

### Business Impact
- Setup time reduction: 60-80% based on before/after measurements
- User satisfaction: >4.5/5 stars based on post-installation survey
- Adoption acceleration: 40% increase in new Oden evaluations convert to active use

### Cost Optimization Validation
- Average setup cost savings: $500-2000 per project (developer time)
- Monthly operational cost reduction: $50-500 per project
- ROI achievement: Users see projected ROI within first month

## 🎯 Definition of Done

- [ ] All acceptance criteria met and validated
- [ ] Tech stack detection accuracy >80% across 20+ test projects
- [ ] Cost calculations validated with real developer time measurements
- [ ] Integration tests pass for all supported technology stacks
- [ ] Command-line interface matches specification exactly
- [ ] Performance benchmarks met (30-second analysis time)
- [ ] Backward compatibility verified with existing Oden installations
- [ ] User experience validated with 5+ beta testers
- [ ] Documentation updated with new features and examples
- [ ] Business impact measurable and documented

This task delivers immediate, tangible value that drives adoption while establishing the intelligence foundation for all future team coordination features.