"use client";

import Footer from "@/app/components/common/footer";
import Header from "@/app/components/layout/header";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        // URLからエラーパラメータを取得
        const error = searchParams.get("error");
        if (error === "session_expired") {
            setErrorMessage("セッションの有効期限が切れました。再度ログインしてください。");
        } else if (error === "OAuthCallback") {
            setErrorMessage("認証中にエラーが発生しました。再度お試しください。");
        }

        // 認証済みならダッシュボードへ
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router, searchParams]);

    const handleLogin = () => {
        // デバッグ情報
        console.log("Starting Spotify auth...");
        signIn("spotify", {
            callbackUrl: "/dashboard",
            redirect: true
        });
    };

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-center sm:text-left">アカウント連携</h1>

                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                            認証エラーが発生しました: {errorMessage}
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                            onClick={handleLogin}
                        >
                            Spotifyで連携する
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}