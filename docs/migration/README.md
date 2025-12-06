# TOYBOX Migration Guide

This guide helps existing TOYBOX users upgrade their repositories to receive upstream template enhancements.

## Overview

The template receives periodic updates with new features, bug fixes, and improvements. This guide covers how to safely merge these updates into your existing TOYBOX instance.

---

## Quick Compatibility Check

**Good news**: The recent updates are **fully backward compatible**. Your existing artifacts will continue to work without any changes.

| Change | Breaking? | Action Required |
|--------|-----------|-----------------|
| External metadata file support | No | None - existing `export const metadata` still works |
| New `ArtifactCard` component | No | None - internal refactor |
| New `ErrorBoundary` component | No | None - new file added |
| `getArtifactMetadata()` export | No | None - new export added |
| Gallery error boundaries | No | None - improved resilience |

---

## How to Upgrade

### Step 1: Add the upstream remote

```bash
cd your-toybox
git remote add upstream https://github.com/isnbh0/toybox-template.git
git fetch upstream
```

### Step 2: Review incoming changes

```bash
# See what's different
git diff HEAD upstream/main --stat

# Review specific files
git diff HEAD upstream/main -- src/lib/artifactLoader.ts
git diff HEAD upstream/main -- src/components/
```

### Step 3: Merge or cherry-pick

**Option A: Full merge** (recommended for recent clones)
```bash
git merge upstream/main --no-commit
# Review changes, then:
git commit -m "chore: merge upstream template updates"
```

**Option B: Cherry-pick specific features**
```bash
# Get specific commits (find commit hashes with `git log upstream/main`)
git cherry-pick <commit-hash>
```

### Step 4: Resolve conflicts (if any)

Common conflict locations:
- `CLAUDE.md` - Your customizations vs template updates
- `README.md` - Your content vs template structure
- `github.config.json` - Should keep YOUR values

For `CLAUDE.md` and `README.md`, you likely want to **keep your version** or manually merge documentation sections.

### Step 5: Test the build

```bash
npm run build
npm run dev
# Verify your artifacts still render correctly
```

---

## Detailed Change Analysis

### 1. External Metadata File Support

**What changed**: `src/lib/artifactLoader.ts` now looks for metadata in external files before checking component exports.

**Priority order**:
1. `*.metadata.ts` or `*/metadata.ts` (TypeScript)
2. `*.metadata.json` or `*/metadata.json` (JSON)
3. `export const metadata` in component (your existing pattern)

**Impact on existing artifacts**: **None**. Your existing `export const metadata = {...}` pattern continues to work exactly as before. The new external file support is additive.

**When to use external files**:
- Large artifacts where you want to separate concerns
- When you want to edit metadata without touching component code
- When using automated tooling to manage metadata

### 2. New Components

**Files added**:
- `src/components/ErrorBoundary.tsx` - Reusable error boundary
- `src/components/ArtifactCard.tsx` - Gallery card with error handling

**Impact**: None. These are new files that don't affect existing code.

**If you have custom components**: No conflicts expected unless you created files with the same names.

### 3. ArtifactGallery Refactor

**What changed**: Gallery now uses `ArtifactCard` component instead of inline JSX.

**Impact**: None for users. Internal refactor only.

**If you customized ArtifactGallery**: You may have merge conflicts. Review the diff carefully:
```bash
git diff HEAD upstream/main -- src/components/ArtifactGallery.tsx
```

### 4. ArtifactRunner Update

**What changed**: Now uses `getArtifactMetadata()` instead of inline glob imports for checking `fullscreen` and `underMaintenance` flags.

**Impact**: None. Functionally identical, just cleaner code.

### 5. New Export: `getArtifactMetadata()`

**What changed**: `src/lib/artifactLoader.ts` now exports a `getArtifactMetadata(artifactId)` function.

**Impact**: None for existing code. New API available if you want to use it.

**Usage** (optional):
```typescript
import { getArtifactMetadata } from '@/lib/artifactLoader';

const metadata = getArtifactMetadata('my-artifact');
if (metadata?.hidden) {
  // ...
}
```

---

## Files You Should NOT Merge

These files contain your instance-specific configuration. Keep YOUR versions:

| File | Reason |
|------|--------|
| `github.config.json` | Your GitHub username/repo |
| `TOYBOX_CONFIG.json` | Your site customization |
| `README.md` | Your content (unless you want template structure) |
| `package.json` | Keep your `homepage` and `repository` fields |
| `index.html` | Your title |
| `public/404.html` | Your title |
| `src/components/AboutPage.tsx` | Your GitHub link |

### Recommended merge strategy for these files:

```bash
# During merge, keep your version of config files
git checkout --ours github.config.json
git checkout --ours TOYBOX_CONFIG.json
git checkout --ours README.md
git add github.config.json TOYBOX_CONFIG.json README.md
```

---

## Files Safe to Accept from Upstream

These files contain template improvements with no instance-specific content:

| File | Content |
|------|---------|
| `src/lib/artifactLoader.ts` | Core loading logic |
| `src/components/ArtifactGallery.tsx` | Gallery component |
| `src/components/ArtifactRunner.tsx` | Artifact viewer |
| `src/components/ArtifactCard.tsx` | New file |
| `src/components/ErrorBoundary.tsx` | New file |
| `src/components/ui/*` | shadcn/ui components |
| `CLAUDE.md` | Development guide (may want to review) |
| `docs/*` | Documentation |

---

## Checking Your Artifacts After Upgrade

Run this quick check to ensure your artifacts still work:

```bash
# Build should complete without errors
npm run build

# Start dev server
npm run dev

# In browser, check:
# 1. Gallery loads and shows all artifacts
# 2. Each artifact renders correctly
# 3. Filtering and search work
# 4. Standalone mode works (/standalone/artifact-name)
```

### Common issues and fixes:

**Issue**: Artifact not appearing in gallery
- Check if `hidden: true` was accidentally set
- Verify metadata has required fields: `title`, `type`, `tags`, `createdAt`, `updatedAt`

**Issue**: TypeScript errors after merge
- Run `npm install` to ensure dependencies are current
- Check for duplicate type definitions

**Issue**: Build fails
- Clear Vite cache: `rm -rf node_modules/.vite`
- Reinstall: `rm -rf node_modules && npm install`

---

## Optional: Adopting New Features

### Using External Metadata Files

If you want to migrate an artifact to use external metadata:

**Before** (`my-artifact.tsx`):
```typescript
export const metadata = {
  title: 'My Artifact',
  type: 'react',
  tags: ['demo'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default function MyArtifact() { ... }
```

**After** (two files):

`my-artifact.tsx`:
```typescript
export default function MyArtifact() { ... }
```

`my-artifact.metadata.ts`:
```typescript
import { ArtifactMetadata } from '@/lib/artifactLoader';

export const metadata: ArtifactMetadata = {
  title: 'My Artifact',
  type: 'react',
  tags: ['demo'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};
```

### Using New Metadata Flags

You can now use these optional flags in your metadata:

```typescript
export const metadata = {
  // ... required fields ...
  hidden: true,          // Hide from gallery, accessible via /a/artifact-name
  fullscreen: true,      // Auto-fullscreen in standalone mode
  underMaintenance: true // Show maintenance banner
};
```

---

## Getting Help

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/isnbh0/toybox-template/issues)
2. Review the [CLAUDE.md](../CLAUDE.md) for development guidance
3. Open a new issue with your error message and steps to reproduce

---

## Version History

| Date | Changes |
|------|---------|
| 2024-12-06 | External metadata files, error boundaries, gallery improvements |
