"use client";

import { Palette, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

const PageHeader = ({ onCreateNew }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
        <Palette className="h-10 w-10 text-indigo-600" />
        {isAdmin ? "Todas las Obras" : "Mis Obras"}
        {isAdmin && (
          <span className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-medium">
            Vista Admin
          </span>
        )}
      </h1>
      <p className="text-lg text-muted-foreground mb-6">
        {isAdmin
          ? "Administra todas las obras de arte del museo. Solo puedes editar/eliminar tus propias obras."
          : "Crea, administra y comparte tus obras de arte digitales"}
      </p>

      {/* Botones de acción principales */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
        >
          <Plus className="h-5 w-5" /> Crear obra
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
