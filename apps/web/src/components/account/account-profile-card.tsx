'use client';

import { useState } from 'react';
import { Gift, MapPin, Pencil, Settings2, Star } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { useAccount } from '@/features/account/account-context';
import { AccountAvatar } from './account-avatar';
import { AccountCard } from './account-card';
import { AccountProfileFormDialog } from './account-profile-form-dialog';

const STAT_ICONS = {
  addresses: MapPin,
  preferences: Settings2,
  member: Gift,
} as const;

export function AccountProfileCard() {
  const { profile, stats, status } = useAccount();
  const [editOpen, setEditOpen] = useState(false);

  if (status === 'loading' || !profile) {
    return (
      <AccountCard padded={false}>
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <Skeleton className="size-[82px] rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>
      </AccountCard>
    );
  }

  return (
    <>
      <AccountCard padded={false}>
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <AccountAvatar size={82} name={profile.name} imageUrl={profile.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="text-[19px] font-extrabold text-foreground">{profile.name}</p>
            {profile.phoneNumber ? (
              <p className="mt-1 text-[13px] text-muted-foreground">{profile.phoneNumber}</p>
            ) : (
              <p className="mt-1 text-[13px] text-muted-foreground">No phone number on file</p>
            )}
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1 text-[11.5px] font-semibold text-primary">
              <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              {profile.membershipLabel}
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 rounded-xl"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 border-t border-border/70 sm:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = STAT_ICONS[stat.id];
            return (
              <div
                key={stat.id}
                className={`flex items-center gap-3 px-6 py-5 ${index > 0 ? 'sm:border-l sm:border-border/70' : ''}`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-base font-bold text-foreground">{stat.value}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </AccountCard>
      <AccountProfileFormDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
