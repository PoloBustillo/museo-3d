"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
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
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon } from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function ImageTooltip({ src, alt, anchorRef, show }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tooltipWidth = 260;
  const tooltipHeight = 260;
  useEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      let top, left;
      const padding = 8;
      // Mobile: centrar abajo, Desktop: derecha
      if (window.innerWidth < 600) {
        // Centrar horizontalmente sobre el elemento, mostrar abajo
        left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
        top = rect.bottom + padding + window.scrollY;
        // Si se sale por la izquierda
        if (left < padding) left = padding;
        // Si se sale por la derecha
        if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;
        // Si se sale por abajo, mostrar arriba
        if (top + tooltipHeight > window.innerHeight + window.scrollY - padding) {
          top = rect.top - tooltipHeight - padding + window.scrollY;
        }
      } else {
        // Desktop: mostrar a la derecha
        left = rect.right + padding + window.scrollX;
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        // Si se sale por la derecha
        if (left + tooltipWidth > window.innerWidth - padding) left = rect.left - tooltipWidth - padding + window.scrollX;
        // Si se sale por la izquierda
        if (left < padding) left = padding;
        // Si se sale por arriba
        if (top < padding) top = padding;
        // Si se sale por abajo
        if (top + tooltipHeight > window.innerHeight + window.scrollY - padding) top = window.innerHeight + window.scrollY - tooltipHeight - padding;
      }
      setPos({ top, left });
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
        width: tooltipWidth,
        height: tooltipHeight,
        maxWidth: "90vw",
        maxHeight: "90vw",
      }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 flex items-center justify-center"
    >
      <img src={src} alt={alt} className="w-56 h-56 object-contain rounded-lg" />
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
}

