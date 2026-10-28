# SEO e descoberta por IA

Como o gerador se apresenta para buscadores (SEO) e para assistentes de IA (GEO/AEO), o que precisa ser configurado fora do repositório e como medir. Segue o mesmo padrão do [lucasbittencourt.dev](https://lucasbittencourt.dev).

Nada disso garante posição, resultados ricos ou citações em IA. Remove obstáculos técnicos e deixa o conteúdo inequívoco.

## Onde fica cada coisa

| O quê                                                                                            | Arquivo                                        |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Domínio, nome, autor, política de treino de IA, data do conteúdo                                 | `src/lib/site.ts` (fonte única)                |
| Títulos, descrições, FAQs e passos de cada tipo                                                  | `src/lib/seo-content.ts`                       |
| JSON-LD, sitemap, robots e llms.txt                                                              | `src/lib/seo.ts`                               |
| Tags por página (title, canonical, hreflang, Open Graph, Twitter, JSON-LD)                       | `src/components/Seo.tsx`                       |
| Tags do site todo (robots, verificação, ícones, manifest)                                        | `src/pages/_document.tsx`                      |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/manifest.webmanifest`                              | `src/app/*` (App Router, gerados no build)     |
| Imagens Open Graph (`/og` e `/og/<tipo>`)                                                        | `src/app/og`, desenho em `src/lib/og.tsx`      |
| Ícones PNG (`/icon-192.png`, `/icon-512.png`, `/icon-maskable-512.png`, `/apple-touch-icon.png`) | `src/app/*.png`, desenho em `src/lib/icon.tsx` |

As páginas usam o Pages Router; as rotas de SEO usam o App Router, porque é onde o Next oferece `robots`, `sitemap` e `next/og`. Os dois convivem no mesmo projeto.

Ao mudar textos, FAQs ou a lista de tipos, atualize `contentUpdatedAt` em `src/lib/site.ts`. Ela alimenta o `lastmod` do sitemap e o `dateModified` do JSON-LD.

## Domínio canônico

O domínio é resolvido no `next.config.js` e embutido no build, para servidor e navegador usarem o mesmo valor:

1. `SITE_URL`, se definida (ex.: `https://qr.exemplo.com.br`);
2. senão, `VERCEL_PROJECT_PRODUCTION_URL`, que a Vercel define com o domínio de produção do projeto;
3. senão, `http://localhost:3000` (desenvolvimento).

Se o projeto tiver domínio próprio, defina `SITE_URL` na Vercel para não depender da escolha automática.

## Páginas

- `/`: escolha do tipo. Título e descrição genéricos, FAQ geral.
- `/<tipo>` (`/pix`, `/wifi`, `/whatsapp`…): uma página por tipo, pré-renderizada, com título, descrição, FAQ, HowTo e imagem própria. São as páginas de cauda longa ("gerador de QR Code PIX", "QR Code de Wi-Fi").
- A etapa de personalização não tem URL própria (aberta direto, não teria conteúdo), então não entra no sitemap.

Os cards da página inicial são links reais (`<a href="/pix">`), para os buscadores encontrarem cada página.

## Dados estruturados (JSON-LD)

- **Página inicial**: `WebPage`, `WebSite`, `WebApplication` (gratuito, `UtilitiesApplication`, lista de recursos), `Person` (autor) e `FAQPage`.
- **Cada tipo**: `WebPage`, `HowTo` (as três etapas), `FAQPage` e `BreadcrumbList`.

As perguntas do `FAQPage` aparecem na página (o Google só usa FAQ estruturado visível). O JSON-LD é escapado para nunca fechar a tag `<script>`.

## Política de crawlers (`/robots.txt`)

robots.txt é uma política de rastreamento, não controle de acesso.

| Crawler                                    | Para quê                                                    | Política                    |
| ------------------------------------------ | ----------------------------------------------------------- | --------------------------- |
| Googlebot, Bingbot                         | Indexação (o Google também usa para AI Overviews e AI Mode) | Permitido (`*`)             |
| OAI-SearchBot                              | Resultados do ChatGPT Search                                | Permitido (`*`)             |
| ChatGPT-User, Claude-User, Perplexity-User | Acessos disparados por uma pergunta                         | Permitido (`*`)             |
| PerplexityBot, Claude-SearchBot            | Indexação de buscas com IA                                  | Permitido (`*`)             |
| GPTBot, ClaudeBot, CCBot                   | Coleta para treino de modelos                               | Permitido (grupo explícito) |
| Google-Extended, Applebot-Extended         | Uso do conteúdo para treino (Gemini, Apple)                 | Permitido (grupo explícito) |

Para bloquear treino sem afetar a busca, mude `allowAiTraining` para `false` em `src/lib/site.ts`.

Deploys de preview e builds locais (`VERCEL_ENV` diferente de `production`) respondem `Disallow: /` e `noindex`.

## llms.txt (`/llms.txt`)

Gerado no build seguindo a [proposta llms.txt](https://llmstxt.org): o que o gerador é, um link por tipo e todas as perguntas e respostas. É **experimental**: não é requisito do Google, do Bing ou do ChatGPT, e a maioria dos crawlers ignora. Fica porque não custa manutenção (sai dos mesmos dados das páginas).

## Open Graph

Cada página tem a própria imagem de 1200×630 (`/og` e `/og/<tipo>`), gerada no build com `next/og` e a fonte Geist (`src/assets/fonts`, TTF, porque o `next/og` não lê WOFF2). A imagem traz o nome do tipo, o ícone e um QR Code de verdade que abre aquela página.

## Ações manuais (fora do repositório)

1. **Domínio**: se houver domínio próprio, defina-o como principal na Vercel (Settings → Domains) e `SITE_URL` nas variáveis de ambiente. Redirecione as outras variantes (www, `*.vercel.app`) para ele.
2. **Vercel Firewall**: confira que nenhuma regra de proteção contra bots bloqueia os crawlers permitidos acima. Um `Allow` no robots.txt não adianta se o firewall responder 403.
3. **Google Search Console**: adicione a propriedade do domínio (verificação por DNS) e envie `/sitemap.xml`. Para verificar por meta tag, defina `GOOGLE_SITE_VERIFICATION` na Vercel.
4. **Bing Webmaster Tools**: importe do Search Console (ou defina `BING_SITE_VERIFICATION`) e envie o sitemap. O índice do Bing também alimenta buscas com IA.
5. **A cada deploy com mudanças de metadados**: teste uma página no [Rich Results Test](https://search.google.com/test/rich-results) e no [Schema Markup Validator](https://validator.schema.org), e compartilhe uma URL no [opengraph.xyz](https://www.opengraph.xyz) para ver a prévia.

## Monitoramento

### Tráfego vindo de IA

Na Vercel → Analytics → Referrers, acompanhe: `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai`. O ChatGPT também adiciona `utm_source=chatgpt.com` aos links. Para isso, ative o Web Analytics no projeto da Vercel.

### Checklist mensal

- [ ] Search Console: páginas indexadas, "Cópia, o Google escolheu outra canônica", Core Web Vitals, erros de rastreamento
- [ ] Bing Webmaster Tools: páginas indexadas e erros
- [ ] Referências vindas de IA (comparar com o mês anterior)
- [ ] Rodar o conjunto de perguntas abaixo e registrar os resultados

### Perguntas para acompanhar

Pergunte no ChatGPT (com busca), Perplexity, Gemini e Google (AI Mode). Registre a data, se o gerador foi citado e qual URL:

1. Gerador de QR Code grátis sem cadastro
2. Como gerar um QR Code PIX grátis?
3. Como criar um QR Code para a senha do Wi-Fi?
4. Como fazer um QR Code que abre o WhatsApp com mensagem?
5. QR Code para Instagram grátis
6. QR Code com logo grátis em SVG

Os resultados variam por usuário, local e momento. Observe tendências, não respostas isoladas.
