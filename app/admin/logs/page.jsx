"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select } from "../../components/ui/select";
import { Card } from "../../components/ui/card";
import { AnimatedBlobsBackground, DotsPattern } from "../../components/admin/usuarios/Backgrounds";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const LOG_TYPES = [
  { value: "", label: "Todos" },
  { value: "error", label: "Error" },
  { value: "info", label: "Info" },
  { value: "action", label: "Acción" },
  { value: "warning", label: "Warning" },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState("");
  const [user, setUser] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // Simulación de fetch a /api/logs
        const res = await fetch(`/api/logs?type=${type}&user=${user}&search=${encodeURIComponent(search)}&page=${page}`);
        if (!res.ok) throw new Error("No se pudieron cargar los logs");
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setUsers(data.users || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [type, user, search, page]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-transparent">
      {/* Fondo animado y patrón de puntos */}
      <div className="pointer-events-none absolute inset-0 w-full h-full z-0">
        <AnimatedBlobsBackground />
        <DotsPattern />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center drop-shadow-lg text-zinc-800 dark:text-zinc-100">Registro de Actividad</h1>
        <Card className="mb-6 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={type} onValueChange={setType} placeholder="Tipo de log">
              {LOG_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
            <Select value={user} onValueChange={setUser} placeholder="Usuario">
              <option value="">Todos</option>
              {users.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 rounded border w-full md:w-64"
            />
            <Button variant="outline" size="icon" onClick={() => setPage(1)}><Search className="w-4 h-4" /></Button>
          </div>
        </Card>
        <div className="bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="px-4 py-3 text-left">Fecha/Hora</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Acción/Evento</th>
                <th className="px-4 py-3 text-left">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando logs...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center text-red-500 py-8">{error}</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No hay registros.</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id || i} className="border-b last:border-0 hover:bg-muted/30 transition">
                    <td className="px-4 py-2 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-2">
                      <Badge variant={
                        log.type === "error" ? "destructive" :
                        log.type === "info" ? "blue" :
                        log.type === "action" ? "green" :
                        log.type === "warning" ? "yellow" : "outline"
                      }>
                        {log.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">{log.user || <span className="italic text-muted-foreground">-</span>}</td>
                    <td className="px-4 py-2 font-medium">{log.action}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground max-w-xs truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación simple */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
} 