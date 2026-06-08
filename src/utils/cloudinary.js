/**
 * Cloudinary Image Optimization Utility
 * 
 * Transforms Cloudinary URLs to:
 * 1. Enforce HTTPS (fixes mixed content warnings)
 * 2. Apply f_auto / q_auto for WebP/AVIF delivery and smart compression
 * 3. Resize at the source to match the actual display size
 */

const CLOUDINARY_UPLOAD_PATTERN = /res\.cloudinary\.com/;

/**
 * Injects Cloudinary transformation parameters into an image URL.
 * Safe to call with any URL – non-Cloudinary URLs are returned unchanged.
 *
 * @param {string|null|undefined} url  - Original image URL
 * @param {string} transforms          - Cloudinary transformation string e.g. "w_100,h_100,c_fill,f_auto,q_auto"
 * @returns {string}                   - Optimized URL
 */
export function optimizeCloudinaryUrl(url, transforms = 'f_auto,q_auto') {
  if (!url || typeof url !== 'string') return url;

  // Fix mixed content: upgrade http:// → https://
  let result = url.replace(/^http:\/\//, 'https://');

  if (!CLOUDINARY_UPLOAD_PATTERN.test(result)) {
    // Not a Cloudinary URL – return as-is (with https fix)
    return result;
  }

  // Cloudinary URL structure:
  //   https://res.cloudinary.com/<cloud>/<resource_type>/upload/<existing_transforms>/<version>/<public_id>
  // We inject our transforms right after "/upload/"
  if (result.includes('/upload/')) {
    // Avoid double-injecting if transforms are already present
    const afterUpload = result.split('/upload/')[1] || '';
    const alreadyHasTransform = /^[a-z]_/.test(afterUpload); // e.g. "w_100" or "f_auto"

    if (alreadyHasTransform) {
      // Prepend our transforms before existing ones
      result = result.replace('/upload/', `/upload/${transforms},`);
    } else {
      result = result.replace('/upload/', `/upload/${transforms}/`);
    }
  }

  return result;
}

/**
 * Optimized avatar URL – 100×100 fill, WebP/AVIF, quality auto.
 * Suitable for any small circular avatar (displayed at ≤80px).
 */
export function avatarUrl(url) {
  return optimizeCloudinaryUrl(url, 'w_100,h_100,c_fill,f_auto,q_auto');
}

/**
 * Optimized thumbnail URL for below-the-fold video cards.
 * w_648 matches the exact rendered card width (648px container from PageSpeed).
 * q_60 gives ~50% size reduction vs q_auto with acceptable visual quality at card size.
 */
export function thumbnailUrl(url) {
  return optimizeCloudinaryUrl(url, 'w_648,h_365,c_fill,f_auto,q_60');
}

/**
 * Optimized thumbnail URL for the LCP / first above-the-fold card.
 * Uses q_auto (higher quality) since this is the most prominent visible image.
 */
export function lcpThumbnailUrl(url) {
  return optimizeCloudinaryUrl(url, 'w_648,h_365,c_fill,f_auto,q_auto');
}

/**
 * Optimized large avatar / banner avatar URL – 200×200 fill.
 * Suitable for channel profile images displayed at ≤160px.
 */
export function largeAvatarUrl(url) {
  return optimizeCloudinaryUrl(url, 'w_200,h_200,c_fill,f_auto,q_auto');
}

/**
 * Force HTTPS only — used when we don't know if URL is Cloudinary.
 */
export function ensureHttps(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/^http:\/\//, 'https://');
}
