import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
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

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credenciales",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "tu@email.com",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        try {
          // Buscar usuario por email
          const userResponse = await fetch(
            `${
              process.env.NEXTAUTH_URL
            }/api/usuarios/email/${encodeURIComponent(credentials.email)}`
          );

          if (!userResponse.ok) {
            console.log("👤 Usuario no encontrado:", credentials.email);
            throw new Error("Credenciales inválidas");
          }

          const user = await userResponse.json();

          // Verificar contraseña
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            console.log("🔐 Contraseña incorrecta para:", credentials.email);
            throw new Error("Credenciales inválidas");
          }

          console.log("✅ Login exitoso para:", credentials.email);

          // Retornar usuario sin contraseña
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Error en autorización:", error.message);
          throw new Error("Error en la autenticación");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "MICROSOFT_CLIENT_ID_HERE",
      clientSecret:
        process.env.MICROSOFT_CLIENT_SECRET || "MICROSOFT_CLIENT_SECRET_HERE",
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
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

      // Para proveedores OAuth (Google, Microsoft)
      if (account?.provider === "google" || account?.provider === "azure-ad") {
        try {
          // Verificar si el usuario ya existe
          const existingUserResponse = await fetch(
            `${
              process.env.NEXTAUTH_URL
            }/api/usuarios/email/${encodeURIComponent(user.email)}`
          );

          if (!existingUserResponse.ok) {
            // Usuario no existe, crearlo
            console.log("🆕 Creando nuevo usuario OAuth:", user.email);
            const userData = {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              image: user.image,
              emailVerified: new Date().toISOString(),
              password: null, // OAuth users don't have passwords
            };

            const createUserResponse = await fetch(
              `${process.env.NEXTAUTH_URL}/api/usuarios`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
              }
            );

            if (!createUserResponse.ok) {
              console.error("❌ Error creando usuario OAuth");
              return false;
            }

            console.log("✅ Usuario OAuth creado exitosamente");
          } else {
            console.log("👤 Usuario OAuth existente encontrado");
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

      // Agregar ID del usuario a la sesión
      if (token?.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log("🎫 JWT callback - new user:", {
          email: user.email,
          provider: account?.provider,
        });

        // Para usuarios de credenciales, el ID ya viene del authorize
        if (account?.provider === "credentials") {
          token.sub = user.id;
        } else {
          // Para OAuth, buscar el ID en la base de datos
          try {
            const userResponse = await fetch(
              `${
                process.env.NEXTAUTH_URL
              }/api/usuarios/email/${encodeURIComponent(user.email)}`
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              token.sub = userData.id.toString();
            }
          } catch (error) {
            console.error("❌ Error obteniendo ID de usuario:", error);
          }
        }
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
