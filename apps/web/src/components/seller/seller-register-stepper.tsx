import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SELLER_REGISTER_STEPS,
  isSellerRegisterStepComplete,
  isSellerRegisterStepCurrent,
  type SellerRegisterStepId,
} from '@/lib/view-models/seller';

export function SellerRegisterStepper({
  current,
  onStepSelect,
}: {
  current: SellerRegisterStepId;
  onStepSelect: (stepId: SellerRegisterStepId) => void;
}) {
  return (
    <ol
      className="flex flex-wrap items-center gap-y-3 sm:flex-nowrap"
      aria-label="Seller registration progress"
    >
      {SELLER_REGISTER_STEPS.map((step, index) => {
        const currentStep = isSellerRegisterStepCurrent(step.id, current);
        const complete = isSellerRegisterStepComplete(step.id, current);
        const reachable = complete || currentStep;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center last:flex-none">
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-lg text-left focus-ring disabled:cursor-default"
              aria-current={currentStep ? 'step' : undefined}
              aria-label={`Step ${step.number}: ${step.label}`}
              disabled={!reachable}
              onClick={() => {
                if (reachable) onStepSelect(step.id);
              }}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold',
                  currentStep
                    ? 'bg-primary text-primary-foreground shadow-cta'
                    : complete
                      ? 'border border-primary/30 bg-primary/10 text-primary'
                      : 'border border-border bg-surface text-muted-foreground',
                )}
              >
                {complete ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : step.number}
              </span>
              <span
                className={cn(
                  'hidden whitespace-nowrap text-[12px] font-semibold xl:inline',
                  currentStep || complete ? 'text-ink' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </button>
            {index < SELLER_REGISTER_STEPS.length - 1 ? (
              <span
                className={cn(
                  'mx-2 hidden h-px min-w-4 flex-1 sm:block',
                  complete ? 'bg-primary/40' : 'bg-border',
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
