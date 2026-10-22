import type { MetadataRoute } from 'next';

import { getIndexableUrls } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexableUrls().map((url) => ({ url }));
}
