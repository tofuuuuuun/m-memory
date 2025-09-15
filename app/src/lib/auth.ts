import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID as string,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "user-read-recently-played user-read-currently-playing user-library-read",
                    redirect_uri: "http://127.0.0.1:3000/api/auth/callback/spotify"
                },
            },
        }),
    ],
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        async jwt({ token, account }) {
            // アクセストークンとリフレッシュトークンを保存
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({ session, token }) {
            // セッションにトークンを追加
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                },
                tokens: {
                    accessToken: token.accessToken as string,
                    refreshToken: token.refreshToken as string,
                    expiresAt: token.expiresAt as number,
                },
            };
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
};