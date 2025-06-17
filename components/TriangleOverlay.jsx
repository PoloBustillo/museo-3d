"use client";
import Link from "next/link";

export default function AnimatedTriangleOverlay({
  step = 1,
  text = "",
  side = "left",
  isFinalStep = false,
  scrollOpacity = 1,
}) {
  const isLeft = side === "left";

  // Calcular animaciones basadas en la opacidad del scroll
  const isVisible = scrollOpacity > 0.1;
  const appearProgress = scrollOpacity;

  // Animaciones de entrada y salida más dramáticas
  const triangleX = isLeft
    ? -30 + appearProgress * 30 // Movimiento más pronunciado desde fuera
    : 30 - appearProgress * 30;

  const contentY = 20 - appearProgress * 20; // Movimiento vertical más notable
  const numberScale = 0.8 + appearProgress * 0.2; // Escala más dramática
  const textOpacity = Math.max(0, (appearProgress - 0.2) / 0.8); // Texto aparece después
  const buttonOpacity = isFinalStep
    ? Math.max(0, (appearProgress - 0.4) / 0.6)
    : 0; // Botón aparece al final

  // Rotación sutil durante la transición
  const rotation = (1 - appearProgress) * (isLeft ? -2 : 2);

  return (
    <div
      key={`triangle-${side}-${step}`}
      className={`
        fixed top-0 h-screen w-full sm:w-3/4 md:w-2/3 lg:w-1/2 z-[20] bg-black dark:bg-gray-900 text-white
        transition-all duration-500 ease-out triangle-overlay
        ${isLeft ? "left-0 clip-poly-right" : "right-0 clip-poly-left"}
        flex items-center
        pointer-events-none
        px-4 sm:px-0
      `}
      style={{
        "--triangle-opacity": scrollOpacity,
        opacity: `calc(var(--triangle-opacity) * var(--triangle-max-opacity, 1))`,
        filter: `blur(${(1 - scrollOpacity) * 0.5}px)`, // Blur más notable durante transición
        transform: `translateX(${triangleX}%) scale(${numberScale}) rotate(${rotation}deg)`,
        transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)", // Transición más suave
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: isLeft ? "env(safe-area-inset-left)" : "0",
        paddingRight: !isLeft ? "env(safe-area-inset-right)" : "0",
      }}
    >
      {" "}
      <div
        className={`
          max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transition-all duration-500 ease-out px-2 sm:px-4 md:px-6 lg:px-8
          ${
            isLeft
              ? "safe-pad-left text-left"
              : "ml-auto safe-pad-right text-right"
          }
          ${
            isVisible && scrollOpacity > 0.5
              ? "pointer-events-auto"
              : "pointer-events-none"
          }
        `}
        style={{
          transform: `translateY(${contentY}px) scale(${numberScale})`,
          opacity: appearProgress,
        }}
      >
        {" "}
        {/* Step number - Large and visible on all devices */}
        <h2
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none relative transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
            transform: `scale(${numberScale}) perspective(1000px) rotateX(${
              (1 - scrollOpacity) * 5
            }deg)`,
          }}
        >
          {step.toString().padStart(2, "0")}
          {/* Efecto de brillo basado en scroll */}
          {appearProgress > 0.3 && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-8 transition-transform duration-100 ease-linear"
              style={{
                clipPath: "polygon(0 0, 15% 0, 35% 100%, 0% 100%)",
                transform: `translateX(${(appearProgress - 0.3) * 150}%)`,
              }}
            />
          )}
        </h2>
        <p
          className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed transition-all duration-500 ease-out"
          style={{
            opacity: textOpacity,
            filter: `blur(${(1 - textOpacity) * 0.2}px)`,
            transform: `translateY(${(1 - textOpacity) * 10}px)`,
          }}
        >
          {text}
        </p>{" "}
        {isFinalStep && (
          <div
            className="mt-6 sm:mt-8 flex justify-center transition-all duration-500 ease-out"
            style={{
              opacity: buttonOpacity,
              transform: `translateY(${(1 - buttonOpacity) * 10}px) scale(${
                0.9 + buttonOpacity * 0.1
              })`,
            }}
          >
            <Link
              href="/museo"
              className="
                relative inline-block px-4 sm:px-6 py-2.5 sm:py-3 rounded-md border border-white
                font-semibold text-sm sm:text-base text-white overflow-hidden group
                backdrop-blur-md bg-white/10 hover:scale-105 transition-transform duration-300
              "
            >
              <span
                aria-hidden
                className="
                  absolute -inset-[2px] rounded-md
                  bg-gradient-to-r from-indigo-900 via-purple-500 to-indigo-900
                  bg-[length:200%_200%] opacity-70 animate-borderPulse
                  group-hover:opacity-100 group-hover:brightness-125
                  transition-opacity duration-500 ease-in-out
                "
              />

              <span
                aria-hidden
                className="
                  absolute inset-0 rounded-md
                  bg-gradient-to-r from-indigo-900 via-purple-500 to-indigo-900
                  scale-x-0 origin-left transition-transform duration-500 ease-out
                  group-hover:scale-x-100 group-hover:brightness-125
                "
              />

              <span className="relative z-10 transition-colors duration-500">
                ¡Visita el museo virtual!
              </span>
            </Link>
          </div>
        )}{" "}
      </div>
    </div>
  );
}
