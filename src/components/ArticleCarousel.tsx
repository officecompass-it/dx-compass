import Link from 'next/link';
import { ArticleCard } from './ArticleCard';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';
import type { Article } from '@/lib/microcms';

type Props = {
  title: string; // "最新記事" や "AI" などのセクションタイトル
  articles: Article[];
  viewMoreLink?: string; // "もっと見る" のリンク先URL (任意)
  priorityIndices?: number[];
};

export const ArticleCarousel = ({ title, articles, viewMoreLink }: Props) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          {/* リンクがある場合はタイトル全体をリンクにする */}
          {viewMoreLink ? (
            <Link href={viewMoreLink} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {/* リンクがある場合のみ「もっと見る」を表示 */}
        {viewMoreLink && (
          <Link href={viewMoreLink} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            もっと見る ›
          </Link>
        )}
      </div>
      <HorizontalScrollContainer>
        {articles.map((post) => (
          <ArticleCard key={post.id} article={post} variant="carousel" />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
};