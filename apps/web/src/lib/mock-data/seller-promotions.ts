/**
 * Presentation fixtures for Seller Promotions & Campaigns until a Seller /
 * Marketing Gateway adapter exists. Do not treat as domain aggregates.
 */

export type SellerPromotionKind =
  | 'vouchers'
  | 'flash_sale'
  | 'combo'
  | 'campaigns'
  | 'ads';

export type SellerVoucherStatus = 'active' | 'pending' | 'ended';

export interface SellerPromotionTool {
  id: SellerPromotionKind;
  title: string;
  description: string;
  actionLabel: string;
  tone: 'violet' | 'pink' | 'green' | 'orange' | 'blue';
}

export interface SellerPromotionKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeTone: 'up' | 'down';
}

export interface SellerTopProgram {
  id: string;
  rank: number;
  name: string;
  kind: SellerPromotionKind;
  reach: string;
  orders: string;
  revenue: string;
}

export interface SellerLatestVoucher {
  id: string;
  code: string;
  title: string;
  meta: string;
  status: SellerVoucherStatus;
}

export const sellerPromotionTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'vouchers', label: 'Mã giảm giá' },
  { id: 'flash_sale', label: 'Flash Sale' },
  { id: 'combo', label: 'Combo' },
  { id: 'campaigns', label: 'Chiến dịch' },
  { id: 'ads', label: 'Quảng cáo' },
] as const;

export const sellerPromotionRangeOptions = [
  { value: '2025-04', label: '01/04/2025 - 30/04/2025' },
  { value: '2025-03', label: '01/03/2025 - 31/03/2025' },
  { value: '2025-02', label: '01/02/2025 - 28/02/2025' },
] as const;

export const sellerPromotionKindLabel: Record<SellerPromotionKind, string> = {
  vouchers: 'Mã giảm giá',
  flash_sale: 'Flash Sale',
  combo: 'Combo',
  campaigns: 'Chiến dịch',
  ads: 'Quảng cáo',
};

export const sellerVoucherStatusLabel: Record<SellerVoucherStatus, string> = {
  active: 'Đang hoạt động',
  pending: 'Chờ duyệt',
  ended: 'Đã kết thúc',
};

export const sellerPromotionTools: SellerPromotionTool[] = [
  {
    id: 'vouchers',
    title: 'Mã giảm giá',
    description: 'Tạo voucher % hoặc số tiền cố định để kích cầu đơn hàng.',
    actionLabel: 'Tạo mã',
    tone: 'violet',
  },
  {
    id: 'flash_sale',
    title: 'Flash Sale của Shop',
    description: 'Giảm sâu theo khung giờ để tăng chuyển đổi nhanh.',
    actionLabel: 'Tạo Flash Sale',
    tone: 'pink',
  },
  {
    id: 'combo',
    title: 'Combo / Mua kèm deal sốc',
    description: 'Gói sản phẩm mua kèm để tăng giá trị đơn trung bình.',
    actionLabel: 'Tạo combo',
    tone: 'green',
  },
  {
    id: 'campaigns',
    title: 'Chiến dịch Sàn',
    description: 'Tham gia 11.11, 12.12 và các campaign lớn của nền tảng.',
    actionLabel: 'Xem chiến dịch',
    tone: 'orange',
  },
  {
    id: 'ads',
    title: 'Quảng cáo',
    description: 'Đẩy sản phẩm lên vị trí nổi bật với ngân sách linh hoạt.',
    actionLabel: 'Tạo quảng cáo',
    tone: 'blue',
  },
];

export const sellerPromotionKpis: SellerPromotionKpi[] = [
  {
    id: 'reach',
    label: 'Tổng lượt tiếp cận',
    value: '523.682',
    change: '↑ 18%',
    changeTone: 'up',
  },
  {
    id: 'orders',
    label: 'Tổng đơn từ KM',
    value: '1.248',
    change: '↑ 23%',
    changeTone: 'up',
  },
  {
    id: 'revenue',
    label: 'Doanh thu từ KM',
    value: '362.450.000₫',
    change: '↑ 27%',
    changeTone: 'up',
  },
  {
    id: 'conversion',
    label: 'Tỷ lệ chuyển đổi',
    value: '3.42%',
    change: '↑ 12%',
    changeTone: 'up',
  },
];

export const sellerTopPrograms: SellerTopProgram[] = [
  {
    id: 'tp_1',
    rank: 1,
    name: 'SALE20 - Giảm 20% toàn shop',
    kind: 'vouchers',
    reach: '128.4K',
    orders: '412',
    revenue: '98.200.000₫',
  },
  {
    id: 'tp_2',
    rank: 2,
    name: 'Flash Sale cuối tuần',
    kind: 'flash_sale',
    reach: '96.1K',
    orders: '286',
    revenue: '74.850.000₫',
  },
  {
    id: 'tp_3',
    rank: 3,
    name: 'Combo Tai nghe + Ốp lưng',
    kind: 'combo',
    reach: '54.7K',
    orders: '198',
    revenue: '52.100.000₫',
  },
  {
    id: 'tp_4',
    rank: 4,
    name: 'Quảng cáo sản phẩm nổi bật',
    kind: 'ads',
    reach: '210.3K',
    orders: '165',
    revenue: '41.600.000₫',
  },
];

export const sellerLatestVouchers: SellerLatestVoucher[] = [
  {
    id: 'vc_1',
    code: 'SALE20',
    title: 'Giảm 20% tối đa 100K',
    meta: 'Toàn shop · Hết hạn 30/04',
    status: 'active',
  },
  {
    id: 'vc_2',
    code: 'FREESHIP50',
    title: 'Freeship đơn từ 150K',
    meta: 'Đơn tối thiểu 150.000₫',
    status: 'active',
  },
  {
    id: 'vc_3',
    code: 'NEWUSER15',
    title: 'Giảm 15% cho khách mới',
    meta: 'Chờ duyệt bởi nền tảng',
    status: 'pending',
  },
  {
    id: 'vc_4',
    code: 'APRIL10',
    title: 'Giảm 10% tháng 4',
    meta: 'Đã kết thúc 15/04',
    status: 'ended',
  },
];

export const sellerPromotionTip =
  'Kết hợp Flash Sale khung giờ vàng với voucher FREESHIP để tăng tỷ lệ chuyển đổi thêm 15–25% so với chạy đơn lẻ.';

export function filterTopPrograms(
  programs: SellerTopProgram[],
  tab: string,
): SellerTopProgram[] {
  if (!tab || tab === 'all') return programs;
  return programs.filter((program) => program.kind === tab);
}
