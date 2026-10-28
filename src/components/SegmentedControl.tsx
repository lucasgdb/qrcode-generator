import { cn } from 'cn';
import { useId } from 'react';

import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface Option<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange(value: T): void;
  hint?: string;
  /** Extra classes for the field wrapper. */
  className?: string;
}

/** One choice out of a few, drawn as a pill track; built on the design system's toggle group. */
export default function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
  className,
}: SegmentedControlProps<T>) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('field', className)} data-slot="segmented-control">
      <span className="field__label" id={`${id}-label`}>
        {label}
      </span>
      <ToggleGroup
        className="w-full rounded-full bg-muted p-1"
        spacing={1}
        value={[value]}
        onValueChange={(next) => {
          // A pressed item cannot be un-pressed: one option is always chosen.
          const picked = next.find((item) => item !== value) ?? next[0];
          if (picked) onChange(picked as T);
        }}
        aria-labelledby={`${id}-label`}
        aria-describedby={hintId}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="h-10 flex-1 rounded-full font-bold text-muted-foreground duration-200 hover:bg-transparent hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm aria-pressed:hover:bg-card"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
