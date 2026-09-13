import {
  evaluatePasswordStrength,
  type PasswordStrengthResult,
} from '@/lib/validation/auth-schemas';

export interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, message } = evaluatePasswordStrength(password);
  const bars = 4;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: bars }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index < score ? strengthColor(score) : 'bg-border'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function strengthColor(score: PasswordStrengthResult['score']): string {
  switch (score) {
    case 0:
      return 'bg-destructive';
    case 1:
      return 'bg-warning';
    case 2:
      return 'bg-warning';
    case 3:
      return 'bg-success';
    case 4:
      return 'bg-success';
    default:
      return 'bg-border';
  }
}
