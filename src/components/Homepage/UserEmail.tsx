"use client";

import { USER_API } from "@/constants/endpoints";
import { API_SERVER_BASE_URL } from "@/constants/environments";
import useSessionToken from "@/hooks/useSessionToken";
import { useEffect, useState } from "react";

const UserEmail = () => {
  const { token, user, loading } = useSessionToken();
  const [profile, setProfile] = useState({});


  useEffect(() => {
    const getProfile = async () => {
      const res = await fetch(
        API_SERVER_BASE_URL + USER_API.GET_USER_BY_TOKEN,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await res.json();
      if (res?.ok && !!response?.data) {
        setProfile(response?.data);
      }
    };

    if (token) {
      getProfile();
    }

    return () => {
      setProfile({});
    };
  }, [token]);

  return (
    <div>
      <div>User Email: {loading ? "Loading..." : user?.email}</div>
      <div>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default UserEmail;
