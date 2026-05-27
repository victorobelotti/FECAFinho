import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';
import { MascotIllustration } from './MascotIllustration';
import { Power } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

export const WelcomeScreen: React.FC = () => {
  const activateTotem = useCampusStore((state) => state.activateTotem);
  const isDarkMode = useCampusStore((state) => state.isDarkMode);
  const [isStarted, setIsStarted] = useState(false);

  const handleStartTotem = () => {
    setIsStarted(true);
    activateTotem();
  };

  return (
    <div className={`fixed inset-0 flex flex-col justify-center items-center w-full h-[100dvh] p-4 md:p-6 z-50 overflow-hidden transition-colors duration-500 relative ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
    }`}>
      <AnimatedBackground />
      
      <div 
         onClick={handleStartTotem} 
         className="cursor-pointer active:scale-[0.98] transition-transform w-full max-h-full flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center max-w-4xl text-center px-4 relative z-10 w-full"
        >
          {/* Avatar / Mascot Container */}
          <div className="relative mb-6 md:mb-10 max-w-[70%] sm:max-w-[80%] md:max-w-full">
            <div className="absolute inset-0 bg-fecaf-green/10 rounded-full animate-pulse blur-3xl" />
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto rounded-full flex items-center justify-center overflow-visible"
            >
              <MascotIllustration className="w-full h-full drop-shadow-[0_15px_40px_rgba(245,158,11,0.25)]" />
            </motion.div>
            <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 bg-fecaf-blue text-white px-5 md:px-6 py-1 md:py-1.5 rounded-xl text-[9px] md:text-xxs font-black shadow-2xl tracking-[0.3em] uppercase whitespace-nowrap">
              FECAFinho
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 md:mb-4 tracking-tighter italic whitespace-nowrap selective-font leading-none">
            <span className="text-fecaf-blue">BEM-</span>
            <span className="text-fecaf-green">VINDO(A)</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-black tracking-[0.15em] md:tracking-[0.25em] uppercase mb-8 md:mb-10 text-[10px] sm:text-xs">
            Toque para iniciar o atendimento inteligente
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              // Prevent event bubbling since parent has onClick too
              e.stopPropagation();
              handleStartTotem();
            }}
            className="bg-fecaf-green hover:bg-[#008f4c] text-white px-8 py-3.5 md:px-12 md:py-4.5 rounded-2xl md:rounded-[24px] text-base md:text-xl font-black shadow-xl shadow-fecaf-green/20 flex items-center gap-2.5 md:gap-3 transition-all uppercase tracking-wider border-b-4 border-[#008f4c] select-none cursor-pointer"
          >
            <Power className="w-5 h-5 md:w-6 md:h-6" />
            Ativar Totem
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative footer text to match design */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] whitespace-nowrap pointer-events-none">
        Integração IA Local • v2.0
      </div>
    </div>
  );
};

