"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import MainMenu from "./MainMenu";
import Footer from "./Footer";

import { ThemeProvider } from "./ui/theme-provider"

const FRASES_MURALISTAS = [
  "Pinto lo que veo, lo que pienso y lo que siento. - Diego Rivera",
  "El arte debe servir como arma en la lucha por la liberación. - Diego Rivera",
  "Mi pincel es mi arma y mi arte es mi revolución. - Diego Rivera",
  "La pintura debe gritar, debe ser una alarma. - José Clemente Orozco",
  "El arte supremo es el que educa y eleva el espíritu. - José Clemente Orozco",
  "Mi obra es mi biografía. - José Clemente Orozco",
  "No hay más ruta que la nuestra. - David Alfaro Siqueiros",
  "Arte para todos, no para unos cuantos. - David Alfaro Siqueiros",
  "El arte debe transformar la sociedad. - David Alfaro Siqueiros",
  "El muralismo es un arte para el pueblo. - Diego Rivera",
  "Cruzo cosas para que no las lean erróneamente. - Jean-Michel Basquiat",
  "El arte debe ser algo que libere tu alma. - Keith Haring",
  "El arte debe incomodar a los cómodos. - Banksy",
  "El arte puede cambiar el mundo. - Shepard Fairey",
  "Un pueblo sin arte es un pueblo sin historia. - José Vasconcelos",
  "El mural habla el lenguaje del pueblo. - Diego Rivera",
  "La belleza está en la lucha por la justicia. - Diego Rivera",
  "El arte verdadero nace del dolor del pueblo. - José Clemente Orozco",
  "El arte debe ser revolucionario o no ser nada. - David Alfaro Siqueiros",
  "Cada mural cuenta una historia. - Diego Rivera",
  "La pared es mi lienzo y la calle mi galería. - Banksy",
  "El arte urbano da voz a los sin voz. - Keith Haring",
  "Mis murales son mis manifiestos. - Diego Rivera",
  "El arte no reproduce lo visible, sino que hace visible. - Paul Klee",
  "La creatividad es contagiosa, pásala. - Albert Einstein",
  "El arte lava del alma el polvo de la vida cotidiana. - Pablo Picasso",
  "Todo niño es un artista. - Pablo Picasso",
  "El arte es la mentira que nos permite ver la verdad. - Pablo Picasso",
  "La inspiración existe, pero tiene que encontrarte trabajando. - Pablo Picasso",
  "El arte es una línea alrededor de tus pensamientos. - Gustav Klimt",
  "Cada pincelada es un latido de mi corazón. - Vincent van Gogh",
  "El arte es el único lenguaje serio del mundo. - Oscar Wilde",
  "Un artista sin opiniones es como un pincel sin pintura. - Anónimo",
  "El muro es la página en blanco del pueblo. - Anónimo",
  "Mi paleta son los colores de la revolución. - Diego Rivera",
  "Arte y revolución van de la mano. - Anónimo",
  "El muralismo mexicano es patrimonio de la humanidad. - UNESCO",
  "Las paredes hablan cuando los artistas las intervienen. - Anónimo",
  "El arte callejero es la democracia del arte. - Banksy",
  "Cada spray cuenta una historia urbana. - Anónimo",
  "El grafiti es el grito silencioso de la ciudad. - Anónimo",
  "Mi arte trasciende fronteras y barreras. - Keith Haring",
  "La creatividad no tiene límites ni muros. - Anónimo",
  "El arte debe provocar preguntas, no dar respuestas. - Anónimo",
  "Mis obras son ventanas al alma colectiva. - Diego Rivera",
  "El arte verdadero surge de la necesidad de expresar. - Anónimo",
  "La cultura es el alma de una nación. - Anónimo",
  "El arte une lo que la política divide. - Anónimo",
  "Cada color tiene su propia voz. - Wassily Kandinsky",
  "El arte es terapia para el alma herida. - Anónimo",
  "Mi mural es mi carta de amor al pueblo. - Diego Rivera",
  "El arte trasciende el tiempo y el espacio. - Anónimo",
  "La belleza salvará al mundo. - Fiódor Dostoyevski",
  "El arte es el espejo de la sociedad. - Anónimo",
  "Cada obra de arte es una ventana al infinito. - Anónimo",
  "El muralismo es poesía visual. - Anónimo",
  "Mi pincel danza al ritmo de mis emociones. - Anónimo",
  "El arte verdadero no imita, crea. - Anónimo",
  "La imaginación es más importante que el conocimiento. - Albert Einstein"
];
const FRASES_68 = [
    "El arte limpia del alma el polvo de la vida.",
    "El arte es la mentira que nos permite ver la verdad.",
    "Donde hay arte, hay esperanza.",
    "El arte dice lo que las palabras callan.",
    "El arte no reproduce lo visible, lo hace visible.",
    "Pintar es otra forma de llevar un diario.",
    "El arte es libertad en forma pura.",
    "Crear es resistir.",
    "El arte vive cuando provoca.",
    "El arte transforma el dolor en belleza."
];

