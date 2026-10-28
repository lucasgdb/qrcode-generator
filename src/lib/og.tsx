import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { TypeIcon } from '../components/icons';
import { TYPE_HUE } from './type-hue';
import { buildGeometry, generateMatrix, renderQrSvg } from './qr';
import { ogImageSize, pageUrl } from './seo';
import { homeSeo, typeSeo } from './seo-content';
import { site } from './site';
import { DEFAULT_STYLE, QR_TYPE_BY_ID, type QrTypeId } from './types';

// Read at build time; the images are rendered once, statically. next/og takes ttf, not woff2.
const fontDir = join(process.cwd(), 'src', 'assets', 'fonts');
const fonts = [
  {
    name: 'Geist',
    data: readFileSync(join(fontDir, 'Geist-Medium.ttf')),
    weight: 500 as const,
    style: 'normal' as const,
  },
  {
    name: 'Geist',
    data: readFileSync(join(fontDir, 'Geist-Bold.ttf')),
    weight: 700 as const,
    style: 'normal' as const,
  },
];

const ink = '#171717';
const muted = '#737373';
const border = '#e5e5e5';

/** A real, scannable code that opens the page the image belongs to. */
function qrDataUri(url: string) {
  const matrix = generateMatrix(url, 'M');
  if (!matrix?.ok) throw new Error(`QR for ${url} did not fit`);
  const style = { ...DEFAULT_STYLE, fg: ink, margin: 2, moduleShape: 'rounded' as const, eyeShape: 'rounded' as const };
  const { svg } = renderQrSvg({ geometry: buildGeometry(matrix.matrix, style), style, pixelWidth: 360 });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function BrandMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="6" fill={ink} />
      <rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1.2" fill="#fff" />
      <rect x="13" y="6.5" width="4.5" height="4.5" rx="1.2" fill="#fff" />
      <rect x="6.5" y="13" width="4.5" height="4.5" rx="1.2" fill="#fff" />
      <rect x="13.5" y="13.5" width="3.5" height="3.5" rx="1" fill="#fff" />
    </svg>
  );
}

/** 1200×630 card: brand, the type's icon and name, its promise, and a code that opens the page. */
export function renderOgImage(type: QrTypeId | null) {
  const title = type ? typeSeo[type].name : site.title;
  const subtitle = type ? QR_TYPE_BY_ID[type].description : 'Link, PIX, Wi-Fi, WhatsApp, contato, evento e mais.';
  const hue = type ? TYPE_HUE[type] : ink;
  const url = pageUrl(type);
  const host = url.replace(/^https?:\/\//, '');

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#fafafa',
        fontFamily: 'Geist',
        color: ink,
        padding: 64,
      }}
    >
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 48 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontWeight: 700 }}>
          <BrandMark />
          {site.name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {type ? (
            <div
              style={{
                width: 84,
                height: 84,
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 22,
                backgroundColor: `${hue}17`,
                color: hue,
              }}
            >
              <TypeIcon type={type} width={44} height={44} />
            </div>
          ) : null}
          <div style={{ fontSize: type ? 72 : 76, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.04 }}>
            {title}
          </div>
          <div style={{ marginTop: 22, fontSize: 30, fontWeight: 500, color: muted, lineHeight: 1.35 }}>{subtitle}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 22, fontWeight: 500, color: muted }}>
          {['Grátis', 'Sem cadastro', 'PNG, SVG e JPEG'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: `1.5px solid ${border}`,
                backgroundColor: '#fff',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: 28,
          borderRadius: 36,
          border: `1.5px solid ${border}`,
          backgroundColor: '#fff',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUri(url)} width={360} height={360} alt="" />
        <div style={{ fontSize: 22, fontWeight: 500, color: muted }}>{host}</div>
      </div>
    </div>,
    { ...ogImageSize, fonts, headers: { 'Cache-Control': 'public, max-age=86400, immutable' } },
  );
}

/** The image's alt text, mirrored in the page's og:image:alt. */
export function ogAlt(type: QrTypeId | null) {
  return type ? `${typeSeo[type].name}: ${typeSeo[type].description}` : homeSeo.description;
}
