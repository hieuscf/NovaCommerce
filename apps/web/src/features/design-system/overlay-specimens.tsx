'use client';

import { ChevronDown, MoreHorizontal, Package, Trash2 } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@novacommerce/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@novacommerce/ui/components/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@novacommerce/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@novacommerce/ui/components/tabs';
import { toast } from '@novacommerce/ui/components/toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@novacommerce/ui/components/tooltip';
import { Specimen } from './showcase-shell';

export function OverlaySpecimens() {
  return (
    <div className="grid gap-10">
      <Specimen label="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this product?</DialogTitle>
              <DialogDescription>
                This removes the product from your catalog. Existing orders are unaffected.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Delete product</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Large dialog</Button>
          </DialogTrigger>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Bulk edit inventory</DialogTitle>
              <DialogDescription>
                Sizes sm, md, lg and xl share the same surface, radius and shadow.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Specimen>

      <Specimen label="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              Account
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Package />
              Orders
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Rewards (coming soon)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 />
              Delete account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Specimen>

      <Specimen label="Sheet and tooltip">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open filters</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                The mobile navigation and filter drawers use this surface.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Hover or focus me</Button>
          </TooltipTrigger>
          <TooltipContent>Free shipping on orders over $50</TooltipContent>
        </Tooltip>
      </Specimen>

      <Specimen label="Toast — meaningful feedback only" className="flex-wrap">
        <Button variant="secondary" onClick={() => toast.success('Added to cart')}>
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.info('Price dropped', { description: 'Now $89.00' })}
        >
          Info
        </Button>
        <Button variant="secondary" onClick={() => toast.warning('Only 2 left in stock')}>
          Warning
        </Button>
        <Button variant="secondary" onClick={() => toast.error('Payment could not be processed')}>
          Error
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast('Item removed', {
              action: { label: 'Undo', onClick: () => toast.success('Restored') },
            })
          }
        >
          With action
        </Button>
      </Specimen>

      <div className="grid gap-3">
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Tabs
        </p>
        <Tabs defaultValue="bestsellers">
          <TabsList aria-label="Product collections">
            <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
            <TabsTrigger value="new">New Arrivals</TabsTrigger>
            <TabsTrigger value="sale">On Sale</TabsTrigger>
            <TabsTrigger value="clearance" disabled>
              Clearance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bestsellers" className="text-body-sm text-muted-foreground">
            Bestselling products across all categories.
          </TabsContent>
          <TabsContent value="new" className="text-body-sm text-muted-foreground">
            Added in the last 30 days.
          </TabsContent>
          <TabsContent value="sale" className="text-body-sm text-muted-foreground">
            Currently discounted products.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
