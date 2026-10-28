import qrcode from 'qrcode-generator';

import { contrastRatio } from './scan';
import type { ErrorCorrection, ModuleShape, QrStyle } from './types';

// qrcode-generator encodes bytes with charCodeAt by default, which mangles
// accented characters. Brazilian content (Wi-Fi names, PIX, contacts) needs UTF-8.
qrcode.stringToBytes = (input: string) => Array.from(new TextEncoder().encode(input));

export interface QrMatrix {
  count: number;
  version: number;
  modules: boolean[];
}

export type MatrixResult = { ok: true; matrix: QrMatrix } | { ok: false; reason: string };

export function generateMatrix(payload: string, errorCorrection: ErrorCorrection): MatrixResult | null {
  if (!payload) return null;

  try {
    const qr = qrcode(0, errorCorrection);
    qr.addData(payload, 'Byte');
    qr.make();

    const count = qr.getModuleCount();
    const modules: boolean[] = new Array(count * count);
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        modules[row * count + column] = qr.isDark(row, column);
      }
    }

    return { ok: true, matrix: { count, version: (count - 17) / 4, modules } };
  } catch {
    return {
      ok: false,
      reason: 'O conteúdo é longo demais para caber em um QR Code neste nível de correção.',
    };
  }
}

export interface QrGeometry {
  total: number;
  dataPath: string;
  eyes: { ring: string; dot: string }[];
  moduleShape: ModuleShape;
}

