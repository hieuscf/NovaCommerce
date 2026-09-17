'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, MoreHorizontal, ShieldAlert, XCircle } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@novacommerce/ui/components/table';
import {
  productStatusLabel,
  type AdminProduct,
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

function StockCell({ stock }: { stock: number }) {
  const inStock = stock > 0;
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{stock}</p>
      <p
        className={cn(
          'text-caption font-medium',
          inStock ? 'text-success-strong' : 'text-destructive-strong',
        )}
      >
        {inStock ? 'In stock' : 'Out of stock'}
      </p>
    </div>
  );
}

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0 && selected.size < products.length;

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(products.map((product) => product.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <Table density="dense" className="min-w-[1100px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(value) => toggleAll(value === true)}
              aria-label="Select all products"
            />
          </TableHead>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const isSelected = selected.has(product.id);
          return (
            <TableRow key={product.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(value) => toggleOne(product.id, value === true)}
                  aria-label={`Select ${product.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: product.accent }}
                    aria-hidden="true"
                  >
                    {product.initials}
                    {product.hasViolation ? (
                      <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-white">
                        <ShieldAlert className="size-2.5" />
                      </span>
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {product.subtitle}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                {product.sku}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {product.category}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {product.brand}
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium text-foreground">
                {product.price}
              </TableCell>
              <TableCell>
                <StockCell stock={product.stock} />
              </TableCell>
              <TableCell>
                <StatusBadge status={product.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {product.createdAt}
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-center justify-end gap-0.5">
                  <Button asChild type="button" variant="ghost" size="icon-sm">
                    <Link
                      href={`/products/${product.id}`}
                      aria-label={`View details for ${product.name}`}
                    >
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`More actions for ${product.name}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
