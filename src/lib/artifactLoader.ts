import { Artifact } from './types';
import { ToyboxConfig } from './store';

// Import both direct .tsx files and index.tsx files inside directories
const directArtifactsImports: Record<string, {
  default: React.ComponentType<any>;
  metadata?: ArtifactMetadata;
}> = import.meta.glob('../artifacts/*.tsx', { eager: true });

// Import index.tsx files from subdirectories
const subdirArtifactsImports: Record<string, {
  default: React.ComponentType<any>;
  metadata?: ArtifactMetadata;
}> = import.meta.glob('../artifacts/*/index.tsx', { eager: true });

// Import separate metadata files (TypeScript) - for direct artifacts
const directMetadataImports: Record<string, { metadata: ArtifactMetadata }> =
  import.meta.glob('../artifacts/*.metadata.ts', { eager: true });

// Import separate metadata files (TypeScript) - for subdirectory artifacts
const subdirMetadataImports: Record<string, { metadata: ArtifactMetadata }> =
  import.meta.glob('../artifacts/*/metadata.ts', { eager: true });

// Import separate metadata files (JSON) - for direct artifacts
const directMetadataJsonImports: Record<string, ArtifactMetadata> =
  import.meta.glob('../artifacts/*.metadata.json', { eager: true });

// Import separate metadata files (JSON) - for subdirectory artifacts
const subdirMetadataJsonImports: Record<string, ArtifactMetadata> =
  import.meta.glob('../artifacts/*/metadata.json', { eager: true });

// Combine both component import maps
const artifactsImports = {
  ...directArtifactsImports,
  ...subdirArtifactsImports
};

/**
 * Metadata structure for static artifacts
 */
export interface ArtifactMetadata {
  title: string;
  description?: string;
  type: 'react' | 'svg' | 'mermaid';
  tags: string[];
  folder?: string;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
  fullscreen?: boolean;
  underMaintenance?: boolean;
}

/**
 * Extract artifact ID from file path
 * Handles both direct files (example.tsx) and subdirectory files (example/index.tsx)
 */
function getArtifactIdFromPath(path: string): string {
  // For subdirectory artifacts (example/index.tsx), extract "example"
  if (path.includes('/index.tsx')) {
    const match = path.match(/\.\.\/artifacts\/(.+)\/index\.tsx/);
    return match ? match[1] : path;
  }

  // For direct artifacts (example.tsx), extract "example"
  return path.replace('../artifacts/', '').replace('.tsx', '');
}

/**
 * Load metadata from separate metadata file or component export
 * Priority: TypeScript metadata file > JSON metadata file > component export
 */
function loadArtifactMetadata(artifactId: string): ArtifactMetadata | null {
  // Check for TypeScript metadata files first (highest priority)
  const directMetadataPath = `../artifacts/${artifactId}.metadata.ts`;
  const subdirMetadataPath = `../artifacts/${artifactId}/metadata.ts`;

  if (directMetadataImports[directMetadataPath]) {
    return directMetadataImports[directMetadataPath].metadata;
  }

  if (subdirMetadataImports[subdirMetadataPath]) {
    return subdirMetadataImports[subdirMetadataPath].metadata;
  }

  // Check for JSON metadata files (second priority)
  const directJsonPath = `../artifacts/${artifactId}.metadata.json`;
  const subdirJsonPath = `../artifacts/${artifactId}/metadata.json`;

  if (directMetadataJsonImports[directJsonPath]) {
    return directMetadataJsonImports[directJsonPath] as ArtifactMetadata;
  }

  if (subdirMetadataJsonImports[subdirJsonPath]) {
    return subdirMetadataJsonImports[subdirJsonPath] as ArtifactMetadata;
  }

  // Fall back to component export (lowest priority)
  const directPath = `../artifacts/${artifactId}.tsx`;
  const subdirPath = `../artifacts/${artifactId}/index.tsx`;
  const importedModule = artifactsImports[directPath] || artifactsImports[subdirPath];

  if (importedModule?.metadata) {
    return importedModule.metadata;
  }

  return null;
}

