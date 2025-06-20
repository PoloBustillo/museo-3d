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
          const response = await fetch(
            `${
              process.env.NEXTAUTH_URL
            }/api/usuarios/email/${encodeURIComponent(
              credentials.email
            )}?includePassword=true`
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const user = data.user;

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
          // Verificar si el usuario ya existe en nuestra BD
          const existingUserResponse = await fetch(
            `${
              process.env.NEXTAUTH_URL
            }/api/usuarios/email/${encodeURIComponent(user.email)}`
          );

          if (!existingUserResponse.ok) {
            // Usuario no existe en nuestra BD, crearlo
            console.log("🆕 Creando nuevo usuario OAuth en BD:", user.email);
            const userData = {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              image: user.image,
              emailVerified: new Date().toISOString(),
              password: null, // OAuth users don't have passwords
            };

            const createUserResponse = await fetch(
              `${process.env.NEXTAUTH_URL}/api/usuarios/oauth`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
              }
            );

            if (!createUserResponse.ok) {
              console.error("❌ Error creando usuario OAuth en BD");
              return false;
            }

            console.log("✅ Usuario OAuth creado en BD exitosamente");
          } else {
            console.log("👤 Usuario OAuth existente en BD");
          }
        } catch (error) {
          console.error("❌ Error en signIn callback:", error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      console.log("📋 Session callback:", { user: session.user?.email });

      if (token?.sub) session.user.id = token.sub;
      if (token?.picture) session.user.image = token.picture;
      if (token?.name) session.user.name = token.name;
      if (token?.provider) session.user.provider = token.provider;
      if (token?.accountType) session.user.accountType = token.accountType;

      // Agregar roles y settings a la sesión
      if (session.user?.email) {
        try {
          console.log("🔄 Fetching user data for session:", session.user.email);
          const userResponse = await fetch(
            `${
              process.env.NEXTAUTH_URL
            }/api/usuarios/email/${encodeURIComponent(session.user.email)}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("📊 User data from backend:", userData);
            if (userData.user) {
              console.log("🔄 Updating session with backend data:");
              console.log("  - Old name:", session.user.name);
              console.log("  - New name:", userData.user.name);
              console.log("  - Old image:", session.user.image);
              console.log("  - New image:", userData.user.image);

              session.user.role = userData.user.role;
              session.user.settings = userData.user.settings || {};
              session.user.name = userData.user.name;
              session.user.image = userData.user.image;

              console.log("✅ Session updated successfully");
            }
          } else {
            console.error("❌ Failed to fetch user data:", userResponse.status);
          }
        } catch (e) {
          console.error("Error obteniendo roles/settings para la sesión:", e);
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        console.log("🎫 JWT callback - new user:", {
          email: user.email,
          provider: account?.provider,
          image: user.image,
        });

        token.picture = user.image;
        token.name = user.name;
        token.provider = account?.provider || "credentials";
        token.accountType = account?.type || "credentials";

        if (account?.provider === "credentials") {
          token.sub = user.id;
        } else {
          try {
            const userResponse = await fetch(
              `${
                process.env.NEXTAUTH_URL
              }/api/usuarios/email/${encodeURIComponent(user.email)}`
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.user && userData.user.id) {
                token.sub = userData.user.id.toString();
              } else {
                console.error("❌ User data not found in response:", userData);
              }
            }
          } catch (error) {
            console.error("❌ Error obteniendo ID de usuario:", error);
          }
        }
      }
      // Soporte para actualización de sesión
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
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
