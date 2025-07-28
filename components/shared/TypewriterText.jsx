import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TypewriterText({
  text,
  speed = 100,
  delay = 0,
  repeat = false,
  repeatDelay = 3000,
  className = "",
  style = {},
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const timer = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);

          // Si repeat está habilitado, reiniciar después del delay
          if (repeat) {
            setTimeout(() => {
              setCycle((prev) => prev + 1);
            }, repeatDelay);
          }
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay, repeat, repeatDelay, cycle]);

  return (
    <span
      className={`text-3xl font-normal tracking-tight text-primary drop-shadow-sm ${className}`}
      style={{
        fontFamily: "var(--font-monoton), cursive",
        letterSpacing: "0.04em",
        display: "inline-block",
        position: "relative",
        ...style,
      }}
    >
      {/* Invisible span to reserve width and prevent layout shift */}
      <span style={{ visibility: "hidden", whiteSpace: "nowrap" }}>{text}</span>
      {/* Absolutely positioned animated text */}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          whiteSpace: "nowrap",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {displayedText}
        <motion.span
          animate={{ opacity: !isComplete ? [0, 1, 0] : 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-7 bg-primary ml-1 align-middle"
          style={{ visibility: !isComplete ? "visible" : "hidden" }}
        />
      </span>
    </span>
  );
}
