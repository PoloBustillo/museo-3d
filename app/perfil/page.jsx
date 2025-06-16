'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  getPersonalCollection, 
  getCollectionStats
} from '../../lib/personalCollection.js';
import { ProtectedRoute } from '../components/ProtectedRoute';

function PerfilContent() {
  const { data: session, status } = useSession();
  const [personalCollection, setPersonalCollection] = useState([]);
  const [collectionStats, setCollectionStats] = useState({});
  const [museumStats, setMuseumStats] = useState({
    totalArtworks: 0,
    totalSalas: 0,
    totalArtists: 0,
    totalTechniques: 0,
    salas: []
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const userId = session?.user?.id || null;

  // Cargar estadísticas del museo
  useEffect(() => {
    const fetchMuseumStats = async () => {
      try {
        console.log('Iniciando fetchMuseumStats...');
        setIsLoadingStats(true);
        
        // Obtener salas
        console.log('Fetching salas...');
        const salasResponse = await fetch('/api/salas');
        const salasData = await salasResponse.json();
        
        // Obtener murales
        console.log('Fetching murales...');
        const muralesResponse = await fetch('/api/murales');
        const muralesData = await muralesResponse.json();
        
        console.log('Salas response status:', salasResponse.status);
        console.log('Murales response status:', muralesResponse.status);
        console.log('Salas data:', salasData);
        console.log('Murales data:', muralesData);
        
        // Las APIs devuelven directamente los datos, no con un campo 'success'
        if (salasResponse.ok && muralesResponse.ok && salasData.salas && muralesData.murales) {
          const salas = salasData.salas || [];
          const murales = muralesData.murales || [];
          
          console.log('Salas count:', salas.length);
          console.log('Murales count:', murales.length);
          
          // Calcular estadísticas
          const uniqueArtists = new Set(murales.map(m => m.autor).filter(Boolean)).size;
          const uniqueTechniques = new Set(murales.map(m => m.tecnica).filter(Boolean)).size;
          
          const newStats = {
            totalArtworks: murales.length,
            totalSalas: salas.length,
            totalArtists: uniqueArtists,
            totalTechniques: uniqueTechniques,
            salas: salas.slice(0, 4) // Solo mostrar las primeras 4 salas
          };
          
          console.log('Setting new museum stats:', newStats);
          setMuseumStats(newStats);
        } else {
          console.log('API calls failed or returned invalid structure');
          console.log('salasResponse.ok:', salasResponse.ok);
          console.log('muralesResponse.ok:', muralesResponse.ok);
          console.log('Has salas data:', !!salasData.salas);
          console.log('Has murales data:', !!muralesData.murales);
          // Datos de respaldo si las APIs fallan
          setMuseumStats({
            totalArtworks: 0,
            totalSalas: 0,
            totalArtists: 0,
            totalTechniques: 0,
            salas: []
          });
        }
      } catch (error) {
        console.error('Error fetching museum stats:', error);
        // Datos de respaldo en caso de error
        setMuseumStats({
          totalArtworks: 0,
          totalSalas: 0,
          totalArtists: 0,
          totalTechniques: 0,
          salas: []
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchMuseumStats();
  }, []);

  // Debug: Monitor changes in museumStats
  useEffect(() => {
    console.log('museumStats updated:', museumStats);
  }, [museumStats]);

  // Cargar colección personal
  useEffect(() => {
    if (status !== 'loading' && userId) {
      const collection = getPersonalCollection(userId);
      const stats = getCollectionStats(userId);
      setPersonalCollection(collection);
      setCollectionStats(stats);
    }
  }, [userId, status]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-stone-100">
      {/* Header elegante */}
      <div className="mt-6 relative bg-gradient-to-r from-slate-900 via-gray-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="mt-4 relative z-10 container mx-auto px-8 py-16 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
              Mi Perfil
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Bienvenido a tu espacio personal en el museo virtual
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Información Personal - Sidebar elegante */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl">
              <h2 className="text-2xl font-light text-gray-800 mb-6 border-b border-gray-200 pb-4">
                Información Personal
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nombre</label>
                  <div className="bg-gray-50/50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {session?.user?.name || 'Usuario'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                  <div className="bg-gray-50/50 px-4 py-3 rounded-lg text-gray-600 text-sm">
                    {session?.user?.email || 'No disponible'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">ID de Usuario</label>
                  <div className="bg-gray-50/50 px-4 py-3 rounded-lg text-gray-500 font-mono text-xs">
                    {userId || 'No disponible'}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  La información se obtiene de tu proveedor de autenticación. Para realizar cambios, 
                  contacta al administrador del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Área principal */}
          <div className="xl:col-span-3">
            {/* Estadísticas del Museo */}
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">🏛️</span>
                  Estadísticas del Museo
                </h2>
                {isLoadingStats && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                )}
              </div>
              
              {/* Estadísticas generales del museo */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                  <div className="text-3xl font-light text-blue-700 mb-1">
                    {isLoadingStats ? '...' : museumStats.totalArtworks}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Obras totales</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
                  <div className="text-3xl font-light text-green-700 mb-1">
                    {isLoadingStats ? '...' : museumStats.totalSalas}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Salas virtuales</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                  <div className="text-3xl font-light text-purple-700 mb-1">
                    {isLoadingStats ? '...' : museumStats.totalArtists}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Artistas</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50">
                  <div className="text-3xl font-light text-orange-700 mb-1">
                    {isLoadingStats ? '...' : museumStats.totalTechniques}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">Técnicas</div>
                </div>
              </div>
              
              {/* Información sobre las salas */}
              <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 rounded-xl border border-gray-200/50 p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Salas del Museo</h3>
                {isLoadingStats ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🏛️</div>
                    <p>Cargando información de salas...</p>
                  </div>
                ) : museumStats.salas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {museumStats.salas.map((sala, index) => (
                      <div key={sala.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <span className="text-2xl">
                          {index === 0 ? '🎨' : index === 1 ? '🌟' : index === 2 ? '🎭' : '🏺'}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-800">{sala.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {sala._count?.murales || 0} obras • {sala._count?.colaboradores || 0} colaboradores
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No hay salas disponibles por el momento</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mi Colección Personal - Solo estadísticas básicas */}
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  Mi Colección Personal
                </h2>
                
                {personalCollection.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">{personalCollection.length} obras</span>
                  </div>
                )}
              </div>
              
              {personalCollection.length > 0 ? (
                <div>
                  {/* Estadísticas compactas */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
                      <div className="text-2xl font-light text-slate-700 mb-1">
                        {collectionStats.totalArtworks || 0}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">Mis obras</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                      <div className="text-2xl font-light text-gray-700 mb-1">
                        {collectionStats.uniqueArtists || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Artistas</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-b from-stone-50 to-stone-100/50 rounded-xl border border-stone-200/50">
                      <div className="text-2xl font-light text-stone-700 mb-1">
                        {collectionStats.uniqueTechniques || 0}
                      </div>
                      <div className="text-xs text-stone-600 font-medium">Técnicas</div>
                    </div>
                  </div>
                  
                  {/* Enlace a gestión completa */}
                  <div className="text-center">
                    <Link
                      href="/mis-documentos"
                      className="bg-slate-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
                    >
                      📊 Gestionar y Explorar Colección
                    </Link>
                    <p className="text-sm text-gray-500 mt-3">
                      Accede a herramientas avanzadas de búsqueda, filtros y gestión
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-20">📄</div>
                  <h3 className="text-xl font-light text-gray-600 mb-3">Tu colección está vacía</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed text-sm">
                    Explora el museo virtual y guarda tus obras favoritas en tu colección personal.
                  </p>
                  <Link 
                    href="/museo"
                    className="inline-block bg-slate-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    🏛️ Explorar Museo
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Perfil() {
  return (
    <ProtectedRoute requireAuth={true}>
      <PerfilContent />
    </ProtectedRoute>
  );
}
