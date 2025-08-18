"use client";
import { SessionProvider } from "../providers/SessionProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { UserProvider } from "../providers/UserProvider";
import { ModalProvider } from "../providers/ModalProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import { SoundProvider } from "../providers/SoundProvider";
import { GalleryProvider } from "../providers/GalleryProvider";
import { DeviceProvider } from "../providers/DeviceProvider";
import { CollectionProvider } from "../providers/CollectionProvider";
import AuthModal from "./AuthModal";
import { ModalWrapper } from "./ui/Modal";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNotification } from "../providers/NotificationProvider";
import { useCollection } from "../providers/CollectionProvider";

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <UserProvider>
          <ModalProvider>
            <NotificationProvider>
              <SoundProvider>
                <GalleryProvider>
                  <DeviceProvider>
                    <CollectionProvider>
                      {children}
                      <AuthModal />
                      <ModalWrapper
                        modalName="info-modal"
                        title="Información"
                        size="md"
                      >
                        {(data) => (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-4xl mb-4">ℹ️</div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {data?.title || "Información"}
                              </h3>
                              <p className="text-gray-600">
                                {data?.content ||
                                  "Este es un modal de ejemplo usando el ModalProvider."}
                              </p>
                            </div>
                          </div>
                        )}
                      </ModalWrapper>

                      {/* Modal de información del usuario */}
                      <ModalWrapper
                        modalName="user-info-modal"
                        title="Información del Usuario"
                        size="lg"
                      >
                        {(data) => (
                          <div className="space-y-6">
                            {data?.user && (
                              <>
                                <div className="flex items-center gap-4">
                                  <img
                                    src={
                                      data.user.image ||
                                      "/assets/default-avatar.svg"
                                    }
                                    alt={data.user.name || "Usuario"}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                      {data.user.name || "Usuario"}
                                    </h3>
                                    <p className="text-gray-600">
                                      {data.user.email}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Rol:{" "}
                                      <span className="font-medium">
                                        {data.role}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {data?.userProfile && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                      Perfil Completo
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <span className="font-medium">ID:</span>{" "}
                                        {data.userProfile.id}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Email verificado:
                                        </span>{" "}
                                        {data.userProfile.emailVerified
                                          ? "Sí"
                                          : "No"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Proveedor:
                                        </span>{" "}
                                        {data.userProfile.provider || "N/A"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Creado:
                                        </span>{" "}
                                        {new Date(
                                          data.userProfile.creadoEn
                                        ).toLocaleDateString("es-ES")}
                                      </p>

                                      {data.userProfile.roles && (
                                        <div>
                                          <span className="font-medium">
                                            Roles:
                                          </span>
                                          <div className="flex gap-1 mt-1">
                                            {data.userProfile.roles.map(
                                              (role, index) => (
                                                <span
                                                  key={index}
                                                  className={`text-xs px-2 py-1 rounded-full ${
                                                    role === "admin"
                                                      ? "bg-red-100 text-red-800"
                                                      : role === "moderator"
                                                      ? "bg-yellow-100 text-yellow-800"
                                                      : "bg-blue-100 text-blue-800"
                                                  }`}
                                                >
                                                  {role}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {data.userProfile.settings &&
                                        Object.keys(data.userProfile.settings)
                                          .length > 0 && (
                                          <div>
                                            <span className="font-medium">
                                              Configuraciones:
                                            </span>
                                            <div className="mt-1 space-y-1">
                                              {Object.entries(
                                                data.userProfile.settings
                                              ).map(([key, value]) => (
                                                <p
                                                  key={key}
                                                  className="text-xs"
                                                >
                                                  {key}: {value}
                                                </p>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                )}

                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-2">
                                    Características del UserProvider:
                                  </h4>
                                  <ul className="text-sm text-blue-800 space-y-1">
                                    <li>
                                      • ✅ Gestión centralizada del usuario
                                    </li>
                                    <li>• ✅ Carga automática del perfil</li>
                                    <li>• ✅ Sistema de roles y permisos</li>
                                    <li>• ✅ Configuraciones personalizadas</li>
                                    <li>• ✅ Funciones de actualización</li>
                                  </ul>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </ModalWrapper>

                      {/* Modal de éxito */}
                      <ModalWrapper
                        modalName="success-modal"
                        title="Éxito"
                        size="sm"
                      >
                        {(data) => (
                          <div className="text-center space-y-4">
                            <div className="text-6xl">✅</div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {data?.title || "Operación Exitosa"}
                            </h3>
                            <p className="text-gray-600">
                              {data?.content ||
                                "La operación se completó correctamente."}
                            </p>
                          </div>
                        )}
                      </ModalWrapper>

                      {/* Modal de error */}
                      <ModalWrapper
                        modalName="error-modal"
                        title="Error"
                        size="sm"
                      >
                        {(data) => (
                          <div className="text-center space-y-4">
                            <div className="text-6xl">❌</div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {data?.title || "Error"}
                            </h3>
                            <p className="text-gray-600">
                              {data?.content ||
                                "Ha ocurrido un error. Inténtalo de nuevo."}
                            </p>
                          </div>
                        )}
                      </ModalWrapper>

                      {/* Modal de obras */}
                      <ModalWrapper
                        modalName="artwork-modal"
                        title="Obra"
                        size="xl"
                      >
                        {(data) => {
                          const art = data?.artwork;
                          if (!art)
                            return (
                              <p className="text-center text-muted-foreground">
                                Sin datos
                              </p>
                            );
                          return <ArtworkModalContent artwork={art} />;
                        }}
                      </ModalWrapper>
                    </CollectionProvider>
                  </DeviceProvider>
                </GalleryProvider>
              </SoundProvider>
            </NotificationProvider>
          </ModalProvider>
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

function ArtworkModalContent({ artwork }) {
  // Estado de imagen
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1); // escala mínima (fit)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef(false);
  const origin = useRef({ x: 0, y: 0, panX: 0, panY: 0, button: 0 });
  // UI state
  const [sectionOpen, setSectionOpen] = useState({ desc: true, meta: true });
  const { notify } = useNotification();
  const { isInCollection, addToCollection, removeFromCollection } = useCollection();
  const favorite = useMemo(() => isInCollection(artwork.id), [artwork.id, isInCollection]);

  const MIN_EXTRA = 0.15; // margen adicional sobre fit
  const MAX_ZOOM = 6;

  const computeFit = useCallback(() => {
    const c = containerRef.current;
    const img = imgRef.current;
    if (!c || !img) return;
    const cw = c.clientWidth;
    const ch = c.clientHeight;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.min(cw / iw, ch / ih);
    setFitZoom(scale);
    setZoom(scale);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => { if (loaded) computeFit(); }, [loaded, computeFit]);
  useEffect(() => { const onResize = () => computeFit(); window.addEventListener("resize", onResize); return () => window.removeEventListener("resize", onResize); }, [computeFit]);

  const clampZoom = useCallback((v) => Math.max(fitZoom - fitZoom * MIN_EXTRA, Math.min(MAX_ZOOM, v)), [fitZoom]);

  const focalZoom = useCallback((direction, clientX, clientY) => {
    const c = containerRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const offsetX = clientX - rect.left - rect.width / 2 - pan.x;
    const offsetY = clientY - rect.top - rect.height / 2 - pan.y;
    setZoom((prev) => {
      const next = clampZoom(prev * (direction > 0 ? 1.15 : 0.85));
      const factor = next / prev;
      setPan((p) => ({ x: p.x - offsetX * (factor - 1), y: p.y - offsetY * (factor - 1) }));
      return next;
    });
  }, [clampZoom, pan.x, pan.y]);

  const onWheel = useCallback((e) => { e.preventDefault(); focalZoom(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY); }, [focalZoom]);
  useEffect(() => { const el = containerRef.current; if (!el) return; el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel); }, [onWheel]);

  // Drag solo con click derecho (button === 2)
  const startDrag = (e) => {
    // permitir arrastrar con botón izquierdo normal
    if (zoom <= fitZoom) return;
    drag.current = true;
    origin.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, button: e.button };
  };
  const onMove = (e) => { if (!drag.current) return; e.preventDefault(); const dx = e.clientX - origin.current.x; const dy = e.clientY - origin.current.y; setPan({ x: origin.current.panX + dx, y: origin.current.panY + dy }); };
  const endDrag = () => { drag.current = false; };
  useEffect(() => { window.addEventListener("pointerup", endDrag); window.addEventListener("pointerleave", endDrag); return () => { window.removeEventListener("pointerup", endDrag); window.removeEventListener("pointerleave", endDrag); }; }, []);

  const resetView = () => { setZoom(fitZoom); setPan({ x: 0, y: 0 }); };
  const zoomIn = () => focalZoom(1, window.innerWidth / 2, window.innerHeight / 2);
  const zoomOut = () => focalZoom(-1, window.innerWidth / 2, window.innerHeight / 2);
  const onDoubleClick = (e) => { if (zoom <= fitZoom * 1.02) { focalZoom(1, e.clientX, e.clientY); focalZoom(1, e.clientX, e.clientY); } else { resetView(); } };

  // Favorito
  const toggleFavorite = async () => { try { if (favorite) { await removeFromCollection(artwork.id); notify("Removido de favoritos", "info"); } else { await addToCollection(artwork.id, artwork.type || "mural", artwork); notify("Agregado a favoritos", "success"); } } catch (err) { notify(err.message || "Error", "error"); } };

  // Atajos de teclado (sin fullscreen)
  useEffect(() => { const handler = (e) => { if (e.key === "+" || e.key === "=") zoomIn(); else if (e.key === "-" || e.key === "_") zoomOut(); else if (e.key === "0") resetView(); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [zoomIn, zoomOut]);

  const hasImage = artwork.imagenUrlWebp || artwork.url_imagen || artwork.imageUrl;
  const imgSrc = hasImage || '/images/placeholder-artwork-1.jpg';

  return (
    <div className="flex flex-col gap-4 max-h-[80vh]">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        <div className="relative flex-1 rounded-xl border border-neutral-700/50 shadow-inner bg-neutral-900/80 backdrop-blur-sm h-[60vh]">
          <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden rounded-lg cursor-grab active:cursor-grabbing select-none"
            onPointerDown={startDrag}
            onPointerMove={onMove}
            onDoubleClick={onDoubleClick}
            onContextMenu={(e)=> e.preventDefault()}
            aria-label="Visor de obra"
            role="region"
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 animate-pulse">
                <div className="w-24 h-24 rounded-full bg-neutral-700/60 blur-sm" />
              </div>
            )}
            <img
              ref={imgRef}
              src={imgSrc}
              alt={artwork.titulo || artwork.title || 'Obra'}
              onLoad={() => setLoaded(true)}
              draggable={false}
              style={{ transform: `translate3d(${pan.x}px,${pan.y}px,0) scale(${zoom})`, transition: drag.current ? 'none' : 'transform .25s ease' }}
              className="max-w-none max-h-none top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 shadow-2xl rounded-md"
            />
            {zoom <= fitZoom && loaded && (
              <div className="absolute inset-x-0 bottom-3 text-center text-[11px] text-neutral-400 pointer-events-none">
                Doble clic para ampliar. Zoom con rueda. Arrastra con click derecho.
              </div>
            )}
          </div>
          {/* Controles flotantes (sin fullscreen) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2" aria-label="Controles de zoom">
            <IconButton label="Acercar" onClick={zoomIn}>+</IconButton>
            <IconButton label="Alejar" onClick={zoomOut}>−</IconButton>
            <IconButton label="Ajustar" onClick={resetView}>Fit</IconButton>
          </div>
          <div className="absolute top-3 left-3 flex gap-2 items-center">
            <span className="px-3 py-1 rounded-full bg-neutral-800/70 text-neutral-200 text-xs font-medium backdrop-blur border border-neutral-700/50">
              {artwork.tecnica || artwork.technique || 'Técnica'}
            </span>
            {(artwork.anio || artwork.year) && <span className="px-2 py-1 rounded bg-neutral-800/70 text-neutral-300 text-[11px] border border-neutral-700/40">{artwork.anio || artwork.year}</span>}
            {artwork.type && <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-200 text-[11px] border border-blue-700/40">{artwork.type}</span>}
          </div>
          <button
            onClick={toggleFavorite}
            aria-pressed={favorite}
            className={`absolute bottom-3 left-3 w-11 h-11 rounded-full flex items-center justify-center border transition-colors shadow ${favorite ? 'bg-pink-600 hover:bg-pink-500 border-pink-400' : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-600/40'}`}
            title={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {favorite ? '❤' : '♡'}
          </button>
        </div>
        {/* Panel lateral */}
        <aside className="w-full lg:w-96 flex flex-col overflow-y-auto pr-2" aria-label="Detalles de la obra">
          <header className="mb-2">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-100 leading-snug">{artwork.titulo || artwork.title}</h2>
            <p className="text-lg font-medium text-neutral-300">{artwork.autor || artwork.artist || 'Autor desconocido'}</p>
          </header>
          {artwork.descripcion && (
            <Section title="Descripción" open={sectionOpen.desc} onToggle={() => setSectionOpen(s => ({...s, desc: !s.desc}))}>
              <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">{artwork.descripcion}</p>
            </Section>
          )}
          <Section title="Metadatos" open={sectionOpen.meta} onToggle={() => setSectionOpen(s => ({...s, meta: !s.meta}))}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {artwork.type && <InfoBlock label="Tipo" value={artwork.type} />}
              <InfoBlock label="Dimensiones" value={`${artwork.width || '—'} × ${artwork.height || '—'} u.`} />
              {artwork.frameStyle && <InfoBlock label="Marco" value={artwork.frameStyle} />}
              {artwork.frameMaterial && <InfoBlock label="Material" value={artwork.frameMaterial} />}
              {artwork.material && <InfoBlock label="Soporte" value={artwork.material} />}
              {artwork.category && <InfoBlock label="Categoría" value={artwork.category} />}
            </div>
          </Section>
          {artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Etiquetas">
              {artwork.tags.map((t, i) => (<span key={i} className="px-2 py-1 rounded-full bg-neutral-800/60 text-[11px] text-neutral-300 border border-neutral-700/50">#{t}</span>))}
            </div>
          )}
          <div className="mt-auto pt-4 flex flex-wrap gap-3 border-t border-neutral-800/70">
            <button type="button" onClick={toggleFavorite} className={`px-4 py-2 rounded-md text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-pink-400/40 transition-colors ${favorite ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100'}`}>{favorite ? 'En favoritos' : 'Favorito'}</button>
            <button type="button" onClick={() => { navigator?.clipboard?.writeText(window.location.href).then(() => notify('Enlace copiado','success')).catch(()=>{}); }} className="px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600 text-neutral-100 text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-neutral-400/40">Compartir</button>
            <button type="button" onClick={resetView} className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-neutral-500/40">Ajustar</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-md px-3 py-2">
      <p className="text-neutral-400 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="text-neutral-200 mt-0.5 leading-snug">{value}</p>
    </div>
  );
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-10 h-10 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold shadow border border-neutral-600/40 focus:outline-none focus:ring-2 focus:ring-neutral-400/40"
    >
      {children}
    </button>
  );
}

function Section({ title, children, open, onToggle }) {
  return (
    <div className="border border-neutral-800/60 rounded-md bg-neutral-900/60 mb-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-xs opacity-70">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
