"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import Unauthorized from "../../../components/Unauthorized";
import { useSession } from "next-auth/react";
import { AnimatedBlobsBackground, DotsPattern } from "../../components/admin/usuarios/Backgrounds";
import AvatarTooltip from "../../components/ui/AvatarTooltip";
import React, { useRef } from "react";

export default function AdminSalasPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Cargando...</div>;
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <Unauthorized title="Acceso denegado" message="Esta sección es solo para administradores." error="403" showLogin={true} redirectPath="/" />
    );
  }

  return <AdminSalasContent />;
}

function AdminSalasContent() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  // Estado para tooltips de miniaturas
  const [hoveredMuralId, setHoveredMuralId] = useState(null);
  const [hoveredMuralPos, setHoveredMuralPos] = useState({ left: 0, top: 0 });
  // Controlar si la imagen de cada mural está cargada
  const [loadedMurales, setLoadedMurales] = useState({});
  // Usar refs individuales para cada miniatura
  const muralRefs = React.useRef({});

  useEffect(() => {
    const fetchSalas = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/salas");
        if (!res.ok) throw new Error("No se pudieron cargar las salas");
        const data = await res.json();
        setSalas(data.salas || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSalas();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta sala?")) return;
    try {
      const res = await fetch(`/api/salas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la sala");
      setSalas((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-start bg-transparent min-h-screen">
      {/* Fondo animado, patrón y graffiti sutil */}
      <div className="pointer-events-none absolute inset-0 w-full h-full z-0">
        <AnimatedBlobsBackground />
        <DotsPattern />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Administrar Salas</h1>
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link href="/crear-sala">Crear nueva sala</Link>
          </Button>
        </div>
        {/* Desktop/tablet: tabla, mobile: cards */}
        <div className="hidden md:block">
          {loading ? (
            <div className="text-center py-8">Cargando salas...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : salas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay salas registradas.</div>
          ) : (
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2">Nombre de la sala</th>
                  <th className="text-center px-4 py-2">Creador</th>
                  <th className="text-center px-4 py-2">Murales</th>
                  <th className="text-center px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id} className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow border border-zinc-200 dark:border-zinc-700">
                    {/* Nombre y creador centrados verticalmente */}
                    <td className="px-4 py-4 align-middle text-lg font-semibold text-foreground text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span>{sala.nombre}</span>
                        <span className="text-xs text-muted-foreground font-normal">ID: {sala.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="font-medium text-base">{sala.creador?.name || <span className="italic text-muted-foreground">Sin nombre</span>}</span>
                        <span className="text-xs text-muted-foreground">{sala.creador?.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <div className="relative grid grid-cols-4 gap-2 justify-center items-center max-w-xs mx-auto">
                        {sala.murales.map((sm) => {
                          if (!muralRefs.current[sm.mural.id]) muralRefs.current[sm.mural.id] = React.createRef();
                          return (
                            <span
                              key={sm.mural.id}
                              onMouseEnter={() => setHoveredMuralId(null)}
                              onMouseLeave={() => setHoveredMuralId(null)}
                              className="inline-block cursor-pointer transition-transform duration-200 hover:scale-110"
                            >
                              <img
                                ref={muralRefs.current[sm.mural.id]}
                                src={sm.mural.url_imagen}
                                alt={sm.mural.titulo}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow"
                                onLoad={() => setLoadedMurales((prev) => ({ ...prev, [sm.mural.id]: true }))}
                              />
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      {/* Acciones: editar, eliminar, etc. */}
                      <div className="flex flex-row gap-2 justify-center">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/salas/${sala.id}`}>Editar</Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sala.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Mobile: cards */}
        <div className="block md:hidden">
          {loading ? (
            <div className="text-center py-8">Cargando salas...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : salas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay salas registradas.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {salas.map((sala) => (
                <div key={sala.id} className="bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-lg font-semibold text-foreground">{sala.nombre}</span>
                    <span className="text-xs text-muted-foreground font-normal">ID: {sala.id}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-medium text-base">{sala.creador?.name || <span className="italic text-muted-foreground">Sin nombre</span>}</span>
                    <span className="text-xs text-muted-foreground">{sala.creador?.email}</span>
                  </div>
                  <div className="flex flex-row gap-2 overflow-x-auto py-2 justify-center items-center">
                    {sala.murales.map((sm) => {
                      if (!muralRefs.current[sm.mural.id]) muralRefs.current[sm.mural.id] = React.createRef();
                      return (
                        <span
                          key={sm.mural.id}
                          onMouseEnter={() => setHoveredMuralId(null)}
                          onMouseLeave={() => setHoveredMuralId(null)}
                          className="inline-block cursor-pointer transition-transform duration-200 hover:scale-110"
                        >
                          <img
                            ref={muralRefs.current[sm.mural.id]}
                            src={sm.mural.url_imagen}
                            alt={sm.mural.titulo}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow"
                            onLoad={() => setLoadedMurales((prev) => ({ ...prev, [sm.mural.id]: true }))}
                          />
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-row gap-2 justify-center">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/salas/${sala.id}`}>Editar</Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(sala.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 