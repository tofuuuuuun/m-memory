import { checkTokenExpiry, refreshAccessToken } from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "@/src/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    let newTokens = null;
    if (session?.tokens?.expiresAt !== undefined) {
        if (checkTokenExpiry(session.tokens.expiresAt)) {
            newTokens = await refreshAccessToken(session.tokens.refreshToken);
        }
    }

    if (!session?.tokens?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    try {
        const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${session?.tokens?.accessToken || newTokens?.accessToken}`,
            },
        });

        if (!res.ok) {
            const errorClone = res.clone();
            try {
                const errorData = await errorClone.json();
                console.log("Spotify API error details:", errorData);
            } catch (e) {
                console.log("Failed to parse error response", e);
            }
        }

        if (res.status === 204) {
            return NextResponse.json(null);
        }

        console.log("aaaaaaaaaaaaa", res)
        return NextResponse.json(await res.json());
    } catch (err) {
        if (err instanceof Error) {
            console.log("Error details:", err.message);

            // 401エラー（トークン期限切れ）の場合はリフレッシュを試みる
            if (err.message.includes("401") && session.tokens.refreshToken) {
                try {
                    // 新しいトークンでもう一度APIを呼び出す
                    const data = await fetch("/api/spotify/recent", { credentials: "include" });
                    return NextResponse.json(await data.json());
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