"use client";
import { useState, useEffect } from "react";
import GalleryRoom from "../../components/GalleryRoom.jsx";
import { PageLoader, SectionLoader } from "../../components/LoadingSpinner";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import SalaCard from "../../components/ui/SalaCard";
import { useRouter } from "next/navigation";
import useSalas from "@hooks/useSalas";


export default function MuseoPage() {

  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const router = useRouter();

  const { salas, loading, error } = useSalas();

  const getColorBySalaId = (id) =>
    ({ 1: "#e3f2fd", 2: "#f3e5f5", 3: "#e8f5e8", 4: "#fff3e0" })[id] ||
    "#f5f5f5";
  const getIconBySalaId = (id) =>
    ({ 1: "🎨", 2: "🖼️", 3: "💻", 4: "🎭" })[id] || "🏛️";

  // const getSalasFallback = ... // Eliminar, ya está en el hook

  const salasFiltradas = salas.filter((sala) =>
    sala.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Eliminar lógica de salaSeleccionada y GalleryRoom

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader text="Cargando salas del museo..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6 opacity-20">⚠️</div>
          <h2 className="text-2xl font-light text-foreground mb-4">
            Error al cargar las salas
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 md:pt-28 pb-2 md:pb-4">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Museo Virtual 3D
            </h1>
            <p className="text-lg text-muted-foreground">
              Explora las salas y descubre obras en un entorno inmersivo
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {isAdmin && (
              <button
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
                onClick={() => router.push("/mis-salas")}
              >
                <Plus className="h-5 w-5" /> Crear sala
              </button>
            )}
          </div>
        </div>
        {/* Filtros */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar salas..."
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground w-full sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Grid de salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {salasFiltradas.map((sala) => {
            // Determine if current user is owner
            const isOwner =
              session?.user?.id &&
              (sala.propietario === session.user.name ||
                sala.propietario === session.user.id);
            return (
              <SalaCard
                key={sala.id}
                sala={sala}
                isOwner={isOwner}
                onEnter={() => router.push(`/sala-museo/${sala.id}`)}
              />
            );
          })}
        </div>
        {/* Estado vacío */}
        {salasFiltradas.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No hay salas disponibles.
            </p>
            {isAdmin && (
              <button
                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                onClick={() => router.push("/mis-salas")}
              >
                <Plus className="h-5 w-5" /> Crear sala
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
