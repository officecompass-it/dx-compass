import styles from '../posts/[id]/prose-styles.module.css';
import * as cheerio from 'cheerio';
import { ArticleBody } from '../posts/[id]/ArticleBody';
import { TableOfContents } from '@/components/TableOfContents';

export default function VerifyTocPage() {
    const dummyHtml = `
    <h1>Main Title (H1)</h1>
    <p>Introduction content.</p>
    <h2>Section 1 (H2)</h2>
    <p>Section 1 details.</p>
    <h3>Subsection (H3)</h3>
    <p>Subsection details.</p>
    <h2>Section 2 (H2)</h2>
    <p>Section 2 details.</p>
  `;

    type TocItem = {
        id: string;
        text: string;
        name: string;
    };

    const processHtmlBody = (html: string | undefined): { html: string; toc: TocItem[] } => {
        if (!html) { return { html: '', toc: [] }; }
        const $ = cheerio.load(html);

        // タグの変換 (h1->h2, h2->h3, h3->h4)
        $('h3').each((_, elem) => { $(elem).replaceWith($(`<h4>${$(elem).html()}</h4>`)); });
        $('h2').each((_, elem) => { $(elem).replaceWith($(`<h3>${$(elem).html()}</h3>`)); });
        $('h1').each((_, elem) => { $(elem).replaceWith($(`<h2>${$(elem).html()}</h2>`)); });

        // 目次生成 (h2, h3, h4)
        const toc: TocItem[] = [];
        $('h2, h3, h4').each((index, elem) => {
            const $elem = $(elem);
            const text = $elem.text();
            const id = `section-${index}`;
            $elem.attr('id', id);
            toc.push({
                id,
                text,
                name: $elem.prop('tagName')?.toLowerCase() || '',
            });
        });

        return { html: $.html(), toc };
    };

    const { html: processedHtml, toc } = processHtmlBody(dummyHtml);

    return (
        <div className="container max-w-[800px] mx-auto p-10">
            <h1 className="text-3xl font-bold mb-8">TOC Verification</h1>

            <TableOfContents toc={toc} />

            <ArticleBody
                className={`prose prose-indigo ${styles.prose} relative`}
                html={processedHtml}
            />
        </div>
    );
}
