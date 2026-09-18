'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Warehouse,
} from 'lucide-react';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';
import { cn } from '@/lib/utils';

export interface AdminNavChild {
  href: string;
  label: string;
  match?: { status?: string };
}

export interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  expandable?: boolean;
  children?: AdminNavChild[];
}

export const adminNavItems: AdminNavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/products',
    label: 'Products',
    icon: Package,
    expandable: true,
    children: [
      { href: '/products', label: 'All Products' },
      { href: '/products/categories', label: 'Categories' },
      { href: '/products/brands', label: 'Brands' },
      { href: '/products/attributes', label: 'Attributes' },
      { href: '/products/reviews', label: 'Reviews' },
    ],
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: ShoppingCart,
    expandable: true,
    children: [
      { href: '/orders', label: 'All Orders' },
      { href: '/orders?status=pending', label: 'Pending', match: { status: 'pending' } },
      {
        href: '/orders?status=processing',
        label: 'Processing',
        match: { status: 'processing' },
      },
      { href: '/orders?status=shipped', label: 'Shipped', match: { status: 'shipped' } },
      { href: '/orders?status=delivered', label: 'Delivered', match: { status: 'delivered' } },
      { href: '/orders?status=cancelled', label: 'Cancelled', match: { status: 'cancelled' } },
    ],
  },
  {
    href: '/accounts',
    label: 'Accounts',
    icon: Users,
    expandable: true,
    children: [
      { href: '/accounts', label: 'All Accounts' },
      { href: '/accounts/roles', label: 'Roles & Permissions' },
    ],
  },
  { href: '/inventory', label: 'Inventory', icon: Warehouse, expandable: true },
  {
    href: '/sellers',
    label: 'Sellers',
    icon: Store,
    expandable: true,
    children: [
      { href: '/sellers', label: 'All Sellers' },
      { href: '/sellers/approvals', label: 'Pending Approval' },
      { href: '/sellers?status=suspended', label: 'Suspended', match: { status: 'suspended' } },
    ],
  },
  { href: '/promotions', label: 'Promotions', icon: Percent, expandable: true },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, expandable: true },
  { href: '/content', label: 'Content', icon: FileText, expandable: true },
  { href: '/settings', label: 'Settings', icon: Settings, expandable: true },
];

function isActivePath(pathname: string, href: string) {
  const pathOnly = href.split('?')[0] ?? href;
  if (pathOnly === '/') return pathname === '/';
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function isChildActive(
  pathname: string,
  searchParams: URLSearchParams,
  child: AdminNavChild,
) {
  const pathOnly = child.href.split('?')[0] ?? child.href;

  if (child.match?.status) {
    if (pathname === '/sellers') {
      return searchParams.get('status') === child.match.status;
    }
    if (pathname === '/orders') {
      return searchParams.get('status') === child.match.status;
    }
    return false;
  }

  if (pathOnly === '/accounts') {
    return pathname === '/accounts';
  }

  if (pathOnly === '/sellers/approvals') {
    return pathname === '/sellers/approvals' || pathname.startsWith('/sellers/approvals/');
  }

  if (pathOnly === '/sellers') {
    return (
      pathname === '/sellers' &&
      !searchParams.get('status') &&
      !pathname.startsWith('/sellers/')
    );
  }

  if (pathOnly === '/orders') {
    return pathname === '/orders' && !searchParams.get('status');
  }

  if (pathOnly === '/products') {
    if (pathname === '/products') return true;
    const segment = pathname.split('/')[2];
    const reserved = new Set(['categories', 'brands', 'attributes', 'reviews']);
    return Boolean(segment) && !reserved.has(segment);
  }

  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of adminNavItems) {
      if (item.children && isActivePath(pathname, item.href)) {
        next[item.href] = true;
      }
    }
    setOpenSections((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4" aria-label="Admin navigation">
      {adminNavItems.map((item) => {
        const { href, label, icon: Icon, expandable, children } = item;
        const active = isActivePath(pathname, href);
        const expanded = Boolean(children && (openSections[href] || active));

        if (children?.length) {
          return (
            <div key={href} className="space-y-0.5">
              <button
                type="button"
                onClick={() =>
                  setOpenSections((prev) => ({ ...prev, [href]: !expanded }))
                }
                className={cn(
                  'group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )}
                aria-expanded={expanded}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="flex-1 truncate text-left">{label}</span>
                <ChevronDown
                  className={cn(
                    'size-3.5 shrink-0 opacity-70 transition-transform duration-150',
                    expanded && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {expanded ? (
                <ul className="ml-4 space-y-0.5 border-l border-white/10 py-1 pl-3">
                  {children.map((child) => {
                    const childActive = isChildActive(pathname, searchParams, child);
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          aria-current={childActive ? 'page' : undefined}
                          className={cn(
                            'relative flex items-center rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                            childActive
                              ? 'bg-white/10 font-semibold text-white'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                          )}
                        >
                          {childActive ? (
                            <span
                              className="absolute top-1/2 -left-3 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sky-400"
                              aria-hidden="true"
                            />
                          ) : null}
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
              active
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-300 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 truncate">{label}</span>
            {expandable ? (
              <ChevronDown
                className="size-3.5 shrink-0 -rotate-90 opacity-60"
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebarBrand() {
  return (
    <div className="flex h-16 items-center border-b border-white/10 px-5">
      <Link href="/" className="flex shrink-0 items-center" aria-label="NovaCommerce Admin">
        <NovaCommerceLogo
          size={26}
          tone="inverse"
          subLabel="Admin"
          wordmarkClassName="text-white"
        />
      </Link>
    </div>
  );
}

export function AdminSidebarFooter() {
  return (
    <div className="mt-auto border-t border-white/10 px-5 py-4">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-40 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        <span>System Online</span>
        <span className="ml-auto font-mono text-[11px] text-slate-500">v1.0.0</span>
      </div>
    </div>
  );
}

export function AdminSidebarPanel({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className={cn('flex h-full flex-col bg-slate-950 text-white', className)}>
      <AdminSidebarBrand />
      <AdminSidebarNav onNavigate={onNavigate} />
      <AdminSidebarFooter />
    </div>
  );
}
