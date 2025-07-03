import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
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

      // Para usuarios de Google, NextAuth creará automáticamente el Account
      // Solo necesitamos verificar que el usuario exista en nuestra BD
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Error en signIn de Google:", error);
          return false; // Evita el inicio de sesión si hay un error
        }
      }
      return true; // Permitir siempre el inicio de sesión para 'credentials'
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.role) {
        session.user.role = token.role;
      }
      if (token?.name) {
        session.user.name = token.name;
      }
      if (token?.picture) {
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
      }
      // Siempre refrescar el rol desde la base de datos
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, email: true, id: true },
        });
        console.log("🔍 JWT callback DB user:", dbUser);
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      // Soporte para actualización de sesión (ej. update de perfil)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (token.sub) {
          await prisma.user.update({
            where: { id: token.sub },
            data: {
              name: session.name,
              image: session.image,
            },
          });
        }
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn(message) {
      console.log("✅ User signed in:", message.user?.email);
    },
    async signOut(message) {
      console.log("👋 User signed out:", message.token?.email || "unknown");
    },
    async createUser(message) {
      console.log("👤 New user created:", message.user?.email);
    },
    async session(message) {
      console.log("📱 Session active:", message.session?.user?.email);
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
};
