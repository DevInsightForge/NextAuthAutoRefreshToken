import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const AUTH_API_URL = "http://localhost:44304/api/Login";

const getTokenWithCredentials = async ({ email, password }: any) => {
  const response = await fetch(`${AUTH_API_URL}/user-login`, {
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

  if (!response.ok || !responseData?.data) {
    throw new Error("Failed to authenticate user");
  }

  return responseData?.data;
};

const getRefreshedTokens = async (refreshToken: string): Promise<any> => {
  const resp = await fetch(`${AUTH_API_URL}/refresh-token`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      refreshToken: refreshToken,
    }),
  });

  const response = await resp.json();

  if (!resp.ok || !response?.data) {
    throw response;
  }

  console.log("Credential Refresh On: " + new Date().toLocaleString());

  return response?.data;
};

const convertTokensFromResponse = (data: any) => {
  return {
    accessToken: data?.jwtToken,
    accessTokenExpiresAt:
      new Date(data?.jwtExpires.slice(0, 19)).getTime() - 1 * 40 * 1000,
    refreshToken: data?.refreshToken,
    refreshTokenExpiresAt:
      new Date(data?.refreshExpires.slice(0, 19)).getTime() - 5 * 60 * 1000,
  };
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
          return await getTokenWithCredentials(credentials);
        } catch (_) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      // Initial sign in
      if (account && user) {
        switch (account?.provider) {
          case "credentials":
            const serverTokens = convertTokensFromResponse(user);

            return Promise.resolve({ ...token, ...serverTokens });

          default:
            throw Error("Account or user is not valid");
        }
      }

      // Return previous token if the access token has not expired yet
      const now = Date.now();
      if (now < token.accessTokenExpiresAt) {
        return Promise.resolve(token);
      }

      // Access token has expired, try to update it
      if (now < token.refreshTokenExpiresAt) {
        try {
          const response = await getRefreshedTokens(token.refreshToken);
          const refreshedTokens = convertTokensFromResponse(response);

          return Promise.resolve({ ...token, ...refreshedTokens });
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
