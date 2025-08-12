"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GalleryRoom from "../../../../components/GalleryRoom.jsx";
import { PageLoader } from "@components/LoadingSpinner";

export default function SalaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const salaId = params?.id;
  const [sala, setSala] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!salaId) return;
    const loadSala = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/salas/${salaId}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setSala(data.sala || data);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadSala();
  }, [salaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader text="Cargando sala..." />
      </div>
    );
  }
  if (error || !sala) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">{error || "Sala no encontrada"}</p>
        <button onClick={() => router.push('/museo')} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition">Volver</button>
      </div>
    );
  }

  const murales = (sala.murales || []).map(sm => sm.mural || sm).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100]">
      <GalleryRoom
        salaId={sala.id}
        murales={murales}
        layout={sala.layout}
        scene={sala.scene}
        texturaPared={sala.texturaPared}
        texturaPiso={sala.texturaPiso}
      />
    </div>
  );
}