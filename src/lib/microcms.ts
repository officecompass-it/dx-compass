import { createClient } from "microcms-js-sdk";
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSDate,
  MicroCMSListContent,
} from "microcms-js-sdk";

// ★追加: 繰り返しフィールド用の型定義
// 繰り返しフィールド用の型定義は削除 (regex自動検知に一本化のため)

export type Tag = {
  name: string;
  slug: string;
} & MicroCMSListContent;

export type Category = {
  name: string;
  slug: string;
  parent?: Category;
} & MicroCMSListContent;

export type Article = {
  id: string;
  title: string;
  slug: string;
  body: string;
  description?: string;
  eyecatch?: MicroCMSImage;
  category: Category;
  tags?: Tag[];
} & MicroCMSDate;

export type Profile = {
  name: string;
  bio: string;
  avatar: MicroCMSImage;
  x_url?: string;
  github_url?: string;
  youtube_url?: string;
} & MicroCMSDate;

export type HierarchicalCategory = Category & {
  children: HierarchicalCategory[];
};

// ★追加: 一覧取得時の軽量化用フィールド定義 (将来のタグ実装も見越して tags を含める)
export const LIST_FIELDS = ['id', 'title', 'publishedAt', 'eyecatch', 'category', 'tags'];

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error("MICROCMS_SERVICE_DOMAIN is required");
}
if (!process.env.MICROCMS_API_KEY) {
  throw new Error("MICROCMS_API_KEY is required");
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

export const getArticles = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<Article>({
    endpoint: "posts",
    queries,
    customRequestInit: {
      next: {
        revalidate: 600, // 10分キャッシュ
        tags: ['articles'] // キャッシュタグ
      },
    },
  });
  return listData;
  return listData;
};

// ★追加: 最新記事取得 (5件)
export const getRecentBlogs = async () => {
  const listData = await client.getList<Article>({
    endpoint: "posts",
    queries: {
      limit: 5,
      fields: ['id', 'title', 'publishedAt', 'eyecatch', 'category'],
    },
    customRequestInit: {
      next: {
        revalidate: 600,
        tags: ['articles', 'recent-articles']
      },
    },
  });
  return listData.contents;
};

// 提示いただいたジェネリック対応版を使用
export const getArticleDetail = async <T = Article>(
  slug: string,
  queries?: MicroCMSQueries
) => {
  const detailData = await client.getListDetail<T>({
    endpoint: "posts",
    contentId: slug,
    queries,
    customRequestInit: {
      next: {
        revalidate: 0,
        tags: ['articles', `article-${slug}`]
      },
    },
  });
  return detailData;
};

export const getProfile = async (queries?: MicroCMSQueries) => {
  const profileData = await client.getObject<Profile>({
    endpoint: "profile",
    queries,
    customRequestInit: {
      next: {
        revalidate: 3600,
        tags: ['profile']
      },
    },
  });
  return profileData;
};

export const getCategories = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<Category>({
    endpoint: 'categories',
    queries,
    customRequestInit: {
      next: {
        revalidate: 600,
        tags: ['categories']
      },
    },
  });
  return listData;
};

export const getCategoryDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  const detailData = await client.get<Category>({
    endpoint: 'categories',
    contentId,
    queries,
    customRequestInit: {
      next: {
        revalidate: 600,
        tags: ['categories', `category-${contentId}`]
      },
    },
  });
  return detailData;
};

export const getPostsByCategory = async (
  categoryId: string,
  queries?: MicroCMSQueries
) => {
  const listData = await client.getList<Article>({
    endpoint: 'posts',
    queries: {
      ...queries,
      filters: `category[equals]${categoryId}`,
    },
    customRequestInit: {
      next: {
        revalidate: 600,
        tags: ['articles', `category-posts-${categoryId}`]
      },
    },
  });
  return listData;
};

export const getTags = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<Tag>({
    endpoint: 'tags',
    queries,
    customRequestInit: {
      next: {
        revalidate: 3600,
        tags: ['tags']
      },
    },
  });
  return listData;
};

const buildCategoryTree = (categories: Category[]): HierarchicalCategory[] => {
  const categoryMap = new Map<string, HierarchicalCategory>();
  const rootCategories: HierarchicalCategory[] = [];

  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  categories.forEach(category => {
    if (category.parent && category.parent.id) {
      const parent = categoryMap.get(category.parent.id);
      const child = categoryMap.get(category.id);
      if (parent && child) {
        parent.children.push(child);
      }
    }
  });

  categoryMap.forEach(category => {
    if (!category.parent) {
      rootCategories.push(category);
    }
  });

  return rootCategories;
};

export const getHierarchicalCategories = async (): Promise<HierarchicalCategory[]> => {
  const data = await getCategories({ limit: 100, depth: 2 });
  return buildCategoryTree(data.contents);
};

// ★追加: 記事リストからユニークなタグ一覧を抽出するヘルパー関数
export const getUniqueTagsFromArticles = (articles: Article[]): Tag[] => {
  const tagMap = new Map<string, Tag>();
  articles.forEach(article => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => {
        // タグIDをキーにして重複を排除
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    }
  });
  // Mapの値（Tagオブジェクト）を配列にして返す
  return Array.from(tagMap.values());
};