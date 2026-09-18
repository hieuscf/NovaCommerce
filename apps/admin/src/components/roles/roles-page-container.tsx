'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@novacommerce/ui/components/tabs';
import { CreateRoleDialog } from '@/components/roles/create-role-dialog';
import { EditRoleDialog } from '@/components/roles/edit-role-dialog';
import { RolesDetailSidebar } from '@/components/roles/roles-detail-sidebar';
import { RolesPermissionMatrix } from '@/components/roles/roles-permission-matrix';
import { RolesSelector } from '@/components/roles/roles-selector';
import { useAdminSession } from '@/features/auth/use-session';
import {
  applyPermissionCellToggle,
  buildRolesPageViewModel,
  formatRoleTimestamp,
  type PermissionCellViewModel,
  type RoleRowViewModel,
  type RolesPageViewModel,
} from '@/lib/identity/get-roles-page';
import { rolesClient } from '@/lib/identity/roles-client';
import type { PermissionDto, RoleDto, RoleMemberDto } from '@/lib/identity/types';
import { signOut } from '@/lib/auth/session';
import { toFormError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { isApiClientError } from '@novacommerce/frontend';
import { ROLE_ICONS, TONE_WELL } from '@/components/roles/role-visuals';
import { rolesHref, type RolesQuery, type RolesTab } from '@/lib/url/roles-query';

const pageMeta = {
  title: 'Roles & Permissions',
  description: 'Manage roles, permissions, and access control across your platform.',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Accounts', href: '/accounts' },
    { label: 'Roles & Permissions' },
  ],
} as const;

type LoadState =
  | { status: 'loading' }
  | {
      status: 'ready';
      roles: RoleDto[];
      permissions: PermissionDto[];
      view: RolesPageViewModel;
      members: RoleMemberDto[];
    }
  | { status: 'error'; message: string };

