/**
 * Code Analyzer for Smart Test Generation
 * Analyzes JavaScript/TypeScript code to understand function characteristics
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse code and extract function information
 */
async function parseCode(code, filePath) {
  const functions = [];

  // Simple regex-based parsing - in production would use AST parser like Babel
  const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\w+)|class\s+(\w+)[\s\S]*?(\w+)\s*\([^)]*\)\s*\{)/g;

  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    const [fullMatch, regularFunc, arrowFunc, className, methodName] = match;

    const functionName = regularFunc || arrowFunc || methodName;
    if (!functionName) continue;

    const functionData = {
      name: functionName,
      className: className || null,
      startPosition: match.index,
      fullMatch,
      type: detectFunctionType(fullMatch, code, match.index)
    };

    functions.push(functionData);
  }

  return functions;
}

/**
 * Analyze individual function characteristics
 */
async function analyzeFunction(func, code) {
  const functionCode = extractFunctionCode(code, func.startPosition);

  const analysis = {
    // Basic characteristics
    isAsync: /async\s+/.test(func.fullMatch),
    isClassMethod: Boolean(func.className),
    isArrowFunction: /=>/.test(func.fullMatch),
    isPublicAPI: isPublicAPI(func, code),

    // Code characteristics
    cyclomaticComplexity: calculateComplexity(functionCode),
    lineCount: functionCode.split('\n').length,
    paramCount: extractParameterCount(func.fullMatch),
    parameters: extractParameters(func.fullMatch),
    returnType: detectReturnType(functionCode),

    // Risk factors
    hasErrorHandling: hasErrorHandling(functionCode),
    hasValidation: hasValidation(functionCode),
    handlesUserInput: handlesUserInput(functionCode, func.name),
    hasSecurityImplications: hasSecurityImplications(functionCode),
    isBusinessCritical: isBusinessCritical(func.name, functionCode),

    // Integration points
    hasExternalDependencies: hasExternalDependencies(functionCode),
    hasDatabaseAccess: hasDatabaseAccess(functionCode),
    hasFileSystemAccess: hasFileSystemAccess(functionCode),
    isAPIEndpoint: isAPIEndpoint(func, code),

    // Test characteristics
    isUtilityFunction: isUtilityFunction(func.name, functionCode),
    testCoverage: await estimateCurrentCoverage(func),
    edgeCases: identifyEdgeCases(functionCode, func),

    // Function patterns
    isValidation: isValidationFunction(func.name, functionCode),
    isCRUD: isCRUDOperation(func.name),
    isPure: isPureFunction(functionCode),
    hasSideEffects: hasSideEffects(functionCode)
  };

  return analysis;
}

/**
 * Detect function type based on patterns
 */
function detectFunctionType(fullMatch, code, position) {
  if (/class\s+\w+/.test(fullMatch)) return 'class_method';
  if (/const\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(fullMatch)) return 'arrow_function';
  if (/function\s+\w+/.test(fullMatch)) return 'regular_function';
  if (/async/.test(fullMatch)) return 'async_function';

  return 'unknown';
}

/**
 * Extract function code block
 */
function extractFunctionCode(code, startPosition) {
  // Simple extraction - find function body between braces
  let braceCount = 0;
  let started = false;
  let functionCode = '';

  for (let i = startPosition; i < code.length; i++) {
    const char = code[i];

    if (char === '{') {
      braceCount++;
      started = true;
    }

    if (started) {
      functionCode += char;
    }

    if (char === '}') {
      braceCount--;
      if (braceCount === 0 && started) {
        break;
      }
    }
  }

  return functionCode;
}

/**
 * Calculate cyclomatic complexity (simplified)
 */
