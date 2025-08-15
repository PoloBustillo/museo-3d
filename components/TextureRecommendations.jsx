import React, { useState } from "react";
import { useTextureRecommendations } from "../hooks/useTextureRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Tabs eliminados
import { Loader2, Palette, Sparkles, Eye, Download } from "lucide-react";

/**
 * Componente para mostrar una textura recomendada
 */
function TextureCard({ texture, type, onApply, isApplying }) {
  const [imageError, setImageError] = useState(false);

  const getPreviewUrl = () => {
    if (texture.maps?.albedo) {
      return `/assets/textures/${texture.name}/${texture.maps.albedo}`;
    }
    return `/assets/textures/${texture.name}/${texture.name}_Color.jpg`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {!imageError ? (
          <img
            src={getPreviewUrl()}
            alt={texture.name}
            className="w-full h-32 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
            <Palette className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Badge de puntuación */}
        <Badge
          className="absolute top-2 right-2"
          variant={
            texture.score > 80
              ? "default"
              : texture.score > 60
                ? "secondary"
                : "outline"
          }
        >
          {texture.score}pts
        </Badge>
      </div>

      <CardContent className="p-4">
        <h4 className="font-semibold text-sm mb-2 truncate">{texture.name}</h4>

        {/* Información de mapas PBR */}
        <div className="flex gap-1 mb-2">
          {texture.maps?.albedo && (
            <Badge variant="outline" className="text-xs">
              Color
            </Badge>
          )}
          {texture.maps?.normal && (
            <Badge variant="outline" className="text-xs">
              Normal
            </Badge>
          )}
          {texture.maps?.roughness && (
            <Badge variant="outline" className="text-xs">
              Rough
            </Badge>
          )}
          {texture.maps?.metalness && (
            <Badge variant="outline" className="text-xs">
              Metal
            </Badge>
          )}
        </div>

        {/* Razón de recomendación */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {texture.reason}
        </p>

        {/* Botón aplicar */}
        <Button
          size="sm"
          onClick={() => onApply(texture.name, type)}
          disabled={isApplying}
          className="w-full"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Aplicando...
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" /> Aplicar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Componente principal de recomendaciones de texturas
 */
export function TextureRecommendations({ salaId }) {
  const {
    recommendations,
    loading,
    error,
    wallRecommendations,
    floorRecommendations,
    currentTextures,
    salaInfo,
    analysis,
    applyTextures,
    applyBestRecommendations,
    loadRecommendations,
  } = useTextureRecommendations(salaId);

  const [applyingTexture, setApplyingTexture] = useState(false);
  const [activeTab, setActiveTab] = useState("paredes");

  /**
   * Aplicar una textura específica
   */
  const handleApplyTexture = async (textureName, type) => {
    setApplyingTexture(true);
    try {
      if (type === "wall") {
        await applyTextures(textureName, currentTextures.piso);
      } else if (type === "floor") {
        await applyTextures(currentTextures.pared, textureName);
      }
    } catch (error) {
      console.error("Error applying texture:", error);
    } finally {
      setApplyingTexture(false);
    }
  };

  /**
   * Aplicar mejores recomendaciones
   */
  const handleApplyBest = async () => {
    setApplyingTexture(true);
    try {
      await applyBestRecommendations();
    } catch (error) {
      console.error("Error applying best recommendations:", error);
    } finally {
      setApplyingTexture(false);
    }
  };

  if (loading && !recommendations) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Analizando sala y generando recomendaciones...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => loadRecommendations(true)}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header con información de la sala */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recomendaciones de Texturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h4 className="font-semibold">Sala: {salaInfo?.nombre}</h4>
              <p className="text-sm text-gray-600">ID: {salaInfo?.id}</p>
            </div>
            <div>
              <h4 className="font-semibold">
                Tema: {salaInfo?.tema || "Moderno"}
              </h4>
              <p className="text-sm text-gray-600">
                Estilo: {analysis?.colorStyle || "neutral"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Color de sala</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: salaInfo?.color || "#ffffff" }}
                />
                <span className="text-sm">
                  {salaInfo?.color || "Sin definir"}
                </span>
              </div>
            </div>
          </div>

          {/* Texturas actuales */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Texturas Actuales:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Pared:</strong> {currentTextures.pared || "Sin definir"}
              </div>
              <div>
                <strong>Piso:</strong> {currentTextures.piso || "Sin definir"}
              </div>
            </div>
          </div>

          {/* Botón aplicar mejores */}
          <Button
            onClick={handleApplyBest}
            disabled={applyingTexture}
            className="w-full"
          >
            {applyingTexture ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Aplicando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" /> Aplicar Mejores
                Recomendaciones
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recomendaciones de paredes */}
      <Card>
        <CardHeader>
          <CardTitle>Paredes ({wallRecommendations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallRecommendations.map((texture, index) => (
              <TextureCard
                key={`wall-${index}`}
                texture={texture}
                type="wall"
                onApply={handleApplyTexture}
                isApplying={applyingTexture}
              />
            ))}
          </div>
          {wallRecommendations.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No se encontraron recomendaciones para paredes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recomendaciones de pisos */}
      <Card>
        <CardHeader>
          <CardTitle>Pisos ({floorRecommendations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {floorRecommendations.map((texture, index) => (
              <TextureCard
                key={`floor-${index}`}
                texture={texture}
                type="floor"
                onApply={handleApplyTexture}
                isApplying={applyingTexture}
              />
            ))}
          </div>
          {floorRecommendations.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No se encontraron recomendaciones para pisos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Consideraciones de iluminación */}
      {analysis?.lightingConsiderations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Consideraciones de Iluminación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {analysis.lightingConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {consideration}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
