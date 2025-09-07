import Footer from "@/app/components/common/footer";
import Header from "@/app/components/layout/header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-center sm:text-left">サービス名</h1>
          <div>
            <p>適当にキャッチコピーを入れる</p>
          </div>
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/login"
          >
            Login
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
