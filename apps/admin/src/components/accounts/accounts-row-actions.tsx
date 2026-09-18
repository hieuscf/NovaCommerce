'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { isApiClientError } from '@novacommerce/frontend';
import { Button } from '@novacommerce/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@novacommerce/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@novacommerce/ui/components/dropdown-menu';
import { toast } from '@novacommerce/ui/components/toast';
import { signOut } from '@/lib/auth/session';
import { toFormError } from '@/lib/errors';
import type { AccountRowViewModel } from '@/lib/identity/get-accounts-page';
import { identitiesClient } from '@/lib/identity/identities-client';

export function AccountsRowActions({
  account,
  onUpdated,
}: {
  account: AccountRowViewModel;
  onUpdated: () => void;
}) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = account.status === 'blocked';

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      await identitiesClient.updateIdentityLock(account.id, !locked);
      toast.success(locked ? `${account.name} unlocked` : `${account.name} locked`);
      setPromptOpen(false);
      onUpdated();
    } catch (caught) {
      if (isApiClientError(caught) && caught.status === 401) {
        signOut();
        return;
      }
      setError(toFormError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${account.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setPromptOpen(true)}>
            <Pencil aria-hidden="true" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={promptOpen}
        onOpenChange={(open) => {
          if (submitting) return;
          setPromptOpen(open);
          setError(null);
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{locked ? 'Unlock account' : 'Lock account'}</DialogTitle>
            <DialogDescription>
              {locked
                ? `Unlock ${account.name} (${account.email})? They will be able to sign in again.`
                : `Lock ${account.name} (${account.email})? They will not be able to sign in.`}
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPromptOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={locked ? 'default' : 'destructive'}
              onClick={() => void confirm()}
              disabled={submitting}
            >
              {submitting ? 'Saving…' : locked ? 'Unlock account' : 'Lock account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
