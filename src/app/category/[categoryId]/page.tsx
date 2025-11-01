import { Metadata } from 'next';
import { getCategories, getArticles, getPostsByCategory } from '@/lib/microcms';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import type { Category, Article } from '@/lib/microcms';

type Props = {
  params: {
    categoryId: string;
  };
};

// slugからカテゴリ情報を取得するヘルパー関数
const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  const data = await getCategories({ filters: `slug[equals]${slug}`, limit: 1, depth: 2 });
  return data.contents[0];
};

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

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.categoryId;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }
  
  let posts: Article[] = [];
  let breadcrumbItems = [];

  // 親カテゴリーかどうかを判定
  if (!category.parent) {
    // 親カテゴリーの場合のみ、子カテゴリーと記事を並列取得
    const [children, directPosts] = await Promise.all([
      getCategories({ 
        filters: `parent[equals]${category.id}`,
        limit: 100 
      }),
      // 親カテゴリーに直接紐づく記事も取得（もしあれば）
      getArticles({ 
        limit: 100,
        filters: `category[equals]${category.id}`,
        fields: 'id,title,slug,description,eyecatch,category,publishedAt,updatedAt'
      })
    ]);

    const childrenIds = children.contents.map(c => c.id);

    if (childrenIds.length > 0) {
      // 子カテゴリーの記事を取得
      const orFilters = childrenIds.map(id => `category[equals]${id}`).join('[or]');
      const childPosts = await getArticles({ 
        limit: 100,
        filters: orFilters,
        fields: 'id,title,slug,description,eyecatch,category,publishedAt,updatedAt'
      });
      
      // 直接紐づく記事と子カテゴリーの記事をマージ（重複排除）
      const allPostsMap = new Map<string, Article>();
      [...directPosts.contents, ...childPosts.contents].forEach(post => {
        allPostsMap.set(post.id, post);
      });
      posts = Array.from(allPostsMap.values());
    } else {
      // 子カテゴリーがない場合は直接紐づく記事のみ
      posts = directPosts.contents;
    }
    
    breadcrumbItems = [
      { name: 'ホーム', href: '/' },
      { name: category.name, href: `/category/${category.slug}` },
    ];

  } else {
    // 子カテゴリーの場合（シンプルに1回のリクエスト）
    const postsData = await getArticles({
      limit: 100,
      filters: `category[equals]${category.id}`,
      fields: 'id,title,slug,description,eyecatch,category,publishedAt,updatedAt'
    });
    posts = postsData.contents;

    if (category.parent) {
       breadcrumbItems = [
        { name: 'ホーム', href: '/' },
        { name: category.parent.name, href: `/category/${category.parent.slug}` },
        { name: category.name, href: `/category/${category.slug}` },
      ];
    } else {
       breadcrumbItems = [
        { name: 'ホーム', href: '/' },
        { name: category.name, href: `/category/${category.slug}` },
      ];
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8 border-b-2 pb-2">{category.name}</h1>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.id} article={post} />
            ))}
          </div>
        ) : (
          <p>このカテゴリーの記事はまだありません。</p>
        )}
      </div>
    </div>
  );
}