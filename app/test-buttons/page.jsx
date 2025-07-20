"use client";
import { useEffect, useState } from "react";

export default function TestButtonsPage() {
  const [buttonCount, setButtonCount] = useState(0);

  useEffect(() => {
    console.log("🚨 Página de prueba de botones cargada");
    
    // Crear múltiples botones de prueba
    const buttons = [];
    
    for (let i = 0; i < 5; i++) {
      const button = document.createElement('button');
      button.textContent = `🚨 BOTÓN ${i + 1}`;
      button.style.position = "fixed";
      button.style.top = `${100 + i * 80}px`;
      button.style.left = "20px";
      button.style.padding = "15px 25px";
      button.style.background = `hsl(${i * 60}, 70%, 50%)`;
      button.style.color = "white";
      button.style.border = "3px solid #000";
      button.style.borderRadius = "10px";
      button.style.fontSize = "18px";
      button.style.fontWeight = "bold";
      button.style.zIndex = "999999";
      button.style.cursor = "pointer";
      button.onclick = () => {
        alert(`¡Botón ${i + 1} funciona!`);
        console.log(`🚨 Botón ${i + 1} clickeado`);
      };
      
      document.body.appendChild(button);
      buttons.push(button);
      console.log(`🚨 Botón ${i + 1} creado`);
    }
    
    setButtonCount(buttons.length);

    return () => {
      buttons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
    };
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Prueba de Botones</h1>
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

      {/* Botón estático en JSX */}
      <button
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "15px 25px",
          background: "linear-gradient(135deg, #ff0000, #ff6600)",
          color: "white",
          border: "3px solid #000",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          zIndex: "999999",
          cursor: "pointer",
        }}
        onClick={() => {
          alert("¡Botón JSX funciona!");
          console.log("🚨 Botón JSX clickeado");
        }}
      >
        🚨 BOTÓN JSX
      </button>

      {/* Botón de prueba muy simple */}
      <div
        className="test-button"
        style={{
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        onClick={() => {
          alert("¡Botón simple funciona!");
          console.log("🚨 Botón simple clickeado");
        }}
      >
        🚨 BOTÓN SIMPLE
      </div>

      {/* Botón de prueba muy simple sin clase CSS */}
      <div
        style={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: "999999",
          background: "blue",
          color: "white",
          padding: "10px 20px",
          border: "2px solid black",
          borderRadius: "5px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => {
          alert("¡Botón azul funciona!");
          console.log("🚨 Botón azul clickeado");
        }}
      >
        🚨 BOTÓN AZUL
      </div>

      <div style={{ marginTop: "500px" }}>
        <h2>Contenido de la página</h2>
        <p>Este contenido está aquí para verificar que la página se carga correctamente.</p>
        <p>Los botones deberían estar visibles arriba de este contenido.</p>
      </div>
    </div>
  );
} 