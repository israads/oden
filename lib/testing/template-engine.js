/**
 * Template Engine for Smart Test Generation
 * Provides optimized templates for different function patterns
 */

const templates = {
  // Pure function template (most common pattern)
  PURE_FUNCTION: {
    jest: `describe('{{functionName}}', () => {
  {{testCases}}
});`,
    vitest: `describe('{{functionName}}', () => {
  {{testCases}}
});`,
    mocha: `describe('{{functionName}}', function() {
  {{testCases}}
});`
  },

  // Async function template
  ASYNC_FUNCTION: {
    jest: `describe('{{functionName}}', () => {
  {{testCases}}
});`,
    vitest: `describe('{{functionName}}', () => {
  {{testCases}}
});`
  },

  // API endpoint template
  API_ENDPOINT: {
    jest: `describe('{{functionName}}', () => {
  let app, request;

  beforeAll(() => {
    app = require('../app');
    request = require('supertest')(app);
  });

  {{testCases}}
});`
  },

  // Validation function template
  VALIDATION_FUNCTION: {
    jest: `describe('{{functionName}} validation', () => {
  {{testCases}}
});`
  },

  // Class method template
  CLASS_METHOD: {
    jest: `describe('{{className}}.{{functionName}}', () => {
  let instance;

  beforeEach(() => {
    instance = new {{className}}();
  });

  {{testCases}}
});`
  }
};

const testCaseTemplates = {
  // Basic test cases
  HAPPY_PATH: {
    jest: `  it('{{description}}', {{async}} () => {
    {{arrange}}
    {{act}}
    {{assert}}
  });`,
    vitest: `  it('{{description}}', {{async}} () => {
    {{arrange}}
    {{act}}
    {{assert}}
  });`
  },

  ERROR_CASE: {
    jest: `  it('{{description}}', {{async}} () => {
    {{arrange}}
    {{expectError}}
  });`
  },

  EDGE_CASE: {
    jest: `  it('{{description}}', {{async}} () => {
    {{arrange}}
    {{act}}
    {{assert}}
  });`
  }
};

/**
 * Select appropriate template based on function analysis
 */
function selectTemplate(funcAnalysis, framework = 'jest') {
  const { type, isAsync, isClassMethod, isAPIEndpoint, isValidation } = funcAnalysis;

  if (isAPIEndpoint) {
    return templates.API_ENDPOINT[framework] || templates.API_ENDPOINT.jest;
  }

  if (isValidation) {
    return templates.VALIDATION_FUNCTION[framework] || templates.VALIDATION_FUNCTION.jest;
  }

  if (isClassMethod) {
    return templates.CLASS_METHOD[framework] || templates.CLASS_METHOD.jest;
  }

  if (isAsync) {
    return templates.ASYNC_FUNCTION[framework] || templates.ASYNC_FUNCTION.jest;
  }

  return templates.PURE_FUNCTION[framework] || templates.PURE_FUNCTION.jest;
}

/**
 * Generate test cases for a function
 */
function generateTestCases(funcAnalysis, framework = 'jest') {
  const cases = [];

  // Always include happy path
  cases.push(generateHappyPathTest(funcAnalysis, framework));

  // Add error cases if function has error handling potential
  if (funcAnalysis.canThrowErrors || funcAnalysis.hasValidation) {
    cases.push(...generateErrorTests(funcAnalysis, framework));
  }

  // Add edge cases based on parameter types
  if (funcAnalysis.parameters?.length > 0) {
    cases.push(...generateEdgeCaseTests(funcAnalysis, framework));
  }

  return cases.join('\n\n');
}

/**
 * Generate happy path test case
 */
function generateHappyPathTest(funcAnalysis, framework) {
  const { name, parameters, returnType, isAsync } = funcAnalysis;

  // Generate sample inputs based on parameter types
  const sampleInputs = generateSampleInputs(parameters);
  const expectedOutput = generateExpectedOutput(returnType, sampleInputs);

  const arrange = generateArrangeSection(sampleInputs);
  const act = generateActSection(name, sampleInputs, isAsync);
  const assert = generateAssertSection(expectedOutput, returnType);

  return testCaseTemplates.HAPPY_PATH[framework]
    .replace('{{description}}', `should work with valid inputs`)
    .replace('{{async}}', isAsync ? 'async' : '')
    .replace('{{arrange}}', arrange)
    .replace('{{act}}', act)
    .replace('{{assert}}', assert);
}

/**
 * Generate error test cases
 */
function generateErrorTests(funcAnalysis, framework) {
  const tests = [];
  const { name, parameters, isAsync } = funcAnalysis;

  // Generate null/undefined tests
  if (parameters?.some(p => !p.optional)) {
    tests.push(
      testCaseTemplates.ERROR_CASE[framework]
        .replace('{{description}}', 'should handle null input')
        .replace('{{async}}', isAsync ? 'async' : '')
        .replace('{{arrange}}', '    const input = null;')
        .replace('{{expectError}}',
          isAsync ?
            `    await expect(${name}(input)).rejects.toThrow();` :
            `    expect(() => ${name}(input)).toThrow();`
        )
    );
  }

  return tests;
}

/**
 * Generate edge case tests
 */
