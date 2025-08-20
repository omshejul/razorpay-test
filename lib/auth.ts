import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: unknown }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && typeof account === 'object' && 'access_token' in account) {
        token.accessToken = (account as { access_token: string }).access_token;
      }
      return token;
    },
    async session({ session }: { session: Session }) {
      // Send properties to the client
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
