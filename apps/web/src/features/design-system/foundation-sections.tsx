import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';
import { Specimen, SpecimenGrid } from './showcase-shell';

/**
 * Foundation specimens are plain server components — they render tokens, not
 * behaviour, so none of this ships JavaScript to the browser.
 */

const brandColors = [
  { name: 'primary', className: 'bg-primary', note: 'Primary CTA, active state' },
  { name: 'primary-strong', className: 'bg-primary-strong', note: 'Primary hover' },
  { name: 'secondary', className: 'bg-secondary', note: 'Brand accent' },
  { name: 'accent', className: 'bg-accent', note: 'Supporting highlight' },
  { name: 'accent-cyan', className: 'bg-accent-cyan', note: 'Ambient highlight' },
  { name: 'accent-soft', className: 'bg-accent-soft', note: 'Soft tinted surface' },
];

const neutralColors = [
  { name: 'background', className: 'bg-background', note: 'Page background' },
  { name: 'background-secondary', className: 'bg-background-secondary', note: 'Alt section' },
  { name: 'surface', className: 'bg-surface', note: 'Cards and panels' },
  { name: 'surface-subtle', className: 'bg-surface-subtle', note: 'Image wells, table head' },
  { name: 'muted', className: 'bg-muted', note: 'Inset / hover fill' },
  { name: 'border', className: 'bg-border', note: 'Borders and dividers' },
  { name: 'foreground', className: 'bg-foreground', note: 'Primary text' },
  { name: 'muted-foreground', className: 'bg-muted-foreground', note: 'Secondary text' },
];

const semanticColors = [
  { name: 'success', className: 'bg-success', note: 'Confirmed, in stock' },
  { name: 'warning', className: 'bg-warning', note: 'Needs attention' },
  { name: 'destructive', className: 'bg-destructive', note: 'Errors, deletion' },
  { name: 'info', className: 'bg-info', note: 'Neutral information' },
];

function Swatch({
  name,
  className,
  note,
}: {
  name: string;
  className: string;
  note: string;
}) {
  return (
    <div className="grid gap-2">
      <div
        className={`h-16 rounded-xl border border-border ${className}`}
        aria-hidden="true"
      />
      <div>
        <p className="text-body-sm font-medium">{name}</p>
        <p className="text-caption text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function SwatchRow({
  label,
  swatches,
}: {
  label: string;
  swatches: { name: string; className: string; note: string }[];
}) {
  return (
    <div className="grid gap-3">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {swatches.map((swatch) => (
          <Swatch key={swatch.name} {...swatch} />
        ))}
      </div>
    </div>
  );
}

export function ColorSpecimens() {
  return (
    <div className="grid gap-10">
      <Specimen label="Logo — full wordmark and icon">
        <NovaCommerceLogo />
        <NovaCommerceLogo iconOnly />
      </Specimen>
      <SwatchRow label="Brand" swatches={brandColors} />
      <SwatchRow label="Neutral" swatches={neutralColors} />
      <SwatchRow label="Semantic" swatches={semanticColors} />
      <Specimen label="Gradient — primary CTA, hero highlight, premium surfaces only">
        <div className="bg-gradient-hero h-16 w-full max-w-md rounded-xl" aria-hidden="true" />
      </Specimen>
      <Specimen label="Accessible tone on tinted surfaces">
        <p className="rounded-lg bg-success/12 px-3 py-2 text-body-sm text-success-strong">
          success-strong on success/12
        </p>
        <p className="rounded-lg bg-warning/15 px-3 py-2 text-body-sm text-warning-strong">
          warning-strong on warning/15
        </p>
        <p className="rounded-lg bg-destructive/12 px-3 py-2 text-body-sm text-destructive-strong">
          destructive-strong on destructive/12
        </p>
        <p className="rounded-lg bg-info/12 px-3 py-2 text-body-sm text-info-strong">
          info-strong on info/12
        </p>
      </Specimen>
    </div>
  );
}

export function TypographySpecimens() {
  return (
    <div className="grid gap-6">
      {[
        { cls: 'text-hero', label: 'text-hero', sample: 'Discover Amazing Products' },
        { cls: 'text-display', label: 'text-display', sample: 'Discover Amazing Products' },
        { cls: 'text-h1', label: 'text-h1', sample: 'Page title' },
        { cls: 'text-h2', label: 'text-h2', sample: 'Section heading' },
        { cls: 'text-h3', label: 'text-h3', sample: 'Subsection heading' },
        { cls: 'text-h4', label: 'text-h4', sample: 'Card and dialog heading' },
        { cls: 'text-body', label: 'text-body', sample: 'Comfortable reading copy for body text.' },
        { cls: 'text-body-sm', label: 'text-body-sm', sample: 'Default UI and product copy.' },
        { cls: 'text-caption', label: 'text-caption', sample: 'Supporting metadata and counts.' },
        { cls: 'text-label', label: 'text-label', sample: 'Form and UI label' },
        { cls: 'text-overline', label: 'text-overline', sample: 'Eyebrow label' },
      ].map(({ cls, label, sample }) => (
        <div key={label} className="grid gap-1 border-b border-border pb-4 last:border-b-0">
          <p className="text-caption font-mono text-muted-foreground">{label}</p>
          <p className={cls}>{sample}</p>
        </div>
      ))}
    </div>
  );
}

export function ScaleSpecimens() {
  return (
    <SpecimenGrid>
      <div className="grid gap-3">
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Spacing (4px base scale)
        </p>
        <div className="grid gap-2">
          {[1, 2, 3, 4, 6, 8, 12, 16].map((step) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-12 text-caption font-mono text-muted-foreground">{step}</span>
              <div
                className="h-3 rounded-xs bg-primary/25"
                style={{ width: `${step * 0.25}rem` }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        <div className="grid gap-3">
          <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
            Radius
          </p>
          <div className="flex flex-wrap gap-3">
            {['rounded-xs', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-pill'].map(
              (radius) => (
                <div key={radius} className="grid gap-1.5 text-center">
                  <div
                    className={`size-16 border border-border bg-surface shadow-sm ${radius}`}
                    aria-hidden="true"
                  />
                  <span className="text-caption font-mono text-muted-foreground">
                    {radius.replace('rounded-', '')}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
            Elevation
          </p>
          <div className="flex flex-wrap gap-5">
            {[
              { cls: 'shadow-sm', label: 'sm · resting' },
              { cls: 'shadow-md', label: 'md · raised' },
              { cls: 'shadow-lg', label: 'lg · overlay' },
              { cls: 'shadow-premium', label: 'premium · hero' },
            ].map(({ cls, label }) => (
              <div key={cls} className="grid gap-1.5 text-center">
                <div className={`size-16 rounded-xl bg-surface ${cls}`} aria-hidden="true" />
                <span className="text-caption text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SpecimenGrid>
  );
}
