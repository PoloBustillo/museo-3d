import React, { useRef } from "react";
import { useGLBValidation } from "@/hooks/useGLBValidation";

export default function GLBValidator() {
  const { result, diagnosis, loading, validate } = useGLBValidation();
  const fileInputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await validate(file);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl font-bold mb-4">Validador de modelos GLB</h2>
      <input
        type="file"
        accept=".glb"
        ref={fileInputRef}
        onChange={handleFile}
        className="mb-4"
      />
      {loading && <p className="text-blue-600">Validando modelo...</p>}
      {result && (
        <div className="mb-4">
          {result.isValid ? (
            <p className="text-green-600 font-semibold">✅ Modelo GLB válido</p>
          ) : (
            <p className="text-red-600 font-semibold">
              ❌ Modelo inválido: {result.error}
            </p>
          )}
          {result.info && (
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              <div>Versión: {result.info.version}</div>
              <div>Tamaño: {(result.info.size / 1024).toFixed(2)} KB</div>
              <div>Tipo: {result.info.type}</div>
            </div>
          )}
        </div>
      )}
      {diagnosis && (
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Diagnóstico:</h3>
          <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
            {diagnosis.diagnosis.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
          {diagnosis.recommendations.length > 0 && (
            <>
              <h4 className="font-semibold mt-2">Recomendaciones:</h4>
              <ul className="list-disc ml-6 text-blue-700 dark:text-blue-300">
                {diagnosis.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {/* Previsualización si es válido y soportado */}
      {result &&
        result.isValid &&
        fileInputRef.current &&
        fileInputRef.current.files[0] && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Previsualización:</h4>
            {typeof window !== "undefined" &&
            window.customElements &&
            window.customElements.get("model-viewer") ? (
              <model-viewer
                src={URL.createObjectURL(fileInputRef.current.files[0])}
                alt="Modelo GLB"
                camera-controls
                style={{ width: "100%", height: "400px", background: "#222" }}
                exposure="1.0"
                shadow-intensity="1"
                auto-rotate
              />
            ) : (
              <p className="text-gray-500">
                Previsualización 3D no soportada en este navegador.
              </p>
            )}
          </div>
        )}
    </div>
  );
}
