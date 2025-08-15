import React, { useState, useEffect } from "react";
import { X, Gamepad2, Brain, Trophy, Play } from "lucide-react";

/**
 * Modal de juegos interactivos para la mesa
 */
export function GameModal({ isOpen, onClose, onGameSelect }) {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: "memorama",
      title: "Memorama de Arte",
      description: "Encuentra las parejas de obras de arte famosas",
      icon: Brain,
      difficulty: "Fácil",
      color: "#4caf50",
    },
    {
      id: "quiz",
      title: "Quiz Cultural",
      description: "Preguntas sobre historia del arte y museos",
      icon: Trophy,
      difficulty: "Medio",
      color: "#ff9800",
    },
    {
      id: "puzzle",
      title: "Rompecabezas",
      description: "Arma obras de arte pieza por pieza",
      icon: Gamepad2,
      difficulty: "Difícil",
      color: "#f44336",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSelectedGame(null);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleGameStart = (gameId) => {
    if (onGameSelect) {
      onGameSelect(gameId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Gamepad2 className="w-8 h-8" />
              Centro de Juegos
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-blue-100">
            Explora y aprende con nuestros juegos educativos
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedGame ? (
            /* Game Selection */
            <div className="grid md:grid-cols-3 gap-6">
              {games.map((game) => {
                const IconComponent = game.icon;
                return (
                  <div
                    key={game.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-2 hover:border-gray-300 dark:hover:border-gray-500">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${game.color}20` }}
                        >
                          <IconComponent
                            className="w-8 h-8"
                            style={{ color: game.color }}
                          />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          {game.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {game.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${game.color}20`,
                              color: game.color,
                            }}
                          >
                            {game.difficulty}
                          </span>

                          <Play className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Game Details */
            <div className="text-center">
              <div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: `${selectedGame.color}20` }}
              >
                <selectedGame.icon
                  className="w-12 h-12"
                  style={{ color: selectedGame.color }}
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {selectedGame.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                {selectedGame.description}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Atrás
                </button>

                <button
                  onClick={() => handleGameStart(selectedGame.id)}
                  className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  style={{ backgroundColor: selectedGame.color }}
                >
                  <Play className="w-5 h-5" />
                  Jugar Ahora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Disfruta aprendiendo sobre arte y cultura de forma interactiva
          </p>
        </div>
      </div>
    </div>
  );
}
