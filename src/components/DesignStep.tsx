import { CircleAlert, CircleCheck, Frame, ImagePlus, Palette, RotateCcw, Shapes, type LucideIcon } from 'lucide-react';
import { useMemo, useRef, useState, type CSSProperties } from 'react';

import { UploadIcon } from './icons';
import { OptionGroup, OptionItem } from './OptionGroup';
import SegmentedControl from './SegmentedControl';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { processLogoFile } from '../lib/export';
import { buildGeometry, generateMatrix, renderQrSvg, type QrGeometry } from '../lib/qr';
import { contrastRatio, formatRatio, normalizeHex, type ScanAudit } from '../lib/scan';
import {
  COLOR_PRESETS,
  EYE_SHAPE_LABELS,
  FRAMES,
  MODULE_SHAPE_LABELS,
  type ErrorCorrection,
  type EyeShape,
  type FrameId,
  type ModuleShape,
  type QrStyle,
} from '../lib/types';

type DesignTab = 'frame' | 'colors' | 'shape' | 'logo';

export interface DesignStepProps {
  style: QrStyle;
  onChange(patch: Partial<QrStyle>): void;
  onError(message: string): void;
  /** Puts every design option back to its default. */
  onReset(): void;
  /** The live readability check, shown at the foot of the options card. */
  audit: ScanAudit;
  /** The chosen type's colour, for the step's icon. */
  hue: string;
}

const TABS: { id: DesignTab; label: string; description: string; Icon: LucideIcon }[] = [
  {
    id: 'frame',
    label: 'Moldura',
    description: 'Uma moldura com chamada mostra que o código é para ser escaneado.',
    Icon: Frame,
  },
  { id: 'colors', label: 'Cores', description: 'Código escuro sobre fundo claro é o que lê melhor.', Icon: Palette },
  {
    id: 'shape',
    label: 'Formato',
    description: 'O desenho dos módulos e dos cantos, a margem e a correção.',
    Icon: Shapes,
  },
  { id: 'logo', label: 'Logo', description: 'Sua marca no centro, sem atrapalhar a leitura.', Icon: ImagePlus },
];

const FRAME_COLORS = ['#171717', '#2563eb', '#0e8a6a', '#d7263d', '#b45309'];
const FRAME_COLOR_NAMES: Record<string, string> = {
  '#171717': 'preta',
  '#2563eb': 'azul',
  '#0e8a6a': 'verde',
  '#d7263d': 'vermelha',
  '#b45309': 'laranja',
};

const CORRECTION_HINT: Record<ErrorCorrection, string> = {
  L: 'Recupera 7% do código. O mais leve, para telas.',
  M: 'Recupera 15%. Bom equilíbrio para quase tudo.',
  Q: 'Recupera 25%. Use com logo ou em superfícies que gastam.',
  H: 'Recupera 30%. O mais robusto e o mais denso.',
};

// A tiny real code the option tiles are drawn with, so every tile shows the actual result.
let sampleGeometryCache: Map<string, QrGeometry> | null = null;
function sampleGeometry(style: QrStyle): QrGeometry {
  sampleGeometryCache ??= new Map();
  const key = `${style.moduleShape}-${style.eyeShape}`;
  let geometry = sampleGeometryCache.get(key);
  if (!geometry) {
    const matrix = generateMatrix('QR', 'L');
    if (!matrix?.ok) throw new Error('sample');
    geometry = buildGeometry(matrix.matrix, { ...style, margin: 1 });
    sampleGeometryCache.set(key, geometry);
  }
  return geometry;
}

