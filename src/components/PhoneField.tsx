import { useState } from 'react';
import { AR, BR, CL, CO, DE, ES, GB, MX, PT, PY, US, UY, type FlagComponent } from 'country-flag-icons/react/3x2';

import { cn } from 'cn';

import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Country {
  code: string;
  iso: string;
  name: string;
  Flag: FlagComponent;
}

// SVG flags render the same everywhere; flag emoji show as two letters on Windows.
const COUNTRIES: Country[] = [
  { code: '55', iso: 'BR', name: 'Brasil', Flag: BR },
  { code: '351', iso: 'PT', name: 'Portugal', Flag: PT },
  { code: '1', iso: 'US', name: 'Estados Unidos', Flag: US },
  { code: '54', iso: 'AR', name: 'Argentina', Flag: AR },
  { code: '56', iso: 'CL', name: 'Chile', Flag: CL },
  { code: '57', iso: 'CO', name: 'Colômbia', Flag: CO },
  { code: '52', iso: 'MX', name: 'México', Flag: MX },
  { code: '595', iso: 'PY', name: 'Paraguai', Flag: PY },
  { code: '598', iso: 'UY', name: 'Uruguai', Flag: UY },
  { code: '34', iso: 'ES', name: 'Espanha', Flag: ES },
  { code: '44', iso: 'GB', name: 'Reino Unido', Flag: GB },
  { code: '49', iso: 'DE', name: 'Alemanha', Flag: DE },
];

// Longest codes first, so +351 is never read as +35.
const BY_LENGTH = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);

/** Splits a stored "+55 11 99999-0000" into its country and the local number. */
function split(value: string): { code: string; local: string } {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1);
    const country = BY_LENGTH.find((item) => digits.startsWith(item.code));
    if (country) return { code: country.code, local: digits.slice(country.code.length).trim() };
  }
  return { code: '55', local: trimmed };
}

// The "size-" in the class opts the flag out of the ui components' rule that squares every svg to 16x16.
function Flag({ country }: { country: Country }) {
  return <country.Flag className="phone-field__flag flag-size-3x2" aria-hidden="true" />;
}

export interface PhoneFieldProps {
  id: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  describedBy?: string;
  /** Form field name for the number input. */
  name?: string;
  /** Marks the whole field as invalid (red outline) and the number as aria-invalid. */
  invalid?: boolean;
  /** Extra classes for the outer field. */
  className?: string;
  onChange(value: string): void;
}

/**
 * A country picker, its calling code and the number, drawn as one field: one
 * outline and one focus ring around all three, stored as one international string.
 */
export default function PhoneField({
  id,
  value,
  placeholder,
  required,
  describedBy,
  name,
  invalid,
  className,
  onChange,
}: PhoneFieldProps) {
  const parsed = split(value);
  // An empty number stores nothing, so the chosen country is remembered here until digits arrive.
  const [pickedCode, setPickedCode] = useState(parsed.code);
  const code = value.trim().startsWith('+') ? parsed.code : pickedCode;
  const local = parsed.local;
  const compose = (nextCode: string, nextLocal: string) => onChange(nextLocal ? `+${nextCode} ${nextLocal}` : '');
  const items = COUNTRIES.map((country) => ({ value: country.code, label: `${country.name} +${country.code}` }));

  return (
    <div className={cn('phone-field', className)} data-slot="phone-field" data-invalid={invalid || undefined}>
      <Select
        items={items}
        value={code}
        onValueChange={(next) => {
          if (!next) return;
          setPickedCode(String(next));
          compose(String(next), local);
        }}
      >
        <SelectTrigger
          className="h-full w-auto shrink-0 gap-2 rounded-none border-0 bg-transparent pr-3 pl-3.5 hover:bg-accent focus-visible:ring-0"
          aria-label="País"
        >
          <SelectValue>
            {(selected: string) => {
              const country = COUNTRIES.find((item) => item.code === selected) ?? COUNTRIES[0];
              return (
                <span className="phone-field__value">
                  <Flag country={country} />
                  {country.iso}
                </span>
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-56">
          {COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <Flag country={country} />
              {country.name}
              <span className="ml-auto text-muted-foreground">+{country.code}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="phone-field__divider" aria-hidden="true" />
      <label className="phone-field__prefix" htmlFor={id}>
        +{code}
      </label>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="h-full rounded-none border-0 bg-transparent pl-2 hover:border-0 focus-visible:ring-0 aria-invalid:ring-0"
        value={local}
        placeholder={placeholder}
        required={required}
        name={name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => compose(code, event.target.value.replace(/^\+/, ''))}
      />
    </div>
  );
}
