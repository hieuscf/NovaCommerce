import { cn } from '@/lib/utils';

export function VisaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-8 items-center justify-center rounded-[3px] bg-[#1A1F71] px-1 text-[9px] font-extrabold tracking-tight text-white',
        className,
      )}
    >
      VISA
    </span>
  );
}

export function MastercardMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-5 w-8 items-center justify-center', className)}>
      <span className="absolute left-0.5 size-3.5 rounded-full bg-[#EB001B]" />
      <span className="absolute right-0.5 size-3.5 rounded-full bg-[#F79E1B]" />
      <span className="absolute left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-[#FF5F00] mix-blend-multiply" />
    </span>
  );
}

export function JcbMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex h-5 overflow-hidden rounded-[3px]', className)}>
      <span className="grid h-full w-2.5 place-items-center bg-[#0E4C96] text-[7px] font-bold text-white">J</span>
      <span className="grid h-full w-2.5 place-items-center bg-[#E31837] text-[7px] font-bold text-white">C</span>
      <span className="grid h-full w-2.5 place-items-center bg-[#007B49] text-[7px] font-bold text-white">B</span>
    </span>
  );
}

export function AmexMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-8 items-center justify-center rounded-[3px] bg-[#006FCF] px-1 text-[8px] font-extrabold tracking-tight text-white',
        className,
      )}
    >
      AMEX
    </span>
  );
}

export function CardNetworkMarks({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-1', className)} aria-hidden="true">
      <VisaMark />
      <MastercardMark />
      <JcbMark />
      <AmexMark />
    </span>
  );
}

export function PayPalMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 font-bold tracking-tight', className)}>
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009CDE]">Pal</span>
    </span>
  );
}

export function GooglePayMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-ink', className)}>
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.6z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
        <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.5l3.3-2.6z" />
        <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z" />
      </svg>
      Pay
    </span>
  );
}
