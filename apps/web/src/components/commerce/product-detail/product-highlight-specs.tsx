import {
  Battery,
  Camera,
  Cpu,
  HardDrive,
  Headphones,
  Layers,
  Monitor,
  Scale,
} from 'lucide-react';
import type {
  ProductHighlightIcon,
  ProductHighlightSpecViewModel,
} from '@/lib/view-models/product-detail';

const ICONS: Record<ProductHighlightIcon, typeof Cpu> = {
  chip: Cpu,
  memory: Layers,
  display: Monitor,
  battery: Battery,
  camera: Camera,
  audio: Headphones,
  storage: HardDrive,
  weight: Scale,
};

export function ProductHighlightSpecs({
  specs,
}: {
  specs: readonly ProductHighlightSpecViewModel[];
}) {
  if (specs.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-3 gap-2.5">
      {specs.map((spec) => {
        const Icon = ICONS[spec.icon];
        return (
          <li
            key={spec.id}
            className="rounded-2xl border border-border/70 bg-surface-subtle px-3 py-3 text-center"
          >
            <Icon className="mx-auto size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <p className="mt-2 text-[13px] font-semibold text-ink">{spec.label}</p>
            <p className="text-[11px] text-muted-foreground">{spec.hint}</p>
          </li>
        );
      })}
    </ul>
  );
}
