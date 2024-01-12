"use client";

import { SessionProvider, signIn, useSession } from "next-auth/react";
import { PropsWithChildren, useEffect } from "react";

const TokenRefreshEffectWrapper = ({ children }: PropsWithChildren) => {
  const { data: session }: any = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.log(session);

      signIn(); // Force sign in to hopefully resolve error
    }
  }, [session]);

  return children;
};

const NextAuthProvider = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <TokenRefreshEffectWrapper>{children}</TokenRefreshEffectWrapper>
    </SessionProvider>
  );
};

export default NextAuthProvider;
