import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

// PostHog — same project as the CV app so the whole funnel (calculator →
// call / CV app) reads as one dashboard. Static export: the key is inlined
// at build time from NEXT_PUBLIC_POSTHOG_KEY; without it, nothing renders
// and the site behaves exactly as before. Loads PostHog's array.js directly
// (the documented no-snippet alternative) and inits on load; CTA clicks in
// page.tsx capture via window.posthog once it's up.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_ASSET_HOST = POSTHOG_HOST.replace(".i.posthog.com", "-assets.i.posthog.com");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        {children}
        {POSTHOG_KEY ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var s=document.createElement('script');s.src='${POSTHOG_ASSET_HOST}/static/array.js';s.async=true;s.onload=function(){if(window.posthog){window.posthog.init('${POSTHOG_KEY}',{api_host:'${POSTHOG_HOST}'});}};document.head.appendChild(s);})();`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
