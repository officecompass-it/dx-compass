import { getArticles, getCategories } from '@/lib/microcms';
import { ArticleCarousel } from '@/components/ArticleCarousel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DXの羅針盤 | AppSheetとWorkspace専門ブログ',
  description: 'AppSheetやGoogle Workspaceの最新技術情報、実践的な活用ノウハウを発信する専門技術ブログサイト「DXの羅針盤」。',
};

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getArticles({ orders: '-publishedAt' }),
    getCategories(),
  ]);

  const categoryOrder = ['AI', 'AppSheet', 'Looker Studio'];
  
  // ★ 修正: 最新記事の取得件数を5件に変更
  const latestPosts = posts.contents.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        {/* ★ LCP最適化: 最初の2枚の画像を優先読み込み */}
        <ArticleCarousel 
          title="最新記事" 
          articles={latestPosts}
          priorityIndices={[0, 1]}
        />
        
        {categoryOrder.map((categoryName) => {
          const category = categories.contents.find(c => c.name === categoryName);
          if (!category) return null;
          
          const postsInCategory = posts.contents.filter(post => post.category?.id === category.id);
          if (postsInCategory.length === 0) return null;
          
          return (
            <ArticleCarousel
              key={category.id}
              title={category.name}
              articles={postsInCategory.slice(0, 10)}
              viewMoreLink={`/category/${category.id}`}
            />
          );
        })}
      </div>
    </div>
  );
}