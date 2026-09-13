'use client';

import { forwardRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
  leading?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, autoComplete = 'current-password', leading, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? 'password';
    const toggleId = `${inputId}-toggle`;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn('space-y-1.5', className)}>
        {label ? (
          <Label htmlFor={inputId} className="text-[13px] font-semibold text-slate-800">
            {label}
          </Label>
        ) : null}
        <div className="relative">
          {leading}
          <Input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'h-12 rounded-xl border-slate-200 pr-12 text-[13.5px] placeholder:text-slate-400 focus-visible:border-indigo-400',
              leading && 'pl-10',
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            autoComplete={autoComplete}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            id={toggleId}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            aria-controls={inputId}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
