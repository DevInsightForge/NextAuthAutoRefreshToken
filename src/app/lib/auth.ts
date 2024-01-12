import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      "http://localhost:5006/api/Authentication/RefreshAccessToken",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          refreshToken: token?.refreshToken,
        }),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }
    console.log("RefreshedTokenOn: " + new Date().toLocaleString());

    return {
      ...token,
      ...refreshedTokens,
    };
  } catch (error) {
    return token;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const response = await fetch(
          "http://localhost:5006/api/Authentication/AuthenticateUser",
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          }
        );

        const tokens = await response.json();

        if (tokens) {
          return tokens;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user: serverTokens }: any) {
      // Initial sign in
      if (serverTokens) {
        // {
        //     accessToken,
        //     accessTokenExpiresAt,
        //     refreshToken,
        //     refreshTokenExpiresAt,
        //   }
        return serverTokens;
      }

      // Return previous token if the access token has not expired yet
      const now = Date.now();
      if (now < new Date(token.accessTokenExpiresAt).getTime() - 5 * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      if (now < new Date(token.refreshTokenExpiresAt).getTime() - 5 * 1000) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }: any) {
      session.token = token.accessToken;

      return session;
    },
  },
};
