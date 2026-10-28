import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';

import { TooltipProvider } from '../components/ui/tooltip';

import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TooltipProvider delay={400}>
      <Component {...pageProps} />
      {/* Referrers (AI assistants included) and real-user Core Web Vitals; see docs/SEO.md. */}
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  );
}
