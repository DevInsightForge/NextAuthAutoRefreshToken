"use client";

import useUser from "@/hooks/useUser";

const UserEmail = () => {
  const { user, userLoading } = useUser();

  return <div>User Id: {userLoading ? "Loading..." : user?.email}</div>;
};

export default UserEmail;
