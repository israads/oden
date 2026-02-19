/**
 * Professional PDF Template for Business Documentation
 *
 * Features:
 * - Executive cover page with branding
 * - Professional typography and spacing
 * - Table of contents with page numbers
 * - Header/footer with company information
 * - Clean, corporate design
 */

const fs = require('fs-extra');
const path = require('path');

class ProfessionalTemplate {
    constructor(options = {}) {
        this.options = {
            pageSize: 'A4',
            margins: '1in',
            fontFamily: 'Inter',
            fontSize: '11pt',
            lineHeight: '1.4',
            primaryColor: '#1E3A8A',
            secondaryColor: '#64748B',
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
            clientName: 'Professional Client',
            projectTitle: 'Project Documentation',
            logoPath: null,
            primaryColor: this.options.primaryColor,
            secondaryColor: this.options.secondaryColor,
            companyName: 'Your Company',
            companyAddress: '123 Business Street, City, State 12345',
            companyPhone: '(555) 123-4567',
            companyEmail: 'contact@yourcompany.com',
            companyWebsite: 'www.yourcompany.com',
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
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
    <title>${config.projectTitle} - ${config.clientName}</title>
    <style>${css}</style>
</head>
<body>
    ${coverPage}
    <div class="page-break"></div>

    <div class="table-of-contents-page">
        <h1 class="toc-title">Table of Contents</h1>
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
     * Generate professional CSS styles
     */
    async generateCSS(config) {
        return `
        /* Professional Template Styles */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
            --primary-color: ${config.primaryColor};
            --secondary-color: ${config.secondaryColor};
            --text-color: #1f2937;
            --light-text: #6b7280;
            --border-color: #e5e7eb;
            --background-light: #f9fafb;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: ${this.options.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
            background: linear-gradient(135deg, var(--primary-color) 0%, #1e40af 100%);
            color: white;
            padding: 2in;
            position: relative;
        }

        .cover-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .cover-logo {
            max-height: 80px;
            max-width: 200px;
            margin-bottom: 2rem;
            z-index: 1;
        }

        .cover-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            z-index: 1;
        }

        .cover-subtitle {
            font-size: 1.5rem;
            font-weight: 400;
            margin: 0 0 3rem 0;
            opacity: 0.9;
            z-index: 1;
        }

        .cover-client {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            z-index: 1;
        }

        .cover-date {
            font-size: 1rem;
            opacity: 0.8;
            z-index: 1;
        }

        .cover-footer {
            position: absolute;
            bottom: 1in;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.9rem;
            opacity: 0.7;
            z-index: 1;
        }

        /* Table of Contents */
        .table-of-contents-page {
            padding: 2rem;
            min-height: calc(100vh - 4rem);
        }

        .toc-title {
            font-size: 2rem;
            font-weight: 600;
            color: var(--primary-color);
            margin: 0 0 2rem 0;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 1rem;
        }

        .table-of-contents {
            font-size: 0.95rem;
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 0.5rem 0;
            border-bottom: 1px dotted var(--border-color);
            margin-bottom: 0.25rem;
        }

        .toc-item-1 { font-weight: 600; font-size: 1rem; margin-top: 1rem; }
        .toc-item-2 { margin-left: 1rem; }
        .toc-item-3 { margin-left: 2rem; font-size: 0.9rem; }
        .toc-item-4 { margin-left: 3rem; font-size: 0.9rem; }

        .toc-title-text {
            flex: 1;
            margin-right: 1rem;
        }

        .toc-page-number {
            font-weight: 500;
            color: var(--primary-color);
            min-width: 2rem;
            text-align: right;
        }

        /* Document Content */
        .document-content {
            padding: 1rem 2rem 2rem 2rem;
            max-width: 100%;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            line-height: 1.3;
            margin: 2rem 0 1rem 0;
            color: var(--primary-color);
            page-break-after: avoid;
        }

        h1 {
            font-size: 2rem;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 0.5rem;
            margin-top: 3rem;
        }

        h1:first-child {
            margin-top: 0;
        }

        h2 {
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.25rem;
        }

        h3 {
            font-size: 1.25rem;
        }

        h4 {
            font-size: 1.1rem;
            color: var(--secondary-color);
        }

        h5 {
            font-size: 1rem;
            color: var(--secondary-color);
        }

        h6 {
            font-size: 0.9rem;
            color: var(--secondary-color);
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

        /* Lists */
        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }

        li {
            margin: 0.5rem 0;
        }

        ul li {
            list-style: none;
            position: relative;
        }

        ul li::before {
            content: '•';
            color: var(--primary-color);
            font-weight: bold;
            position: absolute;
            left: -1rem;
        }

        /* Tables */
        .markdown-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.95rem;
            page-break-inside: avoid;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .markdown-table th,
        .markdown-table td {
            border: 1px solid var(--border-color);
            padding: 0.75rem 1rem;
            text-align: left;
        }

        .markdown-table th {
            background: var(--background-light);
            font-weight: 600;
            color: var(--primary-color);
            border-bottom: 2px solid var(--primary-color);
        }

        .markdown-table tr:nth-child(even) {
            background: #fafbfc;
        }

        .markdown-table tr:hover {
            background: var(--background-light);
        }

        /* Images */
        .image-container {
            text-align: center;
            margin: 2rem 0;
            page-break-inside: avoid;
        }

        .markdown-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .image-caption {
            font-size: 0.9rem;
            color: var(--light-text);
            font-style: italic;
            margin-top: 0.5rem;
        }

        /* Code Blocks */
        .code-block {
            background: var(--background-light);
            border: 1px solid var(--border-color);
            border-left: 4px solid var(--primary-color);
            border-radius: 0 6px 6px 0;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9rem;
            line-height: 1.4;
            margin: 1.5rem 0;
            overflow: visible;
            padding: 1rem 1.5rem;
            page-break-inside: avoid;
        }

        .code-block::before {
            content: attr(data-language);
            display: block;
            font-size: 0.8rem;
            color: var(--light-text);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        /* Inline Code */
        .inline-code {
            background: #f1f5f9;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.85em;
            padding: 0.2em 0.4em;
            color: #e83e8c;
            border: 1px solid #e2e8f0;
        }

        /* Links */
        a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s ease;
        }

        a:hover {
            border-bottom-color: var(--primary-color);
        }

        .external-link::after {
            content: ' ↗';
            font-size: 0.8em;
            opacity: 0.6;
        }

        /* Blockquotes */
        blockquote {
            border-left: 4px solid var(--primary-color);
            background: var(--background-light);
            margin: 1.5rem 0;
            padding: 1rem 2rem;
            font-style: italic;
            color: var(--secondary-color);
        }

        blockquote p {
            margin: 0;
        }

        /* Callouts */
        .callout {
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            border-left: 4px solid;
            page-break-inside: avoid;
        }

        .callout-warning {
            background: #fef3cd;
            border-color: #ffc107;
        }

        .callout-info {
            background: #cff4fc;
            border-color: #0dcaf0;
        }

        .callout-success {
            background: #d1e7dd;
            border-color: #198754;
        }

        .callout-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

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
            .image-container {
                page-break-inside: avoid;
                break-inside: avoid;
            }

            .cover-page {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }

        /* Header and Footer Space */
        @page {
            size: A4;
            margin: 1in;

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
     * Generate cover page HTML
     */
    generateCoverPage(config) {
        const logoHtml = config.logoPath ?
            `<img src="${config.logoPath}" alt="${config.companyName} Logo" class="cover-logo">` :
            `<div style="height: 80px; margin-bottom: 2rem;"></div>`;

        return `
        <div class="cover-page">
            ${logoHtml}
            <h1 class="cover-title">${config.projectTitle}</h1>
            <p class="cover-subtitle">Professional Documentation</p>
            <div class="cover-client">Prepared for ${config.clientName}</div>
            <div class="cover-date">${config.date}</div>
            <div class="cover-footer">
                <div>${config.companyName}</div>
                <div>${config.companyAddress}</div>
                <div>${config.companyPhone} • ${config.companyEmail}</div>
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

            // Estimate page increment (very rough)
            if (level === 1) pageNumber += 1;
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
     * Process content for professional styling
     */
    processContent(content, config) {
        // Add professional styling classes to elements
        let processedContent = content;

        // Enhance tables
        processedContent = processedContent.replace(
            /<table>/g,
            '<table class="markdown-table">'
        );

        // Enhance code blocks (should already be processed by syntax highlighter)
        // Just ensure they have proper classes

        return processedContent;
    }

    /**
     * Generate header template for PDF
     */
    getHeaderTemplate(config = {}) {
        return `
        <div style="font-family: Inter, sans-serif; font-size: 10px; color: #6b7280; text-align: center; padding: 10px 0;">
            ${config.projectTitle || 'Document'} - ${config.clientName || 'Client'}
        </div>`;
    }

    /**
     * Generate footer template for PDF
     */
    getFooterTemplate(config = {}) {
        return `
        <div style="font-family: Inter, sans-serif; font-size: 10px; color: #6b7280; text-align: center; padding: 10px 0; display: flex; justify-content: space-between; width: 100%;">
            <span style="flex: 1; text-align: left;">${config.companyName || 'Company Name'}</span>
            <span style="flex: 1; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            <span style="flex: 1; text-align: right;">${new Date().toLocaleDateString()}</span>
        </div>`;
    }
}

module.exports = ProfessionalTemplate;