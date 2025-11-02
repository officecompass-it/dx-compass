'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from './Search';
import { CategoryPills } from './CategoryPills';
import type { HierarchicalCategory } from '@/lib/microcms';

type Props = {
  categories: HierarchicalCategory[];
}

export const Header = ({ categories }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const isPostPage = pathname.startsWith('/posts/');

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        {/* ... Header content ... */}
      </header>
      
      {!isPostPage && (
        <div className="bg-white">
          <div className="md:hidden container mx-auto p-4">
            <Search />
          </div>
          <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
            <CategoryPills 
              categories={categories}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        </div>
      )}
    </div>
  );
};