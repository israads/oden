/**
 * SEO Specialized Agent
 *
 * Analyzes meta tags, structured data, URL structure, internal linking,
 * heading hierarchy, page performance for SEO, and Core Web Vitals metrics.
 *
 * @version 2.5.0
 * @since 2026-02-18T21:33:25Z
 */

const BaseSpecializedAgent = require('./base-agent');
const fs = require('fs').promises;
const path = require('path');

class SEOAgent extends BaseSpecializedAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: 'seo-agent',
            description: 'SEO analysis and optimization recommendations'
        });

        // SEO patterns and requirements
        this.seoPatterns = {
            // Essential meta tags
            metaTags: [
                { pattern: /<meta\s+name="description"/i, required: true, message: 'Meta description is present' },
                { pattern: /<meta\s+name="keywords"/i, required: false, message: 'Meta keywords (legacy, not required)' },
                { pattern: /<meta\s+name="viewport"/i, required: true, message: 'Viewport meta tag for mobile' },
                { pattern: /<meta\s+charset/i, required: true, message: 'Character encoding declaration' },
                { pattern: /<meta\s+name="robots"/i, required: false, message: 'Robots meta tag for crawl control' }
            ],

            // Open Graph tags
            openGraph: [
                { pattern: /<meta\s+property="og:title"/i, tag: 'og:title' },
                { pattern: /<meta\s+property="og:description"/i, tag: 'og:description' },
                { pattern: /<meta\s+property="og:image"/i, tag: 'og:image' },
                { pattern: /<meta\s+property="og:url"/i, tag: 'og:url' },
                { pattern: /<meta\s+property="og:type"/i, tag: 'og:type' },
                { pattern: /<meta\s+property="og:site_name"/i, tag: 'og:site_name' }
            ],

            // Twitter Card tags
            twitterCard: [
                { pattern: /<meta\s+name="twitter:card"/i, tag: 'twitter:card' },
                { pattern: /<meta\s+name="twitter:title"/i, tag: 'twitter:title' },
                { pattern: /<meta\s+name="twitter:description"/i, tag: 'twitter:description' },
                { pattern: /<meta\s+name="twitter:image"/i, tag: 'twitter:image' }
            ],

            // Structured data
            structuredData: [
                { pattern: /<script[^>]*type="application\/ld\+json"/i, type: 'JSON-LD' },
                { pattern: /itemscope|itemtype|itemprop/i, type: 'Microdata' },
                { pattern: /vocab="[^"]*schema\.org"/i, type: 'RDFa' }
            ],

            // URL and linking patterns
            urlPatterns: [
                { pattern: /href="[^"]*\s[^"]*"/i, severity: 'medium', message: 'URLs should not contain spaces' },
                { pattern: /href="[^"]*\?[^"]*&amp;[^"]*"/i, severity: 'low', message: 'URLs with multiple parameters should be clean' },
                { pattern: /href="#"/i, severity: 'low', message: 'Placeholder links with href="#" should have proper URLs' }
            ],

            // Content optimization
            contentPatterns: [
                { pattern: /<h1[^>]*>.*?<\/h1>/i, required: true, message: 'H1 tag should be present and unique' },
                { pattern: /<title>.*?<\/title>/i, required: true, message: 'Title tag is essential for SEO' },
                { pattern: /<img[^>]*alt=""/i, severity: 'medium', message: 'Images with empty alt text miss SEO opportunity' },
                { pattern: /<a[^>]*href="[^"]*"[^>]*>.*?<\/a>/gi, type: 'internal-link', message: 'Internal links found' }
            ]
        };

        // Core Web Vitals thresholds
        this.coreWebVitals = {
            lcp: { good: 2.5, poor: 4.0, unit: 'seconds' }, // Largest Contentful Paint
            fid: { good: 100, poor: 300, unit: 'ms' },       // First Input Delay
            cls: { good: 0.1, poor: 0.25, unit: 'score' }   // Cumulative Layout Shift
        };

        // Common SEO issues
        this.commonIssues = [
            {
                pattern: /<title>.*?<\/title>.*?<title>/is,
                severity: 'high',
                category: 'duplicate-title',
                message: 'Multiple title tags detected'
            },
            {
                pattern: /<h1[^>]*>.*?<\/h1>.*?<h1[^>]*>/is,
                severity: 'high',
                category: 'multiple-h1',
                message: 'Multiple H1 tags found - should be unique per page'
            },
            {
                pattern: /<meta\s+name="description"\s+content="[^"]{1,120}">/i,
                severity: 'medium',
                category: 'short-description',
                message: 'Meta description might be too short (under 120 chars)'
            },
            {
                pattern: /<meta\s+name="description"\s+content="[^"]{160,}">/i,
                severity: 'medium',
                category: 'long-description',
                message: 'Meta description might be too long (over 160 chars)'
            }
        ];
    }

    getAgentType() {
        return 'seo';
    }

    getRequiredTools() {
        return ['node']; // Basic Node.js for file processing
    }

    /**
     * Perform comprehensive SEO analysis
     */
    async performAnalysis(projectInfo) {
        const analyses = [
            this.analyzeMetaTags(projectInfo),
            this.checkStructuredData(projectInfo),
            this.validateHeadingStructure(projectInfo),
            this.analyzeUrlStructure(projectInfo),
            this.checkInternalLinking(projectInfo),
            this.analyzePagePerformance(projectInfo),
            this.checkSitemapAndRobots(projectInfo),
            this.validateSocialMediaTags(projectInfo),
            this.analyzeContentOptimization(projectInfo),
            this.checkMobileOptimization(projectInfo)
        ];

        const results = await Promise.allSettled(analyses);

        // Process results and handle any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`SEO analysis step ${index + 1} failed:`, result.reason);
            }
        });

        return this.results;
    }

    /**
     * Analyze meta tags and title optimization
     */
    async analyzeMetaTags(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Check for required meta tags
                for (const metaTag of this.seoPatterns.metaTags) {
                    const hasTag = metaTag.pattern.test(content);

                    if (metaTag.required && !hasTag) {
                        this.addFinding(
                            'high',
                            'missing-meta-tags',
                            `Missing required meta tag: ${metaTag.message}`,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Add the missing meta tag to improve SEO',
                                fixSuggestion: this.getMetaTagSuggestion(metaTag.pattern),
                                confidence: 0.9,
                                impact: 'high',
                                effort: 'low',
                                tags: ['meta-tags', 'seo-basics', 'on-page-seo']
                            }
                        );
                    }
                }

                // Analyze title tag
                const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) {
                    const titleText = titleMatch[1].trim();
                    const titleLength = titleText.length;

                    if (titleLength < 30) {
                        this.addFinding(
                            'medium',
                            'title-optimization',
                            'Title tag is too short (under 30 characters)',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Expand title to 30-60 characters for better SEO',
                                fixSuggestion: 'Create descriptive, keyword-rich titles between 30-60 characters',
                                confidence: 0.8,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['title-tag', 'content-optimization'],
                                metadata: { currentLength: titleLength, titleText }
                            }
                        );
                    } else if (titleLength > 60) {
                        this.addFinding(
                            'medium',
                            'title-optimization',
                            'Title tag is too long (over 60 characters)',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Shorten title to 30-60 characters to avoid truncation',
                                fixSuggestion: 'Keep important keywords at the beginning of the title',
                                confidence: 0.8,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['title-tag', 'content-optimization'],
                                metadata: { currentLength: titleLength, titleText }
                            }
                        );
                    }
                }

                // Analyze meta description
                const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
                if (descMatch) {
                    const descText = descMatch[1].trim();
                    const descLength = descText.length;

                    if (descLength < 120) {
                        this.addFinding(
                            'medium',
                            'meta-description',
                            'Meta description is too short (under 120 characters)',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Expand meta description to 120-160 characters',
                                confidence: 0.7,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['meta-description', 'snippet-optimization'],
                                metadata: { currentLength: descLength }
                            }
                        );
                    } else if (descLength > 160) {
                        this.addFinding(
                            'medium',
                            'meta-description',
                            'Meta description is too long (over 160 characters)',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Shorten meta description to 120-160 characters',
                                confidence: 0.7,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['meta-description', 'snippet-optimization'],
                                metadata: { currentLength: descLength }
                            }
                        );
                    }
                }

                // Check for common meta tag issues
                for (const issue of this.commonIssues) {
                    if (issue.pattern.test(content)) {
                        this.addFinding(
                            issue.severity,
                            issue.category,
                            issue.message,
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: this.getRecommendationForIssue(issue.category),
                                confidence: 0.8,
                                impact: issue.severity,
                                effort: 'low',
                                tags: ['meta-tags', issue.category]
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze meta tags in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check structured data implementation
     */
    async checkStructuredData(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                let hasStructuredData = false;
                let structuredDataTypes = [];

                // Check for different types of structured data
                for (const sdType of this.seoPatterns.structuredData) {
                    if (sdType.pattern.test(content)) {
                        hasStructuredData = true;
                        structuredDataTypes.push(sdType.type);
                    }
                }

                if (hasStructuredData) {
                    this.addFinding(
                        'info',
                        'structured-data',
                        `Structured data found: ${structuredDataTypes.join(', ')}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Validate structured data with Google\'s Rich Results Test',
                            confidence: 0.8,
                            impact: 'low',
                            effort: 'low',
                            tags: ['structured-data', 'rich-snippets'],
                            metadata: { types: structuredDataTypes }
                        }
                    );

                    // Validate JSON-LD if present
                    if (structuredDataTypes.includes('JSON-LD')) {
                        await this.validateJsonLd(content, file, projectInfo);
                    }
                } else {
                    // Check if this looks like a content page that would benefit from structured data
                    const hasContent = /article|blog|product|event|recipe|review|faq/.test(content.toLowerCase());
                    if (hasContent) {
                        this.addFinding(
                            'medium',
                            'missing-structured-data',
                            'Page could benefit from structured data markup',
                            {
                                file: path.relative(projectInfo.root, file),
                                recommendation: 'Add JSON-LD structured data for better search results',
                                fixSuggestion: 'Implement Schema.org markup for articles, products, or other relevant content types',
                                references: [
                                    'https://schema.org/',
                                    'https://developers.google.com/search/docs/advanced/structured-data'
                                ],
                                confidence: 0.6,
                                impact: 'medium',
                                effort: 'medium',
                                tags: ['structured-data', 'rich-snippets', 'content-markup']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not analyze structured data in ${file}:`, error.message);
            }
        }
    }

    /**
     * Validate heading structure for SEO
     */
    async validateHeadingStructure(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Extract all headings
                const headingPattern = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
                const headings = [];
                let match;

                while ((match = headingPattern.exec(content)) !== null) {
                    const level = parseInt(match[1]);
                    const text = match[2].replace(/<[^>]*>/g, '').trim();
                    const lineNumber = this.findLineNumber(lines, match[0]);

                    headings.push({ level, text, line: lineNumber, match: match[0] });
                }

                if (headings.length === 0) {
                    this.addFinding(
                        'high',
                        'missing-headings',
                        'No heading tags found - important for SEO structure',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add hierarchical heading structure (H1, H2, H3, etc.)',
                            fixSuggestion: 'Start with one H1 for main topic, then use H2-H6 for subsections',
                            confidence: 0.8,
                            impact: 'high',
                            effort: 'medium',
                            tags: ['headings', 'content-structure', 'on-page-seo']
                        }
                    );
                    continue;
                }

                // Check for H1 presence and uniqueness
                const h1Tags = headings.filter(h => h.level === 1);
                if (h1Tags.length === 0) {
                    this.addFinding(
                        'high',
                        'missing-h1',
                        'No H1 tag found - essential for SEO',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add exactly one H1 tag that describes the main topic',
                            fixSuggestion: '<h1>Main Topic/Page Title</h1>',
                            confidence: 0.9,
                            impact: 'high',
                            effort: 'low',
                            tags: ['h1-tag', 'content-structure', 'on-page-seo']
                        }
                    );
                } else if (h1Tags.length > 1) {
                    this.addFinding(
                        'high',
                        'multiple-h1',
                        `Multiple H1 tags found (${h1Tags.length}) - should be unique per page`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Use only one H1 per page, convert others to H2-H6',
                            confidence: 0.9,
                            impact: 'high',
                            effort: 'low',
                            tags: ['h1-tag', 'content-structure', 'duplicate-content']
                        }
                    );
                }

                // Validate heading hierarchy
                for (let i = 1; i < headings.length; i++) {
                    const current = headings[i];
                    const previous = headings[i - 1];

                    if (current.level > previous.level + 1) {
                        this.addFinding(
                            'medium',
                            'heading-hierarchy',
                            `Heading level skipped: H${previous.level} to H${current.level}`,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: current.line,
                                recommendation: 'Maintain sequential heading hierarchy for better SEO',
                                fixSuggestion: `Use H${previous.level + 1} instead of H${current.level}`,
                                confidence: 0.7,
                                impact: 'medium',
                                effort: 'low',
                                tags: ['heading-hierarchy', 'content-structure']
                            }
                        );
                    }
                }

                // Check heading content quality
                for (const heading of headings) {
                    if (heading.text.length < 5) {
                        this.addFinding(
                            'low',
                            'short-heading',
                            `Very short heading content: "${heading.text}"`,
                            {
                                file: path.relative(projectInfo.root, file),
                                line: heading.line,
                                recommendation: 'Use descriptive headings that summarize section content',
                                confidence: 0.6,
                                impact: 'low',
                                effort: 'low',
                                tags: ['heading-quality', 'content-optimization']
                            }
                        );
                    }
                }
            } catch (error) {
                console.warn(`Could not validate heading structure in ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze URL structure
     */
    async analyzeUrlStructure(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Extract internal links
                const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>/gi;
                const links = [];
                let match;

                while ((match = linkPattern.exec(content)) !== null) {
                    const url = match[1];
                    if (!url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
                        links.push(url);
                    }
                }

                // Analyze URL patterns
                for (const url of links) {
                    // Check for SEO-unfriendly URL patterns
                    const urlIssues = [
                        {
                            pattern: /\s/,
                            severity: 'medium',
                            message: 'URL contains spaces',
                            fix: 'Replace spaces with hyphens or URL encoding'
                        },
                        {
                            pattern: /[A-Z]/,
                            severity: 'low',
                            message: 'URL contains uppercase letters',
                            fix: 'Use lowercase URLs for consistency'
                        },
                        {
                            pattern: /_/,
                            severity: 'low',
                            message: 'URL contains underscores',
                            fix: 'Use hyphens instead of underscores'
                        },
                        {
                            pattern: /\?.*&.*&/,
                            severity: 'low',
                            message: 'URL has many parameters',
                            fix: 'Consider cleaner URL structure'
                        }
                    ];

                    for (const issue of urlIssues) {
                        if (issue.pattern.test(url)) {
                            this.addFinding(
                                issue.severity,
                                'url-structure',
                                `${issue.message}: ${url}`,
                                {
                                    file: path.relative(projectInfo.root, file),
                                    recommendation: issue.fix,
                                    confidence: 0.7,
                                    impact: issue.severity,
                                    effort: 'medium',
                                    tags: ['url-structure', 'technical-seo'],
                                    metadata: { url }
                                }
                            );
                        }
                    }
                }

                // Check for deep URL structures
                const deepUrls = links.filter(url => (url.match(/\//g) || []).length > 3);
                if (deepUrls.length > 0) {
                    this.addFinding(
                        'low',
                        'url-depth',
                        `${deepUrls.length} URLs with deep structure (>3 levels)`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider flattening URL structure for better crawlability',
                            confidence: 0.5,
                            impact: 'low',
                            effort: 'high',
                            tags: ['url-structure', 'site-architecture'],
                            metadata: { deepUrlCount: deepUrls.length }
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze URL structure in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check internal linking strategy
     */
    async checkInternalLinking(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);
        const allInternalLinks = [];
        const pageLinks = {};

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const fileName = path.relative(projectInfo.root, file);

                // Extract internal links
                const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
                const links = [];
                let match;

                while ((match = linkPattern.exec(content)) !== null) {
                    const url = match[1];
                    const anchorText = match[2].replace(/<[^>]*>/g, '').trim();

                    if (!url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
                        links.push({ url, anchorText, sourceFile: fileName });
                        allInternalLinks.push({ url, anchorText, sourceFile: fileName });
                    }
                }

                pageLinks[fileName] = links;

                // Check for pages without outgoing internal links
                if (links.length === 0 && content.length > 1000) { // Only for substantial pages
                    this.addFinding(
                        'medium',
                        'internal-linking',
                        'Page has no internal links - missing link equity opportunities',
                        {
                            file: fileName,
                            recommendation: 'Add relevant internal links to improve site navigation and SEO',
                            fixSuggestion: 'Link to related content, categories, or important pages',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['internal-linking', 'site-architecture', 'link-equity']
                        }
                    );
                }

                // Check for poor anchor text
                const poorAnchorText = links.filter(link =>
                    /^(click here|here|more|read more|link)$/i.test(link.anchorText)
                );

                if (poorAnchorText.length > 0) {
                    this.addFinding(
                        'medium',
                        'anchor-text-optimization',
                        `${poorAnchorText.length} links with generic anchor text`,
                        {
                            file: fileName,
                            recommendation: 'Use descriptive anchor text that describes the linked content',
                            fixSuggestion: 'Replace generic text with keywords describing the destination',
                            confidence: 0.8,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['anchor-text', 'internal-linking', 'keyword-optimization']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze internal linking in ${file}:`, error.message);
            }
        }

        // Analyze overall internal linking patterns
        if (allInternalLinks.length > 0) {
            const linkDistribution = {};
            allInternalLinks.forEach(link => {
                linkDistribution[link.url] = (linkDistribution[link.url] || 0) + 1;
            });

            // Find orphaned pages (pages not linked to internally)
            const linkedPages = new Set(Object.keys(linkDistribution));
            const allPages = new Set(Object.keys(pageLinks));
            const orphanedPages = [...allPages].filter(page => !linkedPages.has(page));

            if (orphanedPages.length > 0) {
                this.addFinding(
                    'medium',
                    'orphaned-pages',
                    `${orphanedPages.length} pages have no incoming internal links`,
                    {
                        recommendation: 'Add internal links to these pages to improve discoverability',
                        confidence: 0.7,
                        impact: 'medium',
                        effort: 'medium',
                        tags: ['internal-linking', 'orphaned-pages', 'site-architecture'],
                        metadata: { orphanedPages }
                    }
                );
            }
        }
    }

    /**
     * Analyze page performance for SEO impact
     */
    async analyzePagePerformance(projectInfo) {
        // This is a basic analysis - in practice would integrate with real performance tools
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const fileSize = Buffer.byteLength(content, 'utf8');

                // Check for performance issues that affect SEO
                const performanceIssues = [
                    {
                        pattern: /<script[^>]*src="[^"]*"[^>]*><\/script>/g,
                        type: 'external-scripts',
                        message: 'External scripts found'
                    },
                    {
                        pattern: /<img[^>]*src="[^"]*"/g,
                        type: 'images',
                        message: 'Images found'
                    },
                    {
                        pattern: /<link[^>]*rel="stylesheet"/g,
                        type: 'stylesheets',
                        message: 'External stylesheets found'
                    }
                ];

                const resourceCounts = {};
                for (const issue of performanceIssues) {
                    const matches = content.match(issue.pattern);
                    resourceCounts[issue.type] = matches ? matches.length : 0;
                }

                // Large HTML file size
                if (fileSize > 100000) { // 100KB
                    this.addFinding(
                        'medium',
                        'page-size',
                        `Large HTML file size: ${Math.round(fileSize / 1024)}KB`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider optimizing HTML size for faster loading',
                            fixSuggestion: 'Minify HTML, optimize images, lazy load content',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['performance', 'page-speed', 'core-web-vitals'],
                            metadata: { fileSizeKB: Math.round(fileSize / 1024) }
                        }
                    );
                }

                // Too many external resources
                const totalResources = Object.values(resourceCounts).reduce((sum, count) => sum + count, 0);
                if (totalResources > 20) {
                    this.addFinding(
                        'medium',
                        'resource-count',
                        `High number of external resources: ${totalResources}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Reduce HTTP requests by combining/minifying resources',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['performance', 'http-requests', 'optimization'],
                            metadata: resourceCounts
                        }
                    );
                }

                // Check for images without optimization attributes
                const images = content.match(/<img[^>]*>/g) || [];
                const unoptimizedImages = images.filter(img =>
                    !img.includes('loading="lazy"') && !img.includes('decoding="async"')
                ).length;

                if (unoptimizedImages > 0) {
                    this.addFinding(
                        'low',
                        'image-optimization',
                        `${unoptimizedImages} images without lazy loading or async decoding`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add loading="lazy" and decoding="async" to images',
                            fixSuggestion: '<img src="..." loading="lazy" decoding="async" alt="...">',
                            confidence: 0.7,
                            impact: 'low',
                            effort: 'low',
                            tags: ['image-optimization', 'performance', 'lazy-loading']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze page performance in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check sitemap and robots.txt
     */
    async checkSitemapAndRobots(projectInfo) {
        const publicDir = path.join(projectInfo.root, 'public');
        const rootFiles = [
            { file: 'sitemap.xml', required: true, message: 'XML sitemap helps search engines crawl your site' },
            { file: 'robots.txt', required: true, message: 'Robots.txt provides crawl instructions' },
            { file: 'sitemap.json', required: false, message: 'JSON sitemap alternative' }
        ];

        for (const sitemapFile of rootFiles) {
            const filePaths = [
                path.join(projectInfo.root, sitemapFile.file),
                path.join(publicDir, sitemapFile.file)
            ];

            let fileExists = false;
            let existingPath = null;

            for (const filePath of filePaths) {
                try {
                    await fs.access(filePath);
                    fileExists = true;
                    existingPath = filePath;
                    break;
                } catch (error) {
                    // File doesn't exist, continue checking
                }
            }

            if (sitemapFile.required && !fileExists) {
                this.addFinding(
                    'high',
                    'missing-sitemap-robots',
                    `Missing ${sitemapFile.file}: ${sitemapFile.message}`,
                    {
                        recommendation: `Create ${sitemapFile.file} in your public directory`,
                        fixSuggestion: this.getSitemapRobotsSuggestion(sitemapFile.file),
                        references: [
                            'https://developers.google.com/search/docs/advanced/sitemaps/overview',
                            'https://developers.google.com/search/docs/advanced/robots/intro'
                        ],
                        confidence: 0.9,
                        impact: 'high',
                        effort: 'low',
                        tags: ['sitemap', 'robots-txt', 'technical-seo', 'crawlability']
                    }
                );
            } else if (fileExists) {
                // Basic validation of existing files
                try {
                    const content = await fs.readFile(existingPath, 'utf8');
                    await this.validateSitemapRobots(sitemapFile.file, content, existingPath, projectInfo);
                } catch (error) {
                    console.warn(`Could not validate ${sitemapFile.file}:`, error.message);
                }
            }
        }
    }

    /**
     * Validate social media tags (Open Graph, Twitter Card)
     */
    async validateSocialMediaTags(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check Open Graph tags
                const ogTags = this.seoPatterns.openGraph.filter(og =>
                    og.pattern.test(content)
                ).map(og => og.tag);

                const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
                const missingOgTags = requiredOgTags.filter(tag => !ogTags.includes(tag));

                if (missingOgTags.length > 0 && ogTags.length > 0) {
                    this.addFinding(
                        'medium',
                        'incomplete-open-graph',
                        `Missing Open Graph tags: ${missingOgTags.join(', ')}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Complete Open Graph implementation for better social sharing',
                            fixSuggestion: 'Add missing meta property tags for Open Graph',
                            confidence: 0.8,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['open-graph', 'social-media', 'sharing']
                        }
                    );
                } else if (ogTags.length === 0) {
                    this.addFinding(
                        'low',
                        'missing-open-graph',
                        'No Open Graph tags found - consider adding for social sharing',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add Open Graph tags for better social media sharing',
                            fixSuggestion: 'Implement og:title, og:description, og:image, og:url',
                            confidence: 0.6,
                            impact: 'low',
                            effort: 'medium',
                            tags: ['open-graph', 'social-media', 'sharing']
                        }
                    );
                }

                // Check Twitter Card tags
                const twitterTags = this.seoPatterns.twitterCard.filter(twitter =>
                    twitter.pattern.test(content)
                ).map(twitter => twitter.tag);

                if (twitterTags.length > 0 && !twitterTags.includes('twitter:card')) {
                    this.addFinding(
                        'medium',
                        'incomplete-twitter-card',
                        'Twitter Card tags present but missing twitter:card type',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add twitter:card meta tag to specify card type',
                            fixSuggestion: '<meta name="twitter:card" content="summary_large_image">',
                            confidence: 0.8,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['twitter-card', 'social-media', 'sharing']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not validate social media tags in ${file}:`, error.message);
            }
        }
    }

    /**
     * Analyze content optimization
     */
    async analyzeContentOptimization(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Extract text content (basic approach)
                const textContent = content
                    .replace(/<script[^>]*>.*?<\/script>/gis, '')
                    .replace(/<style[^>]*>.*?<\/style>/gis, '')
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                const wordCount = textContent.split(/\s+/).length;
                const readableLength = textContent.length;

                // Content length analysis
                if (wordCount < 300) {
                    this.addFinding(
                        'medium',
                        'thin-content',
                        `Low word count: ${wordCount} words`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Consider expanding content to at least 300 words for better SEO',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'high',
                            tags: ['content-length', 'thin-content', 'content-quality'],
                            metadata: { wordCount }
                        }
                    );
                }

                // Check for duplicate content indicators
                const repetitivePatterns = this.findRepetitiveContent(textContent);
                if (repetitivePatterns.length > 0) {
                    this.addFinding(
                        'medium',
                        'repetitive-content',
                        `Potentially repetitive content patterns found: ${repetitivePatterns.length}`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Review and vary content to avoid repetition',
                            confidence: 0.5,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['content-quality', 'duplicate-content']
                        }
                    );
                }

                // Check for alt text on images
                const images = content.match(/<img[^>]*>/gi) || [];
                const imagesWithoutAlt = images.filter(img => !img.includes('alt=')).length;
                const imagesWithEmptyAlt = images.filter(img => /alt=""\s*/.test(img)).length;

                if (imagesWithoutAlt > 0) {
                    this.addFinding(
                        'high',
                        'missing-alt-text',
                        `${imagesWithoutAlt} images missing alt text`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add descriptive alt text to all images',
                            fixSuggestion: '<img src="..." alt="Descriptive text about the image">',
                            confidence: 0.9,
                            impact: 'high',
                            effort: 'low',
                            tags: ['alt-text', 'image-seo', 'accessibility']
                        }
                    );
                }

                if (imagesWithEmptyAlt > 0) {
                    this.addFinding(
                        'medium',
                        'empty-alt-text',
                        `${imagesWithEmptyAlt} images with empty alt text`,
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add descriptive alt text or use alt="" only for decorative images',
                            confidence: 0.7,
                            impact: 'medium',
                            effort: 'low',
                            tags: ['alt-text', 'image-seo']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not analyze content optimization in ${file}:`, error.message);
            }
        }
    }

    /**
     * Check mobile optimization
     */
    async checkMobileOptimization(projectInfo) {
        const htmlFiles = await this.getHtmlFiles(projectInfo.root);

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Check for viewport meta tag
                const hasViewport = /<meta\s+name="viewport"/i.test(content);
                if (!hasViewport) {
                    this.addFinding(
                        'high',
                        'missing-viewport',
                        'Missing viewport meta tag - critical for mobile SEO',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add viewport meta tag for mobile responsiveness',
                            fixSuggestion: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                            references: [
                                'https://developers.google.com/search/docs/advanced/mobile/mobile-sites-mobile-first-indexing'
                            ],
                            confidence: 0.9,
                            impact: 'high',
                            effort: 'low',
                            tags: ['mobile-seo', 'viewport', 'responsive-design']
                        }
                    );
                }

                // Check for mobile-specific optimizations
                const mobileOptimizations = [
                    { pattern: /@media.*max-width/i, feature: 'Responsive CSS queries' },
                    { pattern: /touch-icon/i, feature: 'Apple touch icons' },
                    { pattern: /theme-color/i, feature: 'Theme color for mobile browsers' }
                ];

                const presentOptimizations = mobileOptimizations.filter(opt =>
                    opt.pattern.test(content)
                );

                if (presentOptimizations.length === 0) {
                    this.addFinding(
                        'medium',
                        'mobile-optimization',
                        'Limited mobile-specific optimizations detected',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Add mobile-specific optimizations (touch icons, theme colors, etc.)',
                            confidence: 0.6,
                            impact: 'medium',
                            effort: 'medium',
                            tags: ['mobile-seo', 'mobile-optimization', 'user-experience']
                        }
                    );
                }
            } catch (error) {
                console.warn(`Could not check mobile optimization in ${file}:`, error.message);
            }
        }
    }

    /**
     * Helper methods
     */

    async getHtmlFiles(rootDir) {
        const files = [];
        const extensions = ['.html', '.htm'];

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

        // If no HTML files found, check for common framework files
        if (files.length === 0) {
            const frameworkFiles = [
                path.join(rootDir, 'pages', '*.js'),  // Next.js
                path.join(rootDir, 'src', 'App.js'),  // Create React App
                path.join(rootDir, 'src', 'main.js'), // Vue.js
            ];

            // This is a simplified check - in practice would need more sophisticated detection
        }

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

    async validateJsonLd(content, file, projectInfo) {
        const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis;
        let match;

        while ((match = jsonLdPattern.exec(content)) !== null) {
            try {
                const jsonContent = match[1].trim();
                JSON.parse(jsonContent); // Basic validation

                // Check for common Schema.org types
                const schemaTypes = ['Organization', 'Person', 'Article', 'Product', 'Event', 'Review'];
                const hasKnownType = schemaTypes.some(type => jsonContent.includes(`"@type":"${type}"`));

                if (!hasKnownType) {
                    this.addFinding(
                        'low',
                        'structured-data-validation',
                        'JSON-LD found but no recognized Schema.org type detected',
                        {
                            file: path.relative(projectInfo.root, file),
                            recommendation: 'Ensure JSON-LD uses appropriate Schema.org types',
                            confidence: 0.5,
                            impact: 'low',
                            effort: 'low',
                            tags: ['json-ld', 'schema-validation']
                        }
                    );
                }
            } catch (error) {
                this.addFinding(
                    'high',
                    'invalid-json-ld',
                    'Invalid JSON-LD syntax detected',
                    {
                        file: path.relative(projectInfo.root, file),
                        recommendation: 'Fix JSON-LD syntax errors',
                        confidence: 0.9,
                        impact: 'high',
                        effort: 'low',
                        tags: ['json-ld', 'syntax-error', 'structured-data']
                    }
                );
            }
        }
    }

    async validateSitemapRobots(fileName, content, filePath, projectInfo) {
        if (fileName === 'sitemap.xml') {
            // Basic XML sitemap validation
            if (!content.includes('<?xml')) {
                this.addFinding(
                    'medium',
                    'sitemap-validation',
                    'Sitemap.xml missing XML declaration',
                    {
                        file: path.relative(projectInfo.root, filePath),
                        recommendation: 'Add proper XML declaration to sitemap',
                        confidence: 0.8,
                        impact: 'medium',
                        effort: 'low',
                        tags: ['sitemap', 'xml-validation']
                    }
                );
            }

            const urlCount = (content.match(/<url>/g) || []).length;
            if (urlCount === 0) {
                this.addFinding(
                    'high',
                    'empty-sitemap',
                    'Sitemap.xml contains no URLs',
                    {
                        file: path.relative(projectInfo.root, filePath),
                        recommendation: 'Add URLs to sitemap for proper indexing',
                        confidence: 0.9,
                        impact: 'high',
                        effort: 'medium',
                        tags: ['sitemap', 'empty-content']
                    }
                );
            }
        } else if (fileName === 'robots.txt') {
            // Basic robots.txt validation
            if (!content.includes('User-agent:')) {
                this.addFinding(
                    'medium',
                    'robots-validation',
                    'Robots.txt missing User-agent directive',
                    {
                        file: path.relative(projectInfo.root, filePath),
                        recommendation: 'Add User-agent directive to robots.txt',
                        confidence: 0.8,
                        impact: 'medium',
                        effort: 'low',
                        tags: ['robots-txt', 'validation']
                    }
                );
            }

            if (content.includes('Sitemap:')) {
                this.addFinding(
                    'info',
                    'sitemap-reference',
                    'Robots.txt references sitemap - good practice',
                    {
                        file: path.relative(projectInfo.root, filePath),
                        recommendation: 'Ensure sitemap URL is correct and accessible',
                        confidence: 0.7,
                        impact: 'low',
                        effort: 'low',
                        tags: ['robots-txt', 'sitemap-reference']
                    }
                );
            }
        }
    }

    findRepetitiveContent(text) {
        // Simple repetition detection
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const repetitions = [];

        for (let i = 0; i < sentences.length - 1; i++) {
            for (let j = i + 1; j < sentences.length; j++) {
                const similarity = this.calculateSimilarity(sentences[i], sentences[j]);
                if (similarity > 0.8) {
                    repetitions.push({ sentence1: i, sentence2: j, similarity });
                }
            }
        }

        return repetitions;
    }

    calculateSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().split(/\s+/);
        const words2 = str2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
    }

    getMetaTagSuggestion(pattern) {
        const suggestions = {
            'description': '<meta name="description" content="Your page description here">',
            'viewport': '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            'charset': '<meta charset="UTF-8">',
            'robots': '<meta name="robots" content="index, follow">'
        };

        for (const [key, suggestion] of Object.entries(suggestions)) {
            if (pattern.source.includes(key)) {
                return suggestion;
            }
        }

        return 'Add appropriate meta tag';
    }

    getRecommendationForIssue(category) {
        const recommendations = {
            'duplicate-title': 'Ensure each page has a unique title tag',
            'multiple-h1': 'Use only one H1 per page for better SEO hierarchy',
            'short-description': 'Expand meta description to 120-160 characters',
            'long-description': 'Shorten meta description to 120-160 characters'
        };

        return recommendations[category] || 'Address this SEO issue';
    }

    getSitemapRobotsSuggestion(fileName) {
        if (fileName === 'sitemap.xml') {
            return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2023-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
        }

        if (fileName === 'robots.txt') {
            return `User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml`;
        }

        return 'Create the appropriate file';
    }

    /**
     * Get general SEO recommendations
     */
    async getGeneralRecommendations() {
        const recommendations = [
            {
                priority: 'high',
                category: 'general',
                title: 'Implement Core Web Vitals Monitoring',
                description: 'Monitor LCP, FID, and CLS for search ranking factors',
                action: 'Set up Google PageSpeed Insights or Lighthouse CI',
                estimated_effort: 'medium',
                impact: 'high'
            },
            {
                priority: 'high',
                category: 'general',
                title: 'Set up Google Search Console',
                description: 'Monitor search performance and identify issues',
                action: 'Add Google Search Console and submit sitemap',
                estimated_effort: 'low',
                impact: 'high'
            },
            {
                priority: 'medium',
                category: 'general',
                title: 'Implement SEO Testing Pipeline',
                description: 'Automated SEO testing in CI/CD',
                action: 'Add SEO linting and validation to build process',
                estimated_effort: 'medium',
                impact: 'medium'
            }
        ];

        return recommendations;
    }

    validateProject(projectInfo) {
        // SEO agent works best with web projects that have HTML content
        return projectInfo && projectInfo.root &&
               (projectInfo.type === 'web' ||
                projectInfo.framework === 'react' ||
                projectInfo.framework === 'nextjs' ||
                projectInfo.framework === 'vue' ||
                projectInfo.framework === 'angular');
    }
}

module.exports = SEOAgent;