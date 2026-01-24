---
name: deploy-prod
description: Deploy to production (requires approval)
disable-model-invocation: true
allowed-tools: Bash, AskUserQuestion
---

# Deploy to Production

⚠️ **PRODUCTION DEPLOYMENT** - Requires explicit user approval

## Pre-Flight Checks

1. **Verify main branch**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Run full build**:
   ```bash
   npm run build
   ```

3. **Verify tests** (if configured):
   ```bash
   npm test
   ```

4. **Check production env vars** are set in Vercel dashboard

5. **Review recent commits**:
   ```bash
   git log --oneline -10
   ```

## User Approval Required

Use AskUserQuestion to confirm:
- Have you reviewed all changes since last production deploy?
- Are all environment variables configured?
- Have you tested on preview/staging?
- Ready to deploy to production?

## Deployment

Only after approval:

```bash
# Deploy to production (Vercel auto-deploys from main)
git push origin main

# Or manual trigger
npx vercel --prod
```

## Post-Deployment Monitoring

1. Verify deployment success in Vercel
2. Check production URL loads
3. Test authentication
4. Monitor error tracking (if configured)
5. Watch for user reports

## Rollback (if needed)

```bash
# Revert to previous deployment in Vercel dashboard
# Or revert commits
git revert HEAD
git push origin main
```

⚠️ **NEVER force push to main** ⚠️
