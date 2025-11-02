'use client';

import { useState, useEffect, RefObject } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { HierarchicalCategory } from '@/lib/microcms';
import { DropdownPill } from './DropdownPill';

type Props = {
  categories: HierarchicalCategory[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export const CategoryPills = ({ categories, scrollContainerRef }: Props) => {
  const pathname = usePathname();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setOpenMenuId(null);
  }, [pathname]);

  const handleTogglePill = (categoryId: string) => {
    setOpenMenuId(prevId => (prevId === categoryId ? null : categoryId));
  };

  return (
    <div className="py-2">
      <div className="flex items-center gap-3 px-4">
        <Link
          href="/"
          className={`inline-flex items-center flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
            pathname === '/' ? 'text-white bg-gray-700' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          すべて
        </Link>
        {categories.map((category, index) => (
          <div key={category.id} className="flex-shrink-0">
            <DropdownPill
              category={category}
              isOpen={openMenuId === category.id}
              onToggle={handleTogglePill}
              pathname={pathname}
              scrollContainerRef={scrollContainerRef}
              isLastItem={index === categories.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};