"use client";
import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
const UserContext = createContext();
export function UserProvider({ children }) {
  const { data: session, status } = useSession();
  return (
    <UserContext.Provider value={{ user: session?.user, status }}>
      {children}
    </UserContext.Provider>
  );
}
export const useUser = () => useContext(UserContext);
