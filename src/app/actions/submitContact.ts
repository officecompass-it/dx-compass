'use server';

import { createClient } from 'microcms-js-sdk';
import { z } from 'zod';

// 入力データの検証ルール (Zodスキーマ)
const schema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  // 件名の選択必須チェック
  subject: z.string().min(1, '件名を選択してください'),
  message: z.string().min(10, 'お問い合わせ内容は10文字以上で入力してください'),
  newsletter: z.boolean(),
  // プライバシーポリシー同意の必須チェック (trueのみ許可)
  privacy: z.boolean().refine((val) => val === true, {
    message: 'プライバシーポリシーへの同意が必要です',
  }),
});

export type ContactState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
    privacy?: string[];
  };
};

export async function submitContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
  // 書き込み専用のクライアントを作成
  const writeClient = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_WRITE_API_KEY || '', // 書き込み権限のあるキーを使用
  });

  // フォームデータの取得と型変換
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    // チェックボックスはチェックされていると "on" という文字列が送られるため boolean に変換
    newsletter: formData.get('newsletter') === 'on',
    privacy: formData.get('privacy') === 'on',
  };

  // バリデーション実行
  const validatedFields = schema.safeParse(rawData);

  // バリデーションエラーがある場合
  if (!validatedFields.success) {
    return {
      success: false,
      message: '入力内容に誤りがあります。',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }


  try {
  const dataToSend = validatedFields.data;
  
  console.log('▼送信前の全データ:', JSON.stringify(dataToSend, null, 2));
  console.log('▼subjectの型:', typeof dataToSend.subject);
  console.log('▼subjectの値:', dataToSend.subject);
  
  // microCMSへ送信 (POST)
  await writeClient.create({
    endpoint: 'contact',
    content: dataToSend,
  });

  return {
    success: true,
    message: 'お問い合わせを受け付けました。ありがとうございます。',
  };
} catch (error) {
  console.error('▼MicroCMS詳細エラー:', JSON.stringify(error, null, 2));
  if (error instanceof Error) {
    console.error('▼エラーメッセージ:', error.message);
  }
  return {
    success: false,
    message: '送信中にエラーが発生しました。しばらく経ってから再度お試しください。',
  };
}
}