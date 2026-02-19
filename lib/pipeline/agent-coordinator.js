/**
 * Agent Coordinator
 *
 * Orchestrates specialized agents (security, performance, accessibility, SEO, quality)
 * with configurable pipeline stages and detailed reporting with actionable recommendations.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const SecurityAgent = require('../agents/specialized/security-agent');
const PerformanceAgent = require('../agents/specialized/performance-agent');
const AccessibilityAgent = require('../agents/specialized/accessibility-agent');
const SEOAgent = require('../agents/specialized/seo-agent');
const QualityAgent = require('../agents/specialized/quality-agent');

const fs = require('fs').promises;
const path = require('path');

class AgentCoordinator {
    constructor(config = {}) {
        this.config = {
            projectRoot: process.cwd(),
            outputDir: '.oden-analysis',
            concurrent: true,
            timeout: 300000, // 5 minutes total timeout
            stages: ['pre-commit', 'pre-pr', 'pre-deploy'],
            enabledAgents: ['security', 'performance', 'accessibility', 'seo', 'quality'],
            reportFormat: 'detailed', // 'summary' | 'detailed' | 'json'
            saveReports: true,
            failOnCritical: true,
            ...config
        };

        this.agents = new Map();
        this.results = new Map();
        this.startTime = null;
        this.endTime = null;
        this.pipelineConfig = null;
    }

    /**
     * Initialize all agents
     */
    async initialize() {
        try {
            // Load pipeline configuration
            await this.loadPipelineConfig();

            // Initialize agents based on configuration
            if (this.config.enabledAgents.includes('security')) {
                this.agents.set('security', new SecurityAgent(this.config));
            }

            if (this.config.enabledAgents.includes('performance')) {
                this.agents.set('performance', new PerformanceAgent(this.config));
            }

            if (this.config.enabledAgents.includes('accessibility')) {
                this.agents.set('accessibility', new AccessibilityAgent(this.config));
            }

            if (this.config.enabledAgents.includes('seo')) {
                this.agents.set('seo', new SEOAgent(this.config));
            }

            if (this.config.enabledAgents.includes('quality')) {
                this.agents.set('quality', new QualityAgent(this.config));
            }

            console.log(`✅ Initialized ${this.agents.size} specialized agents`);
            return true;
        } catch (error) {
            console.error('Failed to initialize agents:', error.message);
            return false;
        }
    }

    /**
     * Load pipeline configuration from .oden-pipeline.json
     */
    async loadPipelineConfig() {
        const configPath = path.join(this.config.projectRoot, '.oden-pipeline.json');

        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            this.pipelineConfig = JSON.parse(configContent);

            // Override default config with pipeline config
            if (this.pipelineConfig.stages) {
                this.config.stages = this.pipelineConfig.stages;
            }
            if (this.pipelineConfig.enabledAgents) {
                this.config.enabledAgents = this.pipelineConfig.enabledAgents;
            }
            if (this.pipelineConfig.concurrent !== undefined) {
                this.config.concurrent = this.pipelineConfig.concurrent;
            }

            console.log('📋 Loaded pipeline configuration from .oden-pipeline.json');
        } catch (error) {
            // No pipeline config file - use defaults
            this.pipelineConfig = this.generateDefaultPipelineConfig();
            console.log('📋 Using default pipeline configuration');
        }
    }

    /**
     * Generate default pipeline configuration
     */
    generateDefaultPipelineConfig() {
        return {
            version: '1.0',
            stages: {
                'pre-commit': {
                    enabled: true,
                    agents: ['security', 'quality'],
                    failOnCritical: true,
                    timeout: 60000 // 1 minute
                },
                'pre-pr': {
                    enabled: true,
                    agents: ['security', 'performance', 'accessibility', 'quality'],
                    failOnCritical: true,
                    timeout: 180000 // 3 minutes
                },
                'pre-deploy': {
                    enabled: true,
                    agents: ['security', 'performance', 'accessibility', 'seo', 'quality'],
                    failOnCritical: false, // Warning only
                    timeout: 300000 // 5 minutes
                }
            },
            thresholds: {
                security: {
                    critical: 0,
                    high: 5
                },
                performance: {
                    critical: 0,
                    high: 10
                },
                accessibility: {
                    critical: 0,
                    high: 10
                },
                seo: {
                    critical: 0,
                    high: 5
                },
                quality: {
                    critical: 0,
                    high: 15
                }
            },
            reporting: {
                format: 'detailed',
                saveReports: true,
                outputDir: '.oden-analysis',
                includeRecommendations: true,
                includeMetadata: true
            }
        };
    }

    /**
     * Run analysis for a specific stage
     */
    async runStage(stageName, projectInfo = null) {
        this.startTime = Date.now();
        console.log(`🚀 Running ${stageName} stage analysis...`);

        if (!this.pipelineConfig || !this.pipelineConfig.stages[stageName]) {
            throw new Error(`Unknown stage: ${stageName}`);
        }

        const stageConfig = this.pipelineConfig.stages[stageName];

        if (!stageConfig.enabled) {
            console.log(`⏭️  Stage ${stageName} is disabled, skipping...`);
            return this.createStageResult(stageName, 'skipped', [], 0);
        }

        // Prepare project info
        const projectContext = projectInfo || await this.gatherProjectInfo();

        // Filter agents for this stage
        const stageAgents = new Map();
        for (const agentName of stageConfig.agents) {
            if (this.agents.has(agentName)) {
                stageAgents.set(agentName, this.agents.get(agentName));
            }
        }

        console.log(`📊 Running ${stageAgents.size} agents: ${stageConfig.agents.join(', ')}`);

        // Run agents
        const agentResults = this.config.concurrent
            ? await this.runAgentsConcurrent(stageAgents, projectContext, stageConfig.timeout)
            : await this.runAgentsSequential(stageAgents, projectContext, stageConfig.timeout);

        // Process results
        const stageResult = this.processStageResults(stageName, agentResults, stageConfig);

        this.endTime = Date.now();
        this.results.set(stageName, stageResult);

        // Generate and save reports
        if (this.config.saveReports) {
            await this.saveReports(stageName, stageResult);
        }

        // Check for failures
        if (stageConfig.failOnCritical && stageResult.criticalIssues > 0) {
            throw new Error(`Stage ${stageName} failed with ${stageResult.criticalIssues} critical issues`);
        }

        console.log(`✅ Stage ${stageName} completed in ${this.endTime - this.startTime}ms`);
        return stageResult;
    }

    /**
     * Run all configured stages
     */
    async runAllStages(projectInfo = null) {
        const results = {};
        const projectContext = projectInfo || await this.gatherProjectInfo();

        for (const stageName of this.config.stages) {
            try {
                console.log(`\n${'='.repeat(50)}`);
                console.log(`🎯 STAGE: ${stageName.toUpperCase()}`);
                console.log(`${'='.repeat(50)}\n`);

                const result = await this.runStage(stageName, projectContext);
                results[stageName] = result;

                // Display stage summary
                this.displayStageSummary(stageName, result);
            } catch (error) {
                console.error(`❌ Stage ${stageName} failed:`, error.message);
                results[stageName] = this.createStageResult(stageName, 'failed', [], 0, error.message);

                // Stop on critical failures if configured
                if (this.pipelineConfig.stages[stageName]?.failOnCritical) {
                    break;
                }
            }
        }

        // Generate final report
        const finalReport = await this.generateFinalReport(results, projectContext);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📋 FINAL ANALYSIS REPORT`);
        console.log(`${'='.repeat(60)}\n`);
        this.displayFinalReport(finalReport);

        return {
            success: !Object.values(results).some(r => r.status === 'failed'),
            results,
            report: finalReport
        };
    }

    /**
     * Run agents concurrently
     */
    async runAgentsConcurrent(agents, projectInfo, timeout) {
        const agentPromises = [];

        for (const [agentName, agent] of agents) {
            const promise = this.runSingleAgent(agentName, agent, projectInfo)
                .catch(error => ({ agentName, error, success: false }));
            agentPromises.push(promise);
        }

        try {
            const results = await Promise.race([
                Promise.allSettled(agentPromises),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Analysis timeout')), timeout)
                )
            ]);

            return results.map(result => result.status === 'fulfilled' ? result.value : result.reason);
        } catch (error) {
            console.warn('Concurrent execution timeout, some agents may not have completed');
            return agentPromises.map(p => ({ error: 'timeout', success: false }));
        }
    }

    /**
     * Run agents sequentially
     */
    async runAgentsSequential(agents, projectInfo, timeout) {
        const results = [];
        const startTime = Date.now();

        for (const [agentName, agent] of agents) {
            if (Date.now() - startTime > timeout) {
                console.warn(`Sequential execution timeout reached, skipping remaining agents`);
                break;
            }

            try {
                const result = await this.runSingleAgent(agentName, agent, projectInfo);
                results.push(result);
            } catch (error) {
                results.push({ agentName, error, success: false });
                console.error(`Agent ${agentName} failed:`, error.message);
            }
        }

        return results;
    }

    /**
     * Run a single agent with error handling
     */
    async runSingleAgent(agentName, agent, projectInfo) {
        console.log(`  🔍 Running ${agentName} agent...`);
        const agentStartTime = Date.now();

        try {
            // Validate project compatibility
            if (!agent.validateProject(projectInfo)) {
                return {
                    agentName,
                    success: true,
                    skipped: true,
                    reason: 'Project type not compatible with this agent',
                    duration: Date.now() - agentStartTime
                };
            }

            // Check tool availability
            const toolCheck = await agent.checkToolAvailability();
            if (!toolCheck.allAvailable) {
                const missingTools = Object.entries(toolCheck.tools)
                    .filter(([tool, available]) => !available)
                    .map(([tool]) => tool);

                console.warn(`  ⚠️  ${agentName} missing tools: ${missingTools.join(', ')}`);
            }

            // Run analysis
            const analysisResult = await agent.analyze(projectInfo);

            if (!analysisResult.success) {
                throw new Error(analysisResult.error || 'Analysis failed');
            }

            // Generate report
            const report = await agent.generateReport();

            const duration = Date.now() - agentStartTime;
            console.log(`  ✅ ${agentName} completed in ${duration}ms (${report.findings.length} findings)`);

            return {
                agentName,
                success: true,
                report,
                duration,
                metadata: analysisResult.metadata
            };
        } catch (error) {
            const duration = Date.now() - agentStartTime;
            console.error(`  ❌ ${agentName} failed after ${duration}ms:`, error.message);

            return {
                agentName,
                success: false,
                error: error.message,
                duration
            };
        }
    }

    /**
     * Process results from all agents in a stage
     */
    processStageResults(stageName, agentResults, stageConfig) {
        const successful = agentResults.filter(r => r.success);
        const failed = agentResults.filter(r => !r.success);
        const skipped = agentResults.filter(r => r.skipped);

        let totalFindings = 0;
        let criticalIssues = 0;
        let highIssues = 0;
        let mediumIssues = 0;
        let lowIssues = 0;

        const agentReports = {};
        const allRecommendations = [];

        // Process successful agent results
        for (const result of successful) {
            if (result.skipped) continue;

            const report = result.report;
            agentReports[result.agentName] = report;

            totalFindings += report.findings.length;
            criticalIssues += report.summary.critical_issues || 0;
            highIssues += report.summary.high_issues || 0;
            mediumIssues += report.summary.medium_issues || 0;
            lowIssues += report.summary.low_issues || 0;

            // Collect recommendations
            if (report.recommendations) {
                allRecommendations.push(...report.recommendations);
            }
        }

        // Check thresholds
        const thresholds = this.pipelineConfig.thresholds || {};
        const agentThresholds = Object.fromEntries(
            successful.map(r => [r.agentName, thresholds[r.agentName] || { critical: 0, high: 10 }])
        );

        const thresholdViolations = [];
        for (const result of successful) {
            if (result.skipped) continue;

            const report = result.report;
            const threshold = agentThresholds[result.agentName];

            if (report.summary.critical_issues > threshold.critical) {
                thresholdViolations.push({
                    agent: result.agentName,
                    type: 'critical',
                    count: report.summary.critical_issues,
                    threshold: threshold.critical
                });
            }

            if (report.summary.high_issues > threshold.high) {
                thresholdViolations.push({
                    agent: result.agentName,
                    type: 'high',
                    count: report.summary.high_issues,
                    threshold: threshold.high
                });
            }
        }

        // Calculate overall score
        const maxPossibleScore = successful.length * 100;
        const actualScore = successful.reduce((sum, result) => {
            return sum + (result.report?.summary?.score || 0);
        }, 0);
        const overallScore = maxPossibleScore > 0 ? Math.round((actualScore / maxPossibleScore) * 100) : 0;

        // Determine status
        let status = 'passed';
        if (failed.length > 0) {
            status = 'failed';
        } else if (criticalIssues > 0 && stageConfig.failOnCritical) {
            status = 'failed';
        } else if (thresholdViolations.length > 0) {
            status = 'warning';
        }

        return {
            stage: stageName,
            status,
            timestamp: new Date().toISOString(),
            duration: this.endTime - this.startTime,
            summary: {
                totalFindings,
                criticalIssues,
                highIssues,
                mediumIssues,
                lowIssues,
                overallScore
            },
            agents: {
                successful: successful.length,
                failed: failed.length,
                skipped: skipped.length,
                total: agentResults.length
            },
            agentReports,
            recommendations: this.prioritizeRecommendations(allRecommendations),
            thresholdViolations,
            failures: failed.map(f => ({ agent: f.agentName, error: f.error })),
            metadata: {
                stageConfig,
                agentResults: successful.map(r => ({
                    agent: r.agentName,
                    duration: r.duration,
                    findingsCount: r.report?.findings?.length || 0
                }))
            }
        };
    }

    /**
     * Prioritize and deduplicate recommendations
     */
    prioritizeRecommendations(recommendations) {
        // Group by category and priority
        const grouped = recommendations.reduce((acc, rec) => {
            const key = `${rec.category}-${rec.title}`;
            if (!acc[key] || acc[key].priority < rec.priority) {
                acc[key] = rec;
            }
            return acc;
        }, {});

        // Sort by priority and impact
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const impactOrder = { high: 3, medium: 2, low: 1 };

        return Object.values(grouped)
            .sort((a, b) => {
                const aPriority = priorityOrder[a.priority] || 0;
                const bPriority = priorityOrder[b.priority] || 0;
                const aImpact = impactOrder[a.impact] || 0;
                const bImpact = impactOrder[b.impact] || 0;

                if (aPriority !== bPriority) return bPriority - aPriority;
                return bImpact - aImpact;
            })
            .slice(0, 10); // Top 10 recommendations
    }

    /**
     * Gather project information
     */
    async gatherProjectInfo() {
        const projectRoot = this.config.projectRoot;
        const projectName = path.basename(projectRoot);

        const projectInfo = {
            root: projectRoot,
            name: projectName,
            type: 'unknown',
            framework: 'unknown'
        };

        try {
            // Try to detect project type from package.json
            const packageJsonPath = path.join(projectRoot, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            // Detect framework from dependencies
            if (dependencies.react) {
                projectInfo.framework = 'react';
                projectInfo.type = 'web';
            } else if (dependencies.next) {
                projectInfo.framework = 'nextjs';
                projectInfo.type = 'web';
            } else if (dependencies.vue) {
                projectInfo.framework = 'vue';
                projectInfo.type = 'web';
            } else if (dependencies.express) {
                projectInfo.framework = 'express';
                projectInfo.type = 'api';
            }
        } catch (error) {
            // Try other detection methods
            const files = await fs.readdir(projectRoot);
            if (files.includes('go.mod')) {
                projectInfo.framework = 'go';
                projectInfo.type = 'api';
            } else if (files.includes('Cargo.toml')) {
                projectInfo.framework = 'rust';
                projectInfo.type = 'api';
            }
        }

        return projectInfo;
    }

    /**
     * Create a standardized stage result
     */
    createStageResult(stageName, status, findings, duration, error = null) {
        return {
            stage: stageName,
            status,
            timestamp: new Date().toISOString(),
            duration,
            summary: {
                totalFindings: findings.length,
                criticalIssues: 0,
                highIssues: 0,
                mediumIssues: 0,
                lowIssues: 0,
                overallScore: status === 'passed' ? 100 : 0
            },
            agents: { successful: 0, failed: 0, skipped: 0, total: 0 },
            agentReports: {},
            recommendations: [],
            thresholdViolations: [],
            failures: error ? [{ error }] : []
        };
    }

    /**
     * Save reports to files
     */
    async saveReports(stageName, stageResult) {
        try {
            const outputDir = path.join(this.config.projectRoot, this.config.outputDir);
            await fs.mkdir(outputDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = path.join(outputDir, `${stageName}-${timestamp}.json`);

            await fs.writeFile(reportPath, JSON.stringify(stageResult, null, 2));

            // Also save a summary report
            const summaryPath = path.join(outputDir, `${stageName}-summary.md`);
            const summaryContent = this.generateMarkdownSummary(stageResult);
            await fs.writeFile(summaryPath, summaryContent);

            console.log(`📄 Reports saved to ${this.config.outputDir}/`);
        } catch (error) {
            console.warn('Failed to save reports:', error.message);
        }
    }

    /**
     * Generate markdown summary
     */
    generateMarkdownSummary(stageResult) {
        const { stage, status, summary, recommendations } = stageResult;

        let markdown = `# ${stage.toUpperCase()} Analysis Report\n\n`;
        markdown += `**Status:** ${status.toUpperCase()}\n`;
        markdown += `**Score:** ${summary.overallScore}/100\n`;
        markdown += `**Timestamp:** ${stageResult.timestamp}\n\n`;

        // Summary
        markdown += `## Summary\n\n`;
        markdown += `- 🔴 Critical Issues: ${summary.criticalIssues}\n`;
        markdown += `- 🟡 High Issues: ${summary.highIssues}\n`;
        markdown += `- 🟠 Medium Issues: ${summary.mediumIssues}\n`;
        markdown += `- 🔵 Low Issues: ${summary.lowIssues}\n`;
        markdown += `- 📊 Total Findings: ${summary.totalFindings}\n\n`;

        // Top Recommendations
        if (recommendations.length > 0) {
            markdown += `## Top Recommendations\n\n`;
            for (const rec of recommendations.slice(0, 5)) {
                markdown += `### ${rec.title}\n`;
                markdown += `**Priority:** ${rec.priority} | **Impact:** ${rec.impact}\n\n`;
                markdown += `${rec.description}\n\n`;
                markdown += `**Action:** ${rec.action}\n\n`;
            }
        }

        // Agent Results
        markdown += `## Agent Results\n\n`;
        for (const [agentName, report] of Object.entries(stageResult.agentReports)) {
            markdown += `### ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent\n`;
            markdown += `- Score: ${report.summary.score}/100\n`;
            markdown += `- Findings: ${report.findings.length}\n`;
            markdown += `- Duration: ${report.metadata.duration_ms}ms\n\n`;
        }

        return markdown;
    }

    /**
     * Display stage summary to console
     */
    displayStageSummary(stageName, result) {
        const { status, summary, agents } = result;

        console.log(`\n📊 ${stageName.toUpperCase()} RESULTS:`);
        console.log(`   Status: ${this.getStatusIcon(status)} ${status.toUpperCase()}`);
        console.log(`   Score: ${summary.overallScore}/100`);
        console.log(`   Duration: ${result.duration}ms`);
        console.log(`   Agents: ${agents.successful}✅ ${agents.failed}❌ ${agents.skipped}⏭️`);

        if (summary.totalFindings > 0) {
            console.log(`\n   Issues Found:`);
            console.log(`   🔴 Critical: ${summary.criticalIssues}`);
            console.log(`   🟡 High: ${summary.highIssues}`);
            console.log(`   🟠 Medium: ${summary.mediumIssues}`);
            console.log(`   🔵 Low: ${summary.lowIssues}`);
        }

        if (result.recommendations.length > 0) {
            console.log(`\n   Top Recommendations:`);
            for (const rec of result.recommendations.slice(0, 3)) {
                console.log(`   • ${rec.title} (${rec.priority} priority)`);
            }
        }
    }

    /**
     * Generate and display final report
     */
    async generateFinalReport(results, projectInfo) {
        const totalDuration = Object.values(results).reduce((sum, r) => sum + (r.duration || 0), 0);
        const totalFindings = Object.values(results).reduce((sum, r) => sum + r.summary.totalFindings, 0);
        const totalCritical = Object.values(results).reduce((sum, r) => sum + r.summary.criticalIssues, 0);

        const stagesPassed = Object.values(results).filter(r => r.status === 'passed').length;
        const stagesTotal = Object.keys(results).length;

        // Collect all recommendations
        const allRecommendations = Object.values(results)
            .flatMap(r => r.recommendations)
            .filter(rec => rec);

        const topRecommendations = this.prioritizeRecommendations(allRecommendations).slice(0, 10);

        return {
            project: projectInfo,
            timestamp: new Date().toISOString(),
            duration: totalDuration,
            summary: {
                stagesPassed,
                stagesTotal,
                overallSuccess: stagesPassed === stagesTotal && totalCritical === 0,
                totalFindings,
                totalCritical
            },
            stageResults: results,
            topRecommendations,
            metadata: {
                pipelineVersion: this.pipelineConfig?.version || '1.0',
                agentsUsed: [...this.agents.keys()],
                configHash: this.generateConfigHash()
            }
        };
    }

    displayFinalReport(report) {
        const { summary, topRecommendations } = report;

        console.log(`Project: ${report.project.name} (${report.project.framework})`);
        console.log(`Duration: ${report.duration}ms`);
        console.log(`\nOverall Result: ${summary.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Stages: ${summary.stagesPassed}/${summary.stagesTotal} passed`);

        if (summary.totalFindings > 0) {
            console.log(`\n🔍 Total Issues Found: ${summary.totalFindings}`);
            if (summary.totalCritical > 0) {
                console.log(`🔴 Critical Issues: ${summary.totalCritical}`);
            }
        }

        if (topRecommendations.length > 0) {
            console.log(`\n🎯 TOP RECOMMENDATIONS:\n`);
            topRecommendations.slice(0, 5).forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.title} (${rec.priority} priority)`);
                console.log(`   ${rec.description}`);
                console.log(`   Action: ${rec.action}\n`);
            });
        }

        console.log(`📄 Detailed reports available in: ${this.config.outputDir}/`);
    }

    getStatusIcon(status) {
        switch (status) {
            case 'passed': return '✅';
            case 'warning': return '⚠️';
            case 'failed': return '❌';
            case 'skipped': return '⏭️';
            default: return '❓';
        }
    }

    generateConfigHash() {
        const configStr = JSON.stringify({
            stages: this.config.stages,
            enabledAgents: this.config.enabledAgents,
            concurrent: this.config.concurrent
        });

        let hash = 0;
        for (let i = 0; i < configStr.length; i++) {
            const char = configStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(36).substring(0, 8);
    }

    /**
     * Generate default pipeline configuration file
     */
    async generatePipelineConfig() {
        const configPath = path.join(this.config.projectRoot, '.oden-pipeline.json');
        const defaultConfig = this.generateDefaultPipelineConfig();

        try {
            await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
            console.log('✅ Generated .oden-pipeline.json configuration file');
            return true;
        } catch (error) {
            console.error('Failed to generate pipeline config:', error.message);
            return false;
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        // Cleanup all agents
        for (const [agentName, agent] of this.agents) {
            try {
                if (typeof agent.cleanup === 'function') {
                    await agent.cleanup();
                }
            } catch (error) {
                console.warn(`Failed to cleanup agent ${agentName}:`, error.message);
            }
        }

        this.agents.clear();
        this.results.clear();
    }
}

module.exports = AgentCoordinator;