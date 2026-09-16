'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CreditCard,
  Headphones,
  Home,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@novacommerce/ui/components/dropdown-menu';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import { toast } from '@novacommerce/ui/components/toast';
import { useAccount } from '@/features/account/account-context';
import { toFormError } from '@/lib/errors';
import { paymentMethodsClient } from '@/lib/payment/client';
import { mapSavedPaymentMethodToAccountViewModel } from '@/lib/payment/mappers';
import {
  accountSectionHref,
  type AccountAddressViewModel,
  type AccountPaymentMethodViewModel,
} from '@/lib/view-models/account';
import { AccountAddressFormDialog } from './account-address-form-dialog';
import { AccountCard } from './account-card';
import { AccountSavedCardFormDialog } from './account-saved-card-form-dialog';
import { AccountSectionHeading } from './account-section-heading';

export function AccountLoyaltyCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-offer-rail p-5 shadow-card-soft">
      <AccountSectionHeading icon={Star} title="Loyalty Points" />
      <p className="mt-4 text-sm leading-relaxed text-copy">
        Loyalty rewards will appear here when the Loyalty API is available.
      </p>
      <Button
        asChild
        variant="secondary"
        size="sm"
        className="mt-4 h-9 rounded-full border-primary/20 bg-white/80 text-primary hover:bg-white"
      >
        <Link href={accountSectionHref('overview')}>
          Back to overview
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function AddressRow({
  address,
  onEdit,
}: {
  address: AccountAddressViewModel;
  onEdit: (address: AccountAddressViewModel) => void;
}) {
  const { deleteAddress, setDefaultAddress } = useAccount();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteAddress(address.id);
      toast.success('Address removed');
    } catch (error) {
      toast.error(toFormError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSetDefault() {
    setBusy(true);
    try {
      await setDefaultAddress(address.id);
      toast.success('Default address updated');
    } catch (error) {
      toast.error(toFormError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/80 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
        <Home className="size-[17px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 leading-relaxed">
        <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold text-foreground">
          {address.label}
          {address.isDefault ? <Badge variant="success">Default</Badge> : null}
        </p>
        <p className="text-[11.5px] text-muted-foreground">{address.line1}</p>
        {address.line2 ? (
          <p className="text-[11.5px] text-muted-foreground">{address.line2}</p>
        ) : null}
        <p className="text-[11.5px] text-muted-foreground">{address.formattedSecondary}</p>
      </div>
      <div className="flex shrink-0 items-center text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          aria-label={`Edit ${address.label}`}
          onClick={() => onEdit(address)}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              aria-label={`More options for ${address.label}`}
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!address.isDefault ? (
              <DropdownMenuItem
                disabled={busy}
                onSelect={() => {
                  void handleSetDefault();
                }}
              >
                Set as default
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onSelect={() => {
                void handleDelete();
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

export function AccountAddresses() {
  const { addresses, status } = useAccount();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountAddressViewModel | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(address: AccountAddressViewModel) {
    setEditing(address);
    setFormOpen(true);
  }

  return (
    <>
      <AccountCard>
        <div className="flex items-start justify-between gap-3">
          <AccountSectionHeading
            icon={MapPin}
            title="Saved Addresses"
            action="Manage All"
            href={accountSectionHref('addresses')}
          />
          <Button type="button" size="sm" variant="secondary" className="shrink-0" onClick={openCreate}>
            <Plus className="size-3.5" aria-hidden="true" />
            Add
          </Button>
        </div>
        {status === 'loading' ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading addresses…</p>
        ) : addresses.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No saved addresses"
              description="Add a delivery address to speed up checkout."
              action={
                <Button type="button" size="sm" onClick={openCreate}>
                  Add address
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {addresses.map((address) => (
              <AddressRow key={address.id} address={address} onEdit={openEdit} />
            ))}
          </ul>
        )}
      </AccountCard>
      <AccountAddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        address={editing}
      />
    </>
  );
}

function CardBrandMark({ brand }: { brand: AccountPaymentMethodViewModel['brand'] }) {
  if (brand === 'visa') {
    return <span className="text-xs font-extrabold tracking-tight text-[#1a1f71] italic">VISA</span>;
  }

  if (brand === 'mastercard') {
    return (
      <span className="relative block h-[18px] w-[30px]" aria-hidden="true">
        <span className="absolute top-0 left-0 size-[18px] rounded-full bg-[#eb001b]" />
        <span className="absolute top-0 right-0 size-[18px] rounded-full bg-[#f79e1b] opacity-90" />
      </span>
    );
  }

  return <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" />;
}

function PaymentMethodRow({
  card,
  busy,
  onSetDefault,
  onDelete,
}: {
  card: AccountPaymentMethodViewModel;
  busy: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/80 p-3.5">
      <span className="grid h-9 w-[54px] shrink-0 place-items-center rounded-lg border border-border bg-surface">
        <CardBrandMark brand={card.brand} />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[13px] font-bold text-foreground">•••• {card.last4}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">Expires {card.expires}</p>
      </div>
      {card.isDefault ? (
        <Badge variant="success" className="shrink-0">
          Default
        </Badge>
      ) : null}
      <div className="flex shrink-0 items-center text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          aria-label={`Remove card ending in ${card.last4}`}
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              aria-label={`More options for card ending in ${card.last4}`}
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!card.isDefault ? (
              <DropdownMenuItem
                disabled={busy}
                onSelect={() => {
                  onSetDefault();
                }}
              >
                Set as default
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onSelect={() => {
                onDelete();
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

/**
 * Alloy Payment Methods card. List markup matches the original dashboard fixture
 * (brand mark, masked last4, expiry, Default badge, pencil + more). Data from
 * Gateway `GET/POST/DELETE /users/me/payment-methods` — CVV never stored.
 */
export function AccountPaymentMethods() {
  const [methods, setMethods] = useState<AccountPaymentMethodViewModel[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await paymentMethodsClient.list();
      setMethods(list.map(mapSavedPaymentMethodToAccountViewModel));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await paymentMethodsClient.remove(id);
      toast.success('Card removed');
      await load();
    } catch (error) {
      toast.error(toFormError(error));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);
    try {
      await paymentMethodsClient.setDefault(id);
      toast.success('Default card updated');
      await load();
    } catch (error) {
      toast.error(toFormError(error));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AccountCard>
        <div className="flex items-start justify-between gap-3">
          <AccountSectionHeading
            icon={CreditCard}
            title="Payment Methods"
            action="Manage All"
            href={accountSectionHref('payment')}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add
          </Button>
        </div>
        {status === 'loading' ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading payment methods…</p>
        ) : status === 'error' ? (
          <div className="mt-4">
            <EmptyState
              title="Could not load cards"
              description="Try again in a moment."
              action={
                <Button type="button" size="sm" onClick={() => void load()}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : methods.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No payment methods yet"
              description="Add a card to speed up checkout. CVV is never stored."
              action={
                <Button type="button" size="sm" onClick={() => setFormOpen(true)}>
                  Add card
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {methods.map((card) => (
              <PaymentMethodRow
                key={card.id}
                card={card}
                busy={busyId === card.id}
                onSetDefault={() => {
                  void handleSetDefault(card.id);
                }}
                onDelete={() => {
                  void handleDelete(card.id);
                }}
              />
            ))}
          </ul>
        )}
      </AccountCard>
      <AccountSavedCardFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={load} />
    </>
  );
}

export function AccountHelp() {
  return (
    <AccountCard>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
          <Headphones className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Need Help?</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Our support team is here to help you
          </p>
          <Button asChild size="sm" variant="primary-gradient" className="mt-3 h-9 rounded-full">
            <Link href={accountSectionHref('help')}>
              Contact Support
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </AccountCard>
  );
}