/** One visual option: a real drawing of the result and its name. */
function Tile({ value, svg, label }: { value: string; svg: string; label: string }) {
  return (
    <OptionItem value={value} className="tile">
      <span className="tile__art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
      <span className="tile__label">{label}</span>
    </OptionItem>
  );
}

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange(value: string): void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="color-field">
        <input
          type="color"
          name={`${name}-picker`}
          className="color-field__swatch"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label}: escolher cor`}
        />
        <input
          type="text"
          name={name}
          autoComplete="off"
          className="color-field__hex"
          value={draft ?? value}
          maxLength={7}
          spellCheck={false}
          onChange={(event) => {
            setDraft(event.target.value);
            const normalized = normalizeHex(event.target.value);
            if (normalized) onChange(normalized);
          }}
          onBlur={() => setDraft(null)}
          aria-label={`${label}: código hexadecimal`}
        />
      </div>
    </div>
  );
}

export default function DesignStep({ style, onChange, onError, onReset, audit, hue }: DesignStepProps) {
  const [tab, setTab] = useState<DesignTab>('frame');
  const current = TABS.find((item) => item.id === tab) ?? TABS[0];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const ratio = Math.round(contrastRatio(style.fg, style.bg) * 10) / 10;
  const contrastLevel = ratio >= 4.5 ? 'ok' : ratio >= 3 ? 'warn' : 'bad';

  const frameTiles = useMemo(() => {
    const geometry = sampleGeometry({ ...style, logo: null });
    return FRAMES.map((frame) => ({
      ...frame,
      svg: renderQrSvg({ geometry, style: { ...style, logo: null, frame: frame.id } }).svg,
    }));
  }, [style]);

  const moduleTiles = useMemo(
    () =>
      (Object.keys(MODULE_SHAPE_LABELS) as ModuleShape[]).map((shape) => {
        const tileStyle = { ...style, moduleShape: shape, logo: null, frame: 'none' as const };
        return { shape, svg: renderQrSvg({ geometry: sampleGeometry(tileStyle), style: tileStyle }).svg };
      }),
    [style],
  );

  const eyeTiles = useMemo(
    () =>
      (Object.keys(EYE_SHAPE_LABELS) as EyeShape[]).map((shape) => {
        const tileStyle = { ...style, eyeShape: shape, logo: null, frame: 'none' as const };
        return { shape, svg: renderQrSvg({ geometry: sampleGeometry(tileStyle), style: tileStyle }).svg };
      }),
    [style],
  );

  async function handleFiles(files: FileList | null) {
    const file = files?.item(0);
    if (!file) return;

    setBusy(true);
    try {
      const processed = await processLogoFile(file);
      onChange({
        logo: { dataUrl: processed.dataUrl, name: processed.name, size: style.logo?.size ?? 20 },
        // A logo hides modules; raise the recovery level so the code keeps reading.
        ...(style.errorCorrection === 'L' || style.errorCorrection === 'M' ? { errorCorrection: 'Q' as const } : {}),
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Não foi possível usar esta imagem.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <section
      className="step"
      data-slot="design-step"
      aria-labelledby="design-title"
      style={{ '--hue': hue } as CSSProperties}
    >
      <header className="step__head">
        <span className="step__icon" aria-hidden="true">
          <Palette />
        </span>
        <div className="step__titles">
          <h1 id="design-title" className="title">
            Personalize seu QR Code
          </h1>
          <p className="step__lead">Tudo aparece na prévia na hora. A leitura é conferida a cada mudança.</p>
        </div>
        <Button variant="outline" size="lg" className="rounded-full" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Restaurar padrão
        </Button>
      </header>

      <Tabs value={tab} onValueChange={(next) => setTab(next as DesignTab)}>
        <TabsList variant="pill" className="max-[760px]:flex-nowrap" aria-label="Personalização">
          {TABS.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className="max-[760px]:flex-1 max-[760px]:px-2">
              <item.Icon aria-hidden="true" />
              {item.label}
              {item.id === 'logo' && style.logo ? <span className="pill__dot" aria-label="(com logo)" /> : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value={tab}
          className="card card--form text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <div className="card__band">
            <div className="card__heading">
              <h2 className="card__title">{current.label}</h2>
              <p className="card__description">{current.description}</p>
            </div>
          </div>
          <div className="card__body">
            {tab === 'frame' ? (
              <>
                <OptionGroup<FrameId>
                  label="Moldura"
                  className="tiles tiles--frames"
                  value={style.frame}
                  onValueChange={(frame) => onChange({ frame })}
                >
                  {frameTiles.map((frame) => (
                    <Tile key={frame.id} value={frame.id} svg={frame.svg} label={frame.label} />
                  ))}
                </OptionGroup>

                {style.frame !== 'none' ? (
                  <div className="fields fields--split">
                    <div className="field">
                      <Label className="field__label" htmlFor="frame-text">
                        Texto da moldura
                      </Label>
                      <Input
                        id="frame-text"
                        name="frame-text"
                        autoComplete="off"
                        value={style.frameText}
                        maxLength={24}
                        placeholder="Escaneie-me"
                        onChange={(event) => onChange({ frameText: event.target.value })}
                      />
                    </div>
                    <div className="field">
                      <span className="field__label">Cor da moldura</span>
                      <div className="swatches">
                        <OptionGroup<string>
                          label="Cor da moldura"
                          className="swatch-group"
                          value={FRAME_COLORS.includes(style.frameColor) ? style.frameColor : null}
                          onValueChange={(frameColor) => onChange({ frameColor })}
                        >
                          {FRAME_COLORS.map((color) => (
                            <OptionItem
                              key={color}
                              value={color}
                              className="swatch"
                              style={{ background: color }}
                              aria-label={`Moldura ${FRAME_COLOR_NAMES[color]}`}
                            />
                          ))}
                        </OptionGroup>
                        <label className="swatch swatch--custom" aria-label="Outra cor de moldura">
                          <input
                            type="color"
                            name="frame-color"
                            value={style.frameColor}
                            onChange={(event) => onChange({ frameColor: event.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {tab === 'colors' ? (
              <>
                <div className="field">
                  <span className="field__label">Combinações prontas</span>
                  <OptionGroup<string>
                    label="Combinações prontas"
                    className="presets"
                    value={
                      COLOR_PRESETS.find((preset) => preset.fg === style.fg && preset.bg === style.bg)?.label ?? null
                    }
                    onValueChange={(label) => {
                      const preset = COLOR_PRESETS.find((item) => item.label === label);
                      if (preset) onChange({ fg: preset.fg, bg: preset.bg });
                    }}
                  >
                    {COLOR_PRESETS.map((preset) => (
                      <OptionItem key={preset.label} value={preset.label} className="preset">
                        <span className="preset__chip" style={{ background: preset.bg }}>
                          <span style={{ background: preset.fg }} />
                        </span>
                        {preset.label}
                      </OptionItem>
                    ))}
                  </OptionGroup>
                </div>

                <div className="fields fields--split">
                  <ColorField
                    label="Cor do código"
                    name="code-color"
                    value={style.fg}
                    onChange={(fg) => onChange({ fg })}
                  />
                  <ColorField
                    label="Cor do fundo"
                    name="background-color"
                    value={style.bg}
                    onChange={(bg) => onChange({ bg })}
                  />
                </div>

                <p className={`meter meter--${contrastLevel}`}>
                  <span className="meter__dot" aria-hidden="true" />
                  {contrastLevel === 'ok'
                    ? `Contraste ${formatRatio(ratio)}:1. Ótimo para imprimir.`
                    : contrastLevel === 'warn'
                      ? `Contraste ${formatRatio(ratio)}:1. Prefira 4,5:1 ou mais.`
                      : `Contraste ${formatRatio(ratio)}:1. Baixo demais para a câmera ler.`}
                </p>
              </>
            ) : null}

            {tab === 'shape' ? (
              <>
                <div className="field">
                  <span className="field__label">Módulos</span>
                  <OptionGroup<ModuleShape>
                    label="Módulos"
                    className="tiles tiles--three"
                    value={style.moduleShape}
                    onValueChange={(moduleShape) => onChange({ moduleShape })}
                  >
                    {moduleTiles.map((tile) => (
                      <Tile
                        key={tile.shape}
                        value={tile.shape}
                        svg={tile.svg}
                        label={MODULE_SHAPE_LABELS[tile.shape]}
                      />
                    ))}
                  </OptionGroup>
                </div>

                <div className="field">
                  <span className="field__label">Cantos (olhos)</span>
                  <OptionGroup<EyeShape>
                    label="Cantos (olhos)"
                    className="tiles tiles--three"
                    value={style.eyeShape}
                    onValueChange={(eyeShape) => onChange({ eyeShape })}
                  >
                    {eyeTiles.map((tile) => (
                      <Tile key={tile.shape} value={tile.shape} svg={tile.svg} label={EYE_SHAPE_LABELS[tile.shape]} />
                    ))}
                  </OptionGroup>
                </div>

                <div className="field">
                  <div className="range-head">
                    <span className="field__label" id="qr-margin-label">
                      Margem
                    </span>
                    <span className="range-head__value">{style.margin} módulos</span>
                  </div>
                  <Slider
                    aria-labelledby="qr-margin-label"
                    min={0}
                    max={8}
                    value={style.margin}
                    onValueChange={(value) => onChange({ margin: value as number })}
                  />
                  <p className="field__hint">Espaço livre em volta do código. O recomendado é 4.</p>
                </div>

                <SegmentedControl<ErrorCorrection>
                  label="Correção de erros"
                  value={style.errorCorrection}
                  options={(['L', 'M', 'Q', 'H'] as ErrorCorrection[]).map((level) => ({ value: level, label: level }))}
                  onChange={(errorCorrection) => onChange({ errorCorrection })}
                  hint={CORRECTION_HINT[style.errorCorrection]}
                />
              </>
            ) : null}

            {tab === 'logo' ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  hidden
                  onChange={(event) => handleFiles(event.target.files)}
                />

                {style.logo ? (
                  <>
                    <div className="logo-file">
                      <span className="logo-file__thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={style.logo.dataUrl} alt="" width={40} height={40} />
                      </span>
                      <span className="logo-file__name">{style.logo.name}</span>
                      <Button variant="link" onClick={() => inputRef.current?.click()}>
                        Trocar
                      </Button>
                      <Button variant="link" className="text-destructive" onClick={() => onChange({ logo: null })}>
                        Remover
                      </Button>
                    </div>

                    <div className="field">
                      <div className="range-head">
                        <span className="field__label" id="logo-size-label">
                          Tamanho do logo
                        </span>
                        <span className="range-head__value">{style.logo.size}%</span>
                      </div>
                      <Slider
                        aria-labelledby="logo-size-label"
                        min={8}
                        max={32}
                        value={style.logo.size}
                        onValueChange={(value) =>
                          onChange({ logo: style.logo ? { ...style.logo, size: value as number } : null })
                        }
                      />
                      <p className="field__hint">Até 24% da largura o código continua fácil de ler.</p>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`dropzone${dragOver ? ' dropzone--over' : ''}`}
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragOver(false);
                      void handleFiles(event.dataTransfer.files);
                    }}
                  >
                    <span className="dropzone__icon">
                      <UploadIcon />
                    </span>
                    <span className="dropzone__title">
                      {busy ? 'Preparando a imagem…' : 'Envie ou arraste seu logo'}
                    </span>
                    <span className="dropzone__text">PNG, JPG, WebP ou SVG até 1,5&nbsp;MB</span>
                  </button>
                )}
              </>
            ) : null}
          </div>

          {/* The readability check follows every change, so a bad colour or logo is caught here, not after printing. */}
          <p className="form-status" data-level={audit.level} aria-live="polite">
            {audit.level === 'ok' ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
            {audit.level === 'ok' ? 'Pronto para escanear.' : (audit.notices[0] ?? audit.title)}
          </p>
        </TabsContent>
      </Tabs>
    </section>
  );
}
