'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@novacommerce/ui/components/alert';
import { Avatar, AvatarFallback } from '@novacommerce/ui/components/avatar';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@novacommerce/ui/components/tabs';
import { Textarea } from '@novacommerce/ui/components/textarea';
import { toast } from '@novacommerce/ui/components/toast';
import {
  productStatusLabel,
  type AdminProductDetail,
  type ProductStatus,
} from '@/lib/mock-data/products';
import { cn } from '@/lib/utils';

function StatusBadge({ status }: { status: ProductStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="gap-1 rounded-full">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        {productStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'draft') {
    return (
      <Badge variant="secondary" className="rounded-full">
        {productStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1 rounded-full">
      <XCircle className="size-3" aria-hidden="true" />
      {productStatusLabel[status]}
    </Badge>
  );
}

function LockSwitch({
  locked,
  onChange,
  disabled,
}: {
  locked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={locked}
      aria-label="Lock product"
      disabled={disabled}
      onClick={() => onChange(!locked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        locked ? 'bg-destructive' : 'bg-muted',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow transition-transform',
          locked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function ProductDetailPage({ product }: { product: AdminProductDetail }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [locked, setLocked] = useState(product.locked);
  const [activeImage, setActiveImage] = useState(0);
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand);
  const [category, setCategory] = useState(product.category);
  const [sku, setSku] = useState(product.sku);
  const [barcode, setBarcode] = useState(product.barcode);
  const [price, setPrice] = useState(product.price);
  const [comparePrice, setComparePrice] = useState(product.comparePrice);
  const [stock, setStock] = useState(String(product.stock));
  const [description, setDescription] = useState(product.description);
  const [tags, setTags] = useState(product.tags);

  const media = useMemo(
    () =>
      Array.from({ length: product.mediaCount }, (_, index) => ({
        id: `media_${index}`,
        label: `${index + 1}`,
        accent: product.accent,
      })),
    [product.accent, product.mediaCount],
  );

  const stockNumber = Number(stock) || 0;
  const inStock = stockNumber > 0;

  function handleLock(next: boolean) {
    setLocked(next);
    if (next) {
      setStatus('inactive');
      toast.warning(`${name} locked`, {
        description: 'Customers can no longer purchase this product.',
      });
    } else {
      toast.success(`${name} unlocked`, {
        description: 'Product is available for purchase again.',
      });
    }
  }

  function handleSave() {
    setEditing(false);
    toast.success('Changes saved', {
      description: `${name} catalog fields updated (presentation fixture).`,
    });
  }

  function addTag() {
    if (!editing) return;
    const next = window.prompt('Add tag');
    if (!next?.trim()) return;
    setTags((prev) => [...prev, next.trim()]);
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
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/products" className="hover:text-foreground hover:underline">
                  Products
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="truncate text-foreground">{name}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
            <StatusBadge status={status} />
            {locked ? (
              <Badge variant="destructive" className="gap-1 rounded-full">
                <Lock className="size-3" aria-hidden="true" />
                Locked
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {brand} · {category} · #{sku}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild type="button" variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <Link href="/products">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Products
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
            onClick={() => setEditing((prev) => !prev)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            {editing ? 'Editing' : 'Edit'}
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="More actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <Card className="overflow-hidden rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex w-14 shrink-0 flex-col gap-2">
                  {media.slice(0, 4).map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-xl text-xs font-bold text-white',
                        activeImage === index
                          ? 'ring-2 ring-indigo-500 ring-offset-2'
                          : 'opacity-80 hover:opacity-100',
                      )}
                      style={{ backgroundColor: item.accent }}
                      aria-label={`Show image ${index + 1}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div
                  className="flex min-h-56 flex-1 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-inner"
                  style={{ backgroundColor: product.accent }}
                  aria-hidden="true"
                >
                  {product.initials}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Created At</span>
                <span className="text-right font-medium">{product.createdAt}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Updated At</span>
                <span className="text-right font-medium">{product.updatedAt}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Created By</span>
                <span className="flex items-center gap-2 font-medium">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-indigo-500 text-[10px] text-white">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  {product.createdBy}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Last Modified By</span>
                <span className="flex items-center gap-2 font-medium">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-violet-500 text-[10px] text-white">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  {product.lastModifiedBy}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Cost Price</span>
                <span className="font-medium">{product.costPrice}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Tax Rate</span>
                <span className="font-medium">{product.taxRate}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{product.weight}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="text-right font-medium">{product.dimensions}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full">
                  {tag}
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-full px-2.5"
                onClick={addTag}
                disabled={!editing}
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add Tag
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <InfoRow label="Product Name">
                  {editing ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                  ) : (
                    name
                  )}
                </InfoRow>
                <InfoRow label="Brand">
                  {editing ? (
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-9" />
                  ) : (
                    brand
                  )}
                </InfoRow>
                <InfoRow label="Category">
                  {editing ? (
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    category
                  )}
                </InfoRow>
                <InfoRow label="SKU">
                  {editing ? (
                    <Input value={sku} onChange={(e) => setSku(e.target.value)} className="h-9" />
                  ) : (
                    <span className="font-mono">{sku}</span>
                  )}
                </InfoRow>
                <InfoRow label="Barcode">
                  {editing ? (
                    <Input
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <span className="font-mono">{barcode}</span>
                  )}
                </InfoRow>
                <InfoRow label="Price">
                  {editing ? (
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-9" />
                  ) : (
                    price
                  )}
                </InfoRow>
                <InfoRow label="Compare Price">
                  {editing ? (
                    <Input
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    comparePrice
                  )}
                </InfoRow>
                <InfoRow label="Stock">
                  {editing ? (
                    <Input value={stock} onChange={(e) => setStock(e.target.value)} className="h-9" />
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {stockNumber} units
                      <Badge
                        variant={inStock ? 'success' : 'destructive'}
                        className="rounded-full"
                      >
                        {inStock ? 'In stock' : 'Out of stock'}
                      </Badge>
                    </span>
                  )}
                </InfoRow>
              </dl>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-5">
              <Tabs defaultValue="description">
                <TabsList className="max-w-full">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="attributes">Attributes</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Product Description</Label>
                    {editing ? (
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                      />
                    ) : (
                      <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Key Features</h3>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {product.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="specifications">
                  <dl className="divide-y divide-border rounded-xl border border-border">
                    {product.specifications.map((item) => (
                      <div
                        key={item.label}
                        className="grid grid-cols-2 gap-3 px-4 py-3 text-sm"
                      >
                        <dt className="text-muted-foreground">{item.label}</dt>
                        <dd className="font-medium text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>

                <TabsContent value="attributes">
                  <dl className="divide-y divide-border rounded-xl border border-border">
                    {product.attributes.map((item) => (
                      <div
                        key={item.label}
                        className="grid grid-cols-2 gap-3 px-4 py-3 text-sm"
                      >
                        <dt className="text-muted-foreground">{item.label}</dt>
                        <dd className="font-medium text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>

                <TabsContent value="inventory">
                  <div className="rounded-xl border border-border p-4 text-sm">
                    <p className="font-medium text-foreground">
                      Available stock: {stockNumber} units
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Warehouse sync and reservations stay presentation-only until Inventory
                      Gateway is wired.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No customer reviews loaded yet for this listing.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Images & Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="flex aspect-square items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ backgroundColor: item.accent }}
                    aria-hidden="true"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Related Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {product.relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div
                      className="mb-2 flex size-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: item.accent }}
                      aria-hidden="true"
                    >
                      {item.initials}
                    </div>
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-caption text-muted-foreground">{item.price}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Current</span>
                <StatusBadge status={status} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-status">Change Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as ProductStatus)}
                  disabled={locked}
                >
                  <SelectTrigger id="product-status" className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Lock className="size-4" aria-hidden="true" />
                    Lock Product
                  </div>
                  <p className="mt-1 text-caption text-muted-foreground">
                    Prevent customers from purchasing this product.
                  </p>
                </div>
                <LockSwitch locked={locked} onChange={handleLock} />
              </div>
            </CardContent>
          </Card>

          {product.hasViolation ? (
            <Alert variant="destructive" className="rounded-2xl">
              <ShieldAlert aria-hidden="true" />
              <AlertContent>
                <AlertTitle>Violation Detected</AlertTitle>
                <AlertDescription>{product.violationMessage}</AlertDescription>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="mt-3 gap-1.5 rounded-xl"
                  onClick={() => handleLock(true)}
                  disabled={locked}
                >
                  <Lock className="size-3.5" aria-hidden="true" />
                  {locked ? 'Already Locked' : 'Lock Product'}
                </Button>
              </AlertContent>
            </Alert>
          ) : null}

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                className="w-full gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
                onClick={handleSave}
              >
                <Save className="size-4" aria-hidden="true" />
                Save Changes
              </Button>
              <Button asChild type="button" variant="outline" className="w-full gap-1.5 rounded-xl">
                <a href={`http://localhost:3001/products/${product.storeSlug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View on Store
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {product.reportHistory.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3 pl-1">
                    {index < product.reportHistory.length - 1 ? (
                      <span
                        className="absolute top-6 left-[11px] h-[calc(100%-8px)] w-px bg-border"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                        event.tone === 'destructive' && 'bg-destructive/15 text-destructive-strong',
                        event.tone === 'warning' && 'bg-warning/15 text-warning-strong',
                        event.tone === 'success' && 'bg-success/15 text-success-strong',
                      )}
                    >
                      {event.tone === 'success' ? (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      ) : (
                        <TriangleAlert className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="text-caption text-muted-foreground">{event.description}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{event.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
