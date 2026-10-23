import type { Metadata } from 'next';

import { getBundledSalaryData, getUniqueSources } from '@/lib/supabase';

export const SITE_URL = 'https://salary.superyachtsundayschool.app';
export const SITE_NAME = 'Yacht Crew Salary Guide 2026';
export const SITE_DESCRIPTION =
  'Compare yacht crew salaries by role and yacht size using published industry guides, with source-attributed benchmarks and a package estimator.';
export const ORGANIZATION_NAME = 'Superyacht Sunday School';
export const ORGANIZATION_URL = 'https://www.superyachtsundayschool.com/';

export const pageMetadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function getIndexableUrls(): string[] {
  return [SITE_URL];
}

export function getJsonLd() {
  const sources = getUniqueSources(getBundledSalaryData());

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#dataset` },
        breadcrumb: { '@id': `${SITE_URL}/#breadcrumb` },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: ORGANIZATION_NAME,
        url: ORGANIZATION_URL,
      },
      {
        '@type': 'Dataset',
        '@id': `${SITE_URL}/#dataset`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        creator: {
          '@type': 'Organization',
          name: ORGANIZATION_NAME,
          url: ORGANIZATION_URL,
        },
        isAccessibleForFree: true,
        inLanguage: 'en',
        isBasedOn: sources.map((name) => ({
          '@type': 'CreativeWork',
          name,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE_NAME,
            item: SITE_URL,
          },
        ],
      },
    ],
  };
}
