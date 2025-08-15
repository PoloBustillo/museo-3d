import React, { useState, useEffect, useMemo } from "react";
import { X, RotateCcw, Trophy, Timer } from "lucide-react";

/**
 * Juego de Memorama con obras de arte
 */
export function MemoramaGame({ isOpen, onClose }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Obras de arte para el memorama
  const artworks = useMemo(
    () => [
      { id: 1, name: "La Gioconda", artist: "Leonardo da Vinci", image: "🖼️" },
      {
        id: 2,
        name: "La Noche Estrellada",
        artist: "Vincent van Gogh",
        image: "🌟",
      },
      { id: 3, name: "El Grito", artist: "Edvard Munch", image: "😱" },
      {
        id: 4,
        name: "La Persistencia de la Memoria",
        artist: "Salvador Dalí",
        image: "⏰",
      },
      { id: 5, name: "Guernica", artist: "Pablo Picasso", image: "🕊️" },
      { id: 6, name: "La Gran Ola", artist: "Katsushika Hokusai", image: "🌊" },
      { id: 7, name: "Las Meninas", artist: "Diego Velázquez", image: "👑" },
      { id: 8, name: "El Beso", artist: "Gustav Klimt", image: "💋" },
    ],
    []
  );

  // Inicializar juego
  const initializeGame = () => {
    const gameCards = [...artworks, ...artworks].map((artwork, index) => ({
      ...artwork,
      uniqueId: index,
      isFlipped: false,
      isMatched: false,
    }));

    // Mezclar cartas
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
  };

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

  // Inicializar cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      initializeGame();
    }
  }, [isOpen]);

  // Verificar victoria
  useEffect(() => {
    if (matchedPairs.length === artworks.length && gameStarted) {
      setGameWon(true);
    }
  }, [matchedPairs, artworks.length, gameStarted]);

  const handleCardClick = (clickedCard) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCards.length === 2
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    // Actualizar el estado de la carta
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.uniqueId === clickedCard.uniqueId
          ? { ...card, isFlipped: true }
          : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves((prevMoves) => prevMoves + 1);

      setTimeout(() => {
        if (newFlippedCards[0].id === newFlippedCards[1].id) {
          // ¡Pareja encontrada!
          setMatchedPairs((prev) => [...prev, newFlippedCards[0].id]);
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === newFlippedCards[0].id
                ? { ...card, isMatched: true }
                : card
            )
          );
        } else {
          // No coinciden, voltear de nuevo
          setCards((prevCards) =>
            prevCards.map((card) =>
              newFlippedCards.some((fc) => fc.uniqueId === card.uniqueId)
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }
        setFlippedCards([]);
      }, 1500);
    }
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🧠 Memorama de Arte
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

        {/* Game Board */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {gameWon ? (
            /* Victory Screen */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                ¡Felicitaciones!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Completaste el memorama en {formatTime(time)} con {moves}{" "}
                movimientos
              </p>
              <button
                onClick={initializeGame}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Jugar de Nuevo
              </button>
            </div>
          ) : (
            /* Game Grid */
            <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
              {cards.map((card) => (
                <div
                  key={card.uniqueId}
                  className={`
                    aspect-square bg-gradient-to-br cursor-pointer rounded-xl shadow-lg
                    transform transition-all duration-500 hover:scale-105
                    ${
                      card.isFlipped || card.isMatched
                        ? "from-blue-400 to-purple-500 rotate-y-180"
                        : "from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500"
                    }
                    ${card.isMatched ? "ring-4 ring-green-400" : ""}
                  `}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    {card.isFlipped || card.isMatched ? (
                      <>
                        <div className="text-4xl mb-2">{card.image}</div>
                        <div className="text-center text-white">
                          <div className="text-sm font-semibold">
                            {card.name}
                          </div>
                          <div className="text-xs opacity-90">
                            {card.artist}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-white text-4xl">🎨</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        {!gameWon && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Parejas encontradas: {matchedPairs.length}/{artworks.length}
              </span>
              <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(matchedPairs.length / artworks.length) * 100}%`,
                  }}
                />
              </div>
              <span>
                {Math.round((matchedPairs.length / artworks.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
