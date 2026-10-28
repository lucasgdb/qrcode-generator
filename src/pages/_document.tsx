import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="preload" href="/fonts/geist-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
