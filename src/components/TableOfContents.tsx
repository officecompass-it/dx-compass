'use client';

import { useState, MouseEvent } from 'react';

export type TocItem = {
    id: string;
    text: string;
    name: string; // 'h1' | 'h2' | 'h3'
};

type Props = {
    toc: TocItem[];
};

export const TableOfContents = ({ toc }: Props) => {
    const [activeId, setActiveId] = useState<string>('');

    if (toc.length === 0) {
        return null;
    }

    const handleClick = (e: MouseEvent<HTMLAnchorElement>, itemId: string) => {
        e.preventDefault();

        // クリックした項目をアクティブにする
        setActiveId(itemId);

        const element = document.getElementById(itemId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                目次
            </h4>
            <ul className="space-y-3">
                {toc.map((item) => (
                    <li
                        key={item.id}
                        className={`${item.name === 'h1' ? 'ml-0' : item.name === 'h2' ? 'ml-4' : item.name === 'h3' ? 'ml-8' : ''}`}
                    >
                        <a
                            href={`#${item.id}`}
                            className={`block text-sm transition-colors duration-200 hover:text-indigo-600 ${activeId === item.id
                                ? 'text-indigo-600 font-bold'
                                : 'text-gray-600'
                                }`}
                            onClick={(e) => handleClick(e, item.id)}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
