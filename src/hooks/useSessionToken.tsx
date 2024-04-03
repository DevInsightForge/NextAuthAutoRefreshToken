"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useSessionToken = () => {
  const { data, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (data?.token) {
      setAccessToken(data.token);
    }

    return () => {
      setAccessToken(null);
    };
  }, [data?.token]);

  console.log(data);

  return {
    token: accessToken,
    user: data?.user,
    loading: status === "loading",
  };
};

export default useSessionToken;
