import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads and validates the GitHub configuration
 * Priority: Environment variables > github.config.json > defaults
 */
export function loadConfig() {
  const configPath = path.join(__dirname, '..', 'github.config.json');
  
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
    }
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
  config.homepage = config.isConfigured ? `https://${config.username}.github.io/${config.repository}` : '';
  config.repoUrl = config.isConfigured ? `https://github.com/${config.username}/${config.repository}` : '';
  config.gitUrl = config.isConfigured ? `${config.repoUrl}.git` : '';
  
  return config;
}

/**
 * Gets the base URL for the current environment
 * In development: always '/'
 * In production: from config or environment variable
 */
export function getBaseUrl(isProduction = false) {
  if (!isProduction) {
    return '/';
  }
  
  // Check for explicit BASE_URL environment variable first
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  const config = loadConfig();
  return config.baseUrl;
}

/**
 * Validates that the configuration is properly set
 * Throws an error if configuration contains placeholder values
 */
export function validateConfig(config = null) {
  if (!config) {
    config = loadConfig();
  }
  
  if (!config.isConfigured) {
    throw new Error(
      `Invalid configuration: github.config.json contains placeholder values.\n` +
      `Please update github.config.json with your actual GitHub username and repository name.`
    );
  }
  
  return config;
}

// If run directly, output the configuration
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  console.log(JSON.stringify(config, null, 2));
}
