import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrderDetailPage } from '@/components/commerce/orders/order-detail-page';
import { getOrderDetail, listOrderNumbers } from '@/lib/orders/get-order-detail';
import { formatOrderNumber, normalizeOrderNumber } from '@/lib/view-models/order';

interface OrderDetailRouteProps {
  params: Promise<{ orderNumber: string }>;
}

export function generateStaticParams() {
  return listOrderNumbers().map((orderNumber) => ({ orderNumber }));
}

export async function generateMetadata({ params }: OrderDetailRouteProps): Promise<Metadata> {
  const { orderNumber } = await params;
  const detail = getOrderDetail(orderNumber);

  if (!detail) {
    return { title: 'Order not found', robots: { index: false, follow: false } };
  }

  return {
    title: `Order ${formatOrderNumber(detail.orderNumber)}`,
    description: `Details for order ${formatOrderNumber(detail.orderNumber)}.`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailRoutePage({ params }: OrderDetailRouteProps) {
  const { orderNumber } = await params;
  const detail = getOrderDetail(normalizeOrderNumber(decodeURIComponent(orderNumber)));

  if (!detail) {
    notFound();
  }

  return <OrderDetailPage detail={detail} />;
}
