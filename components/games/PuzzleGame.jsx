import React, { useState, useEffect, useRef } from "react";
import { X, RotateCcw, Trophy, Timer, Shuffle } from "lucide-react";

/**
 * Juego de Rompecabezas con obras de arte
 */
export function PuzzleGame({ isOpen, onClose }) {
  const [pieces, setPieces] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef(null);

  const GRID_SIZE = 4; // 4x4 puzzle
  const PIECE_SIZE = 100;

  // Obras de arte disponibles
  const artworks = [
    {
      id: 1,
      name: "La Gioconda",
      artist: "Leonardo da Vinci",
      colors: ["#8B4513", "#DEB887", "#F5DEB3", "#D2691E", "#A0522D"],
      emoji: "🖼️",
    },
    {
      id: 2,
      name: "La Noche Estrellada",
      artist: "Vincent van Gogh",
      colors: ["#191970", "#4169E1", "#FFD700", "#FFFF00", "#1E90FF"],
      emoji: "🌟",
    },
    {
      id: 3,
      name: "Guernica",
      artist: "Pablo Picasso",
      colors: ["#000000", "#FFFFFF", "#808080", "#696969", "#2F4F4F"],
      emoji: "🕊️",
    },
  ];

  const [currentArtwork, setCurrentArtwork] = useState(artworks[0]);

  // Timer del juego
  useEffect(() => {
    let interval;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  // Generar imagen del rompecabezas
  const generatePuzzleImage = (artwork) => {
    const canvas = document.createElement("canvas");
    canvas.width = GRID_SIZE * PIECE_SIZE;
    canvas.height = GRID_SIZE * PIECE_SIZE;
    const ctx = canvas.getContext("2d");

    // Crear un patrón artístico basado en los colores de la obra
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = j * PIECE_SIZE;
        const y = i * PIECE_SIZE;

        // Gradiente basado en los colores de la obra
        const gradient = ctx.createRadialGradient(
          x + PIECE_SIZE / 2,
          y + PIECE_SIZE / 2,
          0,
          x + PIECE_SIZE / 2,
          y + PIECE_SIZE / 2,
          PIECE_SIZE / 2
        );

        const colorIndex = (i + j) % artwork.colors.length;
        gradient.addColorStop(0, artwork.colors[colorIndex]);
        gradient.addColorStop(
          1,
          artwork.colors[(colorIndex + 1) % artwork.colors.length]
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, PIECE_SIZE, PIECE_SIZE);

        // Agregar detalles artísticos
        ctx.fillStyle =
          artwork.colors[(colorIndex + 2) % artwork.colors.length];
        ctx.fillRect(x + 10, y + 10, PIECE_SIZE - 20, PIECE_SIZE - 20);

        // Agregar el emoji central si es la pieza del medio
        if (
          i === Math.floor(GRID_SIZE / 2) &&
          j === Math.floor(GRID_SIZE / 2)
        ) {
          ctx.font = "40px serif";
          ctx.textAlign = "center";
          ctx.fillText(
            artwork.emoji,
            x + PIECE_SIZE / 2,
            y + PIECE_SIZE / 2 + 15
          );
        }

        // Numeración para identificar las piezas
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        ctx.fillText(`${i * GRID_SIZE + j + 1}`, x + 5, y + 15);
      }
    }

    return canvas.toDataURL();
  };

  // Inicializar el juego
  const initializeGame = () => {
    const newSolution = [];
    const newPieces = [];

    // Crear la solución (orden correcto)
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newSolution.push(i);
    }

    // Crear las piezas mezcladas
    const shuffled = [...newSolution].sort(() => Math.random() - 0.5);

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newPieces.push({
        id: shuffled[i],
        currentPosition: i,
        correctPosition: shuffled[i],
        isCorrect: shuffled[i] === i,
      });
    }

    setPieces(newPieces);
    setSolution(newSolution);
    setSelectedPiece(null);
    setGameWon(false);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
  };

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    }
  }, [isOpen, currentArtwork]);

  // Verificar si el puzzle está resuelto
  useEffect(() => {
    if (pieces.length > 0) {
      const isComplete = pieces.every((piece, index) => piece.id === index);
      if (isComplete && gameStarted && !gameWon) {
        setGameWon(true);
      }
    }
  }, [pieces, gameStarted, gameWon]);

  const handlePieceClick = (clickedIndex) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (selectedPiece === null) {
      setSelectedPiece(clickedIndex);
    } else if (selectedPiece === clickedIndex) {
      setSelectedPiece(null);
    } else {
      // Intercambiar piezas
      const newPieces = [...pieces];
      const temp = newPieces[selectedPiece];
      newPieces[selectedPiece] = newPieces[clickedIndex];
      newPieces[clickedIndex] = temp;

      // Actualizar posiciones
      newPieces[selectedPiece].currentPosition = selectedPiece;
      newPieces[clickedIndex].currentPosition = clickedIndex;

      setPieces(newPieces);
      setSelectedPiece(null);
      setMoves(moves + 1);
    }
  };

  const shufflePieces = () => {
    const shuffled = [...pieces].sort(() => Math.random() - 0.5);
    const newPieces = shuffled.map((piece, index) => ({
      ...piece,
      currentPosition: index,
    }));
    setPieces(newPieces);
    setMoves(moves + 1);
  };

  const getPieceStyle = (piece, index) => {
    const row = Math.floor(piece.id / GRID_SIZE);
    const col = piece.id % GRID_SIZE;

    return {
      backgroundImage: `url(${generatePuzzleImage(currentArtwork)})`,
      backgroundPosition: `-${col * PIECE_SIZE}px -${row * PIECE_SIZE}px`,
      backgroundSize: `${GRID_SIZE * PIECE_SIZE}px ${GRID_SIZE * PIECE_SIZE}px`,
      border:
        selectedPiece === index ? "3px solid #3B82F6" : "2px solid #E5E7EB",
      opacity: piece.id === index ? 1 : 0.8,
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🧩 Rompecabezas de Arte
            </h2>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {formatTime(time)}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {moves} movimientos
                </div>
              </div>

              {/* Controls */}
              <button
                onClick={shufflePieces}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Mezclar"
                disabled={gameWon}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={initializeGame}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Reiniciar"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {gameWon ? (
            /* Victory Screen */
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                ¡Rompecabezas Completado!
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6 max-w-md mx-auto">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {currentArtwork.name}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mb-4">
                  por {currentArtwork.artist}
                </div>
                <div className="text-sm text-gray-500">
                  Tiempo: {formatTime(time)} | Movimientos: {moves}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    const nextIndex =
                      (artworks.indexOf(currentArtwork) + 1) % artworks.length;
                    setCurrentArtwork(artworks[nextIndex]);
                    initializeGame();
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Siguiente Obra
                </button>

                <button
                  onClick={initializeGame}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Jugar de Nuevo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-8 justify-center">
              {/* Puzzle Board */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                  {currentArtwork.name} - {currentArtwork.artist}
                </h3>

                <div
                  className="grid gap-1 mx-auto bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: `${GRID_SIZE * PIECE_SIZE + 8}px`,
                  }}
                >
                  {pieces.map((piece, index) => (
                    <div
                      key={index}
                      className={`
                        cursor-pointer transition-all duration-200 hover:scale-105
                        ${selectedPiece === index ? "scale-105 shadow-lg" : ""}
                        ${piece.id === index ? "ring-2 ring-green-400" : ""}
                      `}
                      style={{
                        width: `${PIECE_SIZE}px`,
                        height: `${PIECE_SIZE}px`,
                        ...getPieceStyle(piece, index),
                      }}
                      onClick={() => handlePieceClick(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Reference Image */}
              <div className="flex flex-col items-center">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Referencia
                </h4>

                <div
                  className="border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                  style={{
                    width: `${GRID_SIZE * 60}px`,
                    height: `${GRID_SIZE * 60}px`,
                    backgroundImage: `url(${generatePuzzleImage(currentArtwork)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selecciona una obra:
                  </div>
                  <div className="flex gap-2">
                    {artworks.map((artwork) => (
                      <button
                        key={artwork.id}
                        onClick={() => {
                          setCurrentArtwork(artwork);
                          initializeGame();
                        }}
                        className={`
                          px-3 py-1 rounded text-sm transition-colors
                          ${
                            currentArtwork.id === artwork.id
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500"
                          }
                        `}
                      >
                        {artwork.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!gameWon && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {selectedPiece !== null
                ? "Haz clic en otra pieza para intercambiar posiciones"
                : "Haz clic en una pieza para seleccionarla y luego en otra para intercambiarlas"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
