import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Auth configuration that's Edge-compatible (no Node.js-only modules like bcrypt or Prisma)
// This is used only for middleware - the full auth with callbacks is in auth.ts
export const { auth } = NextAuth({
  theme: {
    colorScheme: "light",
    brandColor: "#E04E4E",
    logo: "/horizontal.svg",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@student.smktelkom-mlg.sch.id",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      // Credentials authorize is handled in the main auth.ts
      authorize: async () => null,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      // token.role is already set by the main auth.ts during sign-in
      // Just pass it through as-is
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const redirectUrl = url.startsWith("/")
        ? new URL(url, baseUrl).toString()
        : url;
      return redirectUrl;
    },
  },
  secret: process.env.AUTH_SECRET,
});
