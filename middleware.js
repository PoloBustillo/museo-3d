import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Rutas protegidas (requieren sesión)
const protectedPatterns = [
  /^\/crear-sala/,
  /^\/perfil/,
  /^\/mis-obras(\/.*)?$/,
  /^\/admin(\/.*)?$/,
];
// Rutas solo para invitados (guest-only)
const guestOnlyPaths = ["/login", "/register"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const userRole = (token?.role || "").toLowerCase();

    Sentry.captureMessage("[DEBUG] Middleware ejecutado", {
      level: "debug",
      extra: { pathname, userId: token?.sub, userRole: token?.role, token: !!token }
    });

    // Guest-only: redirigir si ya está autenticado
    if (guestOnlyPaths.some((path) => pathname.startsWith(path)) && token) {
      Sentry.captureMessage(
        "Intento de acceso a guest-only por usuario autenticado",
        {
          level: "info",
          extra: { pathname, userId: token?.sub },
        }
      );
      Sentry.captureMessage("[DEBUG] Redirigiendo guest-only a /perfil", {
        level: "debug",
        extra: { pathname, userId: token?.sub }
      });
      return NextResponse.redirect(new URL("/perfil", req.url));
    }

    // Redirección personalizada para rutas protegidas
    if (protectedPatterns.some((re) => re.test(pathname)) && !token) {
      Sentry.captureMessage("Acceso denegado a ruta protegida sin token", {
        level: "warning",
        extra: { pathname },
      });
      Sentry.captureMessage("[DEBUG] Redirigiendo protegida a /no-autorizado", {
        level: "debug",
        extra: { pathname }
      });
      const url = new URL("/no-autorizado", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Protección por rol (case-insensitive)
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      Sentry.captureMessage("Acceso denegado a admin por usuario sin rol", {
        level: "warning",
        extra: { pathname, userId: token?.sub, userRole: token?.role },
      });
      Sentry.captureMessage("[DEBUG] Redirigiendo admin a /no-autorizado", {
        level: "debug",
        extra: { pathname, userId: token?.sub, userRole: token?.role }
      });
      return NextResponse.redirect(new URL("/no-autorizado", req.url));
    }

    Sentry.captureMessage("[DEBUG] Middleware permite acceso", {
      level: "debug",
      extra: { pathname, userId: token?.sub, userRole: token?.role }
    });
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const userRole = (token?.role || "").toLowerCase();
        // Guest-only
        if (guestOnlyPaths.some((path) => pathname.startsWith(path))) {
          return !token;
        }
        // Protegidas
        if (protectedPatterns.some((re) => re.test(pathname))) {
          return !!token;
        }
        // Admin (case-insensitive)
        if (pathname.startsWith("/admin")) {
          return userRole === "admin";
        }
        // Público
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
