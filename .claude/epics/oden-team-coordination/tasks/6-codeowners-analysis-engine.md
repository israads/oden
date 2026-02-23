---
name: codeowners-analysis-engine
epic: oden-team-coordination
task_number: 4
work_stream: intelligence-layer
status: open
priority: high
size: L (1-2d)
agent_type: fullstack-developer
created: 2026-02-19T15:47:57Z
updated: 2026-02-19T17:54:33Z
depends_on: [1]
blocks: [5]
execution_group: B
github: https://github.com/israds/oden/issues/6
---

# Task 4: CODEOWNERS Analysis Engine

## 🎯 Overview

Build a comprehensive CODEOWNERS analysis engine that parses GitHub CODEOWNERS files across multiple repositories, analyzes commit history to determine actual code ownership patterns, and creates an expertise matrix for intelligent task assignment. This forms the foundation of the AI assignment system.

## 🏗️ Technical Specifications

### Core Analysis Engine Architecture

#### File Structure
```
lib/
├── team/
│   ├── expertise/
│   │   ├── codeowners-parser.js      # CODEOWNERS file parsing
│   │   ├── commit-analyzer.js        # Git history analysis
│   │   ├── expertise-calculator.js   # Expertise scoring algorithm
│   │   └── expertise-matrix.js       # Team expertise aggregation
├── github/
│   ├── analysis/
│   │   ├── repository-scanner.js     # Multi-repo scanning
│   │   ├── codeowners-fetcher.js     # GitHub API CODEOWNERS access
│   │   └── commit-history-fetcher.js # Git log analysis
└── intelligence/
    ├── pattern-matcher.js            # Code pattern recognition
    ├── expertise-scorer.js           # Scoring algorithms
    └── confidence-calculator.js      # Confidence metrics
```

