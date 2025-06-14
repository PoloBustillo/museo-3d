'use client';
import { motion } from 'framer-motion';

export default function AnimatedTriangleOverlay({
  step = 1,
  text = '',
  side = 'left',
}) {
  const isLeft = side === 'left';

  const variants = {
    initial: { x: isLeft ? '-105%' : '105%' },
    animate: { x: '0%',    transition: { duration: 0.5, ease: 'easeInOut' } },
    exit:    { x: isLeft ? '-105%' : '105%', transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <motion.div
      key={`${step}-${text}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`
        fixed top-0 h-full w-1/2 z-50 bg-black text-white
        ${isLeft ? 'left-0  clip-poly-right' : 'right-0 clip-poly-left'}
        flex items-center
      `}
    >
      <div className={`
        max-w-md
        ${isLeft
          ? 'safe-pad-left  text-left'
          : 'ml-auto safe-pad-right text-right'}
      `}>
        <h2 className="text-7xl md:text-8xl font-extrabold leading-none">
          {step.toString().padStart(2, '0')}
        </h2>

        <p className="mt-4 text-lg md:text-xl leading-relaxed">
          {text}
        </p>
      </div>
    </motion.div>
  );
}