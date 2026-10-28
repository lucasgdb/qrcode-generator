import type { ErrorCorrection, QrStyle } from './types';

export function normalizeHex(raw: string): string | null {
  const value = raw.trim().replace(/^#?/, '#');
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [r, g, b] = value.slice(1).split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function toRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex) ?? '#000000';
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ScanLevel = 'empty' | 'ok' | 'warn' | 'error';

export interface ScanAudit {
  level: ScanLevel;
  title: string;
  notices: string[];
  contrast: number;
}

interface AuditInput {
  style: QrStyle;
  count: number;
  version: number;
  hasContent: boolean;
  overflow: boolean;
}

const CORRECTION_PERCENT: Record<ErrorCorrection, number> = { L: 7, M: 15, Q: 25, H: 30 };

export function correctionPercent(level: ErrorCorrection): number {
  return CORRECTION_PERCENT[level];
}

const DECIMAL = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** A number as people in Brazil read it: "4,5", "21". */
export function formatDecimal(value: number): string {
  return DECIMAL.format(value);
}

export function formatRatio(value: number): string {
  return formatDecimal(value);
}

export function auditQr({ style, count, version, hasContent, overflow }: AuditInput): ScanAudit {
  const contrast = contrastRatio(style.fg, style.bg);
  const roundedContrast = Math.round(contrast * 10) / 10;

  if (!hasContent) {
    return {
      level: 'empty',
      title: 'Aguardando conteúdo',
      notices: [],
      contrast: roundedContrast,
    };
  }

  if (overflow) {
    return {
      level: 'error',
      title: 'Conteúdo longo demais',
      notices: ['Reduza o texto ou escolha um nível de correção menor.'],
      contrast: roundedContrast,
    };
  }

  const notices: string[] = [];
  let level: ScanLevel = 'ok';

  if (contrast < 3) {
    level = 'error';
    notices.push(
      `Contraste de ${formatRatio(roundedContrast)}:1 entre frente e fundo. Abaixo de 3:1 a câmera pode não separar os módulos.`,
    );
  } else if (contrast < 4.5) {
    level = 'warn';
    notices.push(`Contraste de ${formatRatio(roundedContrast)}:1. Para impressão, prefira 4,5:1 ou mais.`);
  }

  if (luminance(style.fg) > luminance(style.bg)) {
    level = level === 'error' ? level : 'warn';
    notices.push('Código invertido (frente clara no fundo escuro) pode falhar em leitores antigos.');
  }

  if (style.logo) {
    if (style.logo.size > 24) {
      level = level === 'error' ? level : 'warn';
      notices.push(`O logo ocupa ${style.logo.size}% da largura. Mantenha em 24% ou menos.`);
    }
    if ((style.errorCorrection === 'L' || style.errorCorrection === 'M') && style.logo.size > 16) {
      level = level === 'error' ? level : 'warn';
      notices.push('Com logo, use correção Q ou H para recuperar os módulos cobertos.');
    }
  }

  if (style.margin < 4) {
    level = level === 'error' ? level : 'warn';
    notices.push(`Margem de ${style.margin} ${style.margin === 1 ? 'módulo' : 'módulos'}. O padrão é 4.`);
  }

  if (version > 20) {
    level = level === 'error' ? level : 'warn';
    notices.push(`Código denso (${count}×${count} módulos). Para impressão pequena, reduza o conteúdo.`);
  }

  const title =
    level === 'ok' ? 'Pronto para escanear' : level === 'error' ? 'Revise antes de usar' : 'Revise antes de imprimir';

  return { level, title, notices: notices.slice(0, 3), contrast: roundedContrast };
}
