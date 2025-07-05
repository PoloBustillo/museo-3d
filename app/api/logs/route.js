export async function GET(req) {
  // Parse query params
  const { searchParams } = new URL(req.url, "http://localhost");
  const type = searchParams.get("type") || "";
  const user = searchParams.get("user") || "";
  const search = (searchParams.get("search") || "").toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const PAGE_SIZE = 10;

  // Mock data
  const allLogs = [
    {
      id: 1,
      timestamp: "2024-07-10 12:34",
      type: "error",
      user: "admin",
      action: "Login fallido",
      details: "Contraseña errónea para admin",
    },
    {
      id: 2,
      timestamp: "2024-07-10 12:35",
      type: "info",
      user: "user1",
      action: "Editar mural",
      details: "muralId: 123",
    },
    {
      id: 3,
      timestamp: "2024-07-10 12:36",
      type: "action",
      user: "admin",
      action: "Eliminar sala",
      details: "salaId: 45",
    },
    {
      id: 4,
      timestamp: "2024-07-10 12:37",
      type: "warning",
      user: "user2",
      action: "Acceso denegado",
      details: "Intento de acceso a /admin",
    },
    {
      id: 5,
      timestamp: "2024-07-10 12:38",
      type: "info",
      user: "user1",
      action: "Ver sala",
      details: "salaId: 12",
    },
    {
      id: 6,
      timestamp: "2024-07-10 12:39",
      type: "action",
      user: "admin",
      action: "Crear mural",
      details: "muralId: 200",
    },
    {
      id: 7,
      timestamp: "2024-07-10 12:40",
      type: "error",
      user: "user2",
      action: "Error de carga",
      details: "Timeout al cargar imagen",
    },
    {
      id: 8,
      timestamp: "2024-07-10 12:41",
      type: "info",
      user: "user3",
      action: "Actualizar perfil",
      details: "Cambio de email",
    },
    {
      id: 9,
      timestamp: "2024-07-10 12:42",
      type: "action",
      user: "user1",
      action: "Agregar colaborador",
      details: "user2 a sala 12",
    },
    {
      id: 10,
      timestamp: "2024-07-10 12:43",
      type: "warning",
      user: "admin",
      action: "Uso alto de CPU",
      details: "Servidor al 90%",
    },
    // ...puedes agregar más logs mock aquí...
  ];

  // Filtros
  let filtered = allLogs;
  if (type) filtered = filtered.filter((l) => l.type === type);
  if (user) filtered = filtered.filter((l) => l.user === user);
  if (search)
    filtered = filtered.filter(
      (l) =>
        l.action.toLowerCase().includes(search) ||
        l.details.toLowerCase().includes(search) ||
        l.user.toLowerCase().includes(search)
    );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Usuarios únicos para el filtro
  const users = Array.from(new Set(allLogs.map((l) => l.user)));

  return new Response(
    JSON.stringify({
      logs: paged,
      totalPages,
      users,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
