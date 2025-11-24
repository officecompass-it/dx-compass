import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getHierarchicalCategories } from '@/lib/microcms';

// 修正点: variableを追加し、subsetsを明示
const notoSansJp = Noto_Sans_JP({ 
  weight: ['400', '700'],
  subsets: ['latin'], // 日本語フォントでもlatinを含めるのが一般的
  display: 'swap',
  variable: '--font-noto-sans-jp', // CSS変数名を定義
});

const getSiteUrl = () => {
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://dx-no-rashinban.com';
  } else if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  } else {
    return 'http://localhost:3000';
  }
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'DXの羅針盤',
    template: `%s | DXの羅針盤`,
  },
  description: '「DXの羅針盤」は、ノーコード、Googleツール、生成AIを活用したい非エンジニアのための、IT活用ノウハウブログです。AppSheetによるアプリ開発、Looker Studioでのデータ可視化、AIによる業務効率化など、プログラミング不要で実践できるノウハウを具体的に紹介します。',
  openGraph: {
    title: 'DXの羅針盤',
    description: '「DXの羅針盤」は、ノーコード、Googleツール、生成AIを活用したい非エンジニアのための、IT活用ノウハウブログです。AppSheetによるアプリ開発、Looker Studioでのデータ可視化、AIによる業務効率化など、プログラミング不要で実践できるノウハウを具体的に紹介します。',
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
    'url': siteUrl, 
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${siteUrl}/search?q={search_term_string}`, 
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    // 修正点: htmlタグに変数クラスを適用し、bodyにはTailwindのクラスを適用
    <html lang="ja" className={notoSansJp.variable}>
        <body className="font-sans antialiased flex flex-col min-h-screen">
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