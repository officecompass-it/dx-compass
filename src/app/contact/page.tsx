'use client';

import { useActionState } from 'react';
import { submitContact, ContactState } from '@/app/actions/submitContact';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Link from 'next/link';

const initialState: ContactState = {
  success: false,
  message: '',
};

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  const breadcrumbItems = [
    { name: 'ホーム', href: '/' },
    { name: 'お問い合わせ', href: '/contact' },
  ];

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="text-3xl font-bold mb-8 text-center">お問い合わせ</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-10 shadow-sm">
        
        {state.success ? (
          /* ▼▼▼ デザイン修正箇所：送信完了画面 ▼▼▼ */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">送信が完了しました</h2>
            <p className="text-gray-600 mb-10 leading-relaxed">
              お問い合わせありがとうございます。<br />
              内容を確認の上、担当者よりご連絡させていただきます。
            </p>
            <Link 
              href="/" 
              className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              トップページに戻る
            </Link>
          </div>
          /* ▲▲▲ 修正ここまで ▲▲▲ */
        ) : (
          <form action={formAction} className="space-y-6">
            
            {!state.success && state.message && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{state.message}</span>
              </div>
            )}

            {/* お名前 */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="山田 太郎（ニックネーム可）"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                required
              />
              {state.errors?.name && <p className="text-red-500 text-xs mt-1 font-bold">{state.errors.name[0]}</p>}
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                required
              />
              {state.errors?.email && <p className="text-red-500 text-xs mt-1 font-bold">{state.errors.email[0]}</p>}
            </div>

            {/* 件名 */}
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                件名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white transition-colors cursor-pointer"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>選択してください</option>
                  <option value="technical">技術的な質問</option>
                  <option value="article">記事に関する質問</option>
                  <option value="business">お仕事のご相談</option>
                  <option value="other">その他</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              {state.errors?.subject && <p className="text-red-500 text-xs mt-1 font-bold">{state.errors.subject[0]}</p>}
            </div>

            {/* お問い合わせ内容 */}
            <div>
              <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="詳細をご記入ください"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                required
              ></textarea>
              {state.errors?.message && <p className="text-red-500 text-xs mt-1 font-bold">{state.errors.message[0]}</p>}
            </div>

            <hr className="border-gray-200 my-8" />

            {/* メルマガ配信希望 */}
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="newsletter" className="font-medium text-gray-900 cursor-pointer select-none">
                  無料のメールマガジンを受け取る
                </label>
                <p className="text-gray-500 text-xs mt-1">
                  DXに関する最新情報をお届けします。
                </p>
              </div>
            </div>

            {/* プライバシーポリシー同意 */}
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center h-5">
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  required
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="privacy" className="font-medium text-gray-900 cursor-pointer select-none">
                  <span className="text-red-500 mr-1">*</span>
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank">
                    プライバシーポリシー
                  </Link>
                  に同意する
                </label>
                {state.errors?.privacy && <p className="text-red-500 text-xs mt-1 font-bold">{state.errors.privacy[0]}</p>}
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className={`w-full text-white font-bold py-4 px-6 rounded-full transition-all shadow-md transform active:scale-95 ${
                  isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isPending ? '送信中...' : '送信する'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}