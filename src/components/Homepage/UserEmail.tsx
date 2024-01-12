"use client";

import useUser from "@/hooks/useUser";

const UserEmail = () => {
  const { user, userLoading, session } = useUser();

  return (
    <div>User Email: {userLoading ? "Loading..." : user?.email || session}</div>
  );
};

export default UserEmail;
