import type { AppProps } from 'next/app';

import { TooltipProvider } from '../components/ui/tooltip';

import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TooltipProvider delay={400}>
      <Component {...pageProps} />
    </TooltipProvider>
  );
}