function round(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M${round(x + r)} ${round(y)}`,
    `H${round(x + width - r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + width)} ${round(y + r)}`,
    `V${round(y + height - r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + width - r)} ${round(y + height)}`,
    `H${round(x + r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x)} ${round(y + height - r)}`,
    `V${round(y + r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + r)} ${round(y)}`,
    'Z',
  ].join('');
}

function circlePath(cx: number, cy: number, radius: number): string {
  return `M${round(cx - radius)} ${round(cy)}a${round(radius)} ${round(radius)} 0 1 0 ${round(
    radius * 2,
  )} 0a${round(radius)} ${round(radius)} 0 1 0 ${round(-radius * 2)} 0Z`;
}

/**
 * A unit module whose corners are rounded only where the code does not continue.
 * Adjacent modules stay flush, so runs read as one rounded shape instead of a
 * grid of blobs, while the module grid the scanner samples stays intact.
 */
function roundedModule(
  x: number,
  y: number,
  topLeft: number,
  topRight: number,
  bottomRight: number,
  bottomLeft: number,
): string {
  return [
    `M${round(x + topLeft)} ${round(y)}`,
    `H${round(x + 1 - topRight)}`,
    `A${round(topRight)} ${round(topRight)} 0 0 1 ${round(x + 1)} ${round(y + topRight)}`,
    `V${round(y + 1 - bottomRight)}`,
    `A${round(bottomRight)} ${round(bottomRight)} 0 0 1 ${round(x + 1 - bottomRight)} ${round(y + 1)}`,
    `H${round(x + bottomLeft)}`,
    `A${round(bottomLeft)} ${round(bottomLeft)} 0 0 1 ${round(x)} ${round(y + 1 - bottomLeft)}`,
    `V${round(y + topLeft)}`,
    `A${round(topLeft)} ${round(topLeft)} 0 0 1 ${round(x + topLeft)} ${round(y)}`,
    'Z',
  ].join('');
}

function isFinder(row: number, column: number, count: number): boolean {
  return (row < 7 && column < 7) || (row < 7 && column >= count - 7) || (row >= count - 7 && column < 7);
}

function eyePaths(shape: QrStyle['eyeShape'], x: number, y: number): { ring: string; dot: string } {
  const cx = x + 3.5;
  const cy = y + 3.5;

  if (shape === 'rounded') {
    return {
      ring: `${roundedRect(x, y, 7, 7, 2.2)}${roundedRect(x + 1, y + 1, 5, 5, 1.2)}`,
      dot: roundedRect(x + 2, y + 2, 3, 3, 0.8),
    };
  }

  if (shape === 'circle') {
    return {
      ring: `${circlePath(cx, cy, 3.5)}${circlePath(cx, cy, 2.5)}`,
      dot: circlePath(cx, cy, 1.5),
    };
  }

  return {
    ring: `M${x} ${y}h7v7h-7Z M${x + 1} ${y + 1}v5h5v-5Z`,
    dot: `M${x + 2} ${y + 2}h3v3h-3Z`,
  };
}

export function buildGeometry(matrix: QrMatrix, style: QrStyle): QrGeometry {
  const { count, modules } = matrix;
  const margin = style.margin;
  const commands: string[] = [];

  const isDark = (row: number, column: number) =>
    row >= 0 &&
    row < count &&
    column >= 0 &&
    column < count &&
    modules[row * count + column] &&
    !isFinder(row, column, count);

  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (!modules[row * count + column] || isFinder(row, column, count)) continue;

      // Square modules merge into one rectangle per horizontal run: a version 40
      // code drops from ~15k subpaths to a few thousand, which keeps the live
      // preview fast and the exported SVG small.
      if (style.moduleShape === 'square') {
        let end = column + 1;
        while (end < count && modules[row * count + end] && !isFinder(row, end, count)) end += 1;
        commands.push(`M${column + margin} ${row + margin}h${end - column}v1h-${end - column}Z`);
        column = end - 1;
        continue;
      }

      const x = column + margin;
      const y = row + margin;

      if (style.moduleShape === 'dots') {
        commands.push(circlePath(x + 0.5, y + 0.5, 0.5));
      } else if (style.moduleShape === 'rounded') {
        const top = isDark(row - 1, column);
        const bottom = isDark(row + 1, column);
        const left = isDark(row, column - 1);
        const right = isDark(row, column + 1);
        const radius = 0.45;
        commands.push(
          roundedModule(
            x,
            y,
            left || top ? 0 : radius,
            right || top ? 0 : radius,
            right || bottom ? 0 : radius,
            left || bottom ? 0 : radius,
          ),
        );
      }
    }
  }

  const size = count + margin * 2;
  const eyes = [
    eyePaths(style.eyeShape, margin, margin),
    eyePaths(style.eyeShape, margin + count - 7, margin),
    eyePaths(style.eyeShape, margin, margin + count - 7),
  ];

  return {
    total: size,
    dataPath: commands.join(''),
    eyes,
    moduleShape: style.moduleShape,
  };
}

/**
 * Smallest printed width (quiet zone included) a phone reads comfortably:
 * about 0.5 mm per module, rounded up to half centimetres, never under 2 cm.
 */
export function minPrintCentimeters(total: number): number {
  return Math.max(2, Math.ceil(total * 0.1) / 2);
}

export interface LogoBox {
  box: number;
  inset: number;
  radius: number;
  x: number;
  y: number;
}

/** The white pad + logo box, shared by the live preview (HTML) and the export (SVG). */
export function logoBox(style: QrStyle, total: number): (LogoBox & { size: number }) | null {
  if (!style.logo) return null;

  const box = (total * style.logo.size) / 100;
  const inset = box * 0.06;
  const center = total / 2;

  return {
    box,
    inset,
    radius: box * 0.12,
    x: center - box / 2,
    y: center - box / 2,
    size: box - inset * 2,
  };
}

function escapeXml(raw: string): string {
  return raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readableInk(color: string): string {
  return contrastRatio(color, '#ffffff') >= contrastRatio(color, '#000000') ? '#ffffff' : '#000000';
}

interface FrameLayout {
  width: number;
  height: number;
  qrX: number;
  qrY: number;
  /** Drawn under the code. */
  back: string;
  /** Drawn over everything. */
  front: string;
}

/**
 * Lays a frame around a code of `total` modules. Every frame keeps the code's own
 * quiet zone untouched, so a frame can never cut into what the scanner needs.
 */
function frameLayout(style: QrStyle, total: number): FrameLayout {
  const pad = total * 0.07;
  const band = total * 0.24;
  const radius = total * 0.06;
  const stroke = total * 0.03;
  const color = escapeXml(style.frameColor);
  const bg = escapeXml(style.bg);
  const text = style.frameText.trim();

  const label = (cx: number, cy: number, fill: string, maxWidth: number) => {
    if (!text) return '';
    const size = Math.min(band * 0.4, maxWidth / Math.max(1, text.length * 0.62));
    return `<text x="${round(cx)}" y="${round(cy)}" text-anchor="middle" dominant-baseline="central" font-family="Geist, 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="${round(
      size,
    )}" fill="${escapeXml(fill)}">${escapeXml(text)}</text>`;
  };

  const width = total + pad * 2;

  switch (style.frame) {
    case 'banner': {
      const height = pad + total + band;
      return {
        width,
        height,
        qrX: pad,
        qrY: pad,
        back: `<rect width="${round(width)}" height="${round(height)}" rx="${round(radius)}" fill="${color}"/>`,
        front: label(width / 2, pad + total + band / 2, readableInk(style.frameColor), width * 0.86),
      };
    }
    case 'header': {
      const height = band + total + pad;
      return {
        width,
        height,
        qrX: pad,
        qrY: band,
        back: `<rect width="${round(width)}" height="${round(height)}" rx="${round(radius)}" fill="${color}"/>`,
        front: label(width / 2, band / 2, readableInk(style.frameColor), width * 0.86),
      };
    }
    case 'outline': {
      const foot = band * 0.85;
      const height = pad + total + foot;
      const half = stroke / 2;
      return {
        width,
        height,
        qrX: pad,
        qrY: pad,
        back: `<rect x="${round(half)}" y="${round(half)}" width="${round(width - stroke)}" height="${round(
          height - stroke,
        )}" rx="${round(radius)}" fill="${bg}" stroke="${color}" stroke-width="${round(stroke)}"/>`,
        front: label(width / 2, pad + total + foot / 2 - stroke / 2, style.frameColor, width * 0.8),
      };
    }
    case 'bubble': {
      const card = total + pad * 2;
      const gap = total * 0.09;
      const pillHeight = band * 0.8;
      const pillWidth = width * 0.82;
      const pillY = card + gap;
      const height = pillY + pillHeight;
      const tip = total * 0.05;
      const cx = width / 2;
      return {
        width,
        height,
        qrX: pad,
        qrY: pad,
        back: [
          `<rect x="${round(stroke / 2)}" y="${round(stroke / 2)}" width="${round(width - stroke)}" height="${round(
            card - stroke,
          )}" rx="${round(radius)}" fill="${bg}" stroke="${color}" stroke-width="${round(stroke)}"/>`,
          `<rect x="${round(cx - pillWidth / 2)}" y="${round(pillY)}" width="${round(pillWidth)}" height="${round(
            pillHeight,
          )}" rx="${round(pillHeight / 2)}" fill="${color}"/>`,
          `<path d="M${round(cx - tip)} ${round(pillY + 0.5)}L${round(cx)} ${round(pillY - tip)}L${round(
            cx + tip,
          )} ${round(pillY + 0.5)}Z" fill="${color}"/>`,
        ].join(''),
        front: label(cx, pillY + pillHeight / 2, readableInk(style.frameColor), pillWidth * 0.86),
      };
    }
    case 'corners': {
      const foot = band * 0.85;
      const height = pad + total + foot;
      const inset = stroke;
      const arm = total * 0.16;
      const right = width - inset;
      const bottom = pad * 2 + total - inset;
      const d = [
        `M${round(inset)} ${round(inset + arm)}V${round(inset)}H${round(inset + arm)}`,
        `M${round(right - arm)} ${round(inset)}H${round(right)}V${round(inset + arm)}`,
        `M${round(right)} ${round(bottom - arm)}V${round(bottom)}H${round(right - arm)}`,
        `M${round(inset + arm)} ${round(bottom)}H${round(inset)}V${round(bottom - arm)}`,
      ].join('');
      return {
        width,
        height,
        qrX: pad,
        qrY: pad,
        back: `<rect width="${round(width)}" height="${round(height)}" fill="${bg}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${round(
          stroke * 1.4,
        )}" stroke-linecap="round" stroke-linejoin="round"/>`,
        front: label(width / 2, pad * 2 + total + (foot - pad) / 2, style.frameColor, width * 0.8),
      };
    }
    default:
      return { width: total, height: total, qrX: 0, qrY: 0, back: '', front: '' };
  }
}

