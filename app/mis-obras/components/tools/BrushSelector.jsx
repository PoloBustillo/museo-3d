import React from "react";
import { Brush, ChevronDown } from "lucide-react";

export default function BrushSelector({
  brushes,
  currentBrush,
  onSelectBrush,
  onOpenModal,
}) {
  const CurrentIcon =
    brushes.find((b) => b.key === currentBrush)?.icon || Brush;
  const label = brushes.find((b) => b.key === currentBrush)?.label || "Pincel Básico";
  
  return (
    <div className="flex flex-col items-center w-full">
      <button
        type="button"
        className="group relative w-full flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/20"
        onClick={onOpenModal}
        aria-label="Seleccionar pincel"
      >
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3">
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs opacity-80">Toca para cambiar</div>
          </div>
        </div>
        <ChevronDown className="h-5 w-5 transition-transform group-hover:rotate-180" />
        
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
}
