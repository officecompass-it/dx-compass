'use client';

import { useEffect, useRef } from 'react';

type Props = {
    html: string;
    className?: string;
};

export const ArticleBody = ({ html, className }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const videos = containerRef.current.querySelectorAll('video');
        videos.forEach((video) => {
            // ブラウザの自動再生ポリシーを遵守するため、明示的にmutedを設定
            video.muted = true;
            video.play().catch((e) => {
                console.warn('Video autoplay failed:', e);
            });
        });
    }, [html]);

    return (
        <div
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
