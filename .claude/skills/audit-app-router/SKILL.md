---
name: audit-app-router
description: Audit Next.js 15 App Router usage patterns
agent: nextjs-architect
allowed-tools: Read, Glob, Grep, Task
---

# App Router Audit

Audit Next.js 15 App Router patterns across the codebase.

## Scan Areas

1. **Server vs Client Components**
   - Find all 'use client' directives
   - Verify each is necessary (needs interactivity/hooks/browser APIs)
   - Flag unnecessary Client Components

2. **Data Fetching**
   - Locate all useEffect with fetch calls → should be Server Components
   - Check fetch() cache configuration
   - Verify no waterfalls (sequential awaits)

3. **File Conventions**
   - Verify layout.tsx used for shared UI
   - Check loading.tsx for route-level loading
   - Verify error.tsx for error boundaries
   - Check metadata exports

4. **Route Handlers**
   - Verify mutations use route handlers not inline
   - Check request validation with Zod
   - Verify proper error handling

5. **Middleware**
   - Ensure lightweight operations only
   - No heavy database queries
   - Session refresh only

## Output

Generate report:

**CRITICAL Issues**: Must fix
**WARNINGS**: Should fix
**SUGGESTIONS**: Nice to have

For each: file:line with explanation and fix.

Reference: vercel-react-best-practices (async-*, server-* rules)
