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
