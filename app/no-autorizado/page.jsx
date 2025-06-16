"use client";
import { useSearchParams } from "next/navigation";
import Unauthorized from "../components/Unauthorized";

export default function Unauthorized401() {
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
    if (url.includes("/mis-documentos")) return "Mis Documentos";
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
