import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getHierarchicalCategories } from '@/lib/microcms';


const notoSansJp = localFont({
  src: [
    {
      path: './fonts/noto-sans-jp-v55-japanese_latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/noto-sans-jp-v55-japanese_latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});


  const siteUrl = process.env.VERCEL_URL ? `https://` + process.env.VERCEL_URL : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'DXの羅針盤',
    template: `%s | DXの羅針盤`,
  },
  description: 'AppSheetやGoogle Workspaceの最新技術情報、実践的な活用ノウハウを発信する専門技術ブログサイト。',
  openGraph: {
    title: 'DXの羅針盤',
    description: 'AppSheetやGoogle Workspaceの最新技術情報、実践的な活用ノウハウを発信する専門技術ブログサイト。',
    images: '/default-og-image.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const hierarchicalCategories = await getHierarchicalCategories();
  const filteredHierarchicalCategories = hierarchicalCategories.filter(
    (category) => category.name !== '最新情報'
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'DXの羅針盤',
    'url': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ja">
      <body className={`${notoSansJp.variable} flex flex-col min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header categories={filteredHierarchicalCategories} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}