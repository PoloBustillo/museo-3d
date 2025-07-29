"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GalleryRoom from "../../../../components/GalleryRoom.jsx";
import { PageLoader } from "@components/LoadingSpinner";
import useSalas from "@hooks/useSalas";

export default function SalaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const salaId = params?.id;
  const { salas, loading } = useSalas();
  const [sala, setSala] = useState(null);

  useEffect(() => {
    if (!loading) {
      const found = salas.find((s) => String(s.id) === String(salaId));
      setSala(found || null);
    }
  }, [loading, salas, salaId]);

  if (loading || !sala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader text="Cargando sala..." />
      </div>
    );
  }

  const getIconBySalaId = (id) =>
    ({ 1: "🎨", 2: "🖼️", 3: "💻", 4: "🎭" })[id] || "🏛️";

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100]">
      <button
        onClick={() => router.push("/museo")}
        className="absolute top-5 left-5 z-[1000] bg-background/90 border-2 border-border rounded-lg px-4 py-2 cursor-pointer font-bold text-sm hover:bg-background transition-colors shadow-lg"
      >
        ← Volver a salas
      </button>
      <GalleryRoom
        salaId={sala.id}
        murales={sala.murales || []}
        onRoomChange={() => {}}
        availableRooms={salas.map((s) => ({
          id: s.id,
          name: s.nombre,
          icon: getIconBySalaId(s.id),
        }))}
      />
    </div>
  );
} 