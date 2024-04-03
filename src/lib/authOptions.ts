import { AUTH_API } from "@/constants/endpoints";
import { API_SERVER_BASE_URL } from "@/constants/environments";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

//#region Internal Auth Server Operations
interface ICredentialResponse extends ILoginResponse {
  id: string;
}

const getTokenWithCredentials = async (
  credentials: Record<"email" | "password", string>
): Promise<ICredentialResponse> => {
  const response = await fetch(API_SERVER_BASE_URL + AUTH_API.SIGNIN_USER, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const {
    data: authenticatedUser,
    message,
  }: INetworkResponse<ICredentialResponse> = await response.json();

  if (!response.ok || !authenticatedUser) {
    throw new Error(message ?? "Failed to authenticate user");
  }

  authenticatedUser.id = authenticatedUser?.email;
  return authenticatedUser;
};

const getRefreshedTokens = async (
  refreshToken: string
): Promise<ICredentialResponse> => {
  const response = await fetch(
    API_SERVER_BASE_URL + AUTH_API.REFRESH_ACCESS_TOKEN,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    }
  );

  const {
    data: refreshedTokens,
    message,
  }: INetworkResponse<ICredentialResponse> = await response.json();

  if (!response.ok || !refreshedTokens) {
    throw new Error(message ?? "Failed to refresh token");
  }

  return refreshedTokens;
};

const convertTokensFromResponse = (data: ICredentialResponse): JWT => {
  const payload: JWT = {
    accessToken: data?.jwtToken,
    // accessTokenExpiresAt:
    //   new Date(data?.jwtExpires.slice(0, -1)).getTime() - 1 * 55 * 1000,
    accessTokenExpiresAt: new Date().getTime() + 10 * 1000,
    refreshToken: data?.refreshToken,
    refreshTokenExpiresAt:
      new Date(data?.refreshExpires.slice(0, -1)).getTime() - 5 * 60 * 1000,
  };

  if (data.email) payload.email = data.email;
  return payload;
};
//#endregion

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<ICredentialResponse | null> => {
        try {
          if (!credentials) throw credentials;
          return await getTokenWithCredentials(credentials);
        } catch (err: any) {
          console.log(err?.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Initial sign in
      if (account && user) {
        switch (account?.provider) {
          case "credentials":
            const serverTokens = convertTokensFromResponse(
              user as ICredentialResponse
            );

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

          console.log("Credential Refresh On: " + new Date().toLocaleString());
          return { ...token, ...refreshedTokens };
        } catch (_) {
          return token;
        }
      }

      throw Error("Tokens are expired or not valid");
    },
    session: async ({ session, token }) => {
      session.token = token?.accessToken;
      session.user.email = token?.email || "";

      return session;
    },
  },
};
