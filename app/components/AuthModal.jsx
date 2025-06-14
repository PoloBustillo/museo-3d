"use client";
import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Dialog, DialogTitle, DialogClose } from "../../components/ui/dialog";

export default function AuthModal({ open, onClose, mode = "login" }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const [modeKey, setModeKey] = useState(mode);
  const modalRef = useRef();
  const firstOpen = useRef(true);

  useEffect(() => {
    setLocalMode(mode);
    setModeKey(mode + Date.now()); // fuerza cambio de clave para animación
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Detectar si es la primera vez que se abre el modal
  useEffect(() => {
    if (open && firstOpen.current) {
      firstOpen.current = false;
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setLocalMode("login");
    setForm({ email: "", password: "", name: "" });
    setError("");
    setLoading(false);
    onClose(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          headers: {
            "Content-Type": "application/json",
          },
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

        // Registro exitoso, ahora hacer login automáticamente
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Cuenta creada, pero error al iniciar sesión. Intenta hacer login.");
        } else {
          // Éxito
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
          // Éxito
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
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogClose onClick={handleClose} />
      <DialogTitle>{localMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</DialogTitle>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {localMode === "register" && (
          <label style={{ fontWeight: 'bold', color: '#222' }}>
            Nombre completo
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', marginTop: 4 }} 
            />
          </label>
        )}
        <label style={{ fontWeight: 'bold', color: '#222' }}>
          Correo electrónico
          <input 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', marginTop: 4 }} 
          />
        </label>
        <label style={{ fontWeight: 'bold', color: '#222' }}>
          Contraseña
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            required 
            minLength="6"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', marginTop: 4 }} 
          />
        </label>
        {error && <div style={{ color: '#c62828', fontSize: 15, marginTop: 4 }}>{error}</div>}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '0.7em 2em', 
            fontSize: '1.1em', 
            borderRadius: 8, 
            background: loading ? '#ccc' : '#222', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 'bold', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            boxShadow: '0 2px 8px #0002', 
            marginTop: 8 
          }}
        >
          {loading ? 'Procesando...' : (localMode === "login" ? "Entrar" : "Crear cuenta")}
        </button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '18px 0 8px 0' }}>
        <button type="button" onClick={() => signIn('google')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#fff', color: '#222', border: '1.5px solid #bbb', borderRadius: 8, fontWeight: 'bold', fontSize: 16,
          padding: '0.6em 0', cursor: 'pointer', boxShadow: '0 2px 8px #0001', width: '100%'}}>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" style={{width:22, height:22, marginRight:6}} />
          Iniciar sesión con Google
        </button>
        <button type="button" onClick={() => signIn('microsoft')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#fff', color: '#222', border: '1.5px solid #bbb', borderRadius: 8, fontWeight: 'bold', fontSize: 16,
          padding: '0.6em 0', cursor: 'pointer', boxShadow: '0 2px 8px #0001', width: '100%'}}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" style={{width:22, height:22, marginRight:6, background:'#fff', borderRadius:3}} />
          Iniciar sesión con Microsoft
        </button>
      </div>
      <div style={{ marginTop: 18, textAlign: 'center', fontSize: 15, background:'#f5f5fa', borderRadius:8, padding:'0.7em 0', color:'#222', fontWeight:500 }}>
        {localMode === "login" ? (
          <>
            ¿No tienes cuenta?{' '}
            <a href="#" onClick={e => { 
              e.preventDefault(); 
              setLocalMode('register');
              setError("");
            }} style={{ color: '#3949ab', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', background:'#fff', padding:'2px 8px', borderRadius:4 }}>Crear una</a>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{' '}
            <a href="#" onClick={e => { 
              e.preventDefault(); 
              setLocalMode('login');
              setError("");
            }} style={{ color: '#3949ab', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', background:'#fff', padding:'2px 8px', borderRadius:4 }}>Iniciar sesión</a>
          </>
        )}
      </div>
    </Dialog>
  );
}
