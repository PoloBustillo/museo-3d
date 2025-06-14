'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  getPersonalCollection, 
  removeFromPersonalCollection, 
  getCollectionStats,
  clearPersonalCollection,
  filterPersonalCollection,
  getFilterOptions,
  getFilterStats,
  exportPersonalCollection,
  importPersonalCollection,
  generateCollectionSummary
} from '../../lib/personalCollection.js';

export default function MisDocumentos() {
  const { data: session, status } = useSession();
  const [personalCollection, setPersonalCollection] = useState([]);
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [collectionStats, setCollectionStats] = useState({});
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    technique: '',
    artist: '',
    year: '',
    sortBy: 'newest', // newest, oldest, title, artist, year, technique, sala
    sala: '',
    yearFrom: '',
    yearTo: ''
  });
  
  // Estados para opciones de filtros y estadísticas
  const [filterOptions, setFilterOptions] = useState({
    techniques: [],
    artists: [],
    years: [],
    salas: [],
    yearRange: { min: null, max: null }
  });
  
  const [filterStats, setFilterStats] = useState({
    totalFiltered: 0,
    totalOriginal: 0,
    percentage: 100,
    uniqueArtists: 0,
    uniqueTechniques: 0,
    uniqueSalas: 0,
    yearRange: null
  });
  
  // Estado para controlar la vista de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Estados para importación/exportación
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const userId = session?.user?.id || null;

  // Cargar colección personal
  useEffect(() => {
    if (status !== 'loading' && userId) {
      const collection = getPersonalCollection(userId);
      const stats = getCollectionStats(userId);
      const options = getFilterOptions(userId);
      
      setPersonalCollection(collection);
      setCollectionStats(stats);
      setFilterOptions(options);
    }
  }, [userId, status]);

  // Filtrar y ordenar colección
  useEffect(() => {
    if (personalCollection.length > 0) {
      const filtered = filterPersonalCollection(personalCollection, filters);
      const stats = getFilterStats(filtered, personalCollection);
      
      setFilteredCollection(filtered);
      setFilterStats(stats);
    } else {
      setFilteredCollection([]);
      setFilterStats({
        totalFiltered: 0,
        totalOriginal: 0,
        percentage: 100,
        uniqueArtists: 0,
        uniqueTechniques: 0,
        uniqueSalas: 0,
        yearRange: null
      });
    }
  }, [personalCollection, filters]);

  // Funciones para manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      technique: '',
      artist: '',
      year: '',
      sortBy: 'newest',
      sala: '',
      yearFrom: '',
      yearTo: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.search || filters.technique || filters.artist || filters.year || 
           filters.sala || filters.yearFrom || filters.yearTo;
  };

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

  const handleExportCollection = () => {
    const success = exportPersonalCollection(userId);
    if (success) {
      alert('¡Colección exportada exitosamente! El archivo se ha descargado.');
    } else {
      alert('Error al exportar la colección. Inténtalo de nuevo.');
    }
  };

  const handleImportCollection = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const result = await importPersonalCollection(file, userId, true);
    
    if (result.success) {
      // Recargar la colección
      const updatedCollection = getPersonalCollection(userId);
      const updatedStats = getCollectionStats(userId);
      const updatedOptions = getFilterOptions(userId);
      
      setPersonalCollection(updatedCollection);
      setCollectionStats(updatedStats);
      setFilterOptions(updatedOptions);
      
      alert(`¡Importación exitosa!\n\nObras importadas: ${result.imported}\nDuplicados omitidos: ${result.duplicates}\nTotal en colección: ${result.total}`);
    } else {
      alert(`Error al importar: ${result.error}`);
    }
    
    // Limpiar el input
    event.target.value = '';
  };

  const handleShareCollection = () => {
    const summary = generateCollectionSummary(userId);
    
    if (navigator.share) {
      navigator.share({
        title: 'Mi Colección del Museo Virtual 3D',
        text: summary,
        url: window.location.origin
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(summary).then(() => {
        alert('¡Resumen copiado al portapapeles! Puedes pegarlo donde quieras compartirlo.');
      }).catch(() => {
        // Mostrar en una ventana modal o alert
        alert(summary);
      });
    }
  };

  const handleExportToPDF = async () => {
    try {
      console.log('Exporting to PDF. Collection data:', filteredCollection);
      console.log('Sample artwork:', filteredCollection[0]);
      
      // Mostrar mensaje de carga
      const loadingMessage = document.createElement('div');
      loadingMessage.id = 'pdf-loading';
      loadingMessage.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingMessage.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-800">Generando PDF...</p>
          <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
        </div>
      `;
      document.body.appendChild(loadingMessage);

      // Crear el PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      
      // Título del documento
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mi Colección Personal', margin, 30);
      
      // Información del usuario
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Usuario: ${session?.user?.name || 'Usuario'}`, margin, 45);
      pdf.text(`Total de obras: ${filteredCollection.length}`, margin, 55);
      pdf.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}`, margin, 65);
      
      let currentY = 80;
      
      // Procesar cada obra
      for (let i = 0; i < filteredCollection.length; i++) {
        const artwork = filteredCollection[i];
        
        // Verificar si necesitamos una nueva página
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = 30;
        }
        
        try {
          // Cargar la imagen
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              // Si falla, usar una imagen placeholder
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlbjwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjU1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPm5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPgo=';
              img.onload = resolve;
              img.onerror = reject;
            };
            // Usar la estructura correcta de la colección personal
            img.src = artwork.src || artwork.url_imagen || artwork.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlbjwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjU1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPm5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPgo=';
          });
          
          // Crear canvas para la imagen
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular dimensiones proporcionales
          const maxWidth = 60;
          const maxHeight = 60;
          const aspectRatio = img.width / img.height;
          
          let imgWidth, imgHeight;
          if (aspectRatio > 1) {
            imgWidth = maxWidth;
            imgHeight = maxWidth / aspectRatio;
          } else {
            imgHeight = maxHeight;
            imgWidth = maxHeight * aspectRatio;
          }
          
          canvas.width = imgWidth * 2; // Factor de escala para mejor calidad
          canvas.height = imgHeight * 2;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Agregar imagen al PDF
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
          
          // Información de la obra al lado de la imagen
          const textX = margin + imgWidth + 10;
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(artwork.title || 'Sin título', textX, currentY + 8);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Artista: ${artwork.artist || 'Desconocido'}`, textX, currentY + 18);
          pdf.text(`Técnica: ${artwork.technique || 'No especificada'}`, textX, currentY + 28);
          pdf.text(`Año: ${artwork.year || 'No especificado'}`, textX, currentY + 38);
          
          if (artwork.sala) {
            pdf.text(`Sala: ${artwork.sala}`, textX, currentY + 48);
          }
          
          if (artwork.dimensions) {
            pdf.text(`Dimensiones: ${artwork.dimensions}`, textX, currentY + 58);
          }
          
          currentY += Math.max(imgHeight, 50) + 15;
          
        } catch (error) {
          console.error('Error processing image for artwork:', artwork.title, error);
          
          // Si falla la imagen, agregar solo el texto
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(artwork.title || 'Sin título', margin, currentY + 8);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Artista: ${artwork.artist || 'Desconocido'}`, margin, currentY + 18);
          pdf.text(`Técnica: ${artwork.technique || 'No especificada'}`, margin, currentY + 28);
          pdf.text(`Año: ${artwork.year || 'No especificado'}`, margin, currentY + 38);
          
          if (artwork.sala) {
            pdf.text(`Sala: ${artwork.sala}`, margin, currentY + 48);
          }
          
          if (artwork.dimensions) {
            pdf.text(`Dimensiones: ${artwork.dimensions}`, margin, currentY + 58);
          }
          
          pdf.text('[Imagen no disponible]', margin, currentY + 68);
          
          currentY += 80;
        }
      }
      
      // Guardar el PDF
      const fileName = `mi-coleccion-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Remover mensaje de carga
      document.body.removeChild(loadingMessage);
      
      alert(`¡PDF generado exitosamente! Se ha descargado como "${fileName}"`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Remover mensaje de carga si existe
      const loadingMessage = document.getElementById('pdf-loading');
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }
      
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Acceso Requerido</h1>
          <p className="text-muted-foreground mb-6">
            Debes iniciar sesión para ver tus documentos y colección personal.
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
      <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="mt-6 relative z-10 container mx-auto px-8 py-16 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
              Mis Documentos
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Gestiona y explora tu colección personal con herramientas avanzadas
            </p>
          </div>
          
          {/* Navegación de breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
            <Link href="/perfil" className="hover:text-white transition-colors">Mi Perfil</Link>
            <span>→</span>
            <span className="text-white">Mis Documentos</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {personalCollection.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm p-16 rounded-2xl border border-white/50 shadow-xl text-center">
            <div className="text-8xl mb-6 opacity-20">📄</div>
            <h3 className="text-2xl font-light text-gray-600 mb-4">No tienes documentos aún</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Comienza agregando obras a tu colección personal desde el museo virtual.
            </p>
            <Link 
              href="/museo"
              className="inline-block bg-slate-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🏛️ Explorar Museo
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Panel de gestión y exportación */}
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  Gestión de Colección
                </h2>
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">{personalCollection.length} obras</span>
                </div>
              </div>
              
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
                  <div className="text-3xl font-light text-slate-700 mb-1">
                    {collectionStats.totalArtworks || 0}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Total obras</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                  <div className="text-3xl font-light text-gray-700 mb-1">
                    {collectionStats.uniqueArtists || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Artistas</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-stone-50 to-stone-100/50 rounded-xl border border-stone-200/50">
                  <div className="text-3xl font-light text-stone-700 mb-1">
                    {collectionStats.uniqueTechniques || 0}
                  </div>
                  <div className="text-sm text-stone-600 font-medium">Técnicas</div>
                </div>
                
                {collectionStats.oldestYear && (
                  <div className="text-center p-4 bg-gradient-to-b from-zinc-50 to-zinc-100/50 rounded-xl border border-zinc-200/50">
                    <div className="text-lg font-light text-zinc-700 mb-1">
                      {collectionStats.oldestYear} - {collectionStats.newestYear}
                    </div>
                    <div className="text-sm text-zinc-600 font-medium">Período</div>
                  </div>
                )}
              </div>
              
              {/* Acciones de gestión */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="bg-slate-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {showExportOptions ? '📁 Ocultar Opciones' : '📤 Opciones de Gestión'}
                </button>
              </div>
              
              {/* Opciones de exportación */}
              {showExportOptions && (
                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Herramientas de gestión</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={handleExportCollection}
                      className="bg-slate-500 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                    >
                      💾 Exportar JSON
                    </button>
                    
                    <button
                      onClick={handleExportToPDF}
                      className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      📄 Exportar PDF
                    </button>
                    
                    <label className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer text-center">
                      📁 Importar colección
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportCollection}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      onClick={handleShareCollection}
                      className="bg-stone-500 text-white px-4 py-3 rounded-lg hover:bg-stone-600 transition-colors font-medium"
                    >
                      📋 Compartir resumen
                    </button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-white/50 rounded-lg border border-gray-200/30">
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• <strong>Exportar JSON:</strong> Descarga tu colección en formato JSON</p>
                      <p>• <strong>Exportar PDF:</strong> Genera un documento PDF con imágenes y detalles</p>
                      <p>• <strong>Importar:</strong> Carga una colección desde un archivo JSON</p>
                      <p>• <strong>Compartir:</strong> Genera un resumen de tu colección</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleClearCollection}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      🗑️ Limpiar toda la colección
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Galería de obras con filtros integrados */}
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-xl">�</span>
                  Galería de Documentos
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    ({filterStats.totalFiltered} de {filterStats.totalOriginal})
                  </span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                  >
                    {showAdvancedFilters ? 'Filtros básicos' : 'Filtros avanzados'}
                  </button>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearAllFilters}
                      className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Filtros básicos integrados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 rounded-xl border border-gray-200/50">
                {/* Búsqueda por texto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Búsqueda general</label>
                  <input
                    type="text"
                    placeholder="Buscar por título, artista, técnica..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                  />
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📊 Ordenar por</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                    <option value="title">Título A-Z</option>
                    <option value="artist">Artista A-Z</option>
                    <option value="year">Año (desc)</option>
                    <option value="technique">Técnica A-Z</option>
                    <option value="sala">Sala A-Z</option>
                  </select>
                </div>
              </div>

              {/* Filtros avanzados */}
              {showAdvancedFilters && (
                <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/50 backdrop-blur-sm mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">🎛️ Filtros avanzados</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtro por técnica */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Técnica</label>
                      <select
                        value={filters.technique}
                        onChange={(e) => handleFilterChange('technique', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      >
                        <option value="">Todas las técnicas</option>
                        {filterOptions.techniques.map(technique => (
                          <option key={technique} value={technique}>{technique}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por artista */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Artista</label>
                      <select
                        value={filters.artist}
                        onChange={(e) => handleFilterChange('artist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      >
                        <option value="">Todos los artistas</option>
                        {filterOptions.artists.map(artist => (
                          <option key={artist} value={artist}>{artist}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por año específico */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Año específico</label>
                      <select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      >
                        <option value="">Todos los años</option>
                        {filterOptions.years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por sala */}
                    {filterOptions.salas.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sala</label>
                        <select
                          value={filters.sala}
                          onChange={(e) => handleFilterChange('sala', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                        >
                          <option value="">Todas las salas</option>
                          {filterOptions.salas.map(sala => (
                            <option key={sala} value={sala}>{sala}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Rango de años */}
                    {filterOptions.yearRange.min && filterOptions.yearRange.max && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Año desde</label>
                          <select
                            value={filters.yearFrom}
                            onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Desde...</option>
                            {filterOptions.years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Año hasta</label>
                          <select
                            value={filters.yearTo}
                            onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Hasta...</option>
                            {filterOptions.years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Estadísticas de filtros */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-200/30 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-800 font-medium">
                      📊 Mostrando {filterStats.totalFiltered} de {filterStats.totalOriginal} obras
                      {filterStats.percentage < 100 && (
                        <span className="text-blue-600 ml-1">({filterStats.percentage}%)</span>
                      )}
                    </span>
                    
                    {filterStats.totalFiltered > 0 && (
                      <div className="flex gap-3 text-blue-700">
                        <span>🎨 {filterStats.uniqueArtists} artistas</span>
                        <span>🛠️ {filterStats.uniqueTechniques} técnicas</span>
                        {filterStats.uniqueSalas > 0 && (
                          <span>🏛️ {filterStats.uniqueSalas} salas</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {hasActiveFilters() && (
                    <span className="text-blue-600 font-medium text-xs">
                      Filtros activos: {[
                        filters.search && 'Búsqueda',
                        filters.technique && 'Técnica',
                        filters.artist && 'Artista',
                        filters.year && 'Año',
                        filters.sala && 'Sala',
                        (filters.yearFrom || filters.yearTo) && 'Rango de años'
                      ].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Grid de obras */}
              {filteredCollection.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6 opacity-30">🔍</div>
                  <h4 className="text-xl font-light text-gray-600 mb-4">No se encontraron obras</h4>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    No hay obras que coincidan con los filtros aplicados. Prueba ajustando los criterios de búsqueda.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCollection.map((artwork, index) => (
                    <div key={artwork.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                      <div className="relative">
                        <img 
                          src={artwork.src} 
                          alt={artwork.title}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 hidden items-center justify-center"
                        >
                          <div className="text-center text-gray-500">
                            <div className="text-3xl mb-2">🎨</div>
                            <span className="text-sm">Imagen no disponible</span>
                          </div>
                        </div>
                        
                        {/* Indicador de sala */}
                        {artwork.sala && (
                          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            🏛️ {artwork.sala}
                          </div>
                        )}
                        
                        {/* Overlay con información adicional */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <div className="text-white text-sm">
                            {artwork.dimensions && (
                              <p className="mb-1">📏 {artwork.dimensions}</p>
                            )}
                            <p>➕ {new Date(artwork.addedAt).toLocaleDateString('es-ES')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-3">
                        <h4 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                          {artwork.title}
                        </h4>
                        <p className="text-gray-600 font-medium text-sm">{artwork.artist}</p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span>📅</span>
                            {artwork.year}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <span>🛠️</span>
                            {artwork.technique}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const details = `🎨 "${artwork.title}"\n\n👨‍🎨 Artista: ${artwork.artist}\n📅 Año: ${artwork.year}\n🛠️ Técnica: ${artwork.technique}${artwork.description ? `\n📝 Descripción: ${artwork.description}` : ''}${artwork.sala ? `\n🏛️ Sala: ${artwork.sala}` : ''}${artwork.dimensions ? `\n📏 Dimensiones: ${artwork.dimensions}` : ''}`;
                                alert(details);
                              }}
                              className="bg-slate-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-slate-600 transition-all duration-300 font-medium"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleRemoveFromCollection(artwork.id)}
                              className="bg-gray-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-600 transition-all duration-300 font-medium"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
