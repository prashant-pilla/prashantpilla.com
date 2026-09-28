import type { Metadata } from 'next';
import { fontClassNames } from './fonts';
import { Grain } from '@/components/experience/Grain';
import { profile } from '@content/profile';
import { DEFAULT_THEME } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.bio,
  metadataBase: new URL('https://prashantpilla.com'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} className={fontClassNames}>
      <body className="bg-bg font-sans text-fg antialiased">
        <Grain />
        <main>{children}</main>
      </body>
    </html>
  );
}
