import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { QR_TYPE_BY_ID, type QrTypeId } from '../lib/types';

export type Step = 1 | 2 | 3;

export interface Route {
  step: Step;
  type: QrTypeId | null;
}

/**
 * The address of a step: "/" is the type picker and "/sms" the content step for SMS.
 * The design step has no address of its own: opened fresh it would have no content to
 * design, so it lives in the page's state under the same URL as the content step.
 */
export function routeHref(step: Step, type: QrTypeId | null): string {
  if (step === 1 || !type) return '/';
  return `/${type}`;
}

/** Reads a route from path segments, as Next hands them to the page and as `asPath` holds them. */
export function routeFromSegments(segments: string[] | undefined): Route {
  const [type] = segments ?? [];
  if (!type || !(type in QR_TYPE_BY_ID)) return { step: 1, type: null };
  return { step: 2, type: type as QrTypeId };
}

function routeFromPath(asPath: string): Route {
  const path = asPath.split(/[?#]/)[0];
  return routeFromSegments(path.split('/').filter(Boolean));
}

/** Links shared before the move to paths ("/#/sms", "/#/sms/personalizar") open the content step. */
function legacyHashRoute(hash: string): Route | null {
  const match = /^#\/([a-z]+)(?:\/[a-z]+)?\/?$/.exec(hash);
  return match ? routeFromSegments([match[1]]) : null;
}

/** Marks the history entry of the design step, which shares its URL with the content step. */
const DESIGN_MARK = 'qrDesignStep';

function isDesignEntry(state: unknown): boolean {
  return Boolean(state && typeof state === 'object' && DESIGN_MARK in state);
}

/**
 * Swaps the screen inside a view transition when the browser has one, so the
 * old step slides out and the new one in. The direction lets CSS mirror the
 * slide when going back. Without support, or with reduced motion, it swaps at once.
 */
function withTransition(direction: 'forward' | 'back', update: () => void) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) {
    update();
    return;
  }

  document.documentElement.dataset.direction = direction;
  const transition = document.startViewTransition(() => flushSync(update));
  void transition.finished.finally(() => {
    delete document.documentElement.dataset.direction;
  });
}

/**
 * The wizard's position, rendered from the server-known `initial` route. Steps 1 and 2
 * live in the URL through Next's shallow routing, so the page stays mounted (typed content
 * survives) and the server can draw them; step 3 is a history entry on step 2's URL, so the
 * browser's back button still walks 3 → 2 → 1. `onType` keeps the editor's type in step.
 */
export function useRoute(initial: Route, onType: (type: QrTypeId) => void) {
  const router = useRouter();
  const [route, setRoute] = useState<Route>(initial);
  const current = useRef<Route>(initial);
  const onTypeRef = useRef(onType);

  useEffect(() => {
    onTypeRef.current = onType;
  }, [onType]);

  const show = useCallback((next: Route, animate = true) => {
    const previous = current.current;
    if (next.step === previous.step && next.type === previous.type) return;
    current.current = next;

    const update = () => {
      if (next.type) onTypeRef.current(next.type);
      setRoute(next);
      window.scrollTo({ top: 0 });
    };

    if (animate) withTransition(next.step >= previous.step ? 'forward' : 'back', update);
    else update();
  }, []);

  const goTo = useCallback(
    (step: Step, type: QrTypeId | null = current.current.type, options: { replace?: boolean } = {}) => {
      const next: Route = { step, type: step === 1 ? null : type };
      const from = current.current;

      if (step === 3) {
        // Same URL, one more history entry carrying Next's own state plus the design mark.
        window.history.pushState({ ...window.history.state, [DESIGN_MARK]: true }, '', window.location.href);
        show(next);
        return;
      }

      if (from.step === 3 && step === 2 && next.type === from.type && isDesignEntry(window.history.state)) {
        // Leaving the design step pops its entry, so history stays 1 → 2 and forward still works.
        window.history.back();
        return;
      }

      const href = routeHref(next.step, next.type);
      const navigate = options.replace ? router.replace : router.push;
      void navigate(href, undefined, { shallow: true, scroll: false });
      show(next, !options.replace);
    },
    [router, show],
  );

  // Back and forward between "/" and "/<type>": Next updates asPath and the screen follows.
  // The first reading only reconciles the URL with what the server already drew.
  const synced = useRef(false);
  useEffect(() => {
    if (!router.isReady) return;
    const fromUrl = routeFromPath(router.asPath);
    if (!synced.current) {
      synced.current = true;
      const shown = current.current;
      if (fromUrl.step !== shown.step || fromUrl.type !== shown.type) {
        void router.replace(routeHref(shown.step, shown.type), undefined, { shallow: true, scroll: false });
      }
      return;
    }
    if (current.current.step === 3 && fromUrl.step === 2 && fromUrl.type === current.current.type) return;
    show(fromUrl);
  }, [router, router.asPath, router.isReady, show]);

  // Back and forward between steps 2 and 3, which share a URL: the entry's design mark decides.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const shown = current.current;
      const design = isDesignEntry(event.state);
      if (shown.step === 3 && !design) show({ step: 2, type: shown.type });
      else if (shown.step === 2 && design) show({ step: 3, type: shown.type });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [show]);

  // Old "#/sms" links move to their path once, without animating.
  useEffect(() => {
    const legacy = legacyHashRoute(window.location.hash);
    if (!legacy) return;
    void router.replace(routeHref(legacy.step, legacy.type), undefined, { shallow: true, scroll: false });
    show(legacy, false);
    // Runs once on arrival; later hash changes are not routes anymore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { step: route.step, routeType: route.type, goTo };
}
