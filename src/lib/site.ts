// Single source of truth for the site's identity. Read by metadata, JSON-LD,
// sitemap, robots, llms.txt and the Open Graph images. See docs/SEO.md.

/** The canonical origin, with no trailing slash; resolved in next.config.js and inlined at build. */
export const baseUrl = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export const site = {
  name: 'Gerador de QR',
  title: 'Gerador de QR Code grátis',
  locale: 'pt_BR',
  language: 'pt-BR',
  themeColor: '#fafafa',
  sourceCode: 'https://github.com/lucasgdb/qrcode-generator',
};

export const author = {
  name: 'Lucas Bittencourt',
  url: 'https://lucasbittencourt.dev',
  jobTitle: 'AI Software Engineer',
  profiles: {
    website: 'https://lucasbittencourt.dev',
    github: 'https://github.com/lucasgdb',
    linkedin: 'https://linkedin.com/in/lucas-bittencourt',
  },
};

/** Bump when the page copy, FAQ or type list changes; feeds the sitemap `lastmod` and `dateModified`. */
export const contentUpdatedAt = '2026-10-28';

// AI training crawlers (GPTBot, Google-Extended, ...). See docs/SEO.md.
export const allowAiTraining = true;

/** Only production is indexed; preview and local builds answer `noindex` and `Disallow: /`. */
export function isIndexable(vercelEnv = process.env.VERCEL_ENV) {
  return !vercelEnv || vercelEnv === 'production';
}
