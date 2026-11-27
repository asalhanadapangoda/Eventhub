const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80';

/**
 * Formats image URL to ensure compatibility across cloud CDN and backend
 */
export function formatImageUrl(url, width = 900) {
  if (!url) return DEFAULT_FALLBACK_IMAGE;

  // Cloudinary auto WebP/AVIF format & quality
  if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('/f_auto,q_auto')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }

  // Fully-qualified URLs (Cloudinary, Unsplash, HTTPS external)
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Relative /uploads path: Route through /uploads/academy proxy (avoids colliding with EventHub /uploads)
  if (url.startsWith('/uploads/academy')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    return url.replace(/^\/uploads/, '/uploads/academy');
  }

  return url;
}

/**
 * Image error handler that safely retries from Vercel backend or falls back
 * (NEVER calls localhost:5001 in production, which triggers browser security warnings)
 */
export function handleImageError(e, fallbackUrl = '') {
  if (!e || !e.target) return;
  e.target.src = fallbackUrl || DEFAULT_FALLBACK_IMAGE;
}
