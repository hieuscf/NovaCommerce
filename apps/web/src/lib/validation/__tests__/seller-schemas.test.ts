import { describe, expect, it } from 'vitest';
import {
  SHOP_BANNER_MAX_BYTES,
  SHOP_LOGO_MAX_BYTES,
  sellerRegisterSchema,
  toShopSlug,
} from '../seller-schemas';

function pngFile(name = 'logo.png', size = 12) {
  const file = new File([new Uint8Array(size)], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

const valid = {
  businessName: 'TechWorld',
  businessType: 'llc',
  legalBusinessName: 'TechWorld LLC',
  identityNumber: '079123456789',
  businessLicenseNumber: '0312345678',
  taxId: '0312345678',
  legalRepresentativeName: 'Sarah Johnson',
  legalRepresentativeId: '079123456789',
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
  shopLogo: pngFile(),
  shopBanner: null,
  facebookUrl: '',
  instagramUrl: '',
  websiteUrl: '',
  sellingModel: 'retail',
  authorizationLetter: null,
  qualityCertificate: null,
  originInvoice: null,
  acceptTerms: true,
  acceptSellerAgreement: true,
  acceptPrivacy: true,
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

  it('requires identity and legal representative numbers', () => {
    const result = sellerRegisterSchema.safeParse({
      ...valid,
      identityNumber: '123',
      legalRepresentativeId: '',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.identityNumber?.[0]).toMatch(/valid/i);
    expect(result.error.flatten().fieldErrors.legalRepresentativeId?.[0]).toMatch(/required/i);
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

  it('requires a PNG or JPG shop logo under 2MB', () => {
    const missing = sellerRegisterSchema.safeParse({
      ...valid,
      shopLogo: null,
    });
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.flatten().fieldErrors.shopLogo?.[0]).toMatch(/required/i);
    }

    const tooLarge = sellerRegisterSchema.safeParse({
      ...valid,
      shopLogo: pngFile('logo.png', SHOP_LOGO_MAX_BYTES + 1),
    });
    expect(tooLarge.success).toBe(false);
    if (!tooLarge.success) {
      expect(tooLarge.error.flatten().fieldErrors.shopLogo?.[0]).toMatch(/2mb/i);
    }
  });

  it('rejects a shop banner over 5MB', () => {
    const result = sellerRegisterSchema.safeParse({
      ...valid,
      shopBanner: pngFile('banner.png', SHOP_BANNER_MAX_BYTES + 1),
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.shopBanner?.[0]).toMatch(/5mb/i);
  });

  it('accepts optional social URLs and rejects invalid ones', () => {
    expect(
      sellerRegisterSchema.parse({
        ...valid,
        facebookUrl: 'https://facebook.com/techworld',
        instagramUrl: 'https://instagram.com/techworld',
        websiteUrl: 'https://techworld.example',
      }).facebookUrl,
    ).toBe('https://facebook.com/techworld');

    const result = sellerRegisterSchema.safeParse({
      ...valid,
      websiteUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.websiteUrl?.[0]).toMatch(/valid website url/i);
  });

  it('requires a selling model and accepted terms', () => {
    const missingModel = sellerRegisterSchema.safeParse({
      ...valid,
      sellingModel: '',
    });
    expect(missingModel.success).toBe(false);
    if (!missingModel.success) {
      expect(missingModel.error.flatten().fieldErrors.sellingModel?.[0]).toMatch(/required/i);
    }

    const missingTerms = sellerRegisterSchema.safeParse({
      ...valid,
      acceptTerms: false,
    });
    expect(missingTerms.success).toBe(false);
    if (!missingTerms.success) {
      expect(missingTerms.error.flatten().fieldErrors.acceptTerms?.[0]).toMatch(/terms of service/i);
    }
  });
});

describe('toShopSlug', () => {
  it('normalizes a shop name into a URL slug', () => {
    expect(toShopSlug('Tech World Store')).toBe('tech-world-store');
  });
});
