import React, { useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';

export const Spotlight: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Spotlight coordinates relative to viewport scroll to align correctly
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
      style={{
        background: useMotionTemplate`radial-gradient(350px at ${mouseX}px ${mouseY}px, rgba(109, 74, 255, 0.04), transparent 80%)`
      }}
    />
  );
};

export default Spotlight;
