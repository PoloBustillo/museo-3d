import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftProvider from "next-auth/providers/microsoft";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "247122211499-r0bic7uhm7t51q3ciifgdsrh1oibhjmc.apps.googleusercontent.com",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "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",
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
