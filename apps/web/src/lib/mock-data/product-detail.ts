import type {
  ProductFeatureViewModel,
  ProductImageViewModel,
  ProductRatingDistribution,
  ProductReviewViewModel,
  ProductSpecViewModel,
  ProductVariantGroupViewModel,
} from '@/lib/view-models/product-detail';

/**
 * Presentation extras for the product detail page.
 * Listing cards stay in `catalog.ts`; this file only adds PDP copy, gallery, and reviews.
 */
export interface ProductDetailExtras {
  readonly shortDescription: string;
  readonly description: string;
  readonly images: readonly ProductImageViewModel[];
  readonly variants?: readonly ProductVariantGroupViewModel[];
  readonly specifications: readonly ProductSpecViewModel[];
  readonly features: readonly ProductFeatureViewModel[];
  readonly reviews: readonly ProductReviewViewModel[];
  readonly ratingDistribution: ProductRatingDistribution;
}

const IPHONE_IMAGES: readonly ProductImageViewModel[] = [
  {
    id: 'iphone-17-front',
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=1200&fit=crop',
    alt: 'iPhone 17 Pro — front view',
  },
  {
    id: 'iphone-17-angle',
    url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&h=1200&fit=crop',
    alt: 'iPhone 17 Pro — three-quarter view',
  },
  {
    id: 'iphone-17-camera',
    url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=1200&fit=crop',
    alt: 'iPhone 17 Pro — camera system',
  },
  {
    id: 'iphone-17-side',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=1200&fit=crop',
    alt: 'iPhone 17 Pro — side profile',
  },
  {
    id: 'iphone-17-life',
    url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&h=1200&fit=crop',
    alt: 'iPhone 17 Pro — in hand',
  },
];

