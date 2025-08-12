import { create } from "zustand";

const initialState = {
  nombre: "",
  descripcion: "",
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
};

export const useCrearSalaStore = create((set, get) => ({
  ...initialState,
  setNombre: (nombre) => set({ nombre }),
  setDescripcion: (descripcion) => set({ descripcion }),
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
  reset: () => set({ ...initialState }),
}));