export function RolesPageContainer({ query }: { query: RolesQuery }) {
  const session = useAdminSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assigningKey, setAssigningKey] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!session.isAuthenticated) {
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void (async () => {
      try {
        const [roles, permissions] = await Promise.all([
          rolesClient.listRoles(),
          rolesClient.listPermissions(),
        ]);
        if (cancelled) return;
        const view = buildRolesPageViewModel(roles, permissions, query);
        let members: RoleMemberDto[] = [];
        if (view.selectedRole) {
          members = await rolesClient.listRoleMembers(view.selectedRole.id);
        }
        if (cancelled) return;
        setState({ status: 'ready', roles, permissions, view, members });

        if (view.selectedRole && view.selectedRole.id !== query.roleId) {
          startTransition(() => {
            router.replace(rolesHref({ ...query, roleId: view.selectedRole!.id }));
          });
        }
      } catch (error) {
        if (cancelled) return;
        if (isApiClientError(error) && error.status === 401) {
          signOut();
          return;
        }
        setState({ status: 'error', message: toFormError(error) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    query.q,
    query.type,
    query.roleId,
    query.tab,
    query.grant,
    query.pq,
    query.page,
    session.isAuthenticated,
    reloadKey,
    router,
  ]);

  async function handleTogglePermission(cell: PermissionCellViewModel) {
    if (state.status !== 'ready' || !state.view.selectedRole || !cell.interactive) return;
    const role = state.view.selectedRole;
    setActionError(null);
    setAssigningKey(cell.busyKey);
    const previousRoles = state.roles;
    const nextKeys = applyPermissionCellToggle(role.permissionKeys, cell);
    const optimisticRoles = previousRoles.map((item) =>
      item.id === role.id
        ? { ...item, permissions: nextKeys, updatedAt: new Date().toISOString() }
        : item,
    );
    setState({
      ...state,
      roles: optimisticRoles,
      view: buildRolesPageViewModel(optimisticRoles, state.permissions, query),
    });

    try {
      const updated = await rolesClient.updatePermissions(role.id, {
        changes: cell.keys.map((permissionKey) => ({
          permissionKey,
          granted: !cell.granted,
        })),
      });
      const confirmedRoles = optimisticRoles.map((item) => (item.id === updated.id ? updated : item));
      setState((current) =>
        current.status === 'ready'
          ? {
              ...current,
              roles: confirmedRoles,
              view: buildRolesPageViewModel(confirmedRoles, current.permissions, query),
            }
          : current,
      );
    } catch (error) {
      setState((current) =>
        current.status === 'ready'
          ? {
              ...current,
              roles: previousRoles,
              view: buildRolesPageViewModel(previousRoles, current.permissions, query),
            }
          : current,
      );
      setActionError(toFormError(error));
    } finally {
      setAssigningKey(null);
    }
  }

  async function handleDuplicate() {
    if (state.status !== 'ready' || !state.view.selectedRole) return;
    setActionError(null);
    setDuplicating(true);
    try {
      const copy = await rolesClient.duplicateRole(state.view.selectedRole.id);
      startTransition(() => {
        router.push(rolesHref({ ...query, roleId: copy.id, tab: 'permissions' }));
      });
      reload();
    } catch (error) {
      setActionError(toFormError(error));
    } finally {
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    if (state.status !== 'ready' || !state.view.selectedRole) return;
    const role = state.view.selectedRole;
    if (role.isSystem) return;
    const confirmed = window.confirm(`Delete role "${role.displayName}"? This cannot be undone.`);
    if (!confirmed) return;

    setActionError(null);
    setDeleting(true);
    try {
      await rolesClient.deleteRole(role.id);
      startTransition(() => {
        router.push(rolesHref({ ...query, roleId: undefined, tab: 'permissions' }));
      });
      reload();
    } catch (error) {
      setActionError(toFormError(error));
    } finally {
      setDeleting(false);
    }
  }

  function setTab(tab: RolesTab) {
    startTransition(() => {
      router.push(rolesHref({ ...query, tab }));
    });
  }

  if (!session.isAuthenticated || state.status === 'loading') {
    return <RolesDetailSkeleton />;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-6">
        <RolesPageHeader onCreate={() => setCreateOpen(true)} />
        <ErrorState
          title="Could not load roles"
          description={state.message}
          action={
            <Button type="button" onClick={reload}>
              Try again
            </Button>
          }
        />
        <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={reload} />
      </div>
    );
  }

  const { view, members } = state;
  const selected = view.selectedRole;
  const detail = view.detail;

  return (
    <div className="space-y-6" data-pending={pending || undefined}>
      <RolesPageHeader onCreate={() => setCreateOpen(true)} />

      <RolesSelector
        roles={view.filteredRoles}
        selectedRoleId={selected?.id}
        query={query}
      />

      {!selected || !detail ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">No roles found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a role or check Gateway Identity seeding.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <Card className="min-w-0 flex-1 rounded-2xl border-border shadow-sm">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <RoleDetailHeader role={selected} onEdit={() => setEditOpen(true)} />

              {actionError ? (
                <p className="text-sm text-destructive" role="alert">
                  {actionError}
                </p>
              ) : null}

              <Tabs value={query.tab} onValueChange={(value) => setTab(value as RolesTab)}>
                <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
                  <TabsTrigger
                    value="permissions"
                    className="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Permissions
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Users ({selected.memberCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="description"
                    className="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Description
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="permissions" className="mt-4">
                  <RolesPermissionMatrix
                    modules={detail.modules}
                    query={query}
                    assigningKey={assigningKey}
                    onToggleGrant={handleTogglePermission}
                  />
                </TabsContent>

                <TabsContent value="users" className="mt-4">
                  <RoleMembersTable members={members} />
                </TabsContent>

                <TabsContent value="description" className="mt-4">
                  <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4">
                    <p className="text-sm leading-relaxed text-foreground">{selected.description}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <RolesDetailSidebar
            detail={detail}
            onEdit={() => setEditOpen(true)}
            onManageUsers={() => setTab('users')}
            onDuplicate={() => void handleDuplicate()}
            onDelete={selected.isSystem ? undefined : () => void handleDelete()}
            duplicating={duplicating}
            deleting={deleting}
          />
        </div>
      )}

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={reload} />
      <EditRoleDialog
        role={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={reload}
      />
    </div>
  );
}

function RoleMembersTable({ members }: { members: readonly RoleMemberDto[] }) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
        <p className="text-sm font-semibold text-foreground">No users assigned</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This role has no identities in Gateway yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold text-muted-foreground">
            <th className="px-4 py-2.5">Email</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Created At</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-2.5 font-medium text-foreground">{member.email}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{member.status}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {formatRoleTimestamp(member.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoleDetailHeader({
  role,
  onEdit,
}: {
  role: RoleRowViewModel;
  onEdit: () => void;
}) {
  const Icon = ROLE_ICONS[role.icon];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-2xl',
            TONE_WELL[role.tone],
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {role.displayName}
            </h2>
            <Badge variant={role.isSystem ? 'info' : 'warning'} className="rounded-full">
              {role.isSystem ? 'System Role' : 'Custom Role'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="cursor-pointer gap-1.5 rounded-xl text-primary hover:bg-primary/5 hover:text-primary"
        onClick={onEdit}
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        Edit Role
      </Button>
    </div>
  );
}

function RolesPageHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            {pageMeta.breadcrumb.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
                {'href' in crumb && crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{pageMeta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pageMeta.description}</p>
      </div>

      <Button
        size="sm"
        onClick={onCreate}
        className="w-fit cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
      >
        <Plus className="size-4" aria-hidden="true" />
        Create Role
      </Button>
    </div>
  );
}

function RolesDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading role details">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-44 shrink-0 rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-4 xl:flex-row">
        <Skeleton className="h-[520px] flex-1 rounded-2xl" />
        <Skeleton className="h-[520px] w-full rounded-2xl xl:w-[300px]" />
      </div>
    </div>
  );
}
