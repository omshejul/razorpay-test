import GoogleProvider from "next-auth/providers/google";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt: async ({ token, account }: any) => {
      // Persist the OAuth access_token to the token right after signin
      if (account && typeof account === "object" && "access_token" in account) {
        token.accessToken = (account as { access_token: string }).access_token;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: async ({ session }: any) => {
      // Send properties to the client
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
