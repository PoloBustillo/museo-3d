"use client";
import { createContext, useContext, useState } from "react";
const ModalContext = createContext();
export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); // e.g. 'login', 'register', etc.
  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      {children}
    </ModalContext.Provider>
  );
}
export const useModal = () => useContext(ModalContext);
