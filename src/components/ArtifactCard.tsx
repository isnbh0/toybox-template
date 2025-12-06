import { Link } from 'react-router-dom';
import { Artifact } from '../lib/types';
import { ErrorBoundary } from './ErrorBoundary';

interface ArtifactCardProps {
  artifact: Artifact;
}

/**
 * Card component that displays artifact information in the gallery.
 * Wrapped with an error boundary to prevent individual card errors from
 * crashing the entire gallery.
 */
function ArtifactCardContent({ artifact }: ArtifactCardProps) {
  return (
    <Link
      to={`/a/${artifact.id}`}
      className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full bg-white hover:translate-y-[-2px]"
    >
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
            {artifact.title || 'Untitled Project'}
          </h2>
          <div className="flex gap-1">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                artifact.type === 'react'
                  ? 'bg-blue-100 text-blue-800'
                  : artifact.type === 'svg'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
              }`}
            >
              {artifact.type === 'react' && 'React'}
              {artifact.type === 'svg' && 'SVG'}
              {artifact.type === 'mermaid' && 'Mermaid'}
            </span>
            <Link
              to={`/standalone/${artifact.id}`}
              className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={(e) => e.stopPropagation()}
              title="View standalone without gallery wrapper"
            >
              Standalone
            </Link>
          </div>
        </div>

        <p className="text-gray-600 mb-3 flex-grow line-clamp-3">
          {artifact.description || 'No description available'}
        </p>

        {artifact.tags && artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artifact.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-500">
          Updated: {new Date(artifact.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}

/**
 * Error fallback component displayed when an artifact card fails to render
 */
function ArtifactCardError({ artifact }: ArtifactCardProps) {
  return (
    <div className="border border-red-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full bg-red-50">
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-semibold text-red-800">
            {artifact.title || artifact.id}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">
            Error
          </span>
        </div>
        <p className="text-red-600 text-sm flex-grow">
          Failed to render this artifact card. The artifact may still be accessible via direct link.
        </p>
        <Link
          to={`/a/${artifact.id}`}
          className="text-sm text-red-700 hover:text-red-900 underline mt-2"
        >
          Try viewing directly
        </Link>
      </div>
    </div>
  );
}

/**
 * Artifact card with error boundary wrapper
 */
export function ArtifactCard({ artifact }: ArtifactCardProps) {
  return (
    <ErrorBoundary fallback={<ArtifactCardError artifact={artifact} />}>
      <ArtifactCardContent artifact={artifact} />
    </ErrorBoundary>
  );
}
