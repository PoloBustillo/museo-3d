import Link from "next/link";
import GalleryRoom from "./components/GalleryRoom";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: 32,
          color: "#222",
        }}
      >
        Bienvenido al Museo Virtual 3D
      </h1>
      <nav style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Link href="/museo">
          <button
            style={{
              padding: "1em 2.5em",
              fontSize: "1.3em",
              borderRadius: 10,
              background: "#222",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 12px #0002",
            }}
          >
            Entrar al Museo 3D
          </button>
        </Link>
      </nav>
    </main>
  );
}
