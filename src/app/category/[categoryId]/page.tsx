import { Metadata } from 'next';
import { getPostsByCategory, getCategoryDetail } from '@/lib/microcms';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    categoryId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryDetail(resolvedParams.categoryId).catch(() => null);

  if (!category) {
    return {
      title: 'カテゴリが見つかりません',
    };
  }

  return {
    title: `${category.name} の記事一覧 - DXの羅針盤`,
    description: `${category.name} に関する記事の一覧です。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  
  // ★ 修正: サイドバーが不要になったため、getCategoriesは削除
  const [category, posts] = await Promise.all([
    getCategoryDetail(resolvedParams.categoryId).catch(() => null),
    getPostsByCategory(resolvedParams.categoryId).catch(() => null),
  ]);

  if (!category || !posts) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
    { name: category.name, href: `/category/${category.id}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ★ 修正: サイドバー用のグリッドレイアウトを削除し、シンプルな構成に */}
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        {/* ★ 修正: 「カテゴリー:」のテキストを削除 */}
        <h1 className="text-3xl font-bold mb-8 border-b-2 pb-2">{category.name}</h1>
        
        {/* ★ 修正: モバイルサイドバーの呼び出しを削除 */}

        {/* ★ 修正: あなたが最適化したグリッドレイアウトを適用 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {posts.contents.map((post) => (
            <ArticleCard key={post.id} article={post} />
          ))}
        </div>
      </div>
    </div>
  );
}