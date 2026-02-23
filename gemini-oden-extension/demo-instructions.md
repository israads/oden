# 🎬 Oden Forge Gemini CLI Extension Demo

Since we don't have Gemini CLI installed in this environment, here's how to test the extension:

## 🛠️ Installation Steps (Real Environment)

### 1. Install Prerequisites
```bash
# Install Gemini CLI
npm install -g @google/generative-ai-cli
# Or follow official installation: https://geminicli.com

# Install Node.js 18+ (if not available)
# https://nodejs.org

# Install Python 3.8+ (if not available)
# https://python.org

# Install GitHub CLI (optional)
brew install gh  # macOS
# or equivalent for your OS
```

### 2. Install Extension
```bash
# Clone/download this extension
git clone <repository> oden-forge-extension

# Run installer
cd oden-forge-extension
./install.sh

# Verify installation
gemini extension list
```

## 🎯 Demo Workflow

### Step 1: Initialize Project
```bash
gemini /oden:init

# Interactive wizard will ask:
# - Project name: "task-manager-app"
# - Project type: "web"
# - Development mode: "mvp"
# - Technology stack preferences
```

**Expected Output:**
```
🏗️ Project Initialization Wizard

Project name: task-manager-app
Type: web application
Mode: MVP (6-8 weeks)

✅ Project structure created:
- docs/README.md
- docs/technical-decisions.md (template)
- GEMINI.md (project config)
- .gemini/commands/ (custom commands)

Next: Run /oden:architect to create technical decisions
```

### Step 2: Technical Architecture
```bash
gemini /oden:architect
```

**Expected Output:**
- Creates `docs/technical-decisions.md` with 2000+ lines
- Complete database schema
- Technology stack justification
- System architecture diagrams (text)
- Security and performance considerations

### Step 3: Feature Development
```bash
gemini /oden:prd user-authentication

# Creates PRD with:
# - User stories and use cases
# - Competitive analysis (3+ competitors)
# - Technical requirements
# - Success metrics
```

### Step 4: Epic Breakdown
```bash
gemini /oden:epic user-authentication

# Converts PRD to technical Epic with:
# - Work stream identification
# - Parallel development paths
# - Task estimation
# - Dependency mapping
```

### Step 5: Task Generation
```bash
gemini /oden:tasks user-authentication

# Creates individual task files:
# - user-authentication-task-001.md
# - user-authentication-task-002.md
# - Each with acceptance criteria
# - GitHub-ready format
```

### Step 6: GitHub Sync
```bash
gemini /oden:sync user-authentication

# If GitHub CLI configured:
# - Creates GitHub issues for each task
# - Creates epic tracking issue
# - Updates task files with issue numbers
# - Applies Oden methodology labels
```

### Step 7: Multi-Agent Development
```bash
gemini /oden:work user-authentication

# Orchestrates multiple specialized agents:
# - Backend Agent: API and database work
# - Frontend Agent: UI components
# - Test Agent: Unit and integration tests
# - DevOps Agent: Deployment setup
# - Automatic conflict prevention
# - Session cleanup and context management
```

### Step 8: Project Status
```bash
gemini /oden:status

# Comprehensive status report:
# - Epic progress (% complete)
# - GitHub sync status
# - Documentation quality audit
# - Workspace health check
# - Next recommended actions
```

## 🔍 Advanced Features Demo

### Debug System
```bash
gemini /oden:debug login-error

# Systematic debugging with:
# - Queue-based investigation
# - Multiple specialist agents
# - Context preservation across sessions
# - Knowledge accumulation
```

### Help System
```bash
gemini /oden:help

# Interactive help with:
# - Complete command reference
# - Methodology explanation
# - Best practices
# - Troubleshooting guide
```

## 🎛️ Configuration Options

The extension supports these settings:

```json
{
  "GITHUB_TOKEN": "ghp_...",
  "PROJECT_TYPE": "web",
  "DEVELOPMENT_MODE": "mvp"
}
```

## 📊 Expected Benefits vs Claude Code

### Performance Comparison
```
Speed: Gemini CLI generally faster for simple tasks
Cost: Much lower (often free)
Context: 1M tokens (same as Claude)
Multi-agent: Same orchestration capabilities
```

### Feature Parity
```
✅ MCP Servers (same protocol)
✅ Custom Commands (TOML vs Skills)
✅ Multi-Agent Orchestration
✅ GitHub Integration
✅ Documentation-First Methodology
✅ Session Management
```

## 🚦 Installation Verification

After successful installation, these commands should work:

```bash
# Basic functionality
gemini /oden:help
gemini /oden:status

# Extension info
gemini extension list | grep oden-forge

# MCP servers status
gemini extension info oden-forge
```

## 📋 Troubleshooting

### Common Issues
1. **Extension not found**: Run `gemini extension reload`
2. **MCP server failed**: Check Node.js/Python dependencies
3. **GitHub sync failed**: Verify `gh auth status`
4. **Commands not working**: Check extension installation path

### Debug Mode
```bash
# Enable verbose logging
export GEMINI_DEBUG=true
gemini /oden:debug
```

## 🎉 Success Indicators

The extension is working correctly when:
- ✅ All `/oden:*` commands are available
- ✅ Project structure is created properly
- ✅ MCP servers respond (file operations work)
- ✅ GitHub sync creates issues (if configured)
- ✅ Multi-agent orchestration prevents conflicts

---

**This extension brings the full power of Oden methodology to Gemini CLI!** 🔥