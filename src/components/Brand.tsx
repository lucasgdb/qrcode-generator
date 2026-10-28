import { cn } from 'cn';

export interface BrandProps {
  className?: string;
}

/** The product's mark and name. */
export default function Brand({ className }: BrandProps) {
  return (
    <span className={cn('brand', className)} data-slot="brand" translate="no">
      <svg className="brand__mark" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
        <rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1.2" fill="#fff" />
        <rect x="13" y="6.5" width="4.5" height="4.5" rx="1.2" fill="#fff" />
        <rect x="6.5" y="13" width="4.5" height="4.5" rx="1.2" fill="#fff" />
        <rect x="13.5" y="13.5" width="3.5" height="3.5" rx="1" fill="#fff" />
      </svg>
      Gerador de QR
    </span>
  );
}