#### CODEOWNERS Parser (lib/team/expertise/codeowners-parser.js)
```javascript
/**
 * CODEOWNERS File Parser
 * Parses GitHub CODEOWNERS files and extracts ownership patterns
 */
class CODEOWNERSParser {
  constructor() {
    this.patterns = [];
    this.global_owners = [];
    this.path_mappings = new Map();
  }

  /**
   * Parse CODEOWNERS file content
   * @param {string} content - Raw CODEOWNERS file content
   * @param {string} repository - Repository name for context
   * @returns {Object} Parsed ownership structure
   */
  parse(content, repository) {
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const ownership_rules = [];
    const global_owners = [];

    for (const line of lines) {
      const rule = this.parseLine(line.trim());
      if (rule) {
        if (rule.is_global) {
          global_owners.push(...rule.owners);
        } else {
          ownership_rules.push({
            ...rule,
            repository,
            confidence: this.calculateRuleConfidence(rule)
          });
        }
      }
    }

    return {
      repository,
      global_owners: [...new Set(global_owners)],
      ownership_rules,
      total_patterns: ownership_rules.length,
      coverage_estimate: this.estimateCoverage(ownership_rules)
    };
  }

  /**
   * Parse individual CODEOWNERS line
   * @param {string} line - Single line from CODEOWNERS
   * @returns {Object|null} Parsed rule or null if invalid
   */
  parseLine(line) {
    // Handle global ownership (just owners, no pattern)
    if (!line.includes('/') && !line.includes('*')) {
      return {
        pattern: '*',
        owners: this.parseOwners(line),
        is_global: true,
        specificity: 0
      };
    }

    // Split line into pattern and owners
    const parts = line.split(/\s+/);
    if (parts.length < 2) return null;

    const pattern = parts[0];
    const owners = this.parseOwners(parts.slice(1).join(' '));

    if (owners.length === 0) return null;

    return {
      pattern,
      owners,
      is_global: false,
      specificity: this.calculatePatternSpecificity(pattern),
      file_types: this.extractFileTypes(pattern),
      directories: this.extractDirectories(pattern)
    };
  }

  /**
   * Parse owners from CODEOWNERS format (@team, @user, email)
   * @param {string} ownerString - Owner specification
   * @returns {Array} Normalized owner list
   */
  parseOwners(ownerString) {
    const owners = [];
    const ownerMatches = ownerString.match(/@[\w-]+\/[\w-]+|@[\w-]+|[\w.-]+@[\w.-]+/g);

    if (!ownerMatches) return owners;

    for (const match of ownerMatches) {
      if (match.startsWith('@')) {
        // GitHub user or team
        if (match.includes('/')) {
          // Organization team: @org/team
          owners.push({
            type: 'team',
            name: match.split('/')[1],
            organization: match.split('/')[0].substring(1),
            full_name: match
          });
        } else {
          // Individual user: @username
          owners.push({
            type: 'user',
            username: match.substring(1),
            full_name: match
          });
        }
      } else if (match.includes('@')) {
        // Email address
        owners.push({
          type: 'email',
          email: match,
          full_name: match
        });
      }
    }

    return owners;
  }

  /**
   * Calculate pattern specificity for ownership rule priority
   * @param {string} pattern - File path pattern
   * @returns {number} Specificity score (higher = more specific)
   */
  calculatePatternSpecificity(pattern) {
    let score = 0;

    // Base score for pattern complexity
    score += pattern.split('/').length * 10; // Directory depth
    score += (pattern.match(/\*/g) || []).length * -5; // Wildcards reduce specificity
    score += pattern.includes('*.') ? 15 : 0; // File extension patterns
    score += pattern.endsWith('/') ? 5 : 0; // Directory patterns

    // Specific file patterns are more specific
    if (!pattern.includes('*') && !pattern.endsWith('/')) {
      score += 20;
    }

    return Math.max(score, 1);
  }

  /**
   * Extract file types from pattern
   * @param {string} pattern - File path pattern
   * @returns {Array} File extensions
   */
  extractFileTypes(pattern) {
    const fileTypes = [];

    // Direct extension patterns: *.js, *.py
    const directMatch = pattern.match(/\*\.(\w+)$/);
    if (directMatch) {
      fileTypes.push(directMatch[1]);
    }

    // Path-based extension patterns: src/**/*.tsx
    const pathMatch = pattern.match(/\*\.(\w+)/g);
    if (pathMatch) {
      pathMatch.forEach(match => {
        const ext = match.replace('*.', '');
        if (ext && !fileTypes.includes(ext)) {
          fileTypes.push(ext);
        }
      });
    }

    return fileTypes;
  }

  /**
   * Extract directory patterns
   * @param {string} pattern - File path pattern
   * @returns {Array} Directory paths
   */
  extractDirectories(pattern) {
    const directories = [];

    // Remove filename and wildcards to get directory structure
    let dirPattern = pattern.replace(/\/[^/]*$/, ''); // Remove filename
    dirPattern = dirPattern.replace(/\*+/g, ''); // Remove wildcards
    dirPattern = dirPattern.replace(/\/+/g, '/'); // Normalize slashes
    dirPattern = dirPattern.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes

    if (dirPattern) {
      directories.push(dirPattern);
    }

    return directories;
  }

  /**
   * Calculate confidence score for ownership rule
   * @param {Object} rule - Parsed ownership rule
   * @returns {number} Confidence score (0-100)
   */
  calculateRuleConfidence(rule) {
    let confidence = 50; // Base confidence

    // More owners = higher confidence (up to a point)
    const ownerBonus = Math.min(rule.owners.length * 10, 30);
    confidence += ownerBonus;

    // Higher specificity = higher confidence
    const specificityBonus = Math.min(rule.specificity * 2, 20);
    confidence += specificityBonus;

    // Team ownership is generally more reliable than individual
    const teamOwners = rule.owners.filter(owner => owner.type === 'team').length;
    if (teamOwners > 0) {
      confidence += 10;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Estimate repository coverage by CODEOWNERS rules
   * @param {Array} rules - Ownership rules
   * @returns {number} Coverage estimate (0-100)
   */
  estimateCoverage(rules) {
    let coverage = 0;

    // Check for common patterns that indicate good coverage
    const hasRootPattern = rules.some(rule => rule.pattern === '*' || rule.pattern === '**/*');
    if (hasRootPattern) coverage += 30;

    const hasSourcePattern = rules.some(rule =>
      rule.pattern.includes('src/') ||
      rule.pattern.includes('lib/') ||
      rule.pattern.includes('app/')
    );
    if (hasSourcePattern) coverage += 20;

    const hasConfigPattern = rules.some(rule =>
      rule.pattern.includes('*.json') ||
      rule.pattern.includes('*.yml') ||
      rule.pattern.includes('*.yaml') ||
      rule.pattern.includes('package.json')
    );
    if (hasConfigPattern) coverage += 15;

    const hasDocPattern = rules.some(rule =>
      rule.pattern.includes('*.md') ||
      rule.pattern.includes('docs/') ||
      rule.pattern.includes('README')
    );
    if (hasDocPattern) coverage += 10;

    // Bonus for having multiple specific patterns
    const specificRules = rules.filter(rule => rule.specificity > 20).length;
    coverage += Math.min(specificRules * 5, 25);

    return Math.min(coverage, 100);
  }

  /**
   * Find matching ownership rules for a file path
   * @param {string} filePath - Path to check
   * @param {Array} rules - Ownership rules
   * @returns {Array} Matching rules sorted by specificity
   */
  findMatchingRules(filePath, rules) {
    const matches = [];

    for (const rule of rules) {
      if (this.patternMatches(rule.pattern, filePath)) {
        matches.push(rule);
      }
    }

    // Sort by specificity (most specific first)
    return matches.sort((a, b) => b.specificity - a.specificity);
  }

  /**
   * Check if a pattern matches a file path
   * @param {string} pattern - CODEOWNERS pattern
   * @param {string} filePath - File path to check
   * @returns {boolean} True if pattern matches
   */
  patternMatches(pattern, filePath) {
    // Convert CODEOWNERS pattern to regex
    let regex = pattern
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\*\*/g, '.*') // ** matches any number of directories
      .replace(/\*/g, '[^/]*'); // * matches within a directory

    // Handle directory patterns
    if (pattern.endsWith('/')) {
      regex = '^' + regex + '.*';
    } else {
      regex = '^' + regex + '$';
    }

    try {
      return new RegExp(regex).test(filePath);
    } catch (error) {
      console.warn(`Invalid pattern regex: ${pattern} -> ${regex}`);
      return false;
    }
  }
}

module.exports = CODEOWNERSParser;
```

