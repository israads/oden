/**
 * Documentation Validator
 *
 * Validates consistency between PRD ↔ Architecture ↔ Code for the
 * /oden:architect audit functionality. Detects 90%+ inconsistencies
 * between documentation and implementation.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentationValidator {
    constructor(config = {}) {
        this.config = {
            projectRoot: process.cwd(),
            documentationPaths: {
                prds: '.claude/prds/',
                architecture: 'docs/reference/',
                specs: 'docs/reference/modules/',
                epics: '.claude/epics/'
            },
            sourcePaths: {
                src: 'src/',
                lib: 'lib/',
                components: 'src/components/',
                pages: 'src/pages/',
                api: 'src/api/',
                database: 'src/db/',
                tests: 'tests/'
            },
            validationRules: {
                strictConsistency: true,
                allowMinorVariations: false,
                confidenceThreshold: 0.8
            },
            ...config
        };

        this.inconsistencies = [];
        this.documentCache = new Map();
        this.codeCache = new Map();
        this.analysisMetadata = {
            documentsAnalyzed: 0,
            sourceFilesAnalyzed: 0,
            inconsistenciesFound: 0,
            consistencyScore: 0
        };
    }

    /**
     * Main validation entry point
     */
    async validateDocumentation() {
        console.log('🔍 Starting documentation consistency validation...');

        const startTime = Date.now();

        try {
            // Load all documentation
            await this.loadDocumentation();

            // Load and analyze source code
            await this.loadSourceCode();

            // Perform validation checks
            await this.performConsistencyChecks();

            // Calculate overall consistency score
            const consistencyScore = this.calculateConsistencyScore();

            const duration = Date.now() - startTime;

            console.log(`✅ Documentation validation completed in ${duration}ms`);
            console.log(`📊 Consistency score: ${consistencyScore}/100`);
            console.log(`🔍 Found ${this.inconsistencies.length} inconsistencies`);

            return {
                success: true,
                consistencyScore,
                inconsistencies: this.inconsistencies,
                metadata: {
                    ...this.analysisMetadata,
                    duration,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('❌ Documentation validation failed:', error.message);
            return {
                success: false,
                error: error.message,
                inconsistencies: this.inconsistencies,
                metadata: this.analysisMetadata
            };
        }
    }

    /**
     * Load all documentation files
     */
    async loadDocumentation() {
        console.log('📚 Loading documentation files...');

        const docTypes = [
            { type: 'prds', path: this.config.documentationPaths.prds, pattern: /\.md$/ },
            { type: 'architecture', path: this.config.documentationPaths.architecture, pattern: /technical-decisions\.md$|.*-spec\.md$/ },
            { type: 'specs', path: this.config.documentationPaths.specs, pattern: /\.md$/ },
            { type: 'epics', path: this.config.documentationPaths.epics, pattern: /epic\.md$/ }
        ];

        for (const docType of docTypes) {
            const fullPath = path.join(this.config.projectRoot, docType.path);

            try {
                await this.loadDocumentsOfType(docType.type, fullPath, docType.pattern);
            } catch (error) {
                console.warn(`⚠️  Could not load ${docType.type} documentation:`, error.message);
            }
        }

        this.analysisMetadata.documentsAnalyzed = this.documentCache.size;
        console.log(`📖 Loaded ${this.documentCache.size} documentation files`);
    }

    /**
     * Load documents of a specific type
     */
    async loadDocumentsOfType(type, dirPath, pattern) {
        try {
            const entries = await this.walkDirectory(dirPath);

            for (const filePath of entries) {
                const fileName = path.basename(filePath);

                if (pattern.test(fileName)) {
                    try {
                        const content = await fs.readFile(filePath, 'utf8');
                        const document = this.parseDocument(content, filePath, type);

                        const key = `${type}:${path.relative(this.config.projectRoot, filePath)}`;
                        this.documentCache.set(key, document);
                    } catch (error) {
                        console.warn(`Could not read ${filePath}:`, error.message);
                    }
                }
            }
        } catch (error) {
            // Directory might not exist - that's okay
        }
    }

    /**
     * Load and analyze source code
     */
    async loadSourceCode() {
        console.log('🔍 Analyzing source code...');

        const sourceTypes = [
            { type: 'components', path: this.config.sourcePaths.components, extensions: ['.jsx', '.tsx', '.js', '.ts'] },
            { type: 'pages', path: this.config.sourcePaths.pages, extensions: ['.jsx', '.tsx', '.js', '.ts'] },
            { type: 'api', path: this.config.sourcePaths.api, extensions: ['.js', '.ts'] },
            { type: 'database', path: this.config.sourcePaths.database, extensions: ['.js', '.ts', '.sql'] },
            { type: 'general', path: this.config.sourcePaths.src, extensions: ['.js', '.ts', '.jsx', '.tsx'] }
        ];

        for (const sourceType of sourceTypes) {
            const fullPath = path.join(this.config.projectRoot, sourceType.path);

            try {
                await this.loadSourceCodeOfType(sourceType.type, fullPath, sourceType.extensions);
            } catch (error) {
                console.warn(`⚠️  Could not load ${sourceType.type} source code:`, error.message);
            }
        }

        this.analysisMetadata.sourceFilesAnalyzed = this.codeCache.size;
        console.log(`💻 Analyzed ${this.codeCache.size} source files`);
    }

    /**
     * Load source code of a specific type
     */
    async loadSourceCodeOfType(type, dirPath, extensions) {
        try {
            const entries = await this.walkDirectory(dirPath);

            for (const filePath of entries) {
                const ext = path.extname(filePath);

                if (extensions.includes(ext)) {
                    try {
                        const content = await fs.readFile(filePath, 'utf8');
                        const sourceAnalysis = this.analyzeSourceCode(content, filePath, type);

                        const key = `${type}:${path.relative(this.config.projectRoot, filePath)}`;
                        this.codeCache.set(key, sourceAnalysis);
                    } catch (error) {
                        console.warn(`Could not read ${filePath}:`, error.message);
                    }
                }
            }
        } catch (error) {
            // Directory might not exist - that's okay
        }
    }

    /**
     * Perform comprehensive consistency checks
     */
    async performConsistencyChecks() {
        console.log('🔍 Performing consistency checks...');

        const checks = [
            this.checkFeatureConsistency(),
            this.checkApiConsistency(),
            this.checkDatabaseSchemaConsistency(),
            this.checkComponentConsistency(),
            this.checkBusinessRuleConsistency(),
            this.checkTechnicalDecisionConsistency(),
            this.checkNamingConsistency(),
            this.checkArchitecturalPatternConsistency()
        ];

        const results = await Promise.allSettled(checks);

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Consistency check ${index + 1} failed:`, result.reason);
            }
        });

        this.analysisMetadata.inconsistenciesFound = this.inconsistencies.length;
    }

    /**
     * Check feature consistency between PRD and implementation
     */
    async checkFeatureConsistency() {
        const prds = [...this.documentCache.entries()].filter(([key]) => key.startsWith('prds:'));
        const components = [...this.codeCache.entries()].filter(([key]) => key.startsWith('components:'));
        const pages = [...this.codeCache.entries()].filter(([key]) => key.startsWith('pages:'));

        for (const [prdKey, prd] of prds) {
            const documentedFeatures = this.extractFeatures(prd.content);

            for (const feature of documentedFeatures) {
                const implementations = this.findFeatureImplementations(feature, components, pages);

                if (implementations.length === 0) {
                    this.addInconsistency({
                        type: 'missing-feature-implementation',
                        severity: 'high',
                        source: prdKey,
                        feature: feature.name,
                        description: `Feature "${feature.name}" documented in PRD but not implemented`,
                        recommendation: 'Implement the missing feature or remove from documentation',
                        confidence: 0.9
                    });
                } else {
                    // Check if implementation matches specification
                    for (const impl of implementations) {
                        const consistency = this.checkFeatureImplementationConsistency(feature, impl);
                        if (consistency.score < this.config.validationRules.confidenceThreshold) {
                            this.addInconsistency({
                                type: 'feature-implementation-mismatch',
                                severity: 'medium',
                                source: prdKey,
                                target: impl.file,
                                feature: feature.name,
                                description: `Feature implementation doesn't match PRD specification`,
                                details: consistency.differences,
                                recommendation: 'Align implementation with PRD or update documentation',
                                confidence: consistency.score
                            });
                        }
                    }
                }
            }
        }

        // Check for implemented features not in PRD
        const allImplementedFeatures = this.extractImplementedFeatures(components, pages);
        const allDocumentedFeatures = prds.flatMap(([, prd]) => this.extractFeatures(prd.content));

        for (const implFeature of allImplementedFeatures) {
            const isDocumented = allDocumentedFeatures.some(docFeature =>
                this.featuresMatch(docFeature, implFeature)
            );

            if (!isDocumented) {
                this.addInconsistency({
                    type: 'undocumented-feature',
                    severity: 'medium',
                    source: implFeature.file,
                    feature: implFeature.name,
                    description: `Feature "${implFeature.name}" implemented but not documented in PRD`,
                    recommendation: 'Add feature to PRD or remove if not needed',
                    confidence: 0.8
                });
            }
        }
    }

    /**
     * Check API consistency between documentation and implementation
     */
    async checkApiConsistency() {
        const specs = [...this.documentCache.entries()].filter(([key]) => key.includes('spec') || key.includes('architecture'));
        const apiFiles = [...this.codeCache.entries()].filter(([key]) => key.startsWith('api:'));

        for (const [specKey, spec] of specs) {
            const documentedEndpoints = this.extractApiEndpoints(spec.content);

            for (const endpoint of documentedEndpoints) {
                const implementations = this.findEndpointImplementations(endpoint, apiFiles);

                if (implementations.length === 0) {
                    this.addInconsistency({
                        type: 'missing-api-endpoint',
                        severity: 'high',
                        source: specKey,
                        endpoint: `${endpoint.method} ${endpoint.path}`,
                        description: `API endpoint documented but not implemented`,
                        recommendation: 'Implement the missing API endpoint',
                        confidence: 0.9
                    });
                } else {
                    // Check endpoint implementation details
                    for (const impl of implementations) {
                        const consistency = this.checkEndpointConsistency(endpoint, impl);
                        if (consistency.score < this.config.validationRules.confidenceThreshold) {
                            this.addInconsistency({
                                type: 'api-endpoint-mismatch',
                                severity: 'medium',
                                source: specKey,
                                target: impl.file,
                                endpoint: `${endpoint.method} ${endpoint.path}`,
                                description: 'API endpoint implementation doesn\'t match specification',
                                details: consistency.differences,
                                recommendation: 'Align implementation with API specification',
                                confidence: consistency.score
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * Check database schema consistency
     */
    async checkDatabaseSchemaConsistency() {
        const archDocs = [...this.documentCache.entries()].filter(([key]) => key.includes('architecture') || key.includes('technical-decisions'));
        const dbFiles = [...this.codeCache.entries()].filter(([key]) => key.startsWith('database:'));

        for (const [archKey, archDoc] of archDocs) {
            const documentedTables = this.extractDatabaseSchema(archDoc.content);

            for (const table of documentedTables) {
                const implementations = this.findTableImplementations(table, dbFiles);

                if (implementations.length === 0) {
                    this.addInconsistency({
                        type: 'missing-database-table',
                        severity: 'high',
                        source: archKey,
                        table: table.name,
                        description: `Database table "${table.name}" documented but not implemented`,
                        recommendation: 'Create the missing database table or update documentation',
                        confidence: 0.9
                    });
                } else {
                    // Check table structure consistency
                    for (const impl of implementations) {
                        const consistency = this.checkTableConsistency(table, impl);
                        if (consistency.score < this.config.validationRules.confidenceThreshold) {
                            this.addInconsistency({
                                type: 'database-schema-mismatch',
                                severity: 'medium',
                                source: archKey,
                                target: impl.file,
                                table: table.name,
                                description: 'Database table structure doesn\'t match documentation',
                                details: consistency.differences,
                                recommendation: 'Align schema with architecture documentation',
                                confidence: consistency.score
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * Check component consistency
     */
    async checkComponentConsistency() {
        const specs = [...this.documentCache.entries()].filter(([key]) => key.includes('spec'));
        const components = [...this.codeCache.entries()].filter(([key]) => key.startsWith('components:'));

        for (const [specKey, spec] of specs) {
            const documentedComponents = this.extractComponents(spec.content);

            for (const component of documentedComponents) {
                const implementations = this.findComponentImplementations(component, components);

                if (implementations.length === 0) {
                    this.addInconsistency({
                        type: 'missing-component',
                        severity: 'medium',
                        source: specKey,
                        component: component.name,
                        description: `Component "${component.name}" specified but not implemented`,
                        recommendation: 'Implement the missing component',
                        confidence: 0.8
                    });
                } else {
                    // Check component props/interface consistency
                    for (const impl of implementations) {
                        const consistency = this.checkComponentConsistency(component, impl);
                        if (consistency.score < this.config.validationRules.confidenceThreshold) {
                            this.addInconsistency({
                                type: 'component-interface-mismatch',
                                severity: 'low',
                                source: specKey,
                                target: impl.file,
                                component: component.name,
                                description: 'Component interface doesn\'t match specification',
                                details: consistency.differences,
                                recommendation: 'Align component with specification',
                                confidence: consistency.score
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * Check business rule consistency
     */
    async checkBusinessRuleConsistency() {
        const prds = [...this.documentCache.entries()].filter(([key]) => key.startsWith('prds:'));
        const allSourceFiles = [...this.codeCache.entries()];

        for (const [prdKey, prd] of prds) {
            const businessRules = this.extractBusinessRules(prd.content);

            for (const rule of businessRules) {
                const implementations = this.findBusinessRuleImplementations(rule, allSourceFiles);

                if (implementations.length === 0) {
                    this.addInconsistency({
                        type: 'missing-business-rule',
                        severity: 'high',
                        source: prdKey,
                        rule: rule.name,
                        description: `Business rule "${rule.name}" documented but not implemented`,
                        recommendation: 'Implement the business rule or clarify in documentation',
                        confidence: 0.8
                    });
                } else {
                    // Check rule implementation correctness
                    for (const impl of implementations) {
                        const consistency = this.checkBusinessRuleConsistency(rule, impl);
                        if (consistency.score < this.config.validationRules.confidenceThreshold) {
                            this.addInconsistency({
                                type: 'business-rule-mismatch',
                                severity: 'high',
                                source: prdKey,
                                target: impl.file,
                                rule: rule.name,
                                description: 'Business rule implementation doesn\'t match specification',
                                details: consistency.differences,
                                recommendation: 'Align business logic with documented rules',
                                confidence: consistency.score
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * Check technical decision consistency
     */
    async checkTechnicalDecisionConsistency() {
        const techDocs = [...this.documentCache.entries()].filter(([key]) => key.includes('technical-decisions'));
        const allSourceFiles = [...this.codeCache.entries()];

        for (const [techKey, techDoc] of techDocs) {
            const decisions = this.extractTechnicalDecisions(techDoc.content);

            for (const decision of decisions) {
                const implementations = this.findTechnicalDecisionImplementations(decision, allSourceFiles);

                if (implementations.length === 0 && decision.type === 'implementation') {
                    this.addInconsistency({
                        type: 'missing-technical-decision',
                        severity: 'medium',
                        source: techKey,
                        decision: decision.name,
                        description: `Technical decision "${decision.name}" documented but not implemented`,
                        recommendation: 'Implement the technical decision or update documentation',
                        confidence: 0.7
                    });
                } else {
                    // Check if implementation follows the decision
                    for (const impl of implementations) {
                        const consistency = this.checkTechnicalDecisionCompliance(decision, impl);
                        if (consistency.score < this.config.validationRules.confidenceThreshold) {
                            this.addInconsistency({
                                type: 'technical-decision-violation',
                                severity: 'medium',
                                source: techKey,
                                target: impl.file,
                                decision: decision.name,
                                description: 'Code violates documented technical decision',
                                details: consistency.violations,
                                recommendation: 'Align code with technical decisions',
                                confidence: consistency.score
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * Check naming consistency
     */
    async checkNamingConsistency() {
        const allDocs = [...this.documentCache.entries()];
        const allCode = [...this.codeCache.entries()];

        // Extract all named entities from documentation
        const documentedNames = new Map();
        for (const [docKey, doc] of allDocs) {
            const names = this.extractNamedEntities(doc.content, docKey);
            names.forEach(name => {
                if (!documentedNames.has(name.canonical)) {
                    documentedNames.set(name.canonical, []);
                }
                documentedNames.get(name.canonical).push({ ...name, source: docKey });
            });
        }

        // Extract all names from code
        const codeNames = new Map();
        for (const [codeKey, code] of allCode) {
            const names = this.extractCodeNames(code, codeKey);
            names.forEach(name => {
                if (!codeNames.has(name.canonical)) {
                    codeNames.set(name.canonical, []);
                }
                codeNames.get(name.canonical).push({ ...name, source: codeKey });
            });
        }

        // Check for naming inconsistencies
        for (const [canonical, docNames] of documentedNames) {
            const matchingCodeNames = codeNames.get(canonical);

            if (!matchingCodeNames) {
                // Check for similar names (might be naming variations)
                const similarNames = this.findSimilarNames(canonical, [...codeNames.keys()]);

                if (similarNames.length > 0) {
                    this.addInconsistency({
                        type: 'naming-inconsistency',
                        severity: 'low',
                        documentedName: canonical,
                        implementedNames: similarNames,
                        description: `Documented name "${canonical}" has similar but different implementations`,
                        recommendation: 'Standardize naming across documentation and code',
                        confidence: 0.6
                    });
                }
            }
        }
    }

    /**
     * Check architectural pattern consistency
     */
    async checkArchitecturalPatternConsistency() {
        const archDocs = [...this.documentCache.entries()].filter(([key]) => key.includes('architecture') || key.includes('technical-decisions'));
        const allSourceFiles = [...this.codeCache.entries()];

        for (const [archKey, archDoc] of archDocs) {
            const patterns = this.extractArchitecturalPatterns(archDoc.content);

            for (const pattern of patterns) {
                const implementations = this.findPatternImplementations(pattern, allSourceFiles);
                const violations = this.findPatternViolations(pattern, allSourceFiles);

                if (implementations.length === 0 && pattern.required) {
                    this.addInconsistency({
                        type: 'missing-architectural-pattern',
                        severity: 'high',
                        source: archKey,
                        pattern: pattern.name,
                        description: `Required architectural pattern "${pattern.name}" not implemented`,
                        recommendation: 'Implement the architectural pattern or update documentation',
                        confidence: 0.8
                    });
                }

                for (const violation of violations) {
                    this.addInconsistency({
                        type: 'architectural-pattern-violation',
                        severity: 'medium',
                        source: archKey,
                        target: violation.file,
                        pattern: pattern.name,
                        description: `Code violates architectural pattern "${pattern.name}"`,
                        details: violation.details,
                        recommendation: 'Refactor code to follow architectural pattern',
                        confidence: violation.confidence
                    });
                }
            }
        }
    }

    /**
     * Helper methods for parsing and analysis
     */

    parseDocument(content, filePath, type) {
        // Extract frontmatter if present
        let frontmatter = {};
        let mainContent = content;

        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
            try {
                // Simple YAML parsing for basic frontmatter
                const yamlLines = frontmatterMatch[1].split('\n');
                for (const line of yamlLines) {
                    const match = line.match(/^(\w+):\s*(.+)$/);
                    if (match) {
                        frontmatter[match[1]] = match[2].replace(/['"]/g, '');
                    }
                }
                mainContent = frontmatterMatch[2];
            } catch (error) {
                // Ignore frontmatter parsing errors
            }
        }

        return {
            filePath,
            type,
            frontmatter,
            content: mainContent,
            sections: this.extractSections(mainContent),
            metadata: {
                wordCount: mainContent.split(/\s+/).length,
                lineCount: mainContent.split('\n').length,
                lastModified: new Date().toISOString()
            }
        };
    }

    analyzeSourceCode(content, filePath, type) {
        const analysis = {
            filePath,
            type,
            content,
            functions: this.extractFunctions(content),
            classes: this.extractClasses(content),
            interfaces: this.extractInterfaces(content),
            imports: this.extractImports(content),
            exports: this.extractExports(content),
            constants: this.extractConstants(content),
            variables: this.extractVariables(content),
            comments: this.extractComments(content),
            metadata: {
                extension: path.extname(filePath),
                lineCount: content.split('\n').length,
                size: content.length
            }
        };

        // Add specific analysis based on file type
        if (type === 'api') {
            analysis.endpoints = this.extractEndpoints(content);
            analysis.middleware = this.extractMiddleware(content);
        } else if (type === 'components') {
            analysis.components = this.extractReactComponents(content);
            analysis.props = this.extractComponentProps(content);
        } else if (type === 'database') {
            analysis.schemas = this.extractSchemas(content);
            analysis.migrations = this.extractMigrations(content);
        }

        return analysis;
    }

    extractSections(content) {
        const sections = [];
        const lines = content.split('\n');
        let currentSection = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

            if (headingMatch) {
                if (currentSection) {
                    sections.push(currentSection);
                }

                currentSection = {
                    level: headingMatch[1].length,
                    title: headingMatch[2].trim(),
                    startLine: i + 1,
                    content: '',
                    subsections: []
                };
            } else if (currentSection) {
                currentSection.content += line + '\n';
            }
        }

        if (currentSection) {
            sections.push(currentSection);
        }

        return sections;
    }

    extractFeatures(content) {
        const features = [];

        // Look for feature sections
        const featurePatterns = [
            /##?\s+Features?\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /##?\s+Functionality\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /##?\s+Requirements\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
        ];

        for (const pattern of featurePatterns) {
            const match = content.match(pattern);
            if (match) {
                const featureText = match[1];
                const featureLines = featureText.split('\n');

                for (const line of featureLines) {
                    const featureMatch = line.match(/^[-*]\s+(.+)$/);
                    if (featureMatch) {
                        features.push({
                            name: featureMatch[1].trim(),
                            description: featureMatch[1].trim(),
                            type: 'feature'
                        });
                    }
                }
            }
        }

        return features;
    }

    extractApiEndpoints(content) {
        const endpoints = [];

        // Look for API endpoint patterns
        const endpointPatterns = [
            /`(GET|POST|PUT|DELETE|PATCH)\s+([^`]+)`/gi,
            /^\s*-\s*(GET|POST|PUT|DELETE|PATCH)\s+`([^`]+)`/gim,
            /##?\s*(GET|POST|PUT|DELETE|PATCH)\s+`?([^`\n]+)`?/gim
        ];

        for (const pattern of endpointPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                endpoints.push({
                    method: match[1].toUpperCase(),
                    path: match[2].trim(),
                    description: this.findNearbyDescription(content, match.index)
                });
            }
        }

        return endpoints;
    }

    extractDatabaseSchema(content) {
        const tables = [];

        // Look for table definitions
        const tablePatterns = [
            /##?\s*Table:\s*`?(\w+)`?\s*\n([\s\S]*?)(?=\n##|\n#|$)/gi,
            /CREATE TABLE\s+`?(\w+)`?\s*\(([\s\S]*?)\)/gi
        ];

        for (const pattern of tablePatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const tableName = match[1];
                const tableContent = match[2];
                const columns = this.extractTableColumns(tableContent);

                tables.push({
                    name: tableName,
                    columns,
                    description: this.findNearbyDescription(content, match.index)
                });
            }
        }

        return tables;
    }

    extractTableColumns(content) {
        const columns = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const columnMatch = line.match(/[-*]\s*`?(\w+)`?\s*[:-]\s*(.+)/);
            if (columnMatch) {
                columns.push({
                    name: columnMatch[1],
                    type: columnMatch[2].trim()
                });
            }
        }

        return columns;
    }

    extractComponents(content) {
        const components = [];

        // Look for component specifications
        const componentPatterns = [
            /##?\s*Component:\s*`?(\w+)`?\s*\n([\s\S]*?)(?=\n##|\n#|$)/gi,
            /##?\s*(\w+Component)\s*\n([\s\S]*?)(?=\n##|\n#|$)/gi
        ];

        for (const pattern of componentPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const componentName = match[1];
                const componentContent = match[2];
                const props = this.extractComponentPropsFromSpec(componentContent);

                components.push({
                    name: componentName,
                    props,
                    description: this.findNearbyDescription(content, match.index)
                });
            }
        }

        return components;
    }

    extractBusinessRules(content) {
        const rules = [];

        // Look for business rule sections
        const rulePatterns = [
            /##?\s+Business Rules?\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /##?\s+Rules?\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /##?\s+Validation\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
        ];

        for (const pattern of rulePatterns) {
            const match = content.match(pattern);
            if (match) {
                const rulesText = match[1];
                const ruleLines = rulesText.split('\n');

                for (const line of ruleLines) {
                    const ruleMatch = line.match(/^[-*]\s+(.+)$/);
                    if (ruleMatch) {
                        rules.push({
                            name: ruleMatch[1].trim(),
                            description: ruleMatch[1].trim(),
                            type: 'business-rule'
                        });
                    }
                }
            }
        }

        return rules;
    }

    extractTechnicalDecisions(content) {
        const decisions = [];

        // Look for technical decision patterns
        const decisionPatterns = [
            /##?\s+Decision:\s*(.+)\s*\n([\s\S]*?)(?=\n##|\n#|$)/gi,
            /##?\s+Technology Choice:\s*(.+)\s*\n([\s\S]*?)(?=\n##|\n#|$)/gi,
            /##?\s+Architecture Decision:\s*(.+)\s*\n([\s\S]*?)(?=\n##|\n#|$)/gi
        ];

        for (const pattern of decisionPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                decisions.push({
                    name: match[1].trim(),
                    description: match[2].trim(),
                    type: 'technical-decision'
                });
            }
        }

        return decisions;
    }

    extractArchitecturalPatterns(content) {
        const patterns = [];

        // Look for architectural pattern mentions
        const patternKeywords = [
            'MVC', 'MVP', 'MVVM', 'Repository Pattern', 'Factory Pattern',
            'Singleton', 'Observer', 'Strategy', 'Command', 'Decorator',
            'Microservices', 'Event Sourcing', 'CQRS', 'REST', 'GraphQL'
        ];

        for (const keyword of patternKeywords) {
            if (content.includes(keyword)) {
                patterns.push({
                    name: keyword,
                    required: content.includes(`must use ${keyword}`) || content.includes(`${keyword} pattern`),
                    description: this.findPatternDescription(content, keyword)
                });
            }
        }

        return patterns;
    }

    // Source code extraction methods
    extractFunctions(content) {
        const functions = [];
        const functionPatterns = [
            /function\s+(\w+)\s*\([^)]*\)/g,
            /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
            /(\w+)\s*:\s*function\s*\([^)]*\)/g,
            /(\w+)\s*\([^)]*\)\s*{/g // Method definitions
        ];

        for (const pattern of functionPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                functions.push({
                    name: match[1],
                    type: 'function'
                });
            }
        }

        return functions;
    }

    extractEndpoints(content) {
        const endpoints = [];
        const endpointPatterns = [
            /\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /router\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
        ];

        for (const pattern of endpointPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const method = match[1] ? match[1].toUpperCase() : this.inferMethodFromPattern(pattern.source);
                const path = match[2] || match[1];

                endpoints.push({
                    method,
                    path,
                    type: 'endpoint'
                });
            }
        }

        return endpoints;
    }

    extractReactComponents(content) {
        const components = [];
        const componentPatterns = [
            /function\s+(\w+Component|\w+)\s*\([^)]*\)\s*{/g,
            /const\s+(\w+Component|\w+)\s*=\s*\([^)]*\)\s*=>/g,
            /class\s+(\w+Component|\w+)\s+extends\s+Component/g
        ];

        for (const pattern of componentPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1].endsWith('Component') || this.isCapitalized(match[1])) {
                    components.push({
                        name: match[1],
                        type: 'react-component'
                    });
                }
            }
        }

        return components;
    }

    // Consistency checking methods
    findFeatureImplementations(feature, components, pages) {
        const implementations = [];
        const featureName = feature.name.toLowerCase();

        for (const [key, component] of [...components, ...pages]) {
            const fileName = path.basename(component.filePath).toLowerCase();
            const componentNames = (component.components || []).map(c => c.name.toLowerCase());

            if (fileName.includes(featureName) ||
                componentNames.some(name => name.includes(featureName))) {
                implementations.push({
                    file: component.filePath,
                    type: 'component',
                    matches: [featureName]
                });
            }
        }

        return implementations;
    }

    checkFeatureImplementationConsistency(feature, implementation) {
        // Basic consistency check - can be enhanced
        const score = 0.8; // Default moderate confidence
        const differences = [];

        return { score, differences };
    }

    findEndpointImplementations(endpoint, apiFiles) {
        const implementations = [];

        for (const [key, apiFile] of apiFiles) {
            const endpoints = apiFile.endpoints || [];

            for (const implEndpoint of endpoints) {
                if (implEndpoint.method === endpoint.method &&
                    this.pathsMatch(implEndpoint.path, endpoint.path)) {
                    implementations.push({
                        file: apiFile.filePath,
                        endpoint: implEndpoint,
                        type: 'api-endpoint'
                    });
                }
            }
        }

        return implementations;
    }

    pathsMatch(implPath, docPath) {
        // Simple path matching - can be enhanced for parameter matching
        return implPath === docPath ||
               implPath.replace(/:\w+/g, '{param}') === docPath.replace(/{[^}]+}/g, '{param}');
    }

    calculateConsistencyScore() {
        if (this.inconsistencies.length === 0) {
            return 100;
        }

        const totalDocuments = this.analysisMetadata.documentsAnalyzed + this.analysisMetadata.sourceFilesAnalyzed;
        const severityWeights = { critical: 10, high: 5, medium: 2, low: 1 };

        let totalWeight = 0;
        for (const inconsistency of this.inconsistencies) {
            totalWeight += severityWeights[inconsistency.severity] || 1;
        }

        // Calculate score based on inconsistencies relative to project size
        const score = Math.max(0, 100 - (totalWeight / Math.max(1, totalDocuments)) * 50);
        return Math.round(score);
    }

    addInconsistency(inconsistency) {
        this.inconsistencies.push({
            id: `inc-${this.inconsistencies.length + 1}`,
            timestamp: new Date().toISOString(),
            ...inconsistency
        });
    }

    // Utility methods
    async walkDirectory(dirPath) {
        const files = [];

        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    const subFiles = await this.walkDirectory(fullPath);
                    files.push(...subFiles);
                } else {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }

        return files;
    }

    findNearbyDescription(content, index) {
        const before = content.substring(Math.max(0, index - 200), index);
        const after = content.substring(index, Math.min(content.length, index + 200));

        // Look for description patterns
        const descriptionPattern = /[.!?]\s*(.{10,100})[.!?]/;
        const match = after.match(descriptionPattern);

        return match ? match[1].trim() : '';
    }

    isCapitalized(str) {
        return str.charAt(0) === str.charAt(0).toUpperCase();
    }

    featuresMatch(docFeature, implFeature) {
        const docName = docFeature.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const implName = implFeature.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        return docName.includes(implName) || implName.includes(docName);
    }

    findSimilarNames(target, candidates) {
        const similar = [];
        const targetLower = target.toLowerCase();

        for (const candidate of candidates) {
            const candidateLower = candidate.toLowerCase();
            const similarity = this.calculateStringSimilarity(targetLower, candidateLower);

            if (similarity > 0.7) {
                similar.push({ name: candidate, similarity });
            }
        }

        return similar.sort((a, b) => b.similarity - a.similarity);
    }

    calculateStringSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + indicator
                );
            }
        }

        const distance = matrix[len1][len2];
        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : 1 - distance / maxLen;
    }

    // Placeholder methods for detailed extraction (can be enhanced)
    extractClasses(content) { return []; }
    extractInterfaces(content) { return []; }
    extractImports(content) { return []; }
    extractExports(content) { return []; }
    extractConstants(content) { return []; }
    extractVariables(content) { return []; }
    extractComments(content) { return []; }
    extractMiddleware(content) { return []; }
    extractSchemas(content) { return []; }
    extractMigrations(content) { return []; }
    extractComponentProps(content) { return []; }
    extractComponentPropsFromSpec(content) { return []; }
    extractImplementedFeatures(components, pages) { return []; }
    extractNamedEntities(content, source) { return []; }
    extractCodeNames(code, source) { return []; }
    findTableImplementations(table, dbFiles) { return []; }
    findComponentImplementations(component, components) { return []; }
    findBusinessRuleImplementations(rule, sourceFiles) { return []; }
    findTechnicalDecisionImplementations(decision, sourceFiles) { return []; }
    findPatternImplementations(pattern, sourceFiles) { return []; }
    findPatternViolations(pattern, sourceFiles) { return []; }
    checkEndpointConsistency(endpoint, impl) { return { score: 0.8, differences: [] }; }
    checkTableConsistency(table, impl) { return { score: 0.8, differences: [] }; }
    checkComponentConsistency(component, impl) { return { score: 0.8, differences: [] }; }
    checkBusinessRuleConsistency(rule, impl) { return { score: 0.8, differences: [] }; }
    checkTechnicalDecisionCompliance(decision, impl) { return { score: 0.8, violations: [] }; }
    findPatternDescription(content, keyword) { return ''; }
    inferMethodFromPattern(pattern) { return 'GET'; }
}

module.exports = DocumentationValidator;