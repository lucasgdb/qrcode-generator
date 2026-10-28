import { FileText, Lightbulb } from 'lucide-react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import ContentStep from '../components/ContentStep';
import DesignStep from '../components/DesignStep';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon, DownloadIcon } from '../components/icons';
import MiniPreview from '../components/MiniPreview';
import PhonePreview from '../components/PhonePreview';
import QrPreview from '../components/QrPreview';
import SegmentedControl from '../components/SegmentedControl';
import Seo from '../components/Seo';
import Stepper from '../components/Stepper';
import TypePicker from '../components/TypePicker';
import { TYPE_HUE } from '../lib/type-hue';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { useQrStudio } from '../hooks/useQrStudio';
import { routeFromSegments, useRoute, type Route, type Step } from '../hooks/useRoute';
import { copyPngToClipboard, downloadBlob, rasterizeSvg, toFileName } from '../lib/export';
import { buildGeometry, renderQrSvg } from '../lib/qr';
import { auditQr } from '../lib/scan';
import { DEFAULT_STYLE, QR_TYPE_BY_ID, QR_TYPES, type ExportFormat, type QrTypeId } from '../lib/types';

const EXTENSION: Record<ExportFormat, string> = { png: 'png', svg: 'svg', jpeg: 'jpg' };
const SIZES = [512, 1024, 2048, 4096];

interface HomeProps {
  /** The step and type this URL opens on, known at build time so the HTML is already on the right step. */
  route: Route;
}

