"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { AnimatedBackground } from "../../components/shared";
import { motion } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute";
import CrearSalaStepper from "./CrearSalaStepper";

export default function CrearSalaPage() {
  const router = useRouter();
  const [created, setCreated] = useState(false);
  const hasMounted = useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Contenedor de scroll dedicado para estabilizar el formulario
  const scrollRef = useRef(null);

  return (
    <ProtectedRoute>
      <div
        className="relative overflow-x-hidden"
        ref={scrollRef}
        style={{ overflowY: "auto", maxHeight: "100vh" }}
      >
        <AnimatedBackground />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-0 sm:px-4 pt-24 md:pt-28 pb-2 md:pb-4 min-h-screen flex flex-col">
          <motion.div
            initial={hasMounted.current ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="w-full flex flex-col gap-4 items-start">
              <CrearSalaStepper scrollParentRef={scrollRef} />
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
