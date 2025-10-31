import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api, id } = body.contents.new.publishValue || body.contents.old.publishValue;
  
  if (!api || !id) {
    return NextResponse.json({ message: 'Invalid body' }, { status: 400 });
  }

  // 記事ページ
  if (api === 'posts') {
    revalidatePath(`/posts/${id}`);
    revalidatePath('/'); // トップページも更新
    // カテゴリページも更新した方が良い場合がある
    // const categoryId = body.contents.new.publishValue?.category?.id;
    // if (categoryId) revalidatePath(`/category/${categoryId}`);
  }
  
  // 他のAPI（カテゴリなど）の更新にも対応可能
  if (api === 'categories') {
    revalidatePath(`/category/${id}`);
    revalidatePath('/');
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}