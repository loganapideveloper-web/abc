import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amohamobiles.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/products',
    '/contact',
    '/services',
    '/privacy-policy',
    '/terms',
    '/return-policy',
    '/shipping-info',
  ];

  return staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : path === '/products' ? 0.9 : 0.7,
  }));
}
