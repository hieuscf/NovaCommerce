import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const locales = ['vi', 'en'];

  return locales.map((locale) => ({
    url: `${appUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  }));
}
