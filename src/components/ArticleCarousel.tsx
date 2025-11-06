import Link from 'next/link';
import { ArticleCard } from './ArticleCard';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';
import type { Article } from '@/lib/microcms';

type Props = {
  title: string;
  articles: Article[];
  viewMoreLink?: string;
  priorityIndices?: number[];
};

export const ArticleCarousel = ({ title, articles, viewMoreLink, priorityIndices = [] }: Props) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          {viewMoreLink ? (
            <Link href={viewMoreLink} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {viewMoreLink && (
          <Link href={viewMoreLink} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            もっと見る ›
          </Link>
        )}
      </div>
      <HorizontalScrollContainer>
        {articles.map((post, index) => (
          <ArticleCard 
            key={post.id} 
            article={post} 
            variant="carousel" 
            priority={priorityIndices.includes(index)}
          />
        ))}
      </HorizontalScrollContainer>
    </section>
  );
};