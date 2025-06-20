import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Modal para seleccionar entre diferentes salas del museo
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSelectRoom - Función para seleccionar una sala
 * @param {Array} props.availableRooms - Array de salas disponibles
 * @param {number} props.currentRoom - Sala actual
 */
export function RoomSelectorModal({
  isOpen,
  onClose,
  onSelectRoom,
  availableRooms = [],
  currentRoom,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedType, setSelectedType] = useState("room"); // 'room' o 'cancel'

  // Filtrar salas disponibles (excluyendo la actual)
  const selectableRooms = availableRooms.filter(
    (room) => room.id !== currentRoom
  );

  // Total de opciones navegables (salas + botón cancelar)
  const totalOptions = selectableRooms.length + 1;

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(0);
      setSelectedType("room");
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newIndex = (selectedIndex + 1) % totalOptions;
        setSelectedIndex(newIndex);
        setSelectedType(newIndex < selectableRooms.length ? "room" : "cancel");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newIndex = (selectedIndex - 1 + totalOptions) % totalOptions;
        setSelectedIndex(newIndex);
        setSelectedType(newIndex < selectableRooms.length ? "room" : "cancel");
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedType === "cancel") {
          onClose();
        } else if (selectableRooms[selectedIndex]) {
          handleRoomSelect(selectableRooms[selectedIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    selectedIndex,
    selectedType,
    selectableRooms,
    totalOptions,
    onClose,
  ]);

  if (!isOpen) return null;

  const handleRoomSelect = (roomId) => {
    onSelectRoom(roomId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="motion-div-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(5px)",
            overflow: "visible !important",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              border: "3px solid #1a237e",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2
                style={{
                  margin: 0,
                  color: "#1a237e",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                🏛️ Seleccionar Sala
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "#666",
                  fontSize: "1.1rem",
                }}
              >
                {selectableRooms.length > 0
                  ? `${selectableRooms.length} salas disponibles para visitar`
                  : "No hay otras salas disponibles"}
              </p>
            </div>

            {/* Grid de salas */}
            {selectableRooms.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  marginBottom: "2rem",
                }}
              >
                {selectableRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "1.2rem",
                      borderRadius: "12px",
                      border:
                        selectedType === "room" && selectedIndex === index
                          ? "3px solid #4caf50"
                          : "2px solid #e0e0e0",
                      backgroundColor:
                        selectedType === "room" && selectedIndex === index
                          ? "#e8f5e8"
                          : "#f9f9f9",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      transition: "all 0.3s ease",
                      outline:
                        selectedType === "room" && selectedIndex === index
                          ? "2px solid #4caf50"
                          : "none",
                      outlineOffset: "2px",
                    }}
                    onClick={() => handleRoomSelect(room.id)}
                    onMouseEnter={() => {
                      setSelectedIndex(index);
                      setSelectedType("room");
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2rem",
                        minWidth: "50px",
                        textAlign: "center",
                      }}
                    >
                      {room.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          color: "#333",
                          fontSize: "1.2rem",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {room.name}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "#666",
                          fontSize: "0.95rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {room.descripcion || room.description}
                      </p>
                      {(room.cantidadMurales || room.artworkCount) && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#888",
                            fontStyle: "italic",
                          }}
                        >
                          {room.cantidadMurales || room.artworkCount} obras
                        </div>
                      )}
                    </div>
                    {selectedType === "room" && selectedIndex === index && (
                      <div
                        style={{
                          fontSize: "1.5rem",
                          color: "#4caf50",
                        }}
                      >
                        ▶
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#666",
                  marginBottom: "2rem",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏛️</div>
                <p style={{ fontSize: "1.1rem", margin: 0 }}>
                  Estás visitando la única sala disponible
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <button
                onClick={onClose}
                onMouseEnter={() => {
                  setSelectedIndex(selectableRooms.length);
                  setSelectedType("cancel");
                }}
                style={{
                  padding: "0.8rem 2rem",
                  borderRadius: "10px",
                  border:
                    selectedType === "cancel"
                      ? "3px solid #4caf50"
                      : "2px solid #666",
                  backgroundColor:
                    selectedType === "cancel" ? "#e8f5e8" : "transparent",
                  color: selectedType === "cancel" ? "#4caf50" : "#666",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  outline:
                    selectedType === "cancel" ? "2px solid #4caf50" : "none",
                  outlineOffset: "2px",
                }}
              >
                {selectedType === "cancel" ? "▶ Cancelar" : "Cancelar"}
              </button>
            </div>

            {/* Instrucciones */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#f0f4ff",
                borderRadius: "8px",
                border: "1px solid #c5cae9",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#3f51b5",
                  fontSize: "0.9rem",
                  lineHeight: 1.4,
                }}
              >
                🎮 <strong>Controles:</strong> ↑↓ para navegar • Enter para
                seleccionar • Esc para cerrar
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
