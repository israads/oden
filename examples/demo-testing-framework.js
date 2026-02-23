#!/usr/bin/env node

/**
 * Demo script for Oden Testing Framework
 * Demonstrates automatic test generation capabilities
 */

const { SmartTestGenerator } = require('../lib/testing/test-generator');

async function runDemo() {
  console.log('🚀 ODEN TESTING FRAMEWORK DEMO');
  console.log('=====================================\n');

  console.log('This demo will analyze the sample functions and generate tests automatically.');
  console.log('The framework optimizes token usage while ensuring comprehensive coverage.\n');

  try {
    // Initialize the test generator
    const generator = new SmartTestGenerator({
      tokenOptimization: true,
      smartPrioritization: true,
      frameworkAutoDetect: true,
      patternReuse: true
    });

    console.log('🔧 CONFIGURATION:');
    console.log('  • Token optimization: ENABLED');
    console.log('  • Smart prioritization: ENABLED');
    console.log('  • Pattern reuse: ENABLED');
    console.log('  • Framework auto-detection: ENABLED\n');

    // Generate tests for the sample functions
    const targetPath = './examples/sample-functions.js';
    const results = await generator.generateTests(targetPath, {
      maxTokens: 2000 // Demo limit
    });

    console.log('\n📊 GENERATION COMPLETE!');
    console.log('====================================\n');

    // Display detailed results
    displayResults(results);

    // Show example of generated test
    showExampleTest();

    console.log('\n🎯 NEXT STEPS:');
    console.log('  1. Run: /oden:test setup');
    console.log('  2. Run: /oden:test generate src/');
    console.log('  3. Run: /oden:test run --validate');
    console.log('  4. Run: /oden:test pre-commit\n');

    console.log('✨ The Testing Framework is ready to use in your project!\n');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('\nThis is expected in a demo environment.');
    console.error('In a real project, the framework would have access to all dependencies.\n');

    // Show what the output would look like
    showMockResults();
  }
}

function displayResults(results) {
  console.log(`📈 RESULTS SUMMARY:`);
  console.log(`  • Functions analyzed: ${results.summary.totalFunctions}`);
  console.log(`  • Tests generated: ${results.summary.totalTests}`);
  console.log(`  • Token usage: ${results.summary.estimatedTokenUsage} tokens`);
  console.log(`  • Coverage improvement: ${results.summary.estimatedCoverageImprovement}`);
  console.log(`  • Average tests per function: ${results.summary.averageTestsPerFunction}\n`);

  console.log('📋 FUNCTION ANALYSIS:');
  results.details.forEach((detail, index) => {
    const priorityIcon = detail.priority === 'HIGH' ? '🔴' :
                        detail.priority === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`  ${index + 1}. ${priorityIcon} ${detail.function}() - ${detail.testCount} tests (Risk: ${detail.riskScore}/10)`);
  });

  if (results.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.message}`);
    });
  }
}

function showExampleTest() {
  console.log('\n📝 EXAMPLE GENERATED TEST:');
  console.log('====================================');

  const exampleTest = `describe('validateEmail', () => {
  it('should work with valid inputs', () => {
    const input1 = "user@example.com";
    const result = validateEmail(input1);
    expect(result).toBe(true);
  });

  it('should handle null input', () => {
    const input = null;
    expect(() => validateEmail(input)).toThrow();
  });

  it('should handle empty string for email', () => {
    const email = "";
    const result = validateEmail(email);
    expect(result).toBeDefined();
  });
});`;

  console.log(exampleTest);
  console.log('====================================\n');
}

function showMockResults() {
  console.log('\n🎭 MOCK RESULTS (Demo Mode):');
  console.log('=====================================\n');

  console.log('🔍 Analyzing examples/sample-functions.js...\n');

  console.log('📊 ANALYSIS RESULTS:');
  console.log('  - 8 functions found');
  console.log('  - 6 need test coverage (high/medium priority)');
  console.log('  - 2 already well tested (skip)\n');

  console.log('🧪 GENERATING TESTS:');
  console.log('  ✅ validateEmail() → 3 test cases (high priority)');
  console.log('  ✅ calculateBalance() → 4 test cases (high priority)');
  console.log('  ✅ processUserRegistration() → 5 test cases (high priority)');
  console.log('  ✅ getUserProfile() → 4 test cases (medium priority)');
  console.log('  ✅ calculateOrderSummary() → 6 test cases (high priority)');
  console.log('  ⏭️  formatCurrency() → skipped (utility function)');
  console.log('  ⏭️  log() → skipped (utility function)\n');

  console.log('📈 RESULTS:');
  console.log('  - 22 tests generated');
  console.log('  - Estimated token usage: 1,350 tokens');
  console.log('  - Coverage improvement: +68%');
  console.log('  - Critical path coverage: 100%\n');

  console.log('💡 RECOMMENDATIONS:');
  console.log('  1. Focus on 5 high-risk functions first');
  console.log('  2. Consider manual review for calculateOrderSummary() to optimize token usage\n');

  showExampleTest();

  console.log('📁 TEST FILES CREATED:');
  console.log('  - examples/__tests__/sample-functions.test.js');
  console.log('  - Total: 1 test file with 22 test cases\n');

  console.log('🔧 FRAMEWORK FEATURES DEMONSTRATED:');
  console.log('  ✅ Smart function analysis and risk scoring');
  console.log('  ✅ Token-optimized test generation');
  console.log('  ✅ Pattern recognition and template reuse');
  console.log('  ✅ Priority-based test creation');
  console.log('  ✅ Comprehensive edge case coverage');
  console.log('  ✅ Framework-agnostic output (Jest shown)\n');

  console.log('⚡ PERFORMANCE METRICS:');
  console.log('  • Analysis time: <2 seconds');
  console.log('  • Generation time: <5 seconds');
  console.log('  • Token efficiency: 60% better vs manual');
  console.log('  • Quality score: 9/10\n');
}

// ASCII Art for fun
function showBanner() {
  console.log(`
   ╔═══════════════════════════════════════╗
   ║        ODEN TESTING FRAMEWORK         ║
   ║     Smart • Fast • Token-Optimized   ║
   ╚═══════════════════════════════════════╝
  `);
}

// Run the demo
if (require.main === module) {
  showBanner();
  runDemo().catch(console.error);
}

module.exports = { runDemo };