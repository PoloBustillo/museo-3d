"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useUser } from "../../../providers/UserProvider";
import { useModal } from "../../../providers/ModalProvider";
import { useState, useEffect, useRef } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectItem } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import GraffitiBackground from "../../acerca-de/GraffitiBackground";
import defaultAvatar from "public/assets/default-avatar.svg";
import ImageModal from "components/ui/ImageModal";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import AvatarTooltip from "../../components/ui/AvatarTooltip";
import React from "react";
import MuralIcon from "../../components/ui/icons/MuralIcon";
import SalaIcon from "../../components/ui/icons/SalaIcon";
import { User as UserIcon, Mail as MailIcon, UserCog as RoleIcon, User2 as User2Icon, Settings as SettingsIcon } from "lucide-react";

const ROLES = [
  { value: "USER", label: "Usuario" },
  { value: "ADMIN", label: "Admin" },
  { value: "ARTIST", label: "Artista" },
  { value: "CURATOR", label: "Curador" },
];

function UserAvatarCell({ user, defaultAvatar }) {
  const avatarRef = React.useRef();
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      ref={avatarRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "inline-block" }}
    >
      <Avatar className="w-12 h-12 mx-auto cursor-pointer border transition-transform duration-200 hover:scale-110">
        <AvatarImage
          src={user.image || defaultAvatar.src}
          alt={user.name || user.email}
          onError={e => { e.target.src = defaultAvatar.src; }}
        />
        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <AvatarTooltip
        src={user.image || defaultAvatar.src}
        alt={user.name || user.email}
        anchorRef={avatarRef}
        show={hovered}
      />
    </span>
  );
}

function AnimatedBlobsBackground() {
  return (
    <>
      {/* Light mode blobs: azulados/violetas */}
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-blue-200/60 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe block dark:hidden" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-violet-200/60 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed block dark:hidden" />
      <div className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe block dark:hidden" style={{ transform: "translate(-50%,-50%) scale(1.2)" }} />
      {/* Dark mode blobs: igual que antes */}
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-orange-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-pink-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed hidden dark:block" />
      <div className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-fuchsia-800/20 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe hidden dark:block" style={{ transform: "translate(-50%,-50%) scale(1.2)" }} />
    </>
  );
}

function DotsPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden dark:block"
      width="100%"
      height="100%"
      style={{ opacity: 0.13 }}
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

