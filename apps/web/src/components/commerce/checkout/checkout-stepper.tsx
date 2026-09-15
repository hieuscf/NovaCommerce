import { cn } from '@/lib/utils';
import {
  CHECKOUT_STEPS,
  isCheckoutStepComplete,
  isCheckoutStepCurrent,
  type CheckoutStage,
  type CheckoutStepId,
} from '@/lib/view-models/checkout';

export function CheckoutStepper({
  stage,
  onStepSelect,
}: {
  stage: CheckoutStage;
  onStepSelect: (stepId: CheckoutStepId) => void;
}) {
  return (
    <ol className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 sm:gap-0" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((step, index) => {
        const current = isCheckoutStepCurrent(step.id, stage);
        const complete = isCheckoutStepComplete(step.id, stage);
        const reachable = complete || current || (stage === 'details' && step.id === 'information');

        return (
          <li key={step.id} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            {index < CHECKOUT_STEPS.length - 1 ? (
              <span
                className="absolute top-5 left-[2.375rem] hidden h-px w-[calc(100%-1.25rem)] bg-border sm:block"
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              className={cn(
                'relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-fast focus-ring',
                current
                  ? 'bg-gradient-hero text-primary-foreground shadow-cta'
                  : complete
                    ? 'border border-primary/20 bg-surface text-primary'
                    : 'border border-border bg-surface text-muted-foreground',
                !reachable && 'cursor-default',
              )}
              aria-current={current ? 'step' : undefined}
              aria-label={`Step ${step.number}: ${step.label}`}
              disabled={!reachable}
              onClick={() => {
                if (reachable) onStepSelect(step.id);
              }}
            >
              {step.number}
            </button>
            <span className="min-w-0">
              <span
                className={cn(
                  'block text-sm font-semibold',
                  current || complete ? 'text-ink' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{step.description}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
