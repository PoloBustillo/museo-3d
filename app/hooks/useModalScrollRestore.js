import { useEffect } from "react";

/**
 * Hook para restaurar la posición de scroll al abrir/cerrar un modal.
 * @param {boolean} isOpen - Si el modal está abierto.
 * @param {React.RefObject} modalRef - Ref del elemento modal al que hacer scroll.
 * @param {number} restoreScrollY - Posición de scroll a restaurar al cerrar.
 */
export function useModalScrollRestore(isOpen, modalRef, restoreScrollY) {
  useEffect(() => {
    if (isOpen) {
      // Hacer scroll al modal
      if (modalRef.current) {
        modalRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else if (typeof restoreScrollY === "number") {
      // Restaurar la posición previa
      window.scrollTo({ top: restoreScrollY, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}
