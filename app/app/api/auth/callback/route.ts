export const runtime = "nodejs";

import { getSession } from "@/src/lib/session";
import { exchangeCodeForTokens, getMe } from "@/src/lib/spotify";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        // CSRF/state mismatch or missing code
        return NextResponse.redirect(new URL("/login?error=oauth_state", url));
    }

    try {
        // code -> tokens に交換
        const tokens = await exchangeCodeForTokens(code); // { accessToken, refreshToken, expiresAt }

        const me = await getMe(tokens.accessToken);

        // セッションにユーザー情報とトークンを保存
        const session = await getSession();
        session.user = {
            id: me.id,
            name: me.display_name ?? null,
            email: me.email ?? null,
            image: me.images?.[0]?.url ?? null,
        };
        session.tokens = tokens;
        await session.save();

        // state cookie は削除しておく
        (await
            // state cookie は削除しておく
            cookies()).delete("spotify_oauth_state");

        // 認証成功 → ダッシュボードへリダイレクト
        return NextResponse.redirect(new URL("/dashboard", url));
    } catch (err) {
        console.error("oauth callback error:", err);
        // 失敗したらログイン画面へ（クエリでエラー内容を渡してUIで表示しても良い）
        return NextResponse.redirect(new URL("/login?error=oauth_failed", url));
    }
}
