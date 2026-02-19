---
allowed-tools: Bash, Read, Write, LS, Glob, Task, WebSearch
description: Interactive ideation and brainstorming engine that generates contextual questions and provides intelligent suggestions before PRD creation
---

# /oden:brainstorm - Intelligent Brainstorming Engine

Sistema interactivo de ideación que conduce sesiones de brainstorming inteligentes con preguntas contextuales, sugerencias de alternativas, identificación de riesgos, y transición fluida a la creación de PRDs.

## Usage

```bash
/oden:brainstorm [feature_name]

# Ejemplos
/oden:brainstorm "user authentication system"
/oden:brainstorm "payment processing"
/oden:brainstorm "dashboard analytics"
/oden:brainstorm "mobile notifications"

# Flags opcionales
/oden:brainstorm --quick "feature name"     # Sesión rápida (3-4 preguntas)
/oden:brainstorm --deep "feature name"     # Sesión profunda (8-10 preguntas)
/oden:brainstorm --research "feature name" # Incluye research competitivo
```

## Core Architecture

### Multi-Phase Brainstorming Process

1. **Context Analysis Phase** 🔍
   - Analyze existing project documentation
   - Detect project type, framework, and architecture
   - Review related features and potential overlaps
   - Gather competitive intelligence when enabled

2. **Interactive Question Phase** 💭
   - Generate 5-8 intelligent, contextual questions
   - Adapt questions based on feature type and project context
   - Provide follow-up clarifications when needed
   - Suggest considerations user might not have thought of

3. **Alternative Exploration Phase** 🔄
   - Propose different implementation approaches
   - Analyze trade-offs for each alternative
   - Identify potential risks and dependencies
   - Suggest industry best practices

4. **Synthesis and Transition Phase** 📋
   - Summarize key decisions and insights
   - Generate structured requirements outline
   - Seamlessly transition to enhanced `/oden:prd` creation
   - Preserve all brainstorming context for PRD generation

---

## IMPLEMENTATION

### Preflight Validation

1. **Feature Name**: Must be descriptive (minimum 3 words or clear concept)
2. **Project Context**: Check for existing docs in `.claude/prds/` and `docs/reference/`
3. **Output Directory**: Ensure `.claude/brainstorm/` directory exists

### Phase 1: Context Analysis 🔍

```bash
# Analyze project environment and existing work
analyze_project_context() {
    # Read technical decisions and architecture
    TECH_DECISIONS=""
    if [ -f "docs/reference/technical-decisions.md" ]; then
        TECH_DECISIONS=$(cat "docs/reference/technical-decisions.md")
    fi

    # Scan existing PRDs for related features
    EXISTING_PRDS=""
    if [ -d ".claude/prds" ]; then
        EXISTING_PRDS=$(find .claude/prds -name "*.md" -exec basename {} .md \;)
    fi

    # Detect project framework and type
    FRAMEWORK=$(detect_framework_from_package_json)
    PROJECT_TYPE=$(determine_project_type)

    echo "Context analyzed: $FRAMEWORK project with $PROJECT_TYPE focus"
}
```

### Phase 2: Intelligent Question Generation 💭

The brainstorming system generates contextual questions based on:

#### Question Categories

**Business & User Value:**
- What specific user problem does this solve?
- Who are the primary and secondary users?
- How will success be measured?
- What's the expected business impact?

**Technical Implementation:**
- What technical constraints exist in current architecture?
- How will this integrate with existing systems?
- What are the performance and scalability requirements?
- What security considerations apply?

**User Experience:**
- How will users discover and learn this feature?
- What accessibility requirements must be met?
- What are the key user flows and edge cases?
- How should errors and failures be handled?

**Strategic & Risk Assessment:**
- What could cause this feature to fail?
- What external dependencies exist?
- What compliance or regulatory requirements apply?
- How does this compare to competitive solutions?

#### Context-Adaptive Logic

```yaml
# Question adaptation based on project type
Web Application:
  - Focus on SEO, responsive design, browser compatibility
  - Ask about analytics, user tracking, conversion funnels
  - Consider PWA capabilities, offline functionality

Mobile Application:
  - Focus on native device capabilities, push notifications
  - Ask about app store guidelines, update strategies
  - Consider battery usage, performance optimization

API/Backend:
  - Focus on rate limiting, authentication, data validation
  - Ask about API versioning, documentation, monitoring
  - Consider scalability, caching, database design

E-commerce:
  - Focus on payment processing, inventory, order management
  - Ask about fraud prevention, tax calculation, shipping
  - Consider checkout flow optimization, cart abandonment

Dashboard/Analytics:
  - Focus on data visualization, real-time updates, filtering
  - Ask about user roles, permissions, data sources
  - Consider export capabilities, scheduled reports
```

### Phase 3: Alternative Exploration 🔄

