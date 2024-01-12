"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const SigninButton = () => {
  const { data } = useSession();

  return (
    <div>
      {data ? (
        <>
          Change account? <br />
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
    </div>
  );
};

export default SigninButton;
