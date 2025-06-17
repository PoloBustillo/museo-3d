"use client";
import Unauthorized from "../../components/Unauthorized";

export default function Forbidden403() {
  return (
    <Unauthorized
      title="Acceso prohibido"
      message="Tu cuenta no tiene los permisos necesarios para acceder a esta área privada"
      error="403"
      showLogin={false}
      redirectPath="/"
    />
  );
}
