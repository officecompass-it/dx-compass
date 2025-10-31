import { createClient } from "microcms-js-sdk";
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSDate,
} from "microcms-js-sdk";

// 記事の型定義
export type Article = {
  id: string;
  title: string;
  content?: string;
  body?: string;
  description?: string;
  eyecatch?: MicroCMSImage;
  thumbnail?: MicroCMSImage;
  category?: {
    id: string;
    name: string;
  };
} & MicroCMSDate;

// プロフィールの型定義
export type Profile = {
  name: string;
  bio: string;
  avatar: MicroCMSImage;
  x_url?: string;
  github_url?: string;
} & MicroCMSDate;

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

// 記事一覧の取得
export const getArticles = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<Article>({
    endpoint: "posts", // articles → posts に変更
    queries,
  });
  return listData;
};

// 記事詳細の取得
export const getArticleDetail = async <T = Article>( 
  contentId: string,
  queries?: MicroCMSQueries
) => {
  const detailData = await client.get<T>({ 
    endpoint: "posts",
    contentId,
    queries,
  });
  return detailData;
};

// プロフィール情報の取得（オブジェクト形式）
export const getProfile = async (queries?: MicroCMSQueries) => {
  const profileData = await client.getObject<Profile>({
    endpoint: "profile",
    queries,
  });
  return profileData;
};

// カテゴリの型定義を追加
export type Category = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
};

// カテゴリ一覧を取得する関数を追加 (ビルド時の静的生成に利用)
export const getCategories = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<Category>({
    endpoint: 'categories',
    queries,
  });
  return listData;
};

// 単一のカテゴリ情報をIDで取得する関数を追加
export const getCategoryDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  const detailData = await client.get<Category>({
    endpoint: 'categories',
    contentId,
    queries,
  });
  return detailData;
};

// カテゴリIDで記事を絞り込んで取得する関数を追加
export const getPostsByCategory = async (
  categoryId: string,
  queries?: MicroCMSQueries
) => {
  const listData = await client.getList<Article>({
    endpoint: 'posts',
    queries: {
      ...queries,
      filters: `category[equals]${categoryId}`, // categoryフィールドが指定のIDと一致するものをフィルタ
    },
  });

  return listData;
};