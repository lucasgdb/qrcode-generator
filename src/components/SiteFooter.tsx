import { privacyPath } from '../lib/seo';
import { author, contentUpdatedAt, site } from '../lib/site';

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "2026-11-04" → "4 de novembro de 2026", the same on the server and in every browser. */
function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

/** Who makes the generator, where its code is and how it treats data: trust signals on every page. */
export default function SiteFooter() {
  return (
    <footer className="site-footer" data-slot="site-footer">
      <p>
        Feito por{' '}
        <a href={author.url} rel="author">
          {author.name}
        </a>
        <span aria-hidden="true"> · </span>
        <a href={site.sourceCode} target="_blank" rel="noopener">
          Código aberto no GitHub
        </a>
        <span aria-hidden="true"> · </span>
        <a href={privacyPath}>Privacidade</a>
      </p>
      <p>
        Atualizado em <time dateTime={contentUpdatedAt}>{formatDate(contentUpdatedAt)}</time>
      </p>
    </footer>
  );
}
