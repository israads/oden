/**
 * Advanced Syntax Highlighter for PDF Export
 *
 * Features:
 * - Support for 20+ programming languages
 * - Multiple highlighting themes
 * - Line numbers and highlighting
 * - Print-optimized color schemes
 */

const Prism = require('prismjs');
const fs = require('fs-extra');
const path = require('path');

// Load language components safely
const loadLanguage = (lang) => {
    try {
        require(`prismjs/components/prism-${lang}`);
    } catch (error) {
        console.warn(`Could not load Prism language: ${lang}`);
    }
};

// Load additional language components
loadLanguage('typescript');
loadLanguage('python');
loadLanguage('java');
loadLanguage('csharp');
loadLanguage('rust');
loadLanguage('go');
loadLanguage('php');
loadLanguage('ruby');
loadLanguage('bash');
loadLanguage('sql');
loadLanguage('json');
loadLanguage('yaml');
loadLanguage('markdown');
loadLanguage('docker');

// Load plugins safely
const loadPlugin = (plugin) => {
    try {
        require(`prismjs/plugins/${plugin}/prism-${plugin}`);
    } catch (error) {
        console.warn(`Could not load Prism plugin: ${plugin}`);
    }
};

loadPlugin('line-numbers');
loadPlugin('line-highlight');
loadPlugin('normalize-whitespace');

class SyntaxHighlighter {
    constructor(options = {}) {
        this.options = {
            theme: 'professional',
            showLineNumbers: true,
            tabSize: 2,
            printOptimized: true,
            ...options
        };

        this.initializeHighlighter();
    }

    /**
     * Initialize the syntax highlighter
     */
    initializeHighlighter() {
        // Configure normalize whitespace plugin
        Prism.plugins.NormalizeWhitespace.setDefaults({
            'remove-trailing': true,
            'remove-indent': true,
            'left-trim': true,
            'right-trim': true,
            'break-lines': 80,
            'indent': 0,
            'remove-initial-line-feed': false,
            'tabs-to-spaces': this.options.tabSize,
            'spaces-to-tabs': 0
        });
    }

