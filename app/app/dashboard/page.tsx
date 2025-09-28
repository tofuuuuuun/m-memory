"use client";

import type { Artist, CurrentTrack, TrackItem } from "@/src/type";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [recentTracks, setRecentTracks] = useState<TrackItem[]>([]);
    const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRecord = async (item: TrackItem) => {
        alert(`記録: ${item.track.name} by ${item.track.artists.map((a) => a.name).join(", ")}`);
        const res = await fetch("/api/spotify/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ trackId: item.track.id }),
        });
        if (res.ok) {
            alert("記録しました");
        }
    }

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            async function load() {
                try {
                    const recentRes = await fetch("/api/spotify/recent", { credentials: "include" });
                    const currentRes = await fetch("/api/spotify/current", { credentials: "include" });

                    if (recentRes.ok && currentRes.ok) {
                        const recentData = await recentRes.json();
                        const currentData = await currentRes.json();
                        setRecentTracks(recentData.items || []);
                        setCurrentTrack(currentData.item || null);
                        console.log("Recent Data:", recentData);
                    } else {
                        const errorData = await recentRes.json();
                        console.log("Error fetching tracks:", errorData);

                        if (errorData.error === "token_revoked" || recentRes.status === 401) {
                            setError("セッションの有効期限が切れました。再度ログインしてください。");
                            setTimeout(() => {
                                signOut({ callbackUrl: "/login?error=session_expired" });
                            }, 2000);
                            return;
                        }

                        setError(errorData.message || "データの取得に失敗しました");
                    }
                } catch (err) {
                    console.log("Error in load function:", err);
                    setError("サーバーとの通信に失敗しました");
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
            <h1>ダッシュボード</h1>
            <h2>現在再生中</h2>
            <ul>
                {currentTrack ?
                    <li>
                        {currentTrack.name} - {currentTrack.artists.map((a: Artist) => a.name).join(", ")}
                    </li>
                    : <li>再生中の曲はありません</li>}
            </ul>
            <h2>最近聞いた曲</h2>
            <ul>
                {recentTracks.map((item, i) => (
                    <li key={item.track.id + i}>
                        <Image src={item.track.album.images[1].url} alt={item.track.name} width={300} height={300} />
                        {item.track.name} - {item.track.artists.map((a: Artist) => a.name).join(", ")}
                        <button onClick={() => handleRecord(item)}>記録</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
