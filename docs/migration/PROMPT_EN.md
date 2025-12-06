# TOYBOX Migration Prompt (English)

Copy the prompt below and give it to Claude Code to upgrade your existing TOYBOX instance.

---

``````plaintext
I need you to upgrade my TOYBOX repository with the latest template improvements from upstream. My repository was originally cloned from the toybox-template but may have diverged significantly. Please follow these instructions carefully.

IMPORTANT: Communicate with me in English throughout this process.

## IMPORTANT CONTEXT

The upstream template repository is: https://github.com/isnbh0/toybox-template.git
The target branch with updates is: main

These updates are BACKWARD COMPATIBLE. My existing artifacts with `export const metadata = {...}` will continue to work. The changes add:
- External metadata file support (.metadata.ts, .metadata.json)
- Per-card error boundaries in the gallery
- New ErrorBoundary and ArtifactCard components
- Updated documentation

## PHASE 1: PRE-FLIGHT CHECKS

Before making ANY changes, perform these checks and report findings:

1. **Verify we're in a TOYBOX repository**:
   - Check for `src/artifacts/` directory
   - Check for `src/lib/artifactLoader.ts`
   - Check for `TOYBOX_CONFIG.json`
   - If any are missing, STOP and ask me if this is the correct directory.

2. **Check git state**:
   - Run `git status` - report if there are uncommitted changes
   - Run `git branch` - identify current branch
   - Run `git remote -v` - list existing remotes
   - If there are uncommitted changes, STOP and ask me whether to stash them or abort.

3. **Check local environment**:
   - Run `node --version` - should be v18+
   - Check if `node_modules/` exists
   - Run `npm run build` to verify current state builds successfully
   - If build fails, STOP and report the error - we should fix existing issues first.

