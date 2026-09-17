/**
 * Presentation fixtures for Admin Seller Verification & Approval.
 * Field groups mirror the web seller onboarding wizard
 * (`SellerRegisterFormValues` in apps/web) until a Seller Gateway exists.
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalDocument {
  id: string;
  title: string;
  fileName: string;
  kind: 'pdf' | 'image';
  status: 'uploaded' | 'missing';
}

export interface ApprovalActivityItem {
  id: string;
  at: string;
  actor: string;
  summary: string;
}

export interface SellerApplication {
  id: string;
  displayId: string;
  name: string;
  email: string;
  initials: string;
  accent: string;
  shopName: string;
  shopSlug: string;
  category: string;
  categoryLabel: string;
  categoryAccent: string;
  submittedAt: string;
  status: ApprovalStatus;
  /** Business Information (web step 1) */
  business: {
    businessName: string;
    businessType: string;
    businessTypeLabel: string;
    legalBusinessName: string;
    identityNumber: string;
    businessEmail: string;
    phone: string;
    businessLicenseNumber: string;
    taxId: string;
    legalRepresentativeName: string;
    legalRepresentativeId: string;
    addressLine1: string;
    addressLine2?: string;
    cityLabel: string;
    stateLabel: string;
    postalCode: string;
  };
  /** Shop Details (web step 2) */
  shop: {
    description: string;
    facebookUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    expectedProducts: string;
  };
  /** Verification (web step 3) */
  verification: {
    sellingModel: string;
    sellingModelLabel: string;
    documents: ApprovalDocument[];
  };
  /** Terms (web step 4) */
  agreements: {
    acceptTerms: boolean;
    acceptSellerAgreement: boolean;
    acceptPrivacy: boolean;
    agreedAt: string;
  };
  activity: ApprovalActivityItem[];
}

export interface ApprovalKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
  hintTone: 'muted' | 'success' | 'destructive';
  tone: 'primary' | 'success' | 'destructive' | 'secondary';
}

export const approvalsPageMeta = {
  title: 'Seller Verification & Approval',
  description:
    'Review and approve seller applications. Verify their information and documents before activating their seller account.',
  breadcrumb: [
    { label: 'Home', href: '/' as string | undefined },
    { label: 'Sellers', href: '/sellers' as string | undefined },
    { label: 'Pending Approval', href: undefined as string | undefined },
  ],
};

export const approvalKpis: ApprovalKpi[] = [
  {
    id: 'pending',
    label: 'Pending Approval',
    value: '24',
    hint: 'Needs review',
    hintTone: 'muted',
    tone: 'primary',
  },
  {
    id: 'approved',
    label: 'Approved Today',
    value: '12',
    hint: '+20% vs yesterday',
    hintTone: 'success',
    tone: 'success',
  },
  {
    id: 'rejected',
    label: 'Rejected Today',
    value: '3',
    hint: '-25% vs yesterday',
    hintTone: 'destructive',
    tone: 'destructive',
  },
  {
    id: 'total',
    label: 'Total Applications',
    value: '248',
    hint: '+12% vs last 7 days',
    hintTone: 'success',
    tone: 'secondary',
  },
];

const baseDocs = (prefix: string): ApprovalDocument[] => [
  {
    id: `${prefix}_license`,
    title: 'Business License',
    fileName: 'business-license.pdf',
    kind: 'pdf',
    status: 'uploaded',
  },
  {
    id: `${prefix}_tax`,
    title: 'Tax Certificate',
    fileName: 'tax-certificate.pdf',
    kind: 'pdf',
    status: 'uploaded',
  },
  {
    id: `${prefix}_id`,
    title: 'ID Card',
    fileName: 'id-card.jpg',
    kind: 'image',
    status: 'uploaded',
  },
  {
    id: `${prefix}_auth`,
    title: 'Brand distribution authorization',
    fileName: 'authorization-letter.pdf',
    kind: 'pdf',
    status: 'uploaded',
  },
  {
    id: `${prefix}_quality`,
    title: 'Product quality / food safety certificate',
    fileName: 'quality-certificate.pdf',
    kind: 'pdf',
    status: 'uploaded',
  },
  {
    id: `${prefix}_origin`,
    title: 'Import invoice / origin document',
    fileName: 'origin-invoice.pdf',
    kind: 'pdf',
    status: 'uploaded',
  },
];