function MobileUserCard({ user, defaultAvatar, onDelete, onRoleChange, roles }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);
  return (
    <div className="relative flex flex-col items-center bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 px-4 py-5 mb-6">
      <Avatar className="w-16 h-16 mb-2">
        <AvatarImage src={user.image || defaultAvatar.src} alt={user.name || user.email} />
        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <div className="font-semibold text-base text-center mb-1 text-foreground">{user.name || <span className="italic text-muted-foreground">Sin nombre</span>}</div>
      <div className="text-xs text-muted-foreground mb-2 text-center break-all">{user.email}</div>
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="flex flex-col items-center text-xs">
          <SalaIcon className="w-5 h-5 mb-0.5 text-blue-500 dark:text-blue-300" />
          <span>{user._count?.salasPropias ?? 0}</span>
          <span className="text-[10px] text-muted-foreground">Salas</span>
        </div>
        <div className="flex flex-col items-center text-xs">
          <MuralIcon className="w-5 h-5 mb-0.5 text-pink-500 dark:text-pink-300" />
          <span>{user.muralesCount ?? 0}</span>
          <span className="text-[10px] text-muted-foreground">Murales</span>
        </div>
      </div>
      <button
        className="absolute bottom-3 right-3 p-2 rounded-full hover:bg-muted transition z-20"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Acciones"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>
      {menuOpen && (
        <div ref={menuRef} className="absolute bottom-12 right-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 w-48 z-30 animate-fade-in">
          <div className="mb-2">
            <span className="block text-xs text-muted-foreground mb-1">Rol</span>
            <Select value={user.role} onValueChange={val => { onRoleChange(user.id, val); setMenuOpen(false); }} className="w-full">
              {roles.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </Select>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full mt-1"
            onClick={() => { onDelete(user); setMenuOpen(false); }}
          >
            Eliminar usuario
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsuariosPage() {
  const { user, userProfile, isAdmin, isModerator, getUserRole } = useUser();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [userToDelete, setUserToDelete] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, role]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (role) params.append("role", role);
      const res = await fetch(`/api/usuarios?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(
          (data.usuarios || []).map(user => ({
            ...user,
            muralesCount: (user.salasPropias || []).reduce(
              (acc, sala) => acc + (sala._count?.murales || 0),
              0
            ),
          }))
        );
      }
    } catch (e) {
      toast.error("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await fetch(`/api/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("Rol actualizado");
        fetchUsers();
      } else {
        toast.error("No se pudo actualizar el rol");
      }
    } catch (e) {
      toast.error("Error al actualizar rol");
    }
  }

  const handleDeleteUser = (user) => setUserToDelete(user);
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/usuarios/${userToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Usuario eliminado");
        setUserToDelete(null);
        fetchUsers();
      } else {
        toast.error("No se pudo eliminar el usuario");
      }
    } catch (e) {
      toast.error("Error al eliminar usuario");
    }
  };

  if (status === "loading") return <div>Cargando...</div>;
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Acceso denegado</h2>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="relative min-h-screen overflow-x-hidden flex flex-col items-center justify-start bg-transparent">
        {/* Fondo animado, patrón y graffiti sutil */}
        <div className="pointer-events-none absolute inset-0 w-full h-full z-0">
          <AnimatedBlobsBackground />
          <DotsPattern />
          <GraffitiBackground />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-8 px-2 sm:px-8 py-8 md:py-14">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Administrar usuarios</h1>
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center w-full">
            <div className="relative w-full sm:w-auto flex-1 flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none z-20">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-base text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 relative z-10"
                style={{ minWidth: 0 }}
              />
            </div>
            <div className="min-w-[140px] w-full sm:w-auto flex-shrink-0">
              <Select value={role} onValueChange={setRole} placeholder="Todos" className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 shadow-sm text-base text-foreground">
                <SelectItem value="">Todos</SelectItem>
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
          {/* Mobile: cards, Desktop: tabla */}
          <div className="block md:hidden w-full">
            {loading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">No se encontraron usuarios.</div>
            ) : (
              users.map(user => (
                <MobileUserCard
                  key={user.id}
                  user={user}
                  defaultAvatar={defaultAvatar}
                  onDelete={handleDeleteUser}
                  onRoleChange={handleRoleChange}
                  roles={ROLES}
                />
              ))
            )}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-2xl shadow bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 backdrop-blur-md table-bg-fix">
            <table className="min-w-full divide-y divide-muted text-base">
              <thead>
                <tr className="bg-muted/60">
                  <th className="px-4 py-4 text-center font-semibold w-20 align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <UserIcon className="w-5 h-5 text-primary/80 mb-1" />
                      <span className="text-xs">Foto</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center font-semibold align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <User2Icon className="w-5 h-5 text-primary/80 mb-1" />
                      <span className="text-xs">Nombre</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center font-semibold align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <MailIcon className="w-5 h-5 text-primary/80 mb-1" />
                      <span className="text-xs">Email</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center font-semibold align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <RoleIcon className="w-5 h-5 text-primary/80 mb-1" />
                      <span className="text-xs">Rol</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <SalaIcon className="w-5 h-5 text-blue-500 mb-1" />
                      <span className="text-xs">Salas</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <MuralIcon className="w-5 h-5 text-pink-500 mb-1" />
                      <span className="text-xs">Murales</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <SettingsIcon className="w-5 h-5 text-primary/80 mb-1" />
                      <span className="text-xs">Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Cargando...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8">No se encontraron usuarios.</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-muted/40 transition text-center align-middle">
                      <td className="px-4 py-4 w-20 align-middle">
                        <UserAvatarCell
                          user={user}
                          defaultAvatar={defaultAvatar}
                        />
                      </td>
                      <td className="px-5 py-4 font-medium align-middle">{user.name || <span className="italic text-muted-foreground">Sin nombre</span>}</td>
                      <td className="px-5 py-4 align-middle break-all">{user.email}</td>
                      <td className="px-5 py-4 align-middle">
                        <Select value={user.role} onValueChange={val => handleRoleChange(user.id, val)} className="min-w-[100px]">
                          {ROLES.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-4 text-center align-middle">{user._count?.salasPropias ?? 0}</td>
                      <td className="px-4 py-4 text-center align-middle">{user.muralesCount ?? 0}</td>
                      <td className="px-4 py-4 align-middle">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="rounded-full"
                          title="Eliminar usuario"
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal de confirmación de eliminación */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">¿Eliminar usuario?</h2>
              <p className="mb-6">¿Estás seguro de que deseas eliminar a <span className="font-semibold">{userToDelete.name || userToDelete.email}</span>? Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancelar</Button>
                <Button variant="destructive" onClick={confirmDeleteUser}>Eliminar</Button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de imagen eliminado, ya no se abre al hacer click en el avatar */}
      </div>
      <style jsx>{`
      @media (max-width: 640px) {
        table, thead, tbody, th, td, tr { display: block; }
        thead { display: none; }
        tr {
          margin-bottom: 2.6rem;
          border-radius: 1.3rem;
          box-shadow: 0 2px 16px rgba(0,0,0,0.13);
          padding: 1.2rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.7rem;
        }
        tr:not(.dark *) {
          border: 1.5px solid #e5e7eb;
          background: rgba(255,255,255,0.98) !important;
          color: #18181b;
        }
        tr.dark, .dark tr {
          border: 1.5px solid #27272a;
          background: rgba(24,24,27,0.92) !important;
          color: #f4f4f5;
        }
        .table-bg-fix {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        td {
          padding: 0.7rem 0.7rem;
          text-align: center;
          border: none;
          font-size: 0.93rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        td:before {
          content: attr(data-label);
          font-weight: 600;
          display: block;
          margin-bottom: 0.22rem;
          color: #a1a1aa;
          font-size: 0.98em;
        }
        .w-16, .w-12 { width: 48px !important; min-width: 48px !important; }
        td.hidden, th.hidden { display: none !important; }
        .relative.z-10 {
          padding-left: 0.8rem !important;
          padding-right: 0.8rem !important;
          padding-top: 1.2rem !important;
          padding-bottom: 1.2rem !important;
        }
      }
      `}</style>
    </ProtectedRoute>
  );
}
