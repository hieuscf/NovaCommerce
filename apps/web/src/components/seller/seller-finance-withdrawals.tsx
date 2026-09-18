import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@novacommerce/ui/components/table';
import {
  sellerWithdrawals,
  sellerWithdrawalStatusLabel,
  type SellerWithdrawalStatus,
} from '@/lib/mock-data/seller-finance';

function StatusBadge({ status }: { status: SellerWithdrawalStatus }) {
  if (status === 'processed') {
    return (
      <Badge variant="success" className="rounded-full">
        {sellerWithdrawalStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'processing') {
    return (
      <Badge variant="warning" className="rounded-full">
        {sellerWithdrawalStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="rounded-full">
      {sellerWithdrawalStatusLabel[status]}
    </Badge>
  );
}

export function SellerFinanceWithdrawals() {
  return (
    <Card id="withdrawals" className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Lịch sử rút tiền</CardTitle>
        <Link
          href="/seller?demo=registered&section=finance&tab=withdrawals"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:underline"
        >
          Xem tất cả
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <Table density="dense" className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead>Ngày yêu cầu</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Tài khoản nhận</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellerWithdrawals.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm text-muted-foreground">{row.requestedAt}</TableCell>
                <TableCell className="text-sm font-semibold text-foreground">{row.amount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.accountLabel}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
