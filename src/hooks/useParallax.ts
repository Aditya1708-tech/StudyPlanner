import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

export const useParallax = (speed = 0.1) => {
  const prefersReduced = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;

    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, prefersReduced]);

  return prefersReduced ? {} : { transform: `translateY(${offset}px)` };
};

export default useParallax;
