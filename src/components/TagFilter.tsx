'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Tag } from '@/lib/microcms';

type Props = {
  tags: Tag[];
};

export const TagFilter = ({ tags }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // URLからタグIDを配列として取得 (カンマ区切り)
  const rawTags = searchParams.get('tag');
  const currentTagIds = rawTags ? rawTags.split(',') : [];

  const handleTagClick = (tagId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 「すべて」をクリックした場合
    if (tagId === null) {
      params.delete('tag');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }

    let newTagIds: string[];

    if (currentTagIds.includes(tagId)) {
      // 既に選択済みの場合は削除 (選択解除)
      newTagIds = currentTagIds.filter(id => id !== tagId);
    } else {
      // 未選択の場合は追加
      newTagIds = [...currentTagIds, tagId];
    }

    if (newTagIds.length > 0) {
      params.set('tag', newTagIds.join(','));
    } else {
      params.delete('tag');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (tags.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-gray-500 mb-2">タグで絞り込む (複数選択可)</h2>
      
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <button
          onClick={() => handleTagClick(null)}
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-sm transition-colors border ${
            currentTagIds.length === 0
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          すべて
        </button>
        {tags.map((tag) => {
          const isSelected = currentTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`flex-shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-sm transition-colors border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              #{tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};