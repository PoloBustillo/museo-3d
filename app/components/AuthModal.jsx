"use client";
import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AuthModal({ open, onClose, mode = "login" }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const modalRef = useRef();

  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setLocalMode("login");
        setForm({ email: "", password: "", name: "" });
        setError("");
        setLoading(false);
        setShowPassword(false);
        onClose(null);
      }
    };
    
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Limpiar el estado del modal
    setLocalMode("login");
    setForm({ email: "", password: "", name: "" });
    setError("");
    setLoading(false);
    setShowPassword(false);
    
    // Cerrar el modal
    if (onClose) {
      onClose(null);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Por favor, completa todos los campos");
      setLoading(false);
      return;
    }

    if (localMode === "register" && !form.name) {
      setError("Por favor, ingresa tu nombre");
      setLoading(false);
      return;
    }

    try {
      if (localMode === "register") {
        // Registro de usuario
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Error al crear la cuenta");
          setLoading(false);
          return;
        }

        // Registro exitoso, hacer login automáticamente
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Cuenta creada, pero error al iniciar sesión. Intenta hacer login.");
        } else {
          onClose("success");
        }
      } else {
        // Login de usuario
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Credenciales incorrectas");
        } else {
          onClose("success");
        }
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={handleClose}
                type="button"
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer z-10"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {localMode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {localMode === "login" 
                    ? "Inicia sesión para continuar" 
                    : "Únete para explorar el museo virtual"
                  }
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre (solo registro) */}
                {localMode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading 
                    ? "Procesando..." 
                    : (localMode === "login" ? "Iniciar sesión" : "Crear cuenta")
                  }
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                <span className="px-4 text-sm text-gray-500 dark:text-gray-400">o</span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={() => signIn('google')}
                className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Google" 
                  className="w-5 h-5" 
                />
                Continuar con Google
              </button>

              {/* Toggle Mode */}
              <div className="mt-6 text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {localMode === "login" ? (
                    <>
                      ¿No tienes cuenta?{' '}
                      <button
                        onClick={() => {
                          setLocalMode('register');
                          setError("");
                        }}
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-all duration-200 cursor-pointer"
                      >
                        Crear una gratis
                      </button>
                    </>
                  ) : (
                    <>
                      ¿Ya tienes cuenta?{' '}
                      <button
                        onClick={() => {
                          setLocalMode('login');
                          setError("");
                        }}
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-all duration-200 cursor-pointer"
                      >
                        Iniciar sesión
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
