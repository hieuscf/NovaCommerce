import { Separator } from '@novacommerce/ui/components/separator';

export function AuthDivider({ label = 'or continue' }: { label?: string }) {
  return (
    <div className="relative py-2">
      <Separator />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[12.5px] font-medium text-slate-400">
        {label}
      </span>
    </div>
  );
}
