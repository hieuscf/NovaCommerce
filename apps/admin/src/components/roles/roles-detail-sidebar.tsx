import { AlertCircle, Copy, Pencil, Shield, Trash2, Users } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import {
  formatRoleTimestamp,
  type RoleDetailViewModel,
} from '@/lib/identity/get-roles-page';
import { ROLE_ICONS, TONE_WELL } from '@/components/roles/role-visuals';

export function RolesDetailSidebar({
  detail,
  onEdit,
  onManageUsers,
  onDuplicate,
  onDelete,
  duplicating,
  deleting,
}: {
  detail: RoleDetailViewModel;
  onEdit?: () => void;
  onManageUsers?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  duplicating?: boolean;
  deleting?: boolean;
}) {
  const { role, grantedCount, totalCount, percent } = detail;
  const remaining = Math.max(totalCount - grantedCount, 0);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;
  const Icon = ROLE_ICONS[role.icon];

  return (
    <aside className="space-y-4 xl:w-75 xl:shrink-0">
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex size-8 items-center justify-center rounded-lg ${TONE_WELL[role.tone]}`}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-foreground">Role Information</h3>
          </div>
          <InfoRow label="Name" value={role.displayName} />
          <InfoRow
            label="Type"
            value={
              <Badge variant={role.isSystem ? 'info' : 'warning'} className="rounded-full">
                {role.isSystem ? 'System Role' : 'Custom Role'}
              </Badge>
            }
          />
          <InfoRow label="Description" value={role.description} />
          <InfoRow label="Created At" value={formatRoleTimestamp(role.createdAt)} />
          <InfoRow label="Updated At" value={formatRoleTimestamp(role.updatedAt)} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">Permission Summary</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2 py-0.5 text-caption font-medium text-success-strong">
              <span className="size-1.5 rounded-full bg-success-strong" aria-hidden="true" />
              Enabled
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative size-22 shrink-0" aria-hidden="true">
              <svg viewBox="0 0 88 88" className="size-full -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="text-success transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold tabular-nums text-foreground">{percent}%</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold tabular-nums text-foreground">
                {grantedCount} / {totalCount}
              </p>
              <p className="text-caption text-muted-foreground">permissions granted</p>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="flex items-center justify-between text-caption">
              <span className="inline-flex items-center gap-1.5 text-success-strong">
                <span className="size-1.5 rounded-full bg-success-strong" aria-hidden="true" />
                Granted
              </span>
              <span className="font-medium tabular-nums text-foreground">{grantedCount}</span>
            </p>
            <p className="flex items-center justify-between text-caption">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
                Not granted
              </span>
              <span className="font-medium tabular-nums text-foreground">{remaining}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="space-y-2 p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-2 rounded-xl bg-slate-50 text-foreground hover:bg-slate-100"
            onClick={onEdit}
            disabled={!onEdit}
          >
            <Pencil className="size-4 text-primary" aria-hidden="true" />
            Edit Role
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-2 rounded-xl bg-slate-50 text-foreground hover:bg-slate-100"
            onClick={onManageUsers}
            disabled={!onManageUsers}
          >
            <Users className="size-4 text-primary" aria-hidden="true" />
            Manage Users
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-2 rounded-xl bg-slate-50 text-foreground hover:bg-slate-100"
            onClick={onDuplicate}
            disabled={!onDuplicate || duplicating}
          >
            <Copy className="size-4 text-primary" aria-hidden="true" />
            {duplicating ? 'Duplicating…' : 'Duplicate Role'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-2 rounded-xl bg-red-50 text-destructive hover:bg-red-100 hover:text-destructive"
            onClick={onDelete}
            disabled={role.isSystem || !onDelete || deleting}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {deleting ? 'Deleting…' : 'Delete Role'}
          </Button>
        </CardContent>
      </Card>

      {role.isSystem ? (
        <div className="flex gap-2.5 rounded-2xl border border-info/25 bg-info/10 px-4 py-3 text-sm leading-relaxed text-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
          <p>
            System roles (Super Admin, Administrator) cannot be deleted, but they can be edited.
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="shrink-0 text-caption text-muted-foreground">{label}</p>
      <div className="text-right text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
