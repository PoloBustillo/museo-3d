"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-10 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* Columna 1 - Logo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/nav/logo.svg" 
              alt="Logo" 
              className="h-8 w-auto dark:hidden" 
            />
            <img 
              src="/assets/nav/logo-white.svg" 
              alt="Logo" 
              className="h-8 w-auto hidden dark:block" 
            />
            <span className="text-lg font-bold tracking-wide text-blue-600 dark:text-blue-400">Mural ARPA</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Preservando el arte mural con tecnología.
          </p>
        </div>

        {/* Columna 2 - Enlaces rápidos */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Contenido</span>
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Inicio</Link>
          <Link href="/museo" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Museo Virtual</Link>
          <Link href="/crear-sala" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Subir documento</Link>
          <Link href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Acerca de</Link>
        </div>

        {/* Columna 3 - Contacto / Legal */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Contacto</span>
          <a href="mailto:contacto@arpa.org" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
            contacto@arpa.org
          </a>
          <p>Benemérita Universidad Autónoma de Puebla</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-4">
            &copy; {new Date().getFullYear()} Mural ARPA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
