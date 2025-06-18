"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  getPersonalCollection,
  getCollectionStats,
} from "../../lib/personalCollection.js";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import RainbowBackground from "./RainbowBackground";
import MuralIcon from "@/components/ui/icons/MuralIcon";
import SalaIcon from "@/components/ui/icons/SalaIcon";
import ArtistaIcon from "@/components/ui/icons/ArtistaIcon";
import TecnicaIcon from "@/components/ui/icons/TecnicaIcon";
import ReactDOM from "react-dom";
import React from "react";

function ImageTooltip({ src, alt, anchorRef, show, previewImages = [] }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2 - 112 + window.scrollY,
        left: rect.right + 16 + window.scrollX,
      });
    }
  }, [show, anchorRef]);
  if (!show) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 1000,
      }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 min-w-[180px] max-w-[320px] max-h-[120px] flex items-center justify-center"
    >
      <div className="flex gap-2">
        {previewImages.map((img, i) => (
          <img key={img.id || i} src={img.src} alt={img.title} className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
        ))}
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
}

function CollectionItem({ item, allItems }) {
  const imgRef = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);
  // Encuentra el índice de la imagen actual y toma hasta 5 a partir de ahí
  const idx = allItems.findIndex((i) => i.id === item.id);
  const previewImages = allItems.slice(idx, idx + 5);
  return (
    <div className="flex items-center gap-4 border-b py-2 relative group">
      {item.src && (
        <>
          <img
            ref={imgRef}
            src={item.src}
            alt={item.title}
            className="w-12 h-12 object-cover rounded-md cursor-pointer group-hover:ring-2 group-hover:ring-primary transition"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
          <ImageTooltip src={item.src} alt={item.title} anchorRef={imgRef} show={hovered} previewImages={previewImages} />
        </>
      )}
      <div className="flex-1 text-left">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-muted-foreground">{item.artist} · {item.year} · {item.technique}</div>
      </div>
    </div>
  );
}

function TagPreviewTooltip({ anchorRef, show, images }) {
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  React.useEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8 + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [show, anchorRef]);
  if (!show || images.length === 0) return null;
  const maxPreview = 5;
  const previewImages = images.slice(0, maxPreview);
  const extra = images.length - maxPreview;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 1000,
      }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 min-w-[180px] max-w-[320px] max-h-[120px] flex items-center justify-center"
    >
      <div className="flex gap-2">
        {previewImages.map((img, i) => {
          // Si es el último preview y hay extra, muestra overlay
          if (i === maxPreview - 1 && extra > 0) {
            return (
              <div key={img.id || i} className="relative w-16 h-16">
                <img src={img.url_imagen} alt={img.nombre} className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700 opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <span className="text-white font-bold text-lg">+{extra}</span>
                </div>
              </div>
            );
          }
          return (
            <img key={img.id || i} src={img.url_imagen} alt={img.nombre} className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
          );
        })}
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
}

function TagWithPreview({ label, variant, images, children }) {
  const ref = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'inline-block' }}
    >
      <Badge variant={variant}>{label}</Badge>
      {hovered && (
        <TagPreviewTooltip
          anchorRef={ref}
          show={true}
          images={images}
        />
      )}
      {children}
    </span>
  );
}

