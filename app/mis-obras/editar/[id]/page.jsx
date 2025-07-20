"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CrearMuralStepper from "../../components/CrearMuralStepper";
import AnimatedBackground from "../../../../components/shared/AnimatedBackground";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useUser } from "../../../../providers/UserProvider";

export default function EditarObraPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, userProfile } = useUser();

  useEffect(() => {
    console.log("params:", params, "id:", id);
    if (!id) {
      setError("ID de obra inválido");
      setLoading(false);
      return;
    }
    async function fetchObra() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/murales/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar la obra");
        const data = await res.json();
        setObra(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchObra();
  }, [id]);

  // Solo el dueño puede editar
  const isOwner =
    obra && (userProfile?.id === obra.userId || user?.id === obra.userId);

  if (loading) return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando obra...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
  
  if (error)
    return (
      <ProtectedRoute>
        <div className="relative min-h-screen flex items-center justify-center">
          <AnimatedBackground />
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">❌ Error</div>
            <p className="text-red-400">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/mis-obras")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mis obras
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
    
  if (!obra) return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">📭 No encontrada</div>
          <p className="text-gray-400">Obra no encontrada</p>
          <Button 
            variant="outline" 
            onClick={() => router.push("/mis-obras")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mis obras
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
  
  if (!isOwner)
    return (
      <ProtectedRoute>
        <div className="relative min-h-screen flex items-center justify-center">
          <AnimatedBackground />
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">🔒 Sin permisos</div>
            <p className="text-red-400">No tienes permiso para editar esta obra.</p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/mis-obras")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mis obras
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      <div className="relative">
        <AnimatedBackground />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-0 sm:px-4 pt-24 md:pt-28 pb-2 md:pb-4 min-h-screen flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="w-full flex flex-col gap-4 items-start">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/mis-obras")}
                  className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground bg-transparent border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a mis obras
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Editar obra
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {obra?.titulo ? `"${obra.titulo}"` : "Sin título"}
                    {obra?.tecnica && ` • ${obra.tecnica}`}
                    {obra?.anio && ` • ${obra.anio}`}
                  </p>
                </div>
              </div>
              <CrearMuralStepper
                initialData={obra}
                editMode={true}
                onSuccess={() => {
                  setTimeout(() => router.push("/mis-obras"), 1200);
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
