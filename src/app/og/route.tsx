import { renderOgImage } from '../../lib/og';

export const dynamic = 'force-static';

export function GET() {
  return renderOgImage(null);
}
