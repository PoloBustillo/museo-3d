import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

console.log("🔧 Loading NextAuth configuration...");

// Verificar variables de entorno
console.log("🔍 Environment variables check:");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log(
  "NEXTAUTH_SECRET:",
  process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set"
);
console.log(
  "GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Not set"
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Not set"
);

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
      console.log("🔐 SignIn callback:", {
        user: user.email,
        provider: account?.provider,
      });
      return true;
    },
    async session({ session, token }) {
      console.log("📋 Session callback:", { user: session.user?.email });
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        console.log("🎫 JWT callback - new user:", {
          email: user.email,
          provider: account?.provider,
        });
      }
      return token;
    },
  },
  events: {
    async signIn(message) {
      console.log("✅ User signed in:", message.user?.email);
    },
    async signOut(message) {
      console.log("👋 User signed out:", message.token?.email || "unknown");
    },
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
