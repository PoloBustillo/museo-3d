import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Este middleware se ejecutará en las rutas protegidas
    console.log("🔒 Middleware ejecutado para:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Definir qué rutas necesitan autenticación
        const protectedPaths = ["/museo", "/dashboard", "/admin"];
        const isProtectedPath = protectedPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        );

        // Si la ruta no está protegida, permitir acceso
        if (!isProtectedPath) {
          return true;
        }

        // Si la ruta está protegida, verificar token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