export const productDetailExtras: Record<string, ProductDetailExtras> = {
  'iphone-17-pro': {
    shortDescription:
      'Experience powerful performance, advanced photography, and an elegant design built for everyday use.',
    description:
      'iPhone 17 Pro brings a refined titanium design, a faster chip for everyday multitasking, and a camera system built for low light and detail. ProMotion keeps scrolling and games smooth, while a long-lasting battery covers a full day of work, photos, and travel.\n\nThe display stays bright outdoors, and the cameras capture consistent color whether you are shooting portraits, video, or documents. Storage options start at 128GB so you can match the device to how you shoot and store media.\n\nThis page is a storefront presentation of the product. Availability, pricing, and fulfillment stay with Catalog, Inventory, and Cart APIs when those contracts are wired.',
    images: IPHONE_IMAGES,
    variants: [
      {
        id: 'color',
        name: 'Color',
        type: 'swatch',
        options: [
          {
            id: 'natural',
            label: 'Natural Titanium',
            value: 'natural',
            available: true,
            swatch: '#8B8378',
            imageId: 'iphone-17-front',
          },
          {
            id: 'black',
            label: 'Black',
            value: 'black',
            available: true,
            swatch: '#1C1917',
            imageId: 'iphone-17-angle',
          },
          {
            id: 'white',
            label: 'White',
            value: 'white',
            available: true,
            swatch: '#F4F1EA',
            imageId: 'iphone-17-side',
          },
          {
            id: 'blue',
            label: 'Blue',
            value: 'blue',
            available: false,
            swatch: '#3B6FA0',
            imageId: 'iphone-17-life',
          },
        ],
      },
      {
        id: 'storage',
        name: 'Storage',
        type: 'button',
        options: [
          { id: '128', label: '128GB', value: '128gb', available: true },
          { id: '256', label: '256GB', value: '256gb', available: true },
          { id: '512', label: '512GB', value: '512gb', available: true },
          { id: '1tb', label: '1TB', value: '1tb', available: false },
        ],
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Apple' },
      { name: 'Model', value: 'iPhone 17 Pro' },
      { name: 'Display', value: '6.3 inch Super Retina XDR' },
      { name: 'Storage', value: '256GB (as shown)' },
      { name: 'Connectivity', value: '5G' },
      { name: 'Operating System', value: 'iOS' },
      { name: 'Camera', value: 'Pro triple camera system' },
      { name: 'Weight', value: '199 g' },
    ],
    features: [
      {
        title: 'Pro camera system',
        description: 'Capture sharp stills and video in mixed light, with consistent color and detail.',
      },
      {
        title: 'All-day battery',
        description: 'Designed to cover a full day of calls, maps, photos, and streaming.',
      },
      {
        title: 'Titanium build',
        description: 'A light, durable frame with a clean finish that stays comfortable in hand.',
      },
      {
        title: 'Studio-quality display',
        description: 'A bright, high-refresh panel that stays readable outdoors.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'John D.',
        rating: 5,
        title: 'Great product',
        content:
          'Product works exactly as expected. The display is bright, the cameras are consistent, and it feels solid without being heavy.',
        dateLabel: '2 days ago',
        verified: true,
        helpfulCount: 18,
      },
      {
        id: 'r2',
        author: 'Maya K.',
        rating: 5,
        title: 'Battery finally lasts',
        content:
          'I used to charge twice a day. This one gets me through work and a commute with power left over.',
        dateLabel: '1 week ago',
        verified: true,
        helpfulCount: 11,
      },
      {
        id: 'r3',
        author: 'Luis R.',
        rating: 4,
        title: 'Excellent camera, familiar software',
        content:
          'Photos in low light are a clear step up. I wish the 1TB option was available, but 256GB is enough for now.',
        dateLabel: '2 weeks ago',
        verified: true,
        helpfulCount: 7,
      },
      {
        id: 'r4',
        author: 'Priya S.',
        rating: 4,
        title: 'Premium and quiet',
        content: 'Feels like a flagship without shouting about it. Shipping was fast and packaging was clean.',
        dateLabel: '3 weeks ago',
        helpfulCount: 4,
      },
    ],
    ratingDistribution: { 5: 98, 4: 18, 3: 5, 2: 2, 1: 1 },
  },
  'pixel-9-pro': {
    shortDescription:
      'A refined Google flagship with computational photography and a clean software experience.',
    description:
      'Pixel 9 Pro focuses on photography, translation, and a calm Android experience. The cameras handle night scenes and portraits with little extra work, and software updates keep the phone current.\n\nThe 6.3-inch display is sharp for reading and media. This listing shows a promotional price for storefront UI development; live promotions will come from Catalog when that API is connected.',
    images: [
      {
        id: 'pixel-front',
        url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff89?w=1200&h=1200&fit=crop',
        alt: 'Pixel 9 Pro — front view',
      },
      {
        id: 'pixel-angle',
        url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&h=1200&fit=crop',
        alt: 'Pixel 9 Pro — angled view',
      },
      {
        id: 'pixel-camera',
        url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=1200&fit=crop',
        alt: 'Pixel 9 Pro — camera bar',
      },
      {
        id: 'pixel-hand',
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=1200&fit=crop',
        alt: 'Pixel 9 Pro — in use',
      },
    ],
    variants: [
      {
        id: 'color',
        name: 'Color',
        type: 'swatch',
        options: [
          {
            id: 'hazel',
            label: 'Hazel',
            value: 'hazel',
            available: true,
            swatch: '#C4B59A',
            imageId: 'pixel-front',
          },
          {
            id: 'obsidian',
            label: 'Obsidian',
            value: 'obsidian',
            available: true,
            swatch: '#2A2A2A',
            imageId: 'pixel-angle',
          },
          {
            id: 'porcelain',
            label: 'Porcelain',
            value: 'porcelain',
            available: true,
            swatch: '#F3EEE6',
            imageId: 'pixel-hand',
          },
        ],
      },
      {
        id: 'storage',
        name: 'Storage',
        type: 'button',
        options: [
          { id: '128', label: '128GB', value: '128gb', available: true },
          { id: '256', label: '256GB', value: '256gb', available: true },
          { id: '512', label: '512GB', value: '512gb', available: false },
        ],
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Google' },
      { name: 'Model', value: 'Pixel 9 Pro' },
      { name: 'Display', value: '6.3 inch LTPO OLED' },
      { name: 'Storage', value: '256GB' },
      { name: 'Connectivity', value: '5G' },
      { name: 'Operating System', value: 'Android' },
    ],
    features: [
      {
        title: 'Computational photography',
        description: 'Night Sight and portraits that stay natural without extra editing.',
      },
      {
        title: 'Clean software',
        description: 'Timely updates and a focused Android experience.',
      },
      {
        title: 'On-device help',
        description: 'Call screening, translation, and photo tools that stay out of the way.',
      },
      {
        title: 'Compact flagship',
        description: 'A bright display in a size that is easy to use with one hand.',
      },
    ],
    reviews: [
      {
        id: 'pr1',
        author: 'Elena V.',
        rating: 5,
        title: 'Best camera in this size',
        content: 'Night photos are the reason I switched. The sale price made the decision easy.',
        dateLabel: '4 days ago',
        verified: true,
        helpfulCount: 9,
      },
      {
        id: 'pr2',
        author: 'Omar H.',
        rating: 4,
        title: 'Fast and calm',
        content: 'Software is clean. Battery is good, not spectacular. Happy with the promotional price.',
        dateLabel: '1 week ago',
        verified: true,
        helpfulCount: 3,
      },
    ],
    ratingDistribution: { 5: 410, 4: 160, 3: 45, 2: 16, 1: 9 },
  },
  'galaxy-book4-pro': {
    shortDescription: 'A thin Samsung notebook for travel, writing, and everyday creative work.',
    description:
      'Galaxy Book4 Pro pairs an OLED display with a quiet, light chassis. It is meant for writing, browsing, and light creative work on the move.\n\nThis product is currently unavailable in the storefront fixture so the out-of-stock purchase state can be reviewed. Inventory remains the source of truth when the Inventory API is connected.',
    images: [
      {
        id: 'book-open',
        url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=1200&fit=crop',
        alt: 'Galaxy Book4 Pro — open on a desk',
      },
      {
        id: 'book-keys',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=1200&fit=crop',
        alt: 'Galaxy Book4 Pro — keyboard',
      },
      {
        id: 'book-side',
        url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&h=1200&fit=crop',
        alt: 'Galaxy Book4 Pro — side ports',
      },
    ],
    variants: [
      {
        id: 'finish',
        name: 'Finish',
        type: 'swatch',
        options: [
          {
            id: 'graphite',
            label: 'Graphite',
            value: 'graphite',
            available: false,
            swatch: '#4B4F55',
            imageId: 'book-open',
          },
          {
            id: 'silver',
            label: 'Silver',
            value: 'silver',
            available: false,
            swatch: '#C9CDD3',
            imageId: 'book-side',
          },
        ],
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Samsung' },
      { name: 'Model', value: 'Galaxy Book4 Pro' },
      { name: 'Display', value: '14 inch AMOLED' },
      { name: 'Memory', value: '16GB' },
      { name: 'Storage', value: '512GB' },
      { name: 'Operating System', value: 'Windows' },
    ],
    features: [
      {
        title: 'OLED color',
        description: 'Deep contrast for photo editing, film, and long writing sessions.',
      },
      {
        title: 'Travel weight',
        description: 'A slim chassis that fits a day bag without extra bulk.',
      },
      {
        title: 'Quiet fans',
        description: 'Stays unobtrusive during calls and library work.',
      },
      {
        title: 'Phone pairing',
        description: 'Quick links to Galaxy phones for photos and notifications.',
      },
    ],
    reviews: [
      {
        id: 'gb1',
        author: 'Chris P.',
        rating: 5,
        title: 'Beautiful screen',
        content: 'The display is the highlight. Hoping it comes back in stock soon.',
        dateLabel: '1 month ago',
        verified: true,
        helpfulCount: 6,
      },
    ],
    ratingDistribution: { 5: 110, 4: 48, 3: 18, 2: 8, 1: 4 },
  },
  'nike-air-force-1': {
    shortDescription: 'A clean leather sneaker with a timeless court silhouette.',
    description:
      'Nike Air Force 1 keeps a simple leather upper, a visible Air unit, and a silhouette that works with almost anything in a closet.\n\nThis page demonstrates color variants for apparel-style products. Size and inventory rules will come from Catalog and Inventory when those APIs are wired.',
    images: [
      {
        id: 'af1-white',
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=1200&fit=crop',
        alt: 'Nike Air Force 1 — white pair',
      },
      {
        id: 'af1-side',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=1200&fit=crop',
        alt: 'Nike Air Force 1 — side profile',
      },
      {
        id: 'af1-detail',
        url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&h=1200&fit=crop',
        alt: 'Nike Air Force 1 — detail',
      },
      {
        id: 'af1-pair',
        url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&h=1200&fit=crop',
        alt: 'Nike Air Force 1 — on court',
      },
    ],
    variants: [
      {
        id: 'color',
        name: 'Color',
        type: 'swatch',
        options: [
          {
            id: 'white',
            label: 'White',
            value: 'white',
            available: true,
            swatch: '#F5F5F0',
            imageId: 'af1-white',
          },
          {
            id: 'black',
            label: 'Black',
            value: 'black',
            available: true,
            swatch: '#171717',
            imageId: 'af1-side',
          },
          {
            id: 'navy',
            label: 'Navy',
            value: 'navy',
            available: true,
            swatch: '#1E3A5F',
            imageId: 'af1-pair',
          },
        ],
      },
      {
        id: 'size',
        name: 'Size',
        type: 'button',
        options: [
          { id: '8', label: '8', value: '8', available: true },
          { id: '9', label: '9', value: '9', available: true },
          { id: '10', label: '10', value: '10', available: true },
          { id: '11', label: '11', value: '11', available: false },
          { id: '12', label: '12', value: '12', available: true },
        ],
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Nike' },
      { name: 'Model', value: 'Air Force 1' },
      { name: 'Upper', value: 'Leather' },
      { name: 'Category', value: "Men's Shoes" },
      { name: 'Color', value: 'White (as shown)' },
    ],
    features: [
      {
        title: 'Air cushioning',
        description: 'A visible Air unit that stays comfortable for all-day wear.',
      },
      {
        title: 'Leather upper',
        description: 'A clean finish that pairs with denim, tailoring, or travel clothes.',
      },
      {
        title: 'Cupsole grip',
        description: 'A familiar court sole with reliable traction.',
      },
      {
        title: 'Everyday silhouette',
        description: 'A shape that has stayed relevant without extra branding.',
      },
    ],
    reviews: [
      {
        id: 'af1r1',
        author: 'Noah B.',
        rating: 5,
        title: 'Still the one',
        content: 'Fits true to size and the leather cleaned up easily after a week of wear.',
        dateLabel: '5 days ago',
        verified: true,
        helpfulCount: 8,
      },
      {
        id: 'af1r2',
        author: 'Hana T.',
        rating: 4,
        title: 'Classic, slightly firm',
        content: 'Needed a day to break in. After that they were comfortable on a long walk.',
        dateLabel: '2 weeks ago',
        helpfulCount: 2,
      },
    ],
    ratingDistribution: { 5: 260, 4: 110, 3: 32, 2: 12, 1: 7 },
  },
  'sony-wh1000xm5': {
    shortDescription: 'Travel headphones with strong noise canceling and all-day comfort.',
    description:
      'Sony WH-1000XM5 is a wireless over-ear headphone for flights, offices, and commuting. Adaptive noise canceling, a light clamp, and a long battery life keep the focus on music and calls.\n\nThe promotional price on this page is presentation-only until Catalog promotions are connected.',
    images: [
      {
        id: 'xm5-hero',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=1200&fit=crop',
        alt: 'Sony WH-1000XM5 — hero',
      },
      {
        id: 'xm5-side',
        url: 'https://images.unsplash.com/photo-1484704849700-f032a5070ee6?w=1200&h=1200&fit=crop',
        alt: 'Sony WH-1000XM5 — side',
      },
      {
        id: 'xm5-fold',
        url: 'https://images.unsplash.com/photo-1546435770-a3e426bf8022?w=1200&h=1200&fit=crop',
        alt: 'Sony WH-1000XM5 — folded',
      },
    ],
    variants: [
      {
        id: 'color',
        name: 'Color',
        type: 'swatch',
        options: [
          {
            id: 'silver',
            label: 'Silver',
            value: 'silver',
            available: true,
            swatch: '#D7D7D2',
            imageId: 'xm5-hero',
          },
          {
            id: 'black',
            label: 'Black',
            value: 'black',
            available: true,
            swatch: '#1A1A1A',
            imageId: 'xm5-side',
          },
        ],
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Sony' },
      { name: 'Model', value: 'WH-1000XM5' },
      { name: 'Type', value: 'Wireless over-ear' },
      { name: 'Noise canceling', value: 'Adaptive ANC' },
      { name: 'Connectivity', value: 'Bluetooth' },
    ],
    features: [
      {
        title: 'Adaptive ANC',
        description: 'Quieter cabins, offices, and trains without a heavy clamp.',
      },
      {
        title: 'All-day battery',
        description: 'Long listening sessions between charges for travel days.',
      },
      {
        title: 'Clear calls',
        description: 'Beamforming mics that keep voices intelligible outdoors.',
      },
      {
        title: 'Light wear',
        description: 'Soft pads and a balanced headband for longer sessions.',
      },
    ],
    reviews: [
      {
        id: 'xm5r1',
        author: 'Ava L.',
        rating: 5,
        title: 'Flight essential',
        content: 'Cancels engine noise better than my previous pair. Comfortable for a 10-hour flight.',
        dateLabel: '3 days ago',
        verified: true,
        helpfulCount: 21,
      },
      {
        id: 'xm5r2',
        author: 'Kenji M.',
        rating: 4,
        title: 'Great sound, case is large',
        content: 'Audio is excellent. The case takes more bag space than I expected.',
        dateLabel: '2 weeks ago',
        verified: true,
        helpfulCount: 5,
      },
    ],
    ratingDistribution: { 5: 520, 4: 240, 3: 60, 2: 22, 1: 14 },
  },
  'silicone-phone-case': {
    shortDescription: 'A slim silicone case cut for iPhone 17 Pro.',
    description:
      'A close-fitting silicone case with a microfiber lining. This accessory is shown as out of stock so the PDP can demonstrate an unavailable accessory without hiding product information.',
    images: [
      {
        id: 'case-blue',
        url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&h=1200&fit=crop',
        alt: 'Silicone Phone Case — Storm Blue',
      },
      {
        id: 'case-angle',
        url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=1200&fit=crop',
        alt: 'Silicone Phone Case — angle',
      },
    ],
    variants: [
      {
        id: 'color',
        name: 'Color',
        type: 'swatch',
        options: [
          {
            id: 'storm',
            label: 'Storm Blue',
            value: 'storm-blue',
            available: false,
            swatch: '#3E5F8A',
            imageId: 'case-blue',
          },
        ],
      },
    ],
    specifications: [
      { name: 'Brand', value: 'Apple' },
      { name: 'Compatibility', value: 'iPhone 17 Pro' },
      { name: 'Material', value: 'Silicone' },
      { name: 'Color', value: 'Storm Blue' },
    ],
    features: [
      {
        title: 'Close fit',
        description: 'Follows the phone’s buttons and camera layout without extra bulk.',
      },
      {
        title: 'Soft lining',
        description: 'A microfiber interior that helps protect the finish.',
      },
      {
        title: 'Everyday grip',
        description: 'Silicone that is easy to hold without a slippery gloss.',
      },
      {
        title: 'Color match',
        description: 'A finish intended to sit quietly next to Natural Titanium and Black phones.',
      },
    ],
    reviews: [
      {
        id: 'case1',
        author: 'Ivy N.',
        rating: 4,
        title: 'Nice feel',
        content: 'Grip is good. Waiting for restock in Storm Blue.',
        dateLabel: '1 month ago',
        helpfulCount: 1,
      },
    ],
    ratingDistribution: { 5: 32, 4: 28, 3: 8, 2: 3, 1: 2 },
  },
};
