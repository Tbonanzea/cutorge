---
name: feature
description: Implement a new feature with full architectural review
agent: workspace-orchestrator
argument-hint: <description>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Feature Implementation

Implement the feature: **$ARGUMENTS**

## Workflow

1. **Clarify requirements** if unclear - use AskUserQuestion
2. **Explore existing patterns** - Use Task(Explore) to find similar features
3. **Plan approach**:
   - Server vs Client Components?
   - Database changes needed?
   - API routes required?
4. **Delegate reviews**:
   - Task(nextjs-architect) for routing/data fetching
   - Task(ui-engineer) for component composition
   - Task(typescript-guardian) for type boundaries
5. **Implement** following:
   - Server Components by default
   - Zod only at API boundaries
   - Tailwind utilities (no custom CSS)
   - Semantic HTML + ARIA
6. **Pre-commit checklist**:
   - [ ] No unnecessary 'use client'
   - [ ] Zod only at boundaries
   - [ ] Tailwind utilities used
   - [ ] Accessibility verified
   - [ ] Mobile responsive
   - [ ] No security vulnerabilities
7. **Create semantic commit** - DO NOT push without asking

Reference: vercel-react-best-practices, web-design-guidelines, supabase-postgres-best-practices
