# Oden Forge Extension for Gemini CLI

**Documentation-First Development methodology for professional software delivery**

Transform your Gemini CLI into a powerful project management and development orchestration tool using the proven Oden methodology.

## 🚀 Quick Start

```bash
# Install the extension
gemini extension install ./oden-forge

# Initialize a new project
gemini /oden:init

# Create technical architecture
gemini /oden:architect

# Start building features
gemini /oden:prd user-authentication
gemini /oden:epic user-authentication
gemini /oden:sync user-authentication
```

## 📋 What is Oden Forge?

Oden Forge is a Documentation-First Development methodology that ensures professional software delivery through comprehensive pre-development documentation and intelligent agent orchestration.

### Core Principles

1. **Document EVERYTHING before coding** - Eliminate surprises through thorough planning
2. **Design Sprint Adapted** - Rapid design → Validation → Iteration
3. **Incremental Delivery** - Tangible value every week
4. **Multi-Agent Orchestration** - Parallel development with conflict prevention

## 🛠️ Installation

### Prerequisites

- **Gemini CLI** installed and configured
- **Node.js** 18+ for MCP servers
- **Python** 3.8+ for GitHub integration
- **GitHub CLI** (optional, for issue sync)

### Install Extension

```bash
# Clone or download this extension
git clone <repository-url> oden-forge-extension

# Install dependencies
cd oden-forge-extension/mcp
npm install
pip install -r requirements.txt

# Install extension in Gemini CLI
gemini extension install /path/to/oden-forge-extension

# Verify installation
gemini /oden:help
```

## 📖 Commands Reference

### Setup Phase
```bash
/oden:init                    # Interactive project creation wizard
/oden:architect              # Generate technical decisions (2000+ lines)
/oden:spec [module]          # Create detailed module specifications
```

### Feature Pipeline
```bash
/oden:prd [name]             # Create PRD with intelligent brainstorming
/oden:epic [name]            # Convert PRD to technical Epic
/oden:tasks [epic]           # Decompose Epic into GitHub-ready tasks
/oden:sync [epic]            # Synchronize with GitHub Issues
```

### Development Phase
```bash
/oden:work [epic]            # Multi-agent orchestration with session cleanup
/oden:debug [issue]          # Advanced debugging with queue orchestration
/oden:status                 # Comprehensive project status
/oden:daily                  # Record daily progress
/oden:review [scope]         # Code review before merge
```

## 🏗️ Project Structure

Oden maintains this standardized structure:

```
your-project/
├── docs/
│   ├── README.md                    # Project overview
│   ├── technical-decisions.md       # Architecture (2000+ lines)
│   ├── competitive-analysis.md      # Market research
│   ├── implementation-plan.md       # Development timeline
│   ├── guides/                      # User guides
│   ├── reference/
│   │   └── modules/                 # Module specifications
│   ├── development/
│   │   ├── current/                 # Active epics and tasks
│   │   └── completed/               # Finished work
│   └── temp/                        # Temporary files
├── GEMINI.md                        # Project-specific Oden config
└── .gemini/
    └── commands/                    # Custom project commands
```

## 📏 Quality Standards

Before ANY coding begins, ensure:

- [ ] `technical-decisions.md` > 2000 lines
- [ ] Complete database schema defined
- [ ] Analysis of 3+ competitors completed
- [ ] Module specifications > 800 lines each
- [ ] Week-by-week implementation plan
- [ ] MVP vs Complete mode decision documented

## 🎯 Development Workflow

### 1. Pre-Development Phase (1-2 weeks)
```bash
# Setup project foundation
gemini /oden:init
gemini /oden:architect
# Review and iterate on technical decisions
```

### 2. Feature Development (Iterative)
```bash
# For each feature
gemini /oden:prd feature-name       # Requirements gathering
gemini /oden:epic feature-name      # Technical breakdown
gemini /oden:tasks feature-name     # Task decomposition
gemini /oden:sync feature-name      # GitHub integration
```

### 3. Implementation Phase (6-16 weeks)
```bash
# Intelligent orchestration
gemini /oden:work feature-name      # Multi-agent development
gemini /oden:debug                  # When issues arise
gemini /oden:status                 # Regular check-ins
gemini /oden:daily                  # Progress logging
```

## 🔧 Configuration

### Extension Settings

During installation, you'll be prompted for:

- **GitHub Token**: For issue synchronization (optional but recommended)
- **Project Type**: web, mobile, api, fullstack, desktop
- **Development Mode**: MVP (6-8 weeks) vs Complete (12-16 weeks)

### Project Configuration

Each project gets a `GEMINI.md` file for project-specific settings:

```markdown
# Your Project - Oden Configuration

## Project Settings
- Name: your-project
- Type: web
- Mode: mvp
- Created: 2026-02-19T10:30:00Z

## Custom Guidelines
Add project-specific rules here
```

## 🤖 Multi-Agent Orchestration

The `/oden:work` command coordinates multiple AI agents:

- **Backend Specialist**: Database, API, server-side logic
- **Frontend Specialist**: UI components, user interactions
- **Test Engineer**: Unit tests, integration tests, QA
- **DevOps Engineer**: Deployment, infrastructure
- **Documentation Writer**: Technical docs, user guides
- **Code Reviewer**: Quality assurance, best practices

### Conflict Prevention

- **File-level parallelism**: Agents work on different files
- **Explicit coordination**: Sequential work for shared files
- **Human intervention**: Complex conflicts escalated
- **Session cleanup**: Automatic workspace organization

## 📊 Success Metrics

### During Development
- 100% modules defined before coding
- 0 dependency conflicts
- Documentation > 8,000 lines before first code
- Daily progress logging

### Post-Launch
- Performance: < 100ms critical latency
- Uptime: 99.9% target
- User satisfaction: NPS > 50

## 🔍 Troubleshooting

### Common Issues

**Extension not found after install**
```bash
gemini extension list
gemini extension reload
```

**MCP server connection failed**
```bash
# Check dependencies
cd oden-forge-extension/mcp
npm install
pip install -r requirements.txt
```

**GitHub sync failed**
```bash
# Authenticate GitHub CLI
gh auth login
# Check repository access
gh repo view
```

### Debug Mode

Use `/oden:debug` for systematic troubleshooting:
- Maintains context across sessions
- Queue-based problem solving
- Multiple specialist agents
- Comprehensive logging

## 📈 Advanced Usage

### Custom Commands

Add project-specific commands in `.gemini/commands/`:

```toml
# .gemini/commands/project/deploy.toml
description = "Deploy to staging environment"

prompt = """
Deploy the current project to staging following our deployment checklist:
1. Run all tests
2. Build production assets
3. Update environment variables
4. Deploy to staging server
5. Run smoke tests
"""
```

### Team Collaboration

- Commit `.gemini/commands/` to share team workflows
- Use GitHub Issues for task tracking
- Document decisions in technical-decisions.md
- Regular `/oden:status` check-ins

## 📚 Learning Resources

- [Oden Methodology Guide](./GEMINI.md)
- [Command Examples](./docs/examples/)
- [Best Practices](./docs/best-practices.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🤝 Contributing

1. Fork this repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow Oden methodology for development
4. Submit pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙋 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Built-in `/oden:help`

---

**Transform your development workflow with Documentation-First methodology** 🚀