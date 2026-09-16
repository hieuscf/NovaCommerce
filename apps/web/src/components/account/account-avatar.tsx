import { cn } from '@/lib/utils';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'NC';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function AccountAvatar({
  size = 44,
  name,
  imageUrl,
  className,
}: {
  size?: number;
  name?: string;
  imageUrl?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote avatar URL from User API
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (name) {
    return (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-full bg-primary-tint text-primary',
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(12, size * 0.32) }}
        aria-hidden="true"
      >
        <span className="font-bold tracking-tight">{initialsFromName(name)}</span>
      </span>
    );
  }

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
