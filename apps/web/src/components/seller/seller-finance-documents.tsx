import { ArrowRight, Download, FileText } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { sellerInvoiceFiles, sellerReportFiles } from '@/lib/mock-data/seller-finance';

function DocumentList({
  files,
}: {
  files: readonly { id: string; name: string; meta: string }[];
}) {
  return (
    <ul className="space-y-2.5">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-slate-50/70 px-3 py-2.5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-caption text-muted-foreground">{file.meta}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Tải ${file.name}`}
            className="text-sky-600"
          >
            <Download className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function SellerFinanceDocuments() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card id="reports" className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-3 pb-3">
          <CardTitle className="text-base">Đối soát &amp; Báo cáo</CardTitle>
          <Button
            type="button"
            size="sm"
            className="h-9 w-fit gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
          >
            Xem báo cáo
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <DocumentList files={sellerReportFiles} />
        </CardContent>
      </Card>

      <Card id="invoices" className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-3 pb-3">
          <CardTitle className="text-base">Hóa đơn &amp; Thuế</CardTitle>
          <Button
            type="button"
            size="sm"
            className="h-9 w-fit gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
          >
            Tải hóa đơn
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <DocumentList files={sellerInvoiceFiles} />
        </CardContent>
      </Card>
    </div>
  );
}
