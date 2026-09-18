/**
 * Presentation fixtures for Seller Order Management until a Seller /
 * Order Gateway adapter exists. Do not treat as domain aggregates.
 */

export type SellerOrderFulfillmentStatus =
  | 'pending_confirm'
  | 'awaiting_pickup'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'return_refund';

export interface SellerOrderKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeTone: 'up' | 'down';
  tone: 'total' | 'pending' | 'pickup' | 'shipping' | 'delivered' | 'cancelled';
}

export interface SellerOrderItem {
  name: string;
  quantity: number;
  price: string;
  accent: string;
  initials: string;
}

export interface SellerOrderTimelineStep {
  id: string;
  label: string;
  at?: string;
  state: 'done' | 'current' | 'upcoming';
}

export interface SellerOrderRow {
  id: string;
  orderNumber: string;
  placedAt: string;
  productName: string;
  quantity: number;
  accent: string;
  initials: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  total: string;
  subtotal: string;
  shippingFee: string;
  paymentMethod: string;
  status: SellerOrderFulfillmentStatus;
  carrier?: string;
  trackingCode?: string;
  shippingNote?: string;
  items: SellerOrderItem[];
  timeline: SellerOrderTimelineStep[];
  action: 'confirm' | 'prepare' | 'track' | 'view' | 'refund';
}

export const sellerOrderKpis: SellerOrderKpi[] = [
  {
    id: 'total',
    label: 'Tổng đơn hàng',
    value: '328',
    change: '↑ 12% so với tuần trước',
    changeTone: 'up',
    tone: 'total',
  },
  {
    id: 'pending',
    label: 'Chờ xác nhận',
    value: '32',
    change: '↑ 5% so với tuần trước',
    changeTone: 'up',
    tone: 'pending',
  },
  {
    id: 'pickup',
    label: 'Chờ lấy hàng',
    value: '56',
    change: '↑ 8% so với tuần trước',
    changeTone: 'up',
    tone: 'pickup',
  },
  {
    id: 'shipping',
    label: 'Đang giao',
    value: '142',
    change: '↑ 12% so với tuần trước',
    changeTone: 'up',
    tone: 'shipping',
  },
  {
    id: 'delivered',
    label: 'Đã giao',
    value: '87',
    change: '↑ 19% so với tuần trước',
    changeTone: 'up',
    tone: 'delivered',
  },
  {
    id: 'cancelled',
    label: 'Đã hủy / Thất bại',
    value: '11',
    change: '↓ 3% so với tuần trước',
    changeTone: 'down',
    tone: 'cancelled',
  },
];

export const sellerOrderTabs = [
  { id: 'all', label: 'Tất cả', count: 328 },
  { id: 'pending_confirm', label: 'Chờ xác nhận', count: 32 },
  { id: 'awaiting_pickup', label: 'Chờ lấy hàng', count: 56 },
  { id: 'shipping', label: 'Đang giao', count: 142 },
  { id: 'delivered', label: 'Đã giao', count: 87 },
  { id: 'cancelled', label: 'Đã hủy / Thất bại', count: 11 },
  { id: 'return_refund', label: 'Trả hàng / Hoàn tiền', count: 4 },
] as const;

export const sellerOrderStatusLabel: Record<SellerOrderFulfillmentStatus, string> = {
  pending_confirm: 'Chờ xác nhận',
  awaiting_pickup: 'Chờ lấy hàng',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  return_refund: 'Trả hàng / Hoàn tiền',
};

export const SELLER_ORDER_PAGE_SIZE = 8;
export const SELLER_ORDER_TOTAL_COUNT = 328;
export const SELLER_ORDER_TOTAL_PAGES = Math.ceil(
  SELLER_ORDER_TOTAL_COUNT / SELLER_ORDER_PAGE_SIZE,
);

