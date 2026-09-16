'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@novacommerce/ui/components/input';
import { cn } from '@/lib/utils';

export function HeaderSearchForm({
  className,
  inputClassName,
  groupClassName,
  placeholder,
  onSearch,
}: {
  className?: string;
  inputClassName?: string;
  groupClassName?: string;
  placeholder: string;
  onSearch?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = pathname === '/shop' || pathname.startsWith('/shop/') ? searchParams.get('q') ?? '' : '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = form.get('q');
    const q = typeof raw === 'string' ? raw.trim() : '';
    onSearch?.();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  }

  return (
    <form role="search" action="/shop" method="get" className={cn('w-full', className)} onSubmit={handleSubmit}>
      <Input
        key={currentQuery}
        type="search"
        name="q"
        defaultValue={currentQuery}
        placeholder={placeholder}
        maxLength={200}
        startAdornment={<Search aria-hidden="true" />}
        className={inputClassName}
        groupClassName={groupClassName}
        aria-label="Search products"
      />
    </form>
  );
}
