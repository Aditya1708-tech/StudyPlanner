import React, { useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface UseTiltOptions {
  maxRotation?: number; // Max degrees of rotation
  glare?: boolean;      // Enable sheen/glare shine
}

export const useTilt = (options: UseTiltOptions = {}) => {
  const { maxRotation = 8, glare = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse X relative to card bounds
    const y = e.clientY - rect.top;  // mouse Y relative to card bounds

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * maxRotation; 
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'transform 0.1s ease-out'
    });

    if (glare) {
      // Glare calculation relative to mouse coordinates percentage
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      setGlarePosition({
        x: percentX,
        y: percentY,
        opacity: 0.12 // Restrained spotlight sheen opacity
      });
    }
  };

  const onMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s ease-out'
    });

    if (glare) {
      setGlarePosition(prev => ({ ...prev, opacity: 0 }));
    }
  };

  // Inline Glare Style node generator helper
  const glareStyle: React.CSSProperties = glare ? {
    background: `radial-gradient(circle 120px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4), transparent)`,
    opacity: glarePosition.opacity,
    transition: 'opacity 0.3s ease'
  } : {};

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style,
    glareStyle
  };
};

export default useTilt;
