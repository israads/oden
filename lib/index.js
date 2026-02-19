/**
 * Oden Forge - Main Library Exports
 *
 * Exports all major components for the specialized agent system
 * and pipeline orchestration.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

// Specialized Agents
const BaseSpecializedAgent = require('./agents/specialized/base-agent');
const SecurityAgent = require('./agents/specialized/security-agent');
const PerformanceAgent = require('./agents/specialized/performance-agent');
const AccessibilityAgent = require('./agents/specialized/accessibility-agent');
const SEOAgent = require('./agents/specialized/seo-agent');
const QualityAgent = require('./agents/specialized/quality-agent');

// Pipeline and Orchestration
const AgentCoordinator = require('./pipeline/agent-coordinator');
const PipelineIntegration = require('./pipeline/integration');

// Documentation and Audit
const DocumentationValidator = require('./audit/documentation-validator');

// Utility Components
const PatternMatcher = require('./diagnosis/pattern-matcher');
const ProjectAnalyzer = require('./diagnosis/project-analyzer');

module.exports = {
  // Specialized Agents
  agents: {
    BaseSpecializedAgent,
    SecurityAgent,
    PerformanceAgent,
    AccessibilityAgent,
    SEOAgent,
    QualityAgent
  },

  // Pipeline Components
  pipeline: {
    AgentCoordinator,
    PipelineIntegration
  },

  // Audit Components
  audit: {
    DocumentationValidator
  },

  // Utilities
  utils: {
    PatternMatcher,
    ProjectAnalyzer
  },

  // Main entry points for different use cases
  createSecurityAgent: (config) => new SecurityAgent(config),
  createPerformanceAgent: (config) => new PerformanceAgent(config),
  createAccessibilityAgent: (config) => new AccessibilityAgent(config),
  createSEOAgent: (config) => new SEOAgent(config),
  createQualityAgent: (config) => new QualityAgent(config),

  createAgentCoordinator: (config) => new AgentCoordinator(config),
  createPipelineIntegration: (config) => new PipelineIntegration(config),
  createDocumentationValidator: (config) => new DocumentationValidator(config),

  // Version info
  version: '2.5.0',
  name: 'Oden Forge Specialized Agents'
};