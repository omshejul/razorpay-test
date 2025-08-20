import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      // Persist the OAuth access_token to the token right after signin
      if (account && typeof account === "object" && "access_token" in account) {
        token.accessToken = (account as { access_token: string }).access_token;
      }
      return token;
    },
    async session({ session, _token, _user }: any) {
      // Send properties to the client
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
