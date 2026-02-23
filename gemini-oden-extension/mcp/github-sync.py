#!/usr/bin/env python3

"""
Oden GitHub Sync MCP Server
Handles GitHub issue creation and synchronization
"""

import os
import json
import asyncio
import subprocess
import yaml
from typing import Dict, List, Any, Optional
from mcp.server import Server
from mcp.server.stdio import stdio_server

class OdenGitHubSync:
    def __init__(self):
        self.project_root = os.environ.get('PROJECT_ROOT', os.getcwd())
        self.github_token = os.environ.get('GITHUB_TOKEN')

    async def setup_tools(self, server: Server):
        """Setup all available tools"""

        @server.call_tool("sync_epic_to_github")
        async def sync_epic_to_github(epic_name: str) -> Dict[str, Any]:
            """Sync all tasks from an epic to GitHub Issues"""
            try:
                # Check GitHub CLI auth
                result = await self.run_command(['gh', 'auth', 'status'])
                if result['returncode'] != 0:
                    return {
                        "content": [{
                            "type": "text",
                            "text": "❌ GitHub CLI not authenticated. Run: gh auth login"
                        }],
                        "isError": True
                    }

                # Get repository info
                repo_info = await self.get_repository_info()
                if not repo_info['success']:
                    return {
                        "content": [{"type": "text", "text": repo_info['error']}],
                        "isError": True
                    }

                # Find task files
                tasks = await self.find_epic_tasks(epic_name)
                if not tasks:
                    return {
                        "content": [{
                            "type": "text",
                            "text": f"No tasks found for epic '{epic_name}'. Run /oden:tasks {epic_name} first."
                        }]
                    }

                # Create GitHub issues
                created_issues = []
                for task in tasks:
                    issue_result = await self.create_github_issue(task, repo_info['repo'])
                    if issue_result['success']:
                        created_issues.append(issue_result)
                        # Update task file with GitHub issue info
                        await self.update_task_with_issue(task, issue_result)

                # Create epic tracking issue
                epic_issue = await self.create_epic_tracking_issue(epic_name, created_issues, repo_info['repo'])

                summary = f"""✅ Epic '{epic_name}' synced to GitHub

📊 Results:
- Epic tracking issue: #{epic_issue['number']}
- Task issues created: {len(created_issues)}
- Repository: {repo_info['repo']}

📋 Issues Created:
{chr(10).join([f"- #{issue['number']}: {issue['title']}" for issue in created_issues])}

🔗 Epic Issue: {epic_issue['url']}

Next: Use /oden:work {epic_name} to start development"""

                return {"content": [{"type": "text", "text": summary}]}

            except Exception as e:
                return {
                    "content": [{"type": "text", "text": f"❌ Error syncing to GitHub: {str(e)}"}],
                    "isError": True
                }

        @server.call_tool("check_github_status")
        async def check_github_status() -> Dict[str, Any]:
            """Check GitHub CLI authentication and repository status"""
            try:
                # Check auth
                auth_result = await self.run_command(['gh', 'auth', 'status'])
                auth_status = "✅ Authenticated" if auth_result['returncode'] == 0 else "❌ Not authenticated"

                # Check repository
                repo_info = await self.get_repository_info()

                # Count existing issues with oden labels
                oden_issues = await self.count_oden_issues()

                status = f"""🔗 GitHub Integration Status

🔐 Authentication: {auth_status}
📁 Repository: {repo_info.get('repo', 'Not found')}
🏷️ Oden Issues: {oden_issues['count']} found
📊 Labels: {', '.join(oden_issues['labels']) if oden_issues['labels'] else 'None'}

{repo_info.get('error', '') if not repo_info['success'] else ''}"""

                return {"content": [{"type": "text", "text": status}]}

            except Exception as e:
                return {
                    "content": [{"type": "text", "text": f"❌ Error checking GitHub status: {str(e)}"}],
                    "isError": True
                }

        @server.call_tool("create_single_issue")
        async def create_single_issue(title: str, body: str, labels: List[str] = None) -> Dict[str, Any]:
            """Create a single GitHub issue"""
            try:
                repo_info = await self.get_repository_info()
                if not repo_info['success']:
                    return {
                        "content": [{"type": "text", "text": repo_info['error']}],
                        "isError": True
                    }

                issue_data = {
                    'title': title,
                    'body': body,
                    'labels': labels or []
                }

                result = await self.create_github_issue(issue_data, repo_info['repo'])

                if result['success']:
                    return {
                        "content": [{
                            "type": "text",
                            "text": f"✅ Issue created: #{result['number']}\n🔗 {result['url']}"
                        }]
                    }
                else:
                    return {
                        "content": [{"type": "text", "text": f"❌ {result['error']}"}],
                        "isError": True
                    }

            except Exception as e:
                return {
                    "content": [{"type": "text", "text": f"❌ Error creating issue: {str(e)}"}],
                    "isError": True
                }

    async def run_command(self, cmd: List[str]) -> Dict[str, Any]:
        """Run a shell command and return result"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            return {
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except subprocess.TimeoutExpired:
            return {'returncode': 1, 'stderr': 'Command timed out'}
        except Exception as e:
            return {'returncode': 1, 'stderr': str(e)}

    async def get_repository_info(self) -> Dict[str, Any]:
        """Get current repository information"""
        try:
            # Get remote URL
            result = await self.run_command(['git', 'remote', 'get-url', 'origin'])
            if result['returncode'] != 0:
                return {'success': False, 'error': '❌ No git remote origin found'}

            remote_url = result['stdout'].strip()

            # Check if it's a template repository
            if 'template' in remote_url.lower() or 'example' in remote_url.lower():
                return {
                    'success': False,
                    'error': '❌ Cannot sync to template repository. Please fork or create your own repository first.'
                }

            # Extract repo name
            if 'github.com' in remote_url:
                # Handle both HTTPS and SSH URLs
                if remote_url.startswith('git@'):
                    repo = remote_url.split(':')[1].replace('.git', '')
                else:
                    repo = remote_url.split('github.com/')[1].replace('.git', '')

                return {'success': True, 'repo': repo, 'url': remote_url}

            return {'success': False, 'error': '❌ Not a GitHub repository'}

        except Exception as e:
            return {'success': False, 'error': f'❌ Error getting repository info: {str(e)}'}

    async def find_epic_tasks(self, epic_name: str) -> List[Dict[str, Any]]:
        """Find all task files for an epic"""
        tasks = []
        tasks_dir = os.path.join(self.project_root, 'docs/development/current/tasks')

        if not os.path.exists(tasks_dir):
            return tasks

        for filename in os.listdir(tasks_dir):
            if filename.startswith(f"{epic_name}-task-") and filename.endswith('.md'):
                filepath = os.path.join(tasks_dir, filename)
                task_data = await self.read_task_file(filepath)
                if task_data:
                    tasks.append(task_data)

        return tasks

    async def read_task_file(self, filepath: str) -> Optional[Dict[str, Any]]:
        """Read and parse a task file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract frontmatter
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1])
                    body = parts[2].strip()

                    return {
                        'filepath': filepath,
                        'filename': os.path.basename(filepath),
                        'frontmatter': frontmatter,
                        'body': body,
                        'title': frontmatter.get('name', 'Untitled Task'),
                        'epic': frontmatter.get('epic'),
                        'work_stream': frontmatter.get('work_stream'),
                        'labels': frontmatter.get('labels', [])
                    }

            return None

        except Exception as e:
            print(f"Error reading task file {filepath}: {e}")
            return None

    async def create_github_issue(self, task: Dict[str, Any], repo: str) -> Dict[str, Any]:
        """Create a GitHub issue from task data"""
        try:
            # Prepare issue data
            if isinstance(task, dict) and 'frontmatter' in task:
                # Task from file
                title = f"[{task['epic']}] {task['title']}"
                body = task['body']
                labels = ['oden-epic', task['epic']] + task.get('labels', [])
                if task.get('work_stream'):
                    labels.append(task['work_stream'])
            else:
                # Direct issue data
                title = task.get('title', 'Untitled')
                body = task.get('body', '')
                labels = task.get('labels', [])

            # Create temporary file for body
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.md') as f:
                f.write(body)
                temp_path = f.name

            try:
                # Use gh CLI to create issue
                cmd = [
                    'gh', 'issue', 'create',
                    '--repo', repo,
                    '--title', title,
                    '--body-file', temp_path
                ]

                if labels:
                    for label in labels:
                        cmd.extend(['--label', label])

                result = await self.run_command(cmd)

                if result['returncode'] == 0:
                    issue_url = result['stdout'].strip()
                    issue_number = issue_url.split('/')[-1]

                    return {
                        'success': True,
                        'number': issue_number,
                        'url': issue_url,
                        'title': title
                    }
                else:
                    return {
                        'success': False,
                        'error': f'Failed to create issue: {result["stderr"]}'
                    }

            finally:
                # Clean up temp file
                os.unlink(temp_path)

        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def update_task_with_issue(self, task: Dict[str, Any], issue_result: Dict[str, Any]):
        """Update task file with GitHub issue information"""
        try:
            filepath = task['filepath']

            # Update frontmatter
            task['frontmatter']['github_issue'] = int(issue_result['number'])
            task['frontmatter']['github_url'] = issue_result['url']
            task['frontmatter']['synced_at'] = self.get_current_iso_datetime()
            task['frontmatter']['sync_status'] = 'created'
            task['frontmatter']['updated'] = self.get_current_iso_datetime()

            # Rebuild file content
            frontmatter_yaml = yaml.dump(task['frontmatter'], default_flow_style=False)
            new_content = f"---\n{frontmatter_yaml}---\n\n{task['body']}"

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

        except Exception as e:
            print(f"Error updating task file: {e}")

    async def create_epic_tracking_issue(self, epic_name: str, tasks: List[Dict[str, Any]], repo: str) -> Dict[str, Any]:
        """Create an epic tracking issue with links to all task issues"""
        try:
            title = f"[EPIC] {epic_name}"

            body = f"""# Epic: {epic_name}

This is the tracking issue for the "{epic_name}" epic.

## 📋 Tasks

{chr(10).join([f"- [ ] #{task['number']}: {task['title'].replace(f'[{epic_name}] ', '')}" for task in tasks])}

## 📊 Progress

- **Total Tasks**: {len(tasks)}
- **Completed**: 0
- **In Progress**: 0
- **Todo**: {len(tasks)}

## 🏷️ Labels

- `epic` - This is an epic tracking issue
- `oden-epic` - Created by Oden Forge methodology
- `{epic_name}` - Epic identifier

---

*Created by Oden Forge Documentation-First Development methodology*
"""

            labels = ['epic', 'oden-epic', epic_name]

            issue_data = {'title': title, 'body': body, 'labels': labels}
            result = await self.create_github_issue(issue_data, repo)

            return result if result['success'] else {'number': '?', 'url': '?'}

        except Exception as e:
            print(f"Error creating epic tracking issue: {e}")
            return {'number': '?', 'url': '?'}

    async def count_oden_issues(self) -> Dict[str, Any]:
        """Count existing Oden-related issues"""
        try:
            result = await self.run_command(['gh', 'issue', 'list', '--label', 'oden-epic', '--json', 'number,labels'])

            if result['returncode'] == 0:
                issues = json.loads(result['stdout'] or '[]')
                all_labels = set()

                for issue in issues:
                    for label in issue.get('labels', []):
                        all_labels.add(label['name'])

                return {
                    'count': len(issues),
                    'labels': list(all_labels)
                }

            return {'count': 0, 'labels': []}

        except Exception:
            return {'count': 0, 'labels': []}

    def get_current_iso_datetime(self) -> str:
        """Get current ISO datetime string"""
        from datetime import datetime
        return datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

async def main():
    """Main entry point"""
    sync_manager = OdenGitHubSync()

    async with stdio_server() as (read_stream, write_stream):
        server = Server("oden-github-sync")
        await sync_manager.setup_tools(server)
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())