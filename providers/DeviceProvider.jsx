"use client";
import { createContext, useContext, useEffect, useState } from "react";
const DeviceContext = createContext();
export function DeviceProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <DeviceContext.Provider value={{ isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
}
export const useDevice = () => useContext(DeviceContext);
