---
name: bug
description: Fix a bug with root cause analysis and testing
agent: workspace-orchestrator
argument-hint: <description>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

# Bug Fix

Fix bug: **$ARGUMENTS**

## Workflow

1. **Reproduce** - Understand exact steps to trigger bug
2. **Locate** - Use Task(Explore) to find relevant code
3. **Root cause** - Identify why bug exists:
   - Logic error?
   - Type unsafety?
   - Race condition?
   - Boundary validation missing?
4. **Fix** with minimal scope:
   - Fix ONLY the bug
   - Don't refactor surrounding code
   - Don't add unnecessary features
5. **Verify**:
   - Test the fix manually
   - Ensure no regressions
   - Check error handling
6. **Commit**:
   ```
   fix: brief description

   Root cause: ...
   Fix: ...
   Tested: ...
   ```

## Anti-Patterns to Avoid

❌ Over-engineering the fix
❌ Refactoring unrelated code
❌ Adding "improvements" beyond the bug
❌ Not testing edge cases

Reference: vercel-react-best-practices (for React bugs), supabase-postgres-best-practices (for DB bugs)
