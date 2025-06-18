"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function useUpdateProfile() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // name: string, imageFile: File | null
  async function updateProfile({ name, imageFile }) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let imageUrl = session?.user?.image || null;
      // 1. Subir imagen si hay nueva
      if (imageFile) {
        const formData = new FormData();
        formData.append("imagen", imageFile);
        formData.append("folder", "usuarios");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Error subiendo imagen");
        const data = await res.json();
        imageUrl = data.url;
      }
      // 2. Actualizar usuario en la base de datos
      const res = await fetch(`/api/usuarios/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(name && { name }),
          ...(imageUrl && { image: imageUrl }),
        }),
      });
      if (!res.ok) throw new Error("Error actualizando usuario");
      // 3. Actualizar sesión de NextAuth con los nuevos datos
      await update({ name, image: imageUrl });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return { updateProfile, loading, error, success };
}
