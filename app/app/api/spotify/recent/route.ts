import { authOptions } from "@/src/lib/auth";
import { checkTokenExpiry, fetchRecentlyPlayed, refreshAccessToken } from "@/src/lib/spotify";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    // セッションからトークンを取得
    const session = await getServerSession(authOptions);

    console.log("Session in recent API:", {
        hasUser: !!session?.user,
        hasTokens: !!session?.tokens,
        // トークンの最初の10文字だけログ出力（セキュリティのため）
        accessTokenPreview: session?.tokens?.accessToken
            ? `${session.tokens.accessToken.substring(0, 10)}...`
            : null
    });

    if (session?.tokens?.expiresAt !== undefined && checkTokenExpiry(session.tokens.expiresAt)) {
        console.log("Token has expired");
    }

    // トークンがない場合は認証エラー
    if (!session?.tokens?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("line24:session:", session)

    try {
        // Spotify APIから最近聴いた曲を取得
        const data = await fetchRecentlyPlayed(session.tokens.accessToken);
        return NextResponse.json(data);
    } catch (err) {
        console.log("recently played error:", err);

        // エラーの詳細をログに出力
        if (err instanceof Error) {
            console.log("Error details:", err.message);

            // 401エラー（トークン期限切れ）の場合はリフレッシュを試みる
            if (err.message.includes("401") && session.tokens.refreshToken) {
                try {
                    console.log("Token expired, attempting to refresh...");
                    const newTokens = await refreshAccessToken(session.tokens.refreshToken);

                    // 新しいトークンでもう一度APIを呼び出す
                    const data = await fetchRecentlyPlayed(newTokens.accessToken);
                    return NextResponse.json(data);
                } catch (refreshErr) {
                    console.log("Failed to refresh token:", refreshErr);

                    // リフレッシュトークンが無効な場合は特別なエラーコードを返す
                    return NextResponse.json({
                        error: "token_revoked",
                        message: "認証の有効期限が切れました。再度ログインしてください。"
                    }, { status: 401 });
                }
            }
        }

        return NextResponse.json({ error: "Failed to fetch recently played" }, { status: 500 });
    }
}