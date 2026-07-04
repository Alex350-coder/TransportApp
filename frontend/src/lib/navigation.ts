/** Navigation helpers. */

/**
 * Validates a `?next=` redirect target: only same-app absolute paths pass.
 * Rejects external URLs and protocol-relative (`//host`) values.
 */
export function safeInternalPath(path: string | null, fallback: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return fallback
  return path
}
