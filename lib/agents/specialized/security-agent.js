/**
 * Security Specialized Agent
 *
 * Scans for OWASP Top 10 vulnerabilities, hardcoded secrets, input sanitization,
 * authentication/authorization issues, and provides security recommendations.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const BaseSpecializedAgent = require('./base-agent');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecurityAgent extends BaseSpecializedAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'security-agent',
            description: 'OWASP Top 10 vulnerability scanner and security best practices analyzer'
        });

        // Security patterns to detect vulnerabilities
        this.securityPatterns = {
            // OWASP A01:2021 - Broken Access Control
            accessControl: [
                { pattern: /\.canAccess\s*\(\s*\)/, severity: 'high', message: 'Missing access control parameters' },
                { pattern: /if\s*\(\s*user\s*\)/, severity: 'medium', message: 'Weak authentication check' },
                { pattern: /role\s*===?\s*['"`]admin['"`]/, severity: 'high', message: 'Hardcoded role check' }
            ],

            // OWASP A02:2021 - Cryptographic Failures
            crypto: [
                { pattern: /md5\(/, severity: 'critical', message: 'MD5 is cryptographically broken' },
                { pattern: /sha1\(/, severity: 'high', message: 'SHA-1 is deprecated for security uses' },
                { pattern: /Math\.random\(\)/, severity: 'medium', message: 'Math.random() is not cryptographically secure' },
                { pattern: /\.createCipher\(/, severity: 'critical', message: 'createCipher is deprecated, use createCipherGCM' }
            ],

            // OWASP A03:2021 - Injection
            injection: [
                { pattern: /\$\{[^}]*\}/, severity: 'high', message: 'Potential template injection' },
                { pattern: /eval\s*\(/, severity: 'critical', message: 'eval() can lead to code injection' },
                { pattern: /new Function\s*\(/, severity: 'high', message: 'Function constructor can lead to code injection' },
                { pattern: /innerHTML\s*=/, severity: 'medium', message: 'innerHTML can lead to XSS' },
                { pattern: /document\.write\s*\(/, severity: 'high', message: 'document.write can lead to XSS' }
            ],

            // OWASP A04:2021 - Insecure Design
            insecureDesign: [
                { pattern: /password.*=.*['"`][^'"`]*['"`]/, severity: 'critical', message: 'Hardcoded password detected' },
                { pattern: /secret.*=.*['"`][^'"`]*['"`]/, severity: 'critical', message: 'Hardcoded secret detected' },
                { pattern: /token.*=.*['"`][^'"`]*['"`]/, severity: 'high', message: 'Hardcoded token detected' }
            ],

            // OWASP A05:2021 - Security Misconfiguration
            misconfiguration: [
                { pattern: /cors\(\)/, severity: 'medium', message: 'CORS without configuration may allow any origin' },
                { pattern: /app\.use\(express\.static\(/, severity: 'low', message: 'Static file serving should be configured securely' },
                { pattern: /\.listen\(\d+\)/, severity: 'low', message: 'Consider binding to specific interface' }
            ],

            // OWASP A06:2021 - Vulnerable and Outdated Components
            outdatedComponents: [
                { pattern: /"[^"]*":\s*"[~^]?0\.[0-9]/, severity: 'medium', message: 'Version 0.x may be unstable' }
            ],

            // OWASP A07:2021 - Identification and Authentication Failures
            authentication: [
                { pattern: /session\s*=\s*\{[^}]*secure:\s*false/, severity: 'high', message: 'Session cookies should be secure' },
                { pattern: /jwt\.sign\([^,]*,\s*['"`][^'"`]*['"`]\s*\)/, severity: 'medium', message: 'JWT without expiration' },
                { pattern: /bcrypt\.compare\([^,]*,\s*[^,)]*\)/, severity: 'low', message: 'Review bcrypt usage for timing attacks' }
            ],

            // OWASP A08:2021 - Software and Data Integrity Failures
            integrity: [
                { pattern: /JSON\.parse\([^)]*\)/, severity: 'medium', message: 'JSON.parse without error handling' },
                { pattern: /eval\(/, severity: 'critical', message: 'eval() compromises data integrity' }
            ],

            // OWASP A09:2021 - Security Logging and Monitoring Failures
            logging: [
                { pattern: /console\.log\([^)]*password/, severity: 'high', message: 'Logging sensitive information' },
                { pattern: /console\.log\([^)]*secret/, severity: 'high', message: 'Logging sensitive information' },
                { pattern: /console\.log\([^)]*token/, severity: 'medium', message: 'Potential sensitive information logging' }
            ],

            // OWASP A10:2021 - Server-Side Request Forgery (SSRF)
            ssrf: [
                { pattern: /fetch\([^)]*req\./, severity: 'high', message: 'Potential SSRF vulnerability' },
                { pattern: /axios\.[get|post]\([^)]*req\./, severity: 'high', message: 'Potential SSRF vulnerability' },
                { pattern: /http\.request\([^)]*req\./, severity: 'high', message: 'Potential SSRF vulnerability' }
            ]
        };

        // Common secrets patterns
        this.secretsPatterns = [
            { pattern: /sk_live_[a-zA-Z0-9]{24,}/, name: 'Stripe Live Secret Key', severity: 'critical' },
            { pattern: /sk_test_[a-zA-Z0-9]{24,}/, name: 'Stripe Test Secret Key', severity: 'high' },
            { pattern: /AIza[0-9A-Za-z\\-_]{35}/, name: 'Google API Key', severity: 'critical' },
            { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key ID', severity: 'critical' },
            { pattern: /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/, name: 'GitHub Personal Access Token', severity: 'critical' },
            { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token (Classic)', severity: 'critical' },
            { pattern: /xox[baprs]-([0-9a-zA-Z]{10,48})/, name: 'Slack Token', severity: 'critical' },
            { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, name: 'Private Key', severity: 'critical' }
        ];
    }

    getAgentType() {
        return 'security';
    }

    getRequiredTools() {
        return ['npm', 'node']; // npm for audit, node for basic operations
    }

    /**
     * Perform comprehensive security analysis
     */
    async performAnalysis(projectInfo) {
        const analyses = [
            this.scanForVulnerabilities(projectInfo),
            this.scanForSecrets(projectInfo),
            this.analyzePackageSecurity(projectInfo),
            this.checkSecurityHeaders(projectInfo),
            this.analyzeHttpsSecurity(projectInfo),
            this.checkInputValidation(projectInfo),
            this.analyzeAuthenticationSecurity(projectInfo)
        ];

        const results = await Promise.allSettled(analyses);

        // Process results and handle any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Security analysis step ${index + 1} failed:`, result.reason);
            }
        });

        return this.results;
    }

    /**
     * Scan files for security vulnerability patterns
     */
    async scanForVulnerabilities(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check each security pattern category
                for (const [category, patterns] of Object.entries(this.securityPatterns)) {
                    for (const patternInfo of patterns) {
                        await this.checkPattern(file, content, lines, category, patternInfo);
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file}:`, error.message);
            }
        }
    }

    /**
     * Check for hardcoded secrets and credentials
     */
    async scanForSecrets(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root, {
            includeConfig: true,
            includeEnv: false // Don't scan .env files as they're expected to have secrets
        });

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                for (const secret of this.secretsPatterns) {
                    const matches = content.match(new RegExp(secret.pattern, 'g'));
                    if (matches) {
                        for (const match of matches) {
                            const lineNumber = this.findLineNumber(lines, match);

                            this.addFinding(
                                secret.severity,
                                'secrets',
                                `${secret.name} detected in source code`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    line: lineNumber,
                                    codeSnippet: this.maskSecret(match),
                                    recommendation: `Move ${secret.name} to environment variables or secure configuration`,
                                    fixSuggestion: 'Use process.env.SECRET_NAME instead of hardcoding',
                                    references: [
                                        'https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure'
                                    ],
                                    confidence: 0.95,
                                    impact: 'high',
                                    effort: 'low',
                                    tags: ['secrets', 'hardcoded-credentials', 'owasp-a04']
                                }
                            );
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not scan file ${file} for secrets:`, error.message);
            }
        }
    }

    /**
     * Analyze package security using npm audit
     */
    async analyzePackageSecurity(projectInfo) {
        const packageJsonPath = path.join(projectInfo.root, 'package.json');

        try {
            await fs.access(packageJsonPath);
        } catch (error) {
            return; // No package.json, skip npm audit
        }

        try {
            const { execSync } = require('child_process');
            const auditResult = execSync('npm audit --json', {
                cwd: projectInfo.root,
                stdio: 'pipe',
                encoding: 'utf8'
            });

            const audit = JSON.parse(auditResult);

            if (audit.vulnerabilities) {
                for (const [packageName, vulnInfo] of Object.entries(audit.vulnerabilities)) {
                    const severity = this.mapNpmSeverity(vulnInfo.severity);

                    this.addFinding(
                        severity,
                        'vulnerable-dependencies',
                        `Vulnerable dependency: ${packageName}`,
                        {
                            recommendation: `Update ${packageName} to version ${vulnInfo.fixAvailable?.version || 'latest'}`,
                            fixSuggestion: vulnInfo.fixAvailable ? `npm install ${packageName}@${vulnInfo.fixAvailable.version}` : `npm audit fix`,
                            confidence: 0.9,
                            impact: severity,
                            effort: 'low',
                            tags: ['dependencies', 'npm-audit', 'owasp-a06'],
                            metadata: {
                                package: packageName,
                                currentVersion: vulnInfo.version,
                                fixAvailable: vulnInfo.fixAvailable
                            }
                        }
                    );
                }
            }
        } catch (error) {
            // npm audit might fail for various reasons, don't fail the entire analysis
            console.warn('npm audit failed:', error.message);
        }
    }

    /**
     * Check for security headers in web applications
     */
    async checkSecurityHeaders(projectInfo) {
        const serverFiles = await this.getServerFiles(projectInfo.root);

        for (const file of serverFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                const securityHeaders = [
                    'Content-Security-Policy',
                    'X-Frame-Options',
                    'X-XSS-Protection',
                    'X-Content-Type-Options',
                    'Strict-Transport-Security',
                    'Referrer-Policy'
                ];

                const foundHeaders = securityHeaders.filter(header =>
                    content.includes(header) || content.includes(header.toLowerCase())
                );

                const missingHeaders = securityHeaders.filter(header => !foundHeaders.includes(header));

                if (missingHeaders.length > 0) {
                    this.addFinding(
                        'medium',
                        'security-headers',
                        `Missing security headers: ${missingHeaders.join(', ')}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Implement missing security headers to protect against common attacks',
                            fixSuggestion: this.generateSecurityHeadersCode(missingHeaders, projectInfo.framework),
                            references: [
                                'https://owasp.org/www-project-secure-headers/',
                                'https://securityheaders.com/'
                            ],
                            confidence: 0.8,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['security-headers', 'web-security', 'owasp-a05']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file} for security headers:`, error.message);
            }
        }
    }

    /**
     * Analyze HTTPS security configuration
     */
    async analyzeHttpsSecurity(projectInfo) {
        const configFiles = await this.getConfigFiles(projectInfo.root);

        for (const file of configFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check for HTTP-only configurations
                if (content.includes('http://') && !content.includes('https://')) {
                    this.addFinding(
                        'high',
                        'https-security',
                        'HTTP-only configuration detected',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Use HTTPS for all communications',
                            fixSuggestion: 'Replace http:// with https:// and implement SSL/TLS certificates',
                            references: [
                                'https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure'
                            ],
                            confidence: 0.7,
                            impact: 'high',
                            effort: 'medium',
                            tags: ['https', 'ssl', 'encryption', 'owasp-a02']
                        }
                    );
                }

                // Check for weak SSL/TLS configuration
                const weakSslPatterns = [
                    { pattern: /SSLv[23]/, message: 'SSLv2/SSLv3 are insecure' },
                    { pattern: /TLSv1\.0/, message: 'TLS 1.0 is deprecated' },
                    { pattern: /TLSv1\.1/, message: 'TLS 1.1 is deprecated' }
                ];

                for (const weakSsl of weakSslPatterns) {
                    if (weakSsl.pattern.test(content)) {
                        this.addFinding(
                            'high',
                            'ssl-tls-security',
                            weakSsl.message,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Use TLS 1.2 or higher',
                                fixSuggestion: 'Configure server to use TLS 1.2+ only',
                                confidence: 0.9,
                                impact: 'high',
                                effort: 'medium',
                                tags: ['ssl', 'tls', 'encryption', 'owasp-a02']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file} for HTTPS security:`, error.message);
            }
        }
    }

    /**
     * Check input validation and sanitization
     */
    async checkInputValidation(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Look for input handling without validation
                const inputPatterns = [
                    { pattern: /req\.body\./, context: 'Express.js request body' },
                    { pattern: /req\.query\./, context: 'Express.js query parameters' },
                    { pattern: /req\.params\./, context: 'Express.js route parameters' },
                    { pattern: /formData\.get\(/, context: 'Form data access' },
                    { pattern: /JSON\.parse\(req\./, context: 'JSON parsing from request' }
                ];

                for (const inputPattern of inputPatterns) {
                    const matches = [...content.matchAll(new RegExp(inputPattern.pattern, 'g'))];
                    for (const match of matches) {
                        const lineNumber = this.findLineNumber(lines, match[0]);
                        const line = lines[lineNumber - 1] || '';

                        // Check if there's validation on the same line or nearby lines
                        const hasValidation = this.checkForValidation(lines, lineNumber);

                        if (!hasValidation) {
                            this.addFinding(
                                'medium',
                                'input-validation',
                                `Unvalidated user input: ${inputPattern.context}`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    line: lineNumber,
                                    codeSnippet: line.trim(),
                                    recommendation: 'Implement input validation and sanitization',
                                    fixSuggestion: 'Use validation libraries like Joi, Yup, or express-validator',
                                    references: [
                                        'https://owasp.org/www-project-top-ten/2017/A1_2017-Injection'
                                    ],
                                    confidence: 0.6,
                                    impact: 'medium',
                                    effort: 'medium',
                                    tags: ['input-validation', 'sanitization', 'owasp-a03']
                                }
                            );
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file} for input validation:`, error.message);
            }
        }
    }

    /**
     * Analyze authentication and authorization security
     */
    async analyzeAuthenticationSecurity(projectInfo) {
        const sourceFiles = await this.getSourceFiles(projectInfo.root);

        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check for common authentication issues
                const authIssues = [
                    {
                        pattern: /jwt\.sign\([^,]*,\s*['"`][^'"`]{1,20}['"`]/,
                        severity: 'high',
                        message: 'JWT signed with weak secret (less than 20 characters)',
                        fix: 'Use a strong secret key (at least 32 characters)'
                    },
                    {
                        pattern: /bcrypt\.hash\([^,]*,\s*[1-9]\s*\)/,
                        severity: 'medium',
                        message: 'bcrypt rounds less than 10 may be insecure',
                        fix: 'Use at least 10-12 rounds for bcrypt'
                    },
                    {
                        pattern: /passport\.use\(.*LocalStrategy/,
                        severity: 'info',
                        message: 'Local authentication strategy detected',
                        fix: 'Ensure proper rate limiting and account lockout mechanisms'
                    }
                ];

                for (const issue of authIssues) {
                    if (issue.pattern.test(content)) {
                        this.addFinding(
                            issue.severity,
                            'authentication',
                            issue.message,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: issue.fix,
                                references: [
                                    'https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication'
                                ],
                                confidence: 0.8,
                                impact: issue.severity,
                                effort: 'medium',
                                tags: ['authentication', 'authorization', 'owasp-a07']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file} for authentication security:`, error.message);
            }
        }
    }

    /**
     * Helper methods
     */

    async checkPattern(file, content, lines, category, patternInfo) {
        const matches = [...content.matchAll(new RegExp(patternInfo.pattern, 'g'))];

        for (const match of matches) {
            const lineNumber = this.findLineNumber(lines, match[0]);
            const line = lines[lineNumber - 1] || '';

            this.addFinding(
                patternInfo.severity,
                category,
                patternInfo.message,
                {
                    file: path.relative(this.config.projectRoot, file),
                    line: lineNumber,
                    codeSnippet: line.trim(),
                    recommendation: this.getRecommendationForPattern(category, patternInfo),
                    confidence: 0.7,
                    impact: patternInfo.severity,
                    effort: 'medium',
                    tags: [category, 'pattern-match']
                }
            );
        }
    }

    getRecommendationForPattern(category, patternInfo) {
        const recommendations = {
            accessControl: 'Implement proper access control checks with role-based permissions',
            crypto: 'Use secure cryptographic functions and algorithms',
            injection: 'Sanitize and validate all user inputs, use parameterized queries',
            insecureDesign: 'Move sensitive data to environment variables',
            misconfiguration: 'Review and secure configuration settings',
            outdatedComponents: 'Update to stable, maintained versions',
            authentication: 'Implement secure authentication mechanisms',
            integrity: 'Add proper error handling and data validation',
            logging: 'Avoid logging sensitive information, use structured logging',
            ssrf: 'Validate and sanitize URLs, implement allow-lists for external requests'
        };

        return recommendations[category] || 'Review and address this security concern';
    }

    async getSourceFiles(rootDir, options = {}) {
        const { includeConfig = false, includeEnv = false } = options;
        const files = [];

        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.rb', '.php', '.java'];
        if (includeConfig) {
            extensions.push('.json', '.yaml', '.yml', '.toml', '.ini');
        }
        if (includeEnv) {
            extensions.push('.env');
        }

        async function walkDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        // Skip common directories that don't contain source code
                        if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
                            await walkDir(fullPath);
                        }
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not read directory ${dir}:`, error.message);
            }
        }

        await walkDir(rootDir);
        return files;
    }

    async getServerFiles(rootDir) {
        const files = await this.getSourceFiles(rootDir);
        return files.filter(file => {
            const content = path.basename(file).toLowerCase();
            return content.includes('server') ||
                   content.includes('app') ||
                   content.includes('index') ||
                   content.includes('main');
        });
    }

    async getConfigFiles(rootDir) {
        const files = await this.getSourceFiles(rootDir, { includeConfig: true });
        return files.filter(file => {
            const name = path.basename(file).toLowerCase();
            return name.includes('config') ||
                   name.includes('setting') ||
                   name === 'package.json' ||
                   name.startsWith('.env');
        });
    }

    findLineNumber(lines, searchText) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }

    maskSecret(secret) {
        if (secret.length <= 8) return '*'.repeat(secret.length);
        return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
    }

    mapNpmSeverity(npmSeverity) {
        const mapping = {
            'critical': 'critical',
            'high': 'high',
            'moderate': 'medium',
            'low': 'low',
            'info': 'info'
        };
        return mapping[npmSeverity] || 'medium';
    }

    checkForValidation(lines, lineNumber) {
        // Check current line and few lines before/after for validation patterns
        const searchLines = [
            lines[lineNumber - 2],
            lines[lineNumber - 1],
            lines[lineNumber],
            lines[lineNumber + 1]
        ].filter(Boolean);

        const validationPatterns = [
            /\.validate\(/,
            /\.schema\(/,
            /joi\./,
            /yup\./,
            /express-validator/,
            /\.isLength\(/,
            /\.isEmail\(/,
            /\.matches\(/,
            /typeof.*===.*['"`]string['"`]/,
            /instanceof/
        ];

        return searchLines.some(line =>
            validationPatterns.some(pattern => pattern.test(line))
        );
    }

    generateSecurityHeadersCode(missingHeaders, framework) {
        const headerConfigs = {
            'Content-Security-Policy': "default-src 'self'",
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'X-Content-Type-Options': 'nosniff',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };

        if (framework === 'express') {
            const headers = missingHeaders.map(header =>
                `res.setHeader('${header}', '${headerConfigs[header]}');`
            ).join('\n');

            return `// Add these security headers:\n${headers}`;
        }

        return 'Implement appropriate security headers for your framework';
    }

    /**
     * Get general security recommendations
     */
    async getGeneralRecommendations() {
        const recommendations = [
            {
                priority: 'high',
                category: 'general',
                title: 'Implement Security Linting',
                description: 'Use ESLint security plugins to catch vulnerabilities during development',
                action: 'npm install --save-dev eslint-plugin-security',
                estimated_effort: 'low',
                impact: 'medium'
            },
            {
                priority: 'medium',
                category: 'general',
                title: 'Set up Dependency Scanning',
                description: 'Regularly scan dependencies for known vulnerabilities',
                action: 'Add `npm audit` to your CI/CD pipeline',
                estimated_effort: 'low',
                impact: 'high'
            },
            {
                priority: 'medium',
                category: 'general',
                title: 'Implement Content Security Policy',
                description: 'CSP helps prevent XSS attacks by controlling resource loading',
                action: 'Configure CSP headers in your web server or application',
                estimated_effort: 'medium',
                impact: 'high'
            }
        ];

        return recommendations;
    }

    validateProject(projectInfo) {
        // Security agent can analyze any project type
        return projectInfo && projectInfo.root;
    }
}

module.exports = SecurityAgent;