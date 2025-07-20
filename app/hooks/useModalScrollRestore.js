import { useRef, useEffect } from "react";

/**
 * Hook para restaurar la posición de scroll al abrir/cerrar un modal.
 * @param {boolean} isOpen - Si el modal está abierto.
 * @param {React.RefObject} modalRef - Ref del elemento modal al que hacer scroll.
 */
export function useModalScrollRestore(isOpen, modalRef) {
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual
      scrollPosition.current = window.scrollY;
      // Hacer scroll al modal
      if (modalRef.current) {
        modalRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else {
      // Restaurar la posición previa
      window.scrollTo({ top: scrollPosition.current, behavior: "smooth" });
    }
    // Solo depende de isOpen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}
