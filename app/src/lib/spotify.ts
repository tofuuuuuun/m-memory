export async function fetchRecentlyPlayed(accessToken: string) {
    console.log("============================================================");
    console.log("Fetching recently played with token:", accessToken.substring(0, 10) + "...");
    console.log("============================================================");

    const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const errorClone = res.clone();

        try {
            const errorData = await errorClone.json();
            console.log("============================================================");
            console.log("Spotify API error details:", errorData);
            console.log("============================================================");
        } catch (e) {
            console.log("============================================================");
            console.log("Failed to parse error response", e);
            console.log("============================================================");
        }
    }

    return res.json();
}

export async function getMe(accessToken: string) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        console.log("============================================================");
        console.log("Failed to fetch user profile:", res.status, res.statusText);
        console.log("============================================================");
    }

    return res.json();
}
