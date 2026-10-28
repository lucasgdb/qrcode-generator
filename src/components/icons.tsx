import type { ReactNode, SVGProps } from 'react';

import type { QrTypeId } from '../lib/types';

type IconProps = SVGProps<SVGSVGElement>;

const ui = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const glyph = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...ui} {...props}>
      <path d="M8 2.5v7.5" />
      <path d="m4.75 7 3.25 3.25L11.25 7" />
      <path d="M3 13h10" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...ui} {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5v-1a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4.5v5A1.5 1.5 0 0 0 4 11h1" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...ui} {...props}>
      <path d="M13 8H3" />
      <path d="M7 4 3 8l4 4" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...ui} {...props}>
      <path d="M3 8h10" />
      <path d="m9 4 4 4-4 4" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...ui} {...props}>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...glyph} {...props}>
      <path d="M12 15V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

/** A neutral person silhouette for contacts without a photo, cropped by the round avatar. */
export function PersonGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="20" cy="15.5" r="7.5" />
      <path d="M4 41c0-9 7.2-15.5 16-15.5S36 32 36 41Z" />
    </svg>
  );
}

const TYPE_GLYPHS: Record<QrTypeId, ReactNode> = {
  social: (
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="m8.2 13.2 7.6 4.1" />
      <path d="m15.8 6.7-7.6 4.1" />
    </>
  ),
  video: (
    <>
      <rect x="2.75" y="6" width="13" height="12" rx="2.5" />
      <path d="m15.75 10.5 5.5-3v9l-5.5-3" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </>
  ),
  text: (
    <>
      <path d="M5 6.5V5h14v1.5" />
      <path d="M12 5v14" />
      <path d="M9 19h6" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0 1 19 0" />
      <path d="M5.5 12.5a9.5 9.5 0 0 1 13 0" />
      <path d="M8.75 16a5 5 0 0 1 6.5 0" />
      <path d="M12 19.5h.01" strokeWidth={2.5} />
    </>
  ),
  vcard: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <circle cx="12" cy="10" r="2.75" />
      <path d="M7.5 17.5a4.75 4.75 0 0 1 9 0" />
    </>
  ),
  pix: (
    <>
      <path d="M7.4 7.2 10.6 4a2 2 0 0 1 2.8 0l3.2 3.2" />
      <path d="M16.8 16.8 13.4 20a2 2 0 0 1-2.8 0l-3.2-3.2" />
      <path d="M5.2 8.6h1.5c.8 0 1.5.3 2.1.9l2.1 2.1a1.6 1.6 0 0 0 2.2 0l2.1-2.1c.6-.6 1.3-.9 2.1-.9h1.5" />
      <path d="M5.2 15.4h1.5c.8 0 1.5-.3 2.1-.9l2.1-2.1a1.6 1.6 0 0 1 2.2 0l2.1 2.1c.6.6 1.3.9 2.1.9h1.5" />
      <path d="m5.2 8.6-1.2 1.2a3.1 3.1 0 0 0 0 4.4l1.2 1.2" />
      <path d="m18.8 8.6 1.2 1.2a3.1 3.1 0 0 1 0 4.4l-1.2 1.2" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  sms: (
    <>
      <path d="M20 15.5a2 2 0 0 1-2 2H8.5L4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
      <path d="M8.5 9h7" />
      <path d="M8.5 12.5h4.5" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.6 20.4 4.9 16a8.6 8.6 0 1 1 3.1 3.1Z" />
      <path d="M9.1 7.9c.3-.3.8-.3 1 .1l.8 1.7c.1.3.1.6-.1.8l-.6.6c.6 1.3 1.6 2.3 2.9 2.9l.6-.6c.2-.2.5-.3.8-.1l1.7.8c.4.2.4.7.1 1l-.6.6c-.6.6-1.6.8-2.4.4a9.3 9.3 0 0 1-4.6-4.6c-.4-.8-.2-1.8.4-2.4Z" />
    </>
  ),
  phone: (
    <path d="M20.5 16.4v2.6a1.75 1.75 0 0 1-1.9 1.75A17.3 17.3 0 0 1 3.25 5.4 1.75 1.75 0 0 1 5 3.5h2.6a1.75 1.75 0 0 1 1.75 1.5c.12.9.34 1.78.66 2.62a1.75 1.75 0 0 1-.4 1.85L8.5 10.6a14 14 0 0 0 4.9 4.9l1.13-1.11a1.75 1.75 0 0 1 1.85-.4c.84.32 1.72.54 2.62.66a1.75 1.75 0 0 1 1.5 1.75Z" />
  ),
  geo: (
    <>
      <path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  event: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01M16 16.5h.01" strokeWidth={2.4} />
    </>
  ),
};

export function TypeIcon({ type, ...props }: IconProps & { type: QrTypeId }) {
  return (
    <svg {...glyph} {...props}>
      {TYPE_GLYPHS[type]}
    </svg>
  );
}
