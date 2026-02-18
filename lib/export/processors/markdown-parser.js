/**
 * Enhanced Markdown Parser for Professional PDF Export
 *
 * Features:
 * - Table of contents generation
 * - Cross-reference handling
 * - Image optimization
 * - Link processing
 * - Custom element support
 */

const MarkdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItTOC = require('markdown-it-table-of-contents');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItTaskLists = require('markdown-it-task-lists');
const markdownItContainer = require('markdown-it-container');
const fs = require('fs-extra');
const path = require('path');

class MarkdownParser {
    constructor(options = {}) {
        this.options = {
            html: true,
            linkify: true,
            typographer: true,
            breaks: false,
            ...options
        };

        this.initializeParser();
    }

    /**
     * Initialize the markdown parser with plugins
     */
    initializeParser() {
        this.md = new MarkdownIt(this.options);

        // Add anchor plugin for headers
        this.md.use(markdownItAnchor, {
            permalink: markdownItAnchor.permalink.ariaHidden({
                placement: 'before',
                class: 'header-anchor',
                symbol: '#'
            }),
            level: [1, 2, 3, 4, 5, 6],
            slugify: this.slugify
        });

        // Add table of contents plugin
        this.md.use(markdownItTOC, {
            includeLevel: [1, 2, 3, 4],
            slugify: this.slugify,
            markerPattern: /^\[\[toc\]\]$/im,
            listType: 'ol',
            format: (anchor, htmlText) => {
                return `<a href="#${anchor}" class="toc-link">${htmlText}</a>`;
            }
        });

        // Add footnotes support
        this.md.use(markdownItFootnote);

        // Add task lists support
        this.md.use(markdownItTaskLists, {
            enabled: true,
            label: true,
            labelAfter: true
        });

        // Add container support for callouts
        this.md.use(markdownItContainer, 'warning', {
            validate: (params) => params.trim().match(/^warning\s+(.*)$/),
            render: (tokens, idx) => {
                const m = tokens[idx].info.trim().match(/^warning\s+(.*)$/);
                if (tokens[idx].nesting === 1) {
                    return `<div class="callout callout-warning">
                        <div class="callout-title">${this.md.utils.escapeHtml(m[1])}</div>
                        <div class="callout-content">`;
                } else {
                    return '</div></div>\n';
                }
            }
        });

        this.md.use(markdownItContainer, 'info', {
            validate: (params) => params.trim().match(/^info\s+(.*)$/),
            render: (tokens, idx) => {
                const m = tokens[idx].info.trim().match(/^info\s+(.*)$/);
                if (tokens[idx].nesting === 1) {
                    return `<div class="callout callout-info">
                        <div class="callout-title">${this.md.utils.escapeHtml(m[1])}</div>
                        <div class="callout-content">`;
                } else {
                    return '</div></div>\n';
                }
            }
        });

        this.md.use(markdownItContainer, 'success', {
            validate: (params) => params.trim().match(/^success\s+(.*)$/),
            render: (tokens, idx) => {
                const m = tokens[idx].info.trim().match(/^success\s+(.*)$/);
                if (tokens[idx].nesting === 1) {
                    return `<div class="callout callout-success">
                        <div class="callout-title">${this.md.utils.escapeHtml(m[1])}</div>
                        <div class="callout-content">`;
                } else {
                    return '</div></div>\n';
                }
            }
        });

        // Customize rendering rules
        this.customizeRendering();
    }

    /**
     * Customize markdown rendering rules
     */
    customizeRendering() {
        // Enhance table rendering
        const defaultTableOpen = this.md.renderer.rules.table_open || function(tokens, idx, options, env) {
            return '<table>\n';
        };
        this.md.renderer.rules.table_open = function(tokens, idx, options, env) {
            return '<table class="markdown-table">\n';
        };

        // Enhance code block rendering
        const defaultCodeBlock = this.md.renderer.rules.code_block || function(tokens, idx, options, env, renderer) {
            const token = tokens[idx];
            return `<pre><code class="language-text">${this.md.utils.escapeHtml(token.content)}</code></pre>\n`;
        };

        this.md.renderer.rules.code_block = (tokens, idx, options, env, renderer) => {
            const token = tokens[idx];
            const language = this.detectLanguage(token.content);
            return `<pre class="code-block"><code class="language-${language}" data-lang="${language}">${this.md.utils.escapeHtml(token.content)}</code></pre>\n`;
        };

        // Enhanced fence rendering
        const defaultFence = this.md.renderer.rules.fence || function(tokens, idx, options, env, renderer) {
            const token = tokens[idx];
            const info = token.info ? this.md.utils.unescapeAll(token.info).trim() : '';
            let langName = '';

            if (info) {
                langName = info.split(/\s+/g)[0];
            }

            return `<pre><code class="language-${langName}">${this.md.utils.escapeHtml(token.content)}</code></pre>\n`;
        };

        this.md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
            const token = tokens[idx];
            const info = token.info ? this.md.utils.unescapeAll(token.info).trim() : '';
            let langName = '';
            let langAttrs = '';

            if (info) {
                const arr = info.split(/(\s+)/g);
                langName = arr[0];
                langAttrs = arr.slice(2).join('');
            }

            return `<pre class="code-block code-block-${langName}"><code class="language-${langName}" data-lang="${langName}"${langAttrs ? ` ${langAttrs}` : ''}>${this.md.utils.escapeHtml(token.content)}</code></pre>\n`;
        };

