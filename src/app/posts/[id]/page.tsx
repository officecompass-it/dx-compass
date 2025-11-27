import { getArticleDetail, getArticles, getProfile } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProfileCard } from '@/components/ProfileCard';
import { formatDate } from '@/utils/formatDate';
import type { Article } from '@/lib/microcms';
import styles from './prose-styles.module.css';
import * as cheerio from 'cheerio';

// サイトURLヘルパー
const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://` + process.env.VERCEL_URL : 'http://localhost:3000');
};

type Props = {
  params: Promise<{ id: string }>;
};

type ArticleWithNoIndex = Article & {
  noindex?: boolean;
};

// メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleDetail<ArticleWithNoIndex>(resolvedParams.id).catch(() => null);

  if (!article) { return {}; }

  const title = `${article.title} | DXの羅針盤`;
  const description = article.description || article.title;
  const ogImageUrl = article.eyecatch?.url || '/default-og-image.png';
  const siteUrl = getSiteUrl();

  const metadata: Metadata = {
    title: title,
    description: description,
    alternates: { canonical: new URL(`/posts/${article.id}`, siteUrl).toString() },
    openGraph: {
      title: title,
      description: description,
      url: new URL(`/posts/${article.id}`, siteUrl).toString(),
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: article.title }],
    },
  };

  if (article.noindex === true) {
    metadata.robots = { index: false, follow: true };
  }
  return metadata;
}

// 静的パス生成
export async function generateStaticParams() {
  const { contents } = await getArticles({ fields: ['id'] });
  return contents.map((article) => ({ id: article.id }));
}

// 記事詳細ページ本体
export default async function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [article, profile] = await Promise.all([
    getArticleDetail(resolvedParams.id).catch(() => notFound()),
    getProfile().catch(() => null)
  ]);

  if (!article) { notFound(); }
  
  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
  ];
  if (article.category) {
    breadcrumbItems.push({ name: article.category.name, href: `/category/${article.category.slug}` });
  }
  breadcrumbItems.push({ name: article.title, href: `/posts/${article.id}` });

  // JSON-LD
  const siteUrl = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'image': article.eyecatch ? [article.eyecatch.url] : [],
    'datePublished': article.publishedAt,
    'dateModified': article.revisedAt,
    'author': profile ? [{
      '@type': 'Person',
      'name': profile.name,
      'url': new URL('/profile', siteUrl).toString(),
    }] : [],
    'publisher': {
      '@type': 'Organization',
      'name': 'DXの羅針盤',
      'logo': {
        '@type': 'ImageObject',
        'url': new URL('/logo.png', siteUrl).toString(),
      },
    },
    'description': article.description || article.title,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': new URL(`/posts/${article.id}`, siteUrl).toString(),
    },
  };

  const processHtmlBody = (html: string | undefined): string => {
    if (!html) { return ''; }
    const $ = cheerio.load(html);

    $('img').each((_, elem) => {
      const $img = $(elem);
      $img.attr('loading', 'lazy');
      $img.attr('decoding', 'async');
      if (!$img.attr('width')) { $img.attr('width', '1200'); }
      if (!$img.attr('height')) { $img.attr('height', '675'); }
    });

    $('table').each((_, tableEl) => {
      const $table = $(tableEl);
      $table.wrap('<div class="table-wrapper"></div>');
      $table.find('tr').each((_, rowEl) => {
        $(rowEl).find('th:first-child, td:first-child').addClass(styles.stickyColumn);
      });
    });
    
    return $.html();
  };

  const processedBody = processHtmlBody(article.body);

  return (
    // ページ全体のコンテナ
    // スマホ: px-4, PC: md:px-8
    <div className="container max-w-[1440px] mx-auto px-4 md:px-8 py-8 bg-gray-50/50">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start mt-6">
        
        {/* メインカラム */}
        <main className="min-w-0 w-full">
          {/* 
            ラッパー要素
            スマホ: w-full (横幅いっぱい)
            PC: md:w-fit md:mx-auto (中身に合わせて中央寄せ)
          */}
          <div className="w-full md:w-fit md:mx-auto">
            
            <div className="mb-4 w-full">
              <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* 記事ブロック (白い箱) */}
            {/* パディング: スマホ(p-5) / PC(md:p-[30px]) */}
            <article className="w-full bg-white border border-gray-100 rounded-xl p-5 md:p-[30px] shadow-sm">
              
              <header className="mb-8 border-b border-gray-100 pb-8 prose prose-indigo">
                {/* 
                  タイトル
                  break-words: 長い英単語の強制折り返し
                */}
                <h1 className="mb-4 text-2xl md:text-3xl font-extrabold leading-tight text-gray-900 whitespace-pre-line m-0 break-words">
                  {article.title}
                </h1>
                <div className="text-sm text-gray-500 not-prose mt-4">
                  {article.publishedAt && (
                    <time dateTime={article.publishedAt}>
                      公開日: {formatDate(article.publishedAt)}
                    </time>
                  )}
                </div>
              </header>

              {article.eyecatch && (
                <figure className="mb-8">
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={article.eyecatch.url}
                      alt={article.title || '記事のアイキャッチ画像'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 896px"
                      priority
                    />
                  </div>
                </figure>
              )}

              {/* 本文エリア */}
              <div
                dangerouslySetInnerHTML={{ __html: processedBody }}
                className={`prose prose-indigo ${styles.prose} relative`}
              />
            </article>
          </div>
        </main>

        {/* 
          サイドバー
          top-[132px]: ヘッダーの高さなどを考慮した初期位置
          h-fit: 高さを中身に合わせる（ズレ防止）
        */}
        <aside className="w-full lg:sticky lg:top-[132px] h-fit">
          {profile && <ProfileCard profile={profile} />}
        </aside>

      </div>
    </div>
  );
}