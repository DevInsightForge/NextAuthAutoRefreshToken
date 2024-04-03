"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useSessionToken = () => {
  const { data } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken((prev) =>
      data?.token && data.token !== prev ? data.token : prev
    );
  }, [data?.token]);

  return accessToken;
};

export default useSessionToken;
