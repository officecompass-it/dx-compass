'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

type Props = {
  children: React.ReactNode;
};

export const HorizontalScrollContainer = ({ children }: Props) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null); // rAFのIDを保持
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 修正: requestAnimationFrame を使用してリフローを最適化
  const checkScrollability = useCallback(() => {
    if (rafRef.current) return; // 既にスケジュール済みならスキップ

    rafRef.current = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) {
        rafRef.current = null;
        return;
      }

      // DOMの読み取り
      const { scrollLeft, scrollWidth, clientWidth } = container;
      
      // Reactの状態更新（バッチ処理される）
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    // 初期チェック
    const timer = setTimeout(checkScrollability, 100);
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollability);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [checkScrollability, children]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="-m-4">
      <div className="group relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="前へスクロール"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          // 修正: min-h-[360px] を追加してCLSを防止 (カードの高さ + 余白分)
          className="flex space-x-4 overflow-x-auto p-4 scroll-smooth min-h-[360px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {React.Children.map(children, (child) => (
            <div className="w-56 flex-shrink-0 h-full">
              {child}
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="次へスクロール"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};