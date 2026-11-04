import Head from 'next/head';

import Brand from '../components/Brand';
import SiteFooter from '../components/SiteFooter';
import { pageUrl, privacyPath } from '../lib/seo';
import { author, baseUrl, site } from '../lib/site';

const title = `Privacidade | ${site.name}`;
const description =
  'O que o Gerador de QR faz com os seus dados: o QR Code é gerado no navegador, o conteúdo digitado não sai do aparelho e não há cadastro nem cookies.';
const url = `${baseUrl}${privacyPath}`;

/** How the generator treats data, in plain words. Linked from every page's footer. */
export default function Privacy() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title key="title">{title}</title>
        <meta key="description" name="description" content={description} />
        <link key="canonical" rel="canonical" href={url} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content={site.name} />
        <meta key="og:locale" property="og:locale" content={site.locale} />
        <meta key="og:url" property="og:url" content={url} />
        <meta key="og:title" property="og:title" content={title} />
        <meta key="og:description" property="og:description" content={description} />
      </Head>

      <div className="app" data-step="1">
        <main className="main" id="conteudo" tabIndex={-1}>
          <article className="legal">
            <a href={pageUrl()} className="legal__brand" aria-label={`${site.name}: página inicial`}>
              <Brand />
            </a>
            <h1 className="display">Privacidade</h1>
            <p className="lead">
              Resumo: o QR Code é gerado no seu navegador. O que você digita não é enviado a nenhum servidor nem fica
              salvo.
            </p>

            <h2>O que acontece com o conteúdo do QR Code</h2>
            <p>
              Links, senhas de Wi-Fi, chaves PIX, contatos e qualquer outro conteúdo que você digita são transformados
              em QR Code no próprio aparelho, pelo navegador. Esse conteúdo não é enviado, registrado nem guardado: ao
              fechar ou recarregar a página, os campos voltam vazios.
            </p>

            <h2>O que fica salvo no seu aparelho</h2>
            <p>
              Para você não precisar refazer a aparência a cada visita, as preferências de design (cores, moldura,
              formato dos módulos e o logo enviado) e de arquivo (formato e tamanho) ficam no armazenamento local do
              navegador. Elas ficam só no seu aparelho e não são enviadas a servidores. Para apagar, limpe os dados do
              site nas configurações do navegador.
            </p>

            <h2>Estatísticas de uso</h2>
            <p>
              O site usa o Vercel Web Analytics e o Vercel Speed Insights para contar visitas, ver de onde elas vêm e
              medir a velocidade das páginas. Eles não usam cookies, não identificam quem você é e não recebem o
              conteúdo dos seus QR Codes. Os dados são agregados.
            </p>

            <h2>Sem cadastro, sem cookies de rastreamento</h2>
            <p>
              Não há conta, login, anúncios nem cookies de rastreamento. Os QR Codes são estáticos: depois de baixados,
              funcionam sem passar por este site e não permitem saber quem os escaneou.
            </p>

            <h2>Código aberto e contato</h2>
            <p>
              O código-fonte é público em{' '}
              <a href={site.sourceCode} target="_blank" rel="noopener">
                {site.sourceCode.replace('https://', '')}
              </a>
              , então qualquer pessoa pode conferir o que está descrito aqui. Dúvidas ou sugestões: fale com{' '}
              <a href={author.url} rel="author">
                {author.name}
              </a>{' '}
              ou abra uma issue no GitHub.
            </p>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
