import type { CSSProperties } from 'react';

import { ArrowRightIcon, TypeIcon } from './icons';
import { routeHref } from '../hooks/useRoute';
import { typeSeo } from '../lib/seo-content';
import { TYPE_HUE } from '../lib/type-hue';
import type { QrTypeId } from '../lib/types';

export interface TypeGuideProps {
  type: QrTypeId;
}

/**
 * The page's own article, below the form: when to use the type and what to know.
 * Rendered on the server, so it is what search engines and answer engines read.
 */
export function TypeGuide({ type }: TypeGuideProps) {
  const { guide, sources } = typeSeo[type];
  if (guide.length === 0) return null;

  return (
    <div className="guide" data-slot="type-guide">
      {guide.map((section, index) => {
        const id = `guide-${type}-${index}`;
        return (
          <section key={section.heading} className="guide__section" aria-labelledby={id}>
            <h2 id={id} className="guide__title">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="guide__text">
                {paragraph}
              </p>
            ))}
          </section>
        );
      })}
      {sources?.length ? (
        <p className="guide__sources">
          Fonte:{' '}
          {sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 ? ', ' : null}
              <a href={source.href} target="_blank" rel="noopener">
                {source.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export interface RelatedTypesProps {
  type: QrTypeId;
  onSelect(type: QrTypeId): void;
}

/** Links to the closest types: real anchors for crawlers, in-app switches for plain clicks. */
export function RelatedTypes({ type, onSelect }: RelatedTypesProps) {
  const related = typeSeo[type].related;
  if (related.length === 0) return null;

  return (
    <nav className="related" aria-labelledby="related-title">
      <h2 id="related-title" className="related__title">
        Outros tipos de QR Code
      </h2>
      <ul className="related__grid">
        {related.map((id) => (
          <li key={id}>
            <a
              className="related-card"
              href={routeHref(2, id)}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                onSelect(id);
              }}
              style={{ '--hue': TYPE_HUE[id] } as CSSProperties}
            >
              <span className="related-card__icon">
                <TypeIcon type={id} />
              </span>
              <span className="related-card__name">{typeSeo[id].name}</span>
              <ArrowRightIcon className="related-card__arrow" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
