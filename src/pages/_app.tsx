import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import localFont from 'next/font/local';

import { TooltipProvider } from '../components/ui/tooltip';

import '../styles/globals.css';

// Geist cut down to Latin, Latin-1, Latin Extended-A and common punctuation (35 KB instead of
// 68 KB); the weight axis is kept. next/font preloads it, serves it with an immutable cache and
// sizes the fallback to match, so the swap doesn't move text on slow connections.
const geist = localFont({
  src: '../assets/fonts/geist-latin-variable.woff2',
  weight: '100 900',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TooltipProvider delay={400}>
      <style jsx global>{`
        :root {
          --font-geist: ${geist.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
      {/* Referrers (AI assistants included) and real-user Core Web Vitals; see docs/SEO.md. */}
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  );
}
