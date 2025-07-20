"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Brush,
  Save,
  Eraser,
  Droplets,
  Sparkles,
  Square,
  Palette as PaletteIcon,
  Flame,
  Circle,
  Grid3X3,
  Minus,
  PaintBucket,
  Scissors,
  Waves,
  Zap,
  MoreHorizontal,
  Target,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

// Mapeo de iconos para evitar uso de eval()
const ICON_MAP = {
  Brush: Brush,
  Eraser: Eraser,
  Droplets: Droplets,
  Sparkles: Sparkles,
  Square: Square,
  Flame: Flame,
  Circle: Circle,
  Grid3X3: Grid3X3,
  Minus: Minus,
  Waves: Waves,
  Zap: Zap,
  MoreHorizontal: MoreHorizontal,
  Target: Target,
};

import toast from "react-hot-toast";
import ToolActions from "./tools/ToolActions";
import BrushSelector from "./tools/BrushSelector";
// Importar las funciones de dibujo
import {
  hexToRgb as hexToRgbUtil,
  BRUSH_CONFIGS,
  BRUSH_CATEGORIES,
  DEFAULT_COLORS,
  BrushEngine,
} from "@/utils/drawingFunctions";
// Hook de canvas con BrushEngine para todos los pinceles
function useCanvasSimple({
  initialColor = "#000000",
  initialSize = 15,
  initialTool = "brush",
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState(initialColor);
  const [brushSize, setBrushSize] = useState(initialSize);
  const [currentTool, setCurrentTool] = useState(initialTool);
  const [cursorPos, setCursorPos] = useState(null);
  const [lastPoint, setLastPoint] = useState(null);
  const brushEngineRef = useRef(null);

  const getScaledCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const x = (cssX * canvas.width) / rect.width;
    const y = (cssY * canvas.height) / rect.height;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const coords = getScaledCoords(e, canvas);

    // Inicializar BrushEngine si no existe
    if (!brushEngineRef.current) {
      brushEngineRef.current = new BrushEngine(canvas);
    }

    // Configurar el motor de pinceles
    brushEngineRef.current.configure({
      type: currentTool,
      color: brushColor,
      size: brushSize,
    });

    // Dibujar el primer punto
    brushEngineRef.current.draw(coords, null);
    setLastPoint(coords);
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    setCursorPos({ x: cssX, y: cssY });

    if (!isDrawing || !brushEngineRef.current) return;

    const coords = getScaledCoords(e, canvas);

    // Dibujar con el motor de pinceles
    brushEngineRef.current.draw(coords, lastPoint);
    setLastPoint(coords);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restaurar fondo blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const exportImage = () => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL("image/png");
  };

  return {
    canvasRef,
    isDrawing,
    brushColor,
    brushSize,
    currentTool,
    setBrushColor,
    setBrushSize,
    setCurrentTool,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    clearCanvas,
    exportImage,
    cursorPos,
  };
}
import { useCanvasHistory } from "../../hooks/useCanvasHistory";

// Estilos CSS para animaciones del cursor
const cursorAnimationStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  
  @keyframes flicker {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
  
  @keyframes sparkle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(90deg) scale(1.1); }
    50% { transform: rotate(180deg) scale(0.9); }
    75% { transform: rotate(270deg) scale(1.1); }
  }
