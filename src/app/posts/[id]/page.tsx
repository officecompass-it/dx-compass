import { getArticleDetail, getArticles, getProfile } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { formatDate } from '@/utils/formatDate';
import type { Article } from '@/lib/microcms';
import styles from './prose-styles.module.css';
import * as cheerio from 'cheerio'; // 修正: cheerioのインポート

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

// メタデータ生成 (変更なし)
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

// 静的パス生成 (変更なし - これによりCheerioの負荷はビルド時のみになります)
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
    breadcrumbItems.push({ name: article.category.name, href: `/category/${article.category.slug}` });
  }
  breadcrumbItems.push({ name: article.title, href: `/posts/${article.id}` });

  // JSON-LD (変更なし)
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

  // ★修正: HTML加工処理を追加 (CLS対策の核心)
  const processHtmlBody = (html: string | undefined): string => {
    if (!html) {
      return '';
    }
    const $ = cheerio.load(html);

    // 1. 画像(CLS)対策: width/heightを強制付与
    $('img').each((_, elem) => {
      const $img = $(elem);
      
      // 遅延読み込みと非同期デコードを付与
      $img.attr('loading', 'lazy');
      $img.attr('decoding', 'async');

      // 属性がない場合にデフォルト値を設定 (Tailwind Typographyで見た目は調整される)
      if (!$img.attr('width')) {
        $img.attr('width', '1200');
      }
      if (!$img.attr('height')) {
        $img.attr('height', '675'); // 16:9
      }
    });

    // 2. テーブル対策 (以前のreplaceロジックをCheerioで書き換え)
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
    <div className="px-4 py-8">
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
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
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
            dangerouslySetInnerHTML={{ __html: processedBody }}
            className={`prose max-w-none prose-indigo prose-lg ${styles.prose} relative`}
          />
        </article>
      </div>
    </div>
  );
}