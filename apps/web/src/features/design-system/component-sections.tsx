import { ArrowRight, Package, ShoppingCart, TriangleAlert } from 'lucide-react';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@novacommerce/ui/components/alert';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@novacommerce/ui/components/card';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { LoadingState } from '@novacommerce/ui/components/loading-state';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from '@novacommerce/ui/components/pagination';
import { Skeleton, SkeletonText } from '@novacommerce/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@novacommerce/ui/components/table';
import { Specimen, SpecimenGrid } from './showcase-shell';

export function ButtonSpecimens() {
  return (
    <div className="grid gap-8">
      <Specimen label="Variants">
        <Button variant="primary-gradient">
          Shop Now
          <ArrowRight />
        </Button>
        <Button>Add to Cart</Button>
        <Button variant="secondary">Explore Deals</Button>
        <Button variant="soft">Save for later</Button>
        <Button variant="outline">Compare</Button>
        <Button variant="ghost">View all</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="dark">Shop Collection</Button>
        <Button variant="link">Learn more</Button>
      </Specimen>

      <Specimen label="Sizes">
        <Button size="lg">Large</Button>
        <Button>Default</Button>
        <Button size="sm">Small</Button>
        <Button size="icon" aria-label="Add to cart">
          <ShoppingCart />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Add to cart">
          <ShoppingCart />
        </Button>
      </Specimen>

      <Specimen label="States">
        <Button>Default</Button>
        <Button disabled>Disabled</Button>
        <Button loading loadingLabel="Saving changes">
          Saving
        </Button>
        <Button variant="secondary" disabled>
          Disabled secondary
        </Button>
      </Specimen>
    </div>
  );
}

export function CardSpecimens() {
  return (
    <SpecimenGrid>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-h3">$48,200</p>
          <p className="mt-1 text-body-sm text-muted-foreground">+12.4% vs previous period</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">
            View report
            <ArrowRight />
          </Button>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="bg-surface-subtle relative aspect-[4/3]">
          <Badge variant="bestseller" className="absolute top-3 left-3">
            Best Seller
          </Badge>
        </div>
        <div className="grid gap-3 p-4">
          <div>
            <p className="font-semibold">MacBook Air M2 13&quot;</p>
            <p className="text-body-sm text-muted-foreground">Apple · 256GB · Space Gray</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">$999.00</span>
            <span className="text-body-sm text-muted-foreground line-through">$1,099.00</span>
          </div>
          <Button className="w-full" size="sm">
            <ShoppingCart />
            Add to Cart
          </Button>
        </div>
      </Card>
    </SpecimenGrid>
  );
}

export function BadgeSpecimens() {
  return (
    <div className="grid gap-8">
      <Specimen label="Neutral and semantic">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">In Stock</Badge>
        <Badge variant="warning">Low Stock</Badge>
        <Badge variant="destructive">Out of Stock</Badge>
        <Badge variant="info">Pre-order</Badge>
      </Specimen>
      <Specimen label="Commerce">
        <Badge variant="bestseller">Best Seller</Badge>
        <Badge variant="sale">-20%</Badge>
        <Badge variant="promo">Limited</Badge>
        <Badge variant="secondary">New</Badge>
      </Specimen>
    </div>
  );
}

export function AlertSpecimens() {
  return (
    <div className="grid gap-4">
      <Alert>
        <TriangleAlert aria-hidden="true" />
        <AlertContent>
          <AlertTitle>Default</AlertTitle>
          <AlertDescription>
            A persistent, in-page message. Use Toast for transient feedback.
          </AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="info">
        <TriangleAlert aria-hidden="true" />
        <AlertContent>
          <AlertTitle>Shipping update</AlertTitle>
          <AlertDescription>Your order will arrive a day early.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="success">
        <TriangleAlert aria-hidden="true" />
        <AlertContent>
          <AlertTitle>Order placed</AlertTitle>
          <AlertDescription>A confirmation email is on its way.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert aria-hidden="true" />
        <AlertContent>
          <AlertTitle>Low stock</AlertTitle>
          <AlertDescription>Only 3 units remain in this warehouse.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlert aria-hidden="true" />
        <AlertContent>
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>Update your payment method to continue.</AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  );
}

const orders = [
  { id: 'NC-1042', customer: 'Ada Lovelace', status: 'Paid', total: '$129.00' },
  { id: 'NC-1041', customer: 'Grace Hopper', status: 'Pending', total: '$89.00' },
  { id: 'NC-1040', customer: 'Alan Turing', status: 'Refunded', total: '$249.00' },
];

const statusVariant = {
  Paid: 'success',
  Pending: 'warning',
  Refunded: 'destructive',
} as const;

export function DataDisplaySpecimens() {
  const currentPage: number = 4;
  const totalPages: number = 12;

  return (
    <div className="grid gap-10">
      <div className="grid gap-3">
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Table — comfortable (storefront)
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status as keyof typeof statusVariant]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3">
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Table — dense (admin), with a selected row and an empty state
        </p>
        <Table density="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow data-state="selected">
              <TableCell className="font-medium">NC-1042</TableCell>
              <TableCell>Ada Lovelace</TableCell>
              <TableCell className="text-right tabular-nums">$129.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">NC-1041</TableCell>
              <TableCell>Grace Hopper</TableCell>
              <TableCell className="text-right tabular-nums">$89.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table density="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty colSpan={2}>No orders match these filters</TableEmpty>
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3">
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Pagination — URL-driven page state
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${currentPage - 1}`}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {getPaginationRange({ page: currentPage, totalPages }).map((item, index) => (
              <PaginationItem key={`${item}-${index}`}>
                {item === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink href={`?page=${item}`} isActive={item === currentPage}>
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={`?page=${currentPage + 1}`}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export function StateSpecimens() {
  return (
    <div className="grid gap-10">
      <div className="grid gap-3">
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Skeleton — shaped like the content it replaces
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="overflow-hidden p-0">
            <Skeleton className="aspect-square rounded-none" />
            <div className="grid gap-3 p-4">
              <Skeleton variant="text" className="w-24" />
              <SkeletonText lines={2} />
              <Skeleton className="h-9 w-full" />
            </div>
          </Card>
          <div className="grid content-start gap-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="size-10" />
              <Skeleton variant="text" className="w-32" />
            </div>
            <SkeletonText lines={4} />
          </div>
          <Card className="grid content-start gap-3 p-6">
            <Skeleton variant="text" className="w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton variant="text" className="w-40" />
          </Card>
        </div>
      </div>

      <SpecimenGrid>
        <EmptyState
          icon={<Package />}
          title="No products yet"
          description="Add your first product and it will appear here."
          action={<Button size="sm">Add product</Button>}
        />
        <ErrorState
          icon={<TriangleAlert />}
          title="Could not load products"
          description="Something went wrong on our side. Please try again."
          action={<Button size="sm">Try again</Button>}
          secondaryAction={
            <Button size="sm" variant="ghost">
              Contact support
            </Button>
          }
        />
      </SpecimenGrid>

      <SpecimenGrid>
        <Card className="p-6">
          <LoadingState variant="section" label="Loading products…" />
        </Card>
        <Card className="grid content-center gap-4 p-6">
          <LoadingState variant="inline" label="Checking inventory…" />
          <Button loading loadingLabel="Placing order">
            Place order
          </Button>
        </Card>
      </SpecimenGrid>
    </div>
  );
}
