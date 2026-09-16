import { describe, expect, it } from 'vitest';
import { sellerRegisterSchema, toShopSlug } from '../seller-schemas';

const valid = {
  businessName: 'TechWorld',
  businessType: 'llc',
  legalBusinessName: 'TechWorld LLC',
  taxId: '0312345678',
  businessEmail: 'seller@example.com',
  phoneCountry: 'VN',
  phone: '912 345 678',
  addressLine1: '123 Tech Street',
  addressLine2: '',
  city: 'hcmc',
  state: 'HCM',
  postalCode: '700000',
  shopName: 'TechWorld Store',
  shopSlug: 'techworld-store',
  shopCategory: 'electronics',
  shopDescription: 'Laptops, accessories, and creator gear.',
  representativeName: 'Sarah Johnson',
  documentType: 'business_license',
  documentNumber: 'BL-1001',
};

describe('sellerRegisterSchema', () => {
  it('accepts a complete seller application', () => {
    expect(sellerRegisterSchema.parse(valid).businessName).toBe('TechWorld');
  });

  it('requires business identity and address fields', () => {
    const result = sellerRegisterSchema.safeParse({
      ...valid,
      businessName: '',
      businessEmail: 'not-an-email',
      phone: '12',
      city: '',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.businessName?.[0]).toMatch(/required/i);
    expect(result.error.flatten().fieldErrors.businessEmail?.[0]).toMatch(/valid email/i);
    expect(result.error.flatten().fieldErrors.phone?.[0]).toMatch(/valid phone/i);
    expect(result.error.flatten().fieldErrors.city?.[0]).toMatch(/required/i);
  });

  it('rejects an invalid shop slug', () => {
    const result = sellerRegisterSchema.safeParse({
      ...valid,
      shopSlug: 'Not Valid!',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.shopSlug?.[0]).toMatch(/lowercase/i);
  });
});

describe('toShopSlug', () => {
  it('normalizes a shop name into a URL slug', () => {
    expect(toShopSlug('Tech World Store')).toBe('tech-world-store');
  });
});
