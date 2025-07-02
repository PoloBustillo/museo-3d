"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { 
  Plus, 
  Palette, 
  Upload, 
  Edit3, 
  Trash2, 
  Download, 
  Share2, 
  Eye, 
  Search,
  Filter,
  Grid,
  List,
  Brush,
  Save,
  X,
  RefreshCw,
  ChevronDown
} from "lucide-react";

// Componentes de fondo animado
function AnimatedBlobsBackground() {
  return (
    <>
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-orange-300/60 dark:bg-orange-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-pink-300/60 dark:bg-pink-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed" />
      <div
        className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-fuchsia-200/50 dark:bg-fuchsia-800/20 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe"
        style={{ transform: "translate(-50%,-50%) scale(1.2)" }}
      />
    </>
  );
}

function DotsPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden dark:block"
      width="100%"
      height="100%"
      style={{ opacity: 0.13 }}
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

// Componente Canvas para crear murales
function CanvasEditor({ isOpen, onClose, onSave, editingMural = null }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [muralData, setMuralData] = useState({
    titulo: editingMural?.titulo || '',
    descripcion: editingMural?.descripcion || '',
    tecnica: editingMural?.tecnica || 'Digital',
    year: editingMural?.year || new Date().getFullYear(),
  });

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ];

  const tools = [
    { id: 'brush', name: 'Pincel', icon: Brush },
    { id: 'eraser', name: 'Borrador', icon: X },
  ];

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;
      
      // Fondo blanco por defecto
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Si estamos editando un mural existente, cargar la imagen
      if (editingMural?.url_imagen) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveToHistory();
        };
        img.src = editingMural.url_imagen;
      } else {
        saveToHistory();
      }
    }
  }, [isOpen, editingMural]);

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[historyIndex + 1];
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    
    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleSave = async () => {
    if (!muralData.titulo.trim()) {
      toast.error('Por favor ingresa un título para tu obra');
      return;
    }

    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('imagen', blob, `${muralData.titulo}.png`);
      formData.append('titulo', muralData.titulo);
      formData.append('descripcion', muralData.descripcion);
      formData.append('tecnica', muralData.tecnica);
      formData.append('year', muralData.year);
      formData.append('autor', 'Usuario'); // Esto debería ser el nombre del usuario logueado
      
      try {
        const url = editingMural ? `/api/murales/${editingMural.id}` : '/api/murales';
        const method = editingMural ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(editingMural ? 'Obra actualizada exitosamente' : 'Obra creada exitosamente');
          onSave(result);
          onClose();
        } else {
          toast.error('Error al guardar la obra');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al guardar la obra');
      }
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingMural ? 'Editar Obra' : 'Crear Nueva Obra'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel de herramientas */}
            <div className="lg:col-span-1 space-y-6">
              {/* Información del mural */}
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Información de la Obra</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título de la obra"
                    value={muralData.titulo}
                    onChange={(e) => setMuralData({...muralData, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={muralData.descripcion}
                    onChange={(e) => setMuralData({...muralData, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <input
                    type="text"
                    placeholder="Técnica"
                    value={muralData.tecnica}
                    onChange={(e) => setMuralData({...muralData, tecnica: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Año"
                    value={muralData.year}
                    onChange={(e) => setMuralData({...muralData, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Herramientas */}
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Herramientas</h3>
                <div className="space-y-3">
                  {tools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setCurrentTool(tool.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          currentTool === tool.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        {tool.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colores */}
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Colores</h3>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        currentColor === color
                          ? 'border-indigo-600 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-full mt-3 h-10 rounded-lg"
                />
              </div>

              {/* Tamaño del pincel */}
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Tamaño del Pincel</h3>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {brushSize}px
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Deshacer
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= canvasHistory.length - 1}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Rehacer
                </button>
                <button
                  onClick={clearCanvas}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Limpiar Lienzo
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-3">
              <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair max-w-full h-auto"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingMural ? 'Actualizar Obra' : 'Guardar Obra'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MisObras() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuth();
  const [murales, setMurales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' o 'list'
  const [showCanvasEditor, setShowCanvasEditor] = useState(false);
  const [editingMural, setEditingMural] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    tecnica: '',
    year: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMurales, setSelectedMurales] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Cargar murales del usuario
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserMurales();
    }
  }, [session]);

  const fetchUserMurales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/murales?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMurales(data.murales || []);
      }
    } catch (error) {
      console.error('Error fetching murales:', error);
      toast.error('Error al cargar tus obras');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar murales
  const filteredMurales = murales.filter(mural => {
    if (filters.search && !mural.titulo?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !mural.autor?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !mural.tecnica?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.tecnica && mural.tecnica !== filters.tecnica) return false;
    if (filters.year && mural.year !== filters.year) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title': return (a.titulo || '').localeCompare(b.titulo || '');
      case 'year': return (b.year || 0) - (a.year || 0);
      default: return 0;
    }
  });

  // Manejar guardado desde canvas
  const handleCanvasSave = (savedMural) => {
    if (editingMural) {
      setMurales(murales.map(m => m.id === savedMural.id ? savedMural : m));
    } else {
      setMurales([savedMural, ...murales]);
    }
    setEditingMural(null);
  };

  // Eliminar mural
  const handleDeleteMural = async (muralId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta obra?')) return;
    
    try {
      const response = await fetch(`/api/murales/${muralId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMurales(murales.filter(m => m.id !== muralId));
        toast.success('Obra eliminada exitosamente');
      } else {
        toast.error('Error al eliminar la obra');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la obra');
    }
  };

  // Componente de subida de archivos
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('titulo', file.name.split('.')[0]);
    formData.append('tecnica', 'Fotografía/Digital');
    formData.append('year', new Date().getFullYear());
    formData.append('autor', session?.user?.name || 'Usuario');

    try {
      const response = await fetch('/api/murales', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMurales([result, ...murales]);
        toast.success('Obra subida exitosamente');
        setShowUploadModal(false);
      } else {
        toast.error('Error al subir la obra');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir la obra');
    }
  }, [murales, session]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatedBlobsBackground />
          <DotsPattern />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-lg text-foreground">Cargando tus obras...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatedBlobsBackground />
          <DotsPattern />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Inicia sesión para ver tus obras
            </h1>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-500 underline"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBlobsBackground />
        <DotsPattern />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 md:pt-28 pb-8 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Palette className="h-10 w-10 text-indigo-600" />
              Mis Obras
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Crea, administra y comparte tus obras de arte digitales
            </p>

            {/* Botones de acción principales */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setShowCanvasEditor(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg"
              >
                <Brush className="h-5 w-5" />
                Crear con Canvas
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg"
              >
                <Upload className="h-5 w-5" />
                Subir Imagen
              </button>
            </div>

            {/* Controles de vista y filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-4 border border-border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar obras..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredMurales.length} obra{filteredMurales.length !== 1 ? 's' : ''}
                </span>
                <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    view === 'grid' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    view === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-4 border border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filters.tecnica}
                    onChange={(e) => setFilters({...filters, tecnica: e.target.value})}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todas las técnicas</option>
                    {[...new Set(murales.map(m => m.tecnica).filter(Boolean))].map(tecnica => (
                      <option key={tecnica} value={tecnica}>{tecnica}</option>
                    ))}
                  </select>

                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos los años</option>
                    {[...new Set(murales.map(m => m.year).filter(Boolean))].sort((a, b) => b - a).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                    <option value="title">Por título</option>
                    <option value="year">Por año</option>
                  </select>

                  <button
                    onClick={() => setFilters({ search: '', tecnica: '', year: '', sortBy: 'newest' })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Contenido principal */}
          {filteredMurales.length === 0 ? (
            <div className="text-center py-16">
              <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {murales.length === 0 ? 'No tienes obras aún' : 'No se encontraron obras'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {murales.length === 0 
                  ? 'Comienza creando tu primera obra de arte digital'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {murales.length === 0 && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowCanvasEditor(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <Brush className="h-5 w-5" />
                    Crear con Canvas
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    Subir Imagen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={
              view === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredMurales.map((mural) => (
                <motion.div
                  key={mural.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={
                    view === 'grid'
                      ? 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border'
                      : 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border flex items-center gap-4 p-4'
                  }
                >
                  {view === 'grid' ? (
                    <>
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={mural.url_imagen}
                          alt={mural.titulo}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMural(mural);
                                setShowCanvasEditor(true);
                              }}
                              className="p-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMural(mural.id)}
                              className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
                          {mural.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {mural.tecnica} • {mural.year}
                        </p>
                        {mural.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {mural.descripcion}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-lg">
                        <img
                          src={mural.url_imagen}
                          alt={mural.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
                          {mural.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {mural.tecnica} • {mural.year}
                        </p>
                        {mural.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {mural.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingMural(mural);
                            setShowCanvasEditor(true);
                          }}
                          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMural(mural.id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de subida de imágenes */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subir Imagen
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz click'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Formatos soportados: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Canvas Editor */}
      <CanvasEditor
        isOpen={showCanvasEditor}
        onClose={() => {
          setShowCanvasEditor(false);
          setEditingMural(null);
        }}
        onSave={handleCanvasSave}
        editingMural={editingMural}
      />
    </div>
  );
}

      }

      setFilteredCollection(filtered);

      // Calcular estadísticas de filtros
      const stats = {
        totalFiltered: filtered.length,
        totalOriginal: personalCollection.length,
        percentage: Math.round(
          (filtered.length / personalCollection.length) * 100
        ),
        uniqueArtists: new Set(filtered.map((item) => item.artist)).size,
        uniqueTechniques: new Set(filtered.map((item) => item.technique)).size,
        uniqueSalas: new Set(filtered.map((item) => item.sala)).size,
        yearRange:
          filtered.length > 0
            ? {
                min: Math.min(
                  ...filtered.map((item) => parseInt(item.year) || 0)
                ),
                max: Math.max(
                  ...filtered.map((item) => parseInt(item.year) || 0)
                ),
              }
            : null,
      };
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
        yearRange: null,
      });
    }
  }, [personalCollection, filters]);

  // Funciones para manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      technique: "",
      artist: "",
      year: "",
      sortBy: "newest",
      sala: "",
      yearFrom: "",
      yearTo: "",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.technique ||
      filters.artist ||
      filters.year ||
      filters.sala ||
      filters.yearFrom ||
      filters.yearTo
    );
  };

  const handleExportCollection = () => {
    const dataStr = JSON.stringify(personalCollection, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mi-coleccion-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCollection = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (Array.isArray(importedData)) {
        // Aquí podrías implementar la lógica para fusionar con la colección actual
        alert(`Archivo cargado con ${importedData.length} obras`);
      } else {
        alert("Formato de archivo inválido");
      }
    } catch (error) {
      alert("Error al procesar el archivo");
    }

    event.target.value = "";
  };

  const handleShareCollection = () => {
    const summary = `Mi colección del Museo Virtual 3D\n\nTotal de obras: ${personalCollection.length}\nArtistas únicos: ${collectionStats.uniqueArtists}\nTécnicas únicas: ${collectionStats.uniqueTechniques}\n\n${window.location.origin}`;

    if (navigator.share) {
      navigator.share({
        title: "Mi Colección del Museo Virtual 3D",
        text: summary,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard
        .writeText(summary)
        .then(() => {
          alert("¡Resumen copiado al portapapeles!");
        })
        .catch(() => {
          alert(summary);
        });
    }
  };

  const handleExportToPDF = async () => {
    try {
      console.log("Exporting to PDF. Collection data:", filteredCollection);

      // Mostrar mensaje de carga
      const loadingMessage = document.createElement("div");
      loadingMessage.id = "pdf-loading";
      loadingMessage.className =
        "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50";
      loadingMessage.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-800">Generando PDF...</p>
          <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
        </div>
      `;
      document.body.appendChild(loadingMessage);

      // Crear el PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Título del documento
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Mi Colección Personal", margin, 30);

      // Información del usuario
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Usuario: ${userProfile?.name || session?.user?.name || "Usuario"}`,
        margin,
        45
      );
      pdf.text(`Total de obras: ${filteredCollection.length}`, margin, 55);
      pdf.text(
        `Fecha de exportación: ${new Date().toLocaleDateString("es-ES")}`,
        margin,
        65
      );

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
          img.crossOrigin = "anonymous";

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              // Si falla, usar una imagen placeholder
              img.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlbjwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjU1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPm5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPgo=";
              img.onload = resolve;
              img.onerror = reject;
            };
            img.src = artwork.src || artwork.imagenUrl || "";
          });

          // Calcular dimensiones de la imagen
          const imgWidth = 60;
          const imgHeight = (img.height * imgWidth) / img.width;
          const textX = margin + imgWidth + 10;

          // Agregar imagen al PDF
          pdf.addImage(img, "JPEG", margin, currentY, imgWidth, imgHeight);

          // Agregar información de la obra
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(artwork.title || "Sin título", textX, currentY + 8);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `Artista: ${artwork.artist || "Desconocido"}`,
            textX,
            currentY + 18
          );
          pdf.text(
            `Técnica: ${artwork.technique || "No especificada"}`,
            textX,
            currentY + 28
          );
          pdf.text(
            `Año: ${artwork.year || "No especificado"}`,
            textX,
            currentY + 38
          );

          if (artwork.sala) {
            pdf.text(`Sala: ${artwork.sala}`, textX, currentY + 48);
          }

          if (artwork.dimensions) {
            pdf.text(
              `Dimensiones: ${artwork.dimensions}`,
              textX,
              currentY + 58
            );
          }

          currentY += Math.max(imgHeight, 50) + 15;
        } catch (error) {
          console.error(
            "Error processing image for artwork:",
            artwork.title,
            error
          );

          // Si falla la imagen, agregar solo el texto
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(artwork.title || "Sin título", margin, currentY + 8);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `Artista: ${artwork.artist || "Desconocido"}`,
            margin,
            currentY + 18
          );
          pdf.text(
            `Técnica: ${artwork.technique || "No especificada"}`,
            margin,
            currentY + 28
          );
          pdf.text(
            `Año: ${artwork.year || "No especificado"}`,
            margin,
            currentY + 38
          );

          if (artwork.sala) {
            pdf.text(`Sala: ${artwork.sala}`, margin, currentY + 48);
          }

          if (artwork.dimensions) {
            pdf.text(
              `Dimensiones: ${artwork.dimensions}`,
              margin,
              currentY + 58
            );
          }

          pdf.text("[Imagen no disponible]", margin, currentY + 68);

          currentY += 80;
        }
      }

      // Guardar el PDF
      const fileName = `mi-coleccion-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      // Remover mensaje de carga
      document.body.removeChild(loadingMessage);

      alert(`¡PDF generado exitosamente! Se ha descargado como "${fileName}"`);
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Remover mensaje de carga si existe
      const loadingMessage = document.getElementById("pdf-loading");
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }

      alert("Error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  const handleClearCollectionLocal = () => {
    openModal("confirm-clear", {
      title: "Limpiar Colección",
      message:
        "¿Estás seguro de que quieres eliminar toda tu colección? Esta acción no se puede deshacer.",
      onConfirm: () => {
        handleClearCollection();
        closeModal();
      },
    });
  };

  const handleRemoveFromCollectionLocal = (artworkId) => {
    const artwork = personalCollection.find((item) => item.id === artworkId);
    openModal("confirm-remove", {
      title: "Eliminar Obra",
      message: `¿Estás seguro de que quieres eliminar "${
        artwork?.title || "esta obra"
      }" de tu colección?`,
      artwork,
      onConfirm: () => {
        handleRemoveFromCollection(artworkId);
        closeModal();
      },
    });
  };

  const handleShowArtworkDetails = (artwork) => {
    openModal("artwork-details", { artwork });
  };

  const handleShowCollectionStats = () => {
    openModal("collection-stats", {
      stats: collectionStats,
      collection: personalCollection,
    });
  };

  // Renderizar la página
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 opacity-20">🔒</div>
          <h2 className="text-2xl font-light text-gray-600 mb-4">
            Acceso Requerido
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Necesitas iniciar sesión para acceder a tus documentos personales.
          </p>
          <Link
            href="/"
            className="inline-block bg-slate-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300"
          >
            🏠 Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  Mis Documentos
                </h1>
                <p className="text-gray-600 mt-2">
                  Tu colección personal de obras de arte
                </p>
                {userProfile && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">
                      Usuario: {userProfile?.name || user?.name || user?.email}
                    </span>
                    {userProfile.roles && (
                      <div className="flex gap-1">
                        {userProfile.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              role === "admin"
                                ? "bg-red-100 text-red-800"
                                : role === "moderator"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleShowCollectionStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📊 Ver Estadísticas
                </button>
                <Link
                  href="/museo"
                  className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  🏛️ Explorar Museo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {personalCollection.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm p-16 rounded-2xl border border-white/50 shadow-xl text-center">
              <div className="text-8xl mb-6 opacity-20">📄</div>
              <h3 className="text-2xl font-light text-gray-600 mb-4">
                No tienes documentos aún
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                Comienza agregando obras a tu colección personal desde el museo
                virtual.
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
                    {collectionLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Sincronizando...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          {personalCollection.length} obras
                        </span>
                      </div>
                    )}
                    {lastSync && (
                      <span className="text-xs text-gray-500">
                        Última sincronización:{" "}
                        {new Date(lastSync).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
                    <div className="text-3xl font-light text-slate-700 mb-1">
                      {collectionStats.totalArtworks || 0}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Total obras
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                    <div className="text-3xl font-light text-gray-700 mb-1">
                      {collectionStats.uniqueArtists || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Artistas
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-b from-stone-50 to-stone-100/50 rounded-xl border border-stone-200/50">
                    <div className="text-3xl font-light text-stone-700 mb-1">
                      {collectionStats.uniqueTechniques || 0}
                    </div>
                    <div className="text-sm text-stone-600 font-medium">
                      Técnicas
                    </div>
                  </div>

                  {collectionStats.oldestYear && (
                    <div className="text-center p-4 bg-gradient-to-b from-zinc-50 to-zinc-100/50 rounded-xl border border-zinc-200/50">
                      <div className="text-lg font-light text-zinc-700 mb-1">
                        {collectionStats.oldestYear} -{" "}
                        {collectionStats.newestYear}
                      </div>
                      <div className="text-sm text-zinc-600 font-medium">
                        Período
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones de gestión */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="bg-slate-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {showExportOptions
                      ? "📁 Ocultar Opciones"
                      : "📤 Opciones de Gestión"}
                  </button>
                </div>

                {/* Opciones de exportación */}
                {showExportOptions && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Herramientas de gestión
                    </h3>
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
                        <p>
                          • <strong>Exportar JSON:</strong> Descarga tu
                          colección en formato JSON
                        </p>
                        <p>
                          • <strong>Exportar PDF:</strong> Genera un documento
                          PDF con imágenes y detalles
                        </p>
                        <p>
                          • <strong>Importar:</strong> Carga una colección desde
                          un archivo JSON
                        </p>
                        <p>
                          • <strong>Compartir:</strong> Genera un resumen de tu
                          colección
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleClearCollectionLocal}
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
                    <span className="text-xl">🎨</span>
                    Galería de Documentos
                    <span className="text-lg font-normal text-gray-500 ml-2">
                      ({filterStats.totalFiltered} de{" "}
                      {filterStats.totalOriginal})
                    </span>
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                      {showAdvancedFilters
                        ? "Filtros básicos"
                        : "Filtros avanzados"}
                    </button>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtros básicos */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Buscar por título, artista o técnica..."
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      />
                    </div>

                    {/* Ordenamiento */}
                    <div className="min-w-[150px]">
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          handleFilterChange("sortBy", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      >
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguos</option>
                        <option value="title">Por título</option>
                        <option value="artist">Por artista</option>
                        <option value="year">Por año</option>
                        <option value="technique">Por técnica</option>
                        <option value="sala">Por sala</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtros avanzados */}
                {showAdvancedFilters && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/30">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      Filtros Avanzados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Técnica */}
                      {filterOptions.techniques.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Técnica
                          </label>
                          <select
                            value={filters.technique}
                            onChange={(e) =>
                              handleFilterChange("technique", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todas las técnicas</option>
                            {filterOptions.techniques.map((technique) => (
                              <option key={technique} value={technique}>
                                {technique}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Artista */}
                      {filterOptions.artists.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Artista
                          </label>
                          <select
                            value={filters.artist}
                            onChange={(e) =>
                              handleFilterChange("artist", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todos los artistas</option>
                            {filterOptions.artists.map((artist) => (
                              <option key={artist} value={artist}>
                                {artist}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Año */}
                      {filterOptions.years.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Año
                          </label>
                          <select
                            value={filters.year}
                            onChange={(e) =>
                              handleFilterChange("year", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todos los años</option>
                            {filterOptions.years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Sala */}
                      {filterOptions.salas.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sala
                          </label>
                          <select
                            value={filters.sala}
                            onChange={(e) =>
                              handleFilterChange("sala", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todas las salas</option>
                            {filterOptions.salas.map((sala) => (
                              <option key={sala} value={sala}>
                                {sala}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Rango de años */}
                      {filterOptions.yearRange.min &&
                        filterOptions.yearRange.max && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Año desde
                              </label>
                              <select
                                value={filters.yearFrom}
                                onChange={(e) =>
                                  handleFilterChange("yearFrom", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                              >
                                <option value="">Desde...</option>
                                {filterOptions.years.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Año hasta
                              </label>
                              <select
                                value={filters.yearTo}
                                onChange={(e) =>
                                  handleFilterChange("yearTo", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                              >
                                <option value="">Hasta...</option>
                                {filterOptions.years.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
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
                        📊 Mostrando {filterStats.totalFiltered} de{" "}
                        {filterStats.totalOriginal} obras
                        {filterStats.percentage < 100 && (
                          <span className="text-blue-600 ml-1">
                            ({filterStats.percentage}%)
                          </span>
                        )}
                      </span>

                      {filterStats.totalFiltered > 0 && (
                        <div className="flex gap-3 text-blue-700">
                          <span>🎨 {filterStats.uniqueArtists} artistas</span>
                          <span>
                            🛠️ {filterStats.uniqueTechniques} técnicas
                          </span>
                          {filterStats.uniqueSalas > 0 && (
                            <span>🏛️ {filterStats.uniqueSalas} salas</span>
                          )}
                        </div>
                      )}
                    </div>

                    {hasActiveFilters() && (
                      <span className="text-blue-600 font-medium text-xs">
                        Filtros activos:{" "}
                        {[
                          filters.search && "Búsqueda",
                          filters.technique && "Técnica",
                          filters.artist && "Artista",
                          filters.year && "Año",
                          filters.sala && "Sala",
                          (filters.yearFrom || filters.yearTo) &&
                            "Rango de años",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid de obras */}
                {filteredCollection.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6 opacity-30">🔍</div>
                    <h4 className="text-xl font-light text-gray-600 mb-4">
                      No se encontraron obras
                    </h4>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      No hay obras que coincidan con los filtros aplicados.
                      Prueba ajustando los criterios de búsqueda.
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
                      <div
                        key={artwork.id}
                        className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                      >
                        <div className="relative">
                          <img
                            src={artwork.src}
                            alt={artwork.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 hidden items-center justify-center">
                            <div className="text-center text-gray-500">
                              <div className="text-3xl mb-2">🎨</div>
                              <span className="text-sm">
                                Imagen no disponible
                              </span>
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
                              <p>
                                ➕{" "}
                                {new Date(artwork.addedAt).toLocaleDateString(
                                  "es-ES"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                            {artwork.title}
                          </h4>
                          <p className="text-gray-600 font-medium text-sm">
                            {artwork.artist}
                          </p>

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
                            <span className="text-xs text-gray-400">
                              #{index + 1}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleShowArtworkDetails(artwork)
                                }
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              >
                                👁️ Ver
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoveFromCollectionLocal(artwork.id)
                                }
                                className="text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              >
                                🗑️ Quitar
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

      {/* Modales */}
      <ModalWrapper
        modalName="confirm-clear"
        title="Confirmar Acción"
        size="sm"
      >
        {(data) => (
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {data?.title || "Confirmar Acción"}
            </h3>
            <p className="text-gray-600 mb-6">
              {data?.message ||
                "¿Estás seguro de que quieres realizar esta acción?"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={data?.onConfirm}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      <ModalWrapper modalName="confirm-remove" title="Eliminar Obra" size="sm">
        {(data) => (
          <div className="text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {data?.title || "Eliminar Obra"}
            </h3>
            <p className="text-gray-600 mb-6">
              {data?.message ||
                "¿Estás seguro de que quieres eliminar esta obra?"}
            </p>
            {data?.artwork && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <img
                  src={data.artwork.src}
                  alt={data.artwork.title}
                  className="w-16 h-16 object-cover rounded mx-auto mb-2"
                />
                <p className="text-sm font-medium text-gray-800">
                  {data.artwork.title}
                </p>
                <p className="text-xs text-gray-600">{data.artwork.artist}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={data?.onConfirm}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      <ModalWrapper
        modalName="artwork-details"
        title="Detalles de la Obra"
        size="lg"
      >
        {(data) => (
          <div className="space-y-6">
            {data?.artwork && (
              <>
                <div className="flex gap-6">
                  <img
                    src={data.artwork.src}
                    alt={data.artwork.title}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {data.artwork.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      {data.artwork.artist}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Año:</span>{" "}
                        {data.artwork.year}
                      </p>
                      <p>
                        <span className="font-medium">Técnica:</span>{" "}
                        {data.artwork.technique}
                      </p>
                      {data.artwork.sala && (
                        <p>
                          <span className="font-medium">Sala:</span>{" "}
                          {data.artwork.sala}
                        </p>
                      )}
                      {data.artwork.dimensions && (
                        <p>
                          <span className="font-medium">Dimensiones:</span>{" "}
                          {data.artwork.dimensions}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Agregado:</span>{" "}
                        {new Date(data.artwork.addedAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {data.artwork.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Descripción
                    </h4>
                    <p className="text-gray-600">{data.artwork.description}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </ModalWrapper>

      <ModalWrapper
        modalName="collection-stats"
        title="Estadísticas de la Colección"
        size="xl"
      >
        {(data) => (
          <div className="space-y-6">
            {data?.stats && data?.collection && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.stats.totalArtworks}
                    </div>
                    <div className="text-sm text-blue-800">Total Obras</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.stats.uniqueArtists}
                    </div>
                    <div className="text-sm text-green-800">
                      Artistas Únicos
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.stats.uniqueTechniques}
                    </div>
                    <div className="text-sm text-purple-800">
                      Técnicas Únicas
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {data.stats.oldestYear} - {data.stats.newestYear}
                    </div>
                    <div className="text-sm text-orange-800">Período</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Distribución por Técnica
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      data.collection.reduce((acc, artwork) => {
                        acc[artwork.technique] =
                          (acc[artwork.technique] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([technique, count]) => (
                      <div
                        key={technique}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-700">
                          {technique}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Artistas Más Representados
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      data.collection.reduce((acc, artwork) => {
                        acc[artwork.artist] = (acc[artwork.artist] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([artist, count]) => (
                        <div
                          key={artist}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-700">
                            {artist}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {count} obras
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ModalWrapper>
    </>
  );
}
