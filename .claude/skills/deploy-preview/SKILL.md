---
name: deploy-preview
description: Deploy to preview/staging environment
disable-model-invocation: true
allowed-tools: Bash
argument-hint: [branch-name]
---

# Deploy to Preview

Deploy branch **$ARGUMENTS** to preview environment.

## Pre-Deployment Checklist

Before deploying:

1. **Run build locally**:
   ```bash
   npm run build
   ```

2. **Check for errors**:
   - TypeScript errors
   - ESLint warnings
   - Build warnings

3. **Verify env vars** (.env.example up to date)

4. **Test critical paths**:
   - Authentication works
   - File uploads work
   - Quoting flow works

## Deployment Steps

```bash
# Ensure on correct branch
git checkout ${ARGUMENTS:-$(git branch --show-current)}

# Verify clean state
git status

# Push to remote
git push origin HEAD

# Vercel will auto-deploy preview from push
echo "Preview deployment triggered"
echo "Check: https://vercel.com/[your-project]/deployments"
```

## Post-Deployment

1. Wait for Vercel build to complete
2. Visit preview URL
3. Test authentication
4. Test file upload
5. Test quoting flow
6. Report preview URL to user

**DO NOT** deploy to production without user approval.
