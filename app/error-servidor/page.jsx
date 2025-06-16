"use client";
import ErrorPage from "../components/ErrorPage";

export default function ServerError500() {
  return (
    <ErrorPage
      title="Error del servidor"
      message="Nuestros servidores están experimentando problemas técnicos"
      error="500"
      type="server"
      showRefresh={true}
      showHome={true}
    />
  );
}