#### Commit History Analyzer (lib/team/expertise/commit-analyzer.js)
```javascript
/**
 * Git Commit History Analyzer
 * Analyzes git commit history to determine actual code ownership patterns
 */
class CommitAnalyzer {
  constructor() {
    this.analysis_cache = new Map();
    this.expertise_weights = {
      recent: 0.4,      // Recent commits (last 6 months)
      volume: 0.3,      // Total commit volume
      complexity: 0.2,  // Lines changed (complexity indicator)
      consistency: 0.1  // Consistent contributions over time
    };
  }

  /**
   * Analyze commit history for a repository
   * @param {string} repositoryPath - Local repository path
   * @param {Object} options - Analysis options
   * @returns {Object} Commit analysis results
   */
  async analyzeRepository(repositoryPath, options = {}) {
    const {
      time_window = '12 months',
      min_commits = 2,
      file_patterns = null
    } = options;

    const analysis = {
      repository: repositoryPath,
      time_window,
      contributors: new Map(),
      file_expertise: new Map(),
      directory_expertise: new Map(),
      language_expertise: new Map(),
      total_commits: 0,
      analysis_date: new Date().toISOString()
    };

    try {
      // Get commit history
      const commits = await this.getCommitHistory(repositoryPath, time_window, file_patterns);
      analysis.total_commits = commits.length;

      // Analyze each commit
      for (const commit of commits) {
        await this.analyzeCommit(commit, analysis);
      }

      // Calculate expertise scores
      this.calculateExpertiseScores(analysis);

      // Filter contributors by minimum activity
      this.filterContributors(analysis, min_commits);

      return analysis;
    } catch (error) {
      console.error(`Commit analysis failed for ${repositoryPath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get commit history from repository
   * @param {string} repositoryPath - Repository path
   * @param {string} timeWindow - Time window for analysis
   * @param {Array} filePatterns - Optional file patterns to filter
   * @returns {Array} Commit history
   */
  async getCommitHistory(repositoryPath, timeWindow, filePatterns = null) {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    let command = `git log --since="${timeWindow}" --pretty=format:"%H|%an|%ae|%ai|%s" --name-status`;

    if (filePatterns && filePatterns.length > 0) {
      command += ` -- ${filePatterns.join(' ')}`;
    }

    try {
      const { stdout } = await execAsync(command, { cwd: repositoryPath });
      return this.parseGitLog(stdout);
    } catch (error) {
      throw new Error(`Git log failed: ${error.message}`);
    }
  }

  /**
   * Parse git log output into structured commits
   * @param {string} gitLogOutput - Raw git log output
   * @returns {Array} Parsed commits
   */
  parseGitLog(gitLogOutput) {
    const commits = [];
    const lines = gitLogOutput.split('\n').filter(line => line.trim());

    let currentCommit = null;

    for (const line of lines) {
      if (line.includes('|')) {
        // Commit info line
        const [hash, author, email, date, message] = line.split('|');

        if (currentCommit) {
          commits.push(currentCommit);
        }

        currentCommit = {
          hash,
          author: author.trim(),
          email: email.trim(),
          date: new Date(date),
          message: message.trim(),
          files: []
        };
      } else if (currentCommit && line.match(/^[AMD]\s+/)) {
        // File change line
        const [status, filename] = line.split('\t');
        currentCommit.files.push({
          status: status.trim(),
          filename: filename.trim(),
          change_type: this.mapChangeType(status.trim())
        });
      }
    }

    if (currentCommit) {
      commits.push(currentCommit);
    }

    return commits;
  }

  /**
   * Analyze individual commit for expertise extraction
   * @param {Object} commit - Commit object
   * @param {Object} analysis - Analysis results object
   */
  async analyzeCommit(commit, analysis) {
    const author = this.normalizeAuthor(commit);

    // Initialize contributor if new
    if (!analysis.contributors.has(author)) {
      analysis.contributors.set(author, {
        name: commit.author,
        email: commit.email,
        total_commits: 0,
        recent_commits: 0,
        files_touched: new Set(),
        directories_touched: new Set(),
        languages_used: new Set(),
        lines_changed: 0,
        first_commit: commit.date,
        last_commit: commit.date,
        commit_frequency: []
      });
    }

    const contributor = analysis.contributors.get(author);

    // Update contributor stats
    contributor.total_commits++;
    contributor.last_commit = commit.date;

    // Check if recent (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (commit.date > sixMonthsAgo) {
      contributor.recent_commits++;
    }

    // Record commit frequency
    contributor.commit_frequency.push(commit.date);

    // Analyze changed files
    for (const file of commit.files) {
      contributor.files_touched.add(file.filename);

      // Extract directory
      const directory = this.extractDirectory(file.filename);
      if (directory) {
        contributor.directories_touched.add(directory);
      }

      // Extract language/file type
      const language = this.extractLanguage(file.filename);
      if (language) {
        contributor.languages_used.add(language);
      }

      // Update file expertise
      if (!analysis.file_expertise.has(file.filename)) {
        analysis.file_expertise.set(file.filename, new Map());
      }

      const fileContributors = analysis.file_expertise.get(file.filename);
      const currentCount = fileContributors.get(author) || 0;
      fileContributors.set(author, currentCount + 1);

      // Update directory expertise
      if (directory) {
        if (!analysis.directory_expertise.has(directory)) {
          analysis.directory_expertise.set(directory, new Map());
        }

        const dirContributors = analysis.directory_expertise.get(directory);
        const currentDirCount = dirContributors.get(author) || 0;
        dirContributors.set(author, currentDirCount + 1);
      }

      // Update language expertise
      if (language) {
        if (!analysis.language_expertise.has(language)) {
          analysis.language_expertise.set(language, new Map());
        }

        const langContributors = analysis.language_expertise.get(language);
        const currentLangCount = langContributors.get(author) || 0;
        langContributors.set(author, currentLangCount + 1);
      }
    }

    // Estimate lines changed (approximation based on commit message and file count)
    contributor.lines_changed += this.estimateLinesChanged(commit);
  }

  /**
   * Calculate expertise scores for all contributors
   * @param {Object} analysis - Analysis results object
   */
  calculateExpertiseScores(analysis) {
    // Calculate scores for each contributor
    for (const [author, contributor] of analysis.contributors) {
      contributor.expertise_score = this.calculateContributorExpertise(contributor);
      contributor.consistency_score = this.calculateConsistencyScore(contributor);
      contributor.recency_score = this.calculateRecencyScore(contributor);
    }

    // Calculate file-level expertise scores
    for (const [filename, contributors] of analysis.file_expertise) {
      const expertiseRanking = [];

      for (const [author, commitCount] of contributors) {
        const contributor = analysis.contributors.get(author);
        const expertiseScore = commitCount * contributor.expertise_score;

        expertiseRanking.push({
          author,
          commit_count: commitCount,
          expertise_score: expertiseScore,
          confidence: this.calculateFileExpertiseConfidence(commitCount, contributors.size)
        });
      }

      // Sort by expertise score
      expertiseRanking.sort((a, b) => b.expertise_score - a.expertise_score);
      analysis.file_expertise.set(filename, expertiseRanking);
    }
  }

  /**
   * Calculate overall expertise score for contributor
   * @param {Object} contributor - Contributor data
   * @returns {number} Expertise score (0-100)
   */
  calculateContributorExpertise(contributor) {
    const weights = this.expertise_weights;

    // Recent activity score (0-100)
    const recentScore = Math.min((contributor.recent_commits / contributor.total_commits) * 100, 100);

    // Volume score (logarithmic scale, 0-100)
    const volumeScore = Math.min(Math.log10(contributor.total_commits + 1) * 25, 100);

    // Complexity score based on lines changed (0-100)
    const complexityScore = Math.min(Math.log10(contributor.lines_changed + 1) * 15, 100);

    // Consistency score (0-100)
    const consistencyScore = contributor.consistency_score;

    return (
      recentScore * weights.recent +
      volumeScore * weights.volume +
      complexityScore * weights.complexity +
      consistencyScore * weights.consistency
    );
  }

  /**
   * Calculate consistency score based on commit frequency
   * @param {Object} contributor - Contributor data
   * @returns {number} Consistency score (0-100)
   */
  calculateConsistencyScore(contributor) {
    if (contributor.commit_frequency.length < 2) return 0;

    // Calculate time span
    const timeSpan = contributor.last_commit - contributor.first_commit;
    const days = timeSpan / (1000 * 60 * 60 * 24);

    if (days < 1) return 50; // Very recent contributor

    // Calculate average commits per week
    const avgCommitsPerWeek = (contributor.total_commits * 7) / days;

    // Calculate consistency (regular commits over time)
    const consistency = Math.min(avgCommitsPerWeek * 20, 100);

    return consistency;
  }

  /**
   * Calculate recency score
   * @param {Object} contributor - Contributor data
   * @returns {number} Recency score (0-100)
   */
  calculateRecencyScore(contributor) {
    const daysSinceLastCommit = (Date.now() - contributor.last_commit) / (1000 * 60 * 60 * 24);

    if (daysSinceLastCommit < 7) return 100;
    if (daysSinceLastCommit < 30) return 80;
    if (daysSinceLastCommit < 90) return 60;
    if (daysSinceLastCommit < 180) return 40;
    if (daysSinceLastCommit < 365) return 20;

    return 10;
  }

  // Utility methods
  normalizeAuthor(commit) {
    // Use email as primary identifier, fall back to name
    return commit.email || commit.author.toLowerCase().replace(/\s+/g, '.');
  }

  extractDirectory(filename) {
    const lastSlash = filename.lastIndexOf('/');
    return lastSlash > 0 ? filename.substring(0, lastSlash) : null;
  }

  extractLanguage(filename) {
    const extension = filename.split('.').pop().toLowerCase();

    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rb: 'ruby',
      go: 'golang',
      java: 'java',
      php: 'php',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      swift: 'swift',
      kt: 'kotlin',
      rs: 'rust',
      scala: 'scala',
      clj: 'clojure'
    };

    return languageMap[extension] || extension;
  }

  mapChangeType(status) {
    const changeTypes = {
      'A': 'added',
      'M': 'modified',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied'
    };

    return changeTypes[status] || 'unknown';
  }

  estimateLinesChanged(commit) {
    // Simple heuristic: estimate lines based on commit message and file count
    let estimate = commit.files.length * 10; // Base estimate per file

    // Adjust based on commit message keywords
    const message = commit.message.toLowerCase();
    if (message.includes('refactor')) estimate *= 2;
    if (message.includes('rewrite')) estimate *= 3;
    if (message.includes('fix')) estimate *= 0.5;
    if (message.includes('typo')) estimate *= 0.1;

    return Math.round(estimate);
  }

  calculateFileExpertiseConfidence(commitCount, totalContributors) {
    let confidence = 50; // Base confidence

    // More commits = higher confidence
    confidence += Math.min(commitCount * 10, 30);

    // Fewer total contributors = higher confidence for top contributor
    if (totalContributors === 1) confidence += 20;
    else if (totalContributors === 2) confidence += 10;
    else if (totalContributors > 5) confidence -= 10;

    return Math.min(Math.max(confidence, 0), 100);
  }

  filterContributors(analysis, minCommits) {
    for (const [author, contributor] of analysis.contributors) {
      if (contributor.total_commits < minCommits) {
        analysis.contributors.delete(author);
      }
    }
  }
}