export const sellerOrders: SellerOrderRow[] = [
  {
    id: 'so_152636',
    orderNumber: '#NC152636',
    placedAt: '18/09/2025 · 09:42',
    productName: 'MacBook Pro 14" M3 Pro 512GB',
    quantity: 1,
    accent: '#0EA5E9',
    initials: 'MB',
    customerName: 'Nguyễn Minh Anh',
    customerPhone: '0901 234 567',
    customerCity: 'Quận 1, TP.HCM',
    customerAddress: '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    total: '42.990.000₫',
    subtotal: '42.490.000₫',
    shippingFee: '500.000₫',
    paymentMethod: 'Thanh toán COD',
    status: 'pending_confirm',
    shippingNote: 'Chưa bàn giao vận chuyển',
    items: [
      {
        name: 'MacBook Pro 14" M3 Pro 512GB',
        quantity: 1,
        price: '42.490.000₫',
        accent: '#0EA5E9',
        initials: 'MB',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '18/09 · 09:42', state: 'done' },
      { id: 't2', label: 'Chờ xác nhận', at: 'Đang chờ', state: 'current' },
      { id: 't3', label: 'Chuẩn bị hàng', state: 'upcoming' },
      { id: 't4', label: 'Đang giao', state: 'upcoming' },
      { id: 't5', label: 'Giao thành công', state: 'upcoming' },
    ],
    action: 'confirm',
  },
  {
    id: 'so_152635',
    orderNumber: '#NC152635',
    placedAt: '18/09/2025 · 08:15',
    productName: 'Tai nghe Bluetooth Pro 5',
    quantity: 2,
    accent: '#6366F1',
    initials: 'TB',
    customerName: 'Trần Hoàng Long',
    customerPhone: '0912 888 331',
    customerCity: 'Hà Nội',
    customerAddress: '45 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    total: '2.598.000₫',
    subtotal: '2.598.000₫',
    shippingFee: '0₫',
    paymentMethod: 'VnPay',
    status: 'awaiting_pickup',
    carrier: 'GHN Express',
    trackingCode: 'GHN948221',
    shippingNote: 'Đơn vị vận chuyển sẽ đến lấy hàng hôm nay',
    items: [
      {
        name: 'Tai nghe Bluetooth Pro 5',
        quantity: 2,
        price: '1.299.000₫',
        accent: '#6366F1',
        initials: 'TB',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '18/09 · 08:15', state: 'done' },
      { id: 't2', label: 'Đã xác nhận', at: '18/09 · 08:40', state: 'done' },
      { id: 't3', label: 'Chờ lấy hàng', at: 'Đang chờ', state: 'current' },
      { id: 't4', label: 'Đang giao', state: 'upcoming' },
      { id: 't5', label: 'Giao thành công', state: 'upcoming' },
    ],
    action: 'prepare',
  },
  {
    id: 'so_152634',
    orderNumber: '#NC152634',
    placedAt: '17/09/2025 · 21:03',
    productName: 'Samsung Galaxy Watch 6',
    quantity: 1,
    accent: '#14B8A6',
    initials: 'GW',
    customerName: 'Lê Thu Hà',
    customerPhone: '0987 112 334',
    customerCity: 'Đà Nẵng',
    customerAddress: '88 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    total: '6.490.000₫',
    subtotal: '6.290.000₫',
    shippingFee: '200.000₫',
    paymentMethod: 'MoMo',
    status: 'shipping',
    carrier: 'VNPost',
    trackingCode: 'VNP552901',
    shippingNote: 'Đơn hàng đang trên đường giao đến khách',
    items: [
      {
        name: 'Samsung Galaxy Watch 6',
        quantity: 1,
        price: '6.290.000₫',
        accent: '#14B8A6',
        initials: 'GW',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '17/09 · 21:03', state: 'done' },
      { id: 't2', label: 'Đã xác nhận', at: '17/09 · 21:20', state: 'done' },
      { id: 't3', label: 'Đã lấy hàng', at: '18/09 · 07:10', state: 'done' },
      { id: 't4', label: 'Đang giao', at: 'Đang vận chuyển', state: 'current' },
      { id: 't5', label: 'Giao thành công', state: 'upcoming' },
    ],
    action: 'track',
  },
  {
    id: 'so_152633',
    orderNumber: '#NC152633',
    placedAt: '17/09/2025 · 16:48',
    productName: 'Áo thun Oversize Premium',
    quantity: 3,
    accent: '#F59E0B',
    initials: 'AT',
    customerName: 'Phạm Quốc Huy',
    customerPhone: '0933 445 667',
    customerCity: 'Bình Dương',
    customerAddress: '21 Đại lộ Bình Dương, Thủ Dầu Một',
    total: '897.000₫',
    subtotal: '897.000₫',
    shippingFee: '0₫',
    paymentMethod: 'Thanh toán COD',
    status: 'shipping',
    carrier: 'J&T Express',
    trackingCode: 'JT778120',
    shippingNote: 'Shipper đang giao trong khu vực',
    items: [
      {
        name: 'Áo thun Oversize Premium',
        quantity: 3,
        price: '299.000₫',
        accent: '#F59E0B',
        initials: 'AT',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '17/09 · 16:48', state: 'done' },
      { id: 't2', label: 'Đã xác nhận', at: '17/09 · 17:05', state: 'done' },
      { id: 't3', label: 'Đã lấy hàng', at: '18/09 · 06:40', state: 'done' },
      { id: 't4', label: 'Đang giao', at: 'Đang vận chuyển', state: 'current' },
      { id: 't5', label: 'Giao thành công', state: 'upcoming' },
    ],
    action: 'track',
  },
  {
    id: 'so_152632',
    orderNumber: '#NC152632',
    placedAt: '17/09/2025 · 11:22',
    productName: 'Bộ dưỡng da Vitamin C Set',
    quantity: 1,
    accent: '#EC4899',
    initials: 'VC',
    customerName: 'Võ Bảo Ngọc',
    customerPhone: '0966 778 990',
    customerCity: 'Cần Thơ',
    customerAddress: '15 Nguyễn Trãi, Ninh Kiều, Cần Thơ',
    total: '1.250.000₫',
    subtotal: '1.150.000₫',
    shippingFee: '100.000₫',
    paymentMethod: 'PayPal',
    status: 'delivered',
    carrier: 'GHN Express',
    trackingCode: 'GHN941002',
    shippingNote: 'Đã giao thành công lúc 15:20',
    items: [
      {
        name: 'Bộ dưỡng da Vitamin C Set',
        quantity: 1,
        price: '1.150.000₫',
        accent: '#EC4899',
        initials: 'VC',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '17/09 · 11:22', state: 'done' },
      { id: 't2', label: 'Đã xác nhận', at: '17/09 · 11:40', state: 'done' },
      { id: 't3', label: 'Đã lấy hàng', at: '17/09 · 16:00', state: 'done' },
      { id: 't4', label: 'Đang giao', at: '18/09 · 09:00', state: 'done' },
      { id: 't5', label: 'Giao thành công', at: '18/09 · 15:20', state: 'done' },
    ],
    action: 'view',
  },
  {
    id: 'so_152631',
    orderNumber: '#NC152631',
    placedAt: '16/09/2025 · 19:55',
    productName: 'Nồi chiên không dầu 5L',
    quantity: 1,
    accent: '#8B5CF6',
    initials: 'NC',
    customerName: 'Đặng Thu Trang',
    customerPhone: '0909 221 334',
    customerCity: 'Hải Phòng',
    customerAddress: '72 Lạch Tray, Ngô Quyền, Hải Phòng',
    total: '2.190.000₫',
    subtotal: '2.090.000₫',
    shippingFee: '100.000₫',
    paymentMethod: 'VnPay',
    status: 'cancelled',
    shippingNote: 'Khách hủy trước khi xác nhận',
    items: [
      {
        name: 'Nồi chiên không dầu 5L',
        quantity: 1,
        price: '2.090.000₫',
        accent: '#8B5CF6',
        initials: 'NC',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '16/09 · 19:55', state: 'done' },
      { id: 't2', label: 'Chờ xác nhận', at: '16/09 · 20:05', state: 'done' },
      { id: 't3', label: 'Đã hủy', at: '16/09 · 21:10', state: 'current' },
    ],
    action: 'view',
  },
  {
    id: 'so_152630',
    orderNumber: '#NC152630',
    placedAt: '16/09/2025 · 14:10',
    productName: 'Giày chạy bộ Nova Flex',
    quantity: 1,
    accent: '#22C55E',
    initials: 'GF',
    customerName: 'Hoàng Đức Anh',
    customerPhone: '0944 556 778',
    customerCity: 'Nha Trang',
    customerAddress: '9 Trần Phú, Lộc Thọ, Nha Trang',
    total: '1.890.000₫',
    subtotal: '1.790.000₫',
    shippingFee: '100.000₫',
    paymentMethod: 'Thanh toán COD',
    status: 'return_refund',
    carrier: 'VNPost',
    trackingCode: 'VNP550118',
    shippingNote: 'Khách yêu cầu đổi size — chờ nhận hàng trả',
    items: [
      {
        name: 'Giày chạy bộ Nova Flex',
        quantity: 1,
        price: '1.790.000₫',
        accent: '#22C55E',
        initials: 'GF',
      },
    ],
    timeline: [
      { id: 't1', label: 'Giao thành công', at: '14/09 · 16:00', state: 'done' },
      { id: 't2', label: 'Yêu cầu trả hàng', at: '16/09 · 14:10', state: 'current' },
      { id: 't3', label: 'Hoàn tiền', state: 'upcoming' },
    ],
    action: 'refund',
  },
  {
    id: 'so_152629',
    orderNumber: '#NC152629',
    placedAt: '16/09/2025 · 10:05',
    productName: 'Bàn phím cơ Keychron K2',
    quantity: 1,
    accent: '#64748B',
    initials: 'KB',
    customerName: 'Ngô Nhật Nam',
    customerPhone: '0977 889 001',
    customerCity: 'Quận 7, TP.HCM',
    customerAddress: '102 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM',
    total: '2.450.000₫',
    subtotal: '2.350.000₫',
    shippingFee: '100.000₫',
    paymentMethod: 'MoMo',
    status: 'pending_confirm',
    shippingNote: 'Chưa bàn giao vận chuyển',
    items: [
      {
        name: 'Bàn phím cơ Keychron K2',
        quantity: 1,
        price: '2.350.000₫',
        accent: '#64748B',
        initials: 'KB',
      },
    ],
    timeline: [
      { id: 't1', label: 'Đặt hàng thành công', at: '16/09 · 10:05', state: 'done' },
      { id: 't2', label: 'Chờ xác nhận', at: 'Đang chờ', state: 'current' },
      { id: 't3', label: 'Chuẩn bị hàng', state: 'upcoming' },
      { id: 't4', label: 'Đang giao', state: 'upcoming' },
      { id: 't5', label: 'Giao thành công', state: 'upcoming' },
    ],
    action: 'confirm',
  },
];

export function filterSellerOrders(
  orders: SellerOrderRow[],
  query: {
    q?: string;
    tab?: string;
    status?: string;
  },
): SellerOrderRow[] {
  const q = query.q?.trim().toLowerCase();
  return orders.filter((order) => {
    if (query.tab && query.tab !== 'all' && order.status !== query.tab) return false;
    if (query.status && query.status !== 'all' && order.status !== query.status) return false;
    if (!q) return true;
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.productName.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
      (order.trackingCode?.toLowerCase().includes(q) ?? false)
    );
  });
}
