import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer'; // ★ 修正: 通常のインポートに戻す
import { getCategories } from '@/lib/microcms';
// import dynamic from 'next/dynamic'; // ← dynamicのインポートを削除

// ★ 修正: dynamic importの記述をすべて削除

const notoSansJp = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '700'] });
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
  const categories = await getCategories();
  const filteredCategories = categories.contents.filter(
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
      <body className={`${notoSansJp.className} flex flex-col min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header categories={filteredCategories} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}