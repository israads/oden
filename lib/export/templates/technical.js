/**
 * Technical PDF Template for Developer Documentation
 *
 * Features:
 * - Code-focused layout with optimal syntax highlighting
 * - API documentation formatting
 * - Technical diagrams and flowcharts support
 * - Monospace-friendly typography
 * - Dark theme code blocks
 */

const fs = require('fs-extra');
const path = require('path');

class TechnicalTemplate {
    constructor(options = {}) {
        this.options = {
            pageSize: 'A4',
            margins: '0.75in',
            fontFamily: 'JetBrains Mono',
            fontSize: '10pt',
            lineHeight: '1.5',
            primaryColor: '#0ea5e9',
            secondaryColor: '#475569',
            codeTheme: 'dark',
            ...options
        };
    }

    /**
     * Render the complete HTML document
     *
     * @param {string} content - Processed HTML content
     * @param {Object} branding - Branding configuration
     */
    async render(content, branding = {}) {
        const config = {
            projectTitle: 'Technical Documentation',
            version: '1.0.0',
            apiVersion: 'v1',
            logoPath: null,
            primaryColor: this.options.primaryColor,
            secondaryColor: this.options.secondaryColor,
            companyName: 'Development Team',
            repositoryUrl: 'https://github.com/company/project',
            date: new Date().toISOString().split('T')[0],
            ...branding
        };

        const css = await this.generateCSS(config);
        const coverPage = this.generateCoverPage(config);
        const processedContent = this.processContent(content, config);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.projectTitle} v${config.version}</title>
    <style>${css}</style>
</head>
<body>
    ${coverPage}
    <div class="page-break"></div>

    <div class="table-of-contents-page">
        <h1 class="toc-title">
            <span class="toc-icon">📋</span>
            Table of Contents
        </h1>
        <div class="table-of-contents">
            ${this.generateTableOfContents(content)}
        </div>
    </div>
    <div class="page-break"></div>

