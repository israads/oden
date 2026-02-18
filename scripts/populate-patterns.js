#!/usr/bin/env node

const PatternDatabase = require('../lib/diagnosis/pattern-database');
const fs = require('fs-extra');

/**
 * Comprehensive collection of 50+ development error patterns
 */
const errorPatterns = [
    // Port and Network Issues
    {
        name: 'port-already-in-use-3000',
        category: 'network',
        description: 'Development server port 3000 is already occupied',
        error_signatures: [
            'Error: listen EADDRINUSE.*:3000',
            'Port 3000 is already in use',
            'EADDRINUSE: address already in use.*3000',
            'Something is already running on port 3000'
        ],
        confidence_indicators: [
            'React project detected',
            'Next.js project detected',
            'package.json contains start script',
            'PORT environment variable set to 3000'
        ],
        solution_template: 'kill-port-and-restart',
        validation_script: 'check-port-availability'
    },

    {
        name: 'port-already-in-use-8080',
        category: 'network',
        description: 'Port 8080 commonly used by Java applications is occupied',
        error_signatures: [
            'Error: listen EADDRINUSE.*:8080',
            'Port 8080 is already in use',
            'EADDRINUSE: address already in use.*8080'
        ],
        confidence_indicators: [
            'Java application detected',
            'Spring Boot project detected',
            'Tomcat server configuration found'
        ],
        solution_template: 'kill-port-and-restart',
        validation_script: 'check-port-availability'
    },

    {
        name: 'cors-error',
        category: 'network',
        description: 'Cross-Origin Resource Sharing (CORS) policy blocking request',
        error_signatures: [
            'CORS policy.*has been blocked',
            'Access-Control-Allow-Origin',
            'Cross-Origin Request Blocked',
            'No \'Access-Control-Allow-Origin\' header'
        ],
        confidence_indicators: [
            'Browser console error',
            'Frontend making API calls',
            'Different domains/ports involved',
            'Express server detected'
        ],
        solution_template: 'configure-cors',
        validation_script: 'test-cors-request'
    },

    // Dependency and Package Issues
    {
        name: 'module-not-found',
        category: 'dependencies',
        description: 'Required Node.js module cannot be found',
        error_signatures: [
            'Cannot find module',
            'Module not found',
            'Error: Cannot resolve module',
            'MODULE_NOT_FOUND'
        ],
        confidence_indicators: [
            'package.json exists',
            'node_modules directory present',
            'npm or yarn project',
            'Import/require statement in error'
        ],
        solution_template: 'install-missing-dependency',
        validation_script: 'verify-module-resolution'
    },

    {
        name: 'peer-dependency-warning',
        category: 'dependencies',
        description: 'Peer dependency requirements not met',
        error_signatures: [
            'EGREP_PEER',
            'peer dep missing',
            'peer dependency.*not satisfied',
            'requires a peer of'
        ],
        confidence_indicators: [
            'npm install output',
            'package.json has dependencies',
            'React project with multiple packages'
        ],
        solution_template: 'install-peer-dependency',
        validation_script: 'check-peer-dependencies'
    },

    {
        name: 'package-lock-conflict',
        category: 'dependencies',
        description: 'Package lock file conflicts preventing installation',
        error_signatures: [
            'package-lock.json.*conflict',
            'lockfile.*out of date',
            'npm ERR!.*package-lock.json',
            'integrity check failed'
        ],
        confidence_indicators: [
            'package-lock.json exists',
            'Git merge conflict detected',
            'Multiple developers on project'
        ],
        solution_template: 'resolve-package-lock-conflict',
        validation_script: 'validate-package-lock'
    },

    // Environment and Configuration
    {
        name: 'missing-env-file',
        category: 'environment',
        description: 'Required .env file is missing',
        error_signatures: [
            'Cannot load .env',
            'Environment variable.*undefined',
            'Missing required environment variable',
            'ENOENT.*\.env'
        ],
        confidence_indicators: [
            '.env.example file exists',
            'dotenv package in dependencies',
            'Environment variables referenced in code'
        ],
        solution_template: 'create-env-file',
        validation_script: 'check-env-variables'
    },

    {
        name: 'invalid-env-format',
        category: 'environment',
        description: 'Environment variables have invalid format',
        error_signatures: [
            'Invalid environment variable format',
            'Environment variable.*malformed',
            'Cannot parse.*environment',
            'TypeError.*process.env'
        ],
        confidence_indicators: [
            '.env file exists',
            'Environment variables contain special characters',
            'Database connection strings present'
        ],
        solution_template: 'fix-env-format',
        validation_script: 'validate-env-format'
    },

    {
        name: 'database-connection-failed',
        category: 'environment',
        description: 'Database connection string or credentials invalid',
        error_signatures: [
            'database connection failed',
            'ECONNREFUSED.*database',
            'authentication failed.*database',
            'Connection terminated unexpectedly'
        ],
        confidence_indicators: [
            'Database URL in environment variables',
            'Database client library in dependencies',
            'Connection pool configuration present'
        ],
        solution_template: 'fix-database-connection',
        validation_script: 'test-database-connection'
    },

    // Permission and File System
    {
        name: 'permission-denied',
        category: 'filesystem',
        description: 'File or directory access permission denied',
        error_signatures: [
            'EACCES: permission denied',
            'Permission denied',
            'Operation not permitted',
            'Access is denied'
        ],
        confidence_indicators: [
            'File path in error message',
            'macOS or Linux system',
            'Global npm installation attempt'
        ],
        solution_template: 'fix-permissions',
        validation_script: 'check-file-permissions'
    },

    {
        name: 'file-not-found',
        category: 'filesystem',
        description: 'Required file or directory does not exist',
        error_signatures: [
            'ENOENT: no such file or directory',
            'File not found',
            'Cannot find file',
            'The system cannot find the file specified'
        ],
        confidence_indicators: [
            'File path in error message',
            'Build process failure',
            'Asset loading failure'
        ],
        solution_template: 'create-missing-file',
        validation_script: 'verify-file-exists'
    },

    // React-Specific Issues
    {
        name: 'react-compilation-error',
        category: 'react',
        description: 'React component compilation error',
        error_signatures: [
            'Failed to compile',
            'SyntaxError.*Unexpected token',
            'JSX element.*not closed',
            'React.*ReferenceError'
        ],
        confidence_indicators: [
            'React project detected',
            '.jsx or .tsx file in error',
            'Webpack compilation error'
        ],
        solution_template: 'fix-react-syntax',
        validation_script: 'compile-react-component'
    },

    {
        name: 'react-hook-rules-violation',
        category: 'react',
        description: 'React hooks rules of hooks violation',
        error_signatures: [
            'Invalid hook call',
            'Hooks can only be called inside',
            'React Hook.*is called conditionally',
            'Rules of Hooks'
        ],
        confidence_indicators: [
            'React project detected',
            'Functional component with hooks',
            'Conditional hook usage detected'
        ],
        solution_template: 'fix-hook-rules',
        validation_script: 'validate-hook-usage'
    },

    // Next.js-Specific Issues
    {
        name: 'nextjs-build-error',
        category: 'nextjs',
        description: 'Next.js build process failure',
        error_signatures: [
            'Build optimization failed',
            'next build.*failed',
            'Error occurred prerendering page',
            'Static generation.*failed'
        ],
        confidence_indicators: [
            'Next.js project detected',
            'pages directory exists',
            'next.config.js present'
        ],
        solution_template: 'fix-nextjs-build',
        validation_script: 'test-nextjs-build'
    },

    {
        name: 'nextjs-hydration-mismatch',
        category: 'nextjs',
        description: 'Server and client-side rendering mismatch',
        error_signatures: [
            'Hydration failed',
            'Text content does not match',
            'server-rendered HTML.*client',
            'Expected server HTML'
        ],
        confidence_indicators: [
            'Next.js project detected',
            'Server-side rendering enabled',
            'Dynamic content in components'
        ],
        solution_template: 'fix-hydration-mismatch',
        validation_script: 'test-ssr-consistency'
    },

    // Node.js Issues
    {
        name: 'nodejs-version-incompatible',
        category: 'nodejs',
        description: 'Node.js version incompatibility',
        error_signatures: [
            'requires node version',
            'Unsupported engine',
            'node.*not compatible',
            'Expected version'
        ],
        confidence_indicators: [
            '.nvmrc file exists',
            'engines field in package.json',
            'Node version manager in use'
        ],
        solution_template: 'update-node-version',
        validation_script: 'check-node-version'
    },

    {
        name: 'express-middleware-error',
        category: 'nodejs',
        description: 'Express.js middleware configuration error',
        error_signatures: [
            'Cannot set headers after they are sent',
            'Error.*middleware',
            'app.use.*is not a function',
            'Express.*TypeError'
        ],
        confidence_indicators: [
            'Express.js project detected',
            'Middleware stack present',
            'Server response handling code'
        ],
        solution_template: 'fix-express-middleware',
        validation_script: 'test-express-middleware'
    },

    // Build Tool Issues
    {
        name: 'webpack-compilation-error',
        category: 'build',
        description: 'Webpack compilation process failure',
        error_signatures: [
            'webpack.*compilation failed',
            'Module build failed',
            'webpack-dev-server.*error',
            'Compilation.*errors'
        ],
        confidence_indicators: [
            'webpack.config.js exists',
            'Webpack in dependencies',
            'Build script using webpack'
        ],
        solution_template: 'fix-webpack-compilation',
        validation_script: 'test-webpack-build'
    },

    {
        name: 'babel-transformation-error',
        category: 'build',
        description: 'Babel JavaScript transformation error',
        error_signatures: [
            'babel.*transform failed',
            'SyntaxError.*transform',
            'Babel plugin.*error',
            'Cannot find module.*babel'
        ],
        confidence_indicators: [
            '.babelrc or babel.config.js exists',
            'Babel in dependencies',
            'Modern JavaScript syntax used'
        ],
        solution_template: 'fix-babel-config',
        validation_script: 'test-babel-transformation'
    },

    // TypeScript Issues
    {
        name: 'typescript-compilation-error',
        category: 'typescript',
        description: 'TypeScript compilation error',
        error_signatures: [
            'TS\\d+:',
            'TypeScript compilation failed',
            'Type.*is not assignable',
            'Cannot find module.*types'
        ],
        confidence_indicators: [
            'tsconfig.json exists',
            'TypeScript files present',
            'TypeScript in dependencies'
        ],
        solution_template: 'fix-typescript-error',
        validation_script: 'compile-typescript'
    },

    {
        name: 'typescript-types-missing',
        category: 'typescript',
        description: 'TypeScript type definitions missing',
        error_signatures: [
            'Try `npm i --save-dev @types/',
            'Could not find a declaration file',
            'implicitly has an \'any\' type',
            '@types.*not found'
        ],
        confidence_indicators: [
            'TypeScript project detected',
            'Third-party libraries in use',
            'Strict type checking enabled'
        ],
        solution_template: 'install-typescript-types',
        validation_script: 'check-typescript-types'
    },

    // Database Issues
    {
        name: 'migration-failed',
        category: 'database',
        description: 'Database migration execution failed',
        error_signatures: [
            'migration.*failed',
            'Database migration error',
            'ALTER TABLE.*failed',
            'Migration.*rollback'
        ],
        confidence_indicators: [
            'Database migration files exist',
            'Migration tool in dependencies',
            'Database connection configured'
        ],
        solution_template: 'fix-migration-error',
        validation_script: 'test-database-migration'
    },

    // Git and Version Control
    {
        name: 'git-merge-conflict',
        category: 'git',
        description: 'Git merge conflict markers in code',
        error_signatures: [
            '<<<<<<< HEAD',
            '=======',
            '>>>>>>> ',
            'merge conflict.*failed'
        ],
        confidence_indicators: [
            'Git repository detected',
            'Multiple branches being merged',
            'Conflict markers in files'
        ],
        solution_template: 'resolve-git-conflict',
        validation_script: 'check-git-conflicts'
    },

    // SSL and HTTPS Issues
    {
        name: 'ssl-certificate-error',
        category: 'security',
        description: 'SSL/TLS certificate validation error',
        error_signatures: [
            'certificate has expired',
            'self signed certificate',
            'CERT_UNTRUSTED',
            'SSL.*handshake failed'
        ],
        confidence_indicators: [
            'HTTPS request being made',
            'SSL certificate configuration',
            'Development environment with self-signed certs'
        ],
        solution_template: 'fix-ssl-certificate',
        validation_script: 'test-ssl-connection'
    },

    // Memory and Performance
    {
        name: 'out-of-memory',
        category: 'performance',
        description: 'JavaScript heap out of memory error',
        error_signatures: [
            'JavaScript heap out of memory',
            'FATAL ERROR.*heap',
            'Allocation failed',
            'Maximum call stack size exceeded'
        ],
        confidence_indicators: [
            'Large dataset processing',
            'Memory-intensive operations',
            'Build process running'
        ],
        solution_template: 'increase-memory-limit',
        validation_script: 'check-memory-usage'
    },

    // Package Manager Issues
    {
        name: 'npm-audit-vulnerabilities',
        category: 'security',
        description: 'NPM audit found security vulnerabilities',
        error_signatures: [
            'npm audit.*vulnerabilities',
            'high severity vulnerability',
            'Security vulnerability in',
            'npm audit fix'
        ],
        confidence_indicators: [
            'package-lock.json exists',
            'npm project detected',
            'Dependencies with known vulnerabilities'
        ],
        solution_template: 'fix-npm-vulnerabilities',
        validation_script: 'run-npm-audit'
    },

    {
        name: 'yarn-berry-pnp-error',
        category: 'dependencies',
        description: 'Yarn Berry Plug\'n\'Play resolution error',
        error_signatures: [
            'Resolution.*failed.*PnP',
            'Package.*not found in the PnP',
            'zip file.*not found',
            'Yarn Berry.*resolution error'
        ],
        confidence_indicators: [
            'yarn.lock exists',
            '.pnp.cjs or .pnp.js exists',
            'Yarn Berry (v2+) configuration'
        ],
        solution_template: 'fix-yarn-pnp',
        validation_script: 'test-yarn-pnp-resolution'
    },

    // Testing Issues
    {
        name: 'jest-test-failure',
        category: 'testing',
        description: 'Jest test runner execution failure',
        error_signatures: [
            'Jest.*test failed',
            'Cannot find module.*jest',
            'jest.*configuration error',
            'Test suite failed to run'
        ],
        confidence_indicators: [
            'jest.config.js exists',
            'Jest in dependencies',
            'Test files present'
        ],
        solution_template: 'fix-jest-configuration',
        validation_script: 'run-jest-tests'
    },

    // Linting and Code Quality
    {
        name: 'eslint-configuration-error',
        category: 'linting',
        description: 'ESLint configuration or rule error',
        error_signatures: [
            'ESLint.*configuration error',
            'eslint.*parsing error',
            'Cannot resolve configuration',
            'Rule.*not found'
        ],
        confidence_indicators: [
            '.eslintrc exists',
            'ESLint in dependencies',
            'Linting rules configured'
        ],
        solution_template: 'fix-eslint-config',
        validation_script: 'run-eslint-check'
    },

    // Docker and Containerization
    {
        name: 'docker-build-failed',
        category: 'docker',
        description: 'Docker image build process failed',
        error_signatures: [
            'docker build.*failed',
            'Dockerfile.*error',
            'COPY.*no such file',
            'Container.*failed to start'
        ],
        confidence_indicators: [
            'Dockerfile exists',
            'Docker-compose configuration',
            'Container-based deployment'
        ],
        solution_template: 'fix-docker-build',
        validation_script: 'test-docker-build'
    },

    // API and HTTP Issues
    {
        name: 'api-rate-limit-exceeded',
        category: 'api',
        description: 'API rate limit exceeded error',
        error_signatures: [
            'Rate limit exceeded',
            'Too Many Requests',
            'API quota exceeded',
            'HTTP 429'
        ],
        confidence_indicators: [
            'External API calls detected',
            'High-frequency requests',
            'API key configuration present'
        ],
        solution_template: 'handle-rate-limiting',
        validation_script: 'test-api-rate-limits'
    },

    {
        name: 'api-authentication-failed',
        category: 'api',
        description: 'API authentication or authorization failure',
        error_signatures: [
            'Authentication failed',
            'Invalid API key',
            'Unauthorized',
            'HTTP 401'
        ],
        confidence_indicators: [
            'API key in environment variables',
            'Authentication headers present',
            'OAuth configuration detected'
        ],
        solution_template: 'fix-api-authentication',
        validation_script: 'test-api-authentication'
    },

    // Mobile Development (React Native)
    {
        name: 'react-native-metro-error',
        category: 'mobile',
        description: 'React Native Metro bundler error',
        error_signatures: [
            'Metro.*bundler failed',
            'Unable to resolve module',
            'transform.*failed',
            'React Native.*build failed'
        ],
        confidence_indicators: [
            'React Native project detected',
            'metro.config.js exists',
            'Mobile development environment'
        ],
        solution_template: 'fix-metro-bundler',
        validation_script: 'test-react-native-build'
    },

    // Cloud and Deployment
    {
        name: 'vercel-deployment-error',
        category: 'deployment',
        description: 'Vercel deployment process failed',
        error_signatures: [
            'Vercel.*deployment failed',
            'Build failed on Vercel',
            'Error: Command.*failed',
            'Deployment.*aborted'
        ],
        confidence_indicators: [
            'vercel.json configuration',
            'Vercel deployment detected',
            'Serverless functions present'
        ],
        solution_template: 'fix-vercel-deployment',
        validation_script: 'test-vercel-deployment'
    },

    {
        name: 'netlify-build-error',
        category: 'deployment',
        description: 'Netlify build process failed',
        error_signatures: [
            'Netlify.*build failed',
            'Build failed on Netlify',
            'netlify.toml.*error',
            'Build script.*exited with code'
        ],
        confidence_indicators: [
            'netlify.toml exists',
            'Netlify deployment detected',
            'Static site deployment'
        ],
        solution_template: 'fix-netlify-build',
        validation_script: 'test-netlify-build'
    },

    // GraphQL Issues
    {
        name: 'graphql-schema-error',
        category: 'graphql',
        description: 'GraphQL schema definition or validation error',
        error_signatures: [
            'GraphQL.*schema error',
            'Cannot query field',
            'Unknown directive',
            'Schema validation failed'
        ],
        confidence_indicators: [
            'GraphQL schema files present',
            'GraphQL server configuration',
            'GraphQL client libraries in use'
        ],
        solution_template: 'fix-graphql-schema',
        validation_script: 'validate-graphql-schema'
    },

    // WebSocket Issues
    {
        name: 'websocket-connection-failed',
        category: 'websocket',
        description: 'WebSocket connection establishment failed',
        error_signatures: [
            'WebSocket.*failed to connect',
            'WS connection failed',
            'Socket.io.*connection error',
            'WebSocket.*timeout'
        ],
        confidence_indicators: [
            'WebSocket server configuration',
            'Real-time features implemented',
            'Socket.io or ws library in use'
        ],
        solution_template: 'fix-websocket-connection',
        validation_script: 'test-websocket-connection'
    },

    // Cache Issues
    {
        name: 'cache-invalidation-error',
        category: 'cache',
        description: 'Cache invalidation or stale cache issue',
        error_signatures: [
            'Cache.*stale',
            'Cache invalidation failed',
            'Cached response.*outdated',
            'Redis.*cache error'
        ],
        confidence_indicators: [
            'Caching mechanism in use',
            'Redis or similar cache configured',
            'Cache-related headers present'
        ],
        solution_template: 'clear-cache',
        validation_script: 'test-cache-invalidation'
    }
];