4. **Identify instance-specific files** (files I've customized that should NOT be overwritten):
   - `github.config.json` - my GitHub username/repo
   - `TOYBOX_CONFIG.json` - my site customization
   - `README.md` - my content
   - `package.json` - check `homepage` and `repository` fields for my values
   - `index.html` - my title
   - `public/404.html` - my title
   - `src/components/AboutPage.tsx` - my GitHub link
   - Any files in `src/artifacts/` - my artifacts

Record the current values of username/repository from `github.config.json` for later restoration.

## PHASE 2: CREATE SAFETY BACKUP

Before any modifications:

1. Create a backup branch:
   ```bash
   git checkout -b backup-before-template-upgrade-$(date +%Y%m%d-%H%M%S)
   git checkout -  # return to original branch
   ```

2. Note the current HEAD commit hash:
   ```bash
   git rev-parse HEAD
   ```
   Save this hash - we can hard reset to it if needed.

## PHASE 3: FETCH UPSTREAM CHANGES

Do NOT assume an 'upstream' remote exists. Set it up fresh:

1. Check if upstream remote exists:
   ```bash
   git remote get-url upstream 2>/dev/null
   ```

2. If it doesn't exist or points elsewhere, add/update it:
   ```bash
   git remote remove upstream 2>/dev/null  # remove if exists
   git remote add upstream https://github.com/isnbh0/toybox-template.git
   ```

3. Fetch the latest:
   ```bash
   git fetch upstream main
   ```

## PHASE 4: ANALYZE CHANGES

Before applying, analyze what will change:

1. Show file-level diff summary:
   ```bash
   git diff HEAD upstream/main --stat
   ```

2. Check for conflicts in instance-specific files:
   ```bash
   git diff HEAD upstream/main -- github.config.json TOYBOX_CONFIG.json README.md package.json index.html public/404.html src/components/AboutPage.tsx
   ```

3. Check the core files we want to update:
   ```bash
   git diff HEAD upstream/main -- src/lib/artifactLoader.ts src/components/ArtifactGallery.tsx src/components/ArtifactRunner.tsx
   ```

4. Check for new files:
   ```bash
   git diff HEAD upstream/main --diff-filter=A --name-only
   ```
   Expected new files: `src/components/ErrorBoundary.tsx`, `src/components/ArtifactCard.tsx`, `docs/MIGRATION.md`

Report the analysis to me. If there are unexpected changes or the diff is very large, ASK before proceeding.

## PHASE 5: APPLY UPDATES (SELECTIVE MERGE)

We will selectively apply changes to avoid overwriting instance-specific files.

### Step 5a: Get new files directly (safe - these don't exist locally):
```bash
git checkout upstream/main -- src/components/ErrorBoundary.tsx
git checkout upstream/main -- src/components/ArtifactCard.tsx
git checkout upstream/main -- docs/MIGRATION.md
```

### Step 5b: Update core template files:
```bash
git checkout upstream/main -- src/lib/artifactLoader.ts
git checkout upstream/main -- src/components/ArtifactGallery.tsx
git checkout upstream/main -- src/components/ArtifactRunner.tsx
```

### Step 5c: Update CLAUDE.md (development guide) - CAREFUL:
If I have made customizations to CLAUDE.md, we should merge manually. Check first:
```bash
git diff HEAD upstream/main -- CLAUDE.md | head -100
```
If the diff is only additions (new documentation sections), safe to take upstream:
```bash
git checkout upstream/main -- CLAUDE.md
```
If I have local customizations, ASK me how to proceed.

### Step 5d: DO NOT update these files (keep my versions):
- github.config.json
- TOYBOX_CONFIG.json
- README.md
- package.json (but check if there are dependency updates needed)
- index.html
- public/404.html
- src/components/AboutPage.tsx
- Anything in src/artifacts/

## PHASE 6: VERIFY CHANGES

1. Check git status:
   ```bash
   git status
   ```
   Should show modified/new files from the update.

2. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```
   If there are type errors, STOP and investigate.

3. Run linter:
   ```bash
   npm run lint
   ```
   Warnings are OK, errors need investigation.

4. Run build:
   ```bash
   npm run build
   ```
   This may fail due to config validation if github.config.json has placeholders - that's expected for template repos but should pass for configured instances.

5. If build fails with config validation error but this is a configured instance, investigate the specific error.

## PHASE 7: TEST LOCALLY (if build succeeded)

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Report the local URL and ask me to verify:
   - Gallery loads correctly
   - My existing artifacts still appear and render
   - Filtering/search works
   - Clicking an artifact shows it correctly

If I report issues, we may need to investigate or rollback.

## PHASE 8: COMMIT THE UPGRADE

Only after successful verification:

```bash
git add -A
git commit -m "chore: upgrade to latest toybox-template

Updates include:
- External metadata file support (.metadata.ts, .metadata.json)
- Per-card error boundaries in gallery
- New ErrorBoundary and ArtifactCard components
- Updated documentation

Source: https://github.com/isnbh0/toybox-template"
```

## ROLLBACK PROCEDURES

If anything goes wrong at any phase:

### Rollback Option 1: Undo uncommitted changes
```bash
git checkout -- .
git clean -fd  # removes untracked files - BE CAREFUL
```

### Rollback Option 2: Return to backup branch
```bash
git checkout backup-before-template-upgrade-TIMESTAMP
# Then if needed, force the main branch back:
git branch -f main backup-before-template-upgrade-TIMESTAMP
git checkout main
```

### Rollback Option 3: Hard reset to saved commit
```bash
git reset --hard SAVED_COMMIT_HASH
```

## FAILURE MODES TO WATCH FOR

1. **Merge conflicts**: Should not happen with selective checkout approach, but if they do, report the conflicting files.

2. **Type errors after update**: May indicate breaking changes or missing dependencies. Check if `npm install` is needed.

3. **Build failures**:
   - Config validation errors: Check github.config.json has valid values
   - Missing module errors: Run `npm install`
   - Vite errors: Try `rm -rf node_modules/.vite && npm run build`

4. **Runtime errors in browser**: Check console for errors. May indicate incompatibility with custom code.

5. **Missing artifacts**: Check that src/artifacts/ was not modified. Verify artifactLoader.ts correctly discovers artifacts.

## FINAL NOTES

- All changes from this upgrade are backward compatible
- Existing `export const metadata` in artifacts continues to work
- The new external metadata file support is optional and additive
- If you customized ArtifactGallery.tsx or ArtifactRunner.tsx locally, those customizations will be overwritten - let me know if you need to preserve them
- After successful upgrade, you can delete the backup branch: `git branch -d backup-before-template-upgrade-TIMESTAMP`
``````
