import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { authenticateCredentials } from "@/services/auth/account-service";
import { loginSchema } from "@/services/auth/schemas";

const providers = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const user = await authenticateCredentials(
        parsed.data.email,
        parsed.data.password,
      );

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
      };
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          // Links OAuth to an existing email account. Prefer verified emails in production;
          // revisit when email verification is enforced end-to-end.
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...(process.env.APPLE_ID && process.env.APPLE_SECRET
    ? [
        Apple({
          clientId: process.env.APPLE_ID,
          clientSecret: process.env.APPLE_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  trustHost: true,
});
