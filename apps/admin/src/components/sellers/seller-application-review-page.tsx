'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  ImageIcon,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@novacommerce/ui/components/alert';
import { Avatar, AvatarFallback } from '@novacommerce/ui/components/avatar';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Label } from '@novacommerce/ui/components/label';
import { Textarea } from '@novacommerce/ui/components/textarea';
import { toast } from '@novacommerce/ui/components/toast';
import { cn } from '@/lib/utils';
import {
  approvalStatusLabel,
  type ApprovalStatus,
  type SellerApplication,
} from '@/lib/mock-data/seller-approvals';

const REVIEW_CHECKS = [
  {
    id: 'business',
    label: 'Business information matches submitted documents (name, tax ID, license, address).',
  },
  {
    id: 'shop',
    label: 'Shop details are complete and appropriate (name, category, description, branding).',
  },
  {
    id: 'verification',
    label: 'Verification documents are readable and valid for the selected selling model.',
  },
  {
    id: 'agreements',
    label: 'Seller accepted Terms & Conditions, Seller Agreement, and Privacy Policy.',
  },
] as const;

type CheckId = (typeof REVIEW_CHECKS)[number]['id'];

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const variant =
    status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'destructive';
  return (
    <Badge variant={variant} className="rounded-full">
      {approvalStatusLabel[status]}
      {status === 'pending' ? ' Approval' : ''}
    </Badge>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-foreground">{value || '—'}</dd>
    </div>
  );
}

