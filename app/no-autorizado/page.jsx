"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Unauthorized from "../../components/Unauthorized";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const getMessage = () => {
    if (callbackUrl) {
      const pageName = getPageName(callbackUrl);
      return `Necesitas iniciar sesión para acceder a ${pageName}`;
    }
    return "Necesitas iniciar sesión para acceder a esta sección del museo";
  };

  const getPageName = (url) => {
    if (url.includes("/crear-sala")) return "Crear Sala";
    if (url.includes("/perfil")) return "tu Perfil";
    if (url.includes("/mis-obras")) return "Mis Obras";
    return "esta página";
  };

  return (
    <Unauthorized
      title="Acceso no autorizado"
      message={getMessage()}
      error="401"
      showLogin={true}
      redirectPath="/"
      callbackUrl={callbackUrl}
    />
  );
}

export default function Unauthorized401() {
  return (
    <Suspense
      fallback={
        <Unauthorized
          title="Acceso no autorizado"
          message="Necesitas iniciar sesión para acceder a esta sección del museo"
          error="401"
          showLogin={true}
          redirectPath="/"
        />
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
