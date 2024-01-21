import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const AUTH_API_URL = process.env.NEXT_PUBLIC_BACKEND ?? "";
const getTokenWithCredentials = async ({ email, password }: any) => {
  const response = await fetch(`${AUTH_API_URL}/api/Login/user-login`, {
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
  const resp = await fetch(`${AUTH_API_URL}/api/Login/refresh-token`, {
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
  console.log(new Date(data?.jwtExpires).toUTCString());

  const payload = {
    accessToken: data?.jwtToken,
    accessTokenExpiresAt:
      new Date(data?.jwtExpires.slice(0, 19)).getTime() - 1 * 55 * 1000,
    refreshToken: data?.refreshToken,
    refreshTokenExpiresAt:
      new Date(data?.refreshExpires.slice(0, 19)).getTime() - 5 * 60 * 1000,
  };

  return payload;
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

            return { ...token, ...serverTokens };

          default:
            throw Error("Account or user is not valid");
        }
      }

      // Return previous token if the access token has not expired yet
      const now = Date.now();
      if (now < token.accessTokenExpiresAt) {
        return token;
      }

      // Access token has expired, try to update it
      if (now < token.refreshTokenExpiresAt) {
        try {
          const response = await getRefreshedTokens(token.refreshToken);
          const refreshedTokens = convertTokensFromResponse(response);

          return { ...token, ...refreshedTokens };
        } catch (_) {
          return token;
        }
      }

      throw Error("Tokens are expired or not valid");
    },
    async session({ session, token }: any) {
      session.token = token?.accessToken;
      session.user.email = token?.userEmail;

      return session;
    },
  },
};
