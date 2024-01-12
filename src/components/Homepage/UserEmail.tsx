"use client";

import { useSession } from "next-auth/react";

const UserEmail = () => {
  const { data, status } = useSession();
  const isLoading = status === "loading";

  return <div>User Email: {isLoading ? "Loading..." : data?.user?.email}</div>;
};

export default UserEmail;
