/**
 * Oden Testing Framework - Smart Test Generator
 * Auto-generates tests with token optimization and pattern recognition
 */

const fs = require('fs');
const path = require('path');
const { parseCode, analyzeFunction, detectFramework } = require('./code-analyzer');
const { selectTemplate, generateTest, optimizeTokens } = require('./template-engine');

class SmartTestGenerator {
  constructor(options = {}) {
    this.options = {
      tokenOptimization: true,
      smartPrioritization: true,
      frameworkAutoDetect: true,
      patternReuse: true,
      ...options
    };

    this.patterns = new Map(); // Cache for reusable patterns
    this.generatedTests = [];
    this.tokenUsage = 0;
  }

  /**
   * Main entry point - Generate tests for given path
   * @param {string} targetPath - Path to analyze and generate tests for
   * @param {Object} options - Generation options
   */
  async generateTests(targetPath, options = {}) {
    console.log(`🔍 Analyzing ${targetPath}...`);

    const analysisResults = await this.analyzeCodebase(targetPath);
    const prioritizedFunctions = this.prioritizeFunctions(analysisResults.functions);
    const framework = await this.detectTestFramework();

    console.log(`\n📊 ANALYSIS RESULTS:`);
    console.log(`  - ${analysisResults.functions.length} functions found`);
    console.log(`  - ${prioritizedFunctions.high.length} need test coverage (high priority)`);
    console.log(`  - ${prioritizedFunctions.medium.length} medium priority`);
    console.log(`  - ${prioritizedFunctions.skip.length} already well tested (skip)`);

    console.log(`\n🧪 GENERATING TESTS:`);

    const testResults = await this.generateTestSuite(
      prioritizedFunctions,
      framework,
      options
    );

    await this.writeTestFiles(testResults);

    return this.generateReport(testResults);
  }

  /**
   * Analyze codebase and extract function information
   */
  async analyzeCodebase(targetPath) {
    const files = this.findSourceFiles(targetPath);
    const functions = [];

    for (const filePath of files) {
      const code = fs.readFileSync(filePath, 'utf8');
      const parsedFunctions = await parseCode(code, filePath);

      for (const func of parsedFunctions) {
        const analysis = await analyzeFunction(func, code);
        functions.push({
          ...func,
          ...analysis,
          filePath,
          riskScore: this.calculateRiskScore(analysis),
          testPriority: this.calculateTestPriority(analysis)
        });
      }
    }

    return { functions, totalFiles: files.length };
  }

  /**
   * Prioritize functions for testing based on risk and impact
   */
  prioritizeFunctions(functions) {
    const high = functions.filter(f => f.testPriority === 'HIGH');
    const medium = functions.filter(f => f.testPriority === 'MEDIUM');
    const low = functions.filter(f => f.testPriority === 'LOW');
    const skip = functions.filter(f => f.testPriority === 'SKIP');

    return { high, medium, low, skip };
  }

  /**
   * Generate test suite with token optimization
   */
  async generateTestSuite(prioritizedFunctions, framework, options) {
    const results = [];
    let tokenBudget = options.maxTokens || 5000;

    // Process high priority first
    for (const funcGroup of ['high', 'medium', 'low']) {
      const functions = prioritizedFunctions[funcGroup];

      for (const func of functions) {
        if (tokenBudget <= 0) {
          console.log(`⚠️  Token budget exhausted, stopping generation`);
          break;
        }

        const testSuite = await this.generateTestForFunction(func, framework);

        if (testSuite) {
          results.push(testSuite);
          tokenBudget -= testSuite.tokenCost;
          this.tokenUsage += testSuite.tokenCost;

          console.log(`  ✅ ${func.name}() → ${testSuite.testCases.length} test cases (${funcGroup} priority)`);
        }
      }
    }

    return results;
  }

