import { authOptions } from "@/src/lib/auth";
import NextAuth from "next-auth";

console.log("NextAuth API Route initialized");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

// handler関数を作成し、GET/POSTメソッドとしてエクスポート
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
