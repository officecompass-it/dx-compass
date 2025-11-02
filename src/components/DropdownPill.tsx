'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { HierarchicalCategory } from '@/lib/microcms';

type Props = {
  category: HierarchicalCategory;
  isOpen: boolean;
  onToggle: (id: string) => void;
  pathname: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  isLastItem: boolean;
};

type AlignmentMode = 'left' | 'right';

export const DropdownPill = ({ 
  category, 
  isOpen, 
  onToggle, 
  pathname,
  scrollContainerRef,
  isLastItem
}: Props) => {
  const hasChildren = category.children && category.children.length > 0;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const alignmentModeRef = useRef<AlignmentMode>('left');

  useEffect(() => {
    setMounted(true);
  }, []);

  // メニュー位置を計算する関数
  const calculateMenuPosition = (shouldDetermineAlignment: boolean = false) => {
    if (!buttonRef.current) return null;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192;
    
    // 初回のみ配置方向を決定
    if (shouldDetermineAlignment) {
      // 最後の要素の場合は常に右揃え、それ以外は左揃え
      alignmentModeRef.current = isLastItem ? 'right' : 'left';
    }
    
    // 決定された配置方向に基づいて位置を計算
    let left: number;
    if (alignmentModeRef.current === 'right') {
      left = rect.right - menuWidth;
    } else {
      left = rect.left;
    }
    
    return {
      top: rect.bottom + 8,
      left: left,
    };
  };

  // 初期位置設定とスクロール監視
  useEffect(() => {
    if (!isOpen || !hasChildren) {
      setIsPositionCalculated(false);
      return;
    }

    // 初期位置を設定(配置方向も決定)
    const initialPosition = calculateMenuPosition(true);
    if (initialPosition) {
      setMenuPosition(initialPosition);
      setIsPositionCalculated(true);
    }

    // スクロールコンテナが存在しない場合は早期リターン
    if (!scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    let ticking = false;

    // requestAnimationFrameを使用したスクロールハンドラー
    const handleScroll = () => {
      if (!ticking) {
        animationFrameRef.current = requestAnimationFrame(() => {
          // スクロール中は配置方向を変更しない
          const newPosition = calculateMenuPosition(false);
          if (newPosition) {
            setMenuPosition(newPosition);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // スクロールイベントリスナーを登録
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    // ウィンドウリサイズにも対応
    window.addEventListener('resize', handleScroll, { passive: true });

    // クリーンアップ
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, hasChildren, scrollContainerRef, isLastItem]);

  const getActiveState = (cat: HierarchicalCategory): boolean => {
    if (pathname === `/category/${cat.slug}`) return true;
    if (cat.children) {
      return cat.children.some(child => getActiveState(child));
    }
    return false;
  };

  const isActive = getActiveState(category);

  const dropdownMenu = isOpen && hasChildren && mounted && isPositionCalculated && (
    <div
      className="fixed w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-200"
      style={{ 
        top: `${menuPosition.top}px`, 
        left: `${menuPosition.left}px`,
        transition: 'none',
        willChange: 'transform'
      }}
    >
      <div className="py-1">
        {category.children?.map(child => {
          const isChildActive = pathname === `/category/${child.slug}`;
          return (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className={`block px-4 py-2 text-sm transition-colors ${
                isChildActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {child.name}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="relative flex-shrink-0">
        {hasChildren ? (
          <button
            ref={buttonRef}
            onClick={() => onToggle(category.id)}
            className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              isActive
                ? 'text-white bg-gray-700'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category.name}
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <Link
            href={`/category/${category.slug}`}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              isActive
                ? 'text-white bg-gray-700'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
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