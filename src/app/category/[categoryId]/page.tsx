import { Metadata } from 'next';
import { getCategories, getArticles, getUniqueTagsFromArticles } from '@/lib/microcms';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { TagFilter } from '@/components/TagFilter';
import { notFound } from 'next/navigation';
import type { Category, Article } from '@/lib/microcms';

type Props = {
  params: Promise<{
    categoryId: string;
  }>;
  searchParams: Promise<{
    tag?: string;
  }>;
};

// このヘルパー関数は変更なし
const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  const data = await getCategories({ filters: `slug[equals]${slug}`, limit: 1, depth: 2 });
  return data.contents[0];
};

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }): Promise<Metadata> {
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

export default async function CategoryPage(props: Props) {
  // params と searchParams を await で解決
  const searchParams = await props.searchParams;
  const params = await props.params;

  // URLからタグIDをカンマ区切りで取得して配列にする (複数選択対応)
  const currentTagIds = searchParams.tag ? searchParams.tag.split(',') : [];

  const slug = params.categoryId;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }
  
  // 1. カテゴリーフィルターの文字列を構築
  let categoryFilterString = '';

  if (!category.parent) {
    // 親カテゴリーの場合: 子カテゴリーIDも含めたOR条件
    const children = await getCategories({ 
      filters: `parent[equals]${category.id}`,
      limit: 100,
      fields: 'id', 
    });

    const categoryIds = [
      category.id, 
      ...children.contents.map(c => c.id)
    ];
    
    // (A[or]B[or]C) の形を作成
    if (categoryIds.length > 1) {
      categoryFilterString = `(${categoryIds.map(id => `category[equals]${id}`).join('[or]')})`;
    } else {
      categoryFilterString = `category[equals]${category.id}`;
    }

  } else {
    // 子カテゴリーの場合
    categoryFilterString = `category[equals]${category.id}`;
  }

  // 2. 記事取得用のフィルター構築 (複数選択対応: いずれかのタグを含む OR条件)
  // microCMS形式: (category_condition)[and](tags[contains]TagA[or]tags[contains]TagB)
  let postsFilterString = categoryFilterString;
  
  if (currentTagIds.length > 0) {
    // タグごとの条件を作成: tags[contains]A[or]tags[contains]B
    const tagConditions = currentTagIds.map(id => `tags[contains]${id}`).join('[or]');
    
    // 全体を結合: カテゴリー条件 AND (タグ条件群)
    postsFilterString = `${categoryFilterString}[and](${tagConditions})`;
  }

  // 3. データの並列取得 (Promise.all)
  const [availableTagsData, postsData] = await Promise.all([
    // タグ一覧生成用: このカテゴリーの全記事を取得（軽量化のためtagsのみ）
    // フィルターはカテゴリー条件のみ（タグ絞り込み前の状態を取得）
    getArticles({ 
      limit: 100,
      filters: categoryFilterString, 
      fields: 'tags' 
    }),
    // 表示記事用: タグ絞り込み適用済み
    getArticles({ 
      limit: 100,
      filters: postsFilterString,
      fields: 'id,title,slug,description,eyecatch,category,tags,publishedAt,updatedAt'
    })
  ]);

  const posts = postsData.contents;
  
  // カテゴリー内の全記事からユニークなタグ一覧を生成
  const availableTags = getUniqueTagsFromArticles(availableTagsData.contents as Article[]);

  // パンくずリスト
  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
    ...(category.parent ? [{ name: category.parent.name, href: `/category/${category.parent.slug}` }] : []),
    { name: category.name, href: `/category/${category.slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-row items-end justify-between mb-8 border-b-2 pb-2">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {/* whitespace-nowrap を追加して、記事数のテキストが途中で改行されないように保護 */}
          <span className="text-gray-500 text-sm pb-1 whitespace-nowrap ml-4">
            {postsData.totalCount} 件の記事
          </span>
        </div>
        
        {/* タグフィルターUIの表示 */}
        <TagFilter tags={availableTags} />
        
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
          <div className="py-12 text-center bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600 font-medium">記事が見つかりませんでした。</p>
            {currentTagIds.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                選択した条件に一致する記事はありません。<br />
                タグの選択を解除してお試しください。
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}