import { create } from "zustand";

const initialState = {
  nombre: "",
  descripcion: "",
  tema: null, // Mover tema al principio
  murales: [],
  step: 0,
  texturas: {
    piso: null,
    paredes: null,
  },
  privacidad: {
    publica: true,
    esPrivada: false,
  },
  colaboradores: [],
  audio: {
    selectedAudio: null, // { name, url, isCustom }
    volume: 50,
    autoplay: true,
  },
  configuracionAvanzada: {
    color: "#6366f1", // Color por defecto (indigo)
    imagenPortada: null, // Será un mural seleccionado
    maxColaboradores: 3, // Fijo en 3
    notas: "", // Notas adicionales
  },
};

export const useCrearSalaStore = create((set, get) => ({
  ...initialState,
  setNombre: (nombre) => set({ nombre }),
  setDescripcion: (descripcion) => set({ descripcion }),
  setTema: (tema) => set({ tema }), // Mover tema al nivel principal
  addMural: (id) => {
    const numId = Number(id);
    if (!get().murales.includes(numId)) {
      set({ murales: [...get().murales, numId] });
    }
  },
  removeMural: (id) => set({ murales: get().murales.filter((m) => m !== id) }),
  setStep: (step) => set({ step }),
  setTextureFloor: (texture) =>
    set({ texturas: { ...get().texturas, piso: texture } }),
  setTextureWalls: (texture) =>
    set({ texturas: { ...get().texturas, paredes: texture } }),
  setPrivacidad: (privacidad) => set({ privacidad }),
  addColaborador: (colaborador) =>
    set({ colaboradores: [...get().colaboradores, colaborador] }),
  removeColaborador: (id) =>
    set({ colaboradores: get().colaboradores.filter((c) => c.id !== id) }),
  setSelectedAudio: (audio) =>
    set({ audio: { ...get().audio, selectedAudio: audio } }),
  setAudioVolume: (volume) => set({ audio: { ...get().audio, volume } }),
  setAudioAutoplay: (autoplay) => set({ audio: { ...get().audio, autoplay } }),

  // Configuración avanzada (simplificada)
  setColor: (color) =>
    set({ configuracionAvanzada: { ...get().configuracionAvanzada, color } }),
  setImagenPortada: (imagenPortada) =>
    set({
      configuracionAvanzada: { ...get().configuracionAvanzada, imagenPortada },
    }),
  setNotas: (notas) =>
    set({ configuracionAvanzada: { ...get().configuracionAvanzada, notas } }),

  reset: () => set({ ...initialState }),
}));
