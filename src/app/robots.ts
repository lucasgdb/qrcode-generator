import { buildRobots } from '../lib/seo';

export default function robots() {
  return buildRobots(process.env.VERCEL_ENV);
}
