/**
 * Página de prueba para las recomendaciones de texturas
 * Ruta: /test/texturas-recomendadas
 */
"use client";

import { useState } from "react";
import { TextureRecommendations } from "@/components/TextureRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TextureRecommendationsTestPage() {
  const [salaId, setSalaId] = useState(6); // Sala por defecto
  const [currentSalaId, setCurrentSalaId] = useState(6);

  const handleLoadRecommendations = () => {
    setCurrentSalaId(salaId);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recomendaciones de Texturas</h1>
        <p className="text-gray-600">
          Sistema inteligente de recomendación de texturas basado en las
          características de la sala
        </p>
      </div>

      {/* Control de sala */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Sala</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="salaId">ID de la Sala</Label>
              <Input
                id="salaId"
                type="number"
                value={salaId}
                onChange={(e) => setSalaId(parseInt(e.target.value) || 1)}
                placeholder="Ingresa el ID de la sala"
                min="1"
              />
            </div>
            <Button onClick={handleLoadRecommendations}>
              Cargar Recomendaciones
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Prueba con diferentes IDs de sala para ver las recomendaciones
            personalizadas
          </p>
        </CardContent>
      </Card>

      {/* Componente principal */}
      <TextureRecommendations salaId={currentSalaId} />

      {/* Información del sistema */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Cómo Funciona el Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Análisis de Sala:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>
                • <strong>Tema:</strong> Determina el estilo general (moderno,
                clásico, industrial, rústico)
              </li>
              <li>
                • <strong>Color:</strong> Analiza la paleta para sugerir
                texturas complementarias
              </li>
              <li>
                • <strong>Iluminación:</strong> Considera la configuración de
                luces para optimizar texturas
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Sistema de Puntuación:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>
                • <strong>Categoría:</strong> +50 pts por categoría correcta
                (wall/floor)
              </li>
              <li>
                • <strong>Tema:</strong> +30 pts por coincidencia con palabras
                clave del tema
              </li>
              <li>
                • <strong>Color:</strong> +20 pts por complementar el estilo de
                color
              </li>
              <li>
                • <strong>PBR:</strong> +25 pts por texturas PBR completas
              </li>
              <li>
                • <strong>Calidad:</strong> +10-20 pts por resolución (1K, 2K,
                4K)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">API Endpoints:</h4>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              <div className="mb-2">
                <strong>GET</strong> /api/texturas-recomendadas?salaId=6
              </div>
              <div className="mb-2">
                <strong>GET</strong>{" "}
                /api/texturas-recomendadas?salaId=6&type=wall
              </div>
              <div>
                <strong>POST</strong> /api/texturas-recomendadas
                <br />
                <span className="text-gray-500">
                  Body: {"{ salaId, texturaPared, texturaPiso }"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
