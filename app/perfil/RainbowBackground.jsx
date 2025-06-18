import React from "react";

const COLORS = [
  "rgba(232,121,249,0.5)", // purple
  "rgba(96,165,250,0.5)", // blue
  "rgba(94,234,212,0.5)", // green
];
const NUM_BARS = 25;
const ANIMATION_TIME = 45;

export default function RainbowBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: NUM_BARS }).map((_, i) => {
        const colorOrder = COLORS.slice();
        // Shuffle colors for each bar
        for (let j = colorOrder.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [colorOrder[j], colorOrder[k]] = [colorOrder[k], colorOrder[j]];
        }
        const delay = -(i / NUM_BARS) * ANIMATION_TIME;
        const duration = ANIMATION_TIME - (ANIMATION_TIME / NUM_BARS / 2) * i;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "8vw",
              height: "110vh",
              borderRadius: "40vw",
              filter: "blur(32px)",
              background: `linear-gradient(120deg, ${colorOrder[0]}, ${colorOrder[1]}, ${colorOrder[2]})`,
              opacity: 0.5,
              animation: `rainbow-slide ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              transform: `rotate(10deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes rainbow-slide {
          from { right: -25vw; }
          to { right: 125vw; }
        }
      `}</style>
    </div>
  );
} 