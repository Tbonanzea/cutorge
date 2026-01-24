---
name: review
description: Review code changes or pull request
agent: workspace-orchestrator
argument-hint: [pr-url or file-path]
allowed-tools: Read, Glob, Grep, Bash, Task
---

# Code Review

Review: **$ARGUMENTS**

## Review Checklist

### Architecture (CRITICAL)
- [ ] Server Components used by default?
- [ ] 'use client' only where needed?
- [ ] No server logic in UI components?
- [ ] Proper data fetching patterns?

### Type Safety (CRITICAL)
- [ ] Zod only at API boundaries?
- [ ] Types inferred from schemas?
- [ ] No unsafe type assertions?
- [ ] Generics properly constrained?

### UI & Accessibility (HIGH)
- [ ] Tailwind utilities (not custom CSS)?
- [ ] Mobile-first responsive?
- [ ] Semantic HTML used?
- [ ] ARIA labels on icon buttons?
- [ ] Keyboard navigation works?
- [ ] Focus styles visible?

### Security (CRITICAL)
- [ ] No XSS vulnerabilities?
- [ ] No SQL injection risks?
- [ ] Input validation at boundaries?
- [ ] No exposed secrets/credentials?

### Performance (MEDIUM)
- [ ] No N+1 queries?
- [ ] Proper caching strategy?
- [ ] Bundle size optimized?
- [ ] No waterfalls?

## Delegation

For specialized review:
- Task(nextjs-architect) - App Router patterns
- Task(ui-engineer) - Component composition
- Task(typescript-guardian) - Type safety

## Output Format

**APPROVED** | **CHANGES REQUESTED** | **REJECTED**

**Summary**: Brief overview

**Issues**:
1. [CRITICAL/WARNING/SUGGESTION] file.ts:123 - Description
2. ...

**Recommendations**:
- Specific code changes with before/after

Reference: vercel-react-best-practices, web-design-guidelines, supabase-postgres-best-practices
