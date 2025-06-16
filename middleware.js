import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Este middleware se ejecutará en las rutas protegidas
    console.log("🔒 Middleware ejecutado para:", req.nextUrl.pathname);

    // Si no hay token y la ruta está protegida, redirigir a nuestra página personalizada
    const token = req.nextauth.token;
    const protectedPaths = ["/crear-sala", "/perfil", "/mis-documentos"];
    const isProtectedPath = protectedPaths.some((path) =>
      req.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !token) {
      const url = new URL("/no-autorizado", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Definir qué rutas necesitan autenticación
        const protectedPaths = ["/crear-sala", "/perfil", "/mis-documentos"];
        const isProtectedPath = protectedPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        );

        // Si la ruta no está protegida, permitir acceso
        if (!isProtectedPath) {
          return true;
        }

        // Si la ruta está protegida, verificar token
        // Si no hay token, permitir que el middleware maneje la redirección
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - assets folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
