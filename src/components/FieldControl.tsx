import {
  AtSign,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock,
  Compass,
  Globe,
  Hash,
  Heading,
  KeyRound,
  Link2,
  Mail,
  MapPin,
  User,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { useId, type CSSProperties } from 'react';

import { OptionGroup, OptionItem } from './OptionGroup';
import PhoneField from './PhoneField';
import { Checkbox } from './ui/checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { FieldDef } from '../lib/types';

export interface FieldControlProps {
  field: FieldDef;
  value: string;
  onChange(value: string): void;
  /** Show the inline "required" error when this field is required and still empty. */
  showErrors?: boolean;
  /** Text shown before the input, such as the address a handle is appended to. Replaces the icon. */
  prefix?: string;
}

const INPUT_TYPE: Partial<Record<NonNullable<FieldDef['kind']>, string>> = {
  email: 'email',
  url: 'url',
  date: 'date',
  time: 'time',
};

/** A small outline icon per field, so each input says what it holds at a glance. */
const FIELD_ICON: Record<string, LucideIcon> = {
  url: Link2,
  website: Globe,
  ssid: Wifi,
  password: KeyRound,
  key: KeyRound,
  name: User,
  org: Building2,
  role: BriefcaseBusiness,
  email: Mail,
  to: Mail,
  subject: Heading,
  address: MapPin,
  city: MapPin,
  location: MapPin,
  amount: Banknote,
  txid: Hash,
  handle: AtSign,
  latitude: Compass,
  longitude: Compass,
  title: Heading,
  startDate: CalendarDays,
  endDate: CalendarDays,
  startTime: Clock,
  endTime: Clock,
};

export default function FieldControl({ field, value, onChange, showErrors = false, prefix }: FieldControlProps) {
  const generatedId = useId();
  const id = `field-${field.key}-${generatedId}`;
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = Boolean(showErrors && field.required && !value.trim());
  const describedBy = [invalid ? errorId : null, field.hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  const hint = field.hint ? (
    <FieldDescription className="field__hint" id={hintId}>
      {field.hint}
    </FieldDescription>
  ) : null;

  const error = invalid ? (
    <FieldError className="field__error" id={errorId}>
      Preencha “{field.label}” para continuar.
    </FieldError>
  ) : null;

  if (field.kind === 'checkbox') {
    return (
      <Field orientation="horizontal" data-slot="form-field">
        <Checkbox
          id={id}
          checked={value === 'true'}
          onCheckedChange={(checked) => onChange(checked ? 'true' : '')}
          aria-describedby={describedBy}
        />
        <FieldLabel className="checkbox-row" htmlFor={id}>
          {field.label}
        </FieldLabel>
        {hint}
      </Field>
    );
  }

  const items = field.options ?? [];
  const selected = value || field.defaultValue || items[0]?.value || '';
  let control;

  if (field.kind === 'select' && field.display === 'chips') {
    control = (
      <OptionGroup<string>
        label={field.label}
        className="chips"
        value={selected}
        onValueChange={(next) => onChange(next)}
      >
        {items.map((option) => (
          <OptionItem
            key={option.value}
            value={option.value}
            className="chip"
            style={option.color ? ({ '--chip-color': option.color } as CSSProperties) : undefined}
          >
            {option.color ? <span className="chip__dot" aria-hidden="true" /> : null}
            {option.label}
          </OptionItem>
        ))}
      </OptionGroup>
    );
  } else if (field.kind === 'select') {
    control = (
      <Select items={items} value={selected} onValueChange={(next) => onChange(String(next ?? ''))}>
        <SelectTrigger id={id} aria-labelledby={labelId} aria-describedby={describedBy}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else if (field.kind === 'textarea') {
    control = (
      <Textarea
        id={id}
        name={field.key}
        aria-invalid={invalid || undefined}
        required={field.required}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        value={value}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  } else if (field.kind === 'tel') {
    control = (
      <PhoneField
        id={id}
        name={field.key}
        invalid={invalid}
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        describedBy={describedBy}
        onChange={onChange}
      />
    );
  } else {
    const Icon = FIELD_ICON[field.key];
    control = (
      <InputGroup>
        <InputGroupInput
          id={id}
          name={field.key}
          type={(field.kind && INPUT_TYPE[field.kind]) || 'text'}
          aria-invalid={invalid || undefined}
          required={field.required}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete ?? 'off'}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          spellCheck={field.kind === 'email' || field.kind === 'url' || prefix ? false : undefined}
          value={value}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
        {prefix ? (
          <InputGroupAddon>
            <InputGroupText className="field__prefix">{prefix}</InputGroupText>
          </InputGroupAddon>
        ) : Icon ? (
          <InputGroupAddon>
            <Icon aria-hidden="true" />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    );
  }

  return (
    <Field data-slot="form-field" data-invalid={invalid || undefined}>
      <FieldLabel className="field__label" htmlFor={id} id={labelId}>
        {field.label}
        {field.required ? (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </FieldLabel>
      {control}
      {error}
      {hint}
    </Field>
  );
}
