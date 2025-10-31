import { getArticleDetail, getArticles, getProfile } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { formatDate } from '@/utils/formatDate';
import type { Article } from '@/lib/microcms';

type Props = {
  params: { id: string };
};

// Articleの型定義にnoindexを追加
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

  const metadata: Metadata = {
    title: title,
    description: description,
    alternates: {
      canonical: `/posts/${article.id}`,
    },
    openGraph: {
      title: title,
      description: description,
      url: `/posts/${article.id}`,
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: article.title }],
    },
  };

  // noindexがtrueの場合、robotsメタタグを追加
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
    breadcrumbItems.push({ name: article.category.name, href: `/category/${article.category.id}` });
  }
  breadcrumbItems.push({ name: article.title, href: `/posts/${article.id}` });

  // JSON-LD (構造化データ) の拡充
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
      'url': new URL('/profile', process.env.NEXT_PUBLIC_SITE_URL).toString(),
    }] : [],
    'publisher': {
      '@type': 'Organization',
      'name': 'DXの羅針盤',
      'logo': {
        '@type': 'ImageObject',
        'url': new URL('/logo.png', process.env.NEXT_PUBLIC_SITE_URL).toString(),
      },
    },
    'description': article.description || article.title,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': new URL(`/posts/${article.id}`, process.env.NEXT_PUBLIC_SITE_URL).toString(),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
                  sizes="(max-width: 672px) 100vw, 672px"
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