"use client";
import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); // e.g. 'login', 'register', etc.
  const [modalData, setModalData] = useState(null); // Datos adicionales para el modal

  const openModal = (modalName, data = null) => {
    setModal(modalName);
    setModalData(data);
  };

  const closeModal = () => {
    setModal(null);
    setModalData(null);
  };

  const isModalOpen = (modalName) => {
    return modal === modalName;
  };

  return (
    <ModalContext.Provider
      value={{
        modal,
        modalData,
        setModal,
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
