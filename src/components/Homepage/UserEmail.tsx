import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const UserEmail = () => {
  const session: any = useSession();
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    const fetchAllSpaces = async () => {
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
    };

    if (session.data?.token) {
      fetchAllSpaces();
    }

    return () => {
      setProfile({});
    };
  }, [session.data?.token]);

  return <div>User Email: {profile?.email}</div>;
};

export default UserEmail;