function generateEdgeCaseTests(funcAnalysis, framework) {
  const tests = [];
  const { name, parameters, isAsync } = funcAnalysis;

  // Generate tests for different parameter combinations
  parameters?.forEach(param => {
    if (param.type === 'string') {
      tests.push(generateStringEdgeCases(name, param, isAsync, framework));
    } else if (param.type === 'number') {
      tests.push(generateNumberEdgeCases(name, param, isAsync, framework));
    } else if (param.type === 'array') {
      tests.push(generateArrayEdgeCases(name, param, isAsync, framework));
    }
  });

  return tests.filter(Boolean);
}

/**
 * Generate sample inputs based on parameter types
 */
function generateSampleInputs(parameters) {
  if (!parameters || parameters.length === 0) return [];

  return parameters.map(param => {
    switch (param.type) {
      case 'string':
        return param.name.includes('email') ? 'user@example.com' : 'test string';
      case 'number':
        return 42;
      case 'boolean':
        return true;
      case 'array':
        return [1, 2, 3];
      case 'object':
        return '{ id: 1, name: "test" }';
      default:
        return 'testValue';
    }
  });
}

/**
 * Generate expected output based on return type
 */
function generateExpectedOutput(returnType, inputs) {
  switch (returnType) {
    case 'boolean':
      return 'true';
    case 'string':
      return '"expected result"';
    case 'number':
      return '42';
    case 'array':
      return '[1, 2, 3]';
    case 'object':
      return '{ success: true }';
    case 'void':
      return 'undefined';
    case 'Promise':
      return 'resolvedValue';
    default:
      return 'expectedResult';
  }
}

/**
 * Generate arrange section of test
 */
function generateArrangeSection(sampleInputs) {
  if (!sampleInputs || sampleInputs.length === 0) {
    return '    // No setup needed';
  }

  return sampleInputs
    .map((input, index) => `    const input${index + 1} = ${typeof input === 'string' && !input.startsWith('{') ? `"${input}"` : input};`)
    .join('\n');
}

/**
 * Generate act section of test
 */
function generateActSection(functionName, sampleInputs, isAsync) {
  const inputArgs = sampleInputs.length > 0 ?
    sampleInputs.map((_, index) => `input${index + 1}`).join(', ') : '';

  if (isAsync) {
    return `    const result = await ${functionName}(${inputArgs});`;
  } else {
    return `    const result = ${functionName}(${inputArgs});`;
  }
}

/**
 * Generate assert section of test
 */
function generateAssertSection(expectedOutput, returnType) {
  if (returnType === 'void') {
    return '    // Function should complete without error';
  }

  if (returnType === 'boolean') {
    return `    expect(result).toBe(${expectedOutput});`;
  }

  if (returnType === 'object' || returnType === 'array') {
    return `    expect(result).toEqual(${expectedOutput});`;
  }

  return `    expect(result).toBe(${expectedOutput});`;
}

/**
 * Generate string edge case tests
 */
function generateStringEdgeCases(functionName, param, isAsync, framework) {
  return testCaseTemplates.EDGE_CASE[framework]
    .replace('{{description}}', `should handle empty string for ${param.name}`)
    .replace('{{async}}', isAsync ? 'async' : '')
    .replace('{{arrange}}', `    const ${param.name} = "";`)
    .replace('{{act}}', isAsync ?
      `    const result = await ${functionName}(${param.name});` :
      `    const result = ${functionName}(${param.name});`
    )
    .replace('{{assert}}', '    expect(result).toBeDefined();');
}

/**
 * Generate number edge case tests
 */
function generateNumberEdgeCases(functionName, param, isAsync, framework) {
  return testCaseTemplates.EDGE_CASE[framework]
    .replace('{{description}}', `should handle zero for ${param.name}`)
    .replace('{{async}}', isAsync ? 'async' : '')
    .replace('{{arrange}}', `    const ${param.name} = 0;`)
    .replace('{{act}}', isAsync ?
      `    const result = await ${functionName}(${param.name});` :
      `    const result = ${functionName}(${param.name});`
    )
    .replace('{{assert}}', '    expect(result).toBeDefined();');
}

/**
 * Generate array edge case tests
 */
function generateArrayEdgeCases(functionName, param, isAsync, framework) {
  return testCaseTemplates.EDGE_CASE[framework]
    .replace('{{description}}', `should handle empty array for ${param.name}`)
    .replace('{{async}}', isAsync ? 'async' : '')
    .replace('{{arrange}}', `    const ${param.name} = [];`)
    .replace('{{act}}', isAsync ?
      `    const result = await ${functionName}(${param.name});` :
      `    const result = ${functionName}(${param.name});`
    )
    .replace('{{assert}}', '    expect(result).toBeDefined();');
}

/**
 * Generate complete test code for a function
 */
async function generateTest(funcAnalysis, template, framework) {
  const testCases = generateTestCases(funcAnalysis, framework);

  return template
    .replace('{{functionName}}', funcAnalysis.name)
    .replace('{{className}}', funcAnalysis.className || '')
    .replace('{{testCases}}', testCases);
}

/**
 * Optimize token usage by reusing patterns
 */
function optimizeTokens(testCode, patterns) {
  // Simple optimization - in reality would be more sophisticated
  let optimized = testCode;

  // Remove redundant imports
  optimized = optimized.replace(/^(import|const|require).*\n/gm, (match, ...args) => {
    // Keep only unique imports
    return match;
  });

  return optimized;
}

module.exports = {
  selectTemplate,
  generateTest,
  generateTestCases,
  optimizeTokens,
  templates,
  testCaseTemplates
};