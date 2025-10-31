'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ★ Hookをインポート
import { Search } from './Search';
import { CategoryPills } from './CategoryPills';
import type { Category } from '@/lib/microcms';

type Props = {
  categories: Category[];
}

export const Header = ({ categories }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // ★ 現在のパスを取得

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // ★ 修正: 現在のパスが記事ページかどうかを判定
  const isPostPage = pathname.startsWith('/posts/');

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold flex-shrink-0">
            <Link href="/" onClick={handleLinkClick}>
              DXの羅針盤
            </Link>
          </h1>
          
          <div className="hidden md:flex flex-grow justify-center px-8">
            <div className="w-full max-w-md">
               <Search />
            </div>
          </div>

          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li><Link href="/" className="hover:text-blue-300">トップ</Link></li>
              <li><Link href="/profile" className="hover:text-blue-300">運営者情報</Link></li>
              <li><Link href="/contact" className="hover:text-blue-300">問い合わせ</Link></li>
            </ul>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} aria-label="メニューを開閉する">
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3-org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3-org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 shadow-lg">
            <nav>
              <ul className="flex flex-col items-center">
                <li><Link href="/" onClick={handleLinkClick} className="block py-4 w-full text-center hover:bg-gray-700">トップ</Link></li>
                <li><Link href="/profile" onClick={handleLinkClick} className="block py-4 w-full text-center hover:bg-gray-700">運営者情報</Link></li>
                <li><Link href="/contact" onClick={handleLinkClick} className="block py-4 w-full text-center hover:bg-gray-700">問い合わせ</Link></li>
              </ul>
            </nav>
          </div>
        )}
      </header>
      
      {/* ★ 修正: 記事ページでは表示しないように条件分岐を追加 */}
      {!isPostPage && (
        <div className="bg-white">
          <div className="md:hidden container mx-auto p-4">
            <Search />
          </div>
          <CategoryPills categories={categories} />
        </div>
      )}
    </div>
  );
};