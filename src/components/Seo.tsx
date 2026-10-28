import Head from 'next/head';

import { homeJsonLd, ogImageSize, pageSeo, serializeJsonLd, typeJsonLd } from '../lib/seo';
import { site } from '../lib/site';
import type { QrTypeId } from '../lib/types';

export interface SeoProps {
  /** The type whose page this is, or null for the type picker. */
  type: QrTypeId | null;
}

/**
 * Per-page head: title, description, canonical, hreflang, Open Graph, Twitter card and
 * JSON-LD. It follows the URL, so a shallow step change updates it too. Site-wide tags
 * (robots, verification, icons, manifest) live in _document.
 */
export default function Seo({ type }: SeoProps) {
  const seo = pageSeo(type);
  const jsonLd = type ? typeJsonLd(type) : homeJsonLd();

  return (
    <Head>
      <title key="title">{seo.title}</title>
      <meta key="description" name="description" content={seo.description} />
      <link key="canonical" rel="canonical" href={seo.url} />
      <link key="hreflang" rel="alternate" hrefLang={site.language} href={seo.url} />
      <link key="hreflang-default" rel="alternate" hrefLang="x-default" href={seo.url} />

      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content={site.name} />
      <meta key="og:locale" property="og:locale" content={site.locale} />
      <meta key="og:url" property="og:url" content={seo.url} />
      <meta key="og:title" property="og:title" content={seo.title} />
      <meta key="og:description" property="og:description" content={seo.description} />
      <meta key="og:image" property="og:image" content={seo.image} />
      <meta key="og:image:type" property="og:image:type" content="image/png" />
      <meta key="og:image:width" property="og:image:width" content={String(ogImageSize.width)} />
      <meta key="og:image:height" property="og:image:height" content={String(ogImageSize.height)} />
      <meta key="og:image:alt" property="og:image:alt" content={seo.imageAlt} />

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={seo.title} />
      <meta key="twitter:description" name="twitter:description" content={seo.description} />
      <meta key="twitter:image" name="twitter:image" content={seo.image} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={seo.imageAlt} />

      <script key="jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </Head>
  );
}
