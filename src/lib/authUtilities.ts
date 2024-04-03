import { AUTH_API } from "@/constants/endpoints";
import { API_SERVER_BASE_URL } from "@/constants/environments";
import { JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export interface IUserCredential extends ILoginResponse {
  id: string;
}

export const shouldUpdateToken = (token: JWT) =>
  Date.now() >= token.accessTokenExpiresAt - 30 * 1000;

export const updateSessionCookieOrRedirect = (
  sessionToken: string | null,
  request: NextRequest,
  response: NextResponse,
  maxAge: number = 0
) => {
  const cookieName = process.env.NEXTAUTH_URL?.startsWith("https://")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    maxAge: maxAge,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
};

export const updateTokenWithNewData = (token: JWT, data: IUserCredential) => ({
  ...token,
  email: data.email || token.email,
  accessToken: data.jwtToken,
  accessTokenExpiresAt: new Date(data.jwtExpires).getTime() - 5 * 60 * 1000,
  refreshToken: data.refreshToken,
  refreshTokenExpiresAt:
    new Date(data.refreshExpires).getTime() - 5 * 60 * 1000,
});

export const refreshAccessToken = async (token: JWT) => {
  const response = await fetch(
    `${API_SERVER_BASE_URL}${AUTH_API.REFRESH_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    }
  );

  if (!response.ok)
    throw new Error(`Token refresh failed with status: ${response.status}`);
  const { data } = await response.json();

  console.info("Refreshed token on: " + new Date().toLocaleString());
  return updateTokenWithNewData(token, data);
};

export const authenticateUser = async (
  credentials: Record<"email" | "password", string>
): Promise<IUserCredential> => {
  try {
    const response = await fetch(
      `${API_SERVER_BASE_URL}${AUTH_API.SIGNIN_USER}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }
    );

    const { data, message } = await response.json();
    if (!response.ok || !data)
      throw new Error(message ?? "Failed to authenticate user");
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