function PerfilContent() {
  const { data: session, status } = useSession();
  const [personalCollection, setPersonalCollection] = useState([]);
  const [collectionStats, setCollectionStats] = useState({});
  const [museumStats, setMuseumStats] = useState({
    totalArtworks: 0,
    totalSalas: 0,
    totalArtists: 0,
    totalTechniques: 0,
    salas: [],
  });
  const [muralesStats, setMuralesStats] = useState({
    total: 0,
    porSala: {},
    porTecnica: {},
    porAnio: {},
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [hoveredTag, setHoveredTag] = React.useState({ type: null, value: null, anchor: null });
  const [murales, setMurales] = React.useState([]);

  const userId = session?.user?.id || null;

  // Cargar estadísticas del museo
  useEffect(() => {
    const fetchMuseumStats = async () => {
      try {
        console.log("Iniciando fetchMuseumStats...");
        setIsLoadingStats(true);

        // Obtener salas
        console.log("Fetching salas...");
        const salasResponse = await fetch("/api/salas");
        const salasData = await salasResponse.json();

        // Obtener murales
        console.log("Fetching murales...");
        const muralesResponse = await fetch("/api/murales");
        const muralesData = await muralesResponse.json();

        console.log("Salas response status:", salasResponse.status);
        console.log("Murales response status:", muralesResponse.status);
        console.log("Salas data:", salasData);
        console.log("Murales data:", muralesData);

        // Las APIs devuelven directamente los datos, no con un campo 'success'
        if (
          salasResponse.ok &&
          muralesResponse.ok &&
          salasData.salas &&
          muralesData.murales
        ) {
          const salas = salasData.salas || [];
          const murales = muralesData.murales || [];

          console.log("Salas count:", salas.length);
          console.log("Murales count:", murales.length);

          // Calcular estadísticas
          const uniqueArtists = new Set(
            murales.map((m) => m.autor).filter(Boolean)
          ).size;
          const uniqueTechniques = new Set(
            murales.map((m) => m.tecnica).filter(Boolean)
          ).size;

          const newStats = {
            totalArtworks: murales.length,
            totalSalas: salas.length,
            totalArtists: uniqueArtists,
            totalTechniques: uniqueTechniques,
            salas: salas.slice(0, 4), // Solo mostrar las primeras 4 salas
          };

          console.log("Setting new museum stats:", newStats);
          setMuseumStats(newStats);
          setMuralesStats(muralesData.estadisticas);
          setMurales(murales);
        } else {
          console.log("API calls failed or returned invalid structure");
          console.log("salasResponse.ok:", salasResponse.ok);
          console.log("muralesResponse.ok:", muralesResponse.ok);
          console.log("Has salas data:", !!salasData.salas);
          console.log("Has murales data:", !!muralesData.murales);
          // Datos de respaldo si las APIs fallan
          setMuseumStats({
            totalArtworks: 0,
            totalSalas: 0,
            totalArtists: 0,
            totalTechniques: 0,
            salas: [],
          });
          setMuralesStats({ total: 0, porSala: {}, porTecnica: {}, porAnio: {} });
          setMurales([]);
        }
      } catch (error) {
        console.error("Error fetching museum stats:", error);
        // Datos de respaldo en caso de error
        setMuseumStats({
          totalArtworks: 0,
          totalSalas: 0,
          totalArtists: 0,
          totalTechniques: 0,
          salas: [],
        });
        setMuralesStats({ total: 0, porSala: {}, porTecnica: {}, porAnio: {} });
        setMurales([]);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchMuseumStats();
  }, []);

  // Debug: Monitor changes in museumStats
  useEffect(() => {
    console.log("museumStats updated:", museumStats);
  }, [museumStats]);

  // Cargar colección personal
  useEffect(() => {
    if (status !== "loading" && userId) {
      const collection = getPersonalCollection(userId);
      const stats = getCollectionStats(userId);
      setPersonalCollection(collection);
      setCollectionStats(stats);
    }
  }, [userId, status]);

  if (status === "loading") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <RainbowBackground />
        <div className="z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <RainbowBackground />
        <Card className="z-10 max-w-md w-full p-8 text-center">
          <CardTitle className="mb-4">Acceso requerido</CardTitle>
          <p className="text-muted-foreground mb-6">
            Debes iniciar sesión para ver tu perfil y colección personal.
          </p>
          <Button onClick={() => (window.location.href = "/")}>Ir al inicio</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-10">
      <RainbowBackground />
      <div className="z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 min-h-screen h-full">
        {/* Sidebar Perfil */}
        <div className="md:col-span-1 flex flex-col items-center h-full">
          <Card className="w-full max-w-xs p-8 text-center shadow-xl h-full min-h-[400px] flex flex-col justify-start">
            <CardHeader className="flex flex-col items-center gap-2 border-b pb-4">
              <Avatar className="size-20 mb-2">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'Avatar'} />
                <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-semibold">{session?.user?.name || 'Usuario'}</CardTitle>
              <Badge variant="secondary" className="mt-1">Usuario</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 mt-4">
              <div className="text-left">
                <Label>Email</Label>
                <div className="text-sm text-muted-foreground mt-1">{session?.user?.email || 'No disponible'}</div>
              </div>
              <div className="text-left">
                <Label>ID de usuario</Label>
                <div className="text-xs font-mono text-muted-foreground mt-1">{userId || 'No disponible'}</div>
              </div>
            </CardContent>
            <div className="mt-6 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              La información se obtiene de tu proveedor de autenticación.<br />Para cambios, contacta al administrador.
            </div>
          </Card>
        </div>
        {/* Main content: Estadísticas y Colección */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <Card className="w-full max-w-2xl mx-auto p-8 mb-4">
            <CardHeader className="mb-4">
              <CardTitle className="text-lg font-semibold">Estadísticas del museo</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-center text-muted-foreground">Cargando estadísticas...</div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <SalaIcon className="w-6 h-6 text-blue-500" />
                        <span className="text-2xl font-bold">{museumStats.totalSalas}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Salas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MuralIcon className="w-6 h-6 text-indigo-500" />
                        <span className="text-2xl font-bold">{museumStats.totalArtworks}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Murales</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ArtistaIcon className="w-6 h-6 text-rose-500" />
                        <span className="text-2xl font-bold">{museumStats.totalArtists}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Artistas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TecnicaIcon className="w-6 h-6 text-green-500" />
                        <span className="text-2xl font-bold">{museumStats.totalTechniques}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Técnicas</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Técnicas más usadas</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(muralesStats.porTecnica || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([tecnica, count], i) => (
                          <TagWithPreview
                            key={tecnica}
                            label={`${tecnica} (${count})`}
                            variant={i === 0 ? 'blue' : i === 1 ? 'green' : 'violet'}
                            images={murales.filter(m => m.tecnica === tecnica && m.url_imagen)}
                          />
                        ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Murales por año (últimos 5)</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(muralesStats.porAnio || {})
                        .sort((a, b) => b[0] - a[0])
                        .slice(0, 5)
                        .map(([anio, count], i) => (
                          <TagWithPreview
                            key={anio}
                            label={`${anio}: ${count}`}
                            variant={i % 2 === 0 ? 'yellow' : 'pink'}
                            images={murales.filter(m => String(m.anio) === String(anio) && m.url_imagen)}
                          />
                        ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Salas con más murales</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(muralesStats.porSala || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([sala, count], i) => (
                          <TagWithPreview
                            key={sala}
                            label={`${sala}: ${count}`}
                            variant={i === 0 ? 'violet' : i === 1 ? 'blue' : 'green'}
                            images={murales.filter(m => (m.sala?.nombre || 'Sin sala') === sala && m.url_imagen)}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="w-full max-w-2xl mx-auto p-8">
            <CardHeader className="mb-4">
              <CardTitle className="text-lg font-semibold">Mi colección personal</CardTitle>
            </CardHeader>
            <CardContent>
              {personalCollection.length === 0 ? (
                <div className="text-center text-muted-foreground">No tienes obras guardadas en tu colección.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MuralIcon className="w-6 h-6 text-indigo-500" />
                        <span className="text-2xl font-bold">{collectionStats.totalArtworks}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Obras</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ArtistaIcon className="w-6 h-6 text-rose-500" />
                        <span className="text-2xl font-bold">{collectionStats.uniqueArtists}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Artistas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TecnicaIcon className="w-6 h-6 text-green-500" />
                        <span className="text-2xl font-bold">{collectionStats.uniqueTechniques}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Técnicas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 17l4 4 4-4m-4-5v9"/></svg>
                        <span className="text-2xl font-bold">{collectionStats.oldestYear || '-'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Año más antiguo</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Obras guardadas</div>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {personalCollection.map((item) => (
                        <CollectionItem key={item.id} item={item} allItems={personalCollection} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Button asChild>
                      <Link href="/mis-documentos">Gestionar colección avanzada</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Perfil() {
  return (
    <ProtectedRoute requireAuth={true}>
      <PerfilContent />
    </ProtectedRoute>
  );
}
