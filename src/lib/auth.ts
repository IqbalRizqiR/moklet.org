import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { Roles } from "@/types/enums";

import { findUser, createUser, updateUser } from "@/utils/database/user.query";
import { compareHash } from "@/utils/encryption";

import prisma from "./prisma";

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Roles;
      name: string;
      user_pic: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Roles;
    name: string;
    user_pic: string;
    email: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Roles;
    name: string;
    user_pic: string;
    email: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      async authorize(credentials) {
        try {
          const foundUser = await prisma.user.findUnique({
            where: { email: credentials?.email as string },
            include: { userAuth: true },
          });
          if (!foundUser) return null;

          const comparePassword = compareHash(
            credentials?.password as string,
            foundUser.userAuth?.password as string,
          );

          if (!comparePassword) return null;

          const user = {
            id: foundUser.id,
            role: foundUser.role,
            name: foundUser.name,
            email: foundUser.email,
            user_pic: foundUser.user_pic,
          };
          return user;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const redirectUrl = url.startsWith("/")
        ? new URL(url, baseUrl).toString()
        : url;
      return redirectUrl;
    },
    async signIn({ user, profile, account }) {
      if (
        account?.provider == "google" &&
        !profile?.email?.endsWith("smktelkom-mlg.sch.id")
      )
        return false;
      if (user.email) {
        const userdb = await findUser({ email: user.email });
        if (!userdb) {
          await createUser({
            email: user.email,
            name: user.name || "",
            user_pic:
              user.image ||
              "https://res.cloudinary.com/mokletorg/image/upload/v1710992405/user.svg",
            userAuth: {
              create: {
                last_login: new Date(),
              },
            },
          });
        } else {
          await updateUser(
            { id: userdb.id },
            {
              user_pic: user.image ?? undefined,
              userAuth: { update: { last_login: new Date() } },
            },
          );
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const userdb = await findUser({ email: user.email });
        if (!userdb) return token;
        token.id = userdb?.id;
        token.role = userdb?.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        const userdb = await findUser({ id: token.id as string });
        session.user.role = userdb?.role || "Guest";
        session.user.user_pic = userdb?.user_pic as string;
        session.user.name = userdb?.name as string;
        session.user.email = userdb?.email as string;
        session.user.id = userdb?.id as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