`;

// Inyectar estilos en el documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = cursorAnimationStyles;
  document.head.appendChild(styleSheet);
}

export default function CanvasEditorPage({ onSave, editingMural = null }) {
  // Estado para el modal de pinceles
  const [showBrushModal, setShowBrushModal] = useState(false);
  
  // Estado para búsqueda de pinceles
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para controlar secciones expandidas del modal
  const [expandedSections, setExpandedSections] = useState({
    basic: true,    // Básicos expandido por defecto
    artistic: false,
    stamp: false,
    pattern: false,
    spray: false,
    sketch: false,
    nature: false,
    materials: false,
    effects: false,
    emotions: false,
    styles: false,
    special: false,
  });

  // Función para toggle de secciones
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Función para expandir todas las secciones
  const expandAllSections = () => {
    setExpandedSections({
      basic: true,
      artistic: true,
      stamp: true,
      pattern: true,
      spray: true,
      sketch: true,
      nature: true,
      materials: true,
      effects: true,
      emotions: true,
      styles: true,
      special: true,
    });
  };

  // Función para colapsar todas las secciones
  const collapseAllSections = () => {
    setExpandedSections({
      basic: false,
      artistic: false,
      stamp: false,
      pattern: false,
      spray: false,
      sketch: false,
      nature: false,
      materials: false,
      effects: false,
      emotions: false,
      styles: false,
      special: false,
    });
  };

  // Filtrar pinceles según el término de búsqueda
  const filteredBrushConfigs = useMemo(() => {
    if (!searchTerm.trim()) return BRUSH_CONFIGS;
    
    const term = searchTerm.toLowerCase().trim();
    return BRUSH_CONFIGS.filter(brush => 
      brush.name.toLowerCase().includes(term) ||
      brush.category?.toLowerCase().includes(term) ||
      (brush.description && brush.description.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  // Función para obtener descripciones de categorías
  const getCategoryDescription = (categoryId) => {
    const descriptions = {
      basic: "Herramientas fundamentales",
      artistic: "Técnicas artísticas variadas",
      stamp: "Sellos específicos",
      pattern: "Diseños y texturas",
      spray: "Efectos de spray",
      sketch: "Técnicas de dibujo",
      nature: "Elementos naturales",
      materials: "Texturas de materiales",
      effects: "Efectos especiales",
      emotions: "Expresiones emocionales",
      styles: "Estilos artísticos diversos",
      special: "Efectos únicos y avanzados"
    };
    return descriptions[categoryId] || "Herramientas especializadas";
  };

  // Agrupar pinceles filtrados por categoría
  const filteredBrushCategories = useMemo(() => {
    const filtered = {};
    
    // Convertir BRUSH_CATEGORIES objeto a array con [id, category]
    Object.entries(BRUSH_CATEGORIES).forEach(([categoryKey, category]) => {
      const categoryId = categoryKey.toLowerCase();
      const brushesInCategory = filteredBrushConfigs.filter(
        brush => brush.category === categoryId
      );
      
      if (brushesInCategory.length > 0) {
        filtered[categoryId] = {
          id: categoryId,
          name: category.name,
          description: getCategoryDescription(categoryId),
          brushes: brushesInCategory
        };
      }
    });
    
    return filtered;
  }, [filteredBrushConfigs]);

  // Efecto para expandir todas las categorías cuando hay búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      // Expandir todas las categorías que tienen resultados
      const categoriesToExpand = Object.keys(filteredBrushCategories);
      setExpandedSections(prev => ({
        ...prev,
        ...categoriesToExpand.reduce((acc, catId) => ({ ...acc, [catId]: true }), {})
      }));
    }
  }, [searchTerm, filteredBrushCategories]);

  // Efecto para cerrar modal con tecla ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showBrushModal) {
        setShowBrushModal(false);
      }
    };

    if (showBrushModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    };
  }, [showBrushModal]);

  // Componente reutilizable para secciones colapsables
  const CollapsibleBrushSection = ({ 
    sectionKey, 
    title, 
    description, 
    icon: IconComponent, 
    bgGradient, 
    hoverBg,
    selectedBg,
    borderColor,
    iconGradient,
    brushes // Nueva prop para pinceles filtrados
  }) => {
    // Usar pinceles filtrados si se proporcionan, sino filtrar por categoría
    const sectionTools = brushes || tools.filter(t => t.category === sectionKey);
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className={`${bgGradient} rounded-2xl border ${borderColor} overflow-hidden h-auto min-h-[120px]`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between p-6 ${hoverBg} transition-colors cursor-pointer`}
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 ${iconGradient} rounded-xl flex items-center justify-center mr-3`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {sectionTools.length} herramientas
            </span>
            <ChevronDown 
              className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>
        
        {/* Contenido expandible con margen superior */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded 
            ? 'max-h-96 opacity-100 pb-6 px-6 pt-4' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="brush-grid-container">
            <div className="grid grid-cols-4 gap-3 brush-grid mt-2">
              {sectionTools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setCurrentTool(tool.id);
                    setShowBrushModal(false);
                  }}
                  className={`group relative p-4 rounded-xl transition-all duration-300 brush-button ${
                    currentTool === tool.id
                      ? `${selectedBg} text-white shadow-lg scale-105`
                      : "bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:scale-105 hover:shadow-md"
                  }`}
                  style={{ cursor: "pointer" }}
                  title={tool.name}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-xs font-medium text-center block">{tool.name}</span>
                  {currentTool === tool.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                  )}
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    );
  };

  // Historial de canvas con hook especializado
  const {
    history,
    historyIndex,
    canUndo,
    canRedo,
    save: saveHistory,
    undo: undoHistory,
    redo: redoHistory,
    clear: clearHistory,
  } = useCanvasHistory();

  // Mantén los estados y lógica que no son de canvas puro (historial, datos de mural, etc.)

  const [canvasBgColor, setCanvasBgColor] = useState("#ffffff");
  const [recentColors, setRecentColors] = useState(["#000000", "#ffffff"]);
  const [prevColors, setPrevColors] = useState([]);

  // --- useCanvasSimple reemplaza la lógica de dibujo y eventos ---
  const {
    canvasRef,
    isDrawing,
    brushColor,
    brushSize,
    currentTool,
    setBrushColor,
    setBrushSize,
    setCurrentTool,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    clearCanvas,
    exportImage,
    cursorPos,
  } = useCanvasSimple({
    initialColor: "#000000",
    initialSize: 15,
    initialTool: "brush",
  });

  // Guardar en historial después de cada trazo
  const saveToHistory = () => {
    if (canvasRef?.current) saveHistory(canvasRef.current);
  };

  // Wrappers para los handlers que incluyen guardado en historial
  const handleMouseDownWithHistory = (e) => {
    handleMouseDown(e);
  };

  const handleMouseMoveWithHistory = (e) => {
    handleMouseMove(e);
  };

  const handleMouseUpWithHistory = (e) => {
    handleMouseUp(e);
    saveToHistory();
  };

  const handleMouseLeaveWithHistory = (e) => {
    handleMouseLeave(e);
    saveToHistory();
  };

  // Inicializar canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Configurar tamaño
      canvas.width = 800;
      canvas.height = 600;

      // Fondo blanco por defecto
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Guardar estado inicial en historial
      saveToHistory();
    }
  }, [canvasRef]);

  // Funciones de utilidad para manejo de colores
  const hexToRgb = hexToRgbUtil;

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Undo/Redo usando el hook
  const undo = () => {
    if (canvasRef?.current) undoHistory(canvasRef.current);
  };
  const redo = () => {
    if (canvasRef?.current) redoHistory(canvasRef.current);
  };

  // Refs para siempre tener el valor actual de brushType y brushColor
  const brushTypeRef = useRef(currentTool);
  const brushColorRef = useRef(brushColor);
  useEffect(() => {
    brushTypeRef.current = currentTool;
  }, [currentTool]);
  useEffect(() => {
    brushColorRef.current = brushColor;
  }, [brushColor]);

  // Función para resetear completamente el contexto del canvas
  const resetCanvasContext = (ctx) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "transparent";
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
  };

  const handleSave = async () => {
    console.log("💾 Iniciando proceso de guardado...");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("❌ No se pudo acceder al canvas");
      toast.error("No se pudo acceder al canvas");
      return;
    }

    try {
      console.log("🎨 Convirtiendo canvas a imagen...");
      const imageDataUrl = canvas.toDataURL("image/png");
      console.log("✅ Imagen generada exitosamente:", imageDataUrl.substring(0, 50) + "...");
      
      if (onSave) {
        onSave(imageDataUrl);
        console.log("📤 Función onSave llamada exitosamente");
      } else {
        console.warn("⚠️ No hay función onSave definida");
      }
    } catch (error) {
      console.error("❌ Error al generar la imagen:", error);
      toast.error("Error al guardar la imagen");
    }
  };

  const applyBgColor = (color) => {
    setCanvasBgColor(color);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory();
    }
  };

  // Organizar pinceles - incluir todos los pinceles disponibles
  const tools = BRUSH_CONFIGS.map((config) => ({
    id: config.type,
    name: config.name,
    icon:
      config.icon === "Palette" ? PaletteIcon : ICON_MAP[config.icon] || Brush,
    category: config.category,
  }));

  const colors = DEFAULT_COLORS;

  const paletteColors = Array.from(
    new Set(
      [brushColor, ...recentColors, ...prevColors, ...colors].filter(Boolean)
    )
  ).slice(0, 12);

  const handleSetBrushColor = (color) => {
    setBrushColor(color);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 6);
    });
  };

  // Descargar el canvas como imagen PNG
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "obra.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      {/* Layout responsivo mejorado */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 h-full">
        
        {/* Panel de herramientas - Responsive */}
        <div className="w-full lg:w-80 lg:min-w-80 order-2 lg:order-1">
          <div className="sticky top-4">
            {/* Herramientas principales */}
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-4">
              <div className="flex items-center justify-center mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                <PaletteIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Herramientas Creativas
                </h3>
              </div>
              
              {/* Color de fondo */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Square className="h-4 w-4 text-indigo-500 mr-2" />
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Fondo del Lienzo
                  </h4>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <input
                      type="color"
                      value={canvasBgColor}
                      onChange={(e) => applyBgColor(e.target.value)}
                      className="w-12 h-12 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>

              {/* Selector de pinceles */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Brush className="h-4 w-4 text-indigo-500 mr-2" />
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Pinceles Digitales
                  </h4>
                </div>
                <BrushSelector
                  brushes={tools.map((t) => ({
                    key: t.id,
                    icon: t.icon,
                    label: t.name,
                  }))}
                  currentBrush={currentTool}
                  onSelectBrush={setCurrentTool}
                  onOpenModal={() => setShowBrushModal(true)}
                />
              </div>

              {/* Tamaño del pincel */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Target className="h-4 w-4 text-indigo-500 mr-2" />
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Tamaño del Trazo
                  </h4>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none slider accent-indigo-600"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">1px</span>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      {brushSize}px
                    </div>
                    <span className="text-xs text-gray-500">50px</span>
                  </div>
                  {/* Visualización del tamaño */}
                  <div className="flex justify-center py-2">
                    <div
                      className="rounded-full border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-800"
                      style={{
                        width: Math.min(brushSize * 2, 60),
                        height: Math.min(brushSize * 2, 60),
                        backgroundColor: brushColor + '20',
                        borderColor: brushColor,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paleta de colores mejorada */}
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <div className="flex items-center justify-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <PaletteIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Paleta de Colores
                </h4>
              </div>
              
              {/* Color actual */}
              <div className="mb-4 text-center">
                <div className="relative inline-block">
                  <div
                    className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white mx-auto"
                    style={{ backgroundColor: brushColor }}
                  ></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    {brushColor.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Colores predefinidos */}
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Colores básicos</h5>
                <div className="grid grid-cols-6 gap-2">
                  {colors.slice(0, 12).map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-xl shadow-md transition-all duration-200 ${
                        brushColor === color
                          ? "border-4 border-indigo-500 scale-110 shadow-lg"
                          : "border-2 border-gray-200 hover:scale-105 hover:shadow-lg"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleSetBrushColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Colores recientes */}
              {recentColors.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Recientes</h5>
                  <div className="flex gap-2 justify-center">
                    {recentColors.slice(0, 6).map((color, index) => (
                      <button
                        key={`${color}-${index}`}
                        type="button"
                        className={`w-6 h-6 rounded-lg shadow transition-all ${
                          brushColor === color
                            ? "border-2 border-indigo-500 scale-110"
                            : "border border-gray-200 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleSetBrushColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de color personalizado */}
              <div className="text-center">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Color personalizado
                </label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => handleSetBrushColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 shadow-md cursor-pointer hover:scale-105 transition-transform mx-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Área del canvas */}
        <div className="flex-1 order-1 lg:order-2">
          <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 h-full">
            
            {/* Barra de acciones */}
            <div className="mb-6">
              <ToolActions
                undo={undo}
                redo={redo}
                clear={clearCanvas}
                download={downloadCanvas}
                save={handleSave}
                historyIndex={historyIndex}
                canvasHistory={history}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>

            {/* Container del canvas responsive */}
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-4xl">
                {/* Canvas con aspect ratio fijo */}
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full rounded-xl shadow-2xl border-4 border-white dark:border-gray-700 bg-white"
                    style={{
                      background: canvasBgColor,
                      cursor: currentTool === 'eraser' ? 'crosshair' : 'crosshair',
                      touchAction: 'none', // Mejor soporte para dispositivos táctiles
                    }}
                    onMouseDown={handleMouseDownWithHistory}
                    onMouseMove={handleMouseMoveWithHistory}
                    onMouseUp={handleMouseUpWithHistory}
                    onMouseLeave={handleMouseLeaveWithHistory}
                  />
                  
                  {/* Overlay para información del canvas */}
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                    {currentTool} • {brushSize}px
                  </div>
                  
                  {/* Indicador de posición del cursor (opcional) */}
                  {cursorPos && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                      {Math.round(cursorPos.x)}, {Math.round(cursorPos.y)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de pinceles mejorado */}
      {showBrushModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 brush-modal-overlay"
          onClick={(e) => {
            // Cerrar modal si se hace click en el overlay (fuera del contenido)
            if (e.target === e.currentTarget) {
              setShowBrushModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div 
            className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden brush-modal-content"
            onClick={(e) => e.stopPropagation()} // Prevenir que el click en el contenido cierre el modal
          >
            
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Brush className="h-6 w-6 mr-3" />
                  <div>
                    <h2 id="modal-title" className="text-2xl font-bold">Galería de Pinceles</h2>
                    <p id="modal-description" className="text-indigo-100 text-sm">Elige tu herramienta creativa perfecta</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Botones de control */}
                  <div className="flex space-x-2">
                    <button
                      onClick={expandAllSections}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Expandir todas las secciones"
                    >
                      <ChevronDown className="h-4 w-4" />
                      <span>Expandir</span>
                    </button>
                    <button
                      onClick={collapseAllSections}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Colapsar todas las secciones"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span>Colapsar</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowBrushModal(false)}
                    className="group relative p-3 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 modal-close-button"
                    style={{ cursor: "pointer" }}
                    title="Cerrar modal"
                  >
                    <X className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300 drop-shadow-sm" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
              
              {/* Buscador de Pinceles */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-white/70" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pinceles... (nombre, categoría, descripción)"
                  className="block w-full pl-10 pr-3 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-white/70 hover:text-white" />
                  </button>
                )}
              </div>
              
              {/* Contador de resultados */}
              {searchTerm && (
                <div className="mt-3 text-sm text-white/80">
                  {filteredBrushConfigs.length} pinceles encontrados
                  {filteredBrushConfigs.length !== BRUSH_CONFIGS.length && 
                    ` de ${BRUSH_CONFIGS.length} total`
                  }
                </div>
              )}
            </div>

            {/* Contenido del modal con scroll */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              
              {/* Pincel actualmente seleccionado */}
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-center">
                  <div className="flex items-center bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md">
                    {(() => {
                      const selectedTool = tools.find(t => t.id === currentTool);
                      const Icon = selectedTool?.icon || Brush;
                      return (
                        <>
                          <Icon className="h-8 w-8 text-indigo-600 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {selectedTool?.name || "Pincel Básico"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Seleccionado actualmente
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Grid de categorías de pinceles con altura uniforme */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                
                {/* Mostrar mensaje si no hay resultados de búsqueda */}
                {searchTerm && Object.keys(filteredBrushCategories).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No se encontraron pinceles
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      Intenta con otros términos de búsqueda como "básico", "artístico", "spray", etc.
                    </p>
                  </div>
                )}
                
                {/* Renderizar categorías filtradas o todas si no hay búsqueda */}
                {(searchTerm ? Object.entries(filteredBrushCategories) : Object.entries(BRUSH_CATEGORIES).map(([key, cat]) => [key.toLowerCase(), { id: key.toLowerCase(), name: cat.name, description: getCategoryDescription(key.toLowerCase()) }])).map(([categoryId, category]) => {
                  // Definir props visuales para cada categoría
                  const categoryProps = {
                    basic: {
                      icon: Brush,
                      bgGradient: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10",
                      hoverBg: "hover:bg-blue-100/50 dark:hover:bg-blue-900/20",
                      selectedBg: "bg-blue-500",
                      borderColor: "border-blue-100 dark:border-blue-800",
                      iconGradient: "bg-gradient-to-r from-blue-500 to-cyan-500"
                    },
                    artistic: {
                      icon: PaletteIcon,
                      bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10",
                      hoverBg: "hover:bg-green-100/50 dark:hover:bg-green-900/20",
                      selectedBg: "bg-green-500",
                      borderColor: "border-green-100 dark:border-green-800",
                      iconGradient: "bg-gradient-to-r from-green-500 to-emerald-500"
                    },
                    stamp: {
                      icon: Target,
                      bgGradient: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10",
                      hoverBg: "hover:bg-pink-100/50 dark:hover:bg-pink-900/20",
                      selectedBg: "bg-pink-500",
                      borderColor: "border-pink-100 dark:border-pink-800",
                      iconGradient: "bg-gradient-to-r from-pink-500 to-rose-500"
                    },
                    pattern: {
                      icon: Grid3X3,
                      bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10",
                      hoverBg: "hover:bg-amber-100/50 dark:hover:bg-amber-900/20",
                      selectedBg: "bg-amber-500",
                      borderColor: "border-amber-100 dark:border-amber-800",
                      iconGradient: "bg-gradient-to-r from-amber-500 to-orange-500"
                    },
                    spray: {
                      icon: Droplets,
                      bgGradient: "bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/10 dark:to-sky-900/10",
                      hoverBg: "hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20",
                      selectedBg: "bg-cyan-500",
                      borderColor: "border-cyan-100 dark:border-cyan-800",
                      iconGradient: "bg-gradient-to-r from-cyan-500 to-sky-500"
                    },
                    sketch: {
                      icon: Minus,
                      bgGradient: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10",
                      hoverBg: "hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20",
                      selectedBg: "bg-yellow-500",
                      borderColor: "border-yellow-100 dark:border-yellow-800",
                      iconGradient: "bg-gradient-to-r from-yellow-500 to-amber-500"
                    },
                    nature: {
                      icon: Sparkles,
                      bgGradient: "bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-900/10 dark:to-lime-900/10",
                      hoverBg: "hover:bg-green-100/50 dark:hover:bg-green-900/20",
                      selectedBg: "bg-green-600",
                      borderColor: "border-green-100 dark:border-green-800",
                      iconGradient: "bg-gradient-to-r from-green-600 to-lime-500"
                    },
                    materials: {
                      icon: Square,
                      bgGradient: "bg-gradient-to-br from-stone-50 to-slate-50 dark:from-stone-900/10 dark:to-slate-900/10",
                      hoverBg: "hover:bg-stone-100/50 dark:hover:bg-stone-900/20",
                      selectedBg: "bg-stone-600",
                      borderColor: "border-stone-100 dark:border-stone-800",
                      iconGradient: "bg-gradient-to-r from-stone-600 to-slate-500"
                    },
                    effects: {
                      icon: Sparkles,
                      bgGradient: "bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10",
                      hoverBg: "hover:bg-violet-100/50 dark:hover:bg-violet-900/20",
                      selectedBg: "bg-violet-600",
                      borderColor: "border-violet-100 dark:border-violet-800",
                      iconGradient: "bg-gradient-to-r from-violet-600 to-fuchsia-500"
                    },
                    emotions: {
                      icon: Sparkles,
                      bgGradient: "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10",
                      hoverBg: "hover:bg-red-100/50 dark:hover:bg-red-900/20",
                      selectedBg: "bg-red-500",
                      borderColor: "border-red-100 dark:border-red-800",
                      iconGradient: "bg-gradient-to-r from-red-500 to-pink-500"
                    },
                    styles: {
                      icon: PaletteIcon,
                      bgGradient: "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10",
                      hoverBg: "hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20",
                      selectedBg: "bg-indigo-600",
                      borderColor: "border-indigo-100 dark:border-indigo-800",
                      iconGradient: "bg-gradient-to-r from-indigo-600 to-blue-500"
                    },
                    special: {
                      icon: Zap,
                      bgGradient: "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10",
                      hoverBg: "hover:bg-purple-100/50 dark:hover:bg-purple-900/20",
                      selectedBg: "bg-purple-500",
                      borderColor: "border-purple-100 dark:border-purple-800",
                      iconGradient: "bg-gradient-to-r from-purple-500 to-indigo-500"
                    }
                  };

                  const props = categoryProps[categoryId] || categoryProps.basic;
                  
                  return (
                    <CollapsibleBrushSection
                      key={categoryId}
                      sectionKey={categoryId}
                      title={category.name}
                      description={category.description}
                      icon={props.icon}
                      bgGradient={props.bgGradient}
                      hoverBg={props.hoverBg}
                      selectedBg={props.selectedBg}
                      borderColor={props.borderColor}
                      iconGradient={props.iconGradient}
                      brushes={searchTerm ? category.brushes : undefined}
                    />
                  );
                })}

              </div>
            </div>

            {/* Footer del modal mejorado */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {searchTerm ? (
                      <>
                        Mostrando <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredBrushConfigs.length}</span> de {BRUSH_CONFIGS.length} pinceles
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{BRUSH_CONFIGS.length}</span> pinceles disponibles
                      </>
                    )}
                  </div>
                </div>
                
                {/* Botón de cerrar mejorado */}
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Click fuera del modal o presiona ESC para cerrar
                  </div>
                  <button
                    onClick={() => setShowBrushModal(false)}
                    className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform active:scale-95 flex items-center space-x-2 border border-red-400/30"
                    style={{ cursor: "pointer" }}
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    
                    <span className="relative z-10">Cerrar Galería</span>
                    <X className="relative z-10 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
