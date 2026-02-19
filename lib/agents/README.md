# Oden Forge Specialized Agents

This directory contains the specialized agent system for comprehensive code analysis and quality assurance.

## Overview

The specialized agent system provides automated analysis across five key areas:

- **🔒 Security Agent**: OWASP Top 10 vulnerability scanning, secret detection, security best practices
- **⚡ Performance Agent**: Performance bottleneck detection, bundle analysis, optimization recommendations
- **♿ Accessibility Agent**: WCAG 2.1 compliance checking, screen reader compatibility, keyboard navigation
- **🔍 SEO Agent**: Meta tags, structured data, URL optimization, Core Web Vitals analysis
- **📊 Quality Agent**: Code complexity, maintainability metrics, test coverage, refactoring opportunities

## Architecture

```
lib/agents/
├── specialized/
│   ├── base-agent.js          # Base class for all agents
│   ├── security-agent.js      # Security vulnerability scanning
│   ├── performance-agent.js   # Performance analysis
│   ├── accessibility-agent.js # A11y compliance checking
│   ├── seo-agent.js          # SEO analysis
│   └── quality-agent.js      # Code quality metrics
└── README.md                 # This file
```

## Usage

### Individual Agent Usage

```javascript
const { SecurityAgent } = require('../../lib');

const securityAgent = new SecurityAgent({
  projectRoot: '/path/to/project',
  timeout: 30000
});

await securityAgent.initialize();
const result = await securityAgent.analyze(projectInfo);
const report = await securityAgent.generateReport();
```

### Coordinated Analysis

```javascript
const { AgentCoordinator } = require('../../lib');

const coordinator = new AgentCoordinator({
  projectRoot: '/path/to/project',
  enabledAgents: ['security', 'performance', 'quality'],
  concurrent: true
});

await coordinator.initialize();
const result = await coordinator.runStage('pre-commit');
```

### Integration with /oden:work

```javascript
const { PipelineIntegration } = require('../../lib');

const integration = new PipelineIntegration({
  integrationMode: 'embedded',
  enableDocumentationAudit: true
});

await integration.initialize();
const analysisResult = await integration.runSpecializedAnalysis('pre-pr');
```

## Configuration

Agents can be configured using `.oden-pipeline.json`:

```json
{
  "stages": {
    "pre-commit": {
      "agents": ["security", "quality"],
      "timeout": 60000,
      "failOnCritical": true
    }
  },
  "thresholds": {
    "security": { "critical": 0, "high": 5 },
    "quality": { "critical": 0, "high": 15 }
  }
}
```

## Agent Details

### Security Agent
- Scans for OWASP Top 10 vulnerabilities
- Detects hardcoded secrets and API keys
- Validates input sanitization and SQL injection prevention
- Reviews authentication and authorization
- Checks HTTPS usage and security headers

### Performance Agent
- Analyzes bundle size and identifies optimization opportunities
- Reviews database queries for N+1 problems
- Examines component rendering patterns
- Checks for memory leaks and resource management
- Reviews caching strategies and implementation

### Accessibility Agent
- Validates semantic HTML structure and ARIA labels
- Checks color contrast ratios for WCAG compliance
- Reviews keyboard navigation and focus management
- Examines screen reader compatibility
- Validates form labels and error messaging

### SEO Agent
- Analyzes meta tags and structured data
- Reviews URL structure and internal linking
- Checks heading hierarchy and content optimization
- Examines page load performance impact on SEO
- Validates sitemap and robots.txt configuration

### Quality Agent
- Measures code complexity and maintainability metrics
- Reviews code style consistency and best practices
- Analyzes test coverage and quality
- Examines dependency health and security
- Identifies refactoring opportunities

## Reports

Each agent generates detailed reports with:

- **Findings**: Categorized by severity (critical, high, medium, low)
- **Recommendations**: Actionable suggestions with code examples
- **Metadata**: Analysis duration, files examined, confidence scores
- **Fix Suggestions**: Specific code changes and improvements

## Integration Points

- **`/oden:work`**: Embedded analysis during development workflow
- **`/oden:architect audit`**: Documentation consistency validation
- **Pipeline Stages**: pre-commit, pre-pr, pre-deploy analysis
- **CI/CD**: Automated quality gates and compliance checking

## Extension

To create custom agents, extend the `BaseSpecializedAgent`:

```javascript
const BaseSpecializedAgent = require('./base-agent');

class CustomAgent extends BaseSpecializedAgent {
  getAgentType() {
    return 'custom';
  }

  async performAnalysis(projectInfo) {
    // Custom analysis logic
    return this.results;
  }
}
```

## Version

Current version: 2.5.0 - Multi-Agent Architecture with Session Cleanup