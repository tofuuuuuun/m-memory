"use client";

import type { Artist, TrackItem } from "@/src/type";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [tracks, setTracks] = useState<TrackItem[]>([]);
    const [error, setError] = useState("");
    const router = useRouter();
    console.log("DashboardPage useEffect - status:", status);
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            async function load() {
                try {
                    const res = await fetch("/api/spotify/recent", { credentials: "include" });

                    if (res.ok) {
                        const data = await res.json();
                        setTracks(data.items || []);
                    } else {
                        const errorData = await res.json();
                        console.log("============================================================");
                        console.error("Error fetching tracks:", errorData);
                        console.log("============================================================");

                        if (errorData.error === "token_revoked" || res.status === 401) {
                            setError("セッションの有効期限が切れました。再度ログインしてください。");
                            setTimeout(() => {
                                signOut({ callbackUrl: "/login?error=session_expired" });
                            }, 2000);
                            return;
                        }

                        setError(errorData.message || "データの取得に失敗しました");
                    }
                } catch (err) {
                    console.error("Error in load function:", err);
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
