import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { cn } from 'cn';
import type { ComponentProps, ReactNode } from 'react';

export interface OptionGroupProps<T extends string> extends Omit<
  ComponentProps<typeof ToggleGroup>,
  'value' | 'defaultValue' | 'onValueChange' | 'multiple'
> {
  /** The chosen option, or null when none of the options matches the current state. */
  value: T | null;
  /** Called with the option the person picks; picking the chosen one again keeps it. */
  onValueChange(value: T): void;
  /** Accessible name for the group, read before its options. */
  label: string;
  children: ReactNode;
}

/**
 * A single choice among visual options (tiles, swatches, presets), built on Base UI's
 * toggle group: one Tab stop for the whole group, arrow keys move between options,
 * and every option reports aria-pressed. It ships no look of its own; options are
 * styled by the className they are given.
 */
export function OptionGroup<T extends string>({
  value,
  onValueChange,
  label,
  className,
  children,
  ...props
}: OptionGroupProps<T>) {
  return (
    <ToggleGroup
      data-slot="option-group"
      aria-label={label}
      className={className}
      value={value ? [value] : []}
      onValueChange={(next) => {
        const picked = next.find((item) => item !== value) ?? next[0];
        if (picked) onValueChange(picked as T);
      }}
      {...props}
    >
      {children}
    </ToggleGroup>
  );
}

export interface OptionItemProps extends ComponentProps<typeof Toggle> {
  /** The option's value inside its OptionGroup. */
  value: string;
}

export function OptionItem({ className, ...props }: OptionItemProps) {
  return <Toggle data-slot="option-item" className={cn(className)} {...props} />;
}
