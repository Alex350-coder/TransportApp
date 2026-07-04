type FrameName = 'Primer_frame' | 'Segundo_frame' | 'Tercer_frame'

interface PictureFallbackProps {
  name: FrameName
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'auto'
}

/** Brand art with WebP + PNG fallback and explicit dimensions (no layout shift). */
export function PictureFallback({
  name,
  alt,
  className = '',
  width = 1600,
  height = 900,
  loading = 'lazy',
  fetchPriority = 'auto',
}: PictureFallbackProps) {
  return (
    <picture>
      <source srcSet={`/img/${name}.webp`} type="image/webp" />
      <img
        src={`/img/${name}.png`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
      />
    </picture>
  )
}
