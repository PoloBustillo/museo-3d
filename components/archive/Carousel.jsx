import { useState, useRef, useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Asegúrate de tener framer-motion instalado
import { useOutsideClick } from "@/hooks/use-outside-click";

export function ExpandableCard({ card, onClose }) {
  const id = useId();
  const ref = useRef(null);

  useOutsideClick(ref, onClose);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 z-40 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          layoutId={`card-${card.title}-${id}`}
          ref={ref}
          className="bg-white dark:bg-neutral-900 max-w-lg w-full p-4 rounded-2xl shadow-xl z-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="text-neutral-600">{card.description}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-xl font-bold text-red-500"
            >
              ×
            </button>
          </div>
          <div className="mt-4 text-sm text-neutral-700 overflow-auto max-h-60">
            {typeof card.content === "function" ? card.content() : card.content}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