module.exports = CommitAnalyzer;
```

#### Expertise Matrix Generator (lib/team/expertise/expertise-matrix.js)
```javascript
/**
 * Team Expertise Matrix Generator
 * Combines CODEOWNERS and commit history analysis into comprehensive expertise matrix
 */
class ExpertiseMatrix {
  constructor(teamConfig) {
    this.team_config = teamConfig;
    this.matrix = new Map();
    this.confidence_threshold = 60;
  }

  /**
   * Generate comprehensive expertise matrix for team
   * @param {Array} repositories - Repository analysis results
   * @param {Array} codeownersAnalysis - CODEOWNERS analysis results
   * @param {Array} commitAnalysis - Commit history analysis results
   * @returns {Object} Complete expertise matrix
   */
  async generateMatrix(repositories, codeownersAnalysis, commitAnalysis) {
    const matrix = {
      team: this.team_config.team.name,
      generated_at: new Date().toISOString(),
      repositories: repositories.map(r => r.name),
      members: new Map(),
      expertise_areas: new Map(),
      file_patterns: new Map(),
      recommendations: []
    };

    // Initialize team members
    for (const member of this.team_config.team.members) {
      matrix.members.set(member.github, {
        github: member.github,
        name: member.name || member.github,
        declared_expertise: member.expertise || [],
        codeowners_expertise: new Map(),
        commit_expertise: new Map(),
        combined_expertise: new Map(),
        confidence_scores: new Map(),
        repositories: new Map()
      });
    }

    // Process CODEOWNERS data
    this.processCODEOWNERSExpertise(matrix, codeownersAnalysis);

    // Process commit history data
    this.processCommitExpertise(matrix, commitAnalysis);

    // Calculate combined expertise scores
    this.calculateCombinedExpertise(matrix);

    // Generate recommendations
    this.generateRecommendations(matrix);

    return matrix;
  }

