import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  heavy?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true, 
  heavy = false, 
  onClick, 
  delay = 0,
  ...props 
}) => {
  const cardClass = heavy ? 'glass-panel-heavy' : 'glass-panel';
  const hoverProps = hover 
    ? {
        whileHover: { y: -4, scale: 1.01, boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.15)' },
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
      } 
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      {...hoverProps}
      onClick={onClick}
      className={`rounded-2xl p-6 ${cardClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
