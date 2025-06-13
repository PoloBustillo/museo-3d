// Dialog component for shadcn/ui style
import * as React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(10,10,15,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          minWidth: 340,
          boxShadow: "0 4px 32px #0004",
          position: "relative",
          padding: "2.5em 2em",
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ children }) {
  return <h2 style={{ color: '#1a237e', marginBottom: 18, textAlign: 'center', fontWeight: 700 }}>{children}</h2>;
}

export function DialogClose({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ position: 'absolute', top: 12, right: 16, fontSize: 26, background: 'none', border: 'none', color: '#222', cursor: 'pointer' }}
      aria-label="Cerrar"
    >
      ×
    </button>
  );
}
