import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

export default function AvatarTooltip({ src, alt, anchorRef, show }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tooltipWidth = 260;
  const tooltipHeight = 260;

  useEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const padding = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      if (left < padding) left = padding;
      if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
      const posAbove = rect.top - tooltipHeight - padding;
      const posBelow = rect.bottom + padding;
      let top;
      if (posAbove > padding) {
        top = posAbove;
      } else {
        top = posBelow;
      }
      setPos({ top: top + window.scrollY, left: left + window.scrollX });
    }
  }, [show, anchorRef]);

  if (!show) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 1000,
        width: tooltipWidth,
        height: tooltipHeight,
        maxWidth: "90vw",
        maxHeight: "90vw",
      }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 flex items-center justify-center"
    >
      <img
        src={src}
        alt={alt}
        className="w-56 h-56 object-contain rounded-lg"
      />
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
} 