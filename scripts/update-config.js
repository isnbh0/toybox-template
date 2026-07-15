#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig, validateConfig } from './config-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and validate configuration
const config = validateConfig();
const { username, repository, homepage, repoUrl, gitUrl, baseUrl } = config;

// Function to update TOYBOX_CONFIG.json with customization options
function updateToyboxConfig(config) {
  const toyboxConfigPath = path.join(__dirname, '..', 'TOYBOX_CONFIG.json');
  
  if (config.customization) {
    const toyboxConfig = JSON.parse(fs.readFileSync(toyboxConfigPath, 'utf8'));
    
    if (config.customization.siteName) {
      toyboxConfig.title = config.customization.siteName;
    }
    if (config.customization.siteDescription) {
      toyboxConfig.description = config.customization.siteDescription;
    }
    if (config.customization.defaultTheme) {
      toyboxConfig.theme = config.customization.defaultTheme;
    }
    
    fs.writeFileSync(toyboxConfigPath, JSON.stringify(toyboxConfig, null, 2) + '\n');
    console.log('✅ Updated TOYBOX_CONFIG.json with customizations');
  }
}

// Update TOYBOX configuration with customizations
updateToyboxConfig(config);

// Update package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

packageJson.homepage = homepage;
packageJson.repository.url = gitUrl;

// Update test-production script
const scripts = packageJson.scripts || {};
if (scripts['test-production']) {
  scripts['test-production'] = `vite preview --base=${baseUrl}`;
}

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

// Note: vite.config.ts no longer needs updating as it uses config-loader.js directly

// Update index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Update title
indexHtml = indexHtml.replace(
  /<title>[^<]*<\/title>/,
  `<title>TOYBOX - ${username}</title>`
);

fs.writeFileSync(indexPath, indexHtml);
console.log('✅ Updated index.html');

// Update 404.html
const notFoundPath = path.join(__dirname, '..', 'public', '404.html');
let notFoundHtml = fs.readFileSync(notFoundPath, 'utf8');

notFoundHtml = notFoundHtml.replace(
  /<title>[^<]*<\/title>/,
  `<title>TOYBOX - ${username}</title>`
);

fs.writeFileSync(notFoundPath, notFoundHtml);
console.log('✅ Updated public/404.html');

// Update AboutPage.tsx
const aboutPath = path.join(__dirname, '..', 'src', 'components', 'AboutPage.tsx');
let aboutContent = fs.readFileSync(aboutPath, 'utf8');

aboutContent = aboutContent.replace(
  /href="https:\/\/github\.com\/[^/]+\/[^"]+"/,
  `href="${repoUrl}"`
);

fs.writeFileSync(aboutPath, aboutContent);
console.log('✅ Updated AboutPage.tsx');

console.log('\n🎉 Configuration update complete!');
console.log(`   GitHub Username: ${username}`);
console.log(`   Repository Name: ${repository}`);
console.log(`   Homepage: ${homepage}`);
console.log(`   Base URL: ${baseUrl}`);
