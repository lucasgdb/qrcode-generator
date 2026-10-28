import { renderOgImage } from '../../../lib/og';
import { QR_TYPES, QR_TYPE_BY_ID, type QrTypeId } from '../../../lib/types';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return QR_TYPES.map((type) => ({ type: type.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!(type in QR_TYPE_BY_ID)) return new Response('Not found', { status: 404 });
  return renderOgImage(type as QrTypeId);
}
