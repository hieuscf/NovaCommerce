'use client';

import { Download, MapPin } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { toast } from '@novacommerce/ui/components/toast';

const TRACKING_MESSAGE = 'Tracking will be available when Order APIs are connected';
const INVOICE_MESSAGE = 'Invoices will be available when Order APIs are connected';

export function OrderPreviewActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-10 rounded-xl"
        onClick={() => toast.info(TRACKING_MESSAGE)}
      >
        <MapPin className="size-4" aria-hidden="true" />
        Track Order
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-10 rounded-xl"
        onClick={() => toast.info(INVOICE_MESSAGE)}
      >
        <Download className="size-4" aria-hidden="true" />
        Download Invoice
      </Button>
    </div>
  );
}

export function OrderTrackPackageButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-primary"
      onClick={() => toast.info(TRACKING_MESSAGE)}
    >
      Track Package
    </Button>
  );
}
