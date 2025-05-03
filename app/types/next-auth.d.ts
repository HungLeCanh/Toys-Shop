/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email: string;
    role: "admin";
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      role: "admin";
    };
  }

  interface JWT {
    id: string;
    name?: string | null;
    email: string;
    role: "admin";
  }
}
