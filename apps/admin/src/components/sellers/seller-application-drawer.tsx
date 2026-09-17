'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  Check,
  CheckCircle2,
  FileText,
  ImageIcon,
  Pencil,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@novacommerce/ui/components/avatar';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@novacommerce/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@novacommerce/ui/components/tabs';
import { Textarea } from '@novacommerce/ui/components/textarea';
import { cn } from '@/lib/utils';
import {
  approvalStatusLabel,
  type SellerApplication,
} from '@/lib/mock-data/seller-approvals';
import { approvalsHref, type ApprovalsQuery } from '@/lib/url/approvals-query';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-foreground">{value}</dd>
    </div>
  );
}

export function SellerApplicationDrawer({
  application,
  query,
}: {
  application?: SellerApplication;
  query: ApprovalsQuery;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const open = Boolean(application);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    setNotes('');
    setTab('overview');
  }, [application?.id]);

  function close() {
    startTransition(() => {
      router.push(approvalsHref({ ...query, id: undefined }));
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-xl gap-0 p-0 sm:max-w-xl"
        data-pending={pending || undefined}
      >
        {application ? (
          <>
            <SheetHeader className="border-b border-border px-5 py-4 pr-12 text-left">
              <SheetTitle>Seller Application Details</SheetTitle>
              <SheetDescription className="sr-only">
                Review business, shop, verification, and agreement details for {application.name}.
              </SheetDescription>
            </SheetHeader>

            <div className="flex items-start gap-3 border-b border-border px-5 py-4">
              <Avatar className="size-12">
                <AvatarFallback
                  className="text-sm font-semibold text-white"
                  style={{ backgroundColor: application.accent }}
                >
                  {application.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-foreground">{application.name}</p>
                  <Badge variant="warning" className="rounded-full">
                    {approvalStatusLabel[application.status]} Approval
                  </Badge>
                </div>
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

            <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="mx-5 mt-4 grid w-auto grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <TabsContent value="overview" className="mt-0 space-y-5">
                  <section className="rounded-2xl border border-border p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Business Information</h3>
                      <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Button>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <Field label="Business Name" value={application.business.businessName} />
                      <Field label="Type" value={application.business.businessTypeLabel} />
                      <Field label="Legal Name" value={application.business.legalBusinessName} />
                      <Field label="Tax ID" value={application.business.taxId} />
                      <Field label="National ID / Passport" value={application.business.identityNumber} />
                      <Field
                        label="Business License"
                        value={application.business.businessLicenseNumber}
                      />
                      <Field label="Business Email" value={application.business.businessEmail} />
                      <Field label="Phone Number" value={application.business.phone} />
                      <Field
                        label="Legal Representative"
                        value={application.business.legalRepresentativeName}
                      />
                      <Field
                        label="Representative ID"
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
                  </section>

                  <section className="rounded-2xl border border-border p-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Shop Details</h3>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <Field label="Shop Name" value={application.shopName} />
                      <Field label="Shop Slug" value={application.shopSlug} />
                      <Field label="Category" value={application.categoryLabel} />
                      <Field
                        label="Selling Model"
                        value={application.verification.sellingModelLabel}
                      />
                      <div className="sm:col-span-2">
                        <Field label="Description" value={application.shop.description} />
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Expected Products" value={application.shop.expectedProducts} />
                      </div>
                      {application.shop.facebookUrl ? (
                        <Field label="Facebook" value={application.shop.facebookUrl} />
                      ) : null}
                      {application.shop.instagramUrl ? (
                        <Field label="Instagram" value={application.shop.instagramUrl} />
                      ) : null}
                      {application.shop.websiteUrl ? (
                        <Field label="Website" value={application.shop.websiteUrl} />
                      ) : null}
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-transparent"
                        style={{
                          backgroundColor: `${application.categoryAccent}18`,
                          color: application.categoryAccent,
                        }}
                      >
                        {application.categoryLabel}
                      </Badge>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        Verification Documents
                      </h3>
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-primary hover:underline"
                        onClick={() => setTab('documents')}
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {application.verification.documents.slice(0, 3).map((doc) => (
                        <DocumentCard key={doc.id} title={doc.title} kind={doc.kind} uploaded />
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border p-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Agreements</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      <AgreementRow
                        label="Terms & Conditions"
                        accepted={application.agreements.acceptTerms}
                      />
                      <AgreementRow
                        label="Seller Agreement"
                        accepted={application.agreements.acceptSellerAgreement}
                      />
                      <AgreementRow
                        label="Privacy Policy"
                        accepted={application.agreements.acceptPrivacy}
                      />
                    </ul>
                    <p className="mt-2 text-caption text-muted-foreground">
                      Agreed at {application.agreements.agreedAt}
                    </p>
                  </section>

                  <section className="rounded-2xl border border-border p-4">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Review Notes</h3>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Add your review notes..."
                      rows={4}
                      className="rounded-xl"
                    />
                  </section>
                </TabsContent>

                <TabsContent value="documents" className="mt-0 space-y-3">
                  {application.verification.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >
                      <DocumentCard title={doc.title} kind={doc.kind} uploaded={doc.status === 'uploaded'} compact />
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
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
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
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex flex-row gap-3 border-t border-border px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-destructive/40 text-destructive-strong hover:bg-destructive/10"
              >
                Reject
              </Button>
              <Button
                type="button"
                className="flex-1 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-500/90 hover:to-violet-500/90"
              >
                <Check className="size-4" aria-hidden="true" />
                Approve Seller
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AgreementRow({ label, accepted }: { label: string; accepted: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2
        className={cn('size-4', accepted ? 'text-success' : 'text-muted-foreground')}
        aria-hidden="true"
      />
      <span>
        {label}{' '}
        <span className="text-muted-foreground">
          ({accepted ? 'Accepted' : 'Not accepted'})
        </span>
      </span>
    </li>
  );
}

function DocumentCard({
  title,
  kind,
  uploaded,
  compact,
}: {
  title: string;
  kind: 'pdf' | 'image';
  uploaded: boolean;
  compact?: boolean;
}) {
  const Icon = kind === 'pdf' ? FileText : ImageIcon;
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 text-center',
        compact ? 'size-12 shrink-0' : 'aspect-square p-2',
      )}
      title={title}
    >
      <Icon className={cn(compact ? 'size-5' : 'size-6', 'text-primary')} aria-hidden="true" />
      {!compact ? (
        <span className="mt-1 line-clamp-2 text-[10px] font-medium text-muted-foreground">
          {title}
        </span>
      ) : null}
      {uploaded ? (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-success text-white">
          <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}
