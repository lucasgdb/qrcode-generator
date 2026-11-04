import { cn } from 'cn';

import { CheckIcon } from './icons';

const ALL = ['Grátis', 'Sem cadastro', 'Sem marca d’água', 'Não expira', 'Gerado no seu navegador'];
const COMPACT = ['Grátis', 'Sem cadastro', 'Gerado no seu navegador'];

export interface PerksProps {
  /** The three that matter most, for the type pages' header. */
  compact?: boolean;
  className?: string;
}

/** What the generator promises, on the page itself and not only in the meta description. */
export default function Perks({ compact = false, className }: PerksProps) {
  return (
    <ul className={cn('perks', compact && 'perks--compact', className)} aria-label="Vantagens do gerador">
      {(compact ? COMPACT : ALL).map((perk) => (
        <li key={perk}>
          <CheckIcon aria-hidden="true" />
          {perk}
        </li>
      ))}
    </ul>
  );
}
