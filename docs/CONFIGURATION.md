# Configuration System Documentation

This document explains the centralized configuration system used in the TOYBOX template.

## Overview

The TOYBOX template uses a centralized configuration system to manage all deployment-related settings, including GitHub username, repository name, base URLs, and customization options. This system ensures consistency across build tools, scripts, and runtime environments.

## Configuration Sources

The configuration system follows a priority hierarchy:

1. **Environment Variables** (highest priority)
2. **github.config.json** file
3. **Default values** (lowest priority)

## Core Configuration Files

### 1. `github.config.json`

This is the primary configuration file for your TOYBOX deployment:

```json
{
  "username": "YOUR_GITHUB_USERNAME",
  "repository": "YOUR_REPO_NAME",
  "description": "Configuration for GitHub deployment.",
  "customization": {
    "siteName": "TOYBOX",
    "siteDescription": "A collection of Claude-generated artifacts",
    "showGitHubLink": true,
    "defaultTheme": "auto"
  }
}
```

**Important**: This file should be committed to your repository after configuration to ensure GitHub Actions can access it during deployment.

### 2. Configuration System Components

#### `scripts/config-loader.js` (ESM Module)
- Used by Node.js scripts that support ES modules
- Provides `loadConfig()`, `getBaseUrl()`, and `validateConfig()` functions

- Used for compatibility with tools that require CommonJS
- Same functionality as the ESM version

#### `src/lib/config.ts` (Frontend Runtime)
- TypeScript module for accessing configuration in the React application
- Provides runtime access to configuration values

#### `vite.config.ts` (Build Configuration)
- Contains inline configuration loading to avoid module resolution issues
- Automatically injects configuration into the build process

## Configuration Values

### Base Configuration

| Field | Description | Example |
|-------|-------------|---------|
| `username` | Your GitHub username | `"johndoe"` |
| `repository` | Your repository name | `"my-toybox"` |
| `description` | Description of the configuration | `"My TOYBOX deployment"` |

### Customization Options

| Field | Description | Default |
|-------|-------------|---------|
| `customization.siteName` | The title of your TOYBOX site | `"TOYBOX"` |
| `customization.siteDescription` | Site description | `"A collection of Claude-generated artifacts"` |
| `customization.showGitHubLink` | Show GitHub link in About page | `true` |
| `customization.defaultTheme` | Default theme (`"light"`, `"dark"`, `"auto"`) | `"auto"` |

### Computed Values

These values are automatically calculated based on your configuration:

| Field | Description | Example |
|-------|-------------|---------|
| `isConfigured` | Whether valid configuration is present | `true` |
| `baseUrl` | Base URL for deployment | `"/my-toybox/"` |
| `homepage` | Full GitHub Pages URL | `"https://johndoe.github.io/my-toybox"` |
| `repoUrl` | GitHub repository URL | `"https://github.com/johndoe/my-toybox"` |
| `gitUrl` | Git clone URL | `"https://github.com/johndoe/my-toybox.git"` |

## Usage Guide

### Initial Setup

1. **Edit the configuration file:**
   ```json
   {
     "username": "yourusername",
     "repository": "your-toybox",
     "customization": {
       "siteName": "My Portfolio",
       "siteDescription": "My collection of creative artifacts"
     }
   }
   ```

3. **Apply the configuration:**
   ```bash
   npm run update-config
   ```

### Environment Variable Overrides

You can override configuration values using environment variables:

```bash
# Override the base URL for custom deployments
BASE_URL=/custom-path/ npm run build

# Override GitHub configuration
GITHUB_USERNAME=myuser GITHUB_REPOSITORY=myrepo npm run build
```

### Using Configuration in Code

#### In Node.js Scripts

```javascript
import { loadConfig, validateConfig } from './scripts/config-loader.js';

// Load configuration
const config = loadConfig();
console.log(`Building for: ${config.username}/${config.repository}`);

// Validate configuration
try {
  validateConfig();
  console.log('Configuration is valid!');
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

#### In React Components

```typescript
import { getGitHubConfig, getBaseUrl } from '@/lib/config';

