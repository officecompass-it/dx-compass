import { getArticleDetail, getArticles, getProfile } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { formatDate } from '@/utils/formatDate';
import type { Article } from '@/lib/microcms';

// サイトURLを安全に構築するヘルパー関数
const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://` + process.env.VERCEL_URL : 'http://localhost:3000');
};

type Props = {
  params: { id: string };
};

type ArticleWithNoIndex = Article & {
  noindex?: boolean;
};

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleDetail<ArticleWithNoIndex>(resolvedParams.id).catch(() => null);

  if (!article) {
    return {};
  }

  const title = `${article.title} | DXの羅針盤`;
  const description = article.description || article.title;
  const ogImageUrl = article.eyecatch?.url || '/default-og-image.png';
  const siteUrl = getSiteUrl();

  const metadata: Metadata = {
    title: title,
    description: description,
    alternates: {
      canonical: new URL(`/posts/${article.id}`, siteUrl).toString(),
    },
    openGraph: {
      title: title,
      description: description,
      url: new URL(`/posts/${article.id}`, siteUrl).toString(),
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: article.title }],
    },
  };

  if (article.noindex === true) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

// 静的パス生成
export async function generateStaticParams() {
  const { contents } = await getArticles({ fields: ['id'] });
  return contents.map((article) => ({
    id: article.id,
  }));
}

// 記事詳細ページ本体
export default async function ArticleDetail({ params }: Props) {
  const resolvedParams = await params;
  const [article, profile] = await Promise.all([
    getArticleDetail(resolvedParams.id).catch(() => notFound()),
    getProfile().catch(() => null)
  ]);

  if (!article) {
    notFound();
  }
  
  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
  ];
  if (article.category) {
    // カテゴリのリンク先を slug に修正
    breadcrumbItems.push({ name: article.category.name, href: `/category/${article.category.slug}` });
  }
  breadcrumbItems.push({ name: article.title, href: `/posts/${article.id}` });

  // JSON-LD (構造化データ) の拡充
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

  return (
    // 外側のコンテナは、左右のpadding(px-4)と上下のpadding(py-8)のみを担当
    <div className="px-4 py-8">
      {/* 内側のコンテナが、最大幅(max-w-2xl)と中央揃え(mx-auto)を担当 */}
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article>
          <header className="mb-8">
            <h1 className="mb-4 text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 whitespace-pre-line">
              {article.title}
            </h1>
            <div className="text-sm text-gray-500">
              {article.publishedAt && (
                <time dateTime={article.publishedAt}>
                  公開日: {formatDate(article.publishedAt)}
                </time>
              )}
            </div>
          </header>

          {article.eyecatch && (
            <figure className="mb-8">
              <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg">
                <Image
                  src={article.eyecatch.url}
                  alt={article.title || '記事のアイキャッチ画像'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
              </div>
            </figure>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: article.body || '' }}
            className="prose max-w-none prose-indigo prose-lg"
          />
        </article>
      </div>
    </div>
  );
}