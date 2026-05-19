import type { DefaultSession } from "next-auth";

type PitutorRole = "LEARNER" | "TUTOR" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: PitutorRole;
      roleSelected: boolean;
      institution?: string | null;
      major?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: PitutorRole;
    roleSelected?: boolean;
    institution?: string | null;
    major?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: PitutorRole;
    roleSelected?: boolean;
    institution?: string | null;
    major?: string | null;
  }
}
