import { Metadata } from 'next';

// SEO/GEOのためのメタデータ設定
export const metadata: Metadata = {
  title: 'お問い合わせ | DXの羅針盤',
  description: 'DXの羅針盤へのお問い合わせはこちらのページから。AppSheetやGoogle Workspaceに関するご質問、ご意見、協業のご相談など、お気軽にご連絡ください。',
  openGraph: {
    title: 'お問い合わせ | DXの羅針盤',
    description: 'DXの羅針盤へのお問い合わせはこちらのページから。',
    url: '/contact', // Vercel等にデプロイ後、完全なURLに置き換えることが望ましい
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'お問い合わせ | DXの羅針盤',
    description: 'DXの羅針盤へのお問い合わせはこちらのページから。',
  },
};

const ContactPage = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          お問い合わせ
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          ご意見、ご感想、記事に関するご質問、または協業のご相談など、お気軽にご連絡ください。
        </p>
      </div>

      <section className="mt-12">
        {/* 
          重要: 下記のiframeのsrc属性を、ご自身のGoogleフォームの埋め込みURLに置き換えてください。
          Googleフォームの「送信」ボタン > 「<>」タブから埋め込みコードを取得できます。
        */}
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSfNHRfR0I1PiFMT7FeUdLgWayEuOClh21-mHgotQvkUGqwX7w/viewform?usp=dialog" // ★★★ ここにGoogleフォームの埋め込みURLを設定 ★★★
          width="100%"
          height="800"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="お問い合わせフォーム"
          className="mx-auto w-full max-w-3xl rounded-lg border border-gray-200"
        >
          読み込んでいます…
        </iframe>
      </section>
    </main>
  );
};

export default ContactPage;