export const sellerApplications: SellerApplication[] = [
  {
    id: 'app_001',
    displayId: '#SELL-001',
    name: 'Nguyen Van A',
    email: 'nguyenvana@email.com',
    initials: 'NA',
    accent: '#6366F1',
    shopName: 'TechWorld Store',
    shopSlug: 'techworld-store',
    category: 'electronics',
    categoryLabel: 'Electronics',
    categoryAccent: '#6366F1',
    submittedAt: 'Sep 22, 2025 10:24 AM',
    status: 'pending',
    business: {
      businessName: 'TechWorld VN',
      businessType: 'individual',
      businessTypeLabel: 'Individual',
      legalBusinessName: 'Nguyen Van A',
      identityNumber: '079085001234',
      businessEmail: 'nguyenvana@email.com',
      phone: '+84 912 345 678',
      businessLicenseNumber: 'BL-HCM-2024-88421',
      taxId: '0312345678',
      legalRepresentativeName: 'Nguyen Van A',
      legalRepresentativeId: '079085001234',
      addressLine1: '123 Nguyen Hue, District 1',
      addressLine2: 'Floor 5',
      cityLabel: 'Ho Chi Minh City',
      stateLabel: 'Ho Chi Minh',
      postalCode: '700000',
    },
    shop: {
      description:
        'Premium electronics retailer specializing in laptops, smartphones, and accessories with authorized distribution.',
      facebookUrl: 'https://facebook.com/techworldstore',
      instagramUrl: 'https://instagram.com/techworldstore',
      websiteUrl: 'https://www.techworld.vn',
      expectedProducts: 'Laptops, smartphones, headphones, charging accessories',
    },
    verification: {
      sellingModel: 'retail',
      sellingModelLabel: 'Regular retail',
      documents: baseDocs('app_001'),
    },
    agreements: {
      acceptTerms: true,
      acceptSellerAgreement: true,
      acceptPrivacy: true,
      agreedAt: 'Sep 22, 2025 10:20 AM',
    },
    activity: [
      {
        id: 'act_1',
        at: 'Sep 22, 2025 10:24 AM',
        actor: 'System',
        summary: 'Application submitted and queued for review.',
      },
      {
        id: 'act_2',
        at: 'Sep 22, 2025 10:20 AM',
        actor: 'Nguyen Van A',
        summary: 'Accepted Terms & Conditions and Privacy Policy.',
      },
      {
        id: 'act_3',
        at: 'Sep 22, 2025 10:12 AM',
        actor: 'Nguyen Van A',
        summary: 'Uploaded verification documents.',
      },
    ],
  },
  {
    id: 'app_002',
    displayId: '#SELL-002',
    name: 'Tran Thi B',
    email: 'tranthib@email.com',
    initials: 'TB',
    accent: '#EC4899',
    shopName: 'Fashion Hub',
    shopSlug: 'fashion-hub',
    category: 'fashion',
    categoryLabel: 'Fashion',
    categoryAccent: '#EC4899',
    submittedAt: 'Sep 21, 2025 04:15 PM',
    status: 'pending',
    business: {
      businessName: 'Fashion Hub Co.',
      businessType: 'llc',
      businessTypeLabel: 'Limited Liability Company',
      legalBusinessName: 'Fashion Hub Limited Liability Company',
      identityNumber: '079090005678',
      businessEmail: 'tranthib@email.com',
      phone: '+84 988 111 222',
      businessLicenseNumber: 'BL-HN-2025-11200',
      taxId: '0109876543',
      legalRepresentativeName: 'Tran Thi B',
      legalRepresentativeId: '079090005678',
      addressLine1: '45 Hang Bai, Hoan Kiem',
      cityLabel: 'Hanoi',
      stateLabel: 'Hanoi',
      postalCode: '100000',
    },
    shop: {
      description: 'Contemporary fashion for everyday wear with local designer collections.',
      facebookUrl: 'https://facebook.com/fashionhub',
      expectedProducts: 'Apparel, shoes, bags, accessories',
    },
    verification: {
      sellingModel: 'retail',
      sellingModelLabel: 'Regular retail',
      documents: baseDocs('app_002').map((doc, index) =>
        index === 5 ? { ...doc, status: 'missing' as const } : doc,
      ),
    },
    agreements: {
      acceptTerms: true,
      acceptSellerAgreement: true,
      acceptPrivacy: true,
      agreedAt: 'Sep 21, 2025 04:10 PM',
    },
    activity: [
      {
        id: 'act_1',
        at: 'Sep 21, 2025 04:15 PM',
        actor: 'System',
        summary: 'Application submitted and queued for review.',
      },
    ],
  },
  {
    id: 'app_003',
    displayId: '#SELL-003',
    name: 'Le Van C',
    email: 'levanc@email.com',
    initials: 'LC',
    accent: '#0EA5E9',
    shopName: 'Home Comfort',
    shopSlug: 'home-comfort',
    category: 'home',
    categoryLabel: 'Home & Living',
    categoryAccent: '#22C55E',
    submittedAt: 'Sep 21, 2025 11:02 AM',
    status: 'pending',
    business: {
      businessName: 'Home Comfort',
      businessType: 'sole_proprietor',
      businessTypeLabel: 'Sole Proprietorship',
      legalBusinessName: 'Le Van C',
      identityNumber: '079088009999',
      businessEmail: 'levanc@email.com',
      phone: '+84 903 456 789',
      businessLicenseNumber: 'BL-DN-2025-33001',
      taxId: '0401122334',
      legalRepresentativeName: 'Le Van C',
      legalRepresentativeId: '079088009999',
      addressLine1: '88 Bach Dang',
      cityLabel: 'Da Nang',
      stateLabel: 'Da Nang',
      postalCode: '550000',
    },
    shop: {
      description: 'Home décor and furniture for modern Vietnamese apartments.',
      expectedProducts: 'Furniture, lighting, textiles',
    },
    verification: {
      sellingModel: 'manufacturer',
      sellingModelLabel: 'Manufacturer',
      documents: baseDocs('app_003'),
    },
    agreements: {
      acceptTerms: true,
      acceptSellerAgreement: true,
      acceptPrivacy: true,
      agreedAt: 'Sep 21, 2025 10:55 AM',
    },
    activity: [
      {
        id: 'act_1',
        at: 'Sep 21, 2025 11:02 AM',
        actor: 'System',
        summary: 'Application submitted and queued for review.',
      },
    ],
  },
  {
    id: 'app_004',
    displayId: '#SELL-004',
    name: 'Pham Minh D',
    email: 'phamminhd@email.com',
    initials: 'PD',
    accent: '#F59E0B',
    shopName: 'SportZone',
    shopSlug: 'sportzone',
    category: 'sports',
    categoryLabel: 'Sports',
    categoryAccent: '#F59E0B',
    submittedAt: 'Sep 20, 2025 03:40 PM',
    status: 'pending',
    business: {
      businessName: 'SportZone Official',
      businessType: 'corporation',
      businessTypeLabel: 'Corporation',
      legalBusinessName: 'SportZone Joint Stock Company',
      identityNumber: '031122334455',
      businessEmail: 'phamminhd@email.com',
      phone: '+84 977 222 333',
      businessLicenseNumber: 'BL-HCM-2023-55110',
      taxId: '0315566778',
      legalRepresentativeName: 'Pham Minh D',
      legalRepresentativeId: '079082001111',
      addressLine1: '200 Vo Van Kiet, District 5',
      cityLabel: 'Ho Chi Minh City',
      stateLabel: 'Ho Chi Minh',
      postalCode: '700000',
    },
    shop: {
      description: 'Authorized sportswear and equipment distributor.',
      websiteUrl: 'https://www.sportzone.vn',
      expectedProducts: 'Running shoes, apparel, gym equipment',
    },
    verification: {
      sellingModel: 'official',
      sellingModelLabel: 'Official Store / Mall',
      documents: baseDocs('app_004'),
    },
    agreements: {
      acceptTerms: true,
      acceptSellerAgreement: true,
      acceptPrivacy: true,
      agreedAt: 'Sep 20, 2025 03:35 PM',
    },
    activity: [
      {
        id: 'act_1',
        at: 'Sep 20, 2025 03:40 PM',
        actor: 'System',
        summary: 'Application submitted and queued for review.',
      },
    ],
  },
  {
    id: 'app_005',
    displayId: '#SELL-005',
    name: 'Hoang Thi E',
    email: 'hoangthie@email.com',
    initials: 'HE',
    accent: '#8B5CF6',
    shopName: 'Beauty Glow',
    shopSlug: 'beauty-glow',
    category: 'beauty',
    categoryLabel: 'Beauty',
    categoryAccent: '#8B5CF6',
    submittedAt: 'Sep 19, 2025 09:18 AM',
    status: 'pending',
    business: {
      businessName: 'Beauty Glow',
      businessType: 'individual',
      businessTypeLabel: 'Individual',
      legalBusinessName: 'Hoang Thi E',
      identityNumber: '079091002222',
      businessEmail: 'hoangthie@email.com',
      phone: '+84 965 444 555',
      businessLicenseNumber: 'BL-HCM-2025-99001',
      taxId: '0319988776',
      legalRepresentativeName: 'Hoang Thi E',
      legalRepresentativeId: '079091002222',
      addressLine1: '15 Le Loi, District 1',
      cityLabel: 'Ho Chi Minh City',
      stateLabel: 'Ho Chi Minh',
      postalCode: '700000',
    },
    shop: {
      description: 'Skincare and cosmetics curated for tropical climates.',
      instagramUrl: 'https://instagram.com/beautyglow',
      expectedProducts: 'Skincare, makeup, haircare',
    },
    verification: {
      sellingModel: 'retail',
      sellingModelLabel: 'Regular retail',
      documents: baseDocs('app_005'),
    },
    agreements: {
      acceptTerms: true,
      acceptSellerAgreement: true,
      acceptPrivacy: true,
      agreedAt: 'Sep 19, 2025 09:12 AM',
    },
    activity: [
      {
        id: 'act_1',
        at: 'Sep 19, 2025 09:18 AM',
        actor: 'System',
        summary: 'Application submitted and queued for review.',
      },
    ],
  },
];

export const APPROVAL_PAGE_SIZE = 10;
export const APPROVAL_TOTAL_COUNT = 24;
export const APPROVAL_TOTAL_PAGES = 3;

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
] as const;

export function getSellerApplication(id: string | undefined): SellerApplication | undefined {
  if (!id) return undefined;
  return sellerApplications.find((app) => app.id === id);
}

export function filterApplications(
  applications: SellerApplication[],
  query: {
    q?: string;
    status?: ApprovalStatus | 'all';
    category?: string;
    sort?: 'newest' | 'oldest';
  },
): SellerApplication[] {
  const q = query.q?.trim().toLowerCase();
  let rows = applications.filter((app) => {
    if (query.status && query.status !== 'all' && app.status !== query.status) return false;
    if (query.category && query.category !== 'all' && app.category !== query.category) return false;
    if (!q) return true;
    return (
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.shopName.toLowerCase().includes(q) ||
      app.displayId.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q)
    );
  });

  rows = [...rows].sort((a, b) =>
    query.sort === 'oldest'
      ? a.submittedAt.localeCompare(b.submittedAt)
      : b.submittedAt.localeCompare(a.submittedAt),
  );

  return rows;
}
