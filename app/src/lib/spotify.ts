import querystring from "querystring";

const clientId = process.env.SPOTIFY_CLIENT_ID as string;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI as string;

export type Tokens = {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
};

/**
 * 認可URL生成
 */
export function getSpotifyAuthUrl(state: string) {
    const scope = [
        "user-read-email",
        "user-read-private",
        "user-library-read",
        "playlist-read-private",
    ].join(" ");

    const params = querystring.stringify({
        response_type: "code",
        client_id: clientId,
        scope,
        redirect_uri: redirectUri,
        state,
    });

    return `https://accounts.spotify.com/authorize?${params}`;
}

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
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || "Failed to refresh token");
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken, // 新しいrefresh_tokenが来ない場合もある
        expiresAt: Date.now() + data.expires_in * 1000,
    };
}

/**
 * Spotify API: /me を取得
 */
export async function getMe(accessToken: string) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch profile from Spotify");
    }

    return res.json();
}
