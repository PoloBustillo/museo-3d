'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  getPersonalCollection, 
  removeFromPersonalCollection, 
  getCollectionStats,
  clearPersonalCollection 
} from '../../lib/personalCollection.js';

export default function Perfil() {
  const { data: session, status } = useSession();
  const [personalCollection, setPersonalCollection] = useState([]);
  const [collectionStats, setCollectionStats] = useState({});
  const [showCollection, setShowCollection] = useState(false);
  
  const userId = session?.user?.id || null;

  // Cargar colección personal
  useEffect(() => {
    if (status !== 'loading' && userId) {
      const collection = getPersonalCollection(userId);
      const stats = getCollectionStats(userId);
      setPersonalCollection(collection);
      setCollectionStats(stats);
    }
  }, [userId, status]);

  const handleRemoveFromCollection = (artworkId) => {
    const success = removeFromPersonalCollection(artworkId, userId);
    if (success) {
      const updatedCollection = getPersonalCollection(userId);
      const updatedStats = getCollectionStats(userId);
      setPersonalCollection(updatedCollection);
      setCollectionStats(updatedStats);
    }
  };

  const handleClearCollection = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar toda tu colección? Esta acción no se puede deshacer.')) {
      const success = clearPersonalCollection(userId);
      if (success) {
        setPersonalCollection([]);
        setCollectionStats({
          totalArtworks: 0,
          uniqueArtists: 0,
          uniqueTechniques: 0,
          oldestYear: null,
          newestYear: null,
          mostRecentAddition: null
        });
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Acceso Requerido</h1>
          <p className="text-muted-foreground mb-6">
            Debes iniciar sesión para ver tu perfil y colección personal.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={session?.user?.name || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={session?.user?.email || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ID de Usuario</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
                  value={userId || 'No disponible'}
                  readOnly
                />
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                La información se obtiene de tu proveedor de autenticación. Para realizar cambios, 
                contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas de Colección */}
        <div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              ❤️ Mi Colección
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de obras:</span>
                <span className="font-semibold">{collectionStats.totalArtworks || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Artistas únicos:</span>
                <span className="font-semibold">{collectionStats.uniqueArtists || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Técnicas diferentes:</span>
                <span className="font-semibold">{collectionStats.uniqueTechniques || 0}</span>
              </div>
              
              {collectionStats.oldestYear && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Período:</span>
                  <span className="font-semibold">
                    {collectionStats.oldestYear} - {collectionStats.newestYear}
                  </span>
                </div>
              )}
            </div>
            
            {personalCollection.length > 0 && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowCollection(!showCollection)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  {showCollection ? 'Ocultar Colección' : 'Ver Mi Colección'}
                </button>
                
                <button
                  onClick={handleClearCollection}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  Limpiar Colección
                </button>
              </div>
            )}
            
            {personalCollection.length === 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-gray-600 mb-2">Tu colección está vacía</p>
                <p className="text-xs text-gray-500">
                  Visita el museo y guarda tus obras favoritas haciendo clic en "❤️ Guardar en mi colección"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista detallada de la colección */}
      {showCollection && personalCollection.length > 0 && (
        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Detalles de Mi Colección</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalCollection.map((artwork, index) => (
                <div key={artwork.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={artwork.src} 
                    alt={artwork.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-32 bg-gray-200 rounded-md mb-3 hidden items-center justify-center"
                  >
                    <span className="text-gray-500 text-sm">🎨 Sin imagen</span>
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-1">{artwork.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{artwork.artist}</p>
                  <p className="text-xs text-gray-500 mb-2">{artwork.year} • {artwork.technique}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Añadido: {new Date(artwork.addedAt).toLocaleDateString()}
                  </p>
                  
                  <button
                    onClick={() => handleRemoveFromCollection(artwork.id)}
                    className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                  >
                    🗑️ Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
