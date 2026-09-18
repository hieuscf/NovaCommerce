'use client';

import { useState } from 'react';
import {
  Eye,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  sellerProductStatusLabel,
  sellerSeoLevelLabel,
  type SellerProductRow,
  type SellerProductStatus,
  type SellerSeoLevel,
} from '@/lib/mock-data/seller-products';

function StatusBadge({ status }: { status: SellerProductStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="rounded-full">
        {sellerProductStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="warning" className="rounded-full">
        {sellerProductStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'out_of_stock') {
    return (
      <Badge variant="destructive" className="rounded-full">
        {sellerProductStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="rounded-full bg-violet-500/15 text-violet-700">
      {sellerProductStatusLabel[status]}
    </Badge>
  );
}

function SeoCell({ level, tips }: { level: SellerSeoLevel; tips: number }) {
  return (
    <div>
      <p
        className={cn(
          'text-sm font-semibold',
          level === 'good' && 'text-emerald-600',
          level === 'needs_work' && 'text-amber-600',
          level === 'poor' && 'text-rose-600',
        )}
      >
        {sellerSeoLevelLabel[level]}
      </p>
      {tips > 0 ? (
        <p className="text-caption text-muted-foreground">{tips} gợi ý</p>
      ) : (
        <p className="text-caption text-muted-foreground">Ổn định</p>
      )}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="min-w-[88px]">
      <p className="text-sm font-semibold text-foreground">{score}/100</p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full',
            score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-sky-500' : 'bg-amber-500',
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function SellerProductsTable({ products }: { products: SellerProductRow[] }) {
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
    <Table density="dense" className="min-w-[980px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(value) => toggleAll(value === true)}
              aria-label="Chọn tất cả sản phẩm"
            />
          </TableHead>
          <TableHead>Sản phẩm</TableHead>
          <TableHead>Giá bán</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Điểm sản phẩm</TableHead>
          <TableHead>SEO</TableHead>
          <TableHead className="w-28 text-right">Thao tác</TableHead>
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
                  aria-label={`Chọn ${product.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ backgroundColor: product.accent }}
                    aria-hidden="true"
                  >
                    {product.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="truncate text-caption text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {product.categoryPath}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-foreground">{product.price}</p>
                {product.comparePrice ? (
                  <p className="text-caption text-muted-foreground line-through">
                    {product.comparePrice}
                  </p>
                ) : null}
                {product.discountLabel ? (
                  <p className="text-caption font-semibold text-rose-600">{product.discountLabel}</p>
                ) : null}
              </TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-foreground">{product.stock}</p>
                <p className="text-caption text-muted-foreground">
                  {product.variantCount} biến thể
                </p>
              </TableCell>
              <TableCell>
                <StatusBadge status={product.status} />
              </TableCell>
              <TableCell>
                <ScoreBar score={product.score} />
              </TableCell>
              <TableCell>
                <SeoCell level={product.seo} tips={product.seoTips} />
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-center justify-end gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Sửa ${product.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Xem ${product.name}`}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Thêm thao tác cho ${product.name}`}
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
