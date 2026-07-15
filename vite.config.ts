import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Inline config loading to avoid module issues
function loadGitHubConfig() {
  const configPath = path.join(__dirname, 'github.config.json');
  
  // Default configuration
  let config = {
    username: 'YOUR_GITHUB_USERNAME',
    repository: 'YOUR_REPO_NAME',
    description: 'Configuration for GitHub deployment.',
    customization: {
      siteName: 'TOYBOX',
      siteDescription: 'A collection of Claude-generated artifacts',
      showGitHubLink: true,
      defaultTheme: 'auto'
    },
    isConfigured: false,
    baseUrl: '/'
  };
  
  // Load from file if exists
  if (fs.existsSync(configPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = { ...config, ...fileConfig };
      
      // Ensure customization object exists with defaults
      if (fileConfig.customization) {
        config.customization = { ...config.customization, ...fileConfig.customization };
      }
    } catch (error) {
      console.warn('Warning: Could not parse github.config.json:', error.message);
    }
  }
  
  // Override with environment variables if present
  if (process.env.GITHUB_USERNAME) {
    config.username = process.env.GITHUB_USERNAME;
  }
  if (process.env.GITHUB_REPOSITORY) {
    // Accept both GitHub Actions' "owner/repo" format and a bare repo name.
    config.repository = process.env.GITHUB_REPOSITORY.split('/').pop();
  }
  
  // Compute derived values
  config.isConfigured = !config.username.includes('YOUR_') && !config.repository.includes('YOUR_');
  config.baseUrl = config.isConfigured ? `/${config.repository}/` : '/';
  
  return config;
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const config = loadGitHubConfig();
  
  // Determine base URL
  let baseUrl = '/';
  if (isProduction) {
    // Priority: ENV var > github.config.json
    baseUrl = process.env.BASE_URL || config.baseUrl;
  }
  
  return {
    // Use base path only in production (GitHub Pages)
    base: baseUrl,
    // Define environment variables for runtime use
    define: {
      'import.meta.env.VITE_GITHUB_USERNAME': JSON.stringify(config.username),
      'import.meta.env.VITE_GITHUB_REPOSITORY': JSON.stringify(config.repository),
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'src': path.resolve(__dirname, './src'),
      },
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    build: {
      // Ensure subdirectory-based artifacts are properly handled in the build process
      rollupOptions: {
        // Preserve directory structure for artifacts
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'mermaid-vendor': ['mermaid']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Generate source maps for better debugging
      sourcemap: true,
    },
    // Optimize development server for better artifact loading
    server: {
      fs: {
        strict: false, // Allow serving files from outside the root directory
      },
      hmr: {
        overlay: true, // Show errors as overlay
      },
    },
  }
})
