# Oden Forge Extension for Gemini CLI

You are now equipped with the Oden Forge methodology - a Documentation-First Development approach that ensures professional software delivery through comprehensive pre-development documentation.

## Core Philosophy

> "Document and design COMPLETELY before coding"

## Methodology Principles

1. **Documentation-First**: Everything is documented before coding begins
2. **Design Sprint Adapted**: Rapid design → Validation → Iteration
3. **Incremental Delivery**: Tangible value every week

## Available Commands

You now have access to these specialized Oden commands:

### Setup Phase
- `/oden:init` - Interactive project creation wizard
- `/oden:architect` - Generate technical decisions and database schema
- `/oden:spec [module]` - Create detailed module specifications

### Feature Pipeline
- `/oden:prd [name]` - Create Product Requirements Document with intelligent brainstorming
- `/oden:epic [name]` - Convert PRD to technical Epic with work streams
- `/oden:tasks [epic]` - Decompose Epic into individual GitHub issues
- `/oden:sync [epic]` - Synchronize with GitHub Issues

### Development Phase
- `/oden:work [epic]` - Intelligent orchestrator with parallel agents
- `/oden:debug` - Advanced debugging with queue orchestration
- `/oden:daily` - Record daily progress
- `/oden:review` - Code review before merge

### Project Management
- `/oden:status` - Check current project status
- `/oden:progress [epic]` - Show epic progress
- `/oden:help` - Display help and guides

## Quality Standards

Before ANY coding begins, ensure:
- [ ] technical-decisions.md > 2000 lines
- [ ] Complete database schema
- [ ] Analysis of 3+ competitors
- [ ] Module specs > 800 lines each
- [ ] Week-by-week implementation plan
- [ ] MVP vs Complete mode decision documented

## Project Structure

When using Oden commands, maintain this structure:
```
docs/
├── README.md
├── technical-decisions.md
├── competitive-analysis.md
├── implementation-plan.md
├── guides/
├── reference/
│   └── modules/
├── development/
│   ├── current/
│   └── completed/
└── temp/
```

## Success Metrics

- **Pre-Development**: 8,000+ lines of documentation
- **During Development**: Daily progress logging, 100% module definitions
- **Post-Launch**: <100ms critical latency, 99.9% uptime, NPS >50

## Behavior Guidelines

When executing Oden commands:
1. Always follow Documentation-First principles
2. Create comprehensive specs before coding
3. Maintain traceability between docs and implementation
4. Use incremental delivery approach
5. Record all decisions and rationale
6. Validate against specifications continuously

## File Management

The extension provides MCP servers for:
- **Project Manager**: Handles Oden file structure and templates
- **GitHub Sync**: Manages issue creation and synchronization

Remember: The goal is to eliminate surprises and technical debt through thorough upfront planning and documentation.