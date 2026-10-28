import type { CSSProperties, ReactNode } from 'react';

import { PersonGlyph, TypeIcon } from './icons';
import { TYPE_HUE } from '../lib/type-hue';
import { SOCIAL_NETWORKS, type QrTypeDef } from '../lib/types';

export interface PhonePreviewProps {
  type: QrTypeDef;
  values: Record<string, string>;
}

function v(values: Record<string, string>, key: string): string {
  return (values[key] ?? '').trim();
}

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="phone__placeholder">{children}</span>;
}

function hostOf(raw: string): string {
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`).host;
  } catch {
    return raw;
  }
}

function formatDate(date: string, time: string): string {
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month || 1) - 1, day || 1);
  const label = parsed.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' });
  return time ? `${label} · ${time}` : label;
}

function formatMoney(raw: string): string {
  const amount = Number(raw.replace(/\./g, '').replace(',', '.'));
  if (!raw || !Number.isFinite(amount)) return '';
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** What the person who scans sees, drawn from the fields as they are typed. */
function Screen({ type, values }: PhonePreviewProps) {
  switch (type.id) {
    case 'link': {
      const url = v(values, 'url');
      return (
        <div className="screen screen--browser">
          <div className="browser-bar">{url ? hostOf(url) : <Placeholder>exemplo.com.br</Placeholder>}</div>
          <div className="browser-page">
            <span className="skeleton skeleton--hero" />
            <span className="skeleton" />
            <span className="skeleton skeleton--short" />
            <span className="skeleton" />
          </div>
        </div>
      );
    }
    case 'social': {
      const network = SOCIAL_NETWORKS.find((item) => item.value === values.network) ?? SOCIAL_NETWORKS[0];
      const handle = v(values, 'handle').replace(/^@+/, '');
      const isLink = /^https?:\/\//i.test(handle);
      return (
        <div className="screen">
          <div className="browser-bar">{network.label}</div>
          <div className="contact">
            <span className="avatar avatar--large">{handle && !isLink ? handle.charAt(0).toUpperCase() : '@'}</span>
            <p className="contact__name">
              {handle ? isLink ? hostOf(handle) : `@${handle}` : <Placeholder>@seuperfil</Placeholder>}
            </p>
            <p className="contact__role">Perfil no {network.label}</p>
          </div>
          <div className="profile-stats" aria-hidden="true">
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
          </div>
          <span className="sheet__button">Seguir</span>
          <div className="profile-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      );
    }
    case 'video': {
      const url = v(values, 'url');
      return (
        <div className="screen screen--video">
          <div className="browser-bar">{url ? hostOf(url) : <Placeholder>youtube.com</Placeholder>}</div>
          <div className="player">
            <span className="player__play" aria-hidden="true" />
            <span className="player__bar" aria-hidden="true" />
          </div>
          <span className="skeleton" />
          <span className="skeleton skeleton--short" />
        </div>
      );
    }
    case 'text':
      return (
        <div className="screen screen--note">
          <p className="note">{v(values, 'text') || <Placeholder>Seu texto aparece aqui.</Placeholder>}</p>
        </div>
      );
    case 'wifi': {
      const ssid = v(values, 'ssid');
      return (
        <div className="screen screen--center">
          <div className="sheet">
            <span className="sheet__icon">
              <TypeIcon type="wifi" />
            </span>
            <p className="sheet__title">Conectar à rede</p>
            <p className="sheet__big">{ssid || <Placeholder>Nome da rede</Placeholder>}</p>
            <p className="sheet__meta">{values.encryption === 'nopass' ? 'Rede aberta' : 'Senha incluída no código'}</p>
            <span className="sheet__button">Conectar</span>
          </div>
        </div>
      );
    }
    case 'vcard': {
      const name = v(values, 'name');
      const rows = [
        ['Celular', v(values, 'phone')],
        ['E-mail', v(values, 'email')],
        ['Site', v(values, 'website')],
        ['Endereço', v(values, 'address')],
      ].filter(([, value]) => value);
      return (
        <div className="screen">
          <div className="contact">
            <span className="avatar avatar--large">{name ? name.charAt(0).toUpperCase() : <PersonGlyph />}</span>
            <p className="contact__name">{name || <Placeholder>Nome</Placeholder>}</p>
            <p className="contact__role">{[v(values, 'role'), v(values, 'org')].filter(Boolean).join(' · ')}</p>
          </div>
          <dl className="rows">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <span className="sheet__button">Salvar contato</span>
        </div>
      );
    }
    case 'pix': {
      const amount = formatMoney(v(values, 'amount'));
      return (
        <div className="screen screen--center">
          <div className="sheet">
            <p className="sheet__title">Pagar com PIX</p>
            <p className="sheet__amount">{amount || 'Valor livre'}</p>
            <p className="sheet__big sheet__big--small">{v(values, 'name') || <Placeholder>Recebedor</Placeholder>}</p>
            <p className="sheet__meta">{v(values, 'city') || 'Cidade'}</p>
            <span className="sheet__button">Pagar</span>
          </div>
        </div>
      );
    }
    case 'email':
      return (
        <div className="screen">
          <div className="compose">
            <p>
              <span>Para</span>
              {v(values, 'to') || <Placeholder>contato@exemplo.com</Placeholder>}
            </p>
            <p>
              <span>Assunto</span>
              {v(values, 'subject') || <Placeholder>Sem assunto</Placeholder>}
            </p>
            <p className="compose__body">{v(values, 'body') || <Placeholder>Mensagem</Placeholder>}</p>
          </div>
        </div>
      );
    case 'sms':
    case 'whatsapp': {
      const number = v(values, 'number');
      const message = v(values, 'message');
      return (
        <div className={`screen screen--chat${type.id === 'whatsapp' ? ' screen--whatsapp' : ''}`}>
          <div className="chat-head">
            <span className="avatar">
              <PersonGlyph />
            </span>
            <span className="chat-head__name">{number || <Placeholder>Número</Placeholder>}</span>
          </div>
          <div className="chat-body">{message ? <p className="bubble">{message}</p> : null}</div>
          <div className="chat-input">
            <span>{message ? '' : 'Mensagem'}</span>
          </div>
        </div>
      );
    }
    case 'phone': {
      const number = v(values, 'number');
      return (
        <div className="screen screen--call">
          <span className="avatar avatar--large">
            <PersonGlyph />
          </span>
          <p className="call__number">{number || <Placeholder>Número</Placeholder>}</p>
          <p className="call__meta">Toque para ligar</p>
          <span className="call__button" aria-hidden="true">
            <TypeIcon type="phone" />
          </span>
        </div>
      );
    }
    case 'geo': {
      const lat = v(values, 'latitude');
      const lng = v(values, 'longitude');
      return (
        <div className="screen screen--map">
          <div className="map">
            <span className="map__pin">
              <TypeIcon type="geo" />
            </span>
          </div>
          <div className="map__card">
            <p className="sheet__title">Local marcado</p>
            <p className="map__coords">
              {lat && lng ? `${lat}, ${lng}` : <Placeholder>Latitude, longitude</Placeholder>}
            </p>
            <span className="sheet__button">Abrir no mapa</span>
          </div>
        </div>
      );
    }
    case 'event': {
      const when = formatDate(v(values, 'startDate'), v(values, 'startTime'));
      return (
        <div className="screen">
          <div className="event">
            <span className="event__bar" />
            <p className="event__title">{v(values, 'title') || <Placeholder>Título do evento</Placeholder>}</p>
            <p className="event__meta">{when || 'Data e hora'}</p>
            {v(values, 'location') ? <p className="event__meta">{v(values, 'location')}</p> : null}
            {v(values, 'description') ? <p className="event__text">{v(values, 'description')}</p> : null}
          </div>
          <span className="sheet__button">Adicionar à agenda</span>
        </div>
      );
    }
  }
}

export default function PhonePreview({ type, values }: PhonePreviewProps) {
  return (
    <figure data-slot="phone-preview" className="phone" style={{ '--hue': TYPE_HUE[type.id] } as CSSProperties}>
      <div className="phone__frame">
        <span className="phone__notch" aria-hidden="true" />
        <Screen type={type} values={values} />
      </div>
      <figcaption className="phone__caption">O que aparece para quem escanear</figcaption>
    </figure>
  );
}
