/**
 * Professional PDF Generator for Oden Documentation
 *
 * Converts markdown documentation to high-quality PDFs with:
 * - Professional templates and branding
 * - Syntax highlighting for code blocks
 * - Table of contents generation
 * - Cross-references and links
 */

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const { MarkdownParser } = require('./processors/markdown-parser');
const { SyntaxHighlighter } = require('./processors/syntax-highlighter');

class PDFGenerator {
    constructor(options = {}) {
        this.options = {
            headless: true,
            timeout: 30000,
            ...options
        };
        this.browser = null;
        this.page = null;
    }

    /**
     * Initialize the PDF generator
     */
    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: this.options.headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security'
                ]
            });
            this.page = await this.browser.newPage();

            // Set viewport for consistent rendering
            await this.page.setViewport({
                width: 1200,
                height: 1600,
                deviceScaleFactor: 2
            });

        } catch (error) {
            throw new Error(`Failed to initialize PDF generator: ${error.message}`);
        }
    }

    /**
     * Generate PDF from markdown content
     *
     * @param {Object} config - Generation configuration
     * @param {string} config.content - Markdown content or file path
     * @param {string} config.template - Template name (professional, technical, executive)
     * @param {string} config.output - Output PDF file path
     * @param {Object} config.branding - Brand customization options
     */
    async generatePDF(config) {
        if (!this.browser) {
            await this.initialize();
        }

        try {
            // Parse and process markdown content
            const markdownParser = new MarkdownParser();
            const syntaxHighlighter = new SyntaxHighlighter();

            let markdownContent;
            if (await fs.pathExists(config.content)) {
                markdownContent = await fs.readFile(config.content, 'utf8');
            } else {
                markdownContent = config.content;
            }

            // Process markdown with enhanced features
            const processedContent = await markdownParser.process(markdownContent, {
                generateTOC: true,
                processLinks: true,
                optimizeImages: true
            });

            // Apply syntax highlighting
            const highlightedContent = await syntaxHighlighter.highlight(processedContent);

            // Load and apply template
            const template = await this.loadTemplate(config.template || 'professional');
            const htmlContent = await template.render(highlightedContent, config.branding || {});

            // Generate PDF
            await this.page.setContent(htmlContent, {
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: this.options.timeout
            });

            // Wait for any fonts or images to load
            await this.page.evaluateHandle('document.fonts.ready');

            const pdfBuffer = await this.page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '1in',
                    bottom: '1in',
                    left: '1in',
                    right: '1in'
                },
                displayHeaderFooter: true,
                headerTemplate: template.getHeaderTemplate(config.branding || {}),
                footerTemplate: template.getFooterTemplate(config.branding || {}),
                preferCSSPageSize: true
            });

            // Save PDF to file
            const outputPath = config.output || 'output.pdf';
            await fs.writeFile(outputPath, pdfBuffer);

            return {
                success: true,
                outputPath: path.resolve(outputPath),
                fileSize: pdfBuffer.length,
                pageCount: await this.getPageCount(pdfBuffer)
            };

        } catch (error) {
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Generate PDF from multiple markdown files
     *
     * @param {Object} config - Batch generation configuration
     * @param {Array} config.files - Array of markdown file paths
     * @param {string} config.template - Template name
     * @param {string} config.output - Output PDF file path
     * @param {Object} config.branding - Brand customization
     * @param {Object} config.organization - Document organization options
     */
    async generateBatchPDF(config) {
        const markdownParser = new MarkdownParser();
        let combinedContent = '';
        let tableOfContents = [];

        // Process each file and build combined content
        for (const filePath of config.files) {
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf8');
                const processed = await markdownParser.process(content, {
                    extractTOC: true,
                    fileContext: path.basename(filePath, '.md')
                });

                combinedContent += processed.content + '\n\n---\n\n';
                if (processed.toc) {
                    tableOfContents.push(...processed.toc);
                }
            }
        }

        // Generate master document with combined content
        return await this.generatePDF({
            content: combinedContent,
            template: config.template,
            output: config.output,
            branding: {
                ...config.branding,
                tableOfContents
            }
        });
    }

    /**
     * Load template renderer
     *
     * @param {string} templateName - Template name
     */
    async loadTemplate(templateName) {
        const templatePath = path.join(__dirname, 'templates', `${templateName}.js`);

        if (!await fs.pathExists(templatePath)) {
            throw new Error(`Template '${templateName}' not found at ${templatePath}`);
        }

        const TemplateClass = require(templatePath);
        return new TemplateClass();
    }

    /**
     * Get page count from PDF buffer (approximation)
     */
    async getPageCount(pdfBuffer) {
        // Simple page count estimation based on PDF structure
        const pdfString = pdfBuffer.toString('binary');
        const pageMatches = pdfString.match(/\/Count\s+(\d+)/);
        return pageMatches ? parseInt(pageMatches[1]) : 1;
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.page) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * Generate PDF with progress callback
     *
     * @param {Object} config - Generation configuration
     * @param {Function} progressCallback - Progress callback function
     */
    async generateWithProgress(config, progressCallback) {
        const steps = [
            'Initializing PDF generator',
            'Processing markdown content',
            'Applying syntax highlighting',
            'Loading template',
            'Rendering HTML',
            'Generating PDF',
            'Saving file'
        ];

        let currentStep = 0;
        const reportProgress = (step) => {
            if (progressCallback) {
                progressCallback({
                    step: currentStep + 1,
                    total: steps.length,
                    message: step,
                    percentage: Math.round(((currentStep + 1) / steps.length) * 100)
                });
            }
            currentStep++;
        };

        try {
            reportProgress(steps[0]);
            if (!this.browser) {
                await this.initialize();
            }

            reportProgress(steps[1]);
            const markdownParser = new MarkdownParser();
            let markdownContent;
            if (await fs.pathExists(config.content)) {
                markdownContent = await fs.readFile(config.content, 'utf8');
            } else {
                markdownContent = config.content;
            }

            reportProgress(steps[2]);
            const processedContent = await markdownParser.process(markdownContent, {
                generateTOC: true,
                processLinks: true,
                optimizeImages: true
            });

            const syntaxHighlighter = new SyntaxHighlighter();
            const highlightedContent = await syntaxHighlighter.highlight(processedContent);

            reportProgress(steps[3]);
            const template = await this.loadTemplate(config.template || 'professional');

            reportProgress(steps[4]);
            const htmlContent = await template.render(highlightedContent, config.branding || {});

            reportProgress(steps[5]);
            await this.page.setContent(htmlContent, {
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: this.options.timeout
            });

            await this.page.evaluateHandle('document.fonts.ready');

            const pdfBuffer = await this.page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '1in',
                    bottom: '1in',
                    left: '1in',
                    right: '1in'
                },
                displayHeaderFooter: true,
                headerTemplate: template.getHeaderTemplate(config.branding || {}),
                footerTemplate: template.getFooterTemplate(config.branding || {}),
                preferCSSPageSize: true
            });

            reportProgress(steps[6]);
            const outputPath = config.output || 'output.pdf';
            await fs.writeFile(outputPath, pdfBuffer);

            if (progressCallback) {
                progressCallback({
                    step: steps.length,
                    total: steps.length,
                    message: 'PDF generation complete',
                    percentage: 100,
                    completed: true
                });
            }

            return {
                success: true,
                outputPath: path.resolve(outputPath),
                fileSize: pdfBuffer.length,
                pageCount: await this.getPageCount(pdfBuffer)
            };

        } catch (error) {
            if (progressCallback) {
                progressCallback({
                    step: currentStep,
                    total: steps.length,
                    message: `Error: ${error.message}`,
                    percentage: 0,
                    error: true
                });
            }
            throw error;
        }
    }
}

module.exports = { PDFGenerator };