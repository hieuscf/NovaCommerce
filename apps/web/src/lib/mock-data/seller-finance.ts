/**
 * Presentation fixtures for Seller Finance / Wallet until a Seller Gateway
 * adapter exists. Do not treat as domain aggregates.
 */

export type SellerWithdrawalStatus = 'processed' | 'processing' | 'failed';

export interface SellerFinanceWallet {
  availableBalance: string;
  totalRevenue: string;
  processingAmount: string;
}

export interface SellerLinkedBank {
  bankName: string;
  accountMasked: string;
  initials: string;
  accent: string;
}

export interface SellerMonthlyRevenue {
  amount: string;
  change: string;
  changeTone: 'up' | 'down';
  bars: number[];
}

export interface SellerFinanceChartPoint {
  date: string;
  label: string;
  revenue: number;
  fee: number;
}

export interface SellerRevenueBreakdownItem {
  id: string;
  label: string;
  amount: string;
  tone: 'neutral' | 'debit';
}

export interface SellerWithdrawalRow {
  id: string;
  requestedAt: string;
  amount: string;
  accountLabel: string;
  status: SellerWithdrawalStatus;
}

export interface SellerReportFile {
  id: string;
  name: string;
  meta: string;
}

export interface SellerInvoiceFile {
  id: string;
  name: string;
  meta: string;
}

export const sellerFinanceMonthOptions = [
  { value: '2025-04', label: 'Tháng 4/2025' },
  { value: '2025-03', label: 'Tháng 3/2025' },
  { value: '2025-02', label: 'Tháng 2/2025' },
] as const;

export const sellerFinanceWallet: SellerFinanceWallet = {
  availableBalance: '12.580.000₫',
  totalRevenue: '18.230.000₫',
  processingAmount: '2.150.000₫',
};

export const sellerLinkedBank: SellerLinkedBank = {
  bankName: 'Vietcombank',
  accountMasked: '**** **** 1234',
  initials: 'VCB',
  accent: '#1D4ED8',
};

export const sellerMonthlyRevenue: SellerMonthlyRevenue = {
  amount: '18.230.000₫',
  change: '+ 12% so với tháng trước',
  changeTone: 'up',
  bars: [42, 58, 48, 72, 64, 88, 76],
};

export const sellerFinanceChartSeries: SellerFinanceChartPoint[] = [
  { date: '2025-04-01', label: '01/04', revenue: 4.2, fee: 0.8 },
  { date: '2025-04-05', label: '05/04', revenue: 6.1, fee: 1.1 },
  { date: '2025-04-10', label: '10/04', revenue: 5.4, fee: 0.9 },
  { date: '2025-04-15', label: '15/04', revenue: 8.7, fee: 1.6 },
  { date: '2025-04-20', label: '20/04', revenue: 12.45, fee: 2.34 },
  { date: '2025-04-25', label: '25/04', revenue: 9.8, fee: 1.9 },
  { date: '2025-04-30', label: '30/04', revenue: 11.2, fee: 2.1 },
];

export const sellerFinanceChartHighlight = {
  date: '2025-04-20',
  revenueLabel: '12.450.000₫',
  feeLabel: '2.340.000₫',
};

export const sellerRevenueBreakdown: SellerRevenueBreakdownItem[] = [
  {
    id: 'orders',
    label: 'Tổng doanh thu từ đơn hàng',
    amount: '18.230.000₫',
    tone: 'neutral',
  },
  {
    id: 'platform',
    label: 'Phí sàn',
    amount: '- 1.823.000₫',
    tone: 'debit',
  },
  {
    id: 'shipping',
    label: 'Phí vận chuyển',
    amount: '- 2.145.000₫',
    tone: 'debit',
  },
  {
    id: 'fixed',
    label: 'Phí cố định',
    amount: '- 500.000₫',
    tone: 'debit',
  },
  {
    id: 'marketing',
    label: 'Phí tiếp thị',
    amount: '- 320.000₫',
    tone: 'debit',
  },
];

export const sellerRevenueNetReceived = '13.442.000₫';

export const sellerWithdrawalStatusLabel: Record<SellerWithdrawalStatus, string> = {
  processed: 'Đã xử lý',
  processing: 'Đang xử lý',
  failed: 'Thất bại',
};

export const sellerWithdrawals: SellerWithdrawalRow[] = [
  {
    id: 'wd_1',
    requestedAt: '18/04/2025',
    amount: '5.000.000₫',
    accountLabel: 'VCB · ****1234',
    status: 'processed',
  },
  {
    id: 'wd_2',
    requestedAt: '12/04/2025',
    amount: '3.200.000₫',
    accountLabel: 'VCB · ****1234',
    status: 'processed',
  },
  {
    id: 'wd_3',
    requestedAt: '05/04/2025',
    amount: '2.150.000₫',
    accountLabel: 'VCB · ****1234',
    status: 'processing',
  },
  {
    id: 'wd_4',
    requestedAt: '28/03/2025',
    amount: '4.800.000₫',
    accountLabel: 'VCB · ****1234',
    status: 'processed',
  },
];

export const sellerReportFiles: SellerReportFile[] = [
  { id: 'rp_1', name: 'Báo cáo doanh thu tháng 4', meta: 'PDF · 245 KB' },
  { id: 'rp_2', name: 'Báo cáo phí & chiết khấu', meta: 'PDF · 182 KB' },
  { id: 'rp_3', name: 'Báo cáo tổng hợp tháng 4', meta: 'PDF · 310 KB' },
];

export const sellerInvoiceFiles: SellerInvoiceFile[] = [
  { id: 'inv_1', name: 'Hóa đơn VAT tháng 4/2025', meta: 'PDF · 128 KB' },
  { id: 'inv_2', name: 'Hóa đơn VAT tháng 3/2025', meta: 'PDF · 134 KB' },
  { id: 'inv_3', name: 'Hóa đơn VAT tháng 2/2025', meta: 'PDF · 121 KB' },
];
