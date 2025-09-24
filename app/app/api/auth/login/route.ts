// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
    const scope = "user-read-recently-played user-read-currently-playing";

    const authUrl = `https://accounts.spotify.com/authorize?` +
        new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope,
            redirect_uri: redirectUri,
        });

    return NextResponse.redirect(authUrl);
}
