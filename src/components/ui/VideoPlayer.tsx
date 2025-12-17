
import React from 'react';

type Props = {
    url: string;
    width?: number;
    height?: number;
    caption?: string;
};

// ヘルパー: Cloudinary URLにパラメータを付与
const getOptimizedUrl = (url: string) => {
    // すでにパラメータがついているか簡易チェック (本来はSDK使うのが確実だがURL操作で軽量に実装)
    if (!url.includes('cloudinary.com')) return url;

    // /upload/ の後ろに f_auto,q_auto を挿入
    // 例: .../upload/v1234/demo.mp4 -> .../upload/f_auto,q_auto/v1234/demo.mp4
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

// ヘルパー: ポスター画像を生成 (動画拡張子を .jpg に置換)
const getPosterUrl = (url: string) => {
    if (!url.includes('cloudinary.com')) return undefined;
    // 拡張子(.mp4など)を.jpgに置換
    // また、ポスター画像も最適化したいので f_auto,q_auto を付与（上記関数と共通可だがシンプルに）
    let poster = url.replace(/\.(mp4|webm|mov)$/i, '.jpg');
    poster = poster.replace('/upload/', '/upload/f_auto,q_auto/');
    return poster;
};

export const VideoPlayer: React.FC<Props> = ({ url, width, height, caption }) => {
    const optimizedUrl = getOptimizedUrl(url);
    const posterUrl = getPosterUrl(url);

    // アスペクト比計算 (デフォルト 16:9)
    const aspectRatio = width && height ? `${width} / ${height}` : '16 / 9';

    return (
        <div className="my-8 w-full">
            <div
                className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100 w-full"
                style={{ aspectRatio }}
            >
                <video
                    className="w-full h-full object-cover"
                    src={optimizedUrl}
                    poster={posterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    // Reactでは webkit-playsinline は小文字の属性として渡すか、camelCaseで認識されるか注意が必要。
                    // React 16+ では camelCase で playsInline が推奨されるが、
                    // webkit-playsinline は非標準属性のため小文字で spread するか直接書くか。
                    // Next.js (React) では playsInline={true} でHTML出力時に playsinline になる。
                    // webkit-playsinline は明示的に小文字で書く必要がある場合もあるが、
                    // 最近のReactはUnknown propを通すので一旦属性として書いてみる。
                    {...{ "webkit-playsinline": "true" }}
                />
            </div>
            {caption && (
                <p className="mt-2 text-center text-sm text-gray-500">
                    {caption}
                </p>
            )}
        </div>
    );
};
