import { useEffect, useRef, useState, type Ref } from 'react';

import { minPrintCentimeters, type MatrixResult, type QrGeometry } from '../lib/qr';
import { formatDecimal, formatRatio, type ScanAudit } from '../lib/scan';
import { Button } from './ui/button';

export interface QrPreviewProps {
  svg: string | null;
  aspect: number;
  matrix: MatrixResult | null;
  geometry: QrGeometry | null;
  payload: string;
  audit: ScanAudit;
  emptyHint: string;
  artRef?: Ref<HTMLDivElement>;
  onCopyPayload(): Promise<boolean>;
}

export default function QrPreview({
  svg,
  aspect,
  matrix,
  geometry,
  payload,
  audit,
  emptyHint,
  artRef,
  onCopyPayload,
}: QrPreviewProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    if (!(await onCopyPayload())) return;
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  const overflow = matrix !== null && !matrix.ok;

  return (
    <figure className="qr-preview" data-slot="qr-preview">
      <div className="qr-preview__art" ref={artRef}>
        {svg ? (
          <div
            className="qr-preview__svg"
            style={{ aspectRatio: `1 / ${aspect}` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="qr-preview__empty">
            <p className="qr-preview__empty-title">{overflow ? 'Conteúdo longo demais' : 'Falta o conteúdo'}</p>
            <p>{overflow && matrix ? matrix.reason : emptyHint}</p>
          </div>
        )}
      </div>

      {svg && matrix?.ok && geometry ? (
        <figcaption className="qr-preview__meta">
          <p className={`status status--${audit.level}`} role="status">
            <span className="status__dot" aria-hidden="true" />
            {audit.title}
          </p>

          {audit.notices.length > 0 ? (
            <ul className="notices">
              {audit.notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          ) : null}

          <dl className="facts">
            <div>
              <dt>Largura mín.</dt>
              <dd>{formatDecimal(minPrintCentimeters(geometry.total))}&nbsp;cm</dd>
            </div>
            <div>
              <dt>Módulos</dt>
              <dd>
                {matrix.matrix.count}×{matrix.matrix.count}
              </dd>
            </div>
            <div>
              <dt>Contraste</dt>
              <dd>{formatRatio(audit.contrast)}:1</dd>
            </div>
          </dl>

          <details className="payload">
            <summary>Ver conteúdo codificado</summary>
            <pre>{payload}</pre>
            <Button variant="link" onClick={copy}>
              {copied ? 'Copiado' : 'Copiar conteúdo'}
            </Button>
          </details>
        </figcaption>
      ) : null}
    </figure>
  );
}