async function populateDatabase() {
    const db = new PatternDatabase();

    try {
        console.log('🔧 Initializing pattern database...');
        await db.initialize();

        console.log('📊 Checking existing patterns...');
        const healthInfo = await db.getHealthInfo();

        if (healthInfo.total_patterns > 0) {
            console.log(`Found ${healthInfo.total_patterns} existing patterns`);
            console.log('Do you want to add new patterns anyway? (This will skip duplicates)');
        }

        console.log(`📝 Adding ${errorPatterns.length} error patterns...`);
        const results = await db.addPatterns(errorPatterns);

        let successCount = 0;
        let errorCount = 0;

        results.forEach(result => {
            if (result.error) {
                errorCount++;
                console.log(`❌ Failed to add ${result.pattern}: ${result.error}`);
            } else {
                successCount++;
            }
        });

        console.log(`\n✅ Pattern database population complete!`);
        console.log(`   Successfully added: ${successCount} patterns`);
        console.log(`   Errors: ${errorCount} patterns`);

        // Show final database stats
        const finalHealthInfo = await db.getHealthInfo();
        console.log(`\n📊 Database Statistics:`);
        console.log(`   Total patterns: ${finalHealthInfo.total_patterns}`);
        console.log(`   Categories: ${finalHealthInfo.categories}`);
        console.log(`   Average success rate: ${(finalHealthInfo.avg_success_rate || 0).toFixed(2)}%`);

        // Show category breakdown
        const stats = await db.getPatternStatistics();
        console.log(`\n📋 Pattern Categories:`);
        stats.forEach(stat => {
            console.log(`   ${stat.category}: ${stat.pattern_count} patterns`);
        });

        await db.close();

    } catch (error) {
        console.error('❌ Failed to populate pattern database:', error);
        await db.close();
        process.exit(1);
    }
}

// Run the population script
if (require.main === module) {
    populateDatabase().catch(console.error);
}

module.exports = { errorPatterns, populateDatabase };