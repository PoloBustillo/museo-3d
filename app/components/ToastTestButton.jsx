"use client";
import toast from "react-hot-toast";

export default function ToastTestButton() {
  return (
    <button
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 10000,
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "12px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        cursor: "pointer",
      }}
      onClick={() => toast.success("Toast global funcionando!")}
    >
      Probar Toast Global
    </button>
  );
}
