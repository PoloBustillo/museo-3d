import React from "react";

/**
 * Stepper visual moderno y accesible.
 * Props:
 * - steps: array de strings o {label, icon, subtitle, status}
 * - activeStep: índice del paso activo
 * - color: tailwind color base (ej: 'indigo'), default 'indigo'
 * - className: clases extra opcionales
 * - onStepClick: función (índice) => void, si se pasa los steps serán clickeables
 * - maxVisible: número máximo de pasos visibles (default: ilimitado)
 */
export default function Stepper({
  steps = [],
  activeStep = 0,
  color = "indigo",
  className = "",
  onStepClick,
  maxVisible = null,
}) {
  // Hook para detectar pantalla pequeña
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Permitir steps como array de strings o de objetos {label, icon, subtitle, status}
  const getStep = (step) => (typeof step === "string" ? { label: step } : step);

  // Colores tailwind
  const colorBg = `bg-${color}-600`;
  const colorText = `text-white`;
  const colorBorder = `border-${color}-700`;
  const colorShadow = `shadow-lg`;
  const colorInactiveBg = `bg-muted`;
  const colorInactiveText = `text-foreground`;
  const colorInactiveBorder = `border-border`;

  // Estados
  const statusColors = {
    error: "bg-red-500 border-red-700 text-white animate-shake",
    success: "bg-green-500 border-green-700 text-white",
    warning: "bg-yellow-400 border-yellow-600 text-black",
  };

  // Filtrar steps basado en maxVisible o para móviles
  const getVisibleSteps = () => {
    // Si maxVisible está definido, usar esa lógica independientemente del tamaño de pantalla
    if (maxVisible && typeof maxVisible === "number" && maxVisible > 0) {
      const visibleSteps = [];
      const halfMax = Math.floor(maxVisible / 2);

      // Calcular el rango de pasos a mostrar centrado en el paso activo
      let startIndex = Math.max(0, activeStep - halfMax);
      let endIndex = Math.min(steps.length - 1, startIndex + maxVisible - 1);

      // Ajustar si no tenemos suficientes pasos al final
      if (endIndex - startIndex + 1 < maxVisible) {
        startIndex = Math.max(0, endIndex - maxVisible + 1);
      }

      for (let i = startIndex; i <= endIndex; i++) {
        visibleSteps.push({ ...steps[i], originalIndex: i });
      }

      return visibleSteps;
    }

    // Lógica original para móviles si no hay maxVisible
    if (!isMobile) return steps;

    const visibleSteps = [];
    for (let i = 0; i < steps.length; i++) {
      if (i === activeStep || i === activeStep - 1 || i === activeStep + 1) {
        visibleSteps.push({ ...steps[i], originalIndex: i });
      }
    }
    return visibleSteps;
  };

  const visibleSteps = getVisibleSteps();

  return (
    <div className="flex flex-col items-center mx-0 w-full max-w-full overflow-visible">
      {/* Contador de progreso cuando hay límite de pasos visibles */}
      {(maxVisible && steps.length > maxVisible) ||
      (isMobile && !maxVisible) ? (
        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Paso {activeStep + 1} de {steps.length}
        </div>
      ) : null}
      <div
        className={`flex items-start justify-center gap-1 sm:gap-4 mb-6 px-2 sm:px-0 py-2 w-full max-w-full flex-wrap sm:flex-nowrap overflow-visible ${className}`}
        role="list"
        aria-label="Progreso"
      >
        {/* Indicador de steps anteriores cuando hay límite */}
        {((maxVisible && activeStep > Math.floor(maxVisible / 2)) ||
          (isMobile && !maxVisible && activeStep > 0)) && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 px-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        )}
        {visibleSteps.map((step, i) => {
          const originalIndex =
            step.originalIndex !== undefined ? step.originalIndex : i;
          const stepData = getStep(step);
          const { label, icon, subtitle, status } = stepData;
          const isCompleted = originalIndex < activeStep;
          const isActive = originalIndex === activeStep;
          const isClickable = typeof onStepClick === "function" && isCompleted;
          const hasStatus = status && statusColors[status];
          return (
            <div
              key={i}
              className="flex flex-col items-center min-w-[56px] sm:min-w-[90px] min-h-[80px] sm:min-h-[108px] justify-start px-1 sm:px-0 py-1 flex-shrink-0 overflow-visible"
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={
                  isClickable ? () => onStepClick(originalIndex) : undefined
                }
                style={{ cursor: isClickable ? "pointer" : "default" }}
                className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
                  ${
                    isActive
                      ? `${colorBg} ${colorText} ${colorBorder} ${colorShadow} scale-110`
                      : isCompleted
                        ? `bg-green-500 text-white border-green-700 shadow-md`
                        : `${colorInactiveBg} ${colorInactiveText} ${colorInactiveBorder}`
                  }
                  ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
                  ${hasStatus ? statusColors[status] : ""}
                `}
                aria-current={isActive ? "step" : undefined}
                tabIndex={isClickable ? 0 : -1}
                aria-label={label}
                role="listitem"
              >
                {icon ? (
                  typeof icon === "string" ? (
                    <span className="text-lg" aria-hidden>
                      {icon}
                    </span>
                  ) : (
                    React.cloneElement(icon, {
                      className: "w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-1",
                    })
                  )
                ) : (
                  i + 1
                )}
              </button>
              <span
                title={label}
                className="mt-2 sm:mt-1 text-[10px] sm:text-xs text-center min-w-[56px] sm:min-w-[90px] text-muted-foreground font-medium leading-tight max-w-[72px] sm:max-w-[110px] flex-shrink-0 h-[16px] sm:h-[18px] flex items-center justify-center truncate"
              >
                {label}
              </span>
              <span
                title={subtitle}
                className="text-[10px] sm:text-[11px] text-center text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1 hidden sm:flex leading-tight max-w-[96px] sm:max-w-[120px] h-[30px] items-start justify-center overflow-hidden truncate"
              >
                {subtitle || "\u00A0"}
              </span>
              {status === "error" && (
                <span className="text-xs text-red-500 mt-1 sm:mt-0.5 leading-tight max-w-[70px] sm:max-w-[80px] text-center">
                  ¡Corrige este paso!
                </span>
              )}
            </div>
          );
        })}
        {/* Indicador de steps posteriores cuando hay límite */}
        {((maxVisible &&
          activeStep < steps.length - Math.ceil(maxVisible / 2)) ||
          (isMobile && !maxVisible && activeStep < steps.length - 1)) && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 px-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
