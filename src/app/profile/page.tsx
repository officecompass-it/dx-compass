import { getProfile } from "@/lib/microcms";
import type { Metadata } from "next";
import Image from "next/image";
import { SnsIcons } from "@/components/SnsIcons";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await getProfile();
    const pageTitle = `${profile.name}のプロフィール | DXの羅針盤`;
    const pageDesc = profile.bio.substring(0, 120);

    return {
      title: pageTitle,
      description: pageDesc,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        type: "profile",
        images: [
          {
            url: profile.avatar.url,
            width: profile.avatar.width,
            height: profile.avatar.height,
            alt: `${profile.name}のアバター画像`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDesc,
        images: [profile.avatar.url],
      },
    };
  } catch (error) {
    return {
      title: "プロフィール | DXの羅針盤",
      description: "このサイトの運営者情報です。",
    };
  }
}

export default async function ProfilePage() {
  const profile = await getProfile();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    image: profile.avatar.url,
    url: (process.env.NEXT_PUBLIC_SITE_URL || "") + "/profile",
    description: profile.bio,
    sameAs: [profile.x_url, profile.youtube_url].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          <Image
            src={profile.avatar.url}
            alt={`${profile.name}のアバター`}
            width={150}
            height={150}
            className="rounded-full border-4 border-gray-200"
            priority
          />
          <div className="mt-6 sm:mt-0 sm:ml-8 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            
            <div className="mt-4">
              <SnsIcons xUrl={profile.x_url} youtubeUrl={profile.youtube_url} />
            </div>

          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">自己紹介</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: profile.bio }} />
        </div>
      </main>
    </>
  );
}