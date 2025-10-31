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
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {/* ★ 修正: 最後の項目にのみ、テキスト省略のためのクラスを追加 */}
              <li className={isLast ? "flex-shrink min-w-0" : ""}>
                {isLast ? (
                  <span aria-current="page" className="truncate font-medium text-gray-700">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:underline hover:text-gray-700">
                    {item.name}
                  </Link>
                )}
              </li>
              
              {!isLast && (
                 <li>
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