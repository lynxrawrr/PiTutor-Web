import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth.validation";

export type AppRole = "LEARNER" | "TUTOR" | "ADMIN";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  roleSelected: boolean;
  avatarUrl?: string;
  institution?: string;
  major?: string;
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: AppRole;
  roleSelected: boolean;
  institution?: string | null;
  major?: string | null;
};

function toAppRole(role: unknown): AppRole {
  return role === "TUTOR" || role === "ADMIN" ? role : "LEARNER";
}

function readCredential(
  credentials: Partial<Record<string, unknown>> | undefined,
  key: string,
) {
  const maybeFormData = credentials as
    | { get?: (name: string) => FormDataEntryValue | null }
    | undefined;

  if (typeof maybeFormData?.get === "function") {
    const value = maybeFormData.get(key);
    return typeof value === "string" ? value : "";
  }

  const value = credentials?.[key];
  return typeof value === "string" ? value : "";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email dan Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: readCredential(credentials, "email"),
          password: readCredential(credentials, "password"),
        });

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordValid = await compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          role: user.role,
          roleSelected: user.roleSelected,
          institution: user.institution,
          major: user.major,
        } satisfies AuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.id = authUser.id;
        token.role = authUser.role;
        token.roleSelected = authUser.roleSelected;
        token.institution = authUser.institution;
        token.major = authUser.major;
        token.picture = authUser.image;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.roleSelected = dbUser.roleSelected;
          token.institution = dbUser.institution;
          token.major = dbUser.major;
          token.picture = dbUser.avatarUrl;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = toAppRole(token.role);
        session.user.roleSelected = Boolean(token.roleSelected);
        session.user.institution =
          typeof token.institution === "string" ? token.institution : null;
        session.user.major = typeof token.major === "string" ? token.major : null;
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;
      }

      return session;
    },
  },
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  return {
    id: sessionUser.id,
    name: sessionUser.name ?? "Pengguna Pitutor",
    email: sessionUser.email,
    role: sessionUser.role,
    roleSelected: sessionUser.roleSelected,
    avatarUrl: sessionUser.image ?? undefined,
    institution: sessionUser.institution ?? undefined,
    major: sessionUser.major ?? undefined,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireRole(roles: AppRole[]) {
  const user = await requireUser();

  if (!user.roleSelected) {
    redirect("/onboarding");
  }

  if (!roles.includes(user.role)) {
    redirect(`/dashboard/${user.role.toLowerCase()}`);
  }

  return user;
}
