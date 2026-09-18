'use client';

import { useEffect, useState } from 'react';
import { Button } from '@novacommerce/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@novacommerce/ui/components/dialog';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { Textarea } from '@novacommerce/ui/components/textarea';
import type { RoleRowViewModel } from '@/lib/identity/get-roles-page';
import { rolesClient } from '@/lib/identity/roles-client';
import { toFormError } from '@/lib/errors';

export function EditRoleDialog({
  role,
  open,
  onOpenChange,
  onUpdated,
}: {
  role: RoleRowViewModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !role) return;
    setName(role.name);
    setDescription(role.description);
    setError(null);
  }, [open, role]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) return;

    const trimmedName = name.trim();
    if (!role.isSystem && trimmedName.length < 2) {
      setError('Role name must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await rolesClient.updateRole(role.id, {
        name: role.isSystem ? undefined : trimmedName,
        description: description.trim(),
      });
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(toFormError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update this role via Gateway <code className="text-caption">PATCH /roles/:id</code>.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-role-name">Name</Label>
            <Input
              id="edit-role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={role?.isSystem}
              autoComplete="off"
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role-description">Description</Label>
            <Textarea
              id="edit-role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
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
            <Button type="submit" disabled={submitting || !role}>
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
