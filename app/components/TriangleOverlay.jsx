'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AnimatedTriangleOverlay({
  step = 1,
  text = '',
  side = 'left',
  isFinalStep = false,
}) {
  const isLeft = side === 'left';

  const variants = {
    initial: { x: isLeft ? '-105%' : '105%' },
    animate: { x: '0%', transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { x: isLeft ? '-105%' : '105%', transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <motion.div
      key={`${step}-${text}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`
        fixed top-0 h-full w-1/2 z-[50] bg-black text-white
        ${isLeft ? 'left-0 clip-poly-right' : 'right-0 clip-poly-left'}
        flex items-center
      `}
    >
      <div className={`
        max-w-md
        ${isLeft ? 'safe-pad-left text-left' : 'ml-auto safe-pad-right text-right'}
      `}>
        <h2 className="text-7xl md:text-8xl font-extrabold leading-none">
          {step.toString().padStart(2, '0')}
        </h2>

        <p className="mt-4 text-lg md:text-xl leading-relaxed">
          {text}
        </p>

        {isFinalStep && (
  <div className="mt-8 justify-center">
    <Link
  href="/museo"
  className="
    relative inline-block px-6 py-3 rounded-md border border-white
    font-semibold text-base text-white overflow-hidden group
    backdrop-blur-md bg-white/10
  "
>
  <span
    aria-hidden
    className="
      absolute -inset-[2px] rounded-md
      bg-gradient-to-r from-indigo-900 via-purple-500 to-indigo-900
      bg-[length:200%_200%] opacity-70 animate-borderPulse
      group-hover:opacity-100 group-hover:brightness-125
      transition-opacity duration-500 ease-in-out
    "
  />

  <span
    aria-hidden
    className="
      absolute inset-0 rounded-md
      bg-gradient-to-r from-indigo-900 via-purple-500 to-indigo-900
      scale-x-0 origin-left transition-transform duration-500 ease-out
      group-hover:scale-x-100 group-hover:brightness-125
    "
  />

  <span className="relative z-10 transition-colors duration-500">
    ¡Visita el museo virtual!
  </span>
</Link>
  </div>
)}
      </div>
    </motion.div>
  );
}