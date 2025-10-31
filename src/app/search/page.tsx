import { getArticles } from '@/lib/microcms';
import { ArticleCard } from '@/components/ArticleCard';
import { Metadata } from 'next';
import Link from 'next/link';

// Propsの型定義
type Props = {
  searchParams: {
    q?: string;
  };
};

// 検索結果ページのメタデータを動的に生成
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // ★ 修正: searchParamsをawaitで解決
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  return {
    title: `「${query}」の検索結果 - DXの羅針盤`,
    description: `「${query}」に関する記事の検索結果一覧です。`,
  };
}

// 検索結果ページコンポーネント
export default async function SearchPage({ searchParams }: Props) {
  // ★ 修正: searchParamsをawaitで解決
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q;

  // qパラメータがない場合はトップページへのリンクを表示
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>検索キーワードが入力されていません。</p>
        <Link href="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          トップページに戻る
        </Link>
      </div>
    );
  }

  // microCMSの全文検索機能(q)を使って記事を取得
  const posts = await getArticles({ q: query });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 border-b-2 pb-2">
        「<span className="text-indigo-600">{query}</span>」の検索結果
      </h1>

      {/* 検索結果の件数表示 */}
      <p className="mb-8 text-gray-600">{posts.contents.length}件の記事が見つかりました。</p>

      {/* 検索結果が0件の場合の表示 */}
      {posts.contents.length === 0 ? (
        <div className="text-center py-16">
          <p>お探しの記事は見つかりませんでした。</p>
          <p className="text-sm text-gray-500 mt-2">別のキーワードでお試しください。</p>
        </div>
      ) : (
        // 検索結果がある場合の表示
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {posts.contents.map((post) => (
            <ArticleCard key={post.id} article={post} />
          ))}
        </div>
      )}
    </div>
  );
}