function SectionCard({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="secondary" className="rounded-full">
          {step}
        </Badge>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function SellerApplicationReviewPage({
  application,
}: {
  application: SellerApplication;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState<Record<CheckId, boolean>>({
    business: false,
    shop: false,
    verification: false,
    agreements: false,
  });
  const [decision, setDecision] = useState<ApprovalStatus>(application.status);

  const allChecked = useMemo(
    () => REVIEW_CHECKS.every((item) => checks[item.id]),
    [checks],
  );
  const canApprove = decision === 'pending' && allChecked;
  const isFinalized = decision === 'approved' || decision === 'rejected';

  function toggleCheck(id: CheckId, value: boolean) {
    setChecks((prev) => ({ ...prev, [id]: value }));
  }

  function handleApprove() {
    if (!canApprove) {
      toast.warning('Complete the verification checklist before approving.');
      return;
    }
    setDecision('approved');
    toast.success(`Approved ${application.shopName}`, {
      description: 'Seller account can be activated once the Seller Gateway is wired.',
    });
  }

  function handleReject() {
    if (!notes.trim()) {
      toast.warning('Add a rejection reason in review notes.');
      return;
    }
    setDecision('rejected');
    toast.error(`Rejected ${application.shopName}`, {
      description: notes.trim(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-foreground hover:underline">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                <Link href="/sellers" className="hover:text-foreground hover:underline">
                  Sellers
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                <Link
                  href="/sellers/approvals"
                  className="hover:text-foreground hover:underline"
                >
                  Pending Approval
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                <span className="text-foreground">{application.name}</span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={() => router.push('/sellers/approvals')}
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back to list
            </Button>
            <StatusBadge status={decision} />
          </div>

          <div className="mt-4 flex items-start gap-3">
            <Avatar className="size-14">
              <AvatarFallback
                className="text-base font-semibold text-white"
                style={{ backgroundColor: application.accent }}
              >
                {application.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {application.name}
              </h1>
              <p className="text-sm text-muted-foreground">{application.email}</p>
              <p className="mt-1 text-sm text-foreground">
                {application.shopName}{' '}
                <span className="text-muted-foreground">· {application.displayId}</span>
              </p>
              <p className="mt-1 text-caption text-muted-foreground">
                Submitted {application.submittedAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Alert variant="info">
        <ShieldCheck aria-hidden="true" />
        <AlertContent>
          <AlertTitle>Review before approval</AlertTitle>
          <AlertDescription>
            Compare every section below with the seller registration on the storefront. Only approve
            when the checklist is complete and the information is accurate.
          </AlertDescription>
        </AlertContent>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <SectionCard title="Business Information" step="Step 1 · Register">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="Business Name" value={application.business.businessName} />
              <Field label="Business Type" value={application.business.businessTypeLabel} />
              <Field label="Legal Business Name" value={application.business.legalBusinessName} />
              <Field label="National ID / Passport" value={application.business.identityNumber} />
              <Field label="Business Email" value={application.business.businessEmail} />
              <Field label="Phone Number" value={application.business.phone} />
              <Field
                label="Business Registration Certificate"
                value={application.business.businessLicenseNumber}
              />
              <Field label="Tax ID" value={application.business.taxId} />
              <Field
                label="Legal Representative Name"
                value={application.business.legalRepresentativeName}
              />
              <Field
                label="Legal Representative ID"
                value={application.business.legalRepresentativeId}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Business Address"
                  value={[
                    application.business.addressLine1,
                    application.business.addressLine2,
                    application.business.cityLabel,
                    application.business.stateLabel,
                    application.business.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                />
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Shop Details" step="Step 2 · Shop">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="Shop Name" value={application.shopName} />
              <Field label="Shop Slug" value={application.shopSlug} />
              <Field label="Shop Category" value={application.categoryLabel} />
              <Field
                label="Selling Model"
                value={application.verification.sellingModelLabel}
              />
              <div className="sm:col-span-2">
                <Field label="Shop Description" value={application.shop.description} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Expected Products" value={application.shop.expectedProducts} />
              </div>
              <Field label="Facebook" value={application.shop.facebookUrl ?? '—'} />
              <Field label="Instagram" value={application.shop.instagramUrl ?? '—'} />
              <Field label="Website" value={application.shop.websiteUrl ?? '—'} />
            </dl>
          </SectionCard>

          <SectionCard title="Verification Documents" step="Step 3 · Verification">
            <p className="mb-3 text-sm text-muted-foreground">
              Selling model:{' '}
              <span className="font-medium text-foreground">
                {application.verification.sellingModelLabel}
              </span>
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {application.verification.documents.map((doc) => {
                const Icon = doc.kind === 'pdf' ? FileText : ImageIcon;
                return (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <span className="relative flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                      {doc.status === 'uploaded' ? (
                        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-success text-white">
                          <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{doc.title}</p>
                      <p className="truncate text-caption text-muted-foreground">{doc.fileName}</p>
                    </div>
                    <Badge
                      variant={doc.status === 'uploaded' ? 'success' : 'outline'}
                      className="rounded-full"
                    >
                      {doc.status === 'uploaded' ? 'Uploaded' : 'Missing'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard title="Terms & Conditions" step="Step 4 · Agreements">
            <ul className="space-y-2">
              {(
                [
                  ['Terms & Conditions', application.agreements.acceptTerms],
                  ['Seller Agreement', application.agreements.acceptSellerAgreement],
                  ['Privacy Policy', application.agreements.acceptPrivacy],
                ] as const
              ).map(([label, accepted]) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={cn(
                      'size-4',
                      accepted ? 'text-success' : 'text-muted-foreground',
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">
                    ({accepted ? 'Accepted' : 'Not accepted'})
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-caption text-muted-foreground">
              Agreed at {application.agreements.agreedAt}
            </p>
          </SectionCard>

          <SectionCard title="Activity" step="Timeline">
            <ol className="space-y-4">
              {application.activity.map((item) => (
                <li key={item.id} className="relative pl-5">
                  <span
                    className="absolute top-1.5 left-0 size-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-foreground">{item.summary}</p>
                  <p className="text-caption text-muted-foreground">
                    {item.actor} · {item.at}
                  </p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Admin verification checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tick each item only after you have verified the registration data is accurate.
              </p>
              <ul className="space-y-3">
                {REVIEW_CHECKS.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <Checkbox
                      id={`check-${item.id}`}
                      checked={checks[item.id]}
                      disabled={isFinalized}
                      onCheckedChange={(value) => toggleCheck(item.id, value === true)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`check-${item.id}`}
                      className="cursor-pointer text-sm leading-snug font-normal text-foreground"
                    >
                      {item.label}
                    </Label>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Label htmlFor="review-notes">Review notes</Label>
                <Textarea
                  id="review-notes"
                  value={notes}
                  disabled={isFinalized}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes. Required when rejecting."
                  rows={4}
                  className="rounded-xl"
                />
              </div>

              {!isFinalized ? (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    disabled={!canApprove}
                    className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-500/90 hover:to-violet-500/90 disabled:opacity-50"
                    onClick={handleApprove}
                  >
                    <Check className="size-4" aria-hidden="true" />
                    Approve Seller
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 rounded-xl border-destructive/40 text-destructive-strong hover:bg-destructive/10"
                    onClick={handleReject}
                  >
                    <X className="size-4" aria-hidden="true" />
                    Reject Application
                  </Button>
                  {!allChecked ? (
                    <p className="text-caption text-muted-foreground">
                      Approve stays disabled until all checklist items are confirmed.
                    </p>
                  ) : null}
                </div>
              ) : (
                <Alert variant={decision === 'approved' ? 'success' : 'destructive'}>
                  <AlertContent>
                    <AlertTitle>
                      {decision === 'approved' ? 'Application approved' : 'Application rejected'}
                    </AlertTitle>
                    <AlertDescription>
                      Presentation-only decision for now. Persist via Seller Gateway later.
                    </AlertDescription>
                  </AlertContent>
                </Alert>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
