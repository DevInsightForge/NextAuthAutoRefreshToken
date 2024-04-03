"use client";

import useSessionToken from "@/hooks/useSessionToken";
import { signIn, signOut } from "next-auth/react";

const SigninButton = () => {
  const { token, loading } = useSessionToken();

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {token ? "Change account?" : "Not signed in"} <br />
          <button onClick={() => (token ? signOut() : signIn())}>
            Sign {token ? "Out" : "In"}
          </button>
        </>
      )}
    </div>
  );
};

export default SigninButton;
