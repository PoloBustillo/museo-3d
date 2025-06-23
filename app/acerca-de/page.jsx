import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import GraffitiBackground from "./GraffitiBackground";
import React from "react";

const equipo = [
  {
    nombre: "Mario Leopoldo Bustillo Eguiluz",
    rol: "Experto en tecnologías digitales",
    img: "/images/Equipo_5.webp",
    color: "bg-gradient-to-br from-blue-400 to-purple-500",
  },
  {
    nombre: "Ángel Hernández Gonzalez",
    rol: "Área de gestión y modelado de base datos",
    img: "/images/Equipo_4.webp",
    color: "bg-gradient-to-br from-green-400 to-teal-500",
  },
  {
    nombre: "Dayron Jesus Salazar Alfaro",
    rol: "Área de gestión y modelado de base datos",
    img: "/images/Equipo_2.webp",
    color: "bg-gradient-to-br from-orange-400 to-red-500",
  },
  {
    nombre: "Andrei Carro Flores",
    rol: "Front-end / Diseñador UI/UX",
    img: "/images/Equipo_2.webp",
    color: "bg-gradient-to-br from-pink-400 to-rose-500",
  },
  {
    nombre: "Angel Kenai Sanchez Rojas",
    rol: "Front-end / Diseñador UI/UX",
    img: "/images/Equipo_4.webp",
    color: "bg-gradient-to-br from-indigo-400 to-blue-500",
  },
  {
    nombre: "Ixcheel Jasmin Huerta Ramos",
    rol: "Front-end",
    img: "/images/Equipo_3.webp",
    color: "bg-gradient-to-br from-emerald-400 to-green-500",
  },
  {
    nombre: "Dante Castelán Carpinteyro",
    rol: "DevOps",
    img: "/images/Equipo_1.webp",
    color: "bg-gradient-to-br from-violet-400 to-purple-500",
  },
];

function AnimatedBlobsBackground() {
  return (
    <>
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-orange-300/60 dark:bg-orange-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-pink-300/60 dark:bg-pink-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed" />
      <div
        className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-fuchsia-200/50 dark:bg-fuchsia-800/20 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe"
        style={{ transform: "translate(-50%,-50%) scale(1.2)" }}
      />
    </>
  );
}

function DotsPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden dark:block"
      width="100%"
      height="100%"
      style={{ opacity: 0.13 }}
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

