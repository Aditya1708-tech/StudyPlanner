import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A premium floating banner that animates in at the top of the screen
 * when the user loses network connectivity.
 */
const OfflineBanner: React.FC = () => {
  const isOffline = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md p-4 rounded-2xl glass-panel bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 flex items-center gap-3.5 shadow-2xl shadow-red-500/10"
          role="status"
          aria-live="polite"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-black text-sm tracking-tight">Offline Mode Active</p>
            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Running locally. Planning features will use fallback scheduler.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
