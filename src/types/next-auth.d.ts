import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAnonymous: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isAnonymous?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAnonymous?: boolean;
  }
}
