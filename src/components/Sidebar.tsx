import Link from 'next/link';
import Image from 'next/image';
import { ProfileCard } from '@/components/ProfileCard';
import { type Article, type Profile } from '@/lib/microcms';
import { formatDate } from '@/utils/formatDate';

type Props = {
    profile?: Profile;
    recentArticles: Article[];
};

export const Sidebar = ({ profile, recentArticles }: Props) => {
    return (
        <div className="w-full">
            {/* プロフィールエリア（通常スクロール） */}
            {profile && (
                <div className="mb-8">
                    <ProfileCard profile={profile} />
                </div>
            )}

            {/* おすすめ記事リスト（下端で固定） */}
            <div className="w-full bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    おすすめ記事
                </h3>
                <ul className="flex flex-col gap-4">
                    {recentArticles.map((article) => (
                        <li key={article.id}>
                            <Link href={`/posts/${article.id}`} className="group flex gap-4 items-start">
                                <div className="relative w-24 aspect-video flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                    {article.eyecatch ? (
                                        <Image
                                            src={article.eyecatch.url}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            sizes="96px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 line-clamp-2 leading-snug transition-colors">
                                        {article.title}
                                    </h4>
                                    <time className="text-xs text-gray-500 mt-1 block">
                                        {formatDate(article.publishedAt ?? article.createdAt)}
                                    </time>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
