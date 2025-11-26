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
  const cardClasses = "bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col relative hover:z-10 h-full";

  // ★修正1: カルーセル(carousel)の時は、小さなサイズ(224px)だけを要求するように最適化
  // これにより、不必要に巨大な画像のダウンロードを防ぎます
  const imageSizes = variant === 'carousel'
    ? '(max-width: 640px) 224px, 256px' 
    : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return (
    <div className={cardClasses}>
      <Link href={`/posts/${article.id}`} className="block h-full flex flex-col">
        {/* 背景色(bg-gray-200)をつけて画像ロード前の白飛び/CLSを防止 */}
        <div className="relative w-full aspect-video bg-gray-200">
          <Image
            src={article.eyecatch?.url || '/no-image.png'}
            alt={article.title || '記事のアイキャッチ画像'}
            className="object-cover"
            fill
            sizes={imageSizes}     // ★最適化したサイズ変数を適用
            priority={priority}    // ★重要: これがtrueなら fetchpriority="high" が付く
            quality={85} 
            decoding={priority ? 'sync' : 'async'}
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