  /**
   * Process CODEOWNERS analysis into expertise matrix
   * @param {Object} matrix - Expertise matrix being built
   * @param {Array} codeownersAnalysis - CODEOWNERS analysis results
   */
  processCODEOWNERSExpertise(matrix, codeownersAnalysis) {
    for (const repoAnalysis of codeownersAnalysis) {
      const repositoryName = repoAnalysis.repository;

      // Process ownership rules
      for (const rule of repoAnalysis.ownership_rules) {
        for (const owner of rule.owners) {
          if (owner.type === 'user') {
            const member = matrix.members.get(owner.username);
            if (member) {
              // Add CODEOWNERS expertise
              if (!member.codeowners_expertise.has(repositoryName)) {
                member.codeowners_expertise.set(repositoryName, []);
              }

              member.codeowners_expertise.get(repositoryName).push({
                pattern: rule.pattern,
                specificity: rule.specificity,
                confidence: rule.confidence,
                file_types: rule.file_types,
                directories: rule.directories
              });

              // Update repository involvement
              if (!member.repositories.has(repositoryName)) {
                member.repositories.set(repositoryName, {
                  codeowners_patterns: 0,
                  commit_activity: 0,
                  expertise_level: 0
                });
              }

              member.repositories.get(repositoryName).codeowners_patterns++;
            }
          }
        }
      }
    }
  }

