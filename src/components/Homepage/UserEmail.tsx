"use client";

import { USER_API } from "@/constants/endpoints";
import { API_SERVER_BASE_URL } from "@/constants/environments";
import useSessionToken from "@/hooks/useSessionToken";
import { useEffect, useState } from "react";

const UserEmail = () => {
  const token = useSessionToken();
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setProfile({});
      setIsLoading(false);
      return;
    }

    const getProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_SERVER_BASE_URL}${USER_API.GET_USER_BY_TOKEN}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok && data?.data) {
          setProfile(data.data);
        } else {
          setProfile({});
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile({});
      }
      setIsLoading(false);
    };

    getProfile();
  }, [token]);

  return (
    <div>
      <div>User Profile:</div>
      <div>
        {isLoading ? (
          "Loading.."
        ) : (
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default UserEmail;
