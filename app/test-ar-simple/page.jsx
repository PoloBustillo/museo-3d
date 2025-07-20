"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Importar ARExperience dinámicamente para evitar problemas de SSR
const ARExperience = dynamic(() => import("../../components/ar/ARExperience"), {
  ssr: false,
});

export default function TestARSimplePage() {
  const [showAR, setShowAR] = useState(false);
  const [logs, setLogs] = useState([]);

  // Interceptar console.log para mostrar logs en la página
  const addLog = (type, ...args) => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");

    setLogs((prev) => [
      ...prev.slice(-20),
      { type, message, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  // Sobrescribir console methods
  if (typeof window !== "undefined") {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      addLog("log", ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog("error", ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog("warn", ...args);
    };
  }

  // URL de un modelo 3D que sabemos que funciona
  const testModelUrl =
    "https://res.cloudinary.com/daol1ohso/raw/upload/v1752871063/modelos3d/modelo_mural_22_1752871061895.glb";

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Prueba AR Simple</h1>
      <p>Página de prueba sin dependencias de base de datos</p>

      <div
        style={{
          margin: "20px 0",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            console.log("🔘 Botón Iniciar AR clickeado");
            setShowAR(true);
          }}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🚀 Iniciar AR
        </button>

        <button
          onClick={() => {
            console.log("🧪 Test log desde botón");
            console.error("❌ Test error desde botón");
            console.warn("⚠️ Test warning desde botón");
          }}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🧪 Test Logs
        </button>

        <button
          onClick={() => setLogs([])}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🗑️ Limpiar Logs
        </button>

        {/* Botón de prueba para verificar si el botón AR se crea */}
        <button
          onClick={() => {
            // Crear un botón de prueba manualmente
            const testButton = document.createElement('button');
            testButton.textContent = "🧪 Botón de Prueba";
            testButton.style.position = "fixed";
            testButton.style.bottom = "200px";
            testButton.style.right = "20px";
            testButton.style.left = "20px";
            testButton.style.padding = "20px 30px";
            testButton.style.background = "linear-gradient(135deg, #ff0000, #ff6600)";
            testButton.style.color = "white";
            testButton.style.border = "3px solid #fff";
            testButton.style.borderRadius = "15px";
            testButton.style.fontSize = "20px";
            testButton.style.fontWeight = "bold";
            testButton.style.zIndex = "999999";
            testButton.style.cursor = "pointer";
            testButton.onclick = () => {
              alert("¡Botón de prueba funciona!");
              document.body.removeChild(testButton);
            };
            document.body.appendChild(testButton);
            console.log("🧪 Botón de prueba creado manualmente");
          }}
          style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🧪 Crear Botón de Prueba
        </button>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div>
          <h3>📱 Información:</h3>
          <ul>
            <li>
              <strong>URL:</strong> http://192.168.68.113:3000/test-ar-simple
            </li>
            <li>
              <strong>Modelo:</strong> {testModelUrl}
            </li>
            <li>
              <strong>Estado AR:</strong> {showAR ? "🟢 ACTIVO" : "🔴 INACTIVO"}
            </li>
            <li>
              <strong>WebXR:</strong>{" "}
              {typeof window !== "undefined" && navigator.xr
                ? "Disponible"
                : "No disponible"}
            </li>
          </ul>

          <h3>📋 Instrucciones:</h3>
          <ol>
            <li>
              Haz clic en "🧪 Test Logs" para verificar que los logs funcionan
            </li>
            <li>Haz clic en "🚀 Iniciar AR" para probar AR</li>
            <li>Observa los logs que aparecen a la derecha</li>
            <li>Si hay errores, compártelos conmigo</li>
          </ol>
        </div>

        <div>
          <h3>📋 Logs en tiempo real:</h3>
          <div
            style={{
              background: "#1e1e1e",
              color: "#fff",
              padding: "10px",
              borderRadius: "8px",
              height: "400px",
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {logs.length === 0 ? (
              <p style={{ color: "#888" }}>
                No hay logs aún. Haz clic en "🧪 Test Logs" para comenzar.
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "5px",
                    color:
                      log.type === "error"
                        ? "#ff6b6b"
                        : log.type === "warn"
                          ? "#ffd93d"
                          : "#4ecdc4",
                  }}
                >
                  <span style={{ color: "#888" }}>[{log.timestamp}]</span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAR && (
        <ARExperience
          modelUrl={testModelUrl}
          onClose={() => {
            console.log("🔙 Cerrando AR");
            setShowAR(false);
          }}
          showCloseButton={true}
          restoreMaterials={false}
        />
      )}
    </div>
  );
}
