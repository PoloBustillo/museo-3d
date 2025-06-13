"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import MainMenu from "./MainMenu";

const FRASES_68 = [
  "La universidad será tomada por su pueblo.",
  "¡2 de octubre no se olvida!",
  "Por la libertad de expresión y la justicia social.",
  "Somos hijos del pueblo, nunca nos podrán vencer.",
  "La imaginación al poder.",
  "Queremos un país libre, no un país de silencio.",
  "La represión no callará la verdad.",
  "La memoria es nuestra fuerza.",
  "Democracia, libertad y justicia para todos.",
  "El respeto al derecho ajeno es la paz."
];

export default function ClientLayout({ children }) {
  const [transitioning, setTransitioning] = useState(false);
  const [nextRoute, setNextRoute] = useState(null);
  const [frase, setFrase] = useState(FRASES_68[0]);
  const prevFrase = useRef(FRASES_68[0]);
  const router = useRouter();

  // Elegir frase aleatoria distinta a la anterior
  useEffect(() => {
    if (transitioning) {
      let nueva;
      do {
        nueva = FRASES_68[Math.floor(Math.random() * FRASES_68.length)];
      } while (nueva === prevFrase.current && FRASES_68.length > 1);
      setFrase(nueva);
      prevFrase.current = nueva;
    }
  }, [transitioning]);

  // Llama esto para cualquier transición animada
  const handleRouteTransition = (e, route) => {
    if (e) e.preventDefault();
    setTransitioning(true);
    setNextRoute(route);
    setTimeout(() => {
      router.push(route);
      setTransitioning(false);
      setNextRoute(null);
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainMenu onSubirArchivo={e => handleRouteTransition(e, "/subir-archivo")}
        onNavigate={handleRouteTransition}
      />
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: 1.1,
                textAlign: "center",
                padding: "2.5em 2em 2em 2em",
                borderRadius: 18,
                background: "none",
                maxWidth: 600,
                margin: "0 auto"
              }}
            >
              <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: 22, color: "#fff", display: "block", marginBottom: 18 }}>
                {frase}
              </span>
              <span style={{ fontSize: 16, color: "#fff", fontWeight: 300 }}>
                Transición a la siguiente página...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
