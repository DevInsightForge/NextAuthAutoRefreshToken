"use client";

import useUser from "@/hooks/useUser";

const UserId = () => {
  const { user, userLoading } = useUser();

  return <div>User Id: {userLoading ? "Loading..." : user?.userId}</div>;
};

export default UserId;