function CollectionItem({ item, allItems }) {
  const imgRef = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);
  return (
    <div className="flex items-center gap-4 border-b py-2 relative group">
      {item.src && (
        <>
          <img
            ref={imgRef}
            src={item.src}
            alt={item.title}
            className="w-12 h-12 object-cover rounded-md cursor-pointer group-hover:ring-2 group-hover:ring-primary transition ml-2"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
          <ImageTooltip src={item.src} alt={item.title} anchorRef={imgRef} show={hovered} />
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
  const tooltipWidth = 320;
  const tooltipHeight = 120;
  React.useEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      let top, left;
      const padding = 8;
      if (window.innerWidth < 600) {
        // Mobile: centrar horizontalmente sobre el tag, mostrar abajo
        left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
        top = rect.bottom + padding + window.scrollY;
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;
        if (top + tooltipHeight > window.innerHeight + window.scrollY - padding) {
          top = rect.top - tooltipHeight - padding + window.scrollY;
        }
      } else {
        // Desktop: mostrar a la derecha
        left = rect.right + padding + window.scrollX;
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        if (left + tooltipWidth > window.innerWidth - padding) left = rect.left - tooltipWidth - padding + window.scrollX;
        if (left < padding) left = padding;
        if (top < padding) top = padding;
        if (top + tooltipHeight > window.innerHeight + window.scrollY - padding) top = window.innerHeight + window.scrollY - tooltipHeight - padding;
      }
      setPos({ top, left });
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
        width: tooltipWidth,
        height: tooltipHeight,
        maxWidth: "90vw",
        maxHeight: "90vw",
      }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 flex items-center justify-center"
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

function AvatarTooltip({ src, alt, anchorRef, show }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tooltipWidth = 260;
  const tooltipHeight = 260;
  useEffect(() => {
    if (show && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      let top, left;
      const padding = 8;
      if (window.innerWidth < 600) {
        // Mobile: centrar horizontalmente sobre el avatar, mostrar abajo
        left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
        top = rect.bottom + padding + window.scrollY;
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;
        if (top + tooltipHeight > window.innerHeight + window.scrollY - padding) {
          top = rect.top - tooltipHeight - padding + window.scrollY;
        }
      } else {
        // Desktop: mostrar a la derecha
        left = rect.right + padding + window.scrollX;
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        if (left + tooltipWidth > window.innerWidth - padding) left = rect.left - tooltipWidth - padding + window.scrollX;
        if (left < padding) left = padding;
        if (top < padding) top = padding;
        if (top + tooltipHeight > window.innerHeight + window.scrollY - padding) top = window.innerHeight + window.scrollY - tooltipHeight - padding;
      }
      setPos({ top, left });
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
        width: tooltipWidth,
        height: tooltipHeight,
        maxWidth: "90vw",
        maxHeight: "90vw",
      }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2 flex items-center justify-center"
    >
      <img src={src} alt={alt} className="w-56 h-56 object-contain rounded-lg" />
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
}

function PerfilAvatarEdit({ imagePreview, newName, handleImageChange, handleNameChange, checkingName, nameAvailable, saving, updating, updateError, updateSuccess, setEditMode, handleSave, fileInputRef }) {
  const avatarRef = useRef();
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <div className="relative mb-2">
        <span
          ref={avatarRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ display: 'inline-block' }}
        >
          <Avatar className="size-32">
            <AvatarImage src={imagePreview} alt={newName || 'Avatar'} />
            <AvatarFallback>{newName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <AvatarTooltip src={imagePreview} alt={newName || 'Avatar'} anchorRef={avatarRef} show={hovered} />
        </span>
        <button
          className="absolute bottom-2 right-2 rounded-full p-2 shadow-lg border border-white bg-black text-white hover:bg-black/90"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" stroke="currentColor" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      <input
        type="text"
        className="border rounded-lg px-3 py-2 text-center w-full mb-2"
        value={newName}
        onChange={handleNameChange}
        disabled={checkingName || saving || updating}
        maxLength={32}
      />
      {checkingName && <div className="text-xs text-muted-foreground">Comprobando disponibilidad...</div>}
      {nameAvailable === false && <div className="text-xs text-red-500">Nombre no disponible</div>}
      {nameAvailable === true && <div className="text-xs text-green-600">¡Nombre disponible!</div>}
      {updateError && <div className="text-xs text-red-500">{updateError}</div>}
      {updateSuccess && <div className="text-xs text-green-600">¡Perfil actualizado!</div>}
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="outline" onClick={() => setEditMode(false)} disabled={saving || updating}>Cancelar</Button>
        <Button size="sm" onClick={handleSave} disabled={saving || updating || nameAvailable !== true || newName.length < 3}>
          {(saving || updating) ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </>
  );
}

function PerfilAvatarView({ image, name, onEdit }) {
  const avatarRef = useRef();
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <span
        ref={avatarRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: 'inline-block' }}
      >
        <Avatar className="size-32 mb-2">
          <AvatarImage src={image || undefined} alt={name || 'Avatar'} />
          <AvatarFallback>{name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <AvatarTooltip src={image || undefined} alt={name || 'Avatar'} anchorRef={avatarRef} show={hovered} />
      </span>
      <CardTitle className="text-lg font-semibold">{name || 'Usuario'}</CardTitle>
      <Badge variant="secondary" className="mt-1">Usuario</Badge>
      <Button size="sm" className="mt-2" onClick={onEdit}>
        Editar perfil
      </Button>
    </>
  );
}

function PerfilContent() {
  const { data: session, status, update } = useSession();
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
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(session?.user?.name || "");
  const [newImage, setNewImage] = useState(session?.user?.image || "");
  const [imagePreview, setImagePreview] = useState(session?.user?.image || "");
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null); // null | true | false
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();
  const { updateProfile, loading: updating, error: updateError, success: updateSuccess } = useUpdateProfile();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [subsEnabled, setSubsEnabled] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const switchesInitialized = useRef(false);
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifMsg, setVerifMsg] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const debounceRef = useRef();

  const userId = session?.user?.id || null;

  useEffect(() => {
    if (
      session?.user?.settings &&
      !switchesInitialized.current
    ) {
      setNotifEnabled(session.user.settings.notificaciones === "true");
      setSubsEnabled(session.user.settings.subscripcion === "true");
      setEmailValidated(session.user.settings.emailValidated === "true");
      switchesInitialized.current = true;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status !== "loading") setInitialLoading(false);
  }, [status]);

  // SWR para estadísticas del museo
  const { data: salasData, isLoading: salasLoading, error: salasError } = useSWR("/api/salas", fetcher);
  const { data: muralesData, isLoading: muralesLoading, error: muralesError } = useSWR("/api/murales", fetcher);

  useEffect(() => {
    if (
      salasData &&
      muralesData &&
      salasData.salas &&
      muralesData.murales
    ) {
      const salas = salasData.salas || [];
      const murales = muralesData.murales || [];
      const uniqueArtists = new Set(murales.map((m) => m.autor).filter(Boolean)).size;
      const uniqueTechniques = new Set(murales.map((m) => m.tecnica).filter(Boolean)).size;
      setMuseumStats({
        totalArtworks: murales.length,
        totalSalas: salas.length,
        totalArtists: uniqueArtists,
        totalTechniques: uniqueTechniques,
        salas: salas.slice(0, 4),
      });
      setMuralesStats(muralesData.estadisticas);
      setMurales(murales);
      setIsLoadingStats(false);
    } else if (salasError || muralesError) {
      setMuseumStats({
        totalArtworks: 0,
        totalSalas: 0,
        totalArtists: 0,
        totalTechniques: 0,
        salas: [],
      });
      setMuralesStats({ total: 0, porSala: {}, porTecnica: {}, porAnio: {} });
      setMurales([]);
      setIsLoadingStats(false);
    } else if (salasLoading || muralesLoading) {
      setIsLoadingStats(true);
    }
  }, [salasData, muralesData, salasLoading, muralesLoading, salasError, muralesError]);

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

  // Simulación de validación de nombre (reemplazar con API real)
  async function checkNameAvailability(name) {
    setCheckingName(true);
    try {
      const res = await fetch(`/api/usuarios?name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setNameAvailable(data.available);
      } else {
        setNameAvailable(null);
      }
    } catch (e) {
      setNameAvailable(null);
    }
    setCheckingName(false);
  }

  function handleNameChange(e) {
    setNewName(e.target.value);
    setNameAvailable(null);
  }

  useEffect(() => {
    if (newName.length > 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const valueToCheck = newName;
      debounceRef.current = setTimeout(() => {
        setCheckingName(true);
        checkNameAvailability(valueToCheck);
      }, 1200);
    } else {
      setNameAvailable(null);
      setCheckingName(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newName]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
      setNewImage(file);
    }
  }

  function handleSave() {
    setSaving(true);
    updateProfile({
      name: newName,
      imageFile: newImage instanceof File ? newImage : null,
    })
      .then(() => {
        setEditMode(false);
        setSaving(false);
      })
      .catch(() => {
        setSaving(false);
      });
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleteLoading(true);
    // Simulación: en real, llamar a API para eliminar cuenta
    setTimeout(() => {
      if (deleteEmail !== session?.user?.email) {
        setDeleteError("El email no coincide");
        setDeleteLoading(false);
        return;
      }
      setDeleteSuccess(true);
      setDeleteLoading(false);
      // Aquí iría signOut y redirección
    }, 1200);
  }

  async function handleSettingsChange(newSettings) {
    if (!session?.user?.id) return;
    await fetch(`/api/usuarios/${session.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: newSettings }),
    });
    if (typeof update === "function") {
      await update();
    }
  }

  const onNotifChange = async (checked, e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setNotifEnabled(checked);
    await handleSettingsChange({
      ...session.user.settings,
      notificaciones: checked ? "true" : "false",
      subscripcion: subsEnabled ? "true" : "false",
      emailValidated: emailValidated ? "true" : "false",
    });
  };
  const onSubsChange = async (checked, e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setSubsEnabled(checked);
    await handleSettingsChange({
      ...session.user.settings,
      notificaciones: notifEnabled ? "true" : "false",
      subscripcion: checked ? "true" : "false",
      emailValidated: emailValidated ? "true" : "false",
    });
  };

  // Simulación de verificación de email
  const handleVerifyEmail = async () => {
    setVerifLoading(true);
    setVerifMsg("");
    // Simula un proceso de verificación
    setTimeout(async () => {
      setEmailValidated(true);
      await handleSettingsChange({
        ...session.user.settings,
        notificaciones: notifEnabled ? "true" : "false",
        subscripcion: subsEnabled ? "true" : "false",
        emailValidated: "true",
      });
      setVerifMsg("¡Email verificado!");
      setVerifLoading(false);
    }, 1200);
  };

  if (initialLoading) {
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
    <div className="relative min-h-screen flex items-center justify-center pt-8 md:pt-12">
      <RainbowBackground />
      <div className="z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8 px-4 sm:px-8 h-full">
        {/* Sidebar Perfil */}
        <div className="md:col-span-1 flex flex-col h-full md:max-w-md mx-auto w-full">
          <Card className="w-full p-4 md:p-6 text-center shadow-xl h-full min-h-[400px] flex flex-col justify-start">
            <CardHeader className="flex flex-col items-center gap-2 border-b pb-4">
              {editMode ? (
                <PerfilAvatarEdit
                  imagePreview={imagePreview}
                  newName={newName}
                  handleImageChange={handleImageChange}
                  handleNameChange={handleNameChange}
                  checkingName={checkingName}
                  nameAvailable={nameAvailable}
                  saving={saving}
                  updating={updating}
                  updateError={updateError}
                  updateSuccess={updateSuccess}
                  setEditMode={setEditMode}
                  handleSave={handleSave}
                  fileInputRef={fileInputRef}
                />
              ) : (
                <PerfilAvatarView
                  image={session?.user?.image}
                  name={session?.user?.name}
                  onEdit={() => setEditMode(true)}
                />
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4 mt-4">
              {/* Info de perfil */}
              <div className="w-full text-left mb-6">
                <div className="text-left">
                  <Label>Email</Label>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    {session?.user?.email || 'No disponible'}
                    {emailValidated ? (
                      <Badge variant="success">Verificado</Badge>
                    ) : (
                      <a
                        href="#"
                        className="text-primary underline text-xs font-medium hover:text-primary/80 transition"
                        onClick={e => { e.preventDefault(); handleVerifyEmail(); }}
                        disabled={verifLoading}
                      >
                        {verifLoading ? "Verificando..." : "Verificar email"}
                      </a>
                    )}
                  </div>
                  {verifMsg && <div className="text-xs text-green-600 mt-1">{verifMsg}</div>}
                </div>
                <div className="text-left mt-2">
                  <Label>ID de usuario</Label>
                  <div className="text-xs font-mono text-muted-foreground mt-1">{userId || 'No disponible'}</div>
                </div>
                <div className="text-left mt-4">
                  <Label>Notificaciones</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                    <Switch checked={notifEnabled} onCheckedChange={(checked, e) => onNotifChange(checked, e)} />
                    <span className="text-xs text-muted-foreground">{notifEnabled ? "Activadas" : "Desactivadas"}</span>
                  </div>
                </div>
                <div className="text-left mt-2">
                  <Label>Suscripción</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                    <Switch checked={subsEnabled} onCheckedChange={(checked, e) => onSubsChange(checked, e)} />
                    <span className="text-xs text-muted-foreground">{subsEnabled ? "Activa" : "Inactiva"}</span>
                  </div>
                </div>
                <div className="text-left mt-2">
                  <Label>Email verificado</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch checked={emailValidated} disabled />
                    {emailValidated ? (
                      <Badge variant="success">Verificado</Badge>
                    ) : (
                      <a
                        href="#"
                        className="text-primary underline text-xs font-medium hover:text-primary/80 transition"
                        onClick={e => { e.preventDefault(); handleVerifyEmail(); }}
                        disabled={verifLoading}
                      >
                        {verifLoading ? "Verificando..." : "Verificar email"}
                      </a>
                    )}
                  </div>
                  {verifMsg && <div className="text-xs text-green-600 mt-1">{verifMsg}</div>}
                </div>
                <div className="text-left mt-4">
                  <Button size="sm" variant="destructive" className="w-full" onClick={() => setShowDelete((v) => !v)}>
                    Eliminar cuenta
                  </Button>
                </div>
                {showDelete && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mt-4 flex flex-col gap-2">
                    <div className="text-sm text-red-700 dark:text-red-300 font-medium">¿Estás seguro? Esta acción es irreversible.</div>
                    <div className="text-xs text-muted-foreground">Escribe tu email para confirmar:</div>
                    <Input
                      type="email"
                      value={deleteEmail}
                      onChange={e => setDeleteEmail(e.target.value)}
                      placeholder="Tu email"
                      disabled={deleteLoading || deleteSuccess}
                    />
                    {deleteError && <div className="text-xs text-red-500">{deleteError}</div>}
                    {deleteSuccess && <div className="text-xs text-green-600">Cuenta eliminada (simulado)</div>}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setShowDelete(false)} disabled={deleteLoading || deleteSuccess}>Cancelar</Button>
                      <Button size="sm" variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading || deleteSuccess || !deleteEmail}>
                        {deleteLoading ? "Eliminando..." : "Confirmar eliminación"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="my-2 border-t border-muted-foreground/10 dark:border-neutral-800" />
              {/* Mensaje de proveedor */}
              <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                La información se obtiene de tu proveedor de autenticación.<br />Para cambios, contacta al administrador.
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Main content: Estadísticas y Colección */}
        <div className="md:col-span-1 flex flex-col gap-8 w-full">
          <Card className="w-full p-8 mb-4">
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
                        <SalaIcon className="w-10 h-10 text-blue-500" />
                        <span className="text-2xl font-bold">{museumStats.totalSalas}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Salas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MuralIcon className="w-10 h-10 text-indigo-500" />
                        <span className="text-2xl font-bold">{museumStats.totalArtworks}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Murales</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ArtistaIcon className="w-10 h-10 text-rose-500" />
                        <span className="text-2xl font-bold">{museumStats.totalArtists}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Artistas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TecnicaIcon className="w-10 h-10 text-green-500" />
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
          <Card className="w-full p-8">
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
                        <MuralIcon className="w-10 h-10 text-indigo-500" />
                        <span className="text-2xl font-bold">{collectionStats.totalArtworks}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Obras</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ArtistaIcon className="w-10 h-10 text-rose-500" />
                        <span className="text-2xl font-bold">{collectionStats.uniqueArtists}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Artistas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TecnicaIcon className="w-10 h-10 text-green-500" />
                        <span className="text-2xl font-bold">{collectionStats.uniqueTechniques}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Técnicas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 17l4 4 4-4m-4-5v9"/></svg>
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
