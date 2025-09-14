import { getSession } from "@/src/lib/session";
import { fetchRecentlyPlayed } from "@/src/lib/spotify";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session.tokens?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const data = await fetchRecentlyPlayed(session.tokens.accessToken);
        return NextResponse.json(data);
    } catch (err) {
        console.error("recently played error:", err);
        return NextResponse.json({ error: "Failed to fetch recently played" }, { status: 500 });
    }
}
