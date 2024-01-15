"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const UserEmail = () => {
  const { data, status }: any = useSession();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const getProfile = async () => {
      const res = await fetch(
        "http://localhost:44304/api/User/GetUserInfobyToken",
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
      <div>{JSON.stringify(profile)}</div>
    </div>
  );
};

export default UserEmail;
