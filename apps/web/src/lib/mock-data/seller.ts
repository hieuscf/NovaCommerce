import type {
  SellerDialCodeViewModel,
  SellerOptionViewModel,
  SellerSellingModelViewModel,
  SellerTermsSectionViewModel,
  SellerVerificationDocumentViewModel,
} from '@/lib/view-models/seller';

/**
 * Presentation fixtures for seller onboarding until the Seller module
 * has Gateway adapters. Do not treat these as domain enums.
 */
export const sellerBusinessTypes: readonly SellerOptionViewModel[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'sole_proprietor', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'Limited Liability Company' },
  { value: 'corporation', label: 'Corporation' },
];

export const sellerCities: readonly SellerOptionViewModel[] = [
  { value: 'hcmc', label: 'Ho Chi Minh City' },
  { value: 'hanoi', label: 'Hanoi' },
  { value: 'danang', label: 'Da Nang' },
  { value: 'haiphong', label: 'Hai Phong' },
  { value: 'cantho', label: 'Can Tho' },
];

export const sellerStates: readonly SellerOptionViewModel[] = [
  { value: 'HCM', label: 'Ho Chi Minh' },
  { value: 'HN', label: 'Hanoi' },
  { value: 'DN', label: 'Da Nang' },
  { value: 'HP', label: 'Hai Phong' },
  { value: 'CT', label: 'Can Tho' },
  { value: 'BD', label: 'Binh Duong' },
  { value: 'DNI', label: 'Dong Nai' },
];

export const sellerDialCodes: readonly SellerDialCodeViewModel[] = [
  { value: 'VN', label: 'Vietnam', dial: '+84' },
  { value: 'US', label: 'United States', dial: '+1' },
  { value: 'SG', label: 'Singapore', dial: '+65' },
];

