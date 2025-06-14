'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedTriangleOverlay({ text, side = 'left' }) {
  const isLeft = side === 'left';

  const variants = {
    initial:  { x: isLeft ? '-100%' : '100%' }, 
    animate:  { x: '0%',       transition: { duration: 0.4, ease: 'easeInOut' } },
    exit:     { x: isLeft ? '-100%' : '100%',  transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  return (
    <motion.div
      key={text}                
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`
        fixed top-0 h-full w-1/2 bg-black z-50
        ${isLeft ? 'left-0 clip-triangle-right' : 'right-0 clip-triangle-left'}
        flex items-center justify-center p-8
      `}
    >
      <p className="text-white text-2xl text-center">{text}</p>
    </motion.div>
  );
}