import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { cn } from 'cn';
import { ChevronDownIcon } from 'lucide-react';

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ className, children, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'group/collapsible-trigger inline-flex items-center gap-1.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        data-slot="collapsible-trigger-icon"
        aria-hidden
        className="pointer-events-none size-4 shrink-0 transition-transform duration-(--duration-panel) ease-(--ease) group-data-panel-open/collapsible-trigger:rotate-180"
      />
    </CollapsiblePrimitive.Trigger>
  );
}

export type CollapsibleContentProps = Omit<CollapsiblePrimitive.Panel.Props, 'className'> & {
  /** Applies to the inner content box, not the animated panel. */
  className?: string;
};

/** Animates its height between 0 and the measured --collapsible-panel-height. */
function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-(--duration-panel) ease-(--ease) data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className={className}>{children}</div>
    </CollapsiblePrimitive.Panel>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
