"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useUser } from "../../../providers/UserProvider";
import { useModal } from "../../../providers/ModalProvider";
import { useState, useEffect } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectItem } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const ROLES = [
  { value: "USER", label: "Usuario" },
  { value: "ADMIN", label: "Admin" },
  { value: "ARTIST", label: "Artista" },
  { value: "CURATOR", label: "Curador" },
];

export default function AdminUsuariosPage() {
  const { user, userProfile, isAdmin, isModerator, getUserRole } = useUser();
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

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
        setUsers(data.usuarios || []);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 mt-2">
                  Panel de administración para gestionar usuarios del sistema
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">
                    Administrador:{" "}
                    {userProfile?.name || user?.name || user?.email}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                    {getUserRole()}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  openModal("user-info-modal", {
                    user,
                    userProfile,
                    role: getUserRole(),
                    isAdmin,
                    isModerator,
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                👤 Mi Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">👑</div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Panel de Administración de Usuarios
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Esta página solo es accesible para usuarios con rol de
                administrador. Aquí puedes gestionar todos los usuarios del
                sistema, asignar roles, moderar contenido y configurar el
                sistema.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-medium text-blue-900 mb-3">
                  Funcionalidades del UserProvider en acción:
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>
                    • ✅ <strong>ProtectedRoute</strong> verifica
                    automáticamente el rol requerido
                  </li>
                  <li>
                    • ✅ <strong>useUser</strong> proporciona acceso a datos del
                    usuario
                  </li>
                  <li>
                    • ✅ <strong>hasRole()</strong> verifica permisos
                    específicos
                  </li>
                  <li>
                    • ✅ <strong>isAdmin/isModerator</strong> para
                    verificaciones rápidas
                  </li>
                  <li>
                    • ✅ <strong>getUserRole()</strong> obtiene el rol principal
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    👥 Usuarios
                  </h4>
                  <p className="text-sm text-green-800">
                    Gestionar usuarios, roles y permisos
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    📝 Contenido
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Moderar y revisar contenido del museo
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">
                    ⚙️ Sistema
                  </h4>
                  <p className="text-sm text-purple-800">
                    Configurar parámetros del sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Administrar usuarios</h1>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
            <Select value={role} onValueChange={setRole} className="min-w-[120px]">
              <SelectItem value="">Todos</SelectItem>
              {ROLES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div>Cargando...</div>
            ) : users.length === 0 ? (
              <div>No se encontraron usuarios.</div>
            ) : (
              users.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-3 border rounded-md bg-muted">
                  <div className="flex-1">
                    <div className="font-semibold">{user.name || user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <Badge variant={user.role === "ADMIN" ? "secondary" : "outline"}>{user.role}</Badge>
                  <Select value={user.role} onValueChange={val => handleRoleChange(user.id, val)} className="min-w-[120px]">
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