function calculateComplexity(code) {
  const complexityPatterns = [
    /if\s*\(/g,
    /else\s*if/g,
    /else/g,
    /for\s*\(/g,
    /while\s*\(/g,
    /do\s*\{/g,
    /case\s+/g,
    /catch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?/g // Ternary operator
  ];

  let complexity = 1; // Base complexity

  complexityPatterns.forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

/**
 * Extract parameter information
 */
function extractParameterCount(functionMatch) {
  const paramMatch = functionMatch.match(/\(([^)]*)\)/);
  if (!paramMatch || !paramMatch[1].trim()) return 0;

  const params = paramMatch[1].split(',');
  return params.filter(p => p.trim()).length;
}

/**
 * Extract detailed parameter information
 */
function extractParameters(functionMatch) {
  const paramMatch = functionMatch.match(/\(([^)]*)\)/);
  if (!paramMatch || !paramMatch[1].trim()) return [];

  const paramString = paramMatch[1];
  const params = paramString.split(',').map(p => p.trim());

  return params.map(param => {
    const isOptional = param.includes('?') || param.includes('=');
    const name = param.split(/[=:]|\/\//)[0].trim().replace('?', '');
    const type = detectParameterType(param);

    return { name, type, optional: isOptional };
  });
}

/**
 * Detect parameter type (simplified)
 */
function detectParameterType(paramString) {
  if (paramString.includes(': string') || paramString.includes('String')) return 'string';
  if (paramString.includes(': number') || paramString.includes('Number')) return 'number';
  if (paramString.includes(': boolean') || paramString.includes('Boolean')) return 'boolean';
  if (paramString.includes('[]') || paramString.includes('Array')) return 'array';
  if (paramString.includes(': object') || paramString.includes('Object')) return 'object';

  // Infer from default values
  if (/=\s*["']/.test(paramString)) return 'string';
  if (/=\s*\d+/.test(paramString)) return 'number';
  if (/=\s*(true|false)/.test(paramString)) return 'boolean';
  if (/=\s*\[/.test(paramString)) return 'array';
  if (/=\s*\{/.test(paramString)) return 'object';

  return 'unknown';
}

/**
 * Detect return type
 */
function detectReturnType(code) {
  if (/return\s+true|return\s+false|return\s+!/.test(code)) return 'boolean';
  if (/return\s+\d+/.test(code)) return 'number';
  if (/return\s+["'`]/.test(code)) return 'string';
  if (/return\s+\[/.test(code)) return 'array';
  if (/return\s+\{/.test(code)) return 'object';
  if (/return\s*;|return$|return\s+undefined/.test(code)) return 'void';
  if (/return.*Promise|return.*await/.test(code)) return 'Promise';

  return 'unknown';
}

/**
 * Check if function is public API
 */
function isPublicAPI(func, code) {
  // Check for exports or public visibility markers
  const exportRegex = new RegExp(`export.*${func.name}|module\\.exports.*${func.name}`, 'g');
  return exportRegex.test(code);
}

/**
 * Check if function has error handling
 */
function hasErrorHandling(code) {
  return /try\s*\{|catch\s*\(|throw\s+/.test(code);
}

/**
 * Check if function has validation
 */
function hasValidation(code) {
  const validationPatterns = [
    /if\s*\(\s*!.*\)/, // null checks
    /typeof\s+.*===/, // type checks
    /\.length\s*[<>=]/, // length checks
    /\.includes\s*\(/, // includes checks
    /\.test\s*\(/, // regex tests
    /instanceof/, // instanceof checks
  ];

  return validationPatterns.some(pattern => pattern.test(code));
}

/**
 * Check if function handles user input
 */
function handlesUserInput(code, functionName) {
  const inputPatterns = [
    /req\.body|req\.query|req\.params/, // Express request
    /event\.target|event\./, // DOM events
    /input|form|field/i, // Input-related naming
    /email|password|username/i // User data fields
  ];

  const namePatterns = /validate|sanitize|clean|process.*input/i;

  return inputPatterns.some(pattern => pattern.test(code)) ||
         namePatterns.test(functionName);
}

/**
 * Check if function has security implications
 */
function hasSecurityImplications(code) {
  const securityPatterns = [
    /password|auth|token|jwt|session/i,
    /crypto|hash|encrypt|decrypt/i,
    /sql|query|database/i,
    /eval\s*\(|new\s+Function/,
    /innerHTML|document\.write/,
    /exec\s*\(|spawn\s*\(/
  ];

  return securityPatterns.some(pattern => pattern.test(code));
}

/**
 * Check if function is business critical
 */
function isBusinessCritical(functionName, code) {
  const criticalPatterns = [
    /payment|billing|charge|refund/i,
    /order|purchase|checkout|cart/i,
    /user|account|profile|auth/i,
    /save|update|delete|create/i,
    /send|email|notification/i
  ];

  return criticalPatterns.some(pattern =>
    pattern.test(functionName) || pattern.test(code)
  );
}

/**
 * Check for external dependencies
 */
function hasExternalDependencies(code) {
  return /require\s*\(|import.*from|fetch\s*\(|axios|http\.get/.test(code);
}

/**
 * Check for database access
 */
function hasDatabaseAccess(code) {
  const dbPatterns = [
    /\.query\s*\(/,
    /\.exec\s*\(/,
    /\.find\s*\(/,
    /\.save\s*\(/,
    /mongoose|sequelize|prisma/i,
    /SELECT|INSERT|UPDATE|DELETE/i
  ];

  return dbPatterns.some(pattern => pattern.test(code));
}

/**
 * Check for file system access
 */
function hasFileSystemAccess(code) {
  return /fs\.|readFile|writeFile|exists|mkdir|rmdir/.test(code);
}

/**
 * Check if function is API endpoint
 */
function isAPIEndpoint(func, code) {
  const apiPatterns = [
    /router\.|app\.(get|post|put|delete|patch)/,
    /req,\s*res/,
    /request,\s*response/
  ];

  return apiPatterns.some(pattern => pattern.test(code));
}

/**
 * Check if function is utility
 */
function isUtilityFunction(functionName, code) {
  const utilityPatterns = [
    /^(log|debug|trace|warn|error)$/i,
    /^(helper|util|format|parse)$/i,
    /^(get|set)[A-Z]/,
    /^is[A-Z]/, // boolean helpers
    /^to[A-Z]/, // conversion helpers
  ];

  const isSmall = code.split('\n').length < 5;
  const isNaming = utilityPatterns.some(pattern => pattern.test(functionName));

  return isSmall || isNaming;
}

/**
 * Estimate current test coverage
 */
async function estimateCurrentCoverage(func) {
  // In production, this would integrate with coverage tools
  // For now, return random value
  return Math.floor(Math.random() * 100);
}

/**
 * Identify edge cases for function
 */
function identifyEdgeCases(code, func) {
  const edgeCases = [];

  // Null/undefined handling
  if (!/if.*null|if.*undefined/.test(code) && func.paramCount > 0) {
    edgeCases.push('null_input');
  }

  // String edge cases
  if (/string/i.test(code) && !/\.length/.test(code)) {
    edgeCases.push('empty_string');
  }

  // Number edge cases
  if (/number/i.test(code) && !/[<>=]/.test(code)) {
    edgeCases.push('zero_number', 'negative_number');
  }

  // Array edge cases
  if (/array|\[\]/i.test(code) && !/\.length/.test(code)) {
    edgeCases.push('empty_array');
  }

  return edgeCases;
}

/**
 * Check if function is validation function
 */
function isValidationFunction(functionName, code) {
  const validationNames = /validate|check|verify|confirm|ensure/i;
  const validationCode = /return\s+(true|false)|Boolean\s*\(/;

  return validationNames.test(functionName) || validationCode.test(code);
}

/**
 * Check if function is CRUD operation
 */
function isCRUDOperation(functionName) {
  const crudPatterns = /^(create|read|update|delete|get|post|put|patch|remove)([A-Z]|$)/i;
  return crudPatterns.test(functionName);
}

/**
 * Check if function is pure (no side effects)
 */
function isPureFunction(code) {
  const sideEffectPatterns = [
    /console\./,
    /document\./,
    /window\./,
    /global\./,
    /process\./,
    /fs\./,
    /require\s*\(/,
    /import.*from/,
    /this\./
  ];

  return !sideEffectPatterns.some(pattern => pattern.test(code));
}

/**
 * Check if function has side effects
 */
function hasSideEffects(code) {
  return !isPureFunction(code);
}

/**
 * Detect test framework in project
 */
async function detectFramework() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.vitest) return 'vitest';
      if (deps.jest) return 'jest';
      if (deps.mocha) return 'mocha';
      if (deps.jasmine) return 'jasmine';
    }

    // Check for config files
    const configFiles = [
      'jest.config.js',
      'jest.config.json',
      'vitest.config.js',
      'mocha.opts',
      '.mocharc.json'
    ];

    for (const config of configFiles) {
      if (fs.existsSync(path.join(process.cwd(), config))) {
        if (config.includes('jest')) return 'jest';
        if (config.includes('vitest')) return 'vitest';
        if (config.includes('mocha')) return 'mocha';
      }
    }

  } catch (error) {
    console.warn('Could not detect test framework:', error.message);
  }

  return null;
}

module.exports = {
  parseCode,
  analyzeFunction,
  detectFramework,
  calculateComplexity,
  extractParameters,
  detectReturnType
};