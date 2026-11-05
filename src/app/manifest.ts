import type { MetadataRoute } from 'next';

import { homeSeo, typeSeo } from '../lib/seo-content';
import { site } from '../lib/site';
import type { QrTypeId } from '../lib/types';

/** Long-press (mobile) or right-click (desktop) on the installed icon jumps straight to these types. */
const SHORTCUTS: { type: QrTypeId; short: string }[] = [
  { type: 'link', short: 'Link' },
  { type: 'pix', short: 'PIX' },
  { type: 'wifi', short: 'Wi-Fi' },
  { type: 'whatsapp', short: 'WhatsApp' },
];

/**
 * Screenshots of the three steps, wide (1280×800) for the desktop install dialog and narrow
 * (390×844 at 2×) for the mobile one. Recapture them in public/screenshots when the UI changes.
 */
const SCREENSHOTS = [
  { name: 'tipo', label: 'Escolha entre 13 tipos de QR Code' },
  { name: 'conteudo', label: 'Preencha o conteúdo e veja como abre no celular' },
  { name: 'personalizar', label: 'Personalize moldura, cores e logo e baixe' },
];

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: site.title,
    short_name: site.name,
    description: homeSeo.description,
    lang: site.language,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    categories: ['utilities', 'productivity'],
    prefer_related_applications: false,
    // Opening the app again (or a shortcut) reuses the open window instead of stacking new ones.
    launch_handler: { client_mode: ['navigate-existing', 'auto'] },
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      { src: '/icon-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    shortcuts: SHORTCUTS.map(({ type, short }) => ({
      name: typeSeo[type].name,
      short_name: short,
      description: typeSeo[type].description,
      url: `/${type}`,
      icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    })),
    screenshots: SCREENSHOTS.flatMap(({ name, label }) => [
      {
        src: `/screenshots/${name}-wide.webp`,
        sizes: '1280x800',
        type: 'image/webp',
        form_factor: 'wide' as const,
        label,
      },
      {
        src: `/screenshots/${name}-narrow.webp`,
        sizes: '780x1688',
        type: 'image/webp',
        form_factor: 'narrow' as const,
        label,
      },
    ]),
  };
}