export interface RenderedQr {
  svg: string;
  /** Height divided by width: 1 without a frame, taller with one. */
  aspect: number;
}

interface RenderOptions {
  geometry: QrGeometry;
  style: QrStyle;
  /** Pixel width for a file; omitted, the SVG fills its container. */
  pixelWidth?: number;
  label?: string;
}

/** One renderer for the preview, the thumbnail and the exported file, so what you see is what you download. */
export function renderQrSvg({ geometry, style, pixelWidth, label = 'QR Code' }: RenderOptions): RenderedQr {
  const total = geometry.total;
  const frame = frameLayout(style, total);
  const aspect = frame.height / frame.width;
  const fg = escapeXml(style.fg);
  const dimension = pixelWidth
    ? ` width="${pixelWidth}" height="${Math.round(pixelWidth * aspect)}"`
    : ' width="100%" height="100%"';

  const eyes = geometry.eyes
    .map((eye) => `<path d="${eye.ring}" fill="${fg}" fill-rule="evenodd"/><path d="${eye.dot}" fill="${fg}"/>`)
    .join('');

  let logo = '';
  const box = logoBox(style, total);
  if (box && style.logo) {
    const clipId = 'qr-logo-clip';
    logo = [
      `<clipPath id="${clipId}"><rect x="${round(box.x)}" y="${round(box.y)}" width="${round(
        box.box,
      )}" height="${round(box.box)}" rx="${round(box.radius)}"/></clipPath>`,
      `<rect x="${round(box.x)}" y="${round(box.y)}" width="${round(box.box)}" height="${round(
        box.box,
      )}" rx="${round(box.radius)}" fill="${escapeXml(style.bg)}"/>`,
      `<image href="${escapeXml(style.logo.dataUrl)}" x="${round(box.x + box.inset)}" y="${round(
        box.y + box.inset,
      )}" width="${round(box.size)}" height="${round(box.size)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${clipId})"/>`,
    ].join('');
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg"${dimension} viewBox="0 0 ${round(frame.width)} ${round(
      frame.height,
    )}" role="img" aria-label="${escapeXml(label)}">`,
    frame.back,
    `<g transform="translate(${round(frame.qrX)} ${round(frame.qrY)})">`,
    `<rect width="${total}" height="${total}" fill="${escapeXml(style.bg)}"/>`,
    `<path d="${geometry.dataPath}" fill="${fg}"${geometry.moduleShape === 'square' ? ' shape-rendering="crispEdges"' : ''}/>`,
    eyes,
    logo,
    '</g>',
    frame.front,
    '</svg>',
  ].join('');

  return { svg, aspect };
}
