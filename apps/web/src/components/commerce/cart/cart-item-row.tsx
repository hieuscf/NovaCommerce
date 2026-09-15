import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import { formatCartMoney, lineTotal, type CartLineViewModel } from '@/lib/view-models/cart';
import { productHref } from '@/lib/view-models/product';

export function CartItemRow({
  line,
  onSelect,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineViewModel;
  onSelect: (selected: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const nameId = `${line.id}-name`;
  const total = lineTotal(line);

  return (
    <li className="border-t border-border/70 py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Checkbox
          checked={line.selected}
          onCheckedChange={(value) => onSelect(value === true)}
          aria-labelledby={nameId}
          className="mt-6 size-5 sm:mt-0"
        />

        <Link
          href={productHref(line.slug)}
          className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-surface-subtle sm:size-20"
        >
          <Image
            src={line.imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>

        <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(5.5rem,auto)_auto_minmax(5.5rem,auto)_auto] lg:items-center lg:gap-6">
          <div className="min-w-0">
            <h3 id={nameId} className="truncate text-sm font-semibold text-ink">
              <Link href={productHref(line.slug)} className="hover:text-primary focus-ring">
                {line.name}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{line.variantLabel}</p>
            <p className="mt-2 text-sm font-semibold text-foreground tabular-nums lg:hidden">
              {formatCartMoney(line.unitPrice, line.currency)}
            </p>
            {line.inStock ? (
              <Badge variant="success" className="mt-2">
                In Stock
              </Badge>
            ) : (
              <Badge variant="warning" className="mt-2">
                Out of Stock
              </Badge>
            )}
          </div>

          <p className="hidden text-sm font-semibold text-foreground tabular-nums lg:block">
            {formatCartMoney(line.unitPrice, line.currency)}
          </p>

          <QuantitySelector
            id={`${line.id}-qty`}
            labelledBy={nameId}
            value={line.quantity}
            onChange={onQuantityChange}
            className="h-11 rounded-pill"
          />

          <p className="text-sm font-semibold text-foreground tabular-nums">
            <span className="mr-2 text-muted-foreground lg:hidden">Total</span>
            {formatCartMoney(total, line.currency)}
          </p>

          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full justify-center gap-1.5 px-3 text-muted-foreground hover:text-destructive lg:w-auto"
            onClick={onRemove}
            aria-label={`Remove ${line.name} from cart`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}
