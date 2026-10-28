import type { CSSProperties } from 'react';

import Brand from './Brand';
import FaqList from './FaqList';
import { Badge } from './ui/badge';
import { TypeIcon } from './icons';
import { routeHref } from '../hooks/useRoute';
import { homeSeo } from '../lib/seo-content';
import { QR_TYPES, type QrTypeId } from '../lib/types';
import { TYPE_HUE } from '../lib/type-hue';

export interface TypePickerProps {
  onSelect(type: QrTypeId): void;
}

/** Brand and technical names that machine translation would garble. */
const UNTRANSLATED = new Set<QrTypeId>(['whatsapp', 'pix', 'sms', 'wifi']);

export default function TypePicker({ onSelect }: TypePickerProps) {
  return (
    <section className="picker" data-slot="type-picker" aria-labelledby="picker-title">
      <header className="picker__head">
        <Brand />
        <h1 id="picker-title" className="display">
          Que QR Code você quer criar?
        </h1>
        <p className="lead">Escolha um tipo. Dá para trocar depois sem perder o que você digitou.</p>
      </header>

      <ul className="picker__grid">
        {QR_TYPES.map((type) => (
          <li key={type.id}>
            {/* A real link, so search engines find every type's page; plain clicks stay in the app. */}
            <a
              className="type-card"
              href={routeHref(2, type.id)}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                onSelect(type.id);
              }}
              style={{ '--hue': TYPE_HUE[type.id] } as CSSProperties}
            >
              <span className="type-card__icon">
                <TypeIcon type={type.id} />
              </span>
              <span className="type-card__body">
                <span className="type-card__title" translate={UNTRANSLATED.has(type.id) ? 'no' : undefined}>
                  {type.label}
                </span>
                <span className="type-card__text">{type.description}</span>
              </span>
              {type.id === 'link' ? <Badge variant="ink">Mais usado</Badge> : null}
              {type.isNew ? <Badge variant="ink">Novo</Badge> : null}
            </a>
          </li>
        ))}
      </ul>

      <FaqList title="Perguntas frequentes" items={homeSeo.faq} />
    </section>
  );
}
