import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import { buildPayload } from '../lib/payload';
import { generateMatrix } from '../lib/qr';
import { isSafeImageDataUrl } from '../lib/export';
import { normalizeHex } from '../lib/scan';
import {
  DEFAULT_EXPORT,
  DEFAULT_STYLE,
  QR_TYPE_BY_ID,
  FRAMES,
  type ErrorCorrection,
  type ExportFormat,
  type ExportPrefs,
  type FrameId,
  type EyeShape,
  type LogoState,
  type ModuleShape,
  type QrStyle,
  type QrTypeId,
  type StudioState,
} from '../lib/types';

const STORAGE_KEY = 'qr-studio:v1';
const ALLOWED_TYPES = new Set(Object.keys(QR_TYPE_BY_ID));
const MODULE_SHAPES: ModuleShape[] = ['square', 'rounded', 'dots'];
const EYE_SHAPES: EyeShape[] = ['square', 'rounded', 'circle'];
const CORRECTION_LEVELS: ErrorCorrection[] = ['L', 'M', 'Q', 'H'];
const FORMATS: ExportFormat[] = ['png', 'svg', 'jpeg'];

export type SaveStatus = 'idle' | 'saved' | 'error';

function createInitialState(type: QrTypeId = 'link'): StudioState {
  return {
    type,
    values: {},
    style: { ...DEFAULT_STYLE },
    exportPrefs: { ...DEFAULT_EXPORT },
  };
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function sanitizeLogo(raw: unknown): LogoState | null {
  if (!raw || typeof raw !== 'object') return null;
  const logo = raw as Partial<LogoState>;
  if (!isSafeImageDataUrl(logo.dataUrl)) return null;

  return {
    dataUrl: logo.dataUrl,
    name: typeof logo.name === 'string' ? logo.name.slice(0, 60) : 'logo',
    size: clamp(Number(logo.size), 8, 32, 20),
  };
}

function sanitizeState(raw: unknown): StudioState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<StudioState>;

  const type =
    typeof candidate.type === 'string' && ALLOWED_TYPES.has(candidate.type) ? (candidate.type as QrTypeId) : 'link';

  const values: Record<string, Record<string, string>> = {};
  if (candidate.values && typeof candidate.values === 'object') {
    for (const [typeId, fields] of Object.entries(candidate.values)) {
      if (!ALLOWED_TYPES.has(typeId) || !fields || typeof fields !== 'object') continue;
      const record: Record<string, string> = {};
      for (const [key, fieldValue] of Object.entries(fields as Record<string, unknown>)) {
        if (typeof fieldValue === 'string' && fieldValue.length <= 4000) record[key] = fieldValue;
      }
      values[typeId] = record;
    }
  }

  const rawStyle = (candidate.style ?? {}) as Partial<QrStyle>;
  const style: QrStyle = {
    fg: normalizeHex(String(rawStyle.fg ?? '')) ?? DEFAULT_STYLE.fg,
    bg: normalizeHex(String(rawStyle.bg ?? '')) ?? DEFAULT_STYLE.bg,
    moduleShape: MODULE_SHAPES.includes(rawStyle.moduleShape as ModuleShape)
      ? (rawStyle.moduleShape as ModuleShape)
      : DEFAULT_STYLE.moduleShape,
    eyeShape: EYE_SHAPES.includes(rawStyle.eyeShape as EyeShape)
      ? (rawStyle.eyeShape as EyeShape)
      : DEFAULT_STYLE.eyeShape,
    margin: clamp(Number(rawStyle.margin), 0, 8, DEFAULT_STYLE.margin),
    errorCorrection: CORRECTION_LEVELS.includes(rawStyle.errorCorrection as ErrorCorrection)
      ? (rawStyle.errorCorrection as ErrorCorrection)
      : DEFAULT_STYLE.errorCorrection,
    logo: sanitizeLogo(rawStyle.logo),
    frame: FRAMES.some((frame) => frame.id === rawStyle.frame) ? (rawStyle.frame as FrameId) : DEFAULT_STYLE.frame,
    frameText: typeof rawStyle.frameText === 'string' ? rawStyle.frameText.slice(0, 24) : DEFAULT_STYLE.frameText,
    frameColor: normalizeHex(String(rawStyle.frameColor ?? '')) ?? DEFAULT_STYLE.frameColor,
  };

  const rawExport = (candidate.exportPrefs ?? {}) as Partial<ExportPrefs>;
  const requestedSize = Number(rawExport.size);
  const exportPrefs: ExportPrefs = {
    format: FORMATS.includes(rawExport.format as ExportFormat)
      ? (rawExport.format as ExportFormat)
      : DEFAULT_EXPORT.format,
    size: [512, 1024, 2048, 4096].includes(requestedSize) ? requestedSize : DEFAULT_EXPORT.size,
    filename: typeof rawExport.filename === 'string' ? rawExport.filename.slice(0, 64) : DEFAULT_EXPORT.filename,
  };

  return { type, values, style, exportPrefs };
}

