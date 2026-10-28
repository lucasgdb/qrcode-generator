// Builders for everything search engines and AI assistants read: canonical URLs,
// JSON-LD, sitemap, robots and llms.txt. No Next.js runtime imports, so the pages,
// the app-router routes and the OG images share them. See docs/SEO.md.

import type { MetadataRoute } from 'next';

import { homeSeo, howToSteps, typeSeo, type Faq } from './seo-content';
import { allowAiTraining, author, baseUrl, contentUpdatedAt, isIndexable, site } from './site';
import { QR_TYPES, QR_TYPE_BY_ID, type QrTypeId } from './types';

const websiteId = `${baseUrl}/#website`;
const appId = `${baseUrl}/#app`;
const authorId = `${author.url}/#person`;

/** The canonical URL of the type picker or of one type's page. */
export function pageUrl(type: QrTypeId | null = null) {
  return type ? `${baseUrl}/${type}` : baseUrl;
}

export const ogImageSize = { width: 1200, height: 630 };

export function ogImageUrl(type: QrTypeId | null = null) {
  return type ? `${baseUrl}/og/${type}` : `${baseUrl}/og`;
}

export interface PageSeo {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  faq: Faq[];
}

/** Title, description, canonical and image for the type picker (null) or a type's page. */
export function pageSeo(type: QrTypeId | null): PageSeo {
  if (!type) {
    return {
      title: homeSeo.title,
      description: homeSeo.description,
      url: pageUrl(),
      image: ogImageUrl(),
      imageAlt: `${site.title}: link, PIX, Wi-Fi, WhatsApp e mais`,
      faq: homeSeo.faq,
    };
  }
  const seo = typeSeo[type];
  return {
    title: `${seo.title} | ${site.name}`,
    description: seo.description,
    url: pageUrl(type),
    image: ogImageUrl(type),
    imageAlt: `${seo.name}: gere grátis no ${site.name}`,
    faq: seo.faq,
  };
}

// JSON.stringify doesn't escape "<": "</script>" in a value would end the tag.
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function authorJsonLd() {
  return {
    '@type': 'Person',
    '@id': authorId,
    name: author.name,
    url: author.url,
    jobTitle: author.jobTitle,
    sameAs: [author.profiles.github, author.profiles.linkedin],
  };
}

function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.name,
    alternateName: site.title,
    url: baseUrl,
    description: homeSeo.description,
    inLanguage: site.language,
    publisher: { '@id': authorId },
  };
}

/** The tool itself: free, in the browser, with the formats and types it handles. */
function appJsonLd() {
  return {
    '@type': 'WebApplication',
    '@id': appId,
    name: site.title,
    url: baseUrl,
    description: homeSeo.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Qualquer navegador',
    browserRequirements: 'Requer JavaScript',
    inLanguage: site.language,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    featureList: [
      ...QR_TYPES.map((type) => typeSeo[type.id].name),
      'Molduras com texto',
      'Cores, formato dos módulos e logo',
      'Download em PNG, SVG e JPEG',
      'Gerado no navegador, sem enviar dados',
    ],
    image: ogImageUrl(),
    author: { '@id': authorId },
    isPartOf: { '@id': websiteId },
    dateModified: contentUpdatedAt,
  };
}

function faqJsonLd(url: string, faq: Faq[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function homeJsonLd() {
  const url = pageUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}/#webpage`,
        url,
        name: homeSeo.title,
        description: homeSeo.description,
        inLanguage: site.language,
        isPartOf: { '@id': websiteId },
        about: { '@id': appId },
        primaryImageOfPage: ogImageUrl(),
        dateModified: contentUpdatedAt,
      },
      websiteJsonLd(),
      appJsonLd(),
      authorJsonLd(),
      faqJsonLd(url, homeSeo.faq),
    ],
  };
}

export function typeJsonLd(type: QrTypeId) {
  const url = pageUrl(type);
  const seo = typeSeo[type];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: seo.title,
        description: seo.description,
        inLanguage: site.language,
        isPartOf: { '@id': websiteId },
        about: { '@id': appId },
        primaryImageOfPage: ogImageUrl(type),
        breadcrumb: { '@id': `${url}#breadcrumb` },
        dateModified: contentUpdatedAt,
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: `Como criar um ${seo.name}`,
        description: QR_TYPE_BY_ID[type].description,
        totalTime: 'PT1M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'BRL', value: '0' },
        tool: { '@type': 'HowToTool', name: site.title },
        step: howToSteps(seo.name).map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
          url,
        })),
      },
      faqJsonLd(url, seo.faq),
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.name, item: pageUrl() },
          { '@type': 'ListItem', position: 2, name: seo.name },
        ],
      },
    ],
  };
}

export function buildSitemap(): MetadataRoute.Sitemap {
  const entry = (type: QrTypeId | null) => ({
    url: pageUrl(type),
    lastModified: contentUpdatedAt,
    alternates: { languages: { [site.language]: pageUrl(type), 'x-default': pageUrl(type) } },
    images: [ogImageUrl(type)],
  });
  return [entry(null), ...QR_TYPES.map((type) => entry(type.id))];
}

// Training crawlers. Search crawlers (Googlebot, OAI-SearchBot, ...) use "*".
export const aiTrainingCrawlers = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot', 'Applebot-Extended'];

export function buildRobots(vercelEnv?: string, allowTraining = allowAiTraining): MetadataRoute.Robots {
  if (!isIndexable(vercelEnv)) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/_next/data/' },
      allowTraining ? { userAgent: aiTrainingCrawlers, allow: '/' } : { userAgent: aiTrainingCrawlers, disallow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

/** llms.txt (https://llmstxt.org): what the site is, every page and the answers it gives. */
export function buildLlmsTxt() {
  const typeLinks = QR_TYPES.map((type) => {
    const seo = typeSeo[type.id];
    return `- [${seo.name}](${pageUrl(type.id)}): ${seo.description}`;
  }).join('\n');

  const answers = [...homeSeo.faq, ...QR_TYPES.flatMap((type) => typeSeo[type.id].faq)]
    .map((item) => `### ${item.question}\n\n${item.answer}`)
    .join('\n\n');

  return `# ${site.title}

> ${site.name} é um gerador de QR Code gratuito, em português, que cria códigos de link, redes sociais, vídeo, texto, Wi-Fi, contato (vCard), PIX (BR Code), e-mail, SMS, WhatsApp, telefone, localização e evento. O código é gerado no navegador: nenhum conteúdo é enviado a servidores ou salvo. Permite moldura com texto, cores, formato dos módulos e logo, e baixa em PNG, SVG ou JPEG, sem cadastro e sem marca d'água. Os códigos são estáticos e não expiram.

## Geradores por tipo

${typeLinks}

## Como funciona

1. Escolha o tipo de QR Code em ${pageUrl()}.
2. Preencha o conteúdo; a prévia mostra o que aparece para quem escanear.
3. Personalize moldura, cores, formato e logo, confira a leitura e baixe o arquivo.

## Perguntas frequentes

${answers}

## Optional

- [Código-fonte](${site.sourceCode})
- [Autor: ${author.name}](${author.url})
`;
}