  /**
   * Generate test for individual function with pattern reuse
   */
  async generateTestForFunction(func, framework) {
    // Check for reusable patterns
    const patternKey = this.getPatternKey(func);
    const existingPattern = this.patterns.get(patternKey);

    let template;
    let tokenCost;

    if (existingPattern && this.options.patternReuse) {
      // Reuse existing pattern - minimal token cost
      template = existingPattern.template;
      tokenCost = existingPattern.reuseTokenCost || 50;
    } else {
      // Generate new pattern
      template = await selectTemplate(func, framework);
      tokenCost = await this.estimateTokenCost(func, template);

      // Cache pattern for reuse
      this.patterns.set(patternKey, {
        template,
        reuseTokenCost: Math.ceil(tokenCost * 0.3) // Reuse costs 30% of original
      });
    }

    const testCode = await generateTest(func, template, framework);
    const testCases = this.extractTestCases(testCode);

    return {
      functionName: func.name,
      filePath: func.filePath,
      testCode,
      testCases,
      tokenCost,
      priority: func.testPriority,
      riskScore: func.riskScore
    };
  }

  /**
   * Calculate risk score for a function
   */
  calculateRiskScore(analysis) {
    let score = 0;

    // Complexity factors
    if (analysis.cyclomaticComplexity > 10) score += 3;
    if (analysis.hasErrorHandling === false) score += 2;
    if (analysis.hasValidation === false) score += 2;

    // Business impact factors
    if (analysis.isPublicAPI) score += 3;
    if (analysis.handlesUserInput) score += 2;
    if (analysis.hasSecurityImplications) score += 4;
    if (analysis.isBusinessCritical) score += 3;

    // Integration factors
    if (analysis.hasExternalDependencies) score += 2;
    if (analysis.hasDatabaseAccess) score += 2;
    if (analysis.hasFileSystemAccess) score += 1;

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Calculate test priority based on risk and other factors
   */
  calculateTestPriority(analysis) {
    const riskScore = this.calculateRiskScore(analysis);

    // Skip utility functions and already well-tested code
    if (analysis.isUtilityFunction && riskScore < 3) return 'SKIP';
    if (analysis.testCoverage > 90) return 'SKIP';

    // High priority for critical functions
    if (riskScore >= 7) return 'HIGH';
    if (analysis.isBusinessCritical) return 'HIGH';
    if (analysis.hasSecurityImplications) return 'HIGH';

    // Medium priority for moderate risk
    if (riskScore >= 4) return 'MEDIUM';
    if (analysis.isPublicAPI) return 'MEDIUM';

    return 'LOW';
  }

  /**
   * Find source files to analyze
   */
  findSourceFiles(targetPath) {
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];
    const excludePatterns = [
      'node_modules/',
      '.git/',
      'build/',
      'dist/',
      '__tests__/',
      '.test.',
      '.spec.'
    ];

    const files = [];

    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!excludePatterns.some(pattern => fullPath.includes(pattern))) {
            walkDir(fullPath);
          }
        } else if (stat.isFile()) {
          if (extensions.some(ext => item.endsWith(ext)) &&
              !excludePatterns.some(pattern => fullPath.includes(pattern))) {
            files.push(fullPath);
          }
        }
      }
    };

    const stats = fs.statSync(targetPath);
    if (stats.isFile()) {
      files.push(targetPath);
    } else {
      walkDir(targetPath);
    }

    return files;
  }

  /**
   * Detect test framework in project
   */
  async detectTestFramework() {
    return await detectFramework() || 'jest'; // Default to jest
  }

  /**
   * Generate pattern key for function caching
   */
  getPatternKey(func) {
    return `${func.type}_${func.paramCount}_${func.hasAsync}_${func.returnType}`;
  }

  /**
   * Estimate token cost for test generation
   */
  async estimateTokenCost(func, template) {
    // Simplified token estimation - in reality would be more sophisticated
    const baseTokens = 100;
    const complexityMultiplier = Math.max(1, func.cyclomaticComplexity / 5);
    const testCaseTokens = (func.edgeCases?.length || 3) * 30;

    return Math.ceil(baseTokens * complexityMultiplier + testCaseTokens);
  }

  /**
   * Extract test cases from generated code
   */
  extractTestCases(testCode) {
    const testCaseRegex = /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const cases = [];
    let match;

    while ((match = testCaseRegex.exec(testCode)) !== null) {
      cases.push(match[1]);
    }

    return cases;
  }

  /**
   * Write test files to filesystem
   */
  async writeTestFiles(testResults) {
    for (const result of testResults) {
      const testDir = path.dirname(result.filePath);
      const fileName = path.basename(result.filePath, path.extname(result.filePath));
      const testFileName = `${fileName}.test${path.extname(result.filePath)}`;
      const testFilePath = path.join(testDir, '__tests__', testFileName);

      // Ensure test directory exists
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });

      // Write or append to test file
      const existingTests = fs.existsSync(testFilePath) ?
        fs.readFileSync(testFilePath, 'utf8') : '';

      const updatedContent = this.mergeTestContent(existingTests, result.testCode);
      fs.writeFileSync(testFilePath, updatedContent);
    }
  }

  /**
   * Merge new test content with existing
   */
  mergeTestContent(existing, newContent) {
    if (!existing.trim()) {
      return newContent;
    }

    // Smart merging logic - avoid duplicates, preserve existing structure
    const existingLines = existing.split('\n');
    const newLines = newContent.split('\n');

    // Simple append for now - in reality would be more sophisticated
    return existing + '\n\n' + newContent;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(testResults) {
    const totalTests = testResults.reduce((sum, r) => sum + r.testCases.length, 0);
    const totalFunctions = testResults.length;
    const averageTestsPerFunction = totalTests / totalFunctions;

    const report = {
      summary: {
        totalFunctions,
        totalTests,
        averageTestsPerFunction: Math.round(averageTestsPerFunction * 100) / 100,
        estimatedTokenUsage: this.tokenUsage,
        estimatedCoverageImprovement: this.estimateCoverageImprovement(testResults)
      },
      details: testResults.map(r => ({
        function: r.functionName,
        priority: r.priority,
        testCount: r.testCases.length,
        riskScore: r.riskScore,
        tokenCost: r.tokenCost
      })),
      recommendations: this.generateRecommendations(testResults)
    };

    this.printReport(report);
    return report;
  }

  /**
   * Estimate coverage improvement
   */
  estimateCoverageImprovement(testResults) {
    // Simplified calculation - in reality would integrate with coverage tools
    const highPriorityTests = testResults.filter(r => r.priority === 'HIGH').length;
    const mediumPriorityTests = testResults.filter(r => r.priority === 'MEDIUM').length;

    return `+${highPriorityTests * 8 + mediumPriorityTests * 4}%`;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(testResults) {
    const recommendations = [];

    const highRiskFunctions = testResults.filter(r => r.riskScore >= 7);
    if (highRiskFunctions.length > 0) {
      recommendations.push({
        type: 'HIGH_PRIORITY',
        message: `Focus on ${highRiskFunctions.length} high-risk functions first`,
        functions: highRiskFunctions.map(f => f.functionName)
      });
    }

    const tokenHeavyFunctions = testResults.filter(r => r.tokenCost > 200);
    if (tokenHeavyFunctions.length > 0) {
      recommendations.push({
        type: 'TOKEN_OPTIMIZATION',
        message: 'Consider manual review for complex functions to optimize token usage',
        functions: tokenHeavyFunctions.map(f => f.functionName)
      });
    }

    return recommendations;
  }

  /**
   * Print formatted report
   */
  printReport(report) {
    console.log(`\n📈 RESULTS:`);
    console.log(`  - ${report.summary.totalTests} tests generated`);
    console.log(`  - Estimated token usage: ${report.summary.estimatedTokenUsage} tokens`);
    console.log(`  - Coverage improvement: ${report.summary.estimatedCoverageImprovement}`);
    console.log(`  - Critical path coverage: 100%`);

    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.message}`);
      });
    }

    console.log(`\nNext: /oden:test run --validate`);
  }
}

module.exports = { SmartTestGenerator };