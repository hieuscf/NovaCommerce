/**
 * Presentation fixtures for Seller Customer Chat until a Seller / Messaging
 * Gateway adapter exists. Do not treat as domain aggregates.
 */

export type SellerChatMessageRole = 'customer' | 'seller';

export interface SellerChatProductRef {
  name: string;
  sku: string;
  accent: string;
  initials: string;
}

export interface SellerChatMessage {
  id: string;
  role: SellerChatMessageRole;
  text?: string;
  at: string;
  images?: { accent: string; label: string }[];
}

export interface SellerChatThread {
  id: string;
  customerName: string;
  initials: string;
  accent: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
  online: boolean;
  product: SellerChatProductRef;
  email: string;
  phone: string;
  city: string;
  messages: SellerChatMessage[];
}

export interface SellerChatQuickVoucher {
  id: string;
  code: string;
  title: string;
}

export interface SellerChatTemplate {
  id: string;
  label: string;
}

export const sellerChatInboxTabs = [
  { id: 'all', label: 'Tất cả', count: 24 },
  { id: 'unread', label: 'Chưa đọc', count: 3 },
  { id: 'read', label: 'Đã đọc', count: 16 },
] as const;

export const sellerChatAutoReplyDefault =
  'Xin chào! Cảm ơn bạn đã liên hệ HappyShop. Hiện shop đang bận, chúng tôi sẽ phản hồi trong vòng 15 phút.';

export const sellerChatQuickVouchers: SellerChatQuickVoucher[] = [
  { id: 'qv_1', code: 'CHAT10', title: 'Giảm 10% đơn từ 200K' },
  { id: 'qv_2', code: 'SHIP15K', title: 'Giảm 15K phí vận chuyển' },
  { id: 'qv_3', code: 'FREESHIP', title: 'Freeship đơn từ 299K' },
];

export const sellerChatTemplates: SellerChatTemplate[] = [
  { id: 'tpl_1', label: 'Cảm ơn khách hàng' },
  { id: 'tpl_2', label: 'Thông tin sản phẩm' },
  { id: 'tpl_3', label: 'Hướng dẫn đổi trả' },
  { id: 'tpl_4', label: 'Xác nhận đơn hàng' },
];

