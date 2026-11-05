// The canonical origin, resolved once at build and inlined into server and client code,
// so a URL change in the browser keeps canonical, og:url and JSON-LD on the real domain.
// SITE_URL wins; any Vercel build (production or preview) uses the production domain.
// Previews still answer noindex, so pointing their canonical at production is harmless.
const productionUrl = 'https://gerador-de-qrcode.lucasbittencourt.dev';
const siteUrl = (process.env.SITE_URL ?? (process.env.VERCEL ? productionUrl : 'http://localhost:3000')).replace(
  /\/+$/,
  '',
);

// Sent with every response. The CSP only sets what can't break the app (no framing, no plugins,
// no <base> or form hijacking); scripts and styles stay unrestricted because Next and the
// Vercel analytics inject inline code that a strict policy would need nonces for.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The share sheet and clipboard stay; nothing here uses the camera, microphone or location.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

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
      { source: '/:path*', headers: securityHeaders },
      ...[
        '/favicon.svg',
        '/icon-:size.png',
        '/icon-maskable-512.png',
        '/apple-touch-icon.png',
        '/manifest.webmanifest',
        '/screenshots/:file*',
      ].map((source) => ({ source, headers: [{ key: 'Cache-Control', value: icons }] })),
      // The service worker is always revalidated, so a new version reaches users on their next visit.
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
};

module.exports = nextConfig;
