import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const AUTH_API_URL = "http://localhost:5006/api/Authentication";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
  });

const getTokenWithCredentials = async ({ email, password }: any) => {
  const response = await fetch(`${AUTH_API_URL}/AuthenticateUser`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const responseData = await response.json();

  if (!response.ok || !responseData) {
    throw new Error("Failed to authenticate user");
  }

  return responseData;
};

const getRefreshedTokens = async (
  refreshToken: string,
  provider: string
): Promise<any> => {
  switch (provider) {
    case "google":
      const url =
        GOOGLE_TOKEN_URL +
        new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID as string,
          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        });

      const googleResp = await fetch(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });

      const googleTokens = await googleResp.json();

      if (!googleResp.ok || !googleTokens) {
        throw googleTokens;
      }
      console.log("Google Refresh On: " + new Date().toLocaleString());

      return {
        accessToken: googleTokens.access_token,
        accessTokenExpiresAt: Date.now() + googleTokens.expires_in * 1000,
        refreshToken: googleTokens.refresh_token ?? refreshToken,
      };

    case "credentials":
      const credResp = await fetch(`${AUTH_API_URL}/RefreshAccessToken`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const credTokens = await credResp.json();

      if (!credResp.ok || !credTokens) {
        throw credTokens;
      }

      console.log("Credential Refresh On: " + new Date().toLocaleString());

      return {
        accessToken: credTokens?.accessToken,
        accessTokenExpiresAt: credTokens?.accessTokenExpiresAt,
        refreshToken: credTokens?.refreshToken,
        refreshTokenExpiresAt: credTokens?.refreshTokenExpiresAt,
      };

    default:
      throw provider;
  }
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const tokens = await getTokenWithCredentials(credentials);

          return {
            id: "null",
            email: credentials?.email,
            accessToken: tokens?.accessToken,
            accessTokenExpiresAt: tokens?.accessTokenExpiresAt,
            refreshToken: tokens?.refreshToken,
            refreshTokenExpiresAt: tokens?.refreshTokenExpiresAt,
          };
        } catch (_) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // authorization: GOOGLE_AUTHORIZATION_URL,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      // Initial sign in
      if (account && user) {
        switch (account?.provider) {
          case "google":
            return Promise.resolve({
              userEmail: user?.email,
              accessToken: account.access_token,
              accessTokenExpiresAt: Date.now() + 1 * 60 * 1000,
              refreshToken: account.refresh_token,
              refreshTokenExpiresAt: Date.now() + 5 * 60 * 60 * 1000,
              provider: account.provider,
            });

          case "credentials":
            return Promise.resolve({
              userEmail: user?.email,
              accessToken: user?.accessToken,
              accessTokenExpiresAt: user?.accessTokenExpiresAt,
              refreshToken: user?.refreshToken,
              refreshTokenExpiresAt: user?.refreshTokenExpiresAt,
              provider: account.provider,
            });

          default:
            throw Error("Account or user is not valid");
        }
      }

      // Return previous token if the access token has not expired yet
      const now = Date.now();
      if (
        now <
        new Date(token.accessTokenExpiresAt).getTime() - 1 * 30 * 1000
      ) {
        return Promise.resolve(token);
      }

      // Access token has expired, try to update it
      if (
        now <
        new Date(token.refreshTokenExpiresAt).getTime() - 5 * 60 * 1000
      ) {
        try {
          const newTokens = await getRefreshedTokens(
            token.refreshToken,
            token.provider
          );

          return Promise.resolve({ ...token, ...newTokens });
        } catch (_) {
          return Promise.resolve(token);
        }
      }

      throw Error("Tokens are expired or not valid");
    },
    async session({ session, token }: any) {
      session.token = token?.accessToken;
      session.user.email = token?.userEmail;

      return Promise.resolve(session);
    },
  },
};