        // Enhance image rendering with optimization
        const defaultImage = this.md.renderer.rules.image || function(tokens, idx, options, env, renderer) {
            return renderer.renderToken(tokens, idx, options);
        };

        this.md.renderer.rules.image = (tokens, idx, options, env, renderer) => {
            const token = tokens[idx];
            const srcIndex = token.attrIndex('src');
            const titleIndex = token.attrIndex('title');
            const altIndex = token.attrIndex('alt');

            if (srcIndex >= 0) {
                const src = token.attrs[srcIndex][1];
                const alt = altIndex >= 0 ? token.attrs[altIndex][1] : '';
                const title = titleIndex >= 0 ? token.attrs[titleIndex][1] : '';

                return `<div class="image-container">
                    <img src="${src}" alt="${this.md.utils.escapeHtml(alt)}" ${title ? `title="${this.md.utils.escapeHtml(title)}"` : ''} class="markdown-image" loading="lazy">
                    ${alt ? `<div class="image-caption">${this.md.utils.escapeHtml(alt)}</div>` : ''}
                </div>\n`;
            }

            return defaultImage(tokens, idx, options, env, renderer);
        };

        // Enhanced link rendering
        const defaultLinkOpen = this.md.renderer.rules.link_open || function(tokens, idx, options, env, renderer) {
            return renderer.renderToken(tokens, idx, options);
        };

