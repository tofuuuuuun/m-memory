"use client";

import type { Artist, TrackItem } from "@/src/type";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { status } = useSession();
    const [tracks, setTracks] = useState<TrackItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        // 認証されていない場合はログインページへリダイレクト
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            async function load() {
                console.log("Fetching recent tracks...");
                // Cookieの状態を確認
                console.log("Document cookies:", document.cookie); // 注意: httpOnlyのCookieは見えません

                const res = await fetch("/api/spotify/recent", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                });
                console.log("Response status:", res.status);

                if (res.ok) {
                    const data = await res.json();
                    setTracks(data.items || []);
                } else {
                    console.log("Failed to fetch tracks:", await res.text());
                }
            }
            load();
        }
    }, [status, router]);

    if (status === "loading") {
        return <div>読み込み中...</div>;
    }

    return (
        <div>
            <h1>最近聞いた曲</h1>
            <ul>
                {tracks.map((item, i) => (
                    <li key={i}>
                        {item.track.name} - {item.track.artists.map((a: Artist) => a.name).join(", ")}
                    </li>
                ))}
            </ul>
        </div>
    );
}
