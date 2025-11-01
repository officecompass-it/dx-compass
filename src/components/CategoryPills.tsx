'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { HierarchicalCategory } from '@/lib/microcms';
import { DropdownPill } from './DropdownPill';

type Props = {
  categories: HierarchicalCategory[];
};

export const CategoryPills = ({ categories }: Props) => {
  const pathname = usePathname();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ページ遷移が完了したら、必ずメニューを閉じる
  useEffect(() => {
    setOpenMenuId(null);
  }, [pathname]);

  // クリックされたピルのIDをstateにセットする（同じIDなら閉じる）
  const handleTogglePill = (categoryId: string) => {
    setOpenMenuId(prevId => (prevId === categoryId ? null : categoryId));
  };

  return (
    <div className="py-2">
      <div className="flex space-x-3 px-4">
        <Link
          href="/"
          className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full ${
            pathname === '/'
              ? 'text-white bg-gray-700'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          すべて
        </Link>

        {categories.map(category => (
          <DropdownPill
            key={category.id}
            category={category}
            isOpen={openMenuId === category.id}
            onToggle={handleTogglePill}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
};