import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    token: string;
    user: {
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string;
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }
}
