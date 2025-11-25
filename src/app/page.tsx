// 修正: LIST_FIELDS をインポート
import { getArticles, getHierarchicalCategories, LIST_FIELDS } from '@/lib/microcms';
import { ArticleCarousel } from '@/components/ArticleCarousel';
import { Metadata } from 'next';
import type { Article } from '@/lib/microcms';

export const metadata: Metadata = {
  title: 'DXの羅針盤 | AppSheetとWorkspace専門ブログ',
  description: 'AppSheetやGoogle Workspaceの最新技術情報、実践的な活用ノウハウを発信する専門技術ブログサイト「DXの羅針盤」。',
};

export default async function HomePage() {
  // 親子関係を持つカテゴリーと、全記事を取得
  const [hierarchicalCategories, allPosts] = await Promise.all([
    getHierarchicalCategories(),
    // 修正: fieldsを指定してデータ量を削減
    getArticles({ 
      orders: '-publishedAt', 
      limit: 100,
      fields: LIST_FIELDS 
    }), 
  ]);

  const latestPosts = allPosts.contents.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <ArticleCarousel 
        title="最新記事" 
        articles={latestPosts} 
        priorityIndices={[0]} />
        
        {/* 親カテゴリーでループ */}
        {hierarchicalCategories.map((parentCategory) => {
          // 親カテゴリーに属する子カテゴリーのIDリストを作成
          const childCategoryIds = parentCategory.children.map(child => child.id);
          
          // 記事のカテゴリーIDが子カテゴリーIDリストに含まれるものをフィルタリング
          const postsInParentCategory = allPosts.contents.filter(post => 
            post.category && childCategoryIds.includes(post.category.id)
          );

          // 該当する記事がなければセクションを表示しない
          if (postsInParentCategory.length === 0) return null;
          
          return (
            <ArticleCarousel
              key={parentCategory.id}
              title={parentCategory.name}
              articles={postsInParentCategory.slice(0, 10)}
              viewMoreLink={`/category/${parentCategory.slug}`}
            />
          );
        })}
      </div>
    </div>
  );
}