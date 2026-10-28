import { SOCIAL_NETWORKS, type QrTypeId } from './types';

function value(values: Record<string, string>, key: string): string {
  return (values[key] ?? '').trim();
}

function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  return `https://${url}`;
}

function stripAccents(raw: string): string {
  return raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function escapeWifi(raw: string): string {
  return raw.replace(/([\\;,:"])/g, '\\$1');
}

function escapeVCard(raw: string): string {
  return raw.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function escapeCalendar(raw: string): string {
  return raw.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function phoneValue(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '');
}

function parseCoordinate(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildWifi(values: Record<string, string>): string {
  const ssid = value(values, 'ssid');
  if (!ssid) return '';

  const encryption = value(values, 'encryption') || 'WPA';
  const password = value(values, 'password');
  const hidden = value(values, 'hidden') === 'true';

  let payload = `WIFI:T:${encryption};S:${escapeWifi(ssid)};`;
  if (encryption !== 'nopass' && password) {
    payload += `P:${escapeWifi(password)};`;
  }
  if (hidden) payload += 'H:true;';
  return `${payload};`;
}

function buildVCard(values: Record<string, string>): string {
  const name = value(values, 'name');
  if (!name) return '';

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:;${escapeVCard(name)};;;`, `FN:${escapeVCard(name)}`];

  const org = value(values, 'org');
  const role = value(values, 'role');
  const phone = value(values, 'phone');
  const email = value(values, 'email');
  const website = value(values, 'website');
  const address = value(values, 'address');

  if (org) lines.push(`ORG:${escapeVCard(org)}`);
  if (role) lines.push(`TITLE:${escapeVCard(role)}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
  if (website) lines.push(`URL:${escapeVCard(normalizeUrl(website))}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

function normalizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '.');
  if (!cleaned) return '';
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 99_999_999.99) return '';
  return parsed.toFixed(2);
}

function pixField(id: string, raw: string): string {
  const length = new TextEncoder().encode(raw).length;
  return `${id}${String(length).padStart(2, '0')}${raw}`;
}

/** CRC16/CCITT-FALSE, the checksum required by the PIX BR Code. */
export function crc16(payload: string): string {
  const bytes = new TextEncoder().encode(payload);
  let crc = 0xffff;

  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildPix(values: Record<string, string>): string {
  const key = value(values, 'key');
  const name = stripAccents(value(values, 'name'))
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 25);
  const city = stripAccents(value(values, 'city'))
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15);

  if (!key || !name || !city) return '';

  const merchantAccount = pixField('00', 'BR.GOV.BCB.PIX') + pixField('01', key);
  const amount = normalizeAmount(value(values, 'amount'));
  const txid =
    value(values, 'txid')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 25) || '***';

  let payload = pixField('00', '01');
  payload += pixField('26', merchantAccount);
  payload += pixField('52', '0000');
  payload += pixField('53', '986');
  if (amount) payload += pixField('54', amount);
  payload += pixField('58', 'BR');
  payload += pixField('59', name);
  payload += pixField('60', city);
  payload += pixField('62', pixField('05', txid));
  payload += '6304';

  return payload + crc16(payload);
}

function buildEmail(values: Record<string, string>): string {
  const to = value(values, 'to');
  if (!to) return '';

  const params: string[] = [];
  const subject = value(values, 'subject');
  const body = value(values, 'body');
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
}

function buildSms(values: Record<string, string>): string {
  const number = phoneValue(value(values, 'number'));
  if (!number) return '';
  return `SMSTO:${number}:${value(values, 'message')}`;
}

function buildWhatsApp(values: Record<string, string>): string {
  const number = digitsOnly(value(values, 'number'));
  if (number.length < 8) return '';
  const message = value(values, 'message');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${query}`;
}

function buildPhone(values: Record<string, string>): string {
  const number = phoneValue(value(values, 'number'));
  return number ? `tel:${number}` : '';
}

function buildGeo(values: Record<string, string>): string {
  const latitude = parseCoordinate(value(values, 'latitude'));
  const longitude = parseCoordinate(value(values, 'longitude'));
  if (latitude === null || longitude === null) return '';
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return '';
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function buildEvent(values: Record<string, string>): string {
  const title = value(values, 'title');
  const startDate = value(values, 'startDate');
  const startTime = value(values, 'startTime');
  if (!title || !startDate || !startTime) return '';

  const start = `${startDate.replaceAll('-', '')}T${startTime.replace(':', '')}00`;
  const endDate = value(values, 'endDate');
  const endTime = value(values, 'endTime');
  const end = endDate && endTime ? `${endDate.replaceAll('-', '')}T${endTime.replace(':', '')}00` : '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QR Code Generator//PT-BR//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@qrcode-generator`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${escapeCalendar(title)}`,
  ];

  const location = value(values, 'location');
  if (location) lines.push(`LOCATION:${escapeCalendar(location)}`);

  lines.push(`DTSTART:${start}`);
  if (end) lines.push(`DTEND:${end}`);

  const description = value(values, 'description');
  if (description) lines.push(`DESCRIPTION:${escapeCalendar(description)}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

function buildSocial(values: Record<string, string>): string {
  const handle = value(values, 'handle');
  if (!handle) return '';
  // A pasted profile link is used as it is.
  if (/^https?:\/\//i.test(handle) || /\.[a-z]{2,}\//i.test(handle)) return normalizeUrl(handle);
  const network = SOCIAL_NETWORKS.find((item) => item.value === value(values, 'network')) ?? SOCIAL_NETWORKS[0];
  const clean = handle.replace(/^@+/, '').replace(/\s+/g, '');
  return clean ? network.url(encodeURIComponent(clean).replace(/%2F/gi, '/')) : '';
}

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i;

function buildVideo(values: Record<string, string>): string {
  const url = normalizeUrl(value(values, 'url'));
  if (!url) return '';
  // youtu.be links are a third shorter, which means a smaller, easier-to-scan code.
  const youtube = YOUTUBE_ID.exec(url);
  if (youtube) {
    const time = /[?&]t=(\d+)/.exec(url);
    return `https://youtu.be/${youtube[1]}${time ? `?t=${time[1]}` : ''}`;
  }
  return url;
}

export function buildPayload(type: QrTypeId, values: Record<string, string>): string {
  switch (type) {
    case 'link':
      return normalizeUrl(value(values, 'url'));
    case 'social':
      return buildSocial(values);
    case 'video':
      return buildVideo(values);
    case 'text':
      return value(values, 'text');
    case 'wifi':
      return buildWifi(values);
    case 'vcard':
      return buildVCard(values);
    case 'pix':
      return buildPix(values);
    case 'email':
      return buildEmail(values);
    case 'sms':
      return buildSms(values);
    case 'whatsapp':
      return buildWhatsApp(values);
    case 'phone':
      return buildPhone(values);
    case 'geo':
      return buildGeo(values);
    case 'event':
      return buildEvent(values);
    default:
      return '';
  }
}
