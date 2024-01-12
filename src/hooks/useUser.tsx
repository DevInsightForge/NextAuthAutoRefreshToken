import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useUser = () => {
  const session: any = useSession();
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllSpaces = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          "http://localhost:5006/api/Authentication/GetTokenUser",
          {
            headers: {
              Authorization: `Bearer ${session.data?.token}`,
            },
          }
        );

        const data = await response.json();

        setProfile(data);
      } catch (error) {}

      setIsLoading(false);
    };

    if (session.data?.token) {
      fetchAllSpaces();
    } else {
      setIsLoading(false);
    }

    return () => {
      setProfile({});
    };
  }, [session.data?.token]);

  return {
    user: profile,
    userLoading: isLoading,
    session: session?.status,
  };
};

export default useUser;
