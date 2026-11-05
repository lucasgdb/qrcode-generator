import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import localFont from 'next/font/local';
import Head from 'next/head';
import { useEffect } from 'react';

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

/**
 * Registers the offline worker (production only: in dev it would cache hot-reload chunks), then
 * hands it this page's address and assets so the first visit is cached too.
 */
function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          const urls = [
            window.location.pathname,
            ...performance.getEntriesByType('resource').map((entry) => entry.name),
          ];
          registration.active?.postMessage({ type: 'cache', urls });
        })
        .catch(() => {});
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);
}

export default function App({ Component, pageProps }: AppProps) {
  useServiceWorker();

  return (
    <TooltipProvider delay={400}>
      <Head>
        {/* The font's generated family, for --font-sans in globals.css. */}
        <style key="font-geist" dangerouslySetInnerHTML={{ __html: `:root{--font-geist:${geist.style.fontFamily}}` }} />
      </Head>
      <Component {...pageProps} />
      {/* Referrers (AI assistants included) and real-user Core Web Vitals; see docs/SEO.md. */}
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  );
}
