import SalaryGuide from '@/components/salary-guide';
import { getJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata;

export default function Page() {
  const jsonLd = getJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <SalaryGuide />
    </>
  );
}
