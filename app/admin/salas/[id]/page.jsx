"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "../../../components/ui/badge";
import { DatePicker } from "../../../components/ui/date-picker";
import { useSessionData } from "providers/SessionProvider";
import * as yup from "yup";

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es obligatorio").min(3),
  descripcion: yup.string().required("La descripción es obligatoria").min(5),
  color: yup.string().required("El color es obligatorio"),
  maxColaboradores: yup.number().min(1, "Debe ser al menos 1"),
  // Puedes agregar más validaciones según tus necesidades
});

export default function EditarSala() {
  const router = useRouter();
  const { id } = useParams();
  const { session } = useSessionData();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sala, setSala] = useState(null);
  const [form, setForm] = useState(null);
  const [muralesDisponibles, setMuralesDisponibles] = useState([]);
  const [colaboradoresDisponibles, setColaboradoresDisponibles] = useState([]);
  const [errors, setErrors] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Cargar datos de la sala y murales disponibles
  useEffect(() => {
    const fetchSala = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/salas/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar la sala");
        const data = await res.json();
        setSala(data);
        setForm({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          texturaPared: data.texturaPared || "",
          texturaPiso: data.texturaPiso || "",
          color: data.color || "#ffffff",
          tema: data.tema || "",
          musica: data.musica || "",
          imagenPortada: data.imagenPortada || "",
          esPrivada: data.esPrivada || false,
          maxColaboradores: data.maxColaboradores || 10,
          fechaApertura: data.fechaApertura ? data.fechaApertura.split("T")[0] : "",
          notas: data.notas || "",
          murales: (data.murales || []).map((m) => m.mural?.id || m.muralId),
          colaboradores: (data.colaboradores || []).map((c) => c.id),
        });
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchMurales = async () => {
      const res = await fetch("/api/murales");
      if (res.ok) {
        const data = await res.json();
        setMuralesDisponibles(data.murales || []);
      }
    };
    fetchSala();
    fetchMurales();
  }, [id]);

  // Buscar usuarios por nombre/email
  useEffect(() => {
    if (userSearch.length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/usuarios?search=${encodeURIComponent(userSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setUserResults(data.usuarios || []);
      }
      setSearching(false);
    }, 350);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Manejar selección de murales
  const handleToggleMural = (muralId) => {
    setForm((prev) => {
      const murales = prev.murales.includes(muralId)
        ? prev.murales.filter((id) => id !== muralId)
        : [...prev.murales, muralId];
      return { ...prev, murales };
    });
  };

  // Manejar selección de colaboradores
  const handleToggleColaborador = (userId) => {
    setForm((prev) => {
      const colaboradores = prev.colaboradores.includes(userId)
        ? prev.colaboradores.filter((id) => id !== userId)
        : [...prev.colaboradores, userId];
      return { ...prev, colaboradores };
    });
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await schema.validate(form, { abortEarly: false });
      setErrors({});
      const res = await fetch(`/api/salas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          murales: form.murales,
          colaboradores: form.colaboradores,
        }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar la sala");
      toast.success("Sala actualizada");
      router.push("/mis-salas");
    } catch (e) {
      if (e.name === "ValidationError") {
        const newErrors = {};
        e.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast.error(e.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !form) return <div className="p-8 text-center">Cargando sala...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editar sala</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Textura de pared</label>
          <input name="texturaPared" value={form.texturaPared} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Textura de piso</label>
          <input name="texturaPiso" value={form.texturaPiso} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Color de paredes</label>
          <input name="color" type="color" value={form.color} onChange={handleChange} className="w-16 h-10 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tema visual</label>
          <input name="tema" value={form.tema} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Música</label>
          <input name="musica" value={form.musica} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Imagen de portada (URL)</label>
          <input name="imagenPortada" value={form.imagenPortada} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">¿Sala privada?</label>
          <input name="esPrivada" type="checkbox" checked={form.esPrivada} onChange={handleChange} className="mr-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Máx. colaboradores</label>
          <input name="maxColaboradores" type="number" min={1} value={form.maxColaboradores} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Fecha de apertura</label>
          <input name="fechaApertura" type="date" value={form.fechaApertura} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Notas internas</label>
          <textarea name="notas" value={form.notas} onChange={handleChange} className="w-full px-4 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Murales</label>
          <div className="flex flex-wrap gap-2">
            {muralesDisponibles.map((mural) => (
              <button
                type="button"
                key={mural.id}
                className={`px-3 py-1 rounded border text-sm ${form.murales.includes(mural.id) ? "bg-indigo-600 text-white" : "bg-white"}`}
                onClick={() => handleToggleMural(mural.id)}
              >
                {mural.titulo}
              </button>
            ))}
          </div>
        </div>
        {/* Colaboradores visuales */}
        <div>
          <label className="block font-semibold mb-1">Colaboradores</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.colaboradores.map((userId) => {
              const user = userResults.find((u) => u.id === userId) || colaboradoresDisponibles.find((u) => u.id === userId);
              return (
                <span key={userId} className="inline-flex items-center px-3 py-1 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">
                  {user?.name || userId}
                  <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => handleToggleColaborador(userId)}>
                    ×
                  </button>
                </span>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Buscar usuario por nombre o email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full px-4 py-2 rounded border mb-2"
          />
          {searching && <div className="text-xs text-muted-foreground">Buscando...</div>}
          {userResults.length > 0 && (
            <div className="border rounded bg-white shadow p-2 max-h-40 overflow-y-auto">
              {userResults.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  className={`block w-full text-left px-2 py-1 rounded hover:bg-indigo-50 ${form.colaboradores.includes(user.id) ? "bg-indigo-100 text-indigo-800" : ""}`}
                  onClick={() => handleToggleColaborador(user.id)}
                >
                  {user.name} <span className="text-xs text-gray-500">{user.email}</span>
                  {form.colaboradores.includes(user.id) && <span className="ml-2">✓</span>}
                </button>
              ))}
            </div>
          )}
          {errors.colaboradores && <div className="text-red-500 text-xs mt-1">{errors.colaboradores}</div>}
        </div>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition">
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
} 