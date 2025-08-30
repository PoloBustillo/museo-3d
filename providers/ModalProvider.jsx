"use client";
import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); 
  const [modalData, setModalData] = useState(null); 

  const openModal = (modalName, data = null) => {
    setModal(modalName);
    setModalData(data);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModal(null);
    setModalData(null);
    document.body.style.overflow = "unset";
  };

  const isModalOpen = (modalName) => modal === modalName;

  return (
    <ModalContext.Provider
      value={{
        modal,
        modalData,
        openModal,
        closeModal,
        isModalOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal debe ser usado dentro de un ModalProvider");
  }
  return context;
};
