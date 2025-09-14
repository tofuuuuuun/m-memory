import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    tokens?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: number; // unix timestamp (ms)
    };
}

const sessionOptions = {
    password: process.env.SESSION_PASSWORD as string,
    cookieName: "spotify_app_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    },
};

// セッション取得ヘルパー
export async function getSession() {
    const cookieStore = cookies();
    return getIronSession<SessionData>(await cookieStore, sessionOptions);
}