#### Implementation Approach Analysis

For each major decision point, the system presents:

1. **Quick Win Approach**: Fast implementation, limited scope
2. **Standard Approach**: Industry best practices, balanced effort
3. **Advanced Approach**: Comprehensive solution, higher complexity

#### Example: Authentication Feature Alternatives

```markdown
## Authentication Implementation Options:

### 1. Quick Win: Basic Email/Password
**Pros:** Fast implementation, familiar UX, full control
**Cons:** Security burden, no social login, manual verification
**Timeline:** 1-2 weeks
**Complexity:** Low

### 2. Standard: Auth0/Supabase Integration
**Pros:** Professional security, social logins, managed infrastructure
**Cons:** Third-party dependency, cost scaling, customization limits
**Timeline:** 2-3 weeks
**Complexity:** Medium

### 3. Advanced: Custom OAuth2 Provider
**Pros:** Maximum control, enterprise features, white-label ready
**Cons:** High complexity, security responsibility, longer timeline
**Timeline:** 4-6 weeks
**Complexity:** High

Based on your project context (${PROJECT_TYPE}), we recommend: **${RECOMMENDATION}**
```

### Phase 4: Risk Identification & Mitigation 🚨

#### Automated Risk Analysis

```yaml
Common Risk Categories:
  Technical Risks:
    - Integration complexity with existing systems
    - Performance impact on current architecture
    - Data migration and compatibility issues
    - Third-party service dependencies

  Business Risks:
    - User adoption and change management
    - Revenue impact during implementation
    - Competitive response and market timing
    - Resource allocation and team capacity

  Compliance Risks:
    - Data privacy regulations (GDPR, CCPA)
    - Industry standards and certifications
    - Security audit requirements
    - Accessibility compliance obligations

  Operational Risks:
    - Support and maintenance overhead
    - Monitoring and alerting requirements
    - Backup and disaster recovery needs
    - Documentation and knowledge transfer
```

---

## INTERACTIVE CONVERSATION FLOW

### Question Sequence Example

```bash
🎯 Brainstorming: User Authentication System

Based on your Next.js + Supabase project, I'll ask 6 targeted questions:

1/6: PROBLEM DEFINITION
What specific authentication problems are your users facing right now?
Options: a) No account system exists  b) Current system is too complex
         c) Security concerns  d) Integration issues

→ User selects: a) No account system exists

2/6: USER JOURNEY
How do you want users to sign up for the first time?
Context: I see you're building an e-commerce platform
Options: a) Email/password only  b) Social login (Google, GitHub)
         c) Magic link/passwordless  d) Combination approach

→ User selects: d) Combination approach

💡 FOLLOW-UP: Since you chose combination - which social providers matter most to your target users? Consider your competitive analysis of [similar platforms].

3/6: INTEGRATION CONTEXT
Your tech stack uses Supabase. How should auth integrate with your existing data?
Options: a) Supabase Auth + profiles table  b) Custom JWT solution
         c) Hybrid approach with external provider

→ User selects: a) Supabase Auth + profiles table

4/6: SUCCESS CRITERIA
How will you measure if this authentication system is successful?
Key metrics to consider:
- Sign-up completion rate (industry avg: 68% for e-commerce)
- Time to first successful login
- Support tickets related to auth issues

→ User provides specific metrics

5/6: RISK ASSESSMENT
What concerns you most about implementing authentication?
Based on similar Next.js projects, common issues are:
a) Session management complexity  b) Email verification deliverability
c) GDPR compliance  d) Password reset flow

→ User discusses concerns

6/6: SCOPE BOUNDARIES
For your MVP, what authentication features are must-haves vs nice-to-haves?

Must-haves: [User provides list]
Nice-to-haves: [User provides list]

✅ BRAINSTORMING COMPLETE

📋 Summary:
- Problem: No existing account system for e-commerce platform
- Solution: Hybrid auth with social + email, Supabase integration
- Success metrics: 70%+ signup completion, <2 support tickets/week
- Key risk: Email deliverability and GDPR compliance
- MVP scope: Email/password + Google OAuth, basic profiles

🚀 Ready to create PRD?
Run: /oden:prd user-authentication-system
(All brainstorming context will be automatically included)
```

### Advanced Question Logic

#### Follow-up Generation
```javascript
// Dynamic follow-ups based on user answers
generateFollowUp(question, answer, context) {
    if (question.type === 'user_personas' && answer.includes('B2B')) {
        return {
            question: "What role-based permissions will different business users need?",
            context: "B2B applications typically require admin/user/viewer roles",
            suggestions: ["Admin dashboard", "Usage analytics", "Team management"]
        };
    }

    if (question.type === 'technical_constraints' && context.framework === 'next.js') {
        return {
            question: "Will this need to work with Next.js API routes or external APIs?",
            context: "Next.js projects often use a mix of internal and external APIs",
            suggestions: ["Middleware integration", "Edge function compatibility"]
        };
    }
}
```

