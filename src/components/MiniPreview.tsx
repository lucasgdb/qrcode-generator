import { useEffect, useState, type RefObject } from 'react';

export interface MiniPreviewProps {
  target: RefObject<HTMLElement | null>;
  svg: string | null;
}

/**
 * On a phone the design controls push the code off screen. This keeps the live
 * code in the corner while options change; a tap goes back to the full preview.
 * Hidden by CSS on wide screens, where the preview never leaves the screen.
 */
export default function MiniPreview({ target, svg }: MiniPreviewProps) {
  const [offscreen, setOffscreen] = useState(false);
  const hasSvg = svg !== null;

  useEffect(() => {
    const element = target.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [target, hasSvg]);

  if (!svg) return null;

  return (
    <button
      type="button"
      data-slot="mini-preview"
      className="mini-preview"
      data-visible={offscreen}
      tabIndex={offscreen ? 0 : -1}
      aria-hidden={!offscreen}
      aria-label="Ver a prévia do QR Code"
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: svg }} />
    </button>
  );
}
