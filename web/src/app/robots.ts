import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thesis.academyhub.com.ng';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tool/',
          '/pricing',
          '/developers',
          '/support',
          '/contact',
          '/privacy',
          '/terms',
          '/icon.png',
          '/favicon.ico',
          '/assets/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard',
          '/auth/',
          '/settings',
          '/projects',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
