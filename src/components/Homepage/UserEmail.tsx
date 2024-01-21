"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const UserEmail = () => {
  const { data, status }: any = useSession();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const getProfile = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND ?? ""}/api/User/GetUserInfobyToken`,
        {
          headers: {
            Authorization: `Bearer ${data?.token}`,
          },
        }
      );

      const response = await res.json();
      if (res?.ok && !!response?.data) {
        setProfile(response?.data);
      }
    };

    if (data?.token) {
      getProfile();
    }

    return () => {
      setProfile({});
    };
  }, [data?.token]);

  const isLoading = status === "loading";

  return (
    <div>
      <div>User Email: {isLoading ? "Loading..." : data?.user?.email}</div>
      <div>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default UserEmail;
