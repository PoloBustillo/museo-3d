'use client';
import { motion } from 'framer-motion';

export default function AnimatedOverlay({
  step,            
  instructions,    
  side = 'left',   
}) {
  const isLeft = side === 'left';

  const variants = {
    initial:{ x: isLeft ? '-105%' : '105%' },
    animate:{ x: '0%', transition:{ duration:0.7, ease:'easeInOut' } },
    exit:   { x: isLeft ? '-105%' : '105%', transition:{ duration:0.7, ease:'easeInOut' } },
  };

  return (
    <motion.div
      key={step}
      initial="initial" animate="animate" exit="exit" variants={variants}
      className={`
        fixed top-0 h-full w-1/2 z-50 bg-black text-white
        ${isLeft ? 'left-0 clip-poly-right' : 'right-0 clip-poly-left'}
        flex items-center
      `}
    >
      <div className="safe-pad max-w-md">
        <h2 className="text-6xl md:text-8xl font-extrabold leading-none">
          {step.toString().padStart(2,'0')}
        </h2>

        <p className="mt-4 text-lg md:text-xl leading-relaxed">
          {instructions}
        </p>
      </div>
    </motion.div>
  );
}