/** `initialType` comes from the URL, so the server and the first client render show the same step. */
export function useQrStudio(initialType: QrTypeId = 'link') {
  const [state, setState] = useState<StudioState>(() => createInitialState(initialType));
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  // The draft read from storage is not a change; only edits after it earn a "saved" stamp.
  const skipNextSave = useRef(true);

  useEffect(() => {
    // Only design and file preferences are remembered. What people type (links, Wi-Fi
    // passwords, PIX keys, contacts) is never stored: every visit starts with empty
    // fields, filled only by the person or by "Preencher exemplo".
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = sanitizeState(JSON.parse(stored));
        if (parsed) {
          // Reading saved preferences is an external system syncing into React:
          // it must happen after mount so the server HTML and first client render match.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((previous) => ({
            ...previous,
            style: parsed.style,
            exportPrefs: { ...parsed.exportPrefs, filename: '' },
          }));
        }
        // Rewrites drafts saved by older versions without their typed content.
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(parsed ? { style: parsed.style, exportPrefs: { ...parsed.exportPrefs, filename: '' } } : {}),
        );
      }
    } catch {
      // Blocked or corrupt storage should never stop the generator from opening.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ style: state.style, exportPrefs: { ...state.exportPrefs, filename: '' } }),
        );
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [state.style, state.exportPrefs, hydrated]);

  const currentValues = useMemo(() => state.values[state.type] ?? {}, [state.values, state.type]);
  const livePayload = useMemo(() => buildPayload(state.type, currentValues), [state.type, currentValues]);
  // Fields stay instant while typing; the matrix (the expensive part on long
  // content) follows a beat later and never blocks a keystroke.
  const payload = useDeferredValue(livePayload);
  const errorCorrection = useDeferredValue(state.style.errorCorrection);
  const matrix = useMemo(() => generateMatrix(payload, errorCorrection), [payload, errorCorrection]);

  const setType = useCallback((type: QrTypeId) => {
    setState((previous) => ({ ...previous, type }));
  }, []);

  const setValue = useCallback((key: string, value: string) => {
    setState((previous) => ({
      ...previous,
      values: {
        ...previous.values,
        [previous.type]: { ...(previous.values[previous.type] ?? {}), [key]: value },
      },
    }));
  }, []);

  const patchStyle = useCallback((patch: Partial<QrStyle>) => {
    setState((previous) => ({ ...previous, style: { ...previous.style, ...patch } }));
  }, []);

  const patchExport = useCallback((patch: Partial<ExportPrefs>) => {
    setState((previous) => ({ ...previous, exportPrefs: { ...previous.exportPrefs, ...patch } }));
  }, []);

  const applyExample = useCallback(() => {
    setState((previous) => {
      const example = QR_TYPE_BY_ID[previous.type].example;
      return {
        ...previous,
        values: { ...previous.values, [previous.type]: { ...example } },
      };
    });
  }, []);

  return {
    state,
    currentValues,
    payload,
    matrix,
    hasContent: Boolean(livePayload),
    saveStatus,
    hydrated,
    setType,
    setValue,
    patchStyle,
    patchExport,
    applyExample,
  };
}
