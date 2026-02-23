# ⚡ Oden Forge Quick Start Guide

**Get productive with Documentation-First Development in 5 minutes**

## 🚀 Installation (30 seconds)

```bash
# Ensure Gemini CLI is installed
npm install -g @google/generative-ai-cli

# Clone and install extension
git clone <this-repo> oden-forge
cd oden-forge
./install.sh

# Verify installation
gemini /oden:help
```

## 🎯 Your First Oden Project (3 minutes)

### Step 1: Initialize (30s)
```bash
mkdir my-awesome-app && cd my-awesome-app
gemini /oden:init

# Answer prompts:
# - Project name: my-awesome-app
# - Type: web
# - Mode: mvp
```

### Step 2: Architecture (90s)
```bash
gemini /oden:architect

# This creates comprehensive technical decisions
# Check: docs/technical-decisions.md (should be 2000+ lines)
```

### Step 3: First Feature (60s)
```bash
gemini /oden:prd user-login
# Creates: docs/development/current/user-login-prd.md

gemini /oden:epic user-login
# Creates: docs/development/current/user-login-epic.md

gemini /oden:tasks user-login
# Creates: docs/development/current/tasks/user-login-task-*.md
```

## ✅ Success Checklist

After 3 minutes, you should have:
- [ ] Project structure in `docs/`
- [ ] Technical decisions (2000+ lines)
- [ ] One complete epic with tasks
- [ ] All files have YAML frontmatter
- [ ] Ready for `/oden:sync` to GitHub

## 🎛️ Essential Commands

```bash
# Project management
gemini /oden:status          # Check project health
gemini /oden:sync user-login # Push to GitHub Issues

# Development
gemini /oden:work user-login # Multi-agent development
gemini /oden:debug          # When things break

# Help
gemini /oden:help           # Complete command reference
```

## 🔧 Configuration Tips

### GitHub Integration
```bash
# Optional but recommended
gh auth login
gemini /oden:sync user-login  # Creates GitHub issues
```

### Team Collaboration
```bash
# Commit these for team sharing
git add docs/ .gemini/ GEMINI.md
git commit -m "Add Oden project structure"
```

## 🎨 Customization

### Project-Specific Commands
Create `.gemini/commands/project/deploy.toml`:
```toml
description = "Deploy to staging"
prompt = "Deploy following our staging checklist..."
```

### Custom Guidelines
Edit `GEMINI.md` to add project rules:
```markdown
## Project Guidelines
- Always use TypeScript
- Test coverage > 80%
- API responses must be under 100ms
```

## 🚨 Troubleshooting

### Extension not working?
```bash
gemini extension list        # Should show oden-forge
gemini extension reload      # Refresh extensions
```

### Commands not found?
```bash
gemini /oden:help           # Test basic functionality
cd oden-forge && ./install.sh  # Reinstall if needed
```

### MCP servers failing?
```bash
cd oden-forge/mcp
npm install                 # Reinstall Node dependencies
pip install -r requirements.txt  # Reinstall Python deps
```

## 📚 Next Steps

1. **Complete the epic**: `gemini /oden:work user-login`
2. **Add more features**: Repeat prd → epic → tasks → sync
3. **Review methodology**: Read `/oden:help` for best practices
4. **Join community**: GitHub discussions and issues

## 💡 Pro Tips

- **Always start with `/oden:status`** to check project health
- **Use `/oden:sync early`** to get GitHub issues created
- **Trust the process** - documentation first, then code
- **Daily progress** with `/oden:daily` keeps momentum
- **Debug systematically** with `/oden:debug` when stuck

## 🏆 Success Metrics

You're doing Oden right when:
- ✅ 2000+ lines of docs before any code
- ✅ Every feature has PRD → Epic → Tasks
- ✅ GitHub issues track all work
- ✅ Multi-agent development prevents conflicts
- ✅ Daily progress is documented

---

**Welcome to Documentation-First Development!** 🔥

*Questions? Use `gemini /oden:help` or check the full README.md*