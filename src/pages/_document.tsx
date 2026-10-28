import { Head, Html, Main, NextScript } from 'next/document';

import { author, isIndexable, site } from '../lib/site';

// Previews and local builds are never indexed. Production lets Google show large image previews.
const robots = isIndexable()
  ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  : 'noindex, nofollow';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="preload" href="/fonts/geist-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Site-wide tags, rendered on the server only (they never change between steps). */}
        <meta name="robots" content={robots} />
        <meta name="googlebot" content={robots} />
        <meta name="application-name" content={site.name} />
        <meta name="author" content={author.name} />
        <meta name="theme-color" content={site.themeColor} />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <link rel="author" href={author.url} />
        {process.env.GOOGLE_SITE_VERIFICATION ? (
          <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION} />
        ) : null}
        {process.env.BING_SITE_VERIFICATION ? (
          <meta name="msvalidate.01" content={process.env.BING_SITE_VERIFICATION} />
        ) : null}
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
