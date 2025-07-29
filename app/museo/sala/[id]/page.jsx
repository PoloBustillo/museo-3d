"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import HybridGalleryRoom from "../../../../components/HybridGalleryRoom.jsx";
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

  // Determinar el tipo de sala basado en el ID
  const getRoomType = (salaId) => {
    const id = parseInt(salaId);
    switch (id) {
      case 1: return 'standard';
      case 2: return 'contemporary';
      case 3: return 'digital';
      case 4: return 'intimate';
      default: return 'standard';
    }
  };

  const roomType = getRoomType(salaId);

  // Obtener información del tipo de sala
  const getRoomInfo = (type) => {
    const roomTypes = {
      standard: { name: "Sala Estándar", icon: "🏛️", color: "#1976d2" },
      contemporary: { name: "Sala Contemporánea", icon: "🖼️", color: "#7b1fa2" },
      digital: { name: "Sala Digital", icon: "💻", color: "#f57c00" },
      intimate: { name: "Sala Íntima", icon: "🎨", color: "#388e3c" }
    };
    return roomTypes[type] || roomTypes.standard;
  };

  const roomInfo = getRoomInfo(roomType);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100]">
      <HybridGalleryRoom
        salaId={sala.id}
        murales={sala.murales || []}
        roomType={roomType}
        onRoomChange={() => {}}
        availableRooms={salas.map((s) => ({
          id: s.id,
          name: s.nombre,
          icon: "🏛️",
        }))}
      />
    </div>
  );
} 