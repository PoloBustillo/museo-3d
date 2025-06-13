"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AuthModal({ open, onClose, mode = "login" }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [localMode, setLocalMode] = useState(mode);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("Funcionalidad de autenticación próximamente...");
  };

  const handleClose = () => {
    setLocalMode("login");
    onClose(null); // Siempre cierra el modal
  };

  const handleSwitchMode = (newMode) => {
    setLocalMode(newMode);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2.5em 2em", minWidth: 340, boxShadow: "0 4px 32px #0004", position: 'relative' }}>
        <button onClick={handleClose} style={{ position: 'absolute', top: 12, right: 16, fontSize: 26, background: 'none', border: 'none', color: '#222', cursor: 'pointer' }}>×</button>
        <h2 style={{ color: '#1a237e', marginBottom: 18, textAlign: 'center' }}>{localMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ fontWeight: 'bold', color: '#222' }}>
            Correo electrónico
            <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', marginTop: 4 }} />
          </label>
          <label style={{ fontWeight: 'bold', color: '#222' }}>
            Contraseña
            <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', marginTop: 4 }} />
          </label>
          {error && <div style={{ color: '#c62828', fontSize: 15, marginTop: 4 }}>{error}</div>}
          <button type="submit" style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, background: '#222', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px #0002', marginTop: 8 }}>{localMode === "login" ? "Entrar" : "Crear cuenta"}</button>
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
              <a href="#" onClick={e => { e.preventDefault(); handleSwitchMode('register'); }} style={{ color: '#3949ab', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', background:'#fff', padding:'2px 8px', borderRadius:4 }}>Crear una</a>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <a href="#" onClick={e => { e.preventDefault(); handleSwitchMode('login'); }} style={{ color: '#3949ab', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer', background:'#fff', padding:'2px 8px', borderRadius:4 }}>Iniciar sesión</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
