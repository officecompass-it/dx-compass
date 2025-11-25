import { getArticles } from '@/lib/microcms';
import { ArticleCard } from '@/components/ArticleCard';
import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  searchParams: {
    q?: string;
  };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  return {
    title: `「${query}」の検索結果 - DXの羅針盤`,
    description: `「${query}」に関する記事の検索結果一覧です。`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q;

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

  const posts = await getArticles({ q: query });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 border-b-2 pb-2">
        「<span className="text-indigo-600">{query}</span>」の検索結果
      </h1>

      <p className="mb-8 text-gray-600">{posts.contents.length}件の記事が見つかりました。</p>

      {posts.contents.length === 0 ? (
        <div className="text-center py-16">
          <p>お探しの記事は見つかりませんでした。</p>
          <p className="text-sm text-gray-500 mt-2">別のキーワードでお試しください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {posts.contents.map((post, index) => (
            <ArticleCard 
              key={post.id} 
              article={post} 
              priority={index === 0} // ← 追加: 最初の記事だけプリロード
            />
          ))}
        </div>
      )}
    </div>
  );
}