"use client";
import React from 'react';
// Reutilizamos la implementación 3D avanzada proveniente de sala-prueba pero ahora soportando ids dinámicos.
// Para minimizar duplicación, importamos el componente original y usamos el param id
import SalaPruebaPage from '../../sala-prueba/page';
import { useParams } from 'next/navigation';

export default function SalaMuseoIdPage(){
  const params = useParams();
  return <SalaPruebaPage salaId={params?.id} disallowMockOnMissing />;
}
