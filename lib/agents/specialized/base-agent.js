/**
 * Base Specialized Agent
 *
 * Foundation class for all specialized agents in the Oden Forge system.
 * Provides standardized analysis framework, reporting format, and integration
 * with the existing /oden:work orchestration system.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

class BaseSpecializedAgent {
    constructor(config = {}) {
        this.config = {
            projectRoot: process.cwd(),
            timeout: 30000, // 30 seconds default timeout
            severity: ['critical', 'high', 'medium', 'low', 'info'],
            ...config
        };

        this.results = [];
        this.timestamp = new Date().toISOString();
        this.metadata = {
            agent_version: '2.5.0',
            analysis_start: this.timestamp,
            analysis_end: null,
            duration_ms: null,
            files_analyzed: 0,
            issues_found: 0
        };
    }

    /**
     * Main analysis entry point - to be implemented by specialized agents
     *
     * @param {Object} project - Project context and configuration
     * @returns {Promise<Object>} Analysis results
     */
    async analyze(project) {
        const startTime = Date.now();
        this.metadata.analysis_start = new Date().toISOString();

        try {
            // Base analysis framework
            const projectInfo = await this.gatherProjectInfo(project);
            const analysisResults = await this.performAnalysis(projectInfo);

            this.metadata.analysis_end = new Date().toISOString();
            this.metadata.duration_ms = Date.now() - startTime;
            this.metadata.files_analyzed = projectInfo.fileCount || 0;
            this.metadata.issues_found = this.results.length;

            return {
                success: true,
                results: analysisResults,
                metadata: this.metadata
            };
        } catch (error) {
            this.metadata.analysis_end = new Date().toISOString();
            this.metadata.duration_ms = Date.now() - startTime;
            this.metadata.error = error.message;

            return {
                success: false,
                error: error.message,
                metadata: this.metadata
            };
        }
    }

    /**
     * Gather project information and context
     *
     * @param {Object} project - Project configuration
     * @returns {Promise<Object>} Project information
     */
    async gatherProjectInfo(project) {
        const fs = require('fs').promises;
        const path = require('path');

        const projectInfo = {
            root: project.root || this.config.projectRoot,
            name: project.name || path.basename(this.config.projectRoot),
            type: project.type || 'unknown',
            framework: project.framework || 'unknown',
            files: [],
            fileCount: 0,
            dependencies: {},
            config: project
        };

        try {
            // Try to detect project type from package.json
            const packageJsonPath = path.join(projectInfo.root, 'package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                projectInfo.dependencies = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies
                };

                // Detect framework from dependencies
                if (projectInfo.dependencies.react) {
                    projectInfo.framework = 'react';
                    projectInfo.type = 'web';
                } else if (projectInfo.dependencies.next) {
                    projectInfo.framework = 'nextjs';
                    projectInfo.type = 'web';
                } else if (projectInfo.dependencies.express) {
                    projectInfo.framework = 'express';
                    projectInfo.type = 'api';
                } else if (projectInfo.dependencies.fastify) {
                    projectInfo.framework = 'fastify';
                    projectInfo.type = 'api';
                }
            } catch (error) {
                // No package.json or invalid JSON, continue with defaults
            }

            // Try to detect other project types
            const files = await fs.readdir(projectInfo.root);
            if (files.includes('go.mod')) {
                projectInfo.framework = 'go';
                projectInfo.type = 'api';
            } else if (files.includes('Cargo.toml')) {
                projectInfo.framework = 'rust';
                projectInfo.type = 'api';
            } else if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
                projectInfo.framework = 'python';
                projectInfo.type = 'api';
            }

        } catch (error) {
            // Project root doesn't exist or not accessible
            console.warn(`Warning: Could not access project root: ${error.message}`);
        }

        return projectInfo;
    }

    /**
     * Perform the actual analysis - to be implemented by specialized agents
     *
     * @param {Object} projectInfo - Gathered project information
     * @returns {Promise<Array>} Analysis findings
     */
    async performAnalysis(projectInfo) {
        throw new Error('performAnalysis must be implemented by specialized agents');
    }

    /**
     * Add a finding to the results
     *
     * @param {string} severity - Issue severity (critical, high, medium, low, info)
     * @param {string} category - Issue category
     * @param {string} description - Issue description
     * @param {Object} options - Additional options
     */
    addFinding(severity, category, description, options = {}) {
        const finding = {
            id: `${this.getAgentType()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agent: this.getAgentType(),
            severity,
            category,
            description,
            timestamp: new Date().toISOString(),
            file: options.file || null,
            line: options.line || null,
            column: options.column || null,
            code_snippet: options.codeSnippet || null,
            recommendation: options.recommendation || null,
            fix_suggestion: options.fixSuggestion || null,
            references: options.references || [],
            confidence: options.confidence || 0.8,
            impact: options.impact || 'medium',
            effort: options.effort || 'medium',
            tags: options.tags || [],
            metadata: options.metadata || {}
        };

        this.results.push(finding);
        return finding;
    }

    /**
     * Generate standardized report
     *
     * @returns {Promise<Object>} Report object
     */
    async generateReport() {
        const report = {
            agent: this.getAgentType(),
            timestamp: this.timestamp,
            summary: this.generateSummary(),
            findings: this.results,
            metadata: this.metadata,
            recommendations: await this.getSuggestions()
        };

        return report;
    }

    /**
     * Generate summary statistics
     *
     * @returns {Object} Summary object
     */
    generateSummary() {
        const severityCounts = this.results.reduce((counts, finding) => {
            counts[finding.severity] = (counts[finding.severity] || 0) + 1;
            return counts;
        }, {});

        const totalIssues = this.results.length;
        const criticalIssues = severityCounts.critical || 0;
        const highIssues = severityCounts.high || 0;

        // Calculate score (100 - penalties for issues)
        let score = 100;
        score -= criticalIssues * 20; // Critical: -20 points each
        score -= highIssues * 10;     // High: -10 points each
        score -= (severityCounts.medium || 0) * 5; // Medium: -5 points each
        score -= (severityCounts.low || 0) * 2;    // Low: -2 points each
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            issues_found: totalIssues,
            critical_issues: criticalIssues,
            high_issues: highIssues,
            medium_issues: severityCounts.medium || 0,
            low_issues: severityCounts.low || 0,
            info_items: severityCounts.info || 0,
            files_analyzed: this.metadata.files_analyzed,
            analysis_duration_ms: this.metadata.duration_ms,
            recommendations_count: 0 // Updated in getSuggestions()
        };
    }

    /**
     * Get actionable recommendations
     *
     * @returns {Promise<Array>} Array of recommendations
     */
    async getSuggestions() {
        const recommendations = [];

        // Group findings by category for better recommendations
        const categorizedFindings = this.results.reduce((categories, finding) => {
            if (!categories[finding.category]) {
                categories[finding.category] = [];
            }
            categories[finding.category].push(finding);
            return categories;
        }, {});

        // Generate category-based recommendations
        for (const [category, findings] of Object.entries(categorizedFindings)) {
            const criticalFindings = findings.filter(f => f.severity === 'critical');
            const highFindings = findings.filter(f => f.severity === 'high');

            if (criticalFindings.length > 0) {
                recommendations.push({
                    priority: 'critical',
                    category,
                    title: `Address ${criticalFindings.length} critical ${category} issue(s)`,
                    description: `These issues pose significant risks and should be resolved immediately.`,
                    action: `Review and fix: ${criticalFindings.map(f => f.file).filter(Boolean).join(', ')}`,
                    estimated_effort: this.estimateEffort(criticalFindings),
                    impact: 'high'
                });
            }

            if (highFindings.length > 0) {
                recommendations.push({
                    priority: 'high',
                    category,
                    title: `Resolve ${highFindings.length} high-priority ${category} issue(s)`,
                    description: `These issues should be addressed in the next development cycle.`,
                    action: `Review and improve: ${highFindings.map(f => f.file).filter(Boolean).join(', ')}`,
                    estimated_effort: this.estimateEffort(highFindings),
                    impact: 'medium'
                });
            }
        }

        // Add general recommendations based on agent type
        const generalRecommendations = await this.getGeneralRecommendations();
        recommendations.push(...generalRecommendations);

        return recommendations;
    }

    /**
     * Estimate effort for resolving findings
     *
     * @param {Array} findings - Array of findings
     * @returns {string} Effort estimate
     */
    estimateEffort(findings) {
        const effortMap = { low: 1, medium: 3, high: 8 };
        const totalEffort = findings.reduce((sum, finding) => {
            return sum + (effortMap[finding.effort] || 3);
        }, 0);

        if (totalEffort <= 2) return 'low';
        if (totalEffort <= 8) return 'medium';
        if (totalEffort <= 20) return 'high';
        return 'very_high';
    }

    /**
     * Get general recommendations - to be overridden by specialized agents
     *
     * @returns {Promise<Array>} Array of general recommendations
     */
    async getGeneralRecommendations() {
        return [];
    }

    /**
     * Get agent type - must be implemented by specialized agents
     *
     * @returns {string} Agent type identifier
     */
    getAgentType() {
        throw new Error('getAgentType must be implemented by specialized agents');
    }

    /**
     * Validate project structure for this agent type
     *
     * @param {Object} projectInfo - Project information
     * @returns {boolean} Whether project is suitable for this agent
     */
    validateProject(projectInfo) {
        // Base validation - can be overridden by specialized agents
        return projectInfo && projectInfo.root;
    }

    /**
     * Get required tools for this agent
     *
     * @returns {Array} Array of required tool names
     */
    getRequiredTools() {
        return []; // Base agent has no external tool dependencies
    }

    /**
     * Check if required tools are available
     *
     * @returns {Promise<Object>} Tool availability status
     */
    async checkToolAvailability() {
        const tools = this.getRequiredTools();
        const availability = {};

        for (const tool of tools) {
            try {
                const { execSync } = require('child_process');
                execSync(`which ${tool}`, { stdio: 'ignore' });
                availability[tool] = true;
            } catch (error) {
                availability[tool] = false;
            }
        }

        return {
            allAvailable: Object.values(availability).every(Boolean),
            tools: availability
        };
    }

    /**
     * Clean up resources after analysis
     */
    async cleanup() {
        // Override in specialized agents if needed
    }
}

module.exports = BaseSpecializedAgent;