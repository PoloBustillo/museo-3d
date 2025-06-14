"use client";
import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = !!session;
  const user = session?.user;

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    session,
  };
}
