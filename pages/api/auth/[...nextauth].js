import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    // No OAuth providers configured. Remove Google provider per request.
    // Add other providers here if needed in future.
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