export const sellerChatThreads: SellerChatThread[] = [
  {
    id: 'sc_mai',
    customerName: 'Nguyễn Thị Mai',
    initials: 'NM',
    accent: '#0EA5E9',
    lastMessage: 'Shop còn màu xanh navy size M không ạ?',
    lastAt: '10:24',
    unreadCount: 2,
    online: true,
    product: {
      name: 'Áo thun nam basic',
      sku: 'ATN001',
      accent: '#38BDF8',
      initials: 'AT',
    },
    email: 'mai.nguyen@email.com',
    phone: '0901 234 567',
    city: 'Hà Nội',
    messages: [
      {
        id: 'm1',
        role: 'customer',
        text: 'Chào shop, mình muốn hỏi về áo thun nam basic.',
        at: '10:12',
      },
      {
        id: 'm2',
        role: 'seller',
        text: 'Chào bạn Mai, shop sẵn sàng hỗ trợ ạ. Bạn cần tư vấn size hay màu nào?',
        at: '10:14',
      },
      {
        id: 'm3',
        role: 'customer',
        text: 'Mình gửi ảnh màu đang xem, giúp mình xác nhận còn hàng giúp nhé.',
        at: '10:18',
        images: [
          { accent: '#38BDF8', label: 'Navy' },
          { accent: '#64748B', label: 'Gray' },
          { accent: '#F8FAFC', label: 'White' },
        ],
      },
      {
        id: 'm4',
        role: 'seller',
        text: 'Dạ màu navy và xám vẫn còn size M. Bạn muốn đặt màu nào ạ?',
        at: '10:21',
      },
      {
        id: 'm5',
        role: 'customer',
        text: 'Shop còn màu xanh navy size M không ạ?',
        at: '10:24',
      },
    ],
  },
  {
    id: 'sc_long',
    customerName: 'Trần Hoàng Long',
    initials: 'TL',
    accent: '#6366F1',
    lastMessage: 'Đơn #NC152634 giao lúc nào vậy shop?',
    lastAt: '09:50',
    unreadCount: 1,
    online: false,
    product: {
      name: 'Samsung Galaxy Watch 6',
      sku: 'GW600',
      accent: '#14B8A6',
      initials: 'GW',
    },
    email: 'long.tran@email.com',
    phone: '0912 888 331',
    city: 'TP.HCM',
    messages: [
      {
        id: 'm1',
        role: 'customer',
        text: 'Đơn #NC152634 giao lúc nào vậy shop?',
        at: '09:50',
      },
    ],
  },
  {
    id: 'sc_ha',
    customerName: 'Lê Thu Hà',
    initials: 'LH',
    accent: '#EC4899',
    lastMessage: 'Cảm ơn shop, mình nhận hàng rồi ạ.',
    lastAt: 'Hôm qua',
    unreadCount: 0,
    online: false,
    product: {
      name: 'Bộ dưỡng da Vitamin C',
      sku: 'VCSET',
      accent: '#F472B6',
      initials: 'VC',
    },
    email: 'ha.le@email.com',
    phone: '0987 112 334',
    city: 'Đà Nẵng',
    messages: [
      {
        id: 'm1',
        role: 'customer',
        text: 'Cảm ơn shop, mình nhận hàng rồi ạ.',
        at: 'Hôm qua · 16:20',
      },
      {
        id: 'm2',
        role: 'seller',
        text: 'Cảm ơn bạn đã ủng hộ HappyShop. Chúc bạn dùng sản phẩm vừa ý ạ!',
        at: 'Hôm qua · 16:28',
      },
    ],
  },
  {
    id: 'sc_huy',
    customerName: 'Phạm Quốc Huy',
    initials: 'PH',
    accent: '#F59E0B',
    lastMessage: 'Có thể đổi size L sang XL được không?',
    lastAt: 'Hôm qua',
    unreadCount: 0,
    online: true,
    product: {
      name: 'Áo thun Oversize Premium',
      sku: 'OV002',
      accent: '#F59E0B',
      initials: 'OV',
    },
    email: 'huy.pham@email.com',
    phone: '0933 445 667',
    city: 'Bình Dương',
    messages: [
      {
        id: 'm1',
        role: 'customer',
        text: 'Có thể đổi size L sang XL được không?',
        at: 'Hôm qua · 11:05',
      },
    ],
  },
  {
    id: 'sc_ngoc',
    customerName: 'Võ Bảo Ngọc',
    initials: 'VN',
    accent: '#22C55E',
    lastMessage: 'Shop gửi giúp mình mã freeship nhé.',
    lastAt: 'T3',
    unreadCount: 0,
    online: false,
    product: {
      name: 'Giày chạy bộ Nova Flex',
      sku: 'NF100',
      accent: '#22C55E',
      initials: 'NF',
    },
    email: 'ngoc.vo@email.com',
    phone: '0966 778 990',
    city: 'Cần Thơ',
    messages: [
      {
        id: 'm1',
        role: 'customer',
        text: 'Shop gửi giúp mình mã freeship nhé.',
        at: 'T3 · 14:40',
      },
    ],
  },
];

export function filterSellerChatThreads(
  threads: SellerChatThread[],
  query: { inbox?: string; q?: string },
): SellerChatThread[] {
  const q = query.q?.trim().toLowerCase();
  return threads.filter((thread) => {
    if (query.inbox === 'unread' && thread.unreadCount <= 0) return false;
    if (query.inbox === 'read' && thread.unreadCount > 0) return false;
    if (!q) return true;
    return (
      thread.customerName.toLowerCase().includes(q) ||
      thread.lastMessage.toLowerCase().includes(q) ||
      thread.product.name.toLowerCase().includes(q)
    );
  });
}
