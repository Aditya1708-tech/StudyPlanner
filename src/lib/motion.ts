import { Variants } from 'framer-motion';

// Restrained premium motion hierarchy definitions

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } // Custom premium easeOutExpo
  }
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

export const buttonTap = {
  whileTap: { scale: 0.97, transition: { duration: 0.1 } }
};

export const cardHover = {
  whileHover: { 
    y: -4, 
    scale: 1.005,
    boxShadow: '0 20px 40px -15px rgba(109, 74, 255, 0.08)',
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const floating = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const glowPulse = {
  animate: {
    opacity: [0.35, 0.65, 0.35],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    scale: 0.995,
    transition: { duration: 0.25, ease: "easeIn" }
  }
};

export const modalSpring: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 15,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};
