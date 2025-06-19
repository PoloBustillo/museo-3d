import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // Puedes personalizar la ruta de login
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user, account, profile }) {
      return token;
    },
  },
  events: {
    async signIn(message) {},
    async signOut(message) {},
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("❌ NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("🐛 NextAuth Debug:", code, metadata);
    },
  },
});
