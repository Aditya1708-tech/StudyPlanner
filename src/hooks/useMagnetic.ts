import { useRef, useEffect } from 'react';
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export const useMagnetic = (intensity = 0.3) => {
  const ref = useRef<any>(null);
  const prefersReduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (prefersReduced) return;
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.hypot(distanceX, distanceY);

      // Active pull radius: 80px
      if (distance < 80) {
        x.set(distanceX * intensity);
        y.set(distanceY * intensity);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [x, y, intensity, prefersReduced]);

  return {
    ref,
    style: prefersReduced ? {} : { x: springX, y: springY }
  };
};

export default useMagnetic;
