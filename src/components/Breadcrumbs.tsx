import Link from 'next/link';
import React from 'react';

type BreadcrumbItem = {
  name: string;
  href: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export const Breadcrumbs = ({ items }: Props) => {
  return (
    <nav aria-label="breadcrumb" className="mb-8">
      {/* ol要素に "overflow-x-auto" とスクロールバー非表示クラスを追加 */}
      <ol className="flex items-center space-x-2 text-sm text-gray-500 overflow-x-auto scrollbar-hide">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {/* li要素に "flex-shrink-0" を追加 */}
              <li className="flex-shrink-0">
                {isLast ? (
                  // 最後の項目（現在地）
                  <span aria-current="page" className="font-medium text-gray-700 whitespace-nowrap">
                    {item.name}
                  </span>
                ) : (
                  // リンク付きの項目
                  <Link href={item.href} className="hover:underline hover:text-gray-700 whitespace-nowrap">
                    {item.name}
                  </Link>
                )}
              </li>
              
              {!isLast && (
                 <li className="flex-shrink-0">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};