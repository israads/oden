/**
 * Pipeline Integration
 *
 * Integration module that connects the specialized agent pipeline
 * with the existing /oden:work orchestration system.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const AgentCoordinator = require('./agent-coordinator');
const DocumentationValidator = require('../audit/documentation-validator');
const path = require('path');

class PipelineIntegration {
    constructor(config = {}) {
        this.config = {
            projectRoot: process.cwd(),
            integrationMode: 'embedded', // 'embedded' | 'standalone'
            enableDocumentationAudit: true,
            pipelineStages: ['pre-commit', 'pre-pr', 'pre-deploy'],
            ...config
        };

        this.agentCoordinator = null;
        this.documentationValidator = null;
    }

    /**
     * Initialize the pipeline integration
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Oden Pipeline Integration...');

            // Initialize Agent Coordinator
            this.agentCoordinator = new AgentCoordinator({
                projectRoot: this.config.projectRoot,
                ...this.config
            });

            const agentInitialized = await this.agentCoordinator.initialize();
            if (!agentInitialized) {
                throw new Error('Failed to initialize Agent Coordinator');
            }

            // Initialize Documentation Validator if enabled
            if (this.config.enableDocumentationAudit) {
                this.documentationValidator = new DocumentationValidator({
                    projectRoot: this.config.projectRoot
                });
                console.log('📚 Documentation validator initialized');
            }

            console.log('✅ Pipeline integration ready');
            return true;
        } catch (error) {
            console.error('❌ Pipeline integration initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Run specialized agents analysis (for /oden:work integration)
     */
    async runSpecializedAnalysis(stage = 'pre-commit', projectInfo = null) {
        if (!this.agentCoordinator) {
            throw new Error('Pipeline not initialized. Call initialize() first.');
        }

        console.log(`🚀 Running specialized analysis for ${stage} stage...`);

        try {
            const result = await this.agentCoordinator.runStage(stage, projectInfo);

            // Enhanced reporting for /oden:work integration
            const workIntegrationReport = this.createWorkIntegrationReport(result);

            return {
                success: result.status !== 'failed',
                stage,
                result,
                workReport: workIntegrationReport,
                recommendations: result.recommendations.slice(0, 5) // Top 5 for work integration
            };
        } catch (error) {
            console.error(`❌ Specialized analysis failed:`, error.message);
            return {
                success: false,
                stage,
                error: error.message,
                recommendations: []
            };
        }
    }

    /**
     * Run complete pipeline analysis
     */
    async runCompletePipeline(projectInfo = null) {
        if (!this.agentCoordinator) {
            throw new Error('Pipeline not initialized. Call initialize() first.');
        }

        console.log('🔄 Running complete pipeline analysis...');

        try {
            const pipelineResult = await this.agentCoordinator.runAllStages(projectInfo);

            // Add documentation audit if enabled
            let documentationAudit = null;
            if (this.config.enableDocumentationAudit && this.documentationValidator) {
                console.log('\n📋 Running documentation consistency audit...');
                documentationAudit = await this.documentationValidator.validateDocumentation();
            }

            const completeReport = this.createCompleteReport(pipelineResult, documentationAudit);

            return {
                success: pipelineResult.success,
                pipelineResult,
                documentationAudit,
                completeReport,
                summary: this.createExecutiveSummary(pipelineResult, documentationAudit)
            };
        } catch (error) {
            console.error('❌ Complete pipeline analysis failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Run documentation audit only (for /oden:architect audit)
     */
    async runDocumentationAudit() {
        if (!this.config.enableDocumentationAudit || !this.documentationValidator) {
            throw new Error('Documentation audit not enabled or not initialized');
        }

        console.log('📋 Running standalone documentation audit...');

        try {
            const auditResult = await this.documentationValidator.validateDocumentation();

            const architectAuditReport = this.createArchitectAuditReport(auditResult);

            return {
                success: auditResult.success,
                auditResult,
                architectReport: architectAuditReport,
                inconsistencies: auditResult.inconsistencies || [],
                recommendations: this.generateAuditRecommendations(auditResult)
            };
        } catch (error) {
            console.error('❌ Documentation audit failed:', error.message);
            return {
                success: false,
                error: error.message,
                inconsistencies: [],
                recommendations: []
            };
        }
    }

    /**
     * Create integration report for /oden:work
     */
    createWorkIntegrationReport(stageResult) {
        const { summary, agentReports } = stageResult;

        // Prioritize findings for development workflow
        const criticalFindings = [];
        const actionableFindings = [];

        for (const [agentName, report] of Object.entries(agentReports)) {
            const findings = report.findings || [];

            for (const finding of findings) {
                if (finding.severity === 'critical' || finding.severity === 'high') {
                    criticalFindings.push({
                        agent: agentName,
                        ...finding,
                        workflowImpact: this.assessWorkflowImpact(finding)
                    });
                } else if (finding.fix_suggestion || finding.recommendation) {
                    actionableFindings.push({
                        agent: agentName,
                        ...finding,
                        quickFix: this.generateQuickFix(finding)
                    });
                }
            }
        }

        return {
            status: stageResult.status,
            score: summary.overallScore,
            duration: stageResult.duration,
            criticalIssues: summary.criticalIssues,
            totalIssues: summary.totalFindings,
            criticalFindings: criticalFindings.slice(0, 10), // Top 10 critical
            actionableFindings: actionableFindings.slice(0, 15), // Top 15 actionable
            workflowRecommendations: this.generateWorkflowRecommendations(stageResult),
            nextSteps: this.generateNextSteps(stageResult)
        };
    }

    /**
     * Create complete pipeline report
     */
    createCompleteReport(pipelineResult, documentationAudit) {
        const { results, report: finalReport } = pipelineResult;

        // Aggregate all findings across stages
        const allFindings = Object.values(results).flatMap(stageResult => {
            return Object.values(stageResult.agentReports).flatMap(agentReport =>
                (agentReport.findings || []).map(finding => ({
                    stage: stageResult.stage,
                    agent: agentReport.agent,
                    ...finding
                }))
            );
        });

        // Categorize findings by type
        const findingsByCategory = this.categorizeFindingsByType(allFindings);

        // Include documentation inconsistencies
        let documentationFindings = [];
        if (documentationAudit && documentationAudit.inconsistencies) {
            documentationFindings = documentationAudit.inconsistencies.map(inc => ({
                stage: 'documentation-audit',
                agent: 'documentation-validator',
                severity: inc.severity,
                category: inc.type,
                description: inc.description,
                recommendation: inc.recommendation,
                ...inc
            }));
        }

        return {
            timestamp: new Date().toISOString(),
            project: finalReport.project,
            stages: Object.keys(results),
            totalDuration: finalReport.duration,
            overallScore: this.calculateOverallScore(pipelineResult, documentationAudit),
            summary: {
                stages: Object.keys(results).length,
                agents: finalReport.metadata.agentsUsed.length,
                totalFindings: allFindings.length + documentationFindings.length,
                criticalFindings: [...allFindings, ...documentationFindings]
                    .filter(f => f.severity === 'critical').length,
                highFindings: [...allFindings, ...documentationFindings]
                    .filter(f => f.severity === 'high').length
            },
            findingsByCategory,
            documentationConsistency: documentationAudit ? {
                score: documentationAudit.consistencyScore,
                inconsistencies: documentationAudit.inconsistencies?.length || 0
            } : null,
            topRecommendations: this.prioritizeAllRecommendations(pipelineResult, documentationAudit),
            complianceStatus: this.generateComplianceStatus(allFindings, documentationFindings)
        };
    }

    /**
     * Create architect audit report for /oden:architect audit
     */
    createArchitectAuditReport(auditResult) {
        const { inconsistencies, consistencyScore } = auditResult;

        // Group inconsistencies by type
        const inconsistenciesByType = {};
        if (inconsistencies) {
            for (const inconsistency of inconsistencies) {
                const type = inconsistency.type;
                if (!inconsistenciesByType[type]) {
                    inconsistenciesByType[type] = [];
                }
                inconsistenciesByType[type].push(inconsistency);
            }
        }

        // Generate severity breakdown
        const severityBreakdown = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        if (inconsistencies) {
            for (const inconsistency of inconsistencies) {
                severityBreakdown[inconsistency.severity] =
                    (severityBreakdown[inconsistency.severity] || 0) + 1;
            }
        }

        return {
            auditStatus: consistencyScore >= 80 ? 'PASSED' : consistencyScore >= 60 ? 'WARNING' : 'FAILED',
            consistencyScore,
            totalInconsistencies: inconsistencies?.length || 0,
            severityBreakdown,
            inconsistenciesByType,
            criticalIssues: inconsistencies?.filter(i => i.severity === 'critical') || [],
            architecturalConcerns: this.identifyArchitecturalConcerns(inconsistencies || []),
            documentationGaps: this.identifyDocumentationGaps(inconsistencies || []),
            implementationMismatches: this.identifyImplementationMismatches(inconsistencies || [])
        };
    }

    /**
     * Generate executive summary
     */
    createExecutiveSummary(pipelineResult, documentationAudit) {
        const overallScore = this.calculateOverallScore(pipelineResult, documentationAudit);
        const status = this.determineOverallStatus(overallScore, pipelineResult, documentationAudit);

        const summary = {
            overallStatus: status,
            overallScore,
            project: pipelineResult.report.project.name,
            framework: pipelineResult.report.project.framework,
            analysisDate: new Date().toISOString(),

            keyMetrics: {
                pipelineScore: this.calculatePipelineScore(pipelineResult),
                documentationScore: documentationAudit?.consistencyScore || null,
                securityScore: this.extractAgentScore(pipelineResult, 'security'),
                performanceScore: this.extractAgentScore(pipelineResult, 'performance'),
                qualityScore: this.extractAgentScore(pipelineResult, 'quality')
            },

            criticalActions: this.identifyCriticalActions(pipelineResult, documentationAudit),
            readinessAssessment: this.assessReadiness(pipelineResult, documentationAudit),
            timeToFix: this.estimateTimeToFix(pipelineResult, documentationAudit)
        };

        return summary;
    }

    /**
     * Generate pipeline configuration
     */
    async generatePipelineConfiguration() {
        if (!this.agentCoordinator) {
            throw new Error('Pipeline not initialized');
        }

        return await this.agentCoordinator.generatePipelineConfig();
    }

    /**
     * Helper methods
     */

    assessWorkflowImpact(finding) {
        const impactMap = {
            'security': 'blocks-deployment',
            'performance': 'affects-user-experience',
            'accessibility': 'compliance-risk',
            'quality': 'maintenance-overhead'
        };

        return impactMap[finding.category] || 'review-recommended';
    }

    generateQuickFix(finding) {
        if (finding.fix_suggestion) {
            return {
                type: 'code-change',
                suggestion: finding.fix_suggestion,
                effort: finding.effort || 'low'
            };
        }

        if (finding.recommendation) {
            return {
                type: 'guidance',
                suggestion: finding.recommendation,
                effort: finding.effort || 'medium'
            };
        }

        return null;
    }

    generateWorkflowRecommendations(stageResult) {
        const recommendations = [];

        if (stageResult.summary.criticalIssues > 0) {
            recommendations.push({
                priority: 'immediate',
                action: 'Address critical security and quality issues before proceeding',
                impact: 'blocks-progress'
            });
        }

        if (stageResult.summary.overallScore < 70) {
            recommendations.push({
                priority: 'high',
                action: 'Improve code quality and best practices adherence',
                impact: 'improves-maintainability'
            });
        }

        return recommendations;
    }

    generateNextSteps(stageResult) {
        const steps = [];

        if (stageResult.status === 'failed') {
            steps.push('Fix critical issues identified by the analysis');
            steps.push('Re-run analysis to verify fixes');
        } else if (stageResult.summary.highIssues > 0) {
            steps.push('Address high-priority recommendations');
            steps.push('Consider running full pipeline analysis');
        } else {
            steps.push('Proceed with development');
            steps.push('Run pre-deploy analysis before release');
        }

        return steps;
    }

    categorizeFindingsByType(findings) {
        const categories = {};

        for (const finding of findings) {
            const category = finding.category || 'general';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(finding);
        }

        return categories;
    }

    calculateOverallScore(pipelineResult, documentationAudit) {
        let totalScore = 0;
        let scoreCount = 0;

        // Pipeline scores
        for (const stageResult of Object.values(pipelineResult.results)) {
            totalScore += stageResult.summary.overallScore;
            scoreCount++;
        }

        // Documentation score
        if (documentationAudit && typeof documentationAudit.consistencyScore === 'number') {
            totalScore += documentationAudit.consistencyScore;
            scoreCount++;
        }

        return scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    }

    determineOverallStatus(overallScore, pipelineResult, documentationAudit) {
        if (overallScore >= 85) return 'EXCELLENT';
        if (overallScore >= 70) return 'GOOD';
        if (overallScore >= 55) return 'NEEDS_IMPROVEMENT';
        return 'CRITICAL';
    }

    calculatePipelineScore(pipelineResult) {
        const scores = Object.values(pipelineResult.results).map(r => r.summary.overallScore);
        return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
    }

    extractAgentScore(pipelineResult, agentName) {
        for (const stageResult of Object.values(pipelineResult.results)) {
            if (stageResult.agentReports[agentName]) {
                return stageResult.agentReports[agentName].summary.score;
            }
        }
        return null;
    }

    prioritizeAllRecommendations(pipelineResult, documentationAudit) {
        const allRecommendations = [];

        // Pipeline recommendations
        for (const stageResult of Object.values(pipelineResult.results)) {
            allRecommendations.push(...(stageResult.recommendations || []));
        }

        // Documentation recommendations
        if (documentationAudit) {
            const docRecommendations = this.generateAuditRecommendations(documentationAudit);
            allRecommendations.push(...docRecommendations);
        }

        // Sort by priority and impact
        return allRecommendations
            .sort((a, b) => {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            })
            .slice(0, 10);
    }

    generateAuditRecommendations(auditResult) {
        const recommendations = [];

        if (auditResult.consistencyScore < 60) {
            recommendations.push({
                priority: 'high',
                category: 'documentation',
                title: 'Improve Documentation Consistency',
                description: 'Critical inconsistencies found between documentation and implementation',
                action: 'Review and align PRD, architecture, and code',
                impact: 'high'
            });
        }

        return recommendations;
    }

    identifyArchitecturalConcerns(inconsistencies) {
        return inconsistencies.filter(i =>
            i.type.includes('architectural') ||
            i.type.includes('technical-decision') ||
            i.type.includes('pattern')
        );
    }

    identifyDocumentationGaps(inconsistencies) {
        return inconsistencies.filter(i =>
            i.type.includes('missing') ||
            i.type.includes('undocumented')
        );
    }

    identifyImplementationMismatches(inconsistencies) {
        return inconsistencies.filter(i =>
            i.type.includes('mismatch') ||
            i.type.includes('inconsistency')
        );
    }

    identifyCriticalActions(pipelineResult, documentationAudit) {
        const actions = [];

        // Critical security issues
        const criticalSecurity = this.findCriticalFindings(pipelineResult, 'security');
        if (criticalSecurity.length > 0) {
            actions.push({
                priority: 'critical',
                type: 'security',
                action: `Address ${criticalSecurity.length} critical security issues`,
                blocking: true
            });
        }

        // Architecture inconsistencies
        if (documentationAudit && documentationAudit.inconsistencies) {
            const archInconsistencies = documentationAudit.inconsistencies.filter(i =>
                i.severity === 'critical' && i.type.includes('architectural')
            );
            if (archInconsistencies.length > 0) {
                actions.push({
                    priority: 'high',
                    type: 'architecture',
                    action: `Resolve ${archInconsistencies.length} architectural inconsistencies`,
                    blocking: false
                });
            }
        }

        return actions;
    }

    assessReadiness(pipelineResult, documentationAudit) {
        const overallScore = this.calculateOverallScore(pipelineResult, documentationAudit);
        const criticalIssues = this.countCriticalIssues(pipelineResult, documentationAudit);

        if (criticalIssues > 0) {
            return {
                status: 'NOT_READY',
                reason: `${criticalIssues} critical issues must be resolved`,
                confidence: 'high'
            };
        }

        if (overallScore >= 80) {
            return {
                status: 'READY',
                reason: 'All quality gates passed',
                confidence: 'high'
            };
        }

        if (overallScore >= 60) {
            return {
                status: 'READY_WITH_WARNINGS',
                reason: 'Some improvements recommended but not blocking',
                confidence: 'medium'
            };
        }

        return {
            status: 'NOT_READY',
            reason: 'Quality score below acceptable threshold',
            confidence: 'medium'
        };
    }

    estimateTimeToFix(pipelineResult, documentationAudit) {
        const effortMap = { low: 1, medium: 4, high: 8 };
        let totalEffort = 0;

        // Count efforts from pipeline
        for (const stageResult of Object.values(pipelineResult.results)) {
            for (const agentReport of Object.values(stageResult.agentReports)) {
                for (const finding of agentReport.findings || []) {
                    if (finding.severity === 'critical' || finding.severity === 'high') {
                        totalEffort += effortMap[finding.effort] || 4;
                    }
                }
            }
        }

        // Add documentation inconsistencies
        if (documentationAudit && documentationAudit.inconsistencies) {
            const criticalDocs = documentationAudit.inconsistencies.filter(i =>
                i.severity === 'critical' || i.severity === 'high'
            );
            totalEffort += criticalDocs.length * 2; // Average 2 hours per doc issue
        }

        if (totalEffort === 0) return 'No fixes needed';
        if (totalEffort <= 4) return '2-4 hours';
        if (totalEffort <= 16) return '1-2 days';
        if (totalEffort <= 40) return '1 week';
        return '2+ weeks';
    }

    findCriticalFindings(pipelineResult, agentType) {
        const findings = [];

        for (const stageResult of Object.values(pipelineResult.results)) {
            const agentReport = stageResult.agentReports[agentType];
            if (agentReport) {
                findings.push(...(agentReport.findings || []).filter(f => f.severity === 'critical'));
            }
        }

        return findings;
    }

    countCriticalIssues(pipelineResult, documentationAudit) {
        let count = 0;

        // Pipeline critical issues
        for (const stageResult of Object.values(pipelineResult.results)) {
            count += stageResult.summary.criticalIssues || 0;
        }

        // Documentation critical issues
        if (documentationAudit && documentationAudit.inconsistencies) {
            count += documentationAudit.inconsistencies.filter(i => i.severity === 'critical').length;
        }

        return count;
    }

    generateComplianceStatus(allFindings, documentationFindings) {
        const compliance = {
            security: { score: 100, violations: 0 },
            accessibility: { score: 100, violations: 0 },
            quality: { score: 100, violations: 0 },
            documentation: { score: 100, violations: 0 }
        };

        // Process pipeline findings
        for (const finding of allFindings) {
            const category = finding.agent || 'quality';
            if (compliance[category]) {
                if (finding.severity === 'critical') {
                    compliance[category].score -= 20;
                    compliance[category].violations++;
                } else if (finding.severity === 'high') {
                    compliance[category].score -= 10;
                    compliance[category].violations++;
                }
            }
        }

        // Process documentation findings
        for (const finding of documentationFindings) {
            if (finding.severity === 'critical') {
                compliance.documentation.score -= 15;
                compliance.documentation.violations++;
            } else if (finding.severity === 'high') {
                compliance.documentation.score -= 8;
                compliance.documentation.violations++;
            }
        }

        // Ensure scores don't go below 0
        for (const category of Object.keys(compliance)) {
            compliance[category].score = Math.max(0, compliance[category].score);
        }

        return compliance;
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.agentCoordinator) {
            await this.agentCoordinator.cleanup();
        }

        this.agentCoordinator = null;
        this.documentationValidator = null;
    }
}

module.exports = PipelineIntegration;