    <div class="document-content">
        ${processedContent}
    </div>
</body>
</html>`;
    }

    /**
     * Generate technical CSS styles
     */
    async generateCSS(config) {
        return `
        /* Technical Template Styles */
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
            --primary-color: ${config.primaryColor};
            --secondary-color: ${config.secondaryColor};
            --text-color: #0f172a;
            --light-text: #64748b;
            --border-color: #cbd5e1;
            --background-light: #f1f5f9;
            --background-dark: #1e293b;
            --code-bg: #0f172a;
            --code-text: #e2e8f0;
            --success-color: #22c55e;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: ${this.options.fontSize};
            line-height: ${this.options.lineHeight};
            color: var(--text-color);
            margin: 0;
            padding: 0;
            background: white;
        }

        /* Page Structure */
        .page-break {
            page-break-after: always;
            break-after: page;
        }

        .page-break-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* Cover Page Styles */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, var(--primary-color) 100%);
            color: white;
            padding: 2in;
            position: relative;
            font-family: 'JetBrains Mono', monospace;
        }

        .cover-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%);
        }

        .cover-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            z-index: 1;
        }

        .cover-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cover-version {
            font-size: 1.2rem;
            color: var(--primary-color);
            font-weight: 600;
            margin: 0 0 2rem 0;
            z-index: 1;
        }

        .cover-description {
            font-size: 1.1rem;
            font-weight: 300;
            max-width: 600px;
            margin: 0 0 3rem 0;
            opacity: 0.9;
            z-index: 1;
            line-height: 1.6;
        }

        .cover-metadata {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            max-width: 500px;
            z-index: 1;
        }

        .cover-metadata-item {
            text-align: center;
        }

        .cover-metadata-label {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-bottom: 0.25rem;
        }

        .cover-metadata-value {
            font-size: 1.1rem;
            font-weight: 500;
        }

        /* Table of Contents */
        .table-of-contents-page {
            padding: 2rem;
            min-height: calc(100vh - 4rem);
            background: #fafbfc;
        }

        .toc-title {
            font-size: 2rem;
            font-weight: 600;
            color: var(--primary-color);
            margin: 0 0 2rem 0;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .toc-icon {
            font-size: 1.5rem;
        }

        .table-of-contents {
            font-size: 0.95rem;
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 0.5rem;
        }

        .toc-item:last-child {
            border-bottom: none;
        }

        .toc-item-1 {
            font-weight: 600;
            font-size: 1.1rem;
            margin-top: 1rem;
            color: var(--primary-color);
        }
        .toc-item-2 {
            margin-left: 1.5rem;
            font-weight: 500;
        }
        .toc-item-3 {
            margin-left: 3rem;
            font-size: 0.9rem;
            color: var(--secondary-color);
        }
        .toc-item-4 {
            margin-left: 4.5rem;
            font-size: 0.85rem;
            color: var(--light-text);
        }

        .toc-title-text {
            flex: 1;
            margin-right: 1rem;
        }

        .toc-page-number {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
            color: var(--primary-color);
            min-width: 3rem;
            text-align: right;
            background: var(--background-light);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
        }

        /* Document Content */
        .document-content {
            padding: 1.5rem 2rem 2rem 2rem;
            max-width: 100%;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            line-height: 1.3;
            margin: 2.5rem 0 1rem 0;
            color: var(--primary-color);
            page-break-after: avoid;
        }

        h1 {
            font-size: 2.2rem;
            border-bottom: 4px solid var(--primary-color);
            padding-bottom: 0.75rem;
            margin-top: 3rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        h1:first-child {
            margin-top: 0;
        }

        h1::before {
            content: '⚡';
            font-size: 1.5rem;
        }

        h2 {
            font-size: 1.7rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        h2::before {
            content: '📡';
            font-size: 1.2rem;
        }

        h3 {
            font-size: 1.4rem;
            position: relative;
            padding-left: 1.5rem;
        }

        h3::before {
            content: '▶';
            color: var(--primary-color);
            position: absolute;
            left: 0;
            font-size: 0.8rem;
        }

        h4 {
            font-size: 1.2rem;
            color: var(--secondary-color);
            font-family: 'JetBrains Mono', monospace;
        }

        h5, h6 {
            font-size: 1rem;
            color: var(--secondary-color);
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Paragraphs and Text */
        p {
            margin: 0 0 1rem 0;
            text-align: justify;
            hyphens: auto;
        }

        strong, b {
            font-weight: 600;
            color: var(--text-color);
        }

        em, i {
            font-style: italic;
            color: var(--secondary-color);
        }

        /* Code Elements */
        .code-block {
            background: var(--code-bg);
            color: var(--code-text);
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            line-height: 1.6;
            margin: 2rem 0;
            overflow: visible;
            padding: 1.5rem;
            page-break-inside: avoid;
            position: relative;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .code-block::before {
            content: attr(data-language);
            position: absolute;
            top: 0;
            right: 0;
            background: var(--primary-color);
            color: white;
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
            border-radius: 0 8px 0 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .code-block code {
            color: inherit;
            background: transparent;
            border: none;
            padding: 0;
            font-size: inherit;
            font-family: inherit;
        }

        /* Enhanced syntax highlighting for technical docs */
        .token.comment { color: #64748b; }
        .token.punctuation { color: #cbd5e1; }
        .token.property,
        .token.tag,
        .token.constant,
        .token.symbol { color: #f59e0b; }
        .token.boolean,
        .token.number { color: #06b6d4; }
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin { color: #22c55e; }
        .token.operator,
        .token.entity,
        .token.url { color: #ef4444; }
        .token.atrule,
        .token.attr-value,
        .token.function,
        .token.class-name { color: #8b5cf6; }
        .token.keyword { color: #ec4899; font-weight: 600; }
        .token.regex,
        .token.important { color: #f97316; }

        /* Inline Code */
        .inline-code {
            background: var(--background-light);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85em;
            padding: 0.15em 0.4em;
            color: var(--primary-color);
            font-weight: 500;
        }

        /* API Documentation Styles */
        .api-endpoint {
            background: var(--background-light);
            border-left: 4px solid var(--primary-color);
            border-radius: 0 8px 8px 0;
            margin: 1.5rem 0;
            padding: 1.5rem;
            page-break-inside: avoid;
        }

        .api-endpoint-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .api-method {
            background: var(--primary-color);
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            font-weight: 600;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            text-transform: uppercase;
        }

        .api-method.get { background: var(--success-color); }
        .api-method.post { background: var(--primary-color); }
        .api-method.put { background: var(--warning-color); }
        .api-method.delete { background: var(--error-color); }

        .api-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-color);
        }

        .api-description {
            color: var(--secondary-color);
            margin-bottom: 1rem;
        }

        /* Tables */
        .markdown-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.9rem;
            page-break-inside: avoid;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .markdown-table th,
        .markdown-table td {
            border: 1px solid var(--border-color);
            padding: 1rem;
            text-align: left;
            vertical-align: top;
        }

        .markdown-table th {
            background: var(--background-dark);
            color: white;
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .markdown-table tr:nth-child(even) {
            background: var(--background-light);
        }

        .markdown-table code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
        }

        /* Lists */
        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }

        li {
            margin: 0.75rem 0;
        }

        ul li {
            list-style: none;
            position: relative;
        }

        ul li::before {
            content: '▸';
            color: var(--primary-color);
            font-weight: bold;
            position: absolute;
            left: -1.2rem;
        }

        /* Task Lists */
        .task-list-item {
            list-style: none;
            position: relative;
            padding-left: 0;
        }

        .task-list-item::before {
            display: none;
        }

        .task-list-item-checkbox {
            margin-right: 0.5rem;
        }

        /* Images and Diagrams */
        .image-container {
            text-align: center;
            margin: 2rem 0;
            page-break-inside: avoid;
            background: var(--background-light);
            padding: 1rem;
            border-radius: 8px;
        }

        .markdown-image {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--light-text);
            font-style: italic;
            margin-top: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
        }

        /* Links */
        a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px dotted var(--primary-color);
            transition: all 0.2s ease;
        }

        a:hover {
            background: var(--background-light);
            padding: 0.1em 0.2em;
            border-radius: 3px;
        }

        .external-link::after {
            content: ' 🔗';
            font-size: 0.8em;
            opacity: 0.6;
        }

        /* Blockquotes */
        blockquote {
            border-left: 4px solid var(--primary-color);
            background: var(--background-light);
            margin: 2rem 0;
            padding: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            border-radius: 0 8px 8px 0;
        }

        /* Callouts */
        .callout {
            margin: 2rem 0;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid;
            page-break-inside: avoid;
            font-family: 'Inter', sans-serif;
        }

        .callout-warning {
            background: #fef3cd;
            border-color: var(--warning-color);
        }

        .callout-info {
            background: #cffafe;
            border-color: var(--primary-color);
        }

        .callout-success {
            background: #dcfce7;
            border-color: var(--success-color);
        }

        .callout-title {
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .callout-warning .callout-title::before { content: '⚠️'; }
        .callout-info .callout-title::before { content: 'ℹ️'; }
        .callout-success .callout-title::before { content: '✅'; }

        /* Print Optimizations */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .page-break {
                page-break-after: always;
                break-after: page;
            }

            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                break-after: avoid;
            }

            .code-block,
            .callout,
            .markdown-table,
            .image-container,
            .api-endpoint {
                page-break-inside: avoid;
                break-inside: avoid;
            }

            .cover-page {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }

        /* Page Layout */
        @page {
            size: A4;
            margin: 0.75in;

            @top-center {
                content: element(header);
            }

            @bottom-center {
                content: element(footer);
            }
        }
        `;
    }

    /**
     * Generate technical cover page HTML
     */
    generateCoverPage(config) {
        return `
        <div class="cover-page">
            <div class="cover-icon">⚡</div>
            <h1 class="cover-title">${config.projectTitle}</h1>
            <div class="cover-version">Version ${config.version}</div>
            <p class="cover-description">
                Comprehensive technical documentation and API reference
            </p>
            <div class="cover-metadata">
                <div class="cover-metadata-item">
                    <div class="cover-metadata-label">Release Date</div>
                    <div class="cover-metadata-value">${config.date}</div>
                </div>
                <div class="cover-metadata-item">
                    <div class="cover-metadata-label">API Version</div>
                    <div class="cover-metadata-value">${config.apiVersion}</div>
                </div>
            </div>
        </div>`;
    }

    /**
     * Generate table of contents from content
     */
    generateTableOfContents(content) {
        const tocItems = [];
        const headerRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g;
        let match;
        let pageNumber = 3; // Starting after cover page and TOC page

        while ((match = headerRegex.exec(content)) !== null) {
            const level = parseInt(match[1]);
            const id = match[2];
            const title = match[3].replace(/<[^>]*>/g, ''); // Strip HTML tags

            tocItems.push({
                level,
                id,
                title,
                page: pageNumber
            });

            // Estimate page increment for technical docs (more content per section)
            if (level === 1) pageNumber += 2;
            else if (level === 2) pageNumber += 1;
        }

        return tocItems.map(item => `
            <div class="toc-item toc-item-${item.level}">
                <span class="toc-title-text">
                    <a href="#${item.id}" class="toc-link">${item.title}</a>
                </span>
                <span class="toc-page-number">${item.page}</span>
            </div>
        `).join('');
    }

    /**
     * Process content for technical styling
     */
    processContent(content, config) {
        let processedContent = content;

        // Enhance API endpoint detection and formatting
        processedContent = processedContent.replace(
            /<h3[^>]*>(GET|POST|PUT|DELETE|PATCH)\s+([^<]+)<\/h3>/g,
            (match, method, path) => {
                return `
                <div class="api-endpoint">
                    <div class="api-endpoint-header">
                        <span class="api-method ${method.toLowerCase()}">${method}</span>
                        <span class="api-path">${path.trim()}</span>
                    </div>
                </div>`;
            }
        );

        // Enhance tables for API documentation
        processedContent = processedContent.replace(
            /<table>/g,
            '<table class="markdown-table">'
        );

        return processedContent;
    }

    /**
     * Generate header template for PDF
     */
    getHeaderTemplate(config = {}) {
        return `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #64748b; text-align: center; padding: 10px 0; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            ${config.projectTitle || 'Technical Documentation'} v${config.version || '1.0.0'}
        </div>`;
    }

    /**
     * Generate footer template for PDF
     */
    getFooterTemplate(config = {}) {
        return `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #64748b; text-align: center; padding: 10px 0; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; width: 100%;">
            <span style="flex: 1; text-align: left;">${config.repositoryUrl || 'Repository'}</span>
            <span style="flex: 1; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            <span style="flex: 1; text-align: right;">Generated: ${config.date}</span>
        </div>`;
    }
}

module.exports = TechnicalTemplate;