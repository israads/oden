const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const PatternMatcher = require('../diagnosis/pattern-matcher');
const SolutionApplier = require('../diagnosis/solution-applier');
const ProjectAnalyzer = require('../diagnosis/project-analyzer');

/**
 * /oden:bug - Contextual Bug Diagnosis System
 *
 * Main command implementation for intelligent bug diagnosis and resolution
 * with pattern matching, context analysis, and automatic solution application.
 */
class BugCommand {
    constructor() {
        this.patternMatcher = new PatternMatcher();
        this.solutionApplier = new SolutionApplier();
        this.projectAnalyzer = new ProjectAnalyzer();
    }

    /**
     * Execute the bug diagnosis command
     * @param {string} description - Problem description from user
     * @param {Object} options - Command options (auto, verbose, dry-run, rollback)
     * @returns {Promise<Object>} - Diagnosis and resolution results
     */
    async execute(description, options = {}) {
        console.log('🔍 Analyzing project and diagnosing issue...\n');

        try {
            // Handle rollback request
            if (options.rollback) {
                return await this.solutionApplier.rollback();
            }

            // Step 1: Project Context Analysis
            const context = await this.projectAnalyzer.analyze();
            if (options.verbose) {
                console.log('📊 Project Context:', context);
            }

            // Step 2: Pattern Matching
            const patterns = await this.patternMatcher.findMatches(description, context);

            if (patterns.length === 0) {
                return {
                    success: false,
                    message: `❌ No matching patterns found for: "${description}"\n\nSuggestions:\n- Try describing the exact error message\n- Include context like framework or build tool\n- Check logs for specific error details`
                };
            }

            // Step 3: Select Best Pattern
            const selectedPattern = this.selectBestPattern(patterns, context);

            console.log(`💡 Diagnosis: ${selectedPattern.description}`);
            console.log(`🎯 Confidence: ${Math.round(selectedPattern.confidence * 100)}%`);

            if (options.verbose) {
                console.log(`🔧 Solution: ${selectedPattern.solution.description}`);
            }

            // Step 4: Apply Solution (unless dry-run)
            if (options.dryRun) {
                return {
                    success: true,
                    message: '🔍 Dry run complete - no changes made',
                    pattern: selectedPattern,
                    context
                };
            }

            // Get user confirmation (unless auto mode)
            if (!options.auto) {
                const shouldApply = await this.confirmSolution(selectedPattern);
                if (!shouldApply) {
                    return {
                        success: false,
                        message: '❌ Solution cancelled by user'
                    };
                }
            }

            // Step 5: Apply Solution with Backup
            console.log('\n🛠️ Applying solution...');
            const result = await this.solutionApplier.apply(selectedPattern.solution, context);

            // Step 6: Validate Solution
            if (result.success) {
                console.log('\n🧪 Validating solution...');
                const validation = await this.validateSolution(selectedPattern, context);

                if (validation.success) {
                    // Update success statistics
                    await this.patternMatcher.updateSuccessRate(selectedPattern.id, true);

                    return {
                        success: true,
                        message: `✅ Problem resolved successfully!\n\n${validation.details}`,
                        pattern: selectedPattern,
                        applied: result.changes
                    };
                } else {
                    // Rollback failed solution
                    await this.solutionApplier.rollback();
                    await this.patternMatcher.updateSuccessRate(selectedPattern.id, false);

                    return {
                        success: false,
                        message: `❌ Solution validation failed: ${validation.error}\n\nChanges have been rolled back.`
                    };
                }
            } else {
                return {
                    success: false,
                    message: `❌ Failed to apply solution: ${result.error}`
                };
            }

        } catch (error) {
            console.error('❌ Unexpected error:', error.message);
            return {
                success: false,
                message: `❌ Diagnosis failed: ${error.message}`
            };
        }
    }

    /**
     * Select the best pattern from matches based on confidence and context
     * @param {Array} patterns - Matched patterns
     * @param {Object} context - Project context
     * @returns {Object} - Best matching pattern
     */
    selectBestPattern(patterns, context) {
        // Sort by confidence score and context relevance
        return patterns.sort((a, b) => {
            const contextBonus = (pattern) => {
                let bonus = 0;
                if (pattern.frameworks.includes(context.framework)) bonus += 0.2;
                if (pattern.nodeVersion && pattern.nodeVersion === context.nodeVersion) bonus += 0.1;
                return bonus;
            };

            const scoreA = a.confidence + contextBonus(a);
            const scoreB = b.confidence + contextBonus(b);

            return scoreB - scoreA;
        })[0];
    }

    /**
     * Confirm solution with user
     * @param {Object} pattern - Selected pattern
     * @returns {Promise<boolean>} - User confirmation
     */
    async confirmSolution(pattern) {
        console.log(`\n🛠️ Proposed Solution:`);
        console.log(`   ${pattern.solution.description}`);
        console.log(`\n📋 Changes to be made:`);

        for (const step of pattern.solution.steps) {
            console.log(`   • ${step.description}`);
        }

        return new Promise((resolve) => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('\nApply this solution? (y/n): ', (answer) => {
                readline.close();
                resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
            });
        });
    }

    /**
     * Validate that the applied solution actually works
     * @param {Object} pattern - Applied pattern
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Validation results
     */
    async validateSolution(pattern, context) {
        try {
            // Run pattern-specific validation
            if (pattern.validation) {
                const result = await this.runValidationCommand(pattern.validation, context);
                return {
                    success: result.exitCode === 0,
                    details: result.success ?
                        `✅ Validation passed: ${pattern.validation.successMessage || 'Solution verified'}` :
                        result.error,
                    error: result.error
                };
            }

            // Default validation - check if common startup commands work
            const commonCommands = [
                'npm run build',
                'npm run dev',
                'npm start'
            ].filter(cmd => context.scripts && context.scripts[cmd.split(' ')[2]]);

            if (commonCommands.length > 0) {
                const testCommand = commonCommands[0];
                console.log(`   Testing: ${testCommand}`);

                const result = await this.runValidationCommand({
                    command: testCommand,
                    timeout: 10000,
                    successPattern: 'ready|listening|compiled'
                }, context);

                return {
                    success: result.exitCode === 0 || result.output.match(/ready|listening|compiled/i),
                    details: `✅ Basic validation passed: ${testCommand} executed successfully`
                };
            }

            // No validation available - assume success
            return {
                success: true,
                details: '✅ Solution applied (validation skipped - no test commands available)'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Run a validation command with timeout
     * @param {Object} validation - Validation configuration
     * @param {Object} context - Project context
     * @returns {Promise<Object>} - Command execution results
     */
    runValidationCommand(validation, context) {
        return new Promise((resolve) => {
            const [command, ...args] = validation.command.split(' ');
            const child = spawn(command, args, {
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let error = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                error += data.toString();
            });

            // Set timeout
            const timeout = setTimeout(() => {
                child.kill();
                resolve({
                    exitCode: 1,
                    output,
                    error: 'Validation timeout',
                    success: false
                });
            }, validation.timeout || 30000);

            child.on('close', (exitCode) => {
                clearTimeout(timeout);
                resolve({
                    exitCode,
                    output,
                    error,
                    success: exitCode === 0
                });
            });
        });
    }
}

module.exports = BugCommand;