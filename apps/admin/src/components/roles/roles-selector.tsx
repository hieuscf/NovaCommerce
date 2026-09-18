'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Badge } from '@novacommerce/ui/components/badge';
import { cn } from '@/lib/utils';
import type { RoleRowViewModel } from '@/lib/identity/get-roles-page';
import { rolesHref, type RolesQuery } from '@/lib/url/roles-query';
import { ROLE_ICONS, TONE_WELL } from '@/components/roles/role-visuals';

export function RolesSelector({
  roles,
  selectedRoleId,
  query,
}: {
  roles: readonly RoleRowViewModel[];
  selectedRoleId: string | undefined;
  query: RolesQuery;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function selectRole(roleId: string) {
    startTransition(() => {
      router.push(
        rolesHref({
          ...query,
          roleId,
          tab: 'permissions',
          grant: 'all',
          pq: undefined,
          page: 1,
        }),
      );
    });
  }

  if (roles.length === 0) {
    return null;
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-1"
      data-pending={pending || undefined}
      role="listbox"
      aria-label="Roles"
    >
      {roles.map((role) => {
        const selected = role.id === selectedRoleId;
        const Icon = ROLE_ICONS[role.icon];

        return (
          <button
            key={role.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => selectRole(role.id)}
            className={cn(
              'min-w-52 max-w-56 shrink-0 cursor-pointer rounded-2xl border bg-card px-4 py-3.5 text-left shadow-sm transition-all duration-200',
              selected
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border hover:border-primary/30 hover:bg-muted/20',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  TONE_WELL[role.tone],
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{role.displayName}</p>
                <p className="mt-0.5 line-clamp-2 text-caption leading-snug text-muted-foreground">
                  {role.description}
                </p>
                <Badge
                  variant={role.isSystem ? 'info' : 'warning'}
                  className="mt-2 rounded-full px-2 py-0 text-[10px] leading-4"
                >
                  {role.isSystem ? 'System' : 'Custom'}
                </Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
