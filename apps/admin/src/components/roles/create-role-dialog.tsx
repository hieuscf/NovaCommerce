'use client';

import { useState } from 'react';
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
import { rolesClient } from '@/lib/identity/roles-client';
import { toFormError } from '@/lib/errors';

export function CreateRoleDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Role name must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await rolesClient.createRole({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      onOpenChange(false);
      onCreated();
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
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Create a new role via Gateway <code className="text-caption">POST /roles</code>.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. support"
              autoComplete="off"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional short description"
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
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-500/90 hover:to-violet-500/90"
            >
              {submitting ? 'Creating…' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
