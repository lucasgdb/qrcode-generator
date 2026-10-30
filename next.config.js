// The canonical origin, resolved once at build and inlined into server and client code,
// so a URL change in the browser keeps canonical, og:url and JSON-LD on the real domain.
// SITE_URL wins; on Vercel the production domain comes from VERCEL_PROJECT_PRODUCTION_URL.
const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { SITE_URL: siteUrl },
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
  // The Open Graph images read their fonts from disk; ship them with those routes.
  outputFileTracingIncludes: {
    '/og': ['./src/assets/fonts/**'],
    '/og/[type]': ['./src/assets/fonts/**'],
  },
  // Icons and the manifest keep their names across deploys, so they can't be immutable: a day
  // fresh, then served from cache while revalidating for a week. Hashed /_next/static files
  // (scripts, CSS, the font) are already cached for a year; robots and sitemap stay short.
  async headers() {
    const icons = 'public, max-age=86400, stale-while-revalidate=604800';
    return [
      '/favicon.svg',
      '/icon-:size.png',
      '/icon-maskable-512.png',
      '/apple-touch-icon.png',
      '/manifest.webmanifest',
    ].map((source) => ({ source, headers: [{ key: 'Cache-Control', value: icons }] }));
  },
};

module.exports = nextConfig;
