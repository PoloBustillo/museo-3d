'use client';
import { Parallax } from 'react-scroll-parallax';

export default function ParallaxTriangleSection({ instructions, imageUrl, reverse = false }) {
  return (
    <section className="relative min-h-screen">
      {/* Velocidad de la imágen, esta debe de ir a velocidad más baja que la velocidad de los triángulos, manejar números negativos*/}
      <Parallax speed={-15} className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </Parallax>
      {/**Velocidad del triángulo speed={x} rangos de 10 a 50 para más comodidad */}
      <Parallax speed={25} className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-full h-full bg-black ${reverse ? 'clip-triangle-right' : 'clip-triangle-left'} flex items-center justify-center`}
        >
          <p className="text-white text-2xl p-8 text-center">{instructions}</p>
        </div>
      </Parallax>
    </section>
  );
}