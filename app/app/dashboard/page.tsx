"use client";

import { useEffect, useState } from "react";

type Artist = {
    name: string;
};

type TrackItem = {
    track: {
        name: string;
        artists: Artist[];
    };
};

export default function DashboardPage() {
    const [tracks, setTracks] = useState<TrackItem[]>([]);

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/spotify/recent");
            if (res.ok) {
                const data = await res.json();
                setTracks(data.items || []);
            }
        }
        load();
    }, []);

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
