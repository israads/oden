/**
 * PDF Export System Entry Point
 * Main module for the Oden PDF export functionality
 */

const { PDFGenerator } = require('./pdf-generator');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Export main function for generating PDFs from markdown documentation
 *
 * @param {Object} options - Export configuration
 * @param {string} options.input - Input file or directory path
 * @param {string} options.output - Output PDF file path
 * @param {string} options.template - Template name (professional, technical, executive)
 * @param {Object} options.branding - Brand customization options
 * @param {boolean} options.verbose - Show detailed progress
 */
async function exportToPDF(options = {}) {
    try {
        console.log(chalk.blue('🔄 Initializing PDF export...'));

        const config = {
            input: options.input || './docs',
            output: options.output || 'documentation.pdf',
            template: options.template || 'professional',
            branding: options.branding || {},
            verbose: options.verbose || false
        };

        // Validate inputs
        if (!await fs.pathExists(config.input)) {
            throw new Error(`Input path does not exist: ${config.input}`);
        }

        // Initialize PDF generator
        const pdfGenerator = new PDFGenerator();

        // Determine if input is file or directory
        const inputStat = await fs.stat(config.input);
        let result;

        if (inputStat.isFile()) {
            // Single file export
            console.log(chalk.green(`📄 Exporting single file: ${path.basename(config.input)}`));

            if (config.verbose) {
                result = await pdfGenerator.generateWithProgress(
                    {
                        content: config.input,
                        template: config.template,
                        output: config.output,
                        branding: config.branding
                    },
                    (progress) => {
                        console.log(chalk.yellow(`   ${progress.message} (${progress.percentage}%)`));
                    }
                );
            } else {
                result = await pdfGenerator.generatePDF({
                    content: config.input,
                    template: config.template,
                    output: config.output,
                    branding: config.branding
                });
            }

        } else {
            // Directory export (batch processing)
            console.log(chalk.green(`📁 Exporting directory: ${path.basename(config.input)}`));

            const markdownFiles = await findMarkdownFiles(config.input);
            if (markdownFiles.length === 0) {
                throw new Error(`No markdown files found in: ${config.input}`);
            }

            console.log(chalk.blue(`   Found ${markdownFiles.length} markdown files`));

            result = await pdfGenerator.generateBatchPDF({
                files: markdownFiles,
                template: config.template,
                output: config.output,
                branding: config.branding,
                organization: {
                    title: config.branding.projectTitle || 'Documentation',
                    sortOrder: 'alphabetical'
                }
            });
        }

        // Cleanup
        await pdfGenerator.cleanup();

        // Report results
        console.log(chalk.green('✅ PDF export completed successfully!'));
        console.log(chalk.blue(`📋 Output: ${result.outputPath}`));
        console.log(chalk.blue(`📊 File size: ${formatFileSize(result.fileSize)}`));
        console.log(chalk.blue(`📄 Pages: ${result.pageCount}`));

        return result;

    } catch (error) {
        console.error(chalk.red('❌ PDF export failed:'), error.message);
        throw error;
    }
}

/**
 * Find all markdown files recursively in a directory
 */
async function findMarkdownFiles(dirPath) {
    const files = [];
    const items = await fs.readdir(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            const subFiles = await findMarkdownFiles(itemPath);
            files.push(...subFiles);
        } else if (stat.isFile() && path.extname(item).toLowerCase() === '.md') {
            files.push(itemPath);
        }
    }

    return files.sort();
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get available templates
 */
function getAvailableTemplates() {
    return [
        {
            name: 'professional',
            description: 'Professional business template with cover page and branding',
            features: ['Cover page', 'Table of contents', 'Corporate styling', 'Header/footer']
        },
        {
            name: 'technical',
            description: 'Technical documentation template optimized for code',
            features: ['Syntax highlighting', 'API formatting', 'Monospace friendly', 'Dark themes']
        },
        {
            name: 'executive',
            description: 'Executive summary template for high-level presentations',
            features: ['Executive summary', 'Key metrics', 'Clean layout', 'Visual emphasis']
        }
    ];
}

/**
 * Validate template configuration
 */
function validateTemplate(templateName) {
    const availableTemplates = getAvailableTemplates().map(t => t.name);
    if (!availableTemplates.includes(templateName)) {
        throw new Error(`Invalid template: ${templateName}. Available templates: ${availableTemplates.join(', ')}`);
    }
    return true;
}

/**
 * Create default branding configuration
 */
function createDefaultBranding(options = {}) {
    const now = new Date();

    return {
        clientName: options.clientName || 'Client',
        projectTitle: options.projectTitle || 'Project Documentation',
        companyName: options.companyName || 'Your Company',
        companyAddress: options.companyAddress || '123 Business Street, City, State 12345',
        companyPhone: options.companyPhone || '(555) 123-4567',
        companyEmail: options.companyEmail || 'contact@yourcompany.com',
        companyWebsite: options.companyWebsite || 'www.yourcompany.com',
        logoPath: options.logoPath || path.join(__dirname, '../../templates/export/pdf/assets/default-logo.svg'),
        primaryColor: options.primaryColor || '#1E3A8A',
        secondaryColor: options.secondaryColor || '#64748B',
        date: options.date || now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        ...options
    };
}

/**
 * Export individual functions for testing and advanced usage
 */
module.exports = {
    exportToPDF,
    PDFGenerator,
    getAvailableTemplates,
    validateTemplate,
    createDefaultBranding,
    findMarkdownFiles,
    formatFileSize
};