import { cn } from '@/lib/utils';

export function AccountAvatar({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn('relative shrink-0 overflow-hidden rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundImage: 'linear-gradient(170deg, #cbd5e1 0%, #94a3b8 100%)',
      }}
      aria-hidden="true"
    >
      <span
        className="absolute left-1/2 rounded-full bg-[#4b3a30]"
        style={{
          width: size * 0.38,
          height: size * 0.38,
          top: size * 0.17,
          marginLeft: -(size * 0.19),
        }}
      />
      <span
        className="absolute bottom-0 left-1/2 rounded-t-full bg-[#2f3a4a]"
        style={{
          width: size * 0.72,
          height: size * 0.42,
          marginLeft: -(size * 0.36),
        }}
      />
    </span>
  );
}
