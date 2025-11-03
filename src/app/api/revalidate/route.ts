import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Vercel環境変数の型定義
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET_TOKEN;

export async function POST(request: NextRequest) {
  // 認証チェック(大文字小文字両方に対応)
  const authHeader = request.headers.get('x-microcms-signature') || 
                     request.headers.get('x-authorization') ||
                     request.headers.get('X-Authorization');
  
  if (!REVALIDATE_SECRET) {
    console.error('❌ REVALIDATE_SECRET_TOKEN is not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Bearerトークンまたは直接トークンをチェック
  const token = authHeader?.replace('Bearer ', '');
  if (token !== REVALIDATE_SECRET) {
    console.warn('⚠️ Unauthorized revalidation attempt');
    console.warn('Received token:', token?.substring(0, 10) + '...');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body: any = await request.json();
    
    // Vercelログに詳細を出力
    console.log('📥 Webhook received at:', new Date().toISOString());
    console.log('📦 Payload:', JSON.stringify(body, null, 2));

    // microCMSのペイロード構造に対応
    let api = body.api;
    let id = body.id;
    let type = body.type;
    let contents = body.contents;

    // typeが "edit", "new", "delete" の場合は、apiをデフォルトで "posts" にする
    // 実際のペイロードを見て調整が必要
    if (!api && (type === 'edit' || type === 'new' || type === 'delete')) {
      console.warn('⚠️ api field is missing, attempting to infer from type:', type);
      // ペイロード全体をログに出力して確認
      console.log('Full payload keys:', Object.keys(body));
    }

    if (!api) {
      console.error('❌ Missing api field in webhook payload');
      console.error('Available fields:', Object.keys(body));
      return NextResponse.json(
        { error: 'Invalid payload: missing api field', receivedFields: Object.keys(body) },
        { status: 400 }
      );
    }

    // slugの取得（新規コンテンツまたは旧コンテンツから）
    const slug = contents?.new?.slug || contents?.old?.slug;

    console.log('🔄 Processing revalidation:', { 
      api, 
      id, 
      slug, 
      type 
    });

    // API種別ごとの再検証処理
    switch (api) {
      case 'posts':
        console.log('📝 Revalidating posts...');
        revalidateTag('articles', 'fetch');
        
        if (slug) {
          revalidateTag(`article-${slug}`, 'fetch');
          revalidatePath(`/posts/${slug}`, 'page');
          console.log(`✅ Article path revalidated: /posts/${slug}`);
        }
        
        if (id) {
          revalidateTag(`article-${id}`, 'fetch');
          console.log(`✅ Article tag revalidated: article-${id}`);
        }

        // トップページとカテゴリも更新
        revalidatePath('/', 'page');
        revalidateTag('categories', 'fetch');
        
        console.log('✅ Posts revalidation completed');
        break;

      case 'categories':
        console.log('📁 Revalidating categories...');
        revalidateTag('categories', 'fetch');
        revalidateTag('articles', 'fetch'); // 記事にカテゴリ情報が含まれるため
        
        if (id) {
          revalidateTag(`category-${id}`, 'fetch');
          revalidateTag(`category-posts-${id}`, 'fetch');
          console.log(`✅ Category tags revalidated: ${id}`);
        }
        
        if (slug) {
          revalidatePath(`/category/${slug}`, 'page');
          console.log(`✅ Category path revalidated: /category/${slug}`);
        }
        
        revalidatePath('/', 'page');
        console.log('✅ Categories revalidation completed');
        break;

      case 'tags':
        console.log('🏷️ Revalidating tags...');
        revalidateTag('tags', 'fetch');
        revalidateTag('articles', 'fetch'); // 記事にタグ情報が含まれるため
        revalidatePath('/', 'page');
        console.log('✅ Tags revalidation completed');
        break;

      case 'profile':
        console.log('👤 Revalidating profile...');
        revalidateTag('profile', 'fetch');
        revalidatePath('/', 'page');
        console.log('✅ Profile revalidation completed');
        break;

      default:
        console.warn(`⚠️ Unknown api type: ${api}`);
        console.log('Attempting fallback revalidation for all content');
        // 不明なAPIでも全体を再検証
        revalidateTag('articles', 'fetch');
        revalidateTag('categories', 'fetch');
        revalidateTag('tags', 'fetch');
        revalidatePath('/', 'page');
        console.log('✅ Fallback revalidation completed');
        break;
    }

    const response = {
      revalidated: true,
      timestamp: new Date().toISOString(),
      api,
      id,
      slug,
      type,
    };

    console.log('✨ Revalidation response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Revalidation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// テスト用GETエンドポイント（開発時のみ使用）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const api = searchParams.get('api') || 'posts';
  const id = searchParams.get('id') || 'test-id';
  const slug = searchParams.get('slug');

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🧪 Test revalidation request:', { api, id, slug });

  // テスト用のモックペイロード
  const mockPayload = {
    service: 'test-service',
    api,
    id,
    type: 'edit' as const,
    contents: slug ? {
      new: { id, slug }
    } : undefined,
  };

  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: {
      'x-authorization': `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(mockPayload),
  });

  return POST(mockRequest as NextRequest);
}

// Vercelのエッジランタイム設定
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';