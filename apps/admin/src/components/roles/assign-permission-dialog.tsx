'use client';

import { useMemo, useState } from 'react';
import { Button } from '@novacommerce/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@novacommerce/ui/components/dialog';
import { Label } from '@novacommerce/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import type { RoleRowViewModel } from '@/lib/identity/get-roles-page';
import type { PermissionDto } from '@/lib/identity/types';
import { rolesClient } from '@/lib/identity/roles-client';
import { toFormError } from '@/lib/errors';

export function AssignPermissionDialog({
  role,
  permissions,
  open,
  onOpenChange,
  onAssigned,
}: {
  role: RoleRowViewModel | null;
  permissions: readonly PermissionDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}) {
  const [permissionKey, setPermissionKey] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(() => {
    if (!role) return [];
    const owned = new Set(role.permissionKeys);
    return permissions.filter((permission) => !owned.has(permission.key));
  }, [permissions, role]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role || !permissionKey) {
      setError('Select a permission to assign.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await rolesClient.assignPermission(role.id, { permissionKey });
      setPermissionKey('');
      onOpenChange(false);
      onAssigned();
    } catch (err) {
      setError(toFormError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setPermissionKey('');
        onOpenChange(next);
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign Permission</DialogTitle>
          <DialogDescription>
            {role
              ? `Add a permission key to “${role.displayName}”.`
              : 'Select a role first.'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="permission-key">Permission</Label>
            <Select value={permissionKey || undefined} onValueChange={setPermissionKey}>
              <SelectTrigger id="permission-key" className="h-10" aria-label="Permission key">
                <SelectValue placeholder="Select permission key" />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No remaining permissions
                  </SelectItem>
                ) : (
                  available.map((permission) => (
                    <SelectItem key={permission.id} value={permission.key}>
                      {permission.key}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || available.length === 0}>
              {submitting ? 'Assigning…' : 'Assign Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
