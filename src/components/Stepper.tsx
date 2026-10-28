import { useState } from 'react';

import { CheckIcon } from './icons';
import { routeHref, type Step } from '../hooks/useRoute';
import type { QrTypeId } from '../lib/types';

export interface StepperProps {
  /** The step on screen. */
  step: Step;
  /** The chosen type, which every step's address carries. */
  type: QrTypeId;
  /** Whether a step can be opened from here; only steps already passed can. */
  canReach(step: Step): boolean;
  onStep(step: Step): void;
}

const STEPS: { id: Step; label: string; short: string }[] = [
  { id: 1, label: 'Escolha o tipo', short: 'Tipo' },
  { id: 2, label: 'Adicione o conteúdo', short: 'Conteúdo' },
  { id: 3, label: 'Personalize e baixe', short: 'Design' },
];

export default function Stepper({ step, type, canReach, onStep }: StepperProps) {
  // The direction of the last move lets CSS sequence it: forward, the line fills before the next
  // step lights up; back, the step goes dark before the line drains to the one behind it.
  const [previous, setPrevious] = useState(step);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  if (step !== previous) {
    setDirection(step > previous ? 'forward' : 'back');
    setPrevious(step);
  }

  return (
    <nav className="stepper" data-slot="stepper" data-direction={direction} aria-label="Etapas">
      <ol>
        {STEPS.map((item, index) => {
          const state = item.id === step ? 'current' : item.id < step ? 'done' : 'todo';
          const reachable = item.id !== step && canReach(item.id);

          return (
            <li key={item.id} className="stepper__item" data-state={state}>
              {/* One element in every state, so its dot can transition; only reachable steps get an href. */}
              <a
                className="stepper__button"
                href={reachable ? routeHref(item.id, type) : undefined}
                aria-current={state === 'current' ? 'step' : undefined}
                onClick={(event) => {
                  if (!reachable) return;
                  // Plain clicks stay in the app with the step transition; modified clicks open a new tab.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  onStep(item.id);
                }}
              >
                <span className="stepper__dot" aria-hidden="true">
                  <span className="stepper__number">{item.id}</span>
                  <CheckIcon className="stepper__check" />
                </span>
                <span className="stepper__label">{item.label}</span>
                <span className="stepper__short">{item.short}</span>
              </a>

              {index < STEPS.length - 1 ? (
                // Fills from 0 to 100% when the step behind it is completed, and empties when going back.
                <span className="stepper__track" aria-hidden="true">
                  <span className="stepper__fill" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
