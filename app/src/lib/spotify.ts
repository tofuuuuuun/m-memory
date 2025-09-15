import { Tokens } from "../type";

const clientId = process.env.SPOTIFY_CLIENT_ID as string;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI as string;

/**
 * 認可コードからトークンを取得
 */
export async function exchangeCodeForTokens(code: string): Promise<Tokens> {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || "Failed to exchange code");
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    };
}

/**
 * アクセストークンをリフレッシュ
 */
export async function refreshAccessToken(refreshToken: string): Promise<Tokens> {
    const basicAuth = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    });

    console.log("line58: Refresh token response status:", res.status);

    if (!res.ok) {
        const errorBody = await res.text();
        console.error("Token refresh failed:", errorBody);
        throw new Error(`Failed to refresh token: ${res.status}`);
    }

    const data = await res.json();

    // 新しいトークン情報を返す
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // リフレッシュトークンが返されない場合は古いものを使用
        expiresAt: Date.now() + data.expires_in * 1000,
    };
}

// アクセストークンを使った関数
export async function fetchRecentlyPlayed(accessToken: string) {
    console.log("Fetching recently played with token:", accessToken.substring(0, 10) + "...");

    const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        // 重要: レスポンスをクローンしてからエラー詳細を読み取る
        const errorClone = res.clone();

        try {
            const errorData = await errorClone.json();
            console.log("Spotify API error details:", errorData);
        } catch (e) {
            console.log("Failed to parse error response", e);
        }
    }

    // 正常時のみレスポンスボディを読み取る
    return res.json();
}

export async function getMe(accessToken: string) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Spotify API error: ${res.status}`);
    }

    return res.json();
}
