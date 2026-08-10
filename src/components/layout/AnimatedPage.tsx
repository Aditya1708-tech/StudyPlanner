import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../lib/motion';

export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
