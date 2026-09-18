'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronRight, CircleHelp, Search } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@novacommerce/ui/components/tooltip';
import { cn } from '@/lib/utils';
import type {
  PermissionActionColumn,
  PermissionCellViewModel,
  PermissionModuleGroupViewModel,
} from '@/lib/identity/get-roles-page';
import {
  rolesHref,
  type RolesGrantFilter,
  type RolesQuery,
} from '@/lib/url/roles-query';
import { MODULE_ICONS, TONE_WELL } from '@/components/roles/role-visuals';

const COLUMNS: { id: PermissionActionColumn; label: string; hint: string }[] = [
  { id: 'view', label: 'View', hint: 'Can see records in this module' },
  { id: 'create', label: 'Create', hint: 'Can create new records' },
  { id: 'edit', label: 'Edit', hint: 'Can update existing records' },
  { id: 'delete', label: 'Delete', hint: 'Can remove records' },
  { id: 'manage', label: 'Manage', hint: 'Can administer this module' },
];

const GRANT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'granted', label: 'Granted' },
  { id: 'not_granted', label: 'Not granted' },
] as const;

export function RolesPermissionMatrix({
  modules,
  query,
  assigningKey,
  onToggleGrant,
}: {
  modules: readonly PermissionModuleGroupViewModel[];
  query: RolesQuery;
  assigningKey: string | null;
  onToggleGrant: (cell: PermissionCellViewModel) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function navigate(next: Partial<RolesQuery>) {
    startTransition(() => {
      router.push(rolesHref({ ...query, ...next }));
    });
  }

  return (
    <div className="space-y-4" data-pending={pending || undefined}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Input
            key={query.pq ?? ''}
            type="search"
            defaultValue={query.pq ?? ''}
            placeholder="Search permissions..."
            aria-label="Search permissions"
            startAdornment={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
            className="h-10"
            groupClassName="rounded-full"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                navigate({ pq: event.currentTarget.value || undefined });
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Permission grant filter">
          {GRANT_FILTERS.map((item) => {
            const active = query.grant === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                className={cn(
                  'h-8 cursor-pointer rounded-full px-3.5',
                  active && 'shadow-sm shadow-primary/20',
                )}
                onClick={() => navigate({ grant: item.id as RolesGrantFilter })}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">No permissions match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another search or grant filter.
          </p>
        </div>
      ) : (
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="min-w-180 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    Module / Feature
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.id}
                      className="w-22 px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground"
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        {column.label}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="cursor-help text-muted-foreground/70 hover:text-muted-foreground"
                              aria-label={`${column.label} permission info`}
                            >
                              <CircleHelp className="size-3.5" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{column.hint}</TooltipContent>
                        </Tooltip>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <ModuleRows
                    key={module.id}
                    module={module}
                    collapsed={collapsed[module.id] === true}
                    assigningKey={assigningKey}
                    onToggleCollapse={() =>
                      setCollapsed((prev) => ({ ...prev, [module.id]: !prev[module.id] }))
                    }
                    onToggleGrant={onToggleGrant}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}

function ModuleRows({
  module,
  collapsed,
  assigningKey,
  onToggleCollapse,
  onToggleGrant,
}: {
  module: PermissionModuleGroupViewModel;
  collapsed: boolean;
  assigningKey: string | null;
  onToggleCollapse: () => void;
  onToggleGrant: (cell: PermissionCellViewModel) => void;
}) {
  const Icon = MODULE_ICONS[module.id] ?? MODULE_ICONS.admin;

  return (
    <>
      <tr className="border-b border-border/70">
        <td colSpan={6} className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-foreground"
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-lg',
                TONE_WELL[module.tone],
              )}
            >
              {Icon ? <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" /> : null}
            </span>
            {module.label}
          </button>
        </td>
      </tr>
      {!collapsed
        ? module.features.map((feature) => (
            <tr key={feature.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
              <td className="py-2.5 pr-3 pl-10">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {feature.label}
                </span>
              </td>
              {feature.cells.map((cell) => (
                <td key={cell.column} className="px-2 py-2.5 text-center">
                  <GrantCell
                    cell={cell}
                    busy={assigningKey === cell.busyKey}
                    onGrant={() => onToggleGrant(cell)}
                  />
                </td>
              ))}
            </tr>
          ))
        : null}
    </>
  );
}

function GrantCell({
  cell,
  busy,
  onGrant,
}: {
  cell: PermissionCellViewModel;
  busy: boolean;
  onGrant: () => void;
}) {
  if (cell.granted && cell.interactive) {
    return (
      <button
        type="button"
        disabled={busy}
        aria-label={`Revoke ${cell.key ?? cell.column}`}
        title="Granted — click to revoke"
        onClick={onGrant}
        className="inline-flex size-5 cursor-pointer items-center justify-center rounded-md hover:bg-success/10 disabled:cursor-wait disabled:opacity-60"
      >
        <Check className="size-4 text-success" strokeWidth={2.75} aria-hidden="true" />
        <span className="sr-only">Granted</span>
      </button>
    );
  }

  if (cell.interactive) {
    return (
      <button
        type="button"
        disabled={busy}
        aria-label={`Grant ${cell.key ?? cell.column}`}
        title="Not granted — click to grant"
        onClick={onGrant}
        className="mx-auto block size-4 cursor-pointer rounded-[5px] border border-slate-300 bg-white transition-colors hover:border-primary/50 disabled:cursor-wait disabled:opacity-60"
      />
    );
  }

  return (
    <span
      className="mx-auto block size-4 rounded-[5px] border border-dashed border-slate-200 bg-slate-50"
      title="No permission exists for this action"
      aria-hidden="true"
    />
  );
}
