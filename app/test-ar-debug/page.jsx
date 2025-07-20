"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importar ARExperience dinámicamente
const ARExperience = dynamic(() => import("../../components/ar/ARExperience"), {
  ssr: false,
});

export default function TestARDebugPage() {
  const [buttonCount, setButtonCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [showAR, setShowAR] = useState(false);

  // URL de un modelo 3D de prueba
  const testModelUrl =
    "https://res.cloudinary.com/daol1ohso/raw/upload/v1752871063/modelos3d/modelo_mural_22_1752871061895.glb";

  // Función para agregar logs
  const addLog = (type, message) => {
    setLogs(prev => [
      ...prev.slice(-10), // Mantener solo los últimos 10 logs
      { type, message, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  // Sobrescribir console methods para capturar logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      addLog("log", args.join(" "));
    };

    console.error = (...args) => {
      originalError(...args);
      addLog("error", args.join(" "));
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog("warn", args.join(" "));
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Crear botones de prueba cuando la página se carga
  useEffect(() => {
    console.log("🚨 Página de debug AR cargada");
    
    const buttons = [];
    
    // Botón 1: Botón estático en JSX
    console.log("🚨 Botón 1 creado (JSX estático)");
    
    // Botón 2: Botón dinámico simple
    const button2 = document.createElement('button');
    button2.textContent = "🚨 BOTÓN 2 (DOM)";
    button2.style.position = "fixed";
    button2.style.top = "100px";
    button2.style.left = "20px";
    button2.style.padding = "15px 25px";
    button2.style.background = "linear-gradient(135deg, #ff0000, #ff6600)";
    button2.style.color = "white";
    button2.style.border = "3px solid #000";
    button2.style.borderRadius = "10px";
    button2.style.fontSize = "18px";
    button2.style.fontWeight = "bold";
    button2.style.zIndex = "999999";
    button2.style.cursor = "pointer";
    button2.onclick = () => {
      console.log("🚨 Botón 2 clickeado");
      alert("¡Botón 2 funciona!");
    };
    
    document.body.appendChild(button2);
    buttons.push(button2);
    console.log("🚨 Botón 2 agregado al DOM");

    // Botón 3: Botón con clase CSS
    const button3 = document.createElement('button');
    button3.textContent = "🚨 BOTÓN 3 (CSS)";
    button3.className = "ar-test-button";
    button3.style.top = "180px";
    button3.style.left = "20px";
    button3.onclick = () => {
      console.log("🚨 Botón 3 clickeado");
      alert("¡Botón 3 funciona!");
    };
    
    document.body.appendChild(button3);
    buttons.push(button3);
    console.log("🚨 Botón 3 agregado al DOM");

    // Botón 4: Botón con z-index muy alto
    const button4 = document.createElement('button');
    button4.textContent = "🚨 BOTÓN 4 (Z-INDEX)";
    button4.style.position = "fixed";
    button4.style.top = "260px";
    button4.style.left = "20px";
    button4.style.padding = "15px 25px";
    button4.style.background = "linear-gradient(135deg, #00ff00, #00cc00)";
    button4.style.color = "white";
    button4.style.border = "3px solid #000";
    button4.style.borderRadius = "10px";
    button4.style.fontSize = "18px";
    button4.style.fontWeight = "bold";
    button4.style.zIndex = "9999999";
    button4.style.cursor = "pointer";
    button4.onclick = () => {
      console.log("🚨 Botón 4 clickeado");
      alert("¡Botón 4 funciona!");
    };
    
    document.body.appendChild(button4);
    buttons.push(button4);
    console.log("🚨 Botón 4 agregado al DOM");

    // Botón 5: Botón con !important en estilos
    const button5 = document.createElement('button');
    button5.textContent = "🚨 BOTÓN 5 (IMPORTANT)";
    button5.style.cssText = `
      position: fixed !important;
      top: 340px !important;
      left: 20px !important;
      padding: 15px 25px !important;
      background: linear-gradient(135deg, #0000ff, #0066ff) !important;
      color: white !important;
      border: 3px solid #000 !important;
      border-radius: 10px !important;
      font-size: 18px !important;
      font-weight: bold !important;
      z-index: 9999999 !important;
      cursor: pointer !important;
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
      pointer-events: auto !important;
    `;
    button5.onclick = () => {
      console.log("🚨 Botón 5 clickeado");
      alert("¡Botón 5 funciona!");
    };
    
    document.body.appendChild(button5);
    buttons.push(button5);
    console.log("🚨 Botón 5 agregado al DOM");
    
    setButtonCount(buttons.length);

    return () => {
      buttons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
    };
  }, []);

  if (showAR) {
    return (
      <div>
        <ARExperience 
          modelUrl={testModelUrl}
          onClose={() => setShowAR(false)}
          showCloseButton={true}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Debug AR - Botones de Prueba</h1>
      <p>Página de prueba para verificar si los botones con position: fixed funcionan</p>
      
      <div style={{ margin: "20px 0" }}>
        <h2>Información:</h2>
        <ul>
          <li>Se han creado {buttonCount} botones dinámicamente</li>
          <li>Cada botón tiene position: fixed</li>
          <li>Los botones deberían estar visibles en el lado izquierdo de la pantalla</li>
          <li>Si no los ves, hay un problema con el CSS o el DOM</li>
        </ul>
      </div>

      {/* Botón para iniciar AR */}
      <button
        onClick={() => {
          console.log("🚨 Iniciando AR...");
          setShowAR(true);
        }}
        style={{
          padding: "15px 30px",
          background: "linear-gradient(135deg, #ff6600, #ff8800)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        🥽 Iniciar AR
      </button>

      {/* Botón 1: Botón estático en JSX */}
      <button
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          padding: "15px 25px",
          background: "linear-gradient(135deg, #ff6600, #ff8800)",
          color: "white",
          border: "3px solid #000",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          zIndex: "999999",
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("🚨 Botón 1 clickeado");
          alert("¡Botón 1 funciona!");
        }}
      >
        🚨 BOTÓN 1 (JSX)
      </button>

      {/* Logs */}
      <div style={{ marginTop: "500px" }}>
        <h2>Logs de Debug:</h2>
        <div style={{ 
          background: "#f5f5f5", 
          padding: "15px", 
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "14px",
          maxHeight: "300px",
          overflowY: "auto"
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: "5px",
              color: log.type === "error" ? "red" : log.type === "warn" ? "orange" : "black"
            }}>
              <span style={{ color: "#666" }}>[{log.timestamp}]</span> {log.message}
            </div>
          ))}
          {logs.length === 0 && <div style={{ color: "#666" }}>No hay logs aún...</div>}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Contenido de la página</h2>
        <p>Este contenido está aquí para verificar que la página se carga correctamente.</p>
        <p>Los botones deberían estar visibles arriba de este contenido.</p>
      </div>
    </div>
  );
} 