  /**
   * Process commit history analysis into expertise matrix
   * @param {Object} matrix - Expertise matrix being built
   * @param {Array} commitAnalysis - Commit analysis results
   */
  processCommitExpertise(matrix, commitAnalysis) {
    for (const repoAnalysis of commitAnalysis) {
      const repositoryName = repoAnalysis.repository;

      // Map commit contributors to team members
      for (const [authorId, contributor] of repoAnalysis.contributors) {
        const member = this.findTeamMemberByCommitInfo(matrix, contributor);

        if (member) {
          // Add commit expertise
          if (!member.commit_expertise.has(repositoryName)) {
            member.commit_expertise.set(repositoryName, {
              total_commits: 0,
              recent_commits: 0,
              files_touched: [],
              directories: new Set(),
              languages: new Set(),
              expertise_score: 0
            });
          }

          const commitExpertise = member.commit_expertise.get(repositoryName);
          commitExpertise.total_commits = contributor.total_commits;
          commitExpertise.recent_commits = contributor.recent_commits;
          commitExpertise.files_touched = Array.from(contributor.files_touched);
          commitExpertise.directories = contributor.directories_touched;
          commitExpertise.languages = contributor.languages_used;
          commitExpertise.expertise_score = contributor.expertise_score;

          // Update repository involvement
          if (!member.repositories.has(repositoryName)) {
            member.repositories.set(repositoryName, {
              codeowners_patterns: 0,
              commit_activity: 0,
              expertise_level: 0
            });
          }

          member.repositories.get(repositoryName).commit_activity = contributor.expertise_score;
        }
      }
    }
  }

  /**
   * Calculate combined expertise scores
   * @param {Object} matrix - Expertise matrix
   */
  calculateCombinedExpertise(matrix) {
    for (const [memberId, member] of matrix.members) {
      // Combine expertise from all sources
      const expertiseAreas = new Set([
        ...member.declared_expertise,
        ...this.extractCODEOWNERSAreas(member.codeowners_expertise),
        ...this.extractCommitAreas(member.commit_expertise)
      ]);

      for (const area of expertiseAreas) {
        const combinedScore = this.calculateAreaExpertise(member, area);
        const confidence = this.calculateAreaConfidence(member, area);

        if (combinedScore > 0) {
          member.combined_expertise.set(area, {
            score: combinedScore,
            confidence: confidence,
            sources: this.identifyExpertiseSources(member, area)
          });

          member.confidence_scores.set(area, confidence);
        }
      }

      // Calculate overall repository expertise
      for (const [repoName, repoData] of member.repositories) {
        repoData.expertise_level = this.calculateRepositoryExpertise(member, repoName);
      }
    }
  }

  /**
   * Calculate expertise score for specific area
   * @param {Object} member - Team member data
   * @param {string} area - Expertise area
   * @returns {number} Combined expertise score (0-100)
   */
  calculateAreaExpertise(member, area) {
    let score = 0;
    const weights = { declared: 0.3, codeowners: 0.4, commits: 0.3 };

    // Declared expertise
    if (member.declared_expertise.includes(area)) {
      score += 70 * weights.declared; // Base score for declared expertise
    }

    // CODEOWNERS expertise
    let codeownersScore = 0;
    for (const [repo, patterns] of member.codeowners_expertise) {
      const relevantPatterns = patterns.filter(p =>
        p.file_types.includes(area) ||
        p.directories.some(d => d.includes(area)) ||
        this.areaMatchesPattern(area, p.pattern)
      );

      if (relevantPatterns.length > 0) {
        const avgSpecificity = relevantPatterns.reduce((sum, p) => sum + p.specificity, 0) / relevantPatterns.length;
        const avgConfidence = relevantPatterns.reduce((sum, p) => sum + p.confidence, 0) / relevantPatterns.length;
        codeownersScore += (avgSpecificity + avgConfidence) / 2;
      }
    }
    score += Math.min(codeownersScore, 100) * weights.codeowners;

    // Commit history expertise
    let commitScore = 0;
    for (const [repo, commitData] of member.commit_expertise) {
      if (commitData.languages.has(area) ||
          Array.from(commitData.directories).some(d => d.includes(area))) {
        commitScore += commitData.expertise_score;
      }
    }
    score += Math.min(commitScore, 100) * weights.commits;

    return Math.min(score, 100);
  }

