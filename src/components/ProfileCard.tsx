import Image from 'next/image';
import Link from 'next/link';
import type { Profile } from '@/lib/microcms';

type Props = {
  profile: Profile;
};

export const ProfileCard = ({ profile }: Props) => {
  return (
    // ★修正: border, shadow, bg-white を削除し、paddingのみ調整
    // これで「枠」がなくなり、記事の横に自然に佇むデザインになります
    <div className="p-2 md:p-4">
      <div className="flex flex-col items-center text-center">
        {/* プロフィール画像 */}
        <div className="relative w-24 h-24 mb-4">
          <Image
            src={profile.avatar?.url || '/no-image.png'}
            alt={profile.name}
            fill
            className="rounded-full object-cover border border-gray-100" // borderを少し薄く
            sizes="96px"
          />
        </div>

        {/* 名前 */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{profile.name}</h3>

        {/* 自己紹介文 */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed text-left">
          {profile.bio}
        </p>

        {/* 問い合わせボタン (CTA) */}
        <Link 
          href="/contact" 
          className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
        >
          質問はこちら！
        </Link>
        
      </div>
    </div>
  );
};