export default function AcercaDe() {
  return (
    <div className="relative w-full flex flex-col items-center justify-start bg-transparent">
      {/* Fondo animado, patrón y graffiti sutil */}
      <div className="pointer-events-none absolute inset-0 w-full h-full z-0">
        <AnimatedBlobsBackground />
        <DotsPattern />
        <GraffitiBackground />
      </div>
      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-16 px-4 sm:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-6 font-playfair text-foreground">
            Acerca del Mural ARPA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-normal animate-fade-in font-inter">
            Una iniciativa cultural que busca preservar y difundir el arte mural
            mexicano a través de la tecnología y la experiencia digital.
          </p>
        </section>

        {/* Historia Section - Collage mejorado */}
        <section className="grid md:grid-cols-2 gap-12 items-center animate-fade-in-up delay-100">
          <div>
            <h2 className="text-3xl font-bold mb-6 font-playfair text-foreground">
              Nuestra Historia
            </h2>
            <div className="space-y-4 text-muted-foreground font-normal font-inter text-lg leading-relaxed">
              <p>
                El Mural ARPA nació como parte de un esfuerzo colectivo por
                documentar y visibilizar las obras murales creadas por
                estudiantes de la Facultad de Artes de la BUAP, muchas de las
                cuales han sido desarrolladas en colaboración con eventos
                culturales y académicos como el Primer Hackatón BUAP. Este
                proyecto refleja la fusión entre tradición artística y
                vanguardia tecnológica, con el objetivo de preservar el legado
                del muralismo mexicano en la era digital.
              </p>
              <p>
                Nuestro proyecto combina la tradición del muralismo mexicano con
                las tecnologías más avanzadas para crear experiencias inmersivas
                que conectan a las personas con el arte.
              </p>
            </div>
          </div>
          <div className="relative w-full h-80 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <img
                src="/assets/banner68.webp"
                alt="Banner"
                className="w-full h-48 object-cover rounded-2xl shadow-2xl animate-float"
              />
              <img
                src="/assets/bansky.webp"
                alt="Bansky"
                className="w-full h-48 object-cover rounded-2xl shadow-2xl animate-float-delayed mt-8"
              />
              <img
                src="/assets/bansky1.webp"
                alt="Bansky 1"
                className="w-full h-48 object-cover rounded-2xl shadow-2xl animate-float mt-4"
              />
              <img
                src="/assets/bansky2.webp"
                alt="Bansky 2"
                className="w-full h-48 object-cover rounded-2xl shadow-2xl animate-float-delayed"
              />
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="grid md:grid-cols-2 gap-12 animate-fade-in-up delay-200">
          <div>
            <h2 className="text-2xl font-bold mb-4 font-playfair text-foreground">
              Nuestra Misión
            </h2>
            <p className="text-muted-foreground font-normal font-inter text-lg leading-relaxed">
              Preservar, documentar y difundir el arte mural mexicano a través
              de tecnologías digitales innovadoras, haciendo accesible este
              patrimonio cultural a audiencias globales. Buscamos convertirnos
              en un puente entre el arte tradicional y las nuevas formas de
              interacción digital, garantizando que las obras murales realizadas
              por artistas emergentes tengan vida propia más allá de las paredes
              donde fueron creadas.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 font-playfair text-foreground">
              Nuestra Visión
            </h2>
            <p className="text-muted-foreground font-normal font-inter text-lg leading-relaxed">
              Ser la plataforma líder mundial en la preservación y experiencia
              digital del arte mural, conectando artistas, historiadores y
              amantes del arte en una comunidad global comprometida con la
              memoria cultural y la innovación artística.
            </p>
          </div>
        </section>

        {/* Apoyo */}
        <section className="text-center animate-fade-in-up delay-300">
          <h2 className="text-3xl font-bold mb-8 font-playfair text-foreground">
            Con apoyo de:
          </h2>
          <div className="flex justify-center">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage
                  src="/images/Arpa.webp"
                  alt="Escuela de Artes Plásticas y Audiovisuales (BUAP)"
                  className="object-cover"
                />
                <AvatarFallback>ARPA</AvatarFallback>
              </Avatar>
              <h4 className="font-semibold text-foreground text-lg">
                Escuela de Artes Plásticas y Audiovisuales (BUAP)
              </h4>
            </div>
          </div>
        </section>

        {/* Equipo en grid de 4 columnas */}
        <section className="animate-fade-in-up delay-400">
          <h2 className="text-3xl font-bold text-center mb-12 font-playfair text-foreground">
            Nuestro Equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {equipo.map((persona, i) => (
              <article key={i} className="text-center group">
                <div
                  className={`w-32 h-32 mx-auto mb-4 rounded-full ${persona.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105`}
                >
                  <Avatar className="w-28 h-28 border-4 border-white">
                    <AvatarImage
                      src={persona.img}
                      alt={persona.nombre}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-white font-bold">
                      {persona.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-bold text-xl font-playfair text-foreground mb-2">
                  {persona.nombre}
                </h3>
                <p className="text-sm text-primary/80 dark:text-primary/60 font-inter leading-relaxed">
                  {persona.rol}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action con banner */}
        <section className="relative overflow-hidden rounded-3xl animate-fade-in-up delay-500">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-[url('/assets/banner68.webp')] bg-cover bg-center opacity-10" />
          <div className="relative z-10 text-center py-16 px-8">
            <h2 className="text-3xl font-bold mb-6 font-playfair text-foreground">
              Únete a Nuestra Misión
            </h2>
            <p className="text-xl mb-8 text-muted-foreground font-inter max-w-2xl mx-auto">
              Ayúdanos a preservar el patrimonio cultural mexicano para las
              futuras generaciones.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                asChild
                variant="default"
                className="px-6 py-3 rounded-lg font-semibold text-lg bg-black text-white shadow-lg hover:bg-neutral-800 focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                <a href="/museo">Explorar Museo</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-6 py-3 rounded-lg font-semibold text-lg border-primary text-primary hover:bg-primary/10 dark:border-white dark:text-white dark:hover:bg-white/10"
              >
                <a href="/crear-sala">Contribuir</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