---

## DATA PERSISTENCE & PRD INTEGRATION

### Brainstorming Session Storage

```yaml
# .claude/brainstorm/session-{timestamp}.json
{
  "feature_name": "user-authentication-system",
  "started_at": "2026-02-18T20:00:00Z",
  "completed_at": "2026-02-18T20:15:00Z",
  "project_context": {
    "framework": "next.js",
    "backend": "supabase",
    "project_type": "e-commerce"
  },
  "questions_asked": [
    {
      "id": "problem_definition",
      "question": "What specific authentication problems...",
      "answer": "No account system exists",
      "follow_ups": ["What user verification is needed?"]
    }
  ],
  "alternatives_discussed": [
    {
      "approach": "Supabase Auth",
      "pros": ["Integrated with existing backend", "Battle-tested"],
      "cons": ["Vendor lock-in", "Customization limits"],
      "selected": true,
      "reasoning": "Best fit for current tech stack"
    }
  ],
  "risks_identified": [
    {
      "risk": "Email deliverability",
      "impact": "medium",
      "mitigation": "Use transactional email service"
    }
  ],
  "key_decisions": {
    "auth_method": "hybrid (email + social)",
    "providers": ["email", "google"],
    "user_data": "supabase profiles table",
    "mvp_scope": ["signup", "login", "basic_profile"]
  }
}
```

### Seamless PRD Transition

When `/oden:prd user-authentication-system` is run after brainstorming:

1. **Auto-detect Brainstorming Session**: Look for matching session file
2. **Pre-populate PRD Context**: Use brainstorming decisions as PRD input
3. **Skip Redundant Questions**: Don't re-ask what was covered in brainstorming
4. **Enhance with Research**: Add competitive analysis and technical specs
5. **Generate Comprehensive PRD**: Include all brainstorming insights

---

## SUCCESS METRICS

### Conversation Quality
- **Question Relevance**: 90%+ questions should be contextually appropriate
- **Follow-up Intelligence**: 70%+ follow-ups should provide valuable clarification
- **Alternative Coverage**: Present 2-3 meaningful alternatives per major decision

### Integration Success
- **PRD Enhancement**: 80%+ of brainstorming insights appear in generated PRD
- **Context Preservation**: All key decisions and rationale maintained
- **Development Acceleration**: 30%+ faster implementation due to clarity

### User Experience
- **Session Completion**: 85%+ of started sessions complete all core questions
- **Decision Confidence**: Users report high confidence in chosen direction
- **Insight Generation**: Users discover considerations they hadn't thought of

---

## COMPETITIVE RESEARCH INTEGRATION

When `--research` flag is used:

```bash
/oden:brainstorm --research "payment processing"

# Automated competitive analysis during brainstorming
🔍 Researching payment processing solutions...

Found insights from Stripe, PayPal, Square implementations:
- Industry standard: 2.9% + $0.30 per transaction
- Mobile optimization crucial (60% of payments on mobile)
- Compliance: PCI DSS Level 1 required for card storage
- UX benchmark: <3 seconds checkout completion

💡 Questions adapted based on research:
4/7: COMPETITIVE POSITIONING
Stripe dominates with developer experience, PayPal with buyer trust.
What's your differentiating factor for payment experience?

5/7: COMPLIANCE STRATEGY
Research shows PCI compliance costs $50K+ annually for custom solutions.
How important is cost vs. control for payment processing?
```

---

## ERROR HANDLING & RECOVERY

### Session Recovery
- Auto-save conversation state every 2 questions
- Resume incomplete sessions when command re-run
- Export session data for manual review

### Question Adaptation
- Skip questions that can't be contextualized
- Provide fallback generic questions when context analysis fails
- Allow manual question override with custom input

### Integration Fallbacks
- Generate standalone summary if PRD integration fails
- Provide manual transition instructions
- Export brainstorming results to markdown file

---

## IMPLEMENTATION ROADMAP

### Phase 1: Core Engine (Week 1)
- [ ] Basic question generation system
- [ ] Interactive conversation flow
- [ ] Session state management
- [ ] Context analysis foundation

### Phase 2: Intelligence Layer (Week 2)
- [ ] Framework-specific question adaptation
- [ ] Alternative suggestion engine
- [ ] Risk identification system
- [ ] Follow-up generation logic

### Phase 3: Integration & Polish (Week 3)
- [ ] Seamless PRD transition
- [ ] Competitive research integration
- [ ] Session persistence and recovery
- [ ] Advanced conversation analytics

---

This brainstorming engine transforms feature ideation from a scattered thought process into a structured, intelligent conversation that produces actionable insights and seamless integration with the broader Oden development methodology.