        this.md.renderer.rules.link_open = (tokens, idx, options, env, renderer) => {
            const token = tokens[idx];
            const hrefIndex = token.attrIndex('href');

            if (hrefIndex >= 0) {
                const href = token.attrs[hrefIndex][1];
                if (this.isExternalLink(href)) {
                    token.attrSet('target', '_blank');
                    token.attrSet('rel', 'noopener noreferrer');
                    token.attrSet('class', 'external-link');
                } else if (href.startsWith('#')) {
                    token.attrSet('class', 'internal-link');
                }
            }

            return defaultLinkOpen(tokens, idx, options, env, renderer);
        };
    }

    /**
     * Process markdown content with enhanced features
     *
     * @param {string} markdown - Raw markdown content
     * @param {Object} options - Processing options
     */
    async process(markdown, options = {}) {
        try {
            let processedMarkdown = markdown;

            // Pre-processing steps
            if (options.processLinks) {
                processedMarkdown = await this.processLinks(processedMarkdown);
            }

            if (options.optimizeImages) {
                processedMarkdown = await this.optimizeImages(processedMarkdown);
            }

            // Add table of contents marker if requested
            if (options.generateTOC) {
                processedMarkdown = this.addTOCMarker(processedMarkdown);
            }

            // Parse markdown to HTML
            const html = this.md.render(processedMarkdown);

            // Extract table of contents if requested
            let toc = null;
            if (options.extractTOC || options.generateTOC) {
                toc = this.extractTOC(processedMarkdown);
            }

            return {
                content: html,
                toc: toc,
                metadata: this.extractMetadata(markdown)
            };

        } catch (error) {
            throw new Error(`Markdown processing failed: ${error.message}`);
        }
    }

    /**
     * Process and validate links in markdown
     */
    async processLinks(markdown) {
        const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
        let processedMarkdown = markdown;
        const matches = [...markdown.matchAll(linkRegex)];

        for (const match of matches) {
            const [fullMatch, linkText, linkUrl] = match;

            // Check if it's a relative file link
            if (!this.isExternalLink(linkUrl) && !linkUrl.startsWith('#')) {
                // Validate file existence for relative paths
                if (await fs.pathExists(linkUrl)) {
                    // Link is valid, no changes needed
                    continue;
                } else {
                    // Add a warning comment for broken links
                    const warning = `<!-- Warning: Link "${linkUrl}" not found -->`;
                    processedMarkdown = processedMarkdown.replace(fullMatch, `${warning}${fullMatch}`);
                }
            }
        }

        return processedMarkdown;
    }

    /**
     * Optimize images for PDF output
     */
    async optimizeImages(markdown) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let processedMarkdown = markdown;
        const matches = [...markdown.matchAll(imageRegex)];

        for (const match of matches) {
            const [fullMatch, altText, imagePath] = match;

            // Check if image exists and add metadata
            if (!this.isExternalLink(imagePath) && await fs.pathExists(imagePath)) {
                try {
                    const stats = await fs.stat(imagePath);
                    const extension = path.extname(imagePath).toLowerCase();

                    // Add optimization attributes for PDF rendering
                    const optimizedImage = `![${altText}](${imagePath} "Optimized for PDF - ${Math.round(stats.size / 1024)}KB")`;
                    processedMarkdown = processedMarkdown.replace(fullMatch, optimizedImage);
                } catch (error) {
                    // If we can't read the file, leave it as is
                    continue;
                }
            }
        }

        return processedMarkdown;
    }

    /**
     * Add table of contents marker
     */
    addTOCMarker(markdown) {
        // Add TOC marker at the beginning after any frontmatter
        const frontmatterRegex = /^---[\s\S]*?---\s*/;
        const frontmatterMatch = markdown.match(frontmatterRegex);

        if (frontmatterMatch) {
            return markdown.replace(frontmatterRegex, `${frontmatterMatch[0]}\n[[toc]]\n\n`);
        } else {
            return `[[toc]]\n\n${markdown}`;
        }
    }

    /**
     * Extract table of contents from markdown
     */
    extractTOC(markdown) {
        const toc = [];
        const headerRegex = /^(#{1,6})\s+(.+)$/gm;
        let match;

        while ((match = headerRegex.exec(markdown)) !== null) {
            const level = match[1].length;
            const title = match[2];
            const anchor = this.slugify(title);

            toc.push({
                level,
                title,
                anchor,
                children: []
            });
        }

        // Build hierarchical structure
        const buildHierarchy = (items) => {
            const result = [];
            const stack = [];

            for (const item of items) {
                while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
                    stack.pop();
                }

                if (stack.length === 0) {
                    result.push(item);
                } else {
                    stack[stack.length - 1].children.push(item);
                }

                stack.push(item);
            }

            return result;
        };

        return buildHierarchy(toc);
    }

    /**
     * Extract metadata from frontmatter
     */
    extractMetadata(markdown) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        const match = markdown.match(frontmatterRegex);

        if (match) {
            try {
                const yaml = require('js-yaml');
                return yaml.load(match[1]);
            } catch (error) {
                return {};
            }
        }

        return {};
    }

    /**
     * Detect programming language from code content
     */
    detectLanguage(code) {
        const patterns = {
            javascript: /\b(function|const|let|var|=>|require|import)\b/,
            typescript: /\b(interface|type|implements|extends|public|private)\b/,
            python: /\b(def|import|from|class|if __name__)\b/,
            java: /\b(public class|private|protected|package)\b/,
            csharp: /\b(using|namespace|public class|private|protected)\b/,
            cpp: /\b(#include|using namespace|int main|std::)\b/,
            rust: /\b(fn|let|pub|impl|use|mod)\b/,
            go: /\b(package|func|import|var|:=)\b/,
            php: /<\?php|\b(function|class|public|private)\b/,
            ruby: /\b(def|class|require|include|end)\b/,
            bash: /\b(#!/bin/bash|echo|cd|ls|grep)\b/,
            sql: /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/i,
            json: /^\s*[\{\[]/,
            yaml: /^\s*\w+:\s/,
            html: /<\/?[a-z][\s\S]*>/i,
            css: /\{[\s\S]*\}/
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(code)) {
                return lang;
            }
        }

        return 'text';
    }

    /**
     * Check if a URL is external
     */
    isExternalLink(url) {
        return /^https?:\/\//.test(url) || url.startsWith('//');
    }

    /**
     * Create URL-friendly slug from text
     */
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
}

module.exports = { MarkdownParser };