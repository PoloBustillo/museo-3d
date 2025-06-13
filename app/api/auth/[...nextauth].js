import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftProvider from "next-auth/providers/microsoft";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_HERE",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_HERE",
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
