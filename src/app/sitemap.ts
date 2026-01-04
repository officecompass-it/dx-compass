import { getArticles, getCategories } from '@/lib/microcms';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // ★ 修正: limitの上限値を1000から100に変更
  const posts = await getArticles({ limit: 100 });
  const postRoutes = posts.contents.map((post) => ({
    url: `${BASE_URL}/posts/${post.id}`,
    lastModified: new Date(post.revisedAt || post.updatedAt),
  }));

  // カテゴリー
  const categories = await getCategories({ limit: 100 });
  const categoryRoutes = categories.contents.map((category) => ({
    url: `${BASE_URL}/category/${category.slug}`,
    lastModified: new Date(),
  }));

  // 固定ページ
  const staticRoutes = ['', '/profile', '/contact'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}