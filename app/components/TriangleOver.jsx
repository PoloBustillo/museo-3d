'use client';
import React from 'react';

export default function TriangleOverlay({ text, side = 'left' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-1/2 z-50 bg-black
        transform transition-transform duration-700 ease-in-out
        ${isLeft 
          ? 'translate-x-0 clip-triangle-right' 
          : 'translate-x-full clip-triangle-left'}
        flex items-center justify-center p-8
      `}
    >
      <p className="text-white text-2xl text-center">{text}</p>
    </div>
  );
}