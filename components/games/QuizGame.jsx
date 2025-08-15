import React, { useState, useEffect } from "react";
import { X, Check, ChevronRight, Trophy, Clock, RotateCcw } from "lucide-react";

/**
 * Quiz cultural sobre arte y museos
 */
export function QuizGame({ isOpen, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const questions = [
    {
      question: "¿Quién pintó 'La Gioconda'?",
      options: ["Leonardo da Vinci", "Michelangelo", "Rafael", "Donatello"],
      correct: 0,
      explanation: "Leonardo da Vinci pintó la Mona Lisa entre 1503 y 1519.",
    },
    {
      question: "¿En qué museo se encuentra 'La Noche Estrellada'?",
      options: ["Louvre", "MoMA", "Met Museum", "Prado"],
      correct: 1,
      explanation:
        "La Noche Estrellada de Van Gogh se exhibe en el Museum of Modern Art (MoMA) de Nueva York.",
    },
    {
      question: "¿Qué período artístico caracterizó a Pablo Picasso?",
      options: ["Impresionismo", "Cubismo", "Surrealismo", "Barroco"],
      correct: 1,
      explanation:
        "Picasso fue uno de los fundadores del movimiento cubista junto con Georges Braque.",
    },
    {
      question: "¿Cuál es la técnica de pintura al fresco?",
      options: [
        "Pintar sobre lienzo",
        "Pintar sobre yeso húmedo",
        "Pintar con acuarelas",
        "Pintar con óleos",
      ],
      correct: 1,
      explanation:
        "El fresco es una técnica que consiste en pintar sobre yeso húmedo, lo que permite que los pigmentos se integren con la pared.",
    },
    {
      question: "¿Quién esculpió 'El David'?",
      options: ["Donatello", "Bernini", "Michelangelo", "Rodin"],
      correct: 2,
      explanation:
        "Michelangelo esculpió el famoso David entre 1501 y 1504, que se encuentra en Florencia.",
    },
    {
      question: "¿Qué movimiento artístico surgió en Francia en el siglo XIX?",
      options: [
        "Renacimiento",
        "Impresionismo",
        "Romanticismo",
        "Neoclasicismo",
      ],
      correct: 1,
      explanation:
        "El Impresionismo surgió en Francia en la segunda mitad del siglo XIX, con artistas como Monet y Renoir.",
    },
    {
      question: "¿Dónde se encuentra el Museo del Prado?",
      options: ["Barcelona", "Madrid", "Sevilla", "Valencia"],
      correct: 1,
      explanation:
        "El Museo del Prado se encuentra en Madrid, España, y es uno de los museos más importantes del mundo.",
    },
    {
      question: "¿Qué técnica usaba Jackson Pollock?",
      options: ["Puntillismo", "Dripping", "Sfumato", "Chiaroscuro"],
      correct: 1,
      explanation:
        "Jackson Pollock desarrolló la técnica del 'dripping', salpicando y goteando pintura sobre el lienzo.",
    },
  ];

  // Timer
  useEffect(() => {
    if (!isOpen || gameFinished || showResult) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleNextQuestion();
    }
  }, [timeLeft, isOpen, gameFinished, showResult]);

  // Reiniciar timer cuando cambia la pregunta
  useEffect(() => {
    if (!showResult && !gameFinished) {
      setTimeLeft(30);
    }
  }, [currentQuestion, showResult, gameFinished]);

  const initializeGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameFinished(false);
    setTimeLeft(30);
  };

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    }
  }, [isOpen]);

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameFinished(true);
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "¡Excelente! Eres un experto en arte 🎨";
    if (percentage >= 60) return "¡Muy bien! Tienes buenos conocimientos 👍";
    if (percentage >= 40) return "No está mal, pero puedes mejorar 📚";
    return "Necesitas estudiar más sobre arte 🤓";
  };

  const getOptionClassName = (optionIndex) => {
    if (!showResult) {
      return selectedAnswer === optionIndex
        ? "bg-blue-500 text-white"
        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600";
    }

    if (optionIndex === questions[currentQuestion].correct) {
      return "bg-green-500 text-white";
    }

    if (
      optionIndex === selectedAnswer &&
      selectedAnswer !== questions[currentQuestion].correct
    ) {
      return "bg-red-500 text-white";
    }

    return "bg-gray-100 dark:bg-gray-700 opacity-50";
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
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🧠 Quiz Cultural
            </h2>

            <div className="flex items-center gap-4">
              {!gameFinished && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeLeft}s
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {score}/{questions.length}
                  </div>
                </div>
              )}

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

          {!gameFinished && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm opacity-90 mb-2">
                <span>
                  Pregunta {currentQuestion + 1} de {questions.length}
                </span>
                <span>
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}
                  %
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {gameFinished ? (
            /* Results Screen */
            <div className="text-center">
              <div className="text-6xl mb-6">
                {score >= questions.length * 0.8
                  ? "🏆"
                  : score >= questions.length * 0.6
                    ? "🎉"
                    : "📚"}
              </div>

              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                ¡Quiz Completado!
              </h3>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {Math.round((score / questions.length) * 100)}% de respuestas
                  correctas
                </div>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {getScoreMessage()}
              </p>

              <button
                onClick={initializeGame}
                className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Jugar de Nuevo
              </button>
            </div>
          ) : (
            /* Question Screen */
            <div>
              {/* Timer Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg
                    className="w-16 h-16 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray={`${(timeLeft / 30) * 100}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-600">
                      {timeLeft}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question */}
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8 text-center">
                {questions[currentQuestion].question}
              </h3>

              {/* Options */}
              <div className="grid gap-4 mb-8">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`
                      p-4 rounded-lg text-left transition-all duration-300 border-2 border-transparent
                      ${getOptionClassName(index)}
                      ${!showResult ? "hover:scale-105 cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showResult &&
                        index === questions[currentQuestion].correct && (
                          <Check className="w-6 h-6" />
                        )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Explicación:</strong>{" "}
                    {questions[currentQuestion].explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {showResult && (
                <div className="text-center">
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    {currentQuestion < questions.length - 1
                      ? "Siguiente Pregunta"
                      : "Ver Resultados"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
