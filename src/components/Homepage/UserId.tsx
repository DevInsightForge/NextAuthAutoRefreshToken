"use client";

import useUser from "@/hooks/useUser";

const UserId = () => {
  const { user, userLoading, session } = useUser();

  return (
    <div>User Id: {userLoading ? "Loading..." : user?.userId || session}</div>
  );
};

export default UserId;