/**
 * Get artifact metadata by ID (public API)
 */
export function getArtifactMetadata(artifactId: string): ArtifactMetadata | null {
  return loadArtifactMetadata(artifactId);
}

// Cache for all artifacts (including hidden ones)
let _allArtifactsCache: Map<string, Artifact> | null = null;

/**
 * Build all artifacts from imports (including hidden ones) - cached
 */
function getAllArtifacts(): Map<string, Artifact> {
  if (_allArtifactsCache) {
    return _allArtifactsCache;
  }

  _allArtifactsCache = new Map();

  for (const path in artifactsImports) {
    const artifactId = getArtifactIdFromPath(path);

    // Load metadata using the priority system (external files > component export)
    let metadata = loadArtifactMetadata(artifactId);

    if (!metadata) {
      console.warn(
        `Artifact ${artifactId} is missing metadata, using placeholder metadata.`
      );
      metadata = {
        title: artifactId,
        description: 'Auto-generated placeholder description',
        type: 'react',
        tags: ['auto-generated'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const artifact: Artifact = {
      id: artifactId,
      title: metadata.title,
      description: metadata.description || '',
      type: metadata.type,
      tags: metadata.tags || [],
      folder: metadata.folder,
      code: '', // The code is now the component itself, not a string
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    };

    _allArtifactsCache.set(artifactId, artifact);
  }

  return _allArtifactsCache;
}

/**
 * Load all available artifacts from the static files (excludes hidden artifacts)
 */
export function loadArtifacts(): Artifact[] {
  const allArtifacts = getAllArtifacts();
  const artifacts: Artifact[] = [];

  for (const [id, artifact] of allArtifacts) {
    // Get the metadata to check if it's hidden
    const metadata = loadArtifactMetadata(id);

    if (metadata?.hidden) {
      continue; // Skip hidden artifacts
    }

    artifacts.push(artifact);
  }

  return artifacts;
}

/**
 * Get a specific artifact by its name
 * This function allows access to hidden artifacts via direct URL
 */
export function getArtifact(name: string): { 
  artifact: Artifact | undefined; 
  component: React.ComponentType<any> | undefined;
} {
  // Get artifact from cache (includes hidden artifacts)
  const allArtifacts = getAllArtifacts();
  const artifact = allArtifacts.get(name);

  if (!artifact) {
    return { artifact: undefined, component: undefined };
  }

  // Get the component from the imports
  let component;
  const directPath = `../artifacts/${name}.tsx`;
  if (directArtifactsImports[directPath]) {
    component = directArtifactsImports[directPath].default;
  } else {
    const subdirPath = `../artifacts/${name}/index.tsx`;
    component = subdirArtifactsImports[subdirPath]?.default;
  }

  return { artifact, component };
}

/**
 * Get all unique folders from artifacts
 */
export function getAllFolders(): string[] {
  const artifacts = loadArtifacts();
  const foldersSet = new Set<string>();

  artifacts.forEach(artifact => {
    if (artifact.folder) {
      foldersSet.add(artifact.folder);
    }
  });

  return Array.from(foldersSet).sort();
}

/**
 * Get all unique tags from artifacts
 */
export function getAllTags(): string[] {
  const artifacts = loadArtifacts();
  const tagsSet = new Set<string>();

  artifacts.forEach(artifact => {
    artifact.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Load TOYBOX configuration
 */
export async function loadToyboxConfig(): Promise<ToyboxConfig> {
  try {
    const response = await fetch('/TOYBOX_CONFIG.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Could not load TOYBOX_CONFIG.json, using defaults');
  }
  
  // Return default config
  return {
    title: 'My TOYBOX',
    description: 'A collection of my Claude-generated artifacts',
    theme: 'auto',
    layout: 'grid',
    showFooter: true
  };
}
