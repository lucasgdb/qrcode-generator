import { ArrowLeftRight, CircleCheck, CircleDashed, FileText, Lightbulb, Sparkles } from 'lucide-react';
import { useId, type CSSProperties, type ReactNode } from 'react';

import FieldControl from './FieldControl';
import { TypeIcon } from './icons';
import { TYPE_HUE } from './TypePicker';
import { Button } from './ui/button';
import { FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';
import { socialPrefix, type FieldDef, type QrTypeDef } from '../lib/types';

export interface ContentStepProps {
  type: QrTypeDef;
  values: Record<string, string>;
  onValueChange(key: string, value: string): void;
  onExample(): void;
  onChangeType(): void;
  name: string;
  onNameChange(name: string): void;
  /** Extension of the chosen export format, shown after the file name ("png", "svg"…). */
  extension: string;
  /** Show inline errors on required fields that are still empty. */
  showErrors?: boolean;
}

/** Text in front of a field when the field only holds the end of an address. */
function prefixFor(field: FieldDef, values: Record<string, string>, typeId: QrTypeDef['id']): string | undefined {
  if (typeId === 'social' && field.key === 'handle') {
    // A pasted link is used as it is, so the prefix would only mislead.
    return /^https?:\/\//i.test(values.handle ?? '') ? undefined : socialPrefix(values.network);
  }
  return undefined;
}

export default function ContentStep({
  type,
  values,
  onValueChange,
  onExample,
  onChangeType,
  name,
  onNameChange,
  extension,
  showErrors = false,
}: ContentStepProps) {
  const nameId = useId();
  const required = type.fields.filter((field) => field.required);
  const filled = required.filter((field) => (values[field.key] ?? '').trim() !== '').length;
  const complete = filled === required.length;

  const control = (field: FieldDef) => (
    <FieldControl
      key={field.key}
      field={field}
      value={values[field.key] ?? ''}
      onChange={(value) => onValueChange(field.key, value)}
      showErrors={showErrors}
      prefix={prefixFor(field, values, type.id)}
    />
  );

  const fields: ReactNode[] = [];
  for (let index = 0; index < type.fields.length; index += 1) {
    const field = type.fields[index];
    const next = type.fields[index + 1];
    if (field.span === 'half' && next?.span === 'half') {
      fields.push(
        <div className="field-row" key={`${field.key}-${next.key}`}>
          {control(field)}
          {control(next)}
        </div>,
      );
      index += 1;
    } else {
      fields.push(control(field));
    }
  }

  return (
    <section
      className="step"
      data-slot="content-step"
      aria-labelledby="content-title"
      style={{ '--hue': TYPE_HUE[type.id] } as CSSProperties}
    >
      <header className="step__head">
        <span className="step__icon" aria-hidden="true">
          <TypeIcon type={type.id} />
        </span>
        <div className="step__titles">
          <h1 id="content-title" className="title">
            {type.label}
          </h1>
          <p className="step__lead">{type.description}</p>
        </div>
        <Button variant="outline" size="lg" className="rounded-full" onClick={onChangeType}>
          <ArrowLeftRight aria-hidden="true" />
          Trocar tipo
        </Button>
      </header>

      <div className="card card--form">
        <FieldSet>
          <div className="card__head">
            <div className="card__heading">
              <FieldLegend className="card__title mb-0 text-[17px] font-bold">Conteúdo</FieldLegend>
              <FieldDescription>O que o código guarda. Campos com * são obrigatórios.</FieldDescription>
            </div>
            <Button variant="outline" size="lg" className="rounded-full" onClick={onExample}>
              <Sparkles aria-hidden="true" />
              Preencher exemplo
            </Button>
          </div>
          <FieldGroup className="fields">{fields}</FieldGroup>
        </FieldSet>

        {required.length > 0 ? (
          <p className="form-status" data-complete={complete || undefined} aria-live="polite">
            {complete ? <CircleCheck aria-hidden="true" /> : <CircleDashed aria-hidden="true" />}
            {complete
              ? 'Tudo pronto para personalizar.'
              : `${filled} de ${required.length} ${required.length === 1 ? 'campo obrigatório preenchido' : 'campos obrigatórios preenchidos'}`}
          </p>
        ) : null}
      </div>

      <div className="card card--form">
        <FieldSet>
          <div className="card__heading">
            <FieldLegend className="card__title mb-0 text-[17px] font-bold">Arquivo</FieldLegend>
            <FieldDescription>Como o QR Code vai se chamar quando você baixar.</FieldDescription>
          </div>
          <FieldGroup className="fields">
            <div className="field" data-slot="form-field">
              <FieldLabel className="field__label" htmlFor={nameId}>
                Nome do QR Code
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={nameId}
                  name="qr-name"
                  value={name}
                  maxLength={64}
                  placeholder={`qr-code-${type.id}`}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event) => onNameChange(event.target.value)}
                />
                <InputGroupAddon>
                  <FileText aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="field__suffix">.{extension}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </FieldGroup>
        </FieldSet>
      </div>

      <aside className="tips" aria-labelledby="tips-title">
        <span className="tips__icon" aria-hidden="true">
          <Lightbulb />
        </span>
        <div>
          <h2 id="tips-title" className="tips__title">
            Dicas para {type.label}
          </h2>
          <ul className="tips__list">
            {type.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  );
}
