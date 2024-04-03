import {
  IUserCredential,
  authenticateUser,
  updateTokenWithNewData,
} from "@/lib/authUtilities";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        return await authenticateUser(credentials).catch(() => null);
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account && user) {
        if (account?.provider === "credentials") {
          return updateTokenWithNewData(token, user as IUserCredential);
        } else {
          throw Error("Account or user is not valid");
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.token = token?.accessToken;
      session.user.email = token?.email || "";
      return session;
    },
  },
});

export { handler as GET, handler as POST };