  /**
   * Calculate confidence score for area expertise
   * @param {Object} member - Team member data
   * @param {string} area - Expertise area
   * @returns {number} Confidence score (0-100)
   */
  calculateAreaConfidence(member, area) {
    let confidence = 50; // Base confidence

    // Boost confidence if multiple sources agree
    const sources = this.identifyExpertiseSources(member, area);
    confidence += sources.length * 15;

    // Boost confidence for recent activity
    for (const [repo, commitData] of member.commit_expertise) {
      if (commitData.languages.has(area) && commitData.recent_commits > 0) {
        confidence += Math.min(commitData.recent_commits * 5, 20);
      }
    }

    // Reduce confidence if no recent activity
    const hasRecentActivity = Array.from(member.commit_expertise.values())
      .some(commitData => commitData.recent_commits > 0);
    if (!hasRecentActivity) {
      confidence -= 20;
    }

    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * Generate assignment recommendations
   * @param {Object} matrix - Expertise matrix
   */
  generateRecommendations(matrix) {
    const recommendations = [];

    // Find expertise gaps
    const allExpertiseAreas = new Set();
    for (const [memberId, member] of matrix.members) {
      for (const area of member.combined_expertise.keys()) {
        allExpertiseAreas.add(area);
      }
    }

    // Analyze coverage for each area
    for (const area of allExpertiseAreas) {
      const experts = [];
      for (const [memberId, member] of matrix.members) {
        const expertise = member.combined_expertise.get(area);
        if (expertise && expertise.score > 30) {
          experts.push({
            member: memberId,
            score: expertise.score,
            confidence: expertise.confidence
          });
        }
      }

      // Sort experts by score
      experts.sort((a, b) => b.score - a.score);

      if (experts.length === 0) {
        recommendations.push({
          type: 'expertise_gap',
          area: area,
          message: `No team members have expertise in ${area}`,
          priority: 'high'
        });
      } else if (experts.length === 1) {
        recommendations.push({
          type: 'single_expert',
          area: area,
          expert: experts[0].member,
          message: `Only ${experts[0].member} has expertise in ${area}`,
          priority: 'medium'
        });
      } else if (experts[0].score > experts[1].score + 30) {
        recommendations.push({
          type: 'dominant_expert',
          area: area,
          expert: experts[0].member,
          message: `${experts[0].member} is significantly more expert in ${area}`,
          priority: 'low'
        });
      }
    }

    matrix.recommendations = recommendations;
  }

  // Utility methods
  findTeamMemberByCommitInfo(matrix, contributor) {
    // Try to match by email first
    for (const [memberId, member] of matrix.members) {
      if (member.github === contributor.email.split('@')[0]) {
        return member;
      }
    }

    // Try to match by name
    for (const [memberId, member] of matrix.members) {
      if (member.name &&
          member.name.toLowerCase().replace(/\s+/g, '.') === contributor.name.toLowerCase().replace(/\s+/g, '.')) {
        return member;
      }
    }

    return null;
  }

  extractCODEOWNERSAreas(codeownersExpertise) {
    const areas = new Set();

    for (const [repo, patterns] of codeownersExpertise) {
      for (const pattern of patterns) {
        areas.add(...pattern.file_types);
        areas.add(...pattern.directories.map(d => d.split('/')[0])); // Top-level directory
      }
    }

    return Array.from(areas);
  }

  extractCommitAreas(commitExpertise) {
    const areas = new Set();

    for (const [repo, commitData] of commitExpertise) {
      areas.add(...commitData.languages);
      areas.add(...Array.from(commitData.directories).map(d => d.split('/')[0]));
    }

    return Array.from(areas);
  }

  areaMatchesPattern(area, pattern) {
    return pattern.toLowerCase().includes(area.toLowerCase());
  }

  identifyExpertiseSources(member, area) {
    const sources = [];

    if (member.declared_expertise.includes(area)) {
      sources.push('declared');
    }

    // Check CODEOWNERS
    for (const [repo, patterns] of member.codeowners_expertise) {
      if (patterns.some(p =>
          p.file_types.includes(area) ||
          p.directories.some(d => d.includes(area)))) {
        sources.push('codeowners');
        break;
      }
    }

    // Check commits
    for (const [repo, commitData] of member.commit_expertise) {
      if (commitData.languages.has(area) ||
          Array.from(commitData.directories).some(d => d.includes(area))) {
        sources.push('commits');
        break;
      }
    }

    return sources;
  }

  calculateRepositoryExpertise(member, repoName) {
    const repoData = member.repositories.get(repoName);
    if (!repoData) return 0;

    let score = 0;

    // CODEOWNERS contribution
    if (repoData.codeowners_patterns > 0) {
      score += Math.min(repoData.codeowners_patterns * 20, 50);
    }

    // Commit activity contribution
    score += Math.min(repoData.commit_activity, 50);

    return Math.min(score, 100);
  }
}

module.exports = ExpertiseMatrix;
```

## 🎯 Acceptance Criteria

### CODEOWNERS Parsing
- [ ] **Multi-format Support**: Parse CODEOWNERS files with users (@username), teams (@org/team), and email formats
- [ ] **Pattern Matching**: Accurately match file paths against CODEOWNERS patterns including wildcards and directory patterns
- [ ] **Specificity Calculation**: Correctly calculate pattern specificity for ownership rule priority
- [ ] **Coverage Analysis**: Estimate repository coverage by CODEOWNERS rules with 80%+ accuracy

### Commit History Analysis
- [ ] **Multi-repository Analysis**: Analyze commit history across multiple repositories in team configuration
- [ ] **Contributor Identification**: Map git commit authors to team members with 90%+ accuracy
- [ ] **Expertise Scoring**: Calculate meaningful expertise scores based on commit frequency, recency, and complexity
- [ ] **Language Detection**: Identify programming languages and file types from commit history

### Expertise Matrix Generation
- [ ] **Multi-source Integration**: Combine CODEOWNERS, commit history, and declared expertise into unified scores
- [ ] **Confidence Scoring**: Provide confidence levels for all expertise assessments
- [ ] **Gap Analysis**: Identify expertise gaps and single points of failure in team coverage
- [ ] **Recommendation Engine**: Generate actionable recommendations for team optimization

### Performance & Reliability
- [ ] **Analysis Speed**: Complete analysis of 5 repositories with 2-year history in <60 seconds
- [ ] **Error Handling**: Graceful handling of missing repositories, invalid CODEOWNERS files, and git access issues
- [ ] **Caching**: Cache analysis results to avoid re-processing unchanged repositories
- [ ] **Memory Efficiency**: Handle large repositories (10k+ commits) without memory issues

## 🧪 Testing Requirements

### Unit Tests
```javascript
// codeowners-parser.test.js
describe('CODEOWNERSParser', () => {
  test('parses various CODEOWNERS formats', () => {
    // Test @username, @org/team, email formats
  });

  test('calculates pattern specificity correctly', () => {
    // Test specificity algorithm
  });

  test('matches file paths against patterns', () => {
    // Test pattern matching logic
  });
});

// commit-analyzer.test.js
describe('CommitAnalyzer', () => {
  test('analyzes git repository correctly', async () => {
    // Test with sample repository
  });

  test('calculates expertise scores', () => {
    // Test scoring algorithms
  });

  test('handles large repositories efficiently', async () => {
    // Performance test
  });
});

// expertise-matrix.test.js
describe('ExpertiseMatrix', () => {
  test('generates comprehensive expertise matrix', () => {
    // Test matrix generation
  });

  test('provides accurate confidence scores', () => {
    // Test confidence calculation
  });
});
```

### Integration Tests
```javascript
// codeowners-integration.test.js
describe('CODEOWNERS Integration', () => {
  test('end-to-end analysis workflow', async () => {
    // Test: repositories -> CODEOWNERS -> commits -> matrix
  });

  test('team member matching accuracy', () => {
    // Test commit author to team member mapping
  });
});
```

### Real-world Testing
1. **Large Repositories**: Test with repositories having 10k+ commits
2. **Complex CODEOWNERS**: Test with repositories having 50+ ownership rules
3. **Multi-language Projects**: Test polyglot repositories with multiple languages
4. **Team Scenarios**: Test with 2-20 team members across 2-10 repositories
5. **Edge Cases**: Test with empty repositories, missing CODEOWNERS, inactive contributors

## 🔌 Integration Points

### Team Configuration System (Task 1)
- **Team Members**: Uses team member definitions for expertise mapping
- **Repository Configuration**: Analyzes repositories defined in team configuration
- **GitHub Integration**: Uses repository URLs for analysis

### AI Assignment Logic (Task 5)
- **Expertise Data**: Provides expertise matrix for assignment algorithms
- **Confidence Scores**: Supplies confidence levels for assignment decisions
- **Recommendation Engine**: Feeds recommendations into assignment logic

### GitHub Integration
- **Repository Access**: Fetches CODEOWNERS files via GitHub API
- **Commit History**: Analyzes git history from local or remote repositories
- **Team Mapping**: Maps GitHub users to team members

## 🚨 Risk Mitigation

### Technical Risks
1. **Large Repository Performance**: Implement streaming analysis and result caching
2. **GitHub API Limits**: Use local git analysis as fallback, cache CODEOWNERS data
3. **Author Mapping Accuracy**: Provide manual override capabilities, multiple matching strategies

### Data Quality Risks
1. **Outdated CODEOWNERS**: Validate CODEOWNERS age and completeness
2. **Incomplete Commit History**: Handle repositories with limited history gracefully
3. **Team Member Changes**: Support team configuration updates and re-analysis

### Business Risks
1. **Analysis Accuracy**: Provide confidence scores and manual verification options
2. **Privacy Concerns**: Ensure no sensitive data is stored or transmitted
3. **Team Adoption**: Make analysis results clearly understandable and actionable

## 📊 Success Metrics

### Technical Performance
- CODEOWNERS parsing accuracy: >95% for standard patterns
- Commit analysis speed: <60 seconds for large repositories
- Team member mapping accuracy: >90% with proper configuration

### Business Impact
- Expertise visibility: Clear expertise mapping for all team areas
- Assignment confidence: >80% confidence scores for primary expertise areas
- Gap identification: 100% identification of expertise gaps and risks

### Quality Metrics
- Analysis consistency: Same results on repeated analysis
- Confidence correlation: Confidence scores correlate with manual assessment
- Recommendation accuracy: >80% of recommendations are actionable

## 🎯 Definition of Done

- [ ] All acceptance criteria met and tested
- [ ] CODEOWNERS parsing handles all GitHub-supported formats
- [ ] Commit analysis works with various git repository structures
- [ ] Expertise matrix provides actionable insights with confidence scores
- [ ] Performance benchmarks met (60-second analysis time)
- [ ] Integration tests pass with real-world repositories
- [ ] Error handling covers all identified failure modes
- [ ] Documentation includes setup examples and troubleshooting guide
- [ ] Code review completed with algorithm validation
- [ ] Team member mapping accuracy validated with test data

This task creates the intelligence foundation for accurate AI-driven task assignment by providing comprehensive, confidence-scored expertise data derived from multiple authoritative sources.