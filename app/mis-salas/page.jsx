"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import SalaIcon from "../components/ui/icons/SalaIcon";
import toast from "react-hot-toast";

export default function MisSalas() {
  const { data: session } = useSession();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    async function fetchSalas() {
      setLoading(true);
      try {
        if (!session?.user?.id) {
          setSalas([]);
          setLoading(false);
          return;
        }
        // Fetch salas donde es creador
        const creadorRes = await fetch(`/api/salas?creadorId=${session.user.id}`);
        let creadorSalas = [];
        if (creadorRes.ok) {
          const data = await creadorRes.json();
          creadorSalas = data.salas || [];
        }
        // Fetch todas las salas y filtra donde es colaborador
        const allRes = await fetch(`/api/salas`);
        let colaboradorSalas = [];
        if (allRes.ok) {
          const data = await allRes.json();
          colaboradorSalas = (data.salas || []).filter(sala =>
            sala.colaboradores?.some(col => col.id === session.user.id)
            && sala.creadorId !== session.user.id // evitar duplicados
          );
        }
        // Unir y mostrar
        setSalas([...creadorSalas, ...colaboradorSalas]);
      } catch (e) {
        toast.error("Error al cargar salas");
      } finally {
        setLoading(false);
      }
    }
    fetchSalas();
  }, [session]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sala? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/salas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSalas((prev) => prev.filter((s) => s.id !== id));
        toast.success("Sala eliminada");
      } else {
        toast.error("No se pudo eliminar la sala");
      }
    } catch (e) {
      toast.error("Error al eliminar sala");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/museo?sala=${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-stone-100 py-10 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <SalaIcon className="w-8 h-8 text-blue-500" /> Mis Salas
        </h1>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando salas...</div>
        ) : salas.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No tienes salas creadas aún.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {salas.map((sala) => (
              <Card key={sala.id} className="bg-white/90 shadow-xl rounded-2xl border border-gray-200 hover:shadow-2xl transition-all">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <SalaIcon className="w-7 h-7 text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-gray-900 flex-1 truncate">{sala.nombre}</CardTitle>
                  <Badge variant="outline" className="ml-2">{sala.estado || "Activa"}</Badge>
                  {sala.creadorId === session?.user?.id ? (
                    <Badge className="ml-2" variant="secondary">Creador</Badge>
                  ) : (
                    <Badge className="ml-2 bg-yellow-400/80 text-yellow-900 border-yellow-300" variant="outline">Colaborador</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600">{sala.descripcion || "Sin descripción."}</div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className="text-xs text-gray-400">Murales: {sala.murales?.length || 0}</span>
                    <span className="text-xs text-gray-400">Colaboradores: {sala.colaboradores?.length || 1}</span>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Link href={`/museo?sala=${sala.id}`} legacyBehavior>
                      <Button size="sm" variant="outline">Ver sala</Button>
                    </Link>
                    <Link href={`/admin/salas/${sala.id}`} legacyBehavior>
                      <Button size="sm" variant="secondary">Editar</Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => setShowDetails(sala)}>Detalles</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleCopyLink(sala.id)}>Copiar enlace</Button>
                    <Button size="sm" variant="destructive" disabled={deletingId === sala.id} onClick={() => handleDelete(sala.id)}>
                      {deletingId === sala.id ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {showDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowDetails(null)}>
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <SalaIcon className="w-6 h-6 text-blue-400" /> {showDetails.nombre}
              </h2>
              <div className="text-gray-600 mb-2">{showDetails.descripcion || "Sin descripción."}</div>
              <div className="mb-2 text-sm text-gray-500">Estado: {showDetails.estado || "Activa"}</div>
              <div className="mb-2 text-sm text-gray-500">Murales: {showDetails.murales?.length || 0}</div>
              <div className="mb-2 text-sm text-gray-500">Colaboradores: {showDetails.colaboradores?.length || 1}</div>
              <div className="mb-2 text-sm text-gray-500">ID: {showDetails.id}</div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleCopyLink(showDetails.id)}>Copiar enlace</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowDetails(null)}>Cerrar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 