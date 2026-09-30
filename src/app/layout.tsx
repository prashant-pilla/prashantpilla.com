import type { Metadata, Viewport } from 'next';
import { fontClassNames } from './fonts';
import { Grain } from '@/components/experience/Grain';
import { profile } from '@content/profile';
import { DEFAULT_THEME, LIGHT_DEFAULT_THEME, THEME_SWATCHES } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';
import { graph, personJsonLd, researchJsonLd, websiteJsonLd } from '@/lib/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/app/providers';
import './globals.css';

const SITE_TITLE = `${profile.name} — ${profile.role}`;
const SITE_DESCRIPTION = `${profile.role} in ${profile.location.city} building ${profile.tagline}. ${profile.bio}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${profile.name}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: profile.name,
  authors: [{ name: profile.fullName, url: SITE_URL }],
  creator: profile.fullName,
  keywords: [
    profile.name,
    profile.fullName,
    profile.role,
    'AI Engineer',
    profile.tagline,
    'LLM agents',
    'fintech',
    profile.location.city,
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: profile.name,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: profile.socials.find((s) => s.platform === 'x')?.handle,
  },
  robots: { index: true, follow: true },
  // verification.google and verification.other['msvalidate.01'] land once
  // Search Console / Bing Webmaster codes exist.
};

/* Browser chrome colour per device scheme before hydration (matches the
 * bootstrap script's defaults); the theme engine (`syncThemeColorMeta`)
 * rewrites these tags as the visitor switches. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_SWATCHES[LIGHT_DEFAULT_THEME].bg },
    { media: '(prefers-color-scheme: dark)', color: THEME_SWATCHES[DEFAULT_THEME].bg },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} className={fontClassNames} suppressHydrationWarning>
      <body className="bg-bg font-sans text-fg antialiased">
        <JsonLd data={graph([personJsonLd(), websiteJsonLd(), ...researchJsonLd()])} />
        <Providers>
          <Grain />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
