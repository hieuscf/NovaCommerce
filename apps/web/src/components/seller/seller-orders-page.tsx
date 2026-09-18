'use client';

import { useEffect, useState } from 'react';
import { filterSellerOrders, sellerOrders } from '@/lib/mock-data/seller-orders';
import type { SellerOrdersQuery } from '@/lib/url/seller-workspace-query';
import { SellerOrdersDetailPanel } from './seller-orders-detail-panel';
import { SellerOrdersKpiCards } from './seller-orders-kpi-cards';
import { SellerOrdersPagination } from './seller-orders-pagination';
import { SellerOrdersTable } from './seller-orders-table';
import { SellerOrdersToolbar } from './seller-orders-toolbar';

export function SellerOrdersPage({ query }: { query: SellerOrdersQuery }) {
  const rows = filterSellerOrders(sellerOrders, query);
  const [selectedId, setSelectedId] = useState(rows[0]?.id);
  const selectedOrder = rows.find((order) => order.id === selectedId) ?? rows[0];

  useEffect(() => {
    if (!rows.some((order) => order.id === selectedId)) {
      setSelectedId(rows[0]?.id);
    }
  }, [rows, selectedId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Đơn hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý toàn bộ đơn hàng, xác nhận, chuẩn bị hàng và theo dõi vận chuyển.
        </p>
      </div>

      <SellerOrdersKpiCards />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <SellerOrdersToolbar query={query} />
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <SellerOrdersTable
                orders={rows}
                selectedId={selectedOrder?.id}
                onSelect={setSelectedId}
              />
            </div>
            <div className="rounded-2xl border border-border bg-white shadow-sm">
              <SellerOrdersPagination query={query} />
            </div>
          </div>
        </div>
        <SellerOrdersDetailPanel order={selectedOrder} />
      </div>
    </div>
  );
}
