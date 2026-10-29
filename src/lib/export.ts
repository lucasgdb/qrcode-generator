export type RasterMime = 'image/png' | 'image/jpeg';

export function rasterizeSvg(
  svg: string,
  width: number,
  height: number,
  mime: RasterMime,
  background: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Canvas indisponível.'));
          return;
        }

        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Não foi possível gerar a imagem.'));
          },
          mime,
          0.95,
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Não foi possível gerar a imagem.'));
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível carregar o código para exportar.'));
    };

    image.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return false;

  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}

export function toFileName(raw: string, fallback = 'qrcode'): string {
  const cleaned = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.(png|jpe?g|svg|webp)$/i, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 64);

  return cleaned || fallback;
}

const SAFE_IMAGE = /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[a-z0-9+/=\s]+$/i;

export function isSafeImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.length < 2_500_000 && SAFE_IMAGE.test(value);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

export interface ProcessedLogo {
  dataUrl: string;
  name: string;
}

const MAX_LOGO_BYTES = 1_500_000;
const MAX_LOGO_SIDE = 512;

export async function processLogoFile(file: File): Promise<ProcessedLogo> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Escolha um arquivo de imagem (PNG, JPG, WebP ou SVG).');
  }

  if (file.size > MAX_LOGO_BYTES) {
    throw new Error('A imagem passa de 1,5 MB. Use uma versão menor.');
  }

  const name = file.name.slice(0, 60);

  if (file.type === 'image/svg+xml') {
    return { dataUrl: await readAsDataUrl(file), name };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_LOGO_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Seu navegador não conseguiu preparar a imagem.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return { dataUrl: canvas.toDataURL('image/png'), name };
}

/** Whether this browser can hand image files to the system share sheet (WhatsApp, Drive…). */
export function canShareImages(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([new Blob()], 'qrcode.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
}
