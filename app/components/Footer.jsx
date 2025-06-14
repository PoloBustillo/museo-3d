"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-200 border-t border-border text-foreground mt-10">
      <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* Columna 1 - Logo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img src="/assets/nav/logo.svg" alt="Logo" className="h-8 w-auto" />
            <span className="text-lg font-bold tracking-wide text-primary">Mural ARPA</span>
          </div>
          <p className="text-muted-foreground">
            Preservando el arte mural con tecnología.
          </p>
        </div>

        {/* Columna 2 - Enlaces rápidos */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-primary">Contenido</span>
          <Link href="/" className="hover:text-primary transition">Inicio</Link>
          <Link href="/museo" className="hover:text-primary transition">Museo Virtual</Link>
          <Link href="/crear-sala" className="hover:text-primary transition">Subir documento</Link>
          <Link href="#about" className="hover:text-primary transition">Acerca de</Link>
        </div>

        {/* Columna 3 - Contacto / Legal */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-primary">Contacto</span>
          <a href="mailto:contacto@arpa.org" className="hover:text-primary transition">
            contacto@arpa.org
          </a>
          <p>Benemérita Universidad Autónoma de Puebla</p>
          <p className="text-muted-foreground text-xs mt-4">
            &copy; {new Date().getFullYear()} Mural ARPA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
