import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
// Prisma singleton para evitar problemas de conexión en desarrollo
import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Exporta las opciones por separado
export const authOptions = {
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
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async jwt({ token, user }) {
      // Si es la primera vez (login), busca el usuario en la base de datos y agrega el rol
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        token.role = dbUser?.role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      // Pasa el rol del token a la sesión
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async signIn(message) {
      Sentry.captureMessage("Nuevo login", { level: "info", extra: message });
    },
    async signOut(message) {
      Sentry.captureMessage("Logout", { level: "info", extra: message });
    },
    async error(message) {
      Sentry.captureException(new Error("NextAuth error"), { extra: message });
    },
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("❌ NextAuth Error:", code, metadata);
      Sentry.captureException(new Error(code), { extra: metadata });
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("🐛 NextAuth Debug:", code, metadata);
    },
  },
};

// Exporta los handlers para el app router
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
