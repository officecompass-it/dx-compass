'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { HierarchicalCategory } from '@/lib/microcms';

type Props = {
  category: HierarchicalCategory;
  isOpen: boolean;
  onToggle: (id: string) => void;
  pathname: string;
};

export const DropdownPill = ({ category, isOpen, onToggle, pathname }: Props) => {
  const hasChildren = category.children && category.children.length > 0;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // スクロール量を加算しないように修正
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen]);

  const getActiveState = (cat: HierarchicalCategory) => {
    if (pathname === `/category/${cat.slug}`) return true;
    if (cat.children?.some(child => pathname === `/category/${child.slug}`)) return true;
    return false;
  };

  const isActive = getActiveState(category);

  const dropdownMenu = isOpen && hasChildren && mounted && (
    <div
      className="fixed w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-200"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
    >
      <div className="py-1">
        <Link
          href={`/category/${category.slug}`}
          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
            pathname === `/category/${category.slug}` ? 'font-bold' : ''
          }`}
        >
          {category.name} のすべて
        </Link>
        {category.children?.map(child => (
          <Link
            key={child.id}
            href={`/category/${child.slug}`}
            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
              pathname === `/category/${child.slug}` ? 'font-bold' : ''
            }`}
          >
            {child.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        {hasChildren ? (
          <button
            ref={buttonRef}
            onClick={() => onToggle(category.id)}
            className={`flex items-center space-x-1 flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full ${
              isActive ? 'text-white bg-gray-700' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span>{category.name}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        ) : (
          <Link
            href={`/category/${category.slug}`}
            className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full ${
              isActive ? 'text-white bg-gray-700' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </Link>
        )}
      </div>
      
      {mounted && createPortal(dropdownMenu, document.body)}
    </>
  );
};