import { Tokens } from "@/src/type";
import NextAuth, { Account, Session } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const clientId = process.env.SPOTIFY_CLIENT_ID as string;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;

export const authOptions = ({
    providers: [
        SpotifyProvider({
            clientId: clientId,
            clientSecret: clientSecret,
            authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private,user-top-read,user-read-recently-played,user-read-currently-playing",
            token: "https://accounts.spotify.com/api/token",
            userinfo: "https://api.spotify.com/v1/me",
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account }: { token: Tokens; account?: Account | null }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            if (checkTokenExpiry(token.expiresAt)) {
                return token;
            } else {
                return await refreshAccessToken(token.refreshToken as string);
            }
        },

        async session({ session, token }: { session: Session; token: Tokens }) {
            // セッションにトークンを追加
            console.log("Session callback - adding tokens to session");
            return {
                ...session,
                user: {
                    ...session.user
                },
                tokens: {
                    accessToken: token.accessToken as string,
                    refreshToken: token.refreshToken as string,
                    expiresAt: token.expiresAt as number,
                },
            };
        },
    }
});

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);

/**
 * アクセストークンの有効期限をチェック
 */
export function checkTokenExpiry(expiresAt: number | undefined): boolean {
    if (typeof expiresAt !== "number") return false;
    const now = Date.now() / 1000;
    return now >= expiresAt;
}

/**
 * アクセストークンをリフレッシュ
 */
export async function refreshAccessToken(refreshToken: string): Promise<Tokens> {
    try {
        const url = "https://accounts.spotify.com/api/token";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const refreshTokens = await response.json();

        if (!response.ok) {
            throw refreshTokens
        }

        // 新しいトークン情報を返す
        return {
            accessToken: refreshTokens.access_token,
            refreshToken: refreshTokens.refresh_token || refreshToken,
            expiresAt: refreshTokens.expires_at ?? Date.now() + refreshTokens.expires_in * 1000,
        };
    } catch (error) {
        console.error("Error refreshing access token:", error);
        throw error;
    }
}
