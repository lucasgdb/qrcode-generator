import type { QrTypeId } from './types';

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
