'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Category } from '@/lib/microcms';

type Props = {
  categories: Category[];
};

export const CategoryPills = ({ categories }: Props) => {
  const pathname = usePathname();

  return (
    <div className="py-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
        {categories.map(category => {
          const isActive = pathname === `/category/${category.id}`;
          return (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full ${
                isActive
                  ? 'text-white bg-gray-700'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
       <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};