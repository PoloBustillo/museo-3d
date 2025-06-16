"use client";
import ErrorPage from "../components/ErrorPage";

export default function NetworkError() {
  return (
    <ErrorPage
      title="Sin conexión"
      message="No se puede conectar con el servidor del museo"
      error="⚡"
      type="network"
      showRefresh={true}
      showHome={false}
    />
  );
}
