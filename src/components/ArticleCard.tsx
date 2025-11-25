import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/microcms';
import { formatDate } from '@/utils/formatDate';

type Props = {
  article: Article;
  variant?: 'grid' | 'carousel';
  priority?: boolean;
};

export const ArticleCard = ({ article, variant = 'grid', priority = false }: Props) => {
  const hasPublishedDate = article.publishedAt;
  // "h-full" で高さを親に合わせつつ、各要素のサイズを安定させる
  const cardClasses = "bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col relative hover:z-10 h-full";

  return (
    <div className={cardClasses}>
      <Link href={`/posts/${article.id}`} className="block h-full flex flex-col">
        {/* 修正: paddingハックを廃止し、aspect-video と bg-gray-200 を適用 */}
        <div className="relative w-full aspect-video bg-gray-200">
          <Image
            src={article.eyecatch?.url || '/no-image.png'}
            alt={article.title || '記事のアイキャッチ画像'}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            quality={85} 
          />
        </div>
        <div className="p-4 md:p-5 flex flex-col flex-grow">
          {article.category && (
            <span className="text-sm text-indigo-600 font-semibold mb-2">
              {article.category.name}
            </span>
          )}
          <h3 className="text-base font-bold text-gray-900 mb-2 leading-relaxed line-clamp-2 h-12">
            {article.title}
          </h3>
          {variant === 'grid' && article.description && (
            <p className="mt-1 text-sm text-gray-600 flex-grow line-clamp-3">
              {article.description}
            </p>
          )}
          {hasPublishedDate && (
             <time dateTime={article.publishedAt} className="text-xs text-gray-500 mt-auto pt-3">
                {formatDate(article.publishedAt!)}
            </time>
          )}
        </div>
      </Link>
    </div>
  );
};