import { NEXTAUTH_SECRET } from "@/constants/environments";
import { encode, getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import {
  refreshAccessToken,
  shouldUpdateToken,
  updateSessionCookieOrRedirect,
} from "./lib/authUtilities";

export const config = { matcher: "/((?!.*\\.|api\\/).*)" };

export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  const token = await getToken({ req: request });
  if (!token)
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  if (!shouldUpdateToken(token)) return response;

  try {
    const newToken = await refreshAccessToken(token);
    const newSessionToken = await encode({
      secret: NEXTAUTH_SECRET,
      token: newToken,
      maxAge: newToken.refreshTokenExpiresAt,
    });
    return updateSessionCookieOrRedirect(
      newSessionToken,
      request,
      response,
      newToken.refreshTokenExpiresAt
    );
  } catch (error) {
    console.error("Error refreshing token:", error);
    return updateSessionCookieOrRedirect(null, request, response);
  }
};
