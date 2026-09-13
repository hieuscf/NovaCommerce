import { Check, Circle } from 'lucide-react';
import { PASSWORD_REQUIREMENTS } from '@/lib/validation/auth-schemas';
import { cn } from '@/lib/utils';

export interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div className="space-y-2" aria-live="polite">
      <p className="text-xs font-medium text-foreground">Password requirements</p>
      <ul className="space-y-1.5">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const met = requirement.test(password);
          return (
            <li
              key={requirement.id}
              className={cn(
                'flex items-center gap-2 text-xs',
                met ? 'text-success-strong' : 'text-muted-foreground',
              )}
            >
              {met ? (
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Circle className="size-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {requirement.label}
                <span className="sr-only">{met ? ' — met' : ' — not met yet'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
