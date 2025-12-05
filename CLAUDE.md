# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TOYBOX template - a React-based portfolio/gallery application for showcasing Claude-generated artifacts. It's designed to be deployed to GitHub Pages and serves as a template for creating personal artifact collections.

## Architecture

**Frontend Stack:**
- React 18 with TypeScript
- Vite for build tooling and development server
- Tailwind CSS for styling
- shadcn/ui component library (Radix UI primitives)
- React Router for navigation

**Artifact System:**
- Artifacts are stored in `src/artifacts/` as `.tsx` files or in subdirectories with `index.tsx`
- Static imports via Vite's `import.meta.glob()` for automatic discovery
- Support for React, SVG, and Mermaid diagram types
- Metadata can be defined in external files or within component exports (see Metadata System below)

**Key Components:**
- `ArtifactLoader` (`src/lib/artifactLoader.ts`): Core system for discovering and loading artifacts
- `ArtifactRunner` (`src/components/ArtifactRunner.tsx`): Renders individual artifacts with standalone mode support
- `ArtifactGallery` (`src/components/ArtifactGallery.tsx`): Main gallery view with filtering and search
- `ArtifactCard` (`src/components/ArtifactCard.tsx`): Individual card with error boundary
- `ErrorBoundary` (`src/components/ErrorBoundary.tsx`): Reusable error boundary component
- UI components in `src/components/ui/`: shadcn/ui component library

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Test production build with base path
npm run test-production
```

### Testing the Development Server

When testing the development server, run it as a background process that logs to `.local/devserver.log`:

```bash
# Create .local directory if it doesn't exist
mkdir -p .local

# Run dev server in background with logging
npm run dev > .local/devserver.log 2>&1 &
```

## Configuration

### Configuration Files

**TOYBOX_CONFIG.json**: Site configuration (title, description, theme, layout)
**components.json**: shadcn/ui configuration
**vite.config.ts**: Build configuration with GitHub Pages support
**github.config.json**: GitHub deployment configuration (username and repository name) - should be committed after setup

### Centralized Configuration System

The template uses a centralized configuration system to manage all deployment-related constants. Configuration priority:
1. Environment variables (highest priority)
2. `github.config.json` file
3. Default values (lowest priority)

**Key Configuration Components:**
- `scripts/config-loader.js` - ESM module for Node.js scripts
- `src/lib/config.ts` - TypeScript module for frontend runtime
- `vite.config.ts` - Contains inline config loading for build process

**Configuration Validation:**
- `npm run validate-config` - Validates configuration before building
- `npm run validate-setup` - Comprehensive setup validation
- Build process automatically validates configuration via prebuild hook

For detailed configuration documentation, see `docs/CONFIGURATION.md`.

### GitHub Deployment Configuration

Before deploying to GitHub Pages:

1. Check if `github.config.json` exists and is properly configured
2. If the file doesn't exist or contains placeholder values (`YOUR_GITHUB_USERNAME` or `YOUR_REPO_NAME`):
   - Ask the user for their GitHub username and repository name
   - Create/update `github.config.json` with these values
   - Run `npm run update-config` to apply the configuration to all relevant files
3. The configuration updates:
   - package.json (homepage and repository URL)
   - index.html (title)
   - public/404.html (title)
   - src/components/AboutPage.tsx (GitHub link)
   - TOYBOX_CONFIG.json (with customization options)
   - Note: vite.config.ts and .github/workflows/deploy.yml now use the centralized config system

Example `github.config.json`:
```json
{
  "username": "myusername",
  "repository": "my-toybox",
  "description": "Configuration for GitHub deployment.",
  "customization": {
    "siteName": "My Portfolio",
    "siteDescription": "My collection of Claude artifacts",
    "showGitHubLink": true,
    "defaultTheme": "auto"
  }
}
```

**Environment Variable Overrides:**
```bash
# Override base URL
BASE_URL=/custom-path/ npm run build

# Override GitHub config
GITHUB_USERNAME=user GITHUB_REPOSITORY=repo npm run build
```

## Path Resolution

- `@/` and `src/` aliases resolve to `./src/`
- Base path handling for GitHub Pages deployment (automatically set from configuration)

## Artifact Development

Create new artifacts in `src/artifacts/`:
- Direct files: `src/artifacts/my-artifact.tsx`
- Subdirectories: `src/artifacts/my-artifact/index.tsx`

Each artifact should have metadata and export a default React component.

### Metadata System

Metadata can be provided in three ways (in priority order):

1. **External TypeScript file** (highest priority):
   - Direct: `src/artifacts/my-artifact.metadata.ts`
   - Subdirectory: `src/artifacts/my-artifact/metadata.ts`

2. **External JSON file**:
   - Direct: `src/artifacts/my-artifact.metadata.json`
   - Subdirectory: `src/artifacts/my-artifact/metadata.json`

3. **Component export** (lowest priority):
   ```tsx
   export const metadata = { ... };
   ```

**Metadata Interface:**
```typescript
interface ArtifactMetadata {
  title: string;
  description?: string;
  type: 'react' | 'svg' | 'mermaid';
  tags: string[];
  folder?: string;           // Logical grouping without changing file structure
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  hidden?: boolean;          // Hide from gallery (still accessible via direct URL)
  fullscreen?: boolean;      // Auto-fullscreen in standalone mode
  underMaintenance?: boolean; // Show maintenance banner
}
```

**Example TypeScript metadata file** (`my-artifact.metadata.ts`):
```typescript
import { ArtifactMetadata } from '../lib/artifactLoader';

export const metadata: ArtifactMetadata = {
  title: 'My Artifact',
  description: 'A description of my artifact',
  type: 'react',
  tags: ['demo', 'example'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
};
```

**Example JSON metadata file** (`my-artifact.metadata.json`):
```json
{
  "title": "My Artifact",
  "description": "A description of my artifact",
  "type": "react",
  "tags": ["demo", "example"],
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-15"
}
```

### Viewing Modes

- **Gallery view** (`/a/:artifactName`): Shows artifact with metadata, tags, and navigation
- **Standalone view** (`/standalone/:artifactName`): Clean presentation with optional fullscreen toggle

### Gallery Features

- **Type filtering**: Filter by React, SVG, or Mermaid
- **Tag filtering**: Filter by any tag present in artifacts
- **Text search**: Search across title, description, and tags
- **Sorting**: By updated date, created date, or alphabetical
- **Per-card error boundaries**: Individual card errors don't crash the gallery

## Build System

Vite handles:
- Asset optimization and chunking
- TypeScript compilation
- CSS processing with Tailwind and PostCSS
- Source map generation
- GitHub Pages deployment preparation