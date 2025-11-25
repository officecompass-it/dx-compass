import { Metadata } from 'next';
// getPostsByCategory は現状使われていないため、getArticlesのみインポート
import { getCategories, getArticles } from '@/lib/microcms';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import type { Category, Article } from '@/lib/microcms';

type Props = {
  params: {
    categoryId: string;
  };
};

// このヘルパー関数は変更なし
const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  const data = await getCategories({ filters: `slug[equals]${slug}`, limit: 1, depth: 2 });
  return data.contents[0];
};

// generateMetadata は変更なし
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.categoryId);

  if (!category) {
    return { title: 'カテゴリが見つかりません' };
  }

  return {
    title: `${category.name} の記事一覧 - DXの羅針盤`,
    description: `${category.name} に関する記事の一覧です。`,
  };
}


// ★★★ ここから下の CategoryPage コンポーネントを修正 ★★★
export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.categoryId;

  // 1. カテゴリー情報の取得 (これは必須)
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }
  
  let posts: Article[] = [];
  
  // 親カテゴリーの場合の処理
  if (!category.parent) {
    // 2. 子カテゴリーの一覧を取得
    const children = await getCategories({ 
      filters: `parent[equals]${category.id}`,
      limit: 100,
      fields: 'id', // 子カテゴリーの記事を取得するだけならIDのみで十分
    });

    // 3. 親IDと全ての子IDを結合したIDリストを作成
    const categoryIds = [
      category.id, 
      ...children.contents.map(c => c.id)
    ];
    
    // 4. 結合したIDリストでORフィルターを作成し、記事取得リクエストを1回にまとめる
    const filters = categoryIds.map(id => `category[equals]${id}`).join('[or]');
    const postsData = await getArticles({ 
      limit: 100,
      filters: filters,
      fields: 'id,title,slug,description,eyecatch,category,publishedAt,updatedAt' // 既存のfields指定を維持
    });
    posts = postsData.contents;

  } else {
    // 子カテゴリーの場合は、これまで通り該当カテゴリーの記事を取得するだけ
    const postsData = await getArticles({
      limit: 100,
      filters: `category[equals]${category.id}`,
      fields: 'id,title,slug,description,eyecatch,category,publishedAt,updatedAt'
    });
    posts = postsData.contents;
  }

  // パンくずリストの生成ロジック (変更なし)
  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
    ...(category.parent ? [{ name: category.parent.name, href: `/category/${category.parent.slug}` }] : []),
    { name: category.name, href: `/category/${category.slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8 border-b-2 pb-2">{category.name}</h1>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {posts.map((post, index) => (
              <ArticleCard 
                key={post.id} 
                article={post} 
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <p>このカテゴリーの記事はまだありません。</p>
        )}
      </div>
    </div>
  );
}