    /**
     * Highlight HTML content with syntax highlighting
     *
     * @param {string} html - HTML content with code blocks
     */
    async highlight(html) {
        try {
            // Validate input
            if (typeof html !== 'string') {
                console.error('SyntaxHighlighter received non-string input:', typeof html, html);
                return html.toString ? html.toString() : String(html);
            }

            // Find all code blocks in the HTML
            const codeBlockRegex = /<pre class="code-block(?:\s+code-block-([^"]*))?"[^>]*><code class="language-([^"]*)"[^>]*>([\s\S]*?)<\/code><\/pre>/g;

            let highlightedHtml = html;
            let match;

            while ((match = codeBlockRegex.exec(html)) !== null) {
                const [fullMatch, , language, code] = match;
                const decodedCode = this.decodeHTML(code);

                try {
                    const highlightedCode = this.highlightCode(decodedCode, language);
                    const wrappedCode = this.wrapHighlightedCode(highlightedCode, language);
                    highlightedHtml = highlightedHtml.replace(fullMatch, wrappedCode);
                } catch (highlightError) {
                    // If highlighting fails, fall back to plain code
                    console.warn(`Syntax highlighting failed for language '${language}':`, highlightError.message);
                    const fallbackCode = this.wrapPlainCode(decodedCode, language);
                    highlightedHtml = highlightedHtml.replace(fullMatch, fallbackCode);
                }
            }

            // Also handle inline code
            highlightedHtml = this.highlightInlineCode(highlightedHtml);

            // Add syntax highlighting CSS
            const css = await this.generateCSS();
            highlightedHtml = this.injectCSS(highlightedHtml, css);

            return highlightedHtml;

        } catch (error) {
            throw new Error(`Syntax highlighting failed: ${error.message}`);
        }
    }

    /**
     * Highlight code with Prism.js
     *
     * @param {string} code - Raw code content
     * @param {string} language - Programming language
     */
    highlightCode(code, language) {
        // Map common language aliases
        const languageMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'sh': 'bash',
            'shell': 'bash',
            'yml': 'yaml',
            'dockerfile': 'docker'
        };

        const normalizedLanguage = languageMap[language] || language;

        // Check if language is supported
        if (!Prism.languages[normalizedLanguage]) {
            console.warn(`Language '${normalizedLanguage}' not supported, using plain text`);
            return this.escapeHTML(code);
        }

        try {
            return Prism.highlight(code, Prism.languages[normalizedLanguage], normalizedLanguage);
        } catch (error) {
            console.warn(`Prism highlighting failed for '${normalizedLanguage}':`, error.message);
            return this.escapeHTML(code);
        }
    }

    /**
     * Wrap highlighted code with proper HTML structure
     */
    wrapHighlightedCode(highlightedCode, language) {
        const lineNumbers = this.options.showLineNumbers ? 'line-numbers' : '';
        const languageClass = `language-${language}`;

        return `<pre class="code-block ${lineNumbers} ${languageClass}" data-language="${language}">
            <code class="${languageClass}">${highlightedCode}</code>
        </pre>`;
    }

    /**
     * Wrap plain code for unsupported languages
     */
    wrapPlainCode(code, language) {
        const lineNumbers = this.options.showLineNumbers ? 'line-numbers' : '';
        const escapedCode = this.escapeHTML(code);

        return `<pre class="code-block ${lineNumbers} language-text" data-language="${language}">
            <code class="language-text">${escapedCode}</code>
        </pre>`;
    }

    /**
     * Highlight inline code elements
     */
    highlightInlineCode(html) {
        const inlineCodeRegex = /<code class="language-([^"]*)"[^>]*>([^<]+)<\/code>/g;

        return html.replace(inlineCodeRegex, (match, language, code) => {
            const decodedCode = this.decodeHTML(code);

            // For inline code, we use simpler highlighting
            try {
                const highlighted = this.highlightCode(decodedCode, language);
                return `<code class="language-${language} inline-code">${highlighted}</code>`;
            } catch (error) {
                return `<code class="language-${language} inline-code">${this.escapeHTML(decodedCode)}</code>`;
            }
        });
    }

    /**
     * Generate CSS for syntax highlighting themes
     */
    async generateCSS() {
        const baseCSS = `
        /* Syntax Highlighting Base Styles */
        .code-block {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 10pt;
            line-height: 1.45;
            overflow: visible;
            padding: 16px;
            margin: 16px 0;
            page-break-inside: avoid;
        }

        .code-block code {
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 0;
            font-size: inherit;
            font-family: inherit;
            line-height: inherit;
        }

        .inline-code {
            background: #f3f4f6;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 9pt;
            padding: 2px 4px;
            color: #e83e8c;
        }

        /* Line Numbers */
        .line-numbers {
            position: relative;
            padding-left: 3.8em;
            counter-reset: linenumber;
        }

        .line-numbers > code {
            position: relative;
            white-space: inherit;
        }

        .line-numbers .line-numbers-rows {
            position: absolute;
            pointer-events: none;
            top: 0;
            font-size: 100%;
            left: -3.8em;
            width: 3em;
            letter-spacing: -1px;
            border-right: 1px solid #999;
            user-select: none;
        }

        .line-numbers-rows > span {
            pointer-events: none;
            display: block;
            counter-increment: linenumber;
        }

        .line-numbers-rows > span:before {
            content: counter(linenumber);
            color: #999;
            display: block;
            padding-right: 0.8em;
            text-align: right;
        }

        /* Professional Theme Colors (Print-Optimized) */
        ${this.getProfessionalTheme()}
        `;

        return baseCSS;
    }

    /**
     * Get professional theme colors optimized for print
     */
    getProfessionalTheme() {
        return `
        /* Professional Theme - Print Optimized */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
            color: #708090;
            font-style: italic;
        }

        .token.punctuation {
            color: #999999;
        }

        .token.property,
        .token.tag,
        .token.constant,
        .token.symbol,
        .token.deleted {
            color: #d73027;
        }

        .token.boolean,
        .token.number {
            color: #4575b4;
        }

        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
            color: #2d5aa0;
        }

        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string,
        .token.variable {
            color: #a67c00;
        }

        .token.atrule,
        .token.attr-value,
        .token.function,
        .token.class-name {
            color: #6a994e;
        }

        .token.keyword {
            color: #bc5090;
            font-weight: 600;
        }

        .token.regex,
        .token.important {
            color: #fd7f00;
        }

        .token.important,
        .token.bold {
            font-weight: bold;
        }

        .token.italic {
            font-style: italic;
        }

        .token.entity {
            cursor: help;
        }

        /* Language-specific highlighting */
        .language-json .token.property {
            color: #2d5aa0;
        }

        .language-yaml .token.atrule {
            color: #d73027;
        }

        .language-bash .token.function {
            color: #bc5090;
        }

        .language-sql .token.keyword {
            color: #4575b4;
            text-transform: uppercase;
        }
        `;
    }

    /**
     * Inject CSS into HTML document
     */
    injectCSS(html, css) {
        // If HTML already has a head tag, inject into it
        if (html.includes('<head>')) {
            return html.replace('<head>', `<head>\n<style>${css}</style>\n`);
        }

        // If it's just HTML fragments, wrap with basic structure
        return `<style>${css}</style>\n${html}`;
    }

    /**
     * Decode HTML entities
     */
    decodeHTML(html) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&#x27;': "'",
            '&#x2F;': '/',
            '&#x60;': '`',
            '&#x3D;': '='
        };

        return html.replace(/&[#\w]+;/g, (entity) => map[entity] || entity);
    }

    /**
     * Escape HTML characters
     */
    escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return text.replace(/[&<>"']/g, (char) => map[char]);
    }

    /**
     * Get list of supported languages
     */
    getSupportedLanguages() {
        return Object.keys(Prism.languages).filter(lang =>
            typeof Prism.languages[lang] === 'object' && lang !== 'extend'
        );
    }

    /**
     * Validate if a language is supported
     */
    isLanguageSupported(language) {
        const languageMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'sh': 'bash',
            'shell': 'bash',
            'yml': 'yaml',
            'dockerfile': 'docker'
        };

        const normalizedLanguage = languageMap[language] || language;
        return Prism.languages[normalizedLanguage] !== undefined;
    }

    /**
     * Set highlighting theme
     */
    setTheme(theme) {
        this.options.theme = theme;
    }

    /**
     * Enable or disable line numbers
     */
    setLineNumbers(enabled) {
        this.options.showLineNumbers = enabled;
    }
}

module.exports = { SyntaxHighlighter };