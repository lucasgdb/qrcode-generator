import { renderIcon } from '../../lib/icon';

export const dynamic = 'force-static';

export function GET() {
  return renderIcon(512);
}
