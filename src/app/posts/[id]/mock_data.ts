import { Article } from '@/lib/microcms';

export const mockArticle: Article = {
    id: 'mock-1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    publishedAt: '2023-01-01',
    revisedAt: '2023-01-01',
    title: 'Cloudinary Video Player Demo',
    slug: 'mock-1',
    category: {
        id: 'cat-1',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        revisedAt: '2023-01-01',
        publishedAt: '2023-01-01',
        name: 'Tech',
        slug: 'tech',
    },
    body: [
        {
            fieldId: 'richText',
            content: '<h2>Video Demonstration</h2><p>The following video is rendered using the new Cloudinary Video Player component.</p>',
        },
        {
            fieldId: 'videoUrl',
            url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
            caption: 'Demo Video: Cute Dog (Auto-optimized)',
            width: 640,
            height: 360,
        },
        {
            fieldId: 'richText',
            content: '<p>The video above should have a poster image, valid controls, and be responsive.</p>',
        },
    ],
};
