import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// このAPIルートは開発環境またはテスト環境でのみ動作させる
export async function POST(request: Request) {
    // 本番環境ではこのAPIを無効化する
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Auth.js v5のデフォルトCookie名 (auth.tsの設定に合わせる)
    const cookieName = '__Secure-authjs.session-token'; 

    try {

        // 3. セッションCookieをブラウザに設定する
        (await cookies()).set(cookieName, "test", {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('E2E login failed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create session' },
            { status: 500 }
        );
    }
}