"use client";
import { useCollection } from "../../providers/CollectionProvider";
import { useSession } from "next-auth/react";

export default function TestCollection() {
  const { data: session, status } = useSession();
  const {
    collection,
    addToCollection,
    removeFromCollection,
    clearCollection,
    syncCollection,
    isLoading,
    lastSync,
    isAuthenticated,
  } = useCollection();

  const testArtwork = {
    title: "Obra de Prueba",
    artist: "Artista Test",
    year: "2024",
    technique: "Digital",
    src: "/assets/bansky.webp",
    description: "Esta es una obra de prueba para verificar la funcionalidad",
  };

  const handleAddTest = async () => {
    await addToCollection(testArtwork);
  };

  const handleRemoveFirst = async () => {
    if (collection.length > 0) {
      await removeFromCollection(collection[0].id);
    }
  };

  const handleClear = async () => {
    if (window.confirm("¿Limpiar toda la colección?")) {
      await clearCollection();
    }
  };

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Collection Provider</h1>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Estado</h2>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Autenticado:</strong> {isAuthenticated ? "Sí" : "No"}
          </p>
          <p>
            <strong>Usuario:</strong> {session?.user?.name || "No autenticado"}
          </p>
          <p>
            <strong>Loading:</strong> {isLoading ? "Sí" : "No"}
          </p>
          <p>
            <strong>Última sincronización:</strong>{" "}
            {lastSync ? new Date(lastSync).toLocaleString() : "Nunca"}
          </p>
          <p>
            <strong>Total obras:</strong> {collection.length}
          </p>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Acciones</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleAddTest}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Agregar obra de prueba
          </button>
          <button
            onClick={handleRemoveFirst}
            disabled={collection.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Remover primera obra
          </button>
          <button
            onClick={handleClear}
            disabled={collection.length === 0}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Limpiar colección
          </button>
          <button
            onClick={syncCollection}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Sincronizar
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Colección ({collection.length} obras)
        </h2>
        {collection.length === 0 ? (
          <p className="text-gray-500">No hay obras en la colección</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.map((artwork, index) => (
              <div key={artwork.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{artwork.title}</h3>
                <p className="text-gray-600">{artwork.artist}</p>
                <p className="text-sm text-gray-500">
                  {artwork.year} - {artwork.technique}
                </p>
                <p className="text-xs text-gray-400">ID: {artwork.id}</p>
                <button
                  onClick={() => removeFromCollection(artwork.id)}
                  className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Datos JSON</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(collection, null, 2)}
        </pre>
      </div>
    </div>
  );
}
