#!/usr/bin/env node

/**
 * Oden Project Manager MCP Server
 * Handles file structure, templates, and project state management
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class OdenProjectManager {
    constructor() {
        this.projectRoot = process.env.ODEN_PROJECT_ROOT || process.cwd();
        this.server = new Server(
            { name: "oden-project-manager", version: "1.0.0" },
            { capabilities: { tools: {} } }
        );

        this.setupTools();
    }

    setupTools() {
        // Tool: Create project structure
        this.server.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'create_project_structure':
                    return await this.createProjectStructure(args);
                case 'create_oden_file':
                    return await this.createOdenFile(args);
                case 'read_frontmatter':
                    return await this.readFrontmatter(args);
                case 'update_frontmatter':
                    return await this.updateFrontmatter(args);
                case 'list_epics':
                    return await this.listEpics();
                case 'list_tasks':
                    return await this.listTasks(args);
                case 'get_project_status':
                    return await this.getProjectStatus();
                case 'cleanup_workspace':
                    return await this.cleanupWorkspace();
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });

        // List available tools
        this.server.setRequestHandler('tools/list', async () => {
            return {
                tools: [
                    {
                        name: 'create_project_structure',
                        description: 'Create the standard Oden project directory structure',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectName: { type: 'string' },
                                projectType: { type: 'string', enum: ['web', 'mobile', 'api', 'fullstack', 'desktop'] }
                            },
                            required: ['projectName']
                        }
                    },
                    {
                        name: 'create_oden_file',
                        description: 'Create a file with proper Oden YAML frontmatter',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string' },
                                fileType: { type: 'string', enum: ['prd', 'epic', 'task', 'spec', 'doc'] },
                                frontmatter: { type: 'object' },
                                content: { type: 'string' }
                            },
                            required: ['filePath', 'fileType', 'content']
                        }
                    },
                    {
                        name: 'read_frontmatter',
                        description: 'Read and parse YAML frontmatter from a markdown file',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string' }
                            },
                            required: ['filePath']
                        }
                    },
                    {
                        name: 'update_frontmatter',
                        description: 'Update YAML frontmatter in a markdown file',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string' },
                                updates: { type: 'object' }
                            },
                            required: ['filePath', 'updates']
                        }
                    },
                    {
                        name: 'list_epics',
                        description: 'List all current epics and their status',
                        inputSchema: { type: 'object', properties: {} }
                    },
                    {
                        name: 'list_tasks',
                        description: 'List tasks for a specific epic',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                epic: { type: 'string' }
                            },
                            required: ['epic']
                        }
                    },
                    {
                        name: 'get_project_status',
                        description: 'Get comprehensive project status information',
                        inputSchema: { type: 'object', properties: {} }
                    },
                    {
                        name: 'cleanup_workspace',
                        description: 'Clean up temporary files and organize workspace',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                maxTempFiles: { type: 'number', default: 5 },
                                maxTempAgeDays: { type: 'number', default: 1 }
                            }
                        }
                    }
                ]
            };
        });
    }

    async createProjectStructure({ projectName, projectType = 'web' }) {
        try {
            const directories = [
                'docs',
                'docs/guides',
                'docs/reference',
                'docs/reference/modules',
                'docs/development',
                'docs/development/current',
                'docs/development/current/tasks',
                'docs/development/completed',
                'docs/archived',
                'docs/temp',
                '.gemini',
                '.gemini/commands',
                '.gemini/commands/project'
            ];

            for (const dir of directories) {
                await fs.mkdir(path.join(this.projectRoot, dir), { recursive: true });
            }

            // Create initial README.md
            const readme = `# ${projectName}

${projectName} - Built with Oden Forge Documentation-First Methodology

## Project Information

- **Type**: ${projectType}
- **Methodology**: Oden Forge
- **Created**: ${new Date().toISOString()}

## Quick Start

1. Run \`/oden:architect\` to generate technical decisions
2. Create features with \`/oden:prd [feature-name]\`
3. Convert to epics with \`/oden:epic [feature-name]\`
4. Sync to GitHub with \`/oden:sync [feature-name]\`

## Documentation Structure

- \`docs/technical-decisions.md\` - Architecture and technology choices
- \`docs/development/current/\` - Active work in progress
- \`docs/development/completed/\` - Finished features
- \`docs/reference/modules/\` - Module specifications

## Status

Use \`/oden:status\` to check current project status.
`;

            await fs.writeFile(path.join(this.projectRoot, 'docs/README.md'), readme);

            // Create project GEMINI.md
            const geminiMd = `# ${projectName} - Oden Configuration

This project follows the Oden Forge Documentation-First Development methodology.

## Project Settings

- **Name**: ${projectName}
- **Type**: ${projectType}
- **Created**: ${new Date().toISOString()}

## Oden Commands Available

All standard Oden commands are available. Use \`/oden:help\` for complete list.

## Project-Specific Guidelines

Add any project-specific rules, conventions, or guidelines here.
`;

            await fs.writeFile(path.join(this.projectRoot, 'GEMINI.md'), geminiMd);

            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Project structure created successfully for "${projectName}"

Directories created:
${directories.map(d => `- ${d}/`).join('\n')}

Files created:
- docs/README.md
- GEMINI.md

Next steps:
1. Run /oden:architect to create technical decisions
2. Use /oden:status to check project health
3. Begin feature development with /oden:prd [feature-name]`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error creating project structure: ${error.message}` }],
                isError: true
            };
        }
    }

    async createOdenFile({ filePath, fileType, frontmatter = {}, content }) {
        try {
            const fullPath = path.join(this.projectRoot, filePath);

            // Ensure directory exists
            await fs.mkdir(path.dirname(fullPath), { recursive: true });

            // Create standard frontmatter based on file type
            const now = new Date().toISOString();
            const standardFrontmatter = {
                name: path.basename(filePath, '.md'),
                type: fileType,
                created: now,
                updated: now,
                ...frontmatter
            };

            // Add type-specific fields
            switch (fileType) {
                case 'prd':
                    standardFrontmatter.status = 'draft';
                    standardFrontmatter.priority = 'medium';
                    break;
                case 'epic':
                    standardFrontmatter.status = 'backlog';
                    standardFrontmatter.work_streams = [];
                    break;
                case 'task':
                    standardFrontmatter.status = 'open';
                    standardFrontmatter.estimated_hours = 0;
                    standardFrontmatter.github_issue = null;
                    break;
            }

            const yamlFrontmatter = yaml.dump(standardFrontmatter);
            const fileContent = `---\n${yamlFrontmatter}---\n\n${content}`;

            await fs.writeFile(fullPath, fileContent);

            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ File created: ${filePath}\nType: ${fileType}\nFrontmatter fields: ${Object.keys(standardFrontmatter).join(', ')}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error creating file: ${error.message}` }],
                isError: true
            };
        }
    }

    async readFrontmatter({ filePath }) {
        try {
            const fullPath = path.join(this.projectRoot, filePath);
            const content = await fs.readFile(fullPath, 'utf8');

            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!frontmatterMatch) {
                return {
                    content: [{ type: 'text', text: `No frontmatter found in ${filePath}` }]
                };
            }

            const frontmatter = yaml.load(frontmatterMatch[1]);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Frontmatter from ${filePath}:\n${JSON.stringify(frontmatter, null, 2)}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error reading frontmatter: ${error.message}` }],
                isError: true
            };
        }
    }

    async updateFrontmatter({ filePath, updates }) {
        try {
            const fullPath = path.join(this.projectRoot, filePath);
            const content = await fs.readFile(fullPath, 'utf8');

            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!frontmatterMatch) {
                throw new Error('No frontmatter found');
            }

            const currentFrontmatter = yaml.load(frontmatterMatch[1]);
            const updatedFrontmatter = {
                ...currentFrontmatter,
                ...updates,
                updated: new Date().toISOString()
            };

            const newYaml = yaml.dump(updatedFrontmatter);
            const newContent = `---\n${newYaml}---\n${frontmatterMatch[2]}`;

            await fs.writeFile(fullPath, newContent);

            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Updated frontmatter in ${filePath}\nUpdated fields: ${Object.keys(updates).join(', ')}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error updating frontmatter: ${error.message}` }],
                isError: true
            };
        }
    }

    async listEpics() {
        try {
            const currentDir = path.join(this.projectRoot, 'docs/development/current');
            const files = await fs.readdir(currentDir);
            const epics = [];

            for (const file of files) {
                if (file.endsWith('-epic.md')) {
                    const filePath = path.join(currentDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

                    if (frontmatterMatch) {
                        const frontmatter = yaml.load(frontmatterMatch[1]);
                        epics.push({
                            name: frontmatter.name,
                            status: frontmatter.status,
                            created: frontmatter.created,
                            work_streams: frontmatter.work_streams || []
                        });
                    }
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: epics.length > 0
                            ? `Found ${epics.length} epics:\n${epics.map(e => `- ${e.name} (${e.status})`).join('\n')}`
                            : 'No epics found'
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error listing epics: ${error.message}` }],
                isError: true
            };
        }
    }

    async listTasks({ epic }) {
        try {
            const tasksDir = path.join(this.projectRoot, 'docs/development/current/tasks');
            const files = await fs.readdir(tasksDir).catch(() => []);
            const tasks = [];

            for (const file of files) {
                if (file.startsWith(`${epic}-task-`) && file.endsWith('.md')) {
                    const filePath = path.join(tasksDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

                    if (frontmatterMatch) {
                        const frontmatter = yaml.load(frontmatterMatch[1]);
                        tasks.push({
                            name: frontmatter.name,
                            status: frontmatter.status,
                            work_stream: frontmatter.work_stream,
                            estimated_hours: frontmatter.estimated_hours,
                            github_issue: frontmatter.github_issue
                        });
                    }
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: tasks.length > 0
                            ? `Found ${tasks.length} tasks for epic "${epic}":\n${tasks.map(t => `- ${t.name} (${t.status}, ${t.estimated_hours}h)`).join('\n')}`
                            : `No tasks found for epic "${epic}"`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error listing tasks: ${error.message}` }],
                isError: true
            };
        }
    }

    async getProjectStatus() {
        try {
            const status = {
                structure: await this.checkProjectStructure(),
                documentation: await this.checkDocumentation(),
                epics: await this.getEpicsStatus(),
                workspace: await this.checkWorkspaceHealth()
            };

            const report = `🏗️ ODEN PROJECT STATUS

📁 Structure: ${status.structure.valid ? '✅ Valid' : '❌ Issues found'}
📚 Documentation: ${status.documentation.lines} total lines
📋 Epics: ${status.epics.total} total, ${status.epics.active} active
🧹 Workspace: ${status.workspace.tempFiles} temp files, ${status.workspace.health}

${status.structure.valid ? '' : 'Structure Issues:\n' + status.structure.issues.join('\n')}
`;

            return {
                content: [{ type: 'text', text: report }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error getting project status: ${error.message}` }],
                isError: true
            };
        }
    }

    async checkProjectStructure() {
        const requiredDirs = [
            'docs',
            'docs/development/current',
            'docs/development/completed',
            'docs/reference'
        ];

        const issues = [];
        let valid = true;

        for (const dir of requiredDirs) {
            try {
                await fs.access(path.join(this.projectRoot, dir));
            } catch {
                issues.push(`Missing directory: ${dir}`);
                valid = false;
            }
        }

        return { valid, issues };
    }

    async checkDocumentation() {
        let totalLines = 0;
        const docsDir = path.join(this.projectRoot, 'docs');

        try {
            const files = await this.getAllMarkdownFiles(docsDir);
            for (const file of files) {
                const content = await fs.readFile(file, 'utf8');
                totalLines += content.split('\n').length;
            }
        } catch (error) {
            // Ignore errors for now
        }

        return { lines: totalLines };
    }

    async getEpicsStatus() {
        try {
            const currentDir = path.join(this.projectRoot, 'docs/development/current');
            const files = await fs.readdir(currentDir);
            const epics = files.filter(f => f.endsWith('-epic.md'));

            return {
                total: epics.length,
                active: epics.length // Simplification - all current epics are active
            };
        } catch {
            return { total: 0, active: 0 };
        }
    }

    async checkWorkspaceHealth() {
        try {
            const tempDir = path.join(this.projectRoot, 'docs/temp');
            const files = await fs.readdir(tempDir).catch(() => []);

            return {
                tempFiles: files.length,
                health: files.length > 5 ? '⚠️ Needs cleanup' : '✅ Clean'
            };
        } catch {
            return { tempFiles: 0, health: '✅ Clean' };
        }
    }

    async getAllMarkdownFiles(dir) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.getAllMarkdownFiles(fullPath));
            } else if (entry.name.endsWith('.md')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    async cleanupWorkspace({ maxTempFiles = 5, maxTempAgeDays = 1 } = {}) {
        try {
            const tempDir = path.join(this.projectRoot, 'docs/temp');
            const files = await fs.readdir(tempDir).catch(() => []);

            let cleaned = 0;
            const now = Date.now();
            const maxAge = maxTempAgeDays * 24 * 60 * 60 * 1000;

            for (const file of files) {
                const filePath = path.join(tempDir, file);
                const stats = await fs.stat(filePath);

                if (now - stats.mtime.getTime() > maxAge || files.length > maxTempFiles) {
                    await fs.unlink(filePath);
                    cleaned++;
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Workspace cleanup complete\nRemoved ${cleaned} temporary files\nRemaining: ${files.length - cleaned} files`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Error during cleanup: ${error.message}` }],
                isError: true
            };
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}

// Run the server
const manager = new OdenProjectManager();
manager.run().catch(console.error);