export function MyComponent() {
  const config = getGitHubConfig();
  const baseUrl = getBaseUrl();
  
  return (
    <div>
      {config.isConfigured && (
        <a href={config.repoUrl}>View on GitHub</a>
      )}
      <img src={`${baseUrl}logo.png`} alt="Logo" />
    </div>
  );
}
```

#### In Vite Configuration

The configuration is automatically loaded in `vite.config.ts`. No manual import needed.

## Configuration Flow

1. **github.config.json** → Primary source of configuration
2. **update-config.js** → Applies configuration to various files:
   - Updates `package.json` with homepage and repository URLs
   - Updates `index.html` with username in title
   - Updates `public/404.html` with username
   - Updates `AboutPage.tsx` with repository link
   - Updates `TOYBOX_CONFIG.json` with customization options

3. **Build Process** → Configuration is injected:
   - Base URL is set for production builds
   - GitHub Actions uses the same centralized configuration at build time
   - Environment variables are defined for runtime access
   - GitHub username and repository are available in components

## Validation

### Pre-build Validation

The build process automatically validates configuration:

```bash
npm run build
# Runs validate-config before building
```

### Manual Validation

```bash
# Validate configuration only
npm run validate-config

# Comprehensive setup validation
npm run validate-setup
```

### Validation Checks

1. **Config File Exists**: Checks if `github.config.json` exists
2. **Valid Values**: Ensures no placeholder values (`YOUR_*`) remain
3. **Dependencies**: Verifies node_modules are installed

## Troubleshooting

### Common Issues

1. **"Invalid configuration" error**
   - Ensure `github.config.json` exists and has valid values
   - Check for typos in username or repository name
   - Remove any `YOUR_` placeholder values

2. **Base URL not working**
   - Verify the repository name matches your GitHub repository
   - Ensure you've run `npm run update-config` after changes
   - Check if environment variables are overriding your config

3. **GitHub Actions failing**
   - Ensure `github.config.json` is committed to your repository
   - Verify the repository has GitHub Pages enabled
   - Check that the workflow has necessary permissions

### Debug Commands

```bash
# View current configuration
node scripts/config-loader.js

# Test configuration loading
npm run validate-setup

# Test with specific environment variables
GITHUB_USERNAME=test GITHUB_REPOSITORY=test-repo node scripts/config-loader.js
```

## Best Practices

1. **Always commit `github.config.json`** after configuration - GitHub Actions needs access to it
2. **Always run `update-config`** after modifying configuration
3. **Use environment variables** for CI/CD overrides
4. **Validate before deploying** to catch configuration issues early
5. **Keep customization minimal** - Only override what you need

## Advanced Usage

### Custom Build Paths

For non-standard deployments, use the `BASE_URL` environment variable:

```bash
# Deploy to a subdirectory
BASE_URL=/projects/toybox/ npm run build

# Deploy to root (e.g., custom domain)
BASE_URL=/ npm run build
```

### Multiple Environments

Create environment-specific configurations:

```bash
# Development
cp github.config.json github.config.dev.json

# Production  
cp github.config.json github.config.prod.json

# Use specific config
cp github.config.prod.json github.config.json && npm run update-config
```

### Programmatic Configuration

For advanced workflows, you can programmatically set configuration:

```javascript
import fs from 'fs';

const config = {
  username: process.env.GITHUB_ACTOR || 'default-user',
  repository: process.env.GITHUB_REPOSITORY?.split('/')[1] || 'toybox',
  customization: {
    siteName: `${process.env.GITHUB_ACTOR}'s TOYBOX`
  }
};

fs.writeFileSync('github.config.json', JSON.stringify(config, null, 2));
```

## Configuration Reference

### Full Configuration Schema

```typescript
interface GitHubConfig {
  // Required fields
  username: string;        // GitHub username
  repository: string;      // Repository name
  
  // Optional fields
  description?: string;    // Configuration description
  
  // Customization options
  customization?: {
    siteName?: string;         // Site title (default: "TOYBOX")
    siteDescription?: string;  // Site description
    showGitHubLink?: boolean;  // Show GitHub link (default: true)
    defaultTheme?: 'light' | 'dark' | 'auto';  // Theme (default: "auto")
  };
}
```

### Computed Fields (Read-only)

```typescript
interface ComputedConfig {
  isConfigured: boolean;   // true if username/repository are valid
  baseUrl: string;         // Computed base URL for deployment
  homepage: string;        // Full GitHub Pages URL
  repoUrl: string;         // GitHub repository URL
  gitUrl: string;          // Git clone URL
}
```
