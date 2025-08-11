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
  setTextureFloor: (texture) => set({ texturas: { ...get().texturas, piso: texture } }),
  setTextureWalls: (texture) => set({ texturas: { ...get().texturas, paredes: texture } }),
  reset: () => set({ ...initialState }),
}));