export const sellerShopCategories: readonly SellerOptionViewModel[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

export const sellerSellingModels: readonly SellerSellingModelViewModel[] = [
  {
    value: 'retail',
    label: 'Regular retail',
    description: 'Sell directly to consumers (personal brands and small shops).',
  },
  {
    value: 'official',
    label: 'Official Store / Mall',
    description: 'Authorized brand distributor, importer, or authorized dealer.',
  },
  {
    value: 'manufacturer',
    label: 'Manufacturer',
    description: 'Factory, workshop, or products sold under your own brand.',
  },
];

export const sellerVerificationDocuments: readonly SellerVerificationDocumentViewModel[] = [
  {
    field: 'authorizationLetter',
    title: 'Brand distribution authorization',
    description: 'Required for Official Store / Mall and authorized distributors.',
    icon: 'authorization',
  },
  {
    field: 'qualityCertificate',
    title: 'Product quality / food safety certificate',
    description: 'Applies to cosmetics, supplements, and similar regulated goods.',
    icon: 'quality',
  },
  {
    field: 'originInvoice',
    title: 'Import invoice / origin document',
    description: 'Proof of product origin and how goods entered your catalog.',
    icon: 'origin',
  },
];

export const sellerTermsSections: readonly SellerTermsSectionViewModel[] = [
  {
    number: '1',
    title: 'General Terms',
    clauses: [
      {
        id: '1.1',
        label: 'Acceptance of terms',
        text: 'By registering a Seller account, you confirm that you have read, understood, and agree to comply with these rules and all related Marketplace policies.',
      },
      {
        id: '1.2',
        label: 'Right to amend',
        text: 'The Marketplace may update or revise these terms at any time. Changes take effect as soon as they are published on the platform.',
      },
    ],
  },
  {
    number: '2',
    title: 'Registration & Account',
    clauses: [
      {
        id: '2.1',
        label: 'Eligibility',
        bullets: [
          'Individuals aged 18 or older with full legal capacity.',
          'Household businesses or enterprises legally established under applicable law.',
        ],
      },
      {
        id: '2.2',
        label: 'Information verification',
        text: 'Sellers must provide complete and accurate details: national ID/passport, business registration certificate, tax ID, and a bank account in the seller’s own name.',
      },
      {
        id: '2.3',
        label: 'Account security',
        text: 'Sellers are responsible for keeping login credentials confidential and for all activity under their account.',
      },
    ],
  },
  {
    number: '3',
    title: 'Listing & Product Management',
    clauses: [
      {
        id: '3.1',
        label: 'Lawful products',
        text: 'Sellers may only list products that are not prohibited by law or Marketplace policy.',
      },
      {
        id: '3.2',
        label: 'Accurate information',
        text: 'Images, prices, descriptions, origin, expiry dates, and stock levels must be transparent and must not mislead customers.',
      },
      {
        id: '3.3',
        label: 'Licenses & intellectual property',
        text: 'Sellers must hold ownership or lawful authorization for the brands, images, and trademarks they publish, and must have circulation licenses (cosmetics, food, medical, and similar) when required.',
      },
    ],
  },
  {
    number: '4',
    title: 'Order Handling & Shipping',
    clauses: [
      {
        id: '4.1',
        label: 'Confirmation & packing',
        text: 'Sellers must confirm orders, pack them to the required standard, and hand them to the carrier within the stated deadline.',
      },
      {
        id: '4.2',
        label: 'Cancellations & stock',
        text: 'Canceling orders because of stockouts or incorrect prices may result in performance penalties or a temporary account lock.',
      },
    ],
  },
  {
    number: '5',
    title: 'Service Fees & Payments',
    clauses: [
      {
        id: '5.1',
        label: 'Fee schedule',
        text: 'Sellers agree to pay the applicable fees (marketplace fee, payment fee, fixed fee, and marketing/fulfillment fees if any).',
      },
      {
        id: '5.2',
        label: 'Settlement cycle',
        text: 'Revenue (after fees and the value of returned or refunded orders) is paid to the registered bank account on the Marketplace settlement cycle.',
      },
    ],
  },
  {
    number: '6',
    title: 'Returns, Refunds & Warranty',
    clauses: [
      {
        id: '6.1',
        label: 'Return/exchange policy',
        text: 'Sellers must follow the Marketplace’s customer return and refund policy.',
      },
      {
        id: '6.2',
        label: 'Warranty responsibility',
        text: 'Sellers must handle warranty claims, defects, or damage according to the commitments published on the listing.',
      },
    ],
  },
  {
    number: '7',
    title: 'Data Privacy & Tax Obligations',
    clauses: [
      {
        id: '7.1',
        label: 'Customer data privacy',
        text: 'Sellers may not store, share, or use customer personal information for any purpose other than fulfilling the order.',
      },
      {
        id: '7.2',
        label: 'Tax obligations',
        text: 'Sellers are responsible for declaring and paying taxes and fees arising from their business as required by state authorities.',
      },
    ],
  },
  {
    number: '8',
    title: 'Violations & Enforcement',
    clauses: [
      {
        id: '8.1',
        label: 'Prohibited conduct',
        text: 'Selling counterfeit or fake goods, review fraud (fake orders or reviews), taking customers off-platform, and coupon fraud.',
      },
      {
        id: '8.2',
        label: 'Enforcement',
        text: 'Depending on severity, the Marketplace may:',
        bullets: [
          'Hide or remove products.',
          'Temporarily suspend or permanently close the Seller account.',
          'Deduct escrow or revenue to compensate for damages.',
        ],
      },
    ],
  },
  {
    number: '9',
    title: 'Limitation of Liability & Dispute Resolution',
    clauses: [
      {
        id: '9.1',
        label: 'Disclaimer',
        text: 'The Marketplace is an intermediary platform and is not directly legally responsible for product quality or copyright disputes caused by the Seller.',
      },
      {
        id: '9.2',
        label: 'Dispute resolution',
        text: 'Disputes will first be resolved through negotiation. If no agreement is reached, the dispute will be submitted to a court of competent jurisdiction.',
      },
    ],
  },
];
