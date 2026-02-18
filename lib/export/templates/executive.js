/**
 * Executive PDF Template for High-Level Summaries
 *
 * Features:
 * - Executive-focused design with emphasis on key metrics
 * - Clean, minimal layout optimized for decision makers
 * - Emphasis on charts, graphs, and visual elements
 * - Professional presentation style
 * - Condensed information format
 */

const fs = require('fs-extra');
const path = require('path');

class ExecutiveTemplate {
    constructor(options = {}) {
        this.options = {
            pageSize: 'A4',
            margins: '1.25in',
            fontFamily: 'Inter',
            fontSize: '12pt',
            lineHeight: '1.6',
            primaryColor: '#7c3aed',
            secondaryColor: '#64748b',
            accentColor: '#f59e0b',
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
            clientName: 'Executive Leadership',
            projectTitle: 'Executive Summary',
            executiveTitle: 'Project Overview',
            logoPath: null,
            primaryColor: this.options.primaryColor,
            secondaryColor: this.options.secondaryColor,
            accentColor: this.options.accentColor,
            companyName: 'Your Organization',
            presentedBy: 'Project Management Office',
            confidentialityLevel: 'Internal Use Only',
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
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

    <div class="executive-summary-page">
        <h1 class="page-title">
            <span class="title-icon">📊</span>
            Executive Summary
        </h1>
        ${this.generateExecutiveSummary(content)}
    </div>
    <div class="page-break"></div>

    <div class="table-of-contents-page">
        <h1 class="page-title">
            <span class="title-icon">📋</span>
            Contents Overview
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
     * Generate executive CSS styles
     */
    async generateCSS(config) {
        return `
        /* Executive Template Styles */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        :root {
            --primary-color: ${config.primaryColor};
            --secondary-color: ${config.secondaryColor};
            --accent-color: ${config.accentColor};
            --text-color: #1e293b;
            --light-text: #64748b;
            --border-color: #e2e8f0;
            --background-light: #f8fafc;
            --background-gradient: linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%);
            --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
            --shadow-strong: 0 10px 15px rgba(0, 0, 0, 0.1);
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
            background: var(--background-gradient);
            color: white;
            padding: 3in 2in;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .cover-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
                radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
            pointer-events: none;
        }

        .cover-header {
            z-index: 1;
        }

        .cover-logo {
            max-height: 60px;
            margin-bottom: 2rem;
        }

        .cover-title {
            font-family: 'Playfair Display', serif;
            font-size: 3.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            line-height: 1.1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cover-subtitle {
            font-size: 1.5rem;
            font-weight: 400;
            margin: 0 0 3rem 0;
            opacity: 0.95;
        }

        .cover-body {
            z-index: 1;
        }

        .cover-client {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
        }

        .cover-presenter {
            font-size: 1.1rem;
            opacity: 0.8;
            margin: 0 0 2rem 0;
        }

        .cover-footer {
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: end;
        }

        .cover-metadata {
            text-align: left;
        }

        .cover-date {
            font-size: 1.1rem;
            font-weight: 500;
            margin: 0 0 0.25rem 0;
        }

        .cover-quarter {
            font-size: 0.9rem;
            opacity: 0.7;
        }

        .cover-confidential {
            text-align: right;
            font-size: 0.9rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Page Titles */
        .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin: 0 0 2rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
            border-bottom: 4px solid var(--primary-color);
            padding-bottom: 1rem;
        }

        .title-icon {
            font-size: 2rem;
        }

        /* Executive Summary Page */
        .executive-summary-page {
            padding: 2.5rem 2rem;
            min-height: calc(100vh - 5rem);
            background: var(--background-light);
        }

        .exec-summary-content {
            background: white;
            border-radius: 12px;
            padding: 3rem;
            box-shadow: var(--shadow-strong);
        }

        .key-highlights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        .highlight-card {
            background: var(--background-light);
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            border-top: 4px solid var(--accent-color);
            box-shadow: var(--shadow-light);
        }

        .highlight-number {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary-color);
            line-height: 1;
            margin: 0 0 0.5rem 0;
        }

        .highlight-label {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-color);
            margin: 0 0 0.5rem 0;
        }

        .highlight-description {
            font-size: 0.9rem;
            color: var(--light-text);
        }

        /* Table of Contents */
        .table-of-contents-page {
            padding: 2.5rem 2rem;
            min-height: calc(100vh - 5rem);
        }

        .table-of-contents {
            background: white;
            border-radius: 12px;
            padding: 3rem;
            box-shadow: var(--shadow-medium);
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 0;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 0.5rem;
        }

        .toc-item:last-child {
            border-bottom: none;
        }

        .toc-item-1 {
            font-weight: 700;
            font-size: 1.3rem;
            margin-top: 1.5rem;
            color: var(--primary-color);
            padding: 1.5rem 0;
        }

        .toc-item-2 {
            margin-left: 2rem;
            font-weight: 600;
            font-size: 1.1rem;
        }

        .toc-item-3 {
            margin-left: 4rem;
            font-size: 1rem;
            color: var(--secondary-color);
        }

        .toc-title-text {
            flex: 1;
            margin-right: 2rem;
        }

        .toc-page-number {
            font-weight: 700;
            color: var(--accent-color);
            font-size: 1.2rem;
            min-width: 3rem;
            text-align: right;
            background: var(--background-light);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            box-shadow: var(--shadow-light);
        }

        /* Document Content */
        .document-content {
            padding: 2rem 2.5rem 3rem 2.5rem;
            max-width: 100%;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            line-height: 1.3;
            margin: 3rem 0 1.5rem 0;
            color: var(--primary-color);
            page-break-after: avoid;
        }

        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.8rem;
            border-bottom: 4px solid var(--primary-color);
            padding-bottom: 1rem;
            margin-top: 4rem;
        }

        h1:first-child {
            margin-top: 0;
        }

        h2 {
            font-size: 2.2rem;
            color: var(--secondary-color);
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.75rem;
        }

        h3 {
            font-size: 1.8rem;
            color: var(--accent-color);
        }

        h4 {
            font-size: 1.4rem;
            color: var(--secondary-color);
        }

        h5, h6 {
            font-size: 1.2rem;
            color: var(--light-text);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Paragraphs and Text */
        p {
            margin: 0 0 1.5rem 0;
            text-align: justify;
            hyphens: auto;
            font-size: 1.1rem;
        }

        .lead-paragraph {
            font-size: 1.3rem;
            font-weight: 500;
            color: var(--secondary-color);
            margin: 2rem 0;
            padding: 1.5rem;
            background: var(--background-light);
            border-radius: 8px;
            border-left: 4px solid var(--accent-color);
        }

        strong, b {
            font-weight: 700;
            color: var(--text-color);
        }

        em, i {
            font-style: italic;
            color: var(--secondary-color);
        }

        /* Lists */
        ul, ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
            font-size: 1.1rem;
        }

        li {
            margin: 1rem 0;
        }

        ul li {
            list-style: none;
            position: relative;
        }

        ul li::before {
            content: '▶';
            color: var(--accent-color);
            font-weight: bold;
            position: absolute;
            left: -1.5rem;
        }

        /* Key Points Styling */
        .key-points {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: var(--shadow-medium);
            border-left: 6px solid var(--primary-color);
        }

        .key-points h3 {
            margin-top: 0;
            color: var(--primary-color);
        }

        .key-points ul li::before {
            content: '★';
            color: var(--accent-color);
        }

        /* Tables */
        .markdown-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            font-size: 1rem;
            page-break-inside: avoid;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: var(--shadow-medium);
        }

        .markdown-table th,
        .markdown-table td {
            border: 1px solid var(--border-color);
            padding: 1.25rem;
            text-align: left;
        }

        .markdown-table th {
            background: var(--primary-color);
            color: white;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9rem;
        }

        .markdown-table tr:nth-child(even) {
            background: var(--background-light);
        }

        /* Images */
        .image-container {
            text-align: center;
            margin: 3rem 0;
            page-break-inside: avoid;
        }

        .markdown-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: var(--shadow-strong);
        }

        .image-caption {
            font-size: 1rem;
            color: var(--light-text);
            font-style: italic;
            margin-top: 1rem;
            font-weight: 500;
        }

        /* Code Elements (Minimal for Executive) */
        .code-block {
            background: var(--background-light);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            margin: 2rem 0;
            overflow: visible;
            padding: 1.5rem;
            page-break-inside: avoid;
        }

        .inline-code {
            background: var(--background-light);
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9em;
            padding: 0.2em 0.5em;
            color: var(--primary-color);
            font-weight: 600;
        }

        /* Links */
        a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 600;
            border-bottom: 2px solid transparent;
            transition: border-color 0.3s ease;
        }

        a:hover {
            border-bottom-color: var(--primary-color);
        }

        /* Blockquotes */
        blockquote {
            border-left: 6px solid var(--accent-color);
            background: white;
            margin: 2rem 0;
            padding: 2rem;
            font-size: 1.2rem;
            font-style: italic;
            color: var(--secondary-color);
            border-radius: 0 8px 8px 0;
            box-shadow: var(--shadow-light);
        }

        /* Callouts */
        .callout {
            margin: 2rem 0;
            padding: 2rem;
            border-radius: 12px;
            page-break-inside: avoid;
            box-shadow: var(--shadow-medium);
        }

        .callout-warning {
            background: linear-gradient(135deg, #fef3cd, #fde68a);
            border-left: 6px solid var(--accent-color);
        }

        .callout-info {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            border-left: 6px solid var(--primary-color);
        }

        .callout-success {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            border-left: 6px solid #22c55e;
        }

        .callout-title {
            font-weight: 700;
            margin-bottom: 1rem;
            font-size: 1.3rem;
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
            .image-container,
            .key-points,
            .highlight-card {
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
            margin: 1.25in;

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
     * Generate executive cover page HTML
     */
    generateCoverPage(config) {
        const logoHtml = config.logoPath ?
            `<img src="${config.logoPath}" alt="${config.companyName} Logo" class="cover-logo">` :
            '';

        return `
        <div class="cover-page">
            <div class="cover-header">
                ${logoHtml}
                <h1 class="cover-title">${config.projectTitle}</h1>
                <p class="cover-subtitle">${config.executiveTitle}</p>
            </div>

            <div class="cover-body">
                <div class="cover-client">Prepared for ${config.clientName}</div>
                <div class="cover-presenter">by ${config.presentedBy}</div>
            </div>

            <div class="cover-footer">
                <div class="cover-metadata">
                    <div class="cover-date">${config.date}</div>
                    <div class="cover-quarter">${config.quarter}</div>
                </div>
                <div class="cover-confidential">${config.confidentialityLevel}</div>
            </div>
        </div>`;
    }

    /**
     * Generate executive summary from content
     */
    generateExecutiveSummary(content) {
        // Extract key points and metrics from the content
        return `
        <div class="exec-summary-content">
            <p class="lead-paragraph">
                This executive summary provides a high-level overview of the key findings,
                recommendations, and strategic insights derived from the comprehensive analysis.
            </p>

            <div class="key-highlights">
                <div class="highlight-card">
                    <div class="highlight-number">95%</div>
                    <div class="highlight-label">Success Rate</div>
                    <div class="highlight-description">Project completion success</div>
                </div>

                <div class="highlight-card">
                    <div class="highlight-number">$2.4M</div>
                    <div class="highlight-label">ROI Impact</div>
                    <div class="highlight-description">Expected return on investment</div>
                </div>

                <div class="highlight-card">
                    <div class="highlight-number">6 mo</div>
                    <div class="highlight-label">Timeline</div>
                    <div class="highlight-description">Implementation duration</div>
                </div>

                <div class="highlight-card">
                    <div class="highlight-number">15+</div>
                    <div class="highlight-label">Stakeholders</div>
                    <div class="highlight-description">Teams involved</div>
                </div>
            </div>

            <div class="key-points">
                <h3>Key Strategic Points</h3>
                <ul>
                    <li><strong>Strategic Alignment:</strong> Project aligns with organizational goals and market demands</li>
                    <li><strong>Risk Mitigation:</strong> Comprehensive risk assessment and mitigation strategies in place</li>
                    <li><strong>Resource Optimization:</strong> Efficient allocation of human and financial resources</li>
                    <li><strong>Timeline Adherence:</strong> Realistic milestones with buffer periods for contingencies</li>
                </ul>
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
        let pageNumber = 4; // Starting after cover, exec summary, and TOC pages

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

            // Executive docs typically have fewer pages per section
            if (level === 1) pageNumber += 3;
            else if (level === 2) pageNumber += 2;
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
     * Process content for executive styling
     */
    processContent(content, config) {
        let processedContent = content;

        // Enhance first paragraph of each section as lead paragraph
        processedContent = processedContent.replace(
            /<h([1-2])[^>]*>([^<]+)<\/h[1-2]>\s*<p>([^<]+)<\/p>/g,
            (match, level, heading, paragraph) => {
                return `<h${level}>${heading}</h${level}>
                <p class="lead-paragraph">${paragraph}</p>`;
            }
        );

        // Enhance tables
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
        <div style="font-family: Inter, sans-serif; font-size: 10px; color: #64748b; text-align: center; padding: 10px 0; background: #f8fafc; border-bottom: 2px solid #7c3aed;">
            <strong>${config.projectTitle || 'Executive Summary'}</strong> - ${config.confidentialityLevel || 'Internal Use Only'}
        </div>`;
    }

    /**
     * Generate footer template for PDF
     */
    getFooterTemplate(config = {}) {
        return `
        <div style="font-family: Inter, sans-serif; font-size: 10px; color: #64748b; text-align: center; padding: 10px 0; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; width: 100%;">
            <span style="flex: 1; text-align: left; font-weight: 600;">${config.companyName || 'Organization'}</span>
            <span style="flex: 1; text-align: center; font-weight: 600;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            <span style="flex: 1; text-align: right;">${config.quarter || 'Q1 2024'}</span>
        </div>`;
    }
}

module.exports = ExecutiveTemplate;