export default function Home({ route }: HomeProps) {
  const studio = useQrStudio(route.type ?? 'link');
  const { step, routeType, goTo } = useRoute(route, studio.setType);
  const [toast, setToast] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const actionsEndRef = useRef<HTMLDivElement>(null);
  const [actionsFloating, setActionsFloating] = useState(false);
  // Step motion (progress line, dots) waits until the page has settled on its first route, so a
  // reload or a shared link that opens on step 2 or 3 shows it in place instead of animating to it.
  const [motionReady, setMotionReady] = useState(false);
  // Required-field errors show only after a first attempt to continue, and reset per type.
  const [showErrors, setShowErrors] = useState(false);
  const [errorsForType, setErrorsForType] = useState(studio.state.type);
  if (errorsForType !== studio.state.type) {
    setErrorsForType(studio.state.type);
    setShowErrors(false);
  }

  const typeDef = QR_TYPE_BY_ID[studio.state.type];
  const { style, exportPrefs } = studio.state;
  // Sliders and colour pickers fire on every frame; the drawing follows without holding them up.
  const drawnStyle = useDeferredValue(style);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const geometry = useMemo(
    () => (studio.matrix?.ok ? buildGeometry(studio.matrix.matrix, drawnStyle) : null),
    [studio.matrix, drawnStyle],
  );

  const preview = useMemo(
    () => (geometry ? renderQrSvg({ geometry, style: drawnStyle, label: `QR Code de ${typeDef.label}` }) : null),
    [geometry, drawnStyle, typeDef.label],
  );

  const audit = useMemo(() => {
    const ok = studio.matrix?.ok ? studio.matrix.matrix : null;
    return auditQr({
      style,
      count: ok?.count ?? 0,
      version: ok?.version ?? 0,
      hasContent: Boolean(studio.payload),
      overflow: studio.matrix !== null && !studio.matrix.ok,
    });
  }, [studio.matrix, studio.payload, style]);

  const canDownload = studio.hydrated && Boolean(studio.payload) && Boolean(studio.matrix?.ok);
  const canReach = useCallback((target: Step) => target < step, [step]);

  const renderExport = useCallback(() => {
    if (!studio.matrix?.ok) return null;
    return renderQrSvg({
      geometry: buildGeometry(studio.matrix.matrix, style),
      style,
      pixelWidth: exportPrefs.size,
      label: `QR Code de ${typeDef.label}`,
    });
  }, [exportPrefs.size, studio.matrix, style, typeDef.label]);

  const handleDownload = useCallback(async () => {
    const rendered = renderExport();
    if (!rendered || downloading) return;

    setDownloading(true);
    try {
      const filename = `${toFileName(exportPrefs.filename, `qr-code-${typeDef.id}`)}.${EXTENSION[exportPrefs.format]}`;
      const height = Math.round(exportPrefs.size * rendered.aspect);

      if (exportPrefs.format === 'svg') {
        downloadBlob(new Blob([rendered.svg], { type: 'image/svg+xml;charset=utf-8' }), filename);
      } else {
        const mime = exportPrefs.format === 'jpeg' ? 'image/jpeg' : 'image/png';
        downloadBlob(await rasterizeSvg(rendered.svg, exportPrefs.size, height, mime, style.bg), filename);
      }

      showToast(`Baixado: ${filename}`);
    } catch {
      showToast('Não foi possível gerar o arquivo. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  }, [downloading, exportPrefs, renderExport, showToast, style.bg, typeDef.id]);

  const handleCopyImage = useCallback(async () => {
    const rendered = renderExport();
    if (!rendered) return;

    setCopying(true);
    try {
      const height = Math.round(exportPrefs.size * rendered.aspect);
      const blob = await rasterizeSvg(rendered.svg, exportPrefs.size, height, 'image/png', style.bg);
      const copied = await copyPngToClipboard(blob);
      showToast(copied ? 'Imagem copiada. Cole onde quiser.' : 'Seu navegador não liberou a cópia. Use Baixar.');
    } catch {
      showToast('Não foi possível copiar a imagem. Use Baixar para salvar o arquivo.');
    } finally {
      setCopying(false);
    }
  }, [exportPrefs.size, renderExport, showToast, style.bg]);

  const handleCopyPayload = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(studio.payload);
      return true;
    } catch {
      showToast('Não foi possível copiar. Abra o conteúdo e selecione o texto para copiar.');
      return false;
    }
  }, [showToast, studio.payload]);

  const handlePickType = useCallback((type: QrTypeId) => goTo(2, type), [goTo]);

  // The design step needs content; if it is ever reached without (forward into an old history
  // entry after a reload, since typed content is never stored), the content step takes its place.
  const { hydrated, hasContent } = studio;
  useEffect(() => {
    if (hydrated && step === 3 && !hasContent) goTo(2, undefined, { replace: true });
  }, [goTo, hasContent, hydrated, step]);

  useEffect(() => {
    if (!studio.hydrated) return;
    let second = 0;
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setMotionReady(true));
    });
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(second);
    };
  }, [studio.hydrated]);

  // On wide screens the action bar sticks to the bottom of the window, so "Avançar" is in
  // sight from the top of the form. A marker right after the bar tells when it floats over
  // the content (marker below the window) and needs its own background and edge.
  useEffect(() => {
    const marker = actionsEndRef.current;
    if (!marker || typeof IntersectionObserver === 'undefined') return;
    // The marker ends the page, flush with the window's bottom edge once scrolled to the end;
    // a little slack keeps it from reading as off screen on fractional scroll positions.
    const observer = new IntersectionObserver(
      ([entry]) => setActionsFloating(!entry.isIntersecting && entry.boundingClientRect.top > 0),
      { rootMargin: '0px 0px 4px 0px' },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [step, hydrated]);

  // "Avançar" stays enabled: a click with missing content points at the field to fix.
  const handleNext = useCallback(() => {
    if (studio.hasContent && studio.matrix?.ok) {
      goTo(3);
      return;
    }
    if (studio.matrix && !studio.matrix.ok) {
      showToast(`${studio.matrix.reason} Encurte o texto para continuar.`);
      return;
    }
    setShowErrors(true);
    window.requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>('.workspace__main [aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      else showToast(`${typeDef.emptyHint} Confira os campos para continuar.`);
    });
  }, [goTo, showToast, studio.hasContent, studio.matrix, typeDef.emptyHint]);

  // Ctrl/Cmd+S downloads the code instead of saving the page.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (canDownload) void handleDownload();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canDownload, handleDownload]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Seo type={step === 1 ? null : routeType} />

      <div className="app" data-step={step} data-motion={motionReady || undefined}>
        {/* The hash holds the route, so the skip link moves focus instead of following its href. */}
        <a
          className="skip-link"
          href="#conteudo"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById('conteudo')?.focus();
          }}
        >
          Pular para o conteúdo
        </a>
        <header className="masthead">
          <Stepper step={step} type={studio.state.type} canReach={canReach} onStep={goTo} />
        </header>

        <main className="main" id="conteudo" tabIndex={-1}>
          {step === 1 ? (
            <TypePicker onSelect={handlePickType} />
          ) : (
            <div className="workspace">
              <div className="workspace__main">
                {step === 2 ? (
                  <ContentStep
                    type={typeDef}
                    values={studio.currentValues}
                    onValueChange={studio.setValue}
                    onExample={studio.applyExample}
                    onChangeType={() => goTo(1)}
                    name={exportPrefs.filename}
                    onNameChange={(filename) => studio.patchExport({ filename })}
                    extension={EXTENSION[exportPrefs.format]}
                    showErrors={showErrors}
                  />
                ) : (
                  <>
                    <DesignStep
                      style={style}
                      onChange={studio.patchStyle}
                      onError={showToast}
                      onReset={() => studio.patchStyle({ ...DEFAULT_STYLE, logo: style.logo })}
                      audit={audit}
                      hue={TYPE_HUE[typeDef.id]}
                    />

                    <section className="card card--form" aria-labelledby="file-title">
                      <div className="card__band">
                        <div className="card__heading">
                          <h2 id="file-title" className="card__title">
                            Arquivo
                          </h2>
                          <p className="card__description">Formato e tamanho do arquivo que você vai baixar.</p>
                        </div>
                      </div>
                      <div className="card__body">
                        <div className="file-grid">
                          <SegmentedControl<ExportFormat>
                            label="Formato"
                            value={exportPrefs.format}
                            options={[
                              { value: 'png', label: 'PNG' },
                              { value: 'svg', label: 'SVG' },
                              { value: 'jpeg', label: 'JPEG' },
                            ]}
                            onChange={(format) => studio.patchExport({ format })}
                          />
                          <div className="field">
                            <Label className="field__label" id="export-size-label">
                              Largura
                            </Label>
                            {exportPrefs.format === 'svg' ? (
                              <output aria-labelledby="export-size-label" className="static-value">
                                Vetorial, sem limite de tamanho
                              </output>
                            ) : (
                              <Select
                                items={SIZES.map((size) => ({ value: String(size), label: `${size} px` }))}
                                value={String(exportPrefs.size)}
                                onValueChange={(next) => next && studio.patchExport({ size: Number(next) })}
                              >
                                <SelectTrigger aria-labelledby="export-size-label">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SIZES.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                      {size} × {size} px
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="form-status">
                        <FileText aria-hidden="true" />
                        <span translate="no">
                          {toFileName(exportPrefs.filename, `qr-code-${typeDef.id}`)}.{EXTENSION[exportPrefs.format]}
                        </span>
                      </p>
                    </section>

                    <aside className="tips" aria-labelledby="print-tips-title">
                      <span className="tips__icon" aria-hidden="true">
                        <Lightbulb />
                      </span>
                      <div>
                        <h2 id="print-tips-title" className="tips__title">
                          Antes de imprimir
                        </h2>
                        <ul className="tips__list">
                          <li>Teste a leitura com dois celulares diferentes.</li>
                          <li>Prefira PNG em 2048 px ou SVG para cartazes e embalagens.</li>
                          <li>Deixe espaço livre em volta do código no material impresso.</li>
                        </ul>
                      </div>
                    </aside>
                  </>
                )}

                <div className="actions" data-floating={actionsFloating || undefined}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon-xl"
                          onClick={() => goTo(step === 3 ? 2 : 1)}
                          aria-label="Voltar"
                        />
                      }
                    >
                      <ArrowLeftIcon />
                    </TooltipTrigger>
                    <TooltipContent>Voltar</TooltipContent>
                  </Tooltip>

                  {step === 2 ? (
                    <Button size="xl" className="actions__main" onClick={handleNext}>
                      Avançar
                      <ArrowRightIcon />
                    </Button>
                  ) : (
                    <>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon-xl"
                              className="actions__secondary"
                              onClick={handleCopyImage}
                              disabled={!canDownload || copying}
                              aria-label="Copiar como imagem"
                            />
                          }
                        >
                          <CopyIcon />
                        </TooltipTrigger>
                        <TooltipContent>Copiar como imagem</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              size="xl"
                              className="actions__main"
                              onClick={handleDownload}
                              disabled={!canDownload || downloading}
                              aria-keyshortcuts="Control+S Meta+S"
                            />
                          }
                        >
                          <DownloadIcon />
                          {downloading ? 'Gerando…' : `Baixar ${exportPrefs.format.toUpperCase()}`}
                        </TooltipTrigger>
                        <TooltipContent>Atalho: Ctrl+S</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
                <div ref={actionsEndRef} className="actions-end" aria-hidden="true" />
              </div>

              <aside className="workspace__preview" aria-label="Pré-visualização">
                <div className="workspace__sticky">
                  <h2 className="preview-title">Pré-visualização</h2>
                  {step === 2 ? (
                    <PhonePreview type={typeDef} values={studio.currentValues} />
                  ) : (
                    <QrPreview
                      svg={preview?.svg ?? null}
                      aspect={preview?.aspect ?? 1}
                      matrix={studio.matrix}
                      geometry={geometry}
                      payload={studio.payload}
                      audit={audit}
                      emptyHint={typeDef.emptyHint}
                      artRef={artRef}
                      onCopyPayload={handleCopyPayload}
                    />
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>

      {studio.hydrated && step === 3 ? <MiniPreview target={artRef} svg={preview?.svg ?? null} /> : null}

      <div className="toast-region" role="status" aria-live="polite">
        {toast ? (
          <div className="toast" key={toast}>
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}

/** Every address the wizard has, built ahead of time: "/" and one "/<type>" per type. */
export const getStaticPaths: GetStaticPaths = () => ({
  paths: [{ params: { route: [] } }, ...QR_TYPES.map((type) => ({ params: { route: [type.id] } }))],
  fallback: false,
});

export const getStaticProps: GetStaticProps<HomeProps> = ({ params }) => {
  return { props: { route: routeFromSegments(params?.route as string[] | undefined) } };
};
