"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export const useUpdateProfile = () => {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (formData) => {
    if (!session?.user?.id) {
      setError("Debes iniciar sesión para actualizar tu perfil");
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Si hay una imagen, subirla primero
      let imageUrl = session.user.image;
      if (formData.image && formData.image instanceof File) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.image);
        uploadFormData.append("folder", "avatars");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (res.ok) {
          const uploadData = await res.json();
          imageUrl = uploadData.url;
        } else {
          throw new Error("Error al subir la imagen");
        }
      }

      // Actualizar el perfil del usuario
      const res = await fetch(`/api/usuarios/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          image: imageUrl,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();

        // Actualizar la sesión con los nuevos datos
        await update({
          ...session,
          user: {
            ...session.user,
            name: updatedUser.usuario?.name || updatedUser.name,
            email: updatedUser.usuario?.email || updatedUser.email,
            image: updatedUser.usuario?.image || updatedUser.image,
          },
        });

        setSuccess(true);
        return true;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Error al actualizar el perfil");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
    error,
    success,
  };
};
