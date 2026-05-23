import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';
import { MascotIllustration } from './MascotIllustration';
import { Power } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const activateTotem = useCampusStore((state) => state.activateTotem);
  const isDarkMode = useCampusStore((state) => state.isDarkMode);
  const [isStarted, setIsStarted] = useState(false);

  const handleStartTotem = () => {
    setIsStarted(true);
    activateTotem();
  };

  return (
    <div className={`fixed inset-0 flex flex-col justify-center items-center w-full min-h-screen p-6 z-50 overflow-hidden transition-colors duration-500 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
    }`}>
      <div className="absolute inset-0 opacity-[0.03] bg-pattern pointer-events-none" />
      
      <div 
        onClick={handleStartTotem} 
        className="cursor-pointer active:scale-95 transition-transform w-full flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center max-w-4xl text-center px-6 relative z-10 w-full"
        >
          {/* Avatar / Mascot Container */}
          <div className="relative mb-10 md:mb-16 max-w-[80%] md:max-w-full">
            <div className="absolute inset-0 bg-fecaf-green/10 rounded-full animate-pulse blur-3xl" />
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto rounded-full flex items-center justify-center overflow-visible"
            >
              <MascotIllustration className="w-full h-full drop-shadow-[0_20px_50px_rgba(245,158,11,0.3)]" />
            </motion.div>
            <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 bg-fecaf-blue text-white px-6 md:px-8 py-1.5 md:py-2 rounded-2xl text-[10px] md:text-xs font-black shadow-2xl tracking-[0.3em] uppercase whitespace-nowrap">
              FECAFinho
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter italic whitespace-nowrap selective-font">
            <span className="text-fecaf-blue">BEM-</span>
            <span className="text-fecaf-green">VINDO(A)</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-black tracking-[0.2em] md:tracking-[0.3em] uppercase mb-10 md:mb-16 text-xs md:text-sm">
            Toque para iniciar o atendimento inteligente
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              // Prevent event bubbling since parent has onClick too
              e.stopPropagation();
              handleStartTotem();
            }}
            className="bg-fecaf-green hover:bg-[#008f4c] text-white px-10 py-5 md:px-16 md:py-7 rounded-2xl md:rounded-[32px] text-lg md:text-2xl font-black shadow-2xl shadow-fecaf-green/30 flex items-center gap-3 md:gap-4 transition-all uppercase tracking-widest border-b-4 md:border-b-8 border-[#008f4c] select-none"
          >
            <Power className="w-6 h-6 md:w-8 md:h-8" />
            Ativar Totem
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative footer text to match design */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em] whitespace-nowrap pointer-events-none">
        Integração IA Local • v2.0
      </div>
    </div>
  );
};

