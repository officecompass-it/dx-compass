import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // セキュリティ: シークレットトークンで認証
  const authHeader = request.headers.get('x-authorization');
  const secret = process.env.REVALIDATE_SECRET_TOKEN;

  if (!secret) {
    console.error('❌ REVALIDATE_SECRET_TOKEN is not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${secret}`) {
    console.warn('⚠️ Unauthorized revalidation attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    console.log('📥 Webhook received:', JSON.stringify(body, null, 2));

    let api: string | undefined;
    let id: string | undefined;
    let slug: string | undefined;

    if (body.type) {
      api = body.type;
      id = body.id;
      slug = body.slug;
    } else if (body.contents) {
      const content = body.contents.new?.publishValue || body.contents.old?.publishValue || body.contents.new || body.contents.old;
      api = body.api;
      id = content?.id || body.id;
      slug = content?.slug;
    } else {
      api = body.api;
      id = body.id;
      slug = body.slug;
    }

    if (!api) {
      console.error('❌ Missing api field in webhook payload');
      return NextResponse.json(
        { error: 'Invalid payload: missing api field' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing revalidation:', { api, id, slug });

    // APIの種類に応じて処理
    switch (api) {
      case 'posts':
      case 'article':
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('articles');
        if (slug) {
          // @ts-expect-error Expected 2 arguments, but got 1.
          revalidateTag(`article-${slug}`);
          revalidatePath(`/posts/${slug}`);
          console.log(`✅ Article revalidated: /posts/${slug}`);
        } else if (id) {
          // @ts-expect-error Expected 2 arguments, but got 1.
          revalidateTag(`article-${id}`);
          console.log(`✅ Article revalidated by ID: ${id}`);
        }
        revalidatePath('/');
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('categories');
        console.log('✅ Articles and related pages revalidated');
        break;

      case 'categories':
      case 'category':
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('categories');
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('articles');
        if (id) {
          // @ts-expect-error Expected 2 arguments, but got 1.
          revalidateTag(`category-${id}`);
          // @ts-expect-error Expected 2 arguments, but got 1.
          revalidateTag(`category-posts-${id}`);
        }
        if (slug) {
          revalidatePath(`/category/${slug}`);
          console.log(`✅ Category revalidated: /category/${slug}`);
        }
        revalidatePath('/');
        console.log('✅ Categories and related pages revalidated');
        break;

      case 'tags':
      case 'tag':
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('tags');
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('articles');
        revalidatePath('/');
        console.log('✅ Tags and related pages revalidated');
        break;

      case 'all':
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('articles');
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('categories');
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('tags');
        // @ts-expect-error Expected 2 arguments, but got 1.
        revalidateTag('profile');
        revalidatePath('/');
        console.log('✅ All caches revalidated');
        break;

      default:
        console.warn(`⚠️ Unknown api type: ${api}`);
        return NextResponse.json(
          { error: `Unknown api type: ${api}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      api,
      id,
      slug,
    });
  } catch (error) {
    console.error('❌ Revalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// テスト用GETエンドポイント
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const type = searchParams.get('type') || 'all';

  if (secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // POSTと同じロジックを呼び出す
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: {
      'x-authorization': `Bearer ${secret}`, // ヘッダー名を 'x-authorization' に修正
      'content-type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });

  return POST(mockRequest as NextRequest);
}