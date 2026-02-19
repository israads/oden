/**
 * Accessibility Specialized Agent
 *
 * Validates semantic HTML, ARIA labels, color contrast, keyboard navigation,
 * screen reader compatibility, and WCAG 2.1 compliance.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const BaseSpecializedAgent = require('./base-agent');
const fs = require('fs').promises;
const path = require('path');

class AccessibilityAgent extends BaseSpecializedAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'accessibility-agent',
            description: 'WCAG 2.1 compliance checker and accessibility analyzer'
        });

        // WCAG 2.1 patterns to detect accessibility issues
        this.accessibilityPatterns = {
            // WCAG 1.1.1 - Non-text Content
            images: [
                { pattern: /<img(?![^>]*alt=)/i, severity: 'high', wcag: '1.1.1', message: 'Image missing alt attribute' },
                { pattern: /<img[^>]*alt=""\s*[^>]*>/i, severity: 'medium', wcag: '1.1.1', message: 'Image with empty alt - should be descriptive or null' },
                { pattern: /<img[^>]*alt="image"/i, severity: 'medium', wcag: '1.1.1', message: 'Generic alt text "image" not descriptive' },
                { pattern: /<svg(?![^>]*aria-label|[^>]*role="img")/i, severity: 'medium', wcag: '1.1.1', message: 'SVG missing aria-label or role="img"' }
            ],

            // WCAG 1.3.1 - Info and Relationships (Semantic HTML)
            semantics: [
                { pattern: /<div[^>]*onclick/i, severity: 'high', wcag: '1.3.1', message: 'Clickable div should be button or link' },
                { pattern: /<span[^>]*onclick/i, severity: 'high', wcag: '1.3.1', message: 'Clickable span should be button or link' },
                { pattern: /<div[^>]*role="button"(?![^>]*tabindex)/i, severity: 'medium', wcag: '1.3.1', message: 'Button role without tabindex for keyboard access' },
                { pattern: /<h[1-6][^>]*><h[1-6]/i, severity: 'medium', wcag: '1.3.1', message: 'Skipped heading level - maintain hierarchy' },
                { pattern: /<table(?![^>]*role|[^>]*summary)/i, severity: 'low', wcag: '1.3.1', message: 'Table should have summary or role for context' }
            ],

            // WCAG 1.3.4 - Orientation & 1.4.10 - Reflow
            responsive: [
                { pattern: /orientation:\s*portrait/i, severity: 'medium', wcag: '1.3.4', message: 'Avoid locking orientation to portrait only' },
                { pattern: /orientation:\s*landscape/i, severity: 'medium', wcag: '1.3.4', message: 'Avoid locking orientation to landscape only' },
                { pattern: /overflow:\s*hidden/i, severity: 'low', wcag: '1.4.10', message: 'Hidden overflow may prevent 400% zoom accessibility' }
            ],

            // WCAG 1.4.1 - Use of Color & 1.4.3 - Contrast
            colorContrast: [
                { pattern: /color:\s*#[a-f0-9]{3,6}/i, severity: 'low', wcag: '1.4.3', message: 'Text color should meet contrast requirements' },
                { pattern: /background-color:\s*#[a-f0-9]{3,6}/i, severity: 'low', wcag: '1.4.3', message: 'Background color should ensure adequate contrast' },
                { pattern: /color:\s*red[^-]/i, severity: 'medium', wcag: '1.4.1', message: 'Avoid using color alone to convey information' }
            ],

            // WCAG 2.1.1 - Keyboard Access
            keyboard: [
                { pattern: /<[^>]*onmousedown/i, severity: 'medium', wcag: '2.1.1', message: 'Mouse event should have keyboard equivalent' },
                { pattern: /<[^>]*onmouseover/i, severity: 'medium', wcag: '2.1.1', message: 'Mouseover should have keyboard/focus equivalent' },
                { pattern: /<button[^>]*disabled(?![^>]*aria-disabled)/i, severity: 'low', wcag: '2.1.1', message: 'Disabled button should use aria-disabled for better screen reader support' },
                { pattern: /tabindex="[^0-]"/i, severity: 'high', wcag: '2.1.1', message: 'Avoid positive tabindex values - use 0 or -1' }
            ],

            // WCAG 2.1.2 - No Keyboard Trap
            keyboardTrap: [
                { pattern: /event\.preventDefault\(\).*keydown/i, severity: 'medium', wcag: '2.1.2', message: 'Preventing keydown events may create keyboard traps' },
                { pattern: /return false.*keydown/i, severity: 'medium', wcag: '2.1.2', message: 'Blocking keydown events may trap keyboard users' }
            ],

            // WCAG 2.4.1 - Bypass Blocks
            navigation: [
                { pattern: /<nav(?![^>]*aria-label)/i, severity: 'medium', wcag: '2.4.1', message: 'Navigation should have aria-label for identification' },
                { pattern: /<main(?![^>]*role="main"|[^>]*aria-label)/i, severity: 'low', wcag: '2.4.1', message: 'Main content area should be clearly identified' },
                { pattern: /<header(?![^>]*role="banner"|[^>]*aria-label)/i, severity: 'low', wcag: '2.4.1', message: 'Header should have role="banner" or aria-label' }
            ],

            // WCAG 2.4.3 - Focus Order & 2.4.7 - Focus Visible
            focus: [
                { pattern: /outline:\s*none|outline:\s*0/i, severity: 'high', wcag: '2.4.7', message: 'Removing outline breaks keyboard focus visibility' },
                { pattern: /:focus\s*\{[^}]*outline:\s*none/i, severity: 'high', wcag: '2.4.7', message: 'Focus styles should be visible for keyboard users' },
                { pattern: /tabindex="-1"[^>]*>/i, severity: 'low', wcag: '2.4.3', message: 'tabindex="-1" removes element from tab order' }
            ],

            // WCAG 3.2.1 - On Focus & 3.2.2 - On Input
            predictable: [
                { pattern: /onfocus.*window\.open/i, severity: 'high', wcag: '3.2.1', message: 'Opening new windows on focus is disorienting' },
                { pattern: /onchange.*submit/i, severity: 'medium', wcag: '3.2.2', message: 'Auto-submitting on input change can be disorienting' },
                { pattern: /onblur.*redirect/i, severity: 'medium', wcag: '3.2.1', message: 'Redirecting on blur can be disorienting' }
            ],

            // WCAG 4.1.1 - Parsing & 4.1.2 - Name, Role, Value
            markup: [
                { pattern: /<[a-z]+[^>]*id="[^"]*"[^>]*id="/i, severity: 'high', wcag: '4.1.1', message: 'Duplicate ID attributes break screen readers' },
                { pattern: /<input(?![^>]*aria-label|[^>]*id.*<label[^>]*for=)/i, severity: 'high', wcag: '4.1.2', message: 'Input missing label or aria-label' },
                { pattern: /<button[^>]*aria-label=""/i, severity: 'medium', wcag: '4.1.2', message: 'Button with empty aria-label' },
                { pattern: /<[^>]*role="button"(?![^>]*aria-label)/i, severity: 'medium', wcag: '4.1.2', message: 'Button role should have accessible name' }
            ]
        };

        // Color contrast ratios (simplified - would need proper color analysis in real implementation)
        this.colorCombinations = [
            { bg: '#ffffff', fg: '#666666', ratio: 4.54, level: 'AA-normal', status: 'pass' },
            { bg: '#000000', fg: '#777777', ratio: 5.74, level: 'AA-normal', status: 'pass' },
            { bg: '#ffffff', fg: '#999999', ratio: 2.85, level: 'AA-normal', status: 'fail' },
            { bg: '#cccccc', fg: '#666666', ratio: 2.05, level: 'AA-normal', status: 'fail' }
        ];

        // ARIA roles and their required/optional attributes
        this.ariaRules = {
            button: { required: [], optional: ['aria-pressed', 'aria-expanded', 'aria-describedby'] },
            link: { required: [], optional: ['aria-describedby', 'aria-label'] },
            textbox: { required: [], optional: ['aria-label', 'aria-describedby', 'aria-required', 'aria-invalid'] },
            checkbox: { required: ['aria-checked'], optional: ['aria-describedby', 'aria-label'] },
            radio: { required: ['aria-checked'], optional: ['aria-describedby', 'aria-label'] },
            tab: { required: ['aria-selected'], optional: ['aria-controls', 'aria-describedby'] },
            tabpanel: { required: [], optional: ['aria-labelledby', 'aria-describedby'] },
            menu: { required: [], optional: ['aria-label', 'aria-labelledby'] },
            menuitem: { required: [], optional: ['aria-disabled', 'aria-expanded'] }
        };
    }

    getAgentType() {
        return 'accessibility';
    }

    getRequiredTools() {
        return ['node']; // Basic Node.js for file processing
    }

    /**
     * Perform comprehensive accessibility analysis
     */
    async performAnalysis(projectInfo) {
        const analyses = [
            this.scanForAccessibilityIssues(projectInfo),
            this.analyzeAriaImplementation(projectInfo),
            this.checkKeyboardNavigation(projectInfo),
            this.validateSemanticStructure(projectInfo),
            this.analyzeColorContrast(projectInfo),
            this.checkFormAccessibility(projectInfo),
            this.validateFocusManagement(projectInfo),
            this.analyzeScreenReaderSupport(projectInfo)
        ];

        const results = await Promise.allSettled(analyses);

        // Process results and handle any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Accessibility analysis step ${index + 1} failed:`, result.reason);
            }
        });

        return this.results;
    }

    /**
     * Scan files for accessibility patterns
     */
    async scanForAccessibilityIssues(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);
        const jsxFiles = await this.getJsxFiles(projectInfo.root);
        const cssFiles = await this.getCssFiles(projectInfo.root);

        const allFiles = [...htmlFiles, ...jsxFiles];

        for (const file of allFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check each accessibility pattern category
                for (const [category, patterns] of Object.entries(this.accessibilityPatterns)) {
                    for (const patternInfo of patterns) {
                        await this.checkAccessibilityPattern(file, content, lines, category, patternInfo, projectInfo);
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file}:`, error.message);
            }
        }

        // Analyze CSS files separately
        for (const file of cssFiles) {
            await this.analyzeCssAccessibility(file, projectInfo);
        }
    }

    /**
     * Analyze ARIA implementation
     */
    async analyzeAriaImplementation(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);
        const jsxFiles = await this.getJsxFiles(projectInfo.root);

        for (const file of [...htmlFiles, ...jsxFiles]) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check for ARIA role usage
                const ariaRolePattern = /role="([^"]+)"/gi;
                let match;

                while ((match = ariaRolePattern.exec(content)) !== null) {
                    const roleName = match[1];
                    const lineNumber = this.findLineNumber(lines, match[0]);

                    if (this.ariaRules[roleName]) {
                        const rule = this.ariaRules[roleName];

                        // Check for required attributes
                        for (const requiredAttr of rule.required) {
                            const attrPattern = new RegExp(`${requiredAttr}=`);
                            if (!attrPattern.test(content)) {
                                this.addFinding(
                                    'high',
                                    'aria-implementation',
                                    `ARIA role "${roleName}" missing required attribute "${requiredAttr}"`,
                                    {
                                        file: path.relative(projectInfo.root, file),
                                        line: lineNumber,
                                        codeSnippet: lines[lineNumber - 1]?.trim(),
                                        recommendation: `Add ${requiredAttr} attribute to ${roleName} element`,
                                        fixSuggestion: `<element role="${roleName}" ${requiredAttr}="value">`,
                                        references: [
                                            `https://www.w3.org/WAI/ARIA/apg/patterns/`,
                                            `https://www.w3.org/TR/wai-aria-1.2/#${roleName}`
                                        ],
                                        confidence: 0.9,
                                        impact: 'high',
                                        effort: 'low',
                                        tags: ['aria', 'roles', 'required-attributes', 'wcag-4.1.2']
                                    }
                                );
                            }
                        }
                    } else if (!this.isStandardHtmlRole(roleName)) {
                        // Unknown or potentially invalid ARIA role
                        this.addFinding(
                            'medium',
                            'aria-implementation',
                            `Unknown or potentially invalid ARIA role: "${roleName}"`,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: lineNumber,
                                codeSnippet: lines[lineNumber - 1]?.trim(),
                                recommendation: 'Verify role name against ARIA specification',
                                references: ['https://www.w3.org/TR/wai-aria-1.2/#role_definitions'],
                                confidence: 0.7,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['aria', 'roles', 'validation']
                            }
                        );
                    }
                }

                // Check for aria-labelledby references
                const ariaLabelledByPattern = /aria-labelledby="([^"]+)"/gi;
                while ((match = ariaLabelledByPattern.exec(content)) !== null) {
                    const labelIds = match[1].split(' ');
                    const lineNumber = this.findLineNumber(lines, match[0]);

                    for (const labelId of labelIds) {
                        const idPattern = new RegExp(`id="${labelId}"`);
                        if (!idPattern.test(content)) {
                            this.addFinding(
                                'high',
                                'aria-references',
                                `aria-labelledby references non-existent ID: "${labelId}"`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    line: lineNumber,
                                    recommendation: `Ensure element with id="${labelId}" exists`,
                                    confidence: 0.9,
                                    impact: 'high',
                                    effort: 'low',
                                    tags: ['aria', 'references', 'broken-links', 'wcag-4.1.2']
                                }
                            );
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze ARIA implementation in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check keyboard navigation implementation
     */
    async checkKeyboardNavigation(projectInfo) {
        const jsFiles = await this.getJavaScriptFiles(projectInfo.root);

        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check for keyboard event handlers
                const keyboardPatterns = [
                    {
                        pattern: /addEventListener\(['"`]keydown['"`]/,
                        good: true,
                        message: 'Keyboard event listener found - ensure proper handling'
                    },
                    {
                        pattern: /onKeyDown=/,
                        good: true,
                        message: 'React onKeyDown handler found - ensure accessibility'
                    },
                    {
                        pattern: /\.focus\(\)/,
                        good: true,
                        message: 'Focus management detected - ensure proper implementation'
                    },
                    {
                        pattern: /event\.preventDefault\(\).*key(down|up|press)/,
                        good: false,
                        message: 'Preventing keyboard events - may break accessibility'
                    }
                ];

                for (const keyPattern of keyboardPatterns) {
                    const matches = [...content.matchAll(new RegExp(keyPattern.pattern, 'gi'))];
                    for (const match of matches) {
                        const lineNumber = this.findLineNumber(lines, match[0]);

                        this.addFinding(
                            keyPattern.good ? 'info' : 'medium',
                            'keyboard-navigation',
                            keyPattern.message,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: lineNumber,
                                codeSnippet: lines[lineNumber - 1]?.trim(),
                                recommendation: keyPattern.good
                                    ? 'Ensure keyboard navigation follows WCAG guidelines'
                                    : 'Review keyboard event handling to avoid breaking accessibility',
                                confidence: 0.6,
                                impact: keyPattern.good ? 'low' : 'medium',
                                effort: 'medium',
                                tags: ['keyboard', 'navigation', 'wcag-2.1.1']
                            }
                        );
                    }
                }

                // Check for proper Tab order management
                const tabIndexPattern = /tabindex="?(-?\d+)"?/gi;
                let tabMatch;
                while ((tabMatch = tabIndexPattern.exec(content)) !== null) {
                    const tabIndex = parseInt(tabMatch[1]);
                    const lineNumber = this.findLineNumber(lines, tabMatch[0]);

                    if (tabIndex > 0) {
                        this.addFinding(
                            'high',
                            'tab-order',
                            `Positive tabindex (${tabIndex}) breaks natural tab order`,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: lineNumber,
                                recommendation: 'Use tabindex="0" or remove tabindex to maintain natural order',
                                fixSuggestion: 'tabindex="0" or no tabindex attribute',
                                confidence: 0.9,
                                impact: 'high',
                                effort: 'low',
                                tags: ['tab-order', 'keyboard', 'wcag-2.4.3']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze keyboard navigation in ${file}:`, error.message);
            }
        }
    }

    /**
     * Validate semantic HTML structure
     */
    async validateSemanticStructure(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);
        const jsxFiles = await this.getJsxFiles(projectInfo.root);

        for (const file of [...htmlFiles, ...jsxFiles]) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check heading hierarchy
                const headingPattern = /<h([1-6])[^>]*>/gi;
                const headings = [];
                let match;

                while ((match = headingPattern.exec(content)) !== null) {
                    const level = parseInt(match[1]);
                    const lineNumber = this.findLineNumber(lines, match[0]);
                    headings.push({ level, line: lineNumber, match: match[0] });
                }

                // Validate heading hierarchy
                for (let i = 1; i < headings.length; i++) {
                    const current = headings[i];
                    const previous = headings[i - 1];

                    if (current.level > previous.level + 1) {
                        this.addFinding(
                            'medium',
                            'heading-hierarchy',
                            `Heading level skipped: h${previous.level} to h${current.level}`,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: current.line,
                                recommendation: 'Maintain sequential heading hierarchy for screen readers',
                                fixSuggestion: `Use h${previous.level + 1} instead of h${current.level}`,
                                references: ['https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html'],
                                confidence: 0.8,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['headings', 'hierarchy', 'semantic-html', 'wcag-1.3.1']
                            }
                        );
                    }
                }

                // Check for semantic HTML usage
                const semanticElements = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
                const hasSemanticElements = semanticElements.some(element =>
                    new RegExp(`<${element}[^>]*>`, 'i').test(content)
                );

                if (!hasSemanticElements && content.includes('<div')) {
                    this.addFinding(
                        'medium',
                        'semantic-html',
                        'Consider using semantic HTML elements instead of generic div elements',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Use header, nav, main, article, section, aside, footer for better structure',
                            fixSuggestion: 'Replace divs with appropriate semantic elements',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['semantic-html', 'structure', 'wcag-1.3.1']
                        }
                    );
                }

                // Check for landmark roles
                const landmarks = ['banner', 'navigation', 'main', 'contentinfo', 'search', 'complementary'];
                const hasLandmarks = landmarks.some(landmark =>
                    content.includes(`role="${landmark}"`) ||
                    semanticElements.some(el => content.includes(`<${el}`))
                );

                if (!hasLandmarks && content.length > 1000) { // Only for substantial content
                    this.addFinding(
                        'medium',
                        'landmarks',
                        'Page lacks landmark roles for navigation assistance',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add landmark roles or use semantic HTML elements',
                            fixSuggestion: 'Use <main>, <nav>, <header>, <footer> or appropriate role attributes',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['landmarks', 'navigation', 'wcag-2.4.1']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not validate semantic structure in ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze color contrast (basic analysis)
     */
    async analyzeColorContrast(projectInfo) {
        const cssFiles = await this.getCssFiles(projectInfo.root);

        for (const file of cssFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Look for potentially problematic color combinations
                const colorPatterns = [
                    { pattern: /color:\s*#[a-f0-9]{3,6}/gi, type: 'text color' },
                    { pattern: /background-color:\s*#[a-f0-9]{3,6}/gi, type: 'background color' },
                    { pattern: /background:\s*#[a-f0-9]{3,6}/gi, type: 'background' }
                ];

                const colors = [];
                for (const colorPattern of colorPatterns) {
                    let match;
                    while ((match = colorPattern.pattern.exec(content)) !== null) {
                        colors.push({
                            color: match[0],
                            type: colorPattern.type,
                            line: this.findLineNumber(content.split('\n'), match[0])
                        });
                    }
                }

                // Check for known problematic combinations
                const problematicCombinations = [
                    { text: 'red', bg: 'green', issue: 'Red-green color blindness' },
                    { text: 'yellow', bg: 'white', issue: 'Low contrast' },
                    { text: 'light gray', bg: 'white', issue: 'Low contrast' },
                    { text: 'blue', bg: 'purple', issue: 'Difficult to distinguish' }
                ];

                // Simple heuristic for contrast issues
                if (colors.length > 0) {
                    this.addFinding(
                        'low',
                        'color-contrast',
                        `${colors.length} color definitions found - verify contrast ratios meet WCAG AA standards`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Use contrast checking tools to verify 4.5:1 ratio for normal text, 3:1 for large text',
                            fixSuggestion: 'Test with WebAIM Contrast Checker or similar tools',
                            references: [
                                'https://webaim.org/resources/contrastchecker/',
                                'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
                            ],
                            confidence: 0.5,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['color-contrast', 'wcag-1.4.3'],
                            metadata: { colorCount: colors.length }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze color contrast in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check form accessibility
     */
    async checkFormAccessibility(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);
        const jsxFiles = await this.getJsxFiles(projectInfo.root);

        for (const file of [...htmlFiles, ...jsxFiles]) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check for form elements without proper labels
                const formElements = [
                    'input[type="text"]',
                    'input[type="email"]',
                    'input[type="password"]',
                    'input[type="number"]',
                    'textarea',
                    'select'
                ];

                for (const element of formElements) {
                    const elementPattern = new RegExp(`<${element.split('[')[0]}[^>]*>`, 'gi');
                    let match;

                    while ((match = elementPattern.exec(content)) !== null) {
                        const elementMatch = match[0];
                        const lineNumber = this.findLineNumber(lines, elementMatch);

                        // Check for id/label association
                        const hasId = /id="([^"]+)"/.test(elementMatch);
                        const hasAriaLabel = /aria-label="([^"]+)"/.test(elementMatch);
                        const hasAriaLabelledBy = /aria-labelledby="([^"]+)"/.test(elementMatch);

                        let hasAssociatedLabel = false;
                        if (hasId) {
                            const idMatch = elementMatch.match(/id="([^"]+)"/);
                            if (idMatch) {
                                const labelPattern = new RegExp(`<label[^>]*for="${idMatch[1]}"`, 'i');
                                hasAssociatedLabel = labelPattern.test(content);
                            }
                        }

                        if (!hasAssociatedLabel && !hasAriaLabel && !hasAriaLabelledBy) {
                            this.addFinding(
                                'high',
                                'form-accessibility',
                                `Form ${element} missing accessible label`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    line: lineNumber,
                                    codeSnippet: elementMatch,
                                    recommendation: 'Add label element, aria-label, or aria-labelledby',
                                    fixSuggestion: '<label for="input-id">Label text</label><input id="input-id" ...>',
                                    references: ['https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html'],
                                    confidence: 0.9,
                                    impact: 'high',
                                    effort: 'low',
                                    tags: ['forms', 'labels', 'wcag-3.3.2', 'wcag-4.1.2']
                                }
                            );
                        }
                    }
                }

                // Check for form validation messages
                const hasValidation = /aria-invalid|aria-describedby.*error|class=".*error.*"/i.test(content);
                const hasFormElements = formElements.some(el =>
                    new RegExp(`<${el.split('[')[0]}`, 'i').test(content)
                );

                if (hasFormElements && !hasValidation) {
                    this.addFinding(
                        'medium',
                        'form-validation',
                        'Form lacks accessible error/validation messaging',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Implement aria-invalid and aria-describedby for form validation',
                            fixSuggestion: '<input aria-invalid="true" aria-describedby="error-msg"><span id="error-msg">Error message</span>',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['forms', 'validation', 'error-handling', 'wcag-3.3.1']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not check form accessibility in ${file}:`, error.message);
            }
        }
    }

    /**
     * Validate focus management
     */
    async validateFocusManagement(projectInfo) {
        const jsFiles = await this.getJavaScriptFiles(projectInfo.root);
        const cssFiles = await this.getCssFiles(projectInfo.root);

        // Check CSS for focus visibility
        for (const file of cssFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check for outline removal without alternatives
                const outlineRemovalPattern = /(:focus[^{]*\{[^}]*outline:\s*(none|0)[^}]*\})|(\*[^{]*\{[^}]*outline:\s*(none|0))/gi;
                let match;

                while ((match = outlineRemovalPattern.exec(content)) !== null) {
                    const lineNumber = this.findLineNumber(content.split('\n'), match[0]);

                    // Check if there's an alternative focus indicator
                    const hasAlternative = /border|box-shadow|background/.test(match[0]);

                    if (!hasAlternative) {
                        this.addFinding(
                            'high',
                            'focus-visibility',
                            'Focus outline removed without providing alternative visual indicator',
                            {
                                file: path.relative(projectInfo.root, file),
                                line: lineNumber,
                                codeSnippet: match[0].trim(),
                                recommendation: 'Provide alternative focus indicator like border or box-shadow',
                                fixSuggestion: ':focus { outline: none; box-shadow: 0 0 0 2px #007acc; }',
                                references: ['https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html'],
                                confidence: 0.8,
                                impact: 'high',
                                effort: 'low',
                                tags: ['focus', 'visibility', 'keyboard-navigation', 'wcag-2.4.7']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not validate focus management in ${file}:`, error.message);
            }
        }

        // Check JavaScript for programmatic focus management
        for (const file of jsFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Look for focus management patterns
                const focusPatterns = [
                    { pattern: /\.focus\(\)/, good: true, message: 'Programmatic focus management detected' },
                    { pattern: /autoFocus|autofocus/i, good: false, message: 'Auto-focus may be problematic for screen readers' },
                    { pattern: /focus.*trap|trap.*focus/i, good: true, message: 'Focus trap implementation detected' }
                ];

                for (const focusPattern of focusPatterns) {
                    if (focusPattern.pattern.test(content)) {
                        this.addFinding(
                            focusPattern.good ? 'info' : 'medium',
                            'focus-management',
                            focusPattern.message,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: focusPattern.good
                                    ? 'Ensure focus management follows accessibility best practices'
                                    : 'Review auto-focus usage for accessibility impact',
                                confidence: 0.6,
                                impact: focusPattern.good ? 'low' : 'medium',
                                effort: 'medium',
                                tags: ['focus', 'javascript', 'wcag-2.4.3']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not validate focus management in ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze screen reader support
     */
    async analyzeScreenReaderSupport(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);
        const jsxFiles = await this.getJsxFiles(projectInfo.root);

        for (const file of [...htmlFiles, ...jsxFiles]) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check for screen reader specific attributes
                const srAttributes = [
                    'aria-label',
                    'aria-labelledby',
                    'aria-describedby',
                    'aria-hidden',
                    'sr-only',
                    'visually-hidden'
                ];

                const srSupport = srAttributes.filter(attr =>
                    content.includes(attr)
                ).length;

                // Check for live regions
                const hasLiveRegions = /aria-live|role="(status|alert|log)"/i.test(content);

                // Check for skip links
                const hasSkipLinks = /skip.*link|skip.*nav|skip.*content/i.test(content);

                if (content.length > 2000) { // Only for substantial content
                    if (srSupport === 0) {
                        this.addFinding(
                            'medium',
                            'screen-reader-support',
                            'Page lacks ARIA attributes for screen reader support',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Add appropriate ARIA labels and descriptions',
                                fixSuggestion: 'Use aria-label, aria-labelledby, and aria-describedby where appropriate',
                                confidence: 0.6,
                                impact: 'medium',
                                effort: 'medium',
                                tags: ['screen-reader', 'aria', 'wcag-4.1.2']
                            }
                        );
                    }

                    if (!hasSkipLinks && content.includes('<nav')) {
                        this.addFinding(
                            'medium',
                            'skip-links',
                            'Consider adding skip links for keyboard navigation',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Add "Skip to main content" link at the beginning of the page',
                                fixSuggestion: '<a href="#main-content" class="sr-only sr-only-focusable">Skip to main content</a>',
                                confidence: 0.5,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['skip-links', 'navigation', 'wcag-2.4.1']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze screen reader support in ${file}:`, error.message);
            }
        }
    }

    /**
     * Helper methods
     */

    async checkAccessibilityPattern(file, content, lines, category, patternInfo, projectInfo) {
        const matches = [...content.matchAll(new RegExp(patternInfo.pattern, 'g'))];

        for (const match of matches) {
            const lineNumber = this.findLineNumber(lines, match[0]);
            const line = lines[lineNumber - 1] || '';

            this.addFinding(
                patternInfo.severity,
                category,
                patternInfo.message,
                {
                    file: path.relative(projectInfo.root, file),
                    line: lineNumber,
                    codeSnippet: line.trim(),
                    recommendation: this.getRecommendationForPattern(category, patternInfo),
                    fixSuggestion: this.getFixSuggestion(category, patternInfo),
                    references: this.getWcagReferences(patternInfo.wcag),
                    confidence: 0.8,
                    impact: patternInfo.severity,
                    effort: this.getEffortEstimate(category),
                    tags: [category, 'wcag-pattern', `wcag-${patternInfo.wcag}`]
                }
            );
        }
    }

    async analyzeCssAccessibility(file, projectInfo) {
        try {
            const content = await fs.readFile(file, 'utf8');

            // Check for accessibility-friendly CSS patterns
            const accessiblePatterns = [
                { pattern: /@media\s+\(prefers-reduced-motion/i, good: true, message: 'Respects user motion preferences' },
                { pattern: /@media\s+\(prefers-color-scheme/i, good: true, message: 'Supports dark/light mode preferences' },
                { pattern: /font-size:\s*\d+px/i, good: false, message: 'Fixed pixel font sizes may not scale well' },
                { pattern: /position:\s*fixed.*z-index/i, good: false, message: 'Fixed positioning may interfere with zoom/magnification' }
            ];

            for (const pattern of accessiblePatterns) {
                if (pattern.pattern.test(content)) {
                    this.addFinding(
                        pattern.good ? 'info' : 'low',
                        'css-accessibility',
                        pattern.message,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: pattern.good
                                ? 'Great accessibility feature implemented'
                                : 'Consider more accessible alternatives',
                            confidence: 0.6,
                            impact: 'low',
                            effort: 'low',
                            tags: ['css', 'accessibility', 'user-preferences']
                        }
                    );
                }
            }
        } catch (error) {
            console.warn(`Could not analyze CSS accessibility in ${file}:`, error.message);
        }
    }

    async getHtmlFiles(rootDir) {
        return this.getFilesByExtension(rootDir, ['.html', '.htm']);
    }

    async getJsxFiles(rootDir) {
        return this.getFilesByExtension(rootDir, ['.jsx', '.tsx']);
    }

    async getCssFiles(rootDir) {
        return this.getFilesByExtension(rootDir, ['.css', '.scss', '.sass', '.less']);
    }

    async getJavaScriptFiles(rootDir) {
        return this.getFilesByExtension(rootDir, ['.js', '.jsx', '.ts', '.tsx']);
    }

    async getFilesByExtension(rootDir, extensions) {
        const files = [];

        async function walkDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
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

    findLineNumber(lines, searchText) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }

    isStandardHtmlRole(roleName) {
        const standardRoles = [
            'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell',
            'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
            'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form',
            'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
            'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
            'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option',
            'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
            'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
            'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
            'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
            'treegrid', 'treeitem'
        ];

        return standardRoles.includes(roleName.toLowerCase());
    }

    getRecommendationForPattern(category, patternInfo) {
        const recommendations = {
            images: 'Provide descriptive alt text for all images',
            semantics: 'Use proper semantic HTML elements and roles',
            responsive: 'Ensure content works across all orientations and zoom levels',
            colorContrast: 'Verify color combinations meet WCAG contrast requirements',
            keyboard: 'Ensure all interactive elements are keyboard accessible',
            keyboardTrap: 'Avoid trapping keyboard users in specific elements',
            navigation: 'Provide clear navigation structure with landmarks',
            focus: 'Ensure focus indicators are visible and logical',
            predictable: 'Avoid unexpected context changes',
            markup: 'Use valid, semantic markup with proper relationships'
        };

        return recommendations[category] || 'Address this accessibility concern according to WCAG guidelines';
    }

    getFixSuggestion(category, patternInfo) {
        const suggestions = {
            images: 'Add descriptive alt attribute: <img src="..." alt="Description of image">',
            semantics: 'Use semantic elements: <button> instead of <div onclick>',
            keyboard: 'Add keyboard event handlers alongside mouse events',
            focus: 'Provide visible focus indicators with CSS :focus styles',
            markup: 'Ensure proper HTML structure and unique IDs'
        };

        return suggestions[category] || 'Follow WCAG guidelines for this accessibility issue';
    }

    getWcagReferences(wcagCode) {
        const baseUrl = 'https://www.w3.org/WAI/WCAG21/Understanding/';
        const references = [
            `${baseUrl}${wcagCode.replace('.', '-')}.html`,
            'https://www.w3.org/WAI/WCAG21/quickref/',
            'https://webaim.org/standards/wcag/checklist'
        ];

        return references;
    }

    getEffortEstimate(category) {
        const efforts = {
            images: 'low',
            semantics: 'medium',
            keyboard: 'medium',
            focus: 'low',
            colorContrast: 'low',
            markup: 'low'
        };

        return efforts[category] || 'medium';
    }

    /**
     * Get general accessibility recommendations
     */
    async getGeneralRecommendations() {
        const recommendations = [
            {
                priority: 'high',
                category: 'general',
                title: 'Implement Automated Accessibility Testing',
                description: 'Add tools like axe-core or Pa11y to your testing pipeline',
                action: 'npm install --save-dev @axe-core/react or similar',
                estimated_effort: 'medium',
                impact: 'high'
            },
            {
                priority: 'high',
                category: 'general',
                title: 'Perform Manual Accessibility Testing',
                description: 'Test with keyboard navigation and screen readers',
                action: 'Test with NVDA, JAWS, or VoiceOver regularly',
                estimated_effort: 'medium',
                impact: 'high'
            },
            {
                priority: 'medium',
                category: 'general',
                title: 'Create Accessibility Style Guide',
                description: 'Document accessibility patterns and components',
                action: 'Create documentation for accessible component usage',
                estimated_effort: 'high',
                impact: 'medium'
            }
        ];

        return recommendations;
    }

    validateProject(projectInfo) {
        // Accessibility agent works best with web projects
        return projectInfo && projectInfo.root &&
               (projectInfo.type === 'web' ||
                projectInfo.framework === 'react' ||
                projectInfo.framework === 'nextjs');
    }
}

module.exports = AccessibilityAgent;