export default function ClientLayout({ children }) {
  const [transitioning, setTransitioning] = useState(false);
  const [nextRoute, setNextRoute]         = useState(null);
  const [frase, setFrase]                 = useState(FRASES_MURALISTAS[0]);
  const prevFrase = useRef(FRASES_MURALISTAS[0]);

  const [footerVisible, setFooterVisible] = useState(false);
  const mainRef     = useRef(null);
  const sentinelRef = useRef(null);  
  const [hoveringBottom, setHoveringBottom] = useState(false);

  const router = useRouter();
  const BANKSY_IMAGES = [
    "/assets/bansky.png",
    "/assets/bansky1.png",
    "/assets/bansky2.png",
    "/assets/bansky3.png",
    "/assets/bansky4.png",
  ];
  const [banskyImg, setBanskyImg] = useState(BANKSY_IMAGES[0]);
  useEffect(() => {
    if (transitioning) {
      let nueva;
      do {
        nueva =
          FRASES_MURALISTAS[
            Math.floor(Math.random() * FRASES_MURALISTAS.length)
          ];
      } while (nueva === prevFrase.current && FRASES_MURALISTAS.length > 1);
      setFrase(nueva);
      prevFrase.current = nueva;
      setBanskyImg(
        BANKSY_IMAGES[Math.floor(Math.random() * BANKSY_IMAGES.length)]
      );
    }
  }, [transitioning]);

  const handleRouteTransition = (e, route) => {
    if (e) e.preventDefault();
    setTransitioning(true);
    setNextRoute(route);
    setTimeout(() => {
      router.push(route);
      setTransitioning(false);
      setNextRoute(null);
    }, 3200);
  };

  useEffect(() => {
    if (!mainRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { root: mainRef.current, threshold: 0.6 }
    );
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="sticky top-0 z-[60]">
        <MainMenu
          onSubirArchivo={(e) => handleRouteTransition(e, "/subir-archivo")}
          onNavigate={handleRouteTransition}
        />
      </header>

      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center"
          >
            <motion.img
              src={banskyImg}
              alt="Banksy pintando"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{
                maxWidth: 320,
                width: "40vw",
                height: "auto",
                marginBottom: "2.5rem",
                filter: "drop-shadow(0 8px 32px #0008) grayscale(.2) blur(.5px)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              style={{
                color: "#fff",
                fontSize: "2.2vw",
                fontWeight: 600,
                fontFamily:
                  "'DM Serif Display','Playfair Display','Georgia',serif",
                fontStyle: "italic",
                letterSpacing: "0.01em",
                textAlign: "center",
                width: "100vw",
                textShadow:
                  "0 2px 32px #fff3, 0 1px 0 #0008, 0 0 80px #fff1",
                mixBlendMode: "lighten",
                opacity: 0.97,
                lineHeight: 1.2,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {frase}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <main ref={mainRef} className="flex-1 overflow-hidden">
        {children}

<<<<<<< Updated upstream
      <div
       className="absolute bottom-0 left-0 w-full h-[64px]"
       onMouseEnter={() => setHoveringBottom(true)}
       onMouseLeave={() => setHoveringBottom(false)}
      />
      </main>
      <footer
      className={`fixed bottom-0 left-0 w-full z-[60] bg-black transition-all duration-500
      ${hoveringBottom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
=======
        <div
    className="absolute bottom-0 left-0 w-full h-[64px]"
    onMouseEnter={() => setHoveringBottom(true)}
    onMouseLeave={() => setHoveringBottom(false)}
  />

      </main>

      <footer
    className={`
    fixed bottom-0 left-0 w-full z-[60] bg-black transition-all duration-500
    ${hoveringBottom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
  `}
>>>>>>> Stashed changes
>
  <Footer />
</footer>
    </div>
  );
}

