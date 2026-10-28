import type { CSSProperties } from 'react';

import Brand from './Brand';
import { Badge } from './ui/badge';
import { TypeIcon } from './icons';
import { QR_TYPES, type QrTypeId } from '../lib/types';

export interface TypePickerProps {
  onSelect(type: QrTypeId): void;
}

/** One hue per family of content: web, messages, money, places and people. */
export const TYPE_HUE: Record<QrTypeId, string> = {
  link: '#2563eb',
  social: '#db2777',
  video: '#d7263d',
  text: '#3f3f46',
  wifi: '#0e8a6a',
  vcard: '#d7263d',
  pix: '#0f9d8a',
  email: '#c2410c',
  sms: '#0e8a6a',
  whatsapp: '#16a34a',
  phone: '#2563eb',
  geo: '#d7263d',
  event: '#b45309',
};

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
            <button
              type="button"
              className="type-card"
              onClick={() => onSelect(type.id)}
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
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
