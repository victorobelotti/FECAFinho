import React from 'react';
import { motion } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';
import { MascotIllustration } from './MascotIllustration';
import { Power } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const activateTotem = useCampusStore((state) => state.activateTotem);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-pattern pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center max-w-4xl text-center px-6 relative z-10"
      >
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-fecaf-green/10 rounded-full animate-pulse blur-3xl" />
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-80 h-80 rounded-full flex items-center justify-center overflow-visible"
          >
            <MascotIllustration className="w-full h-full drop-shadow-[0_20px_50px_rgba(245,158,11,0.3)]" />
          </motion.div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-fecaf-blue text-white px-8 py-2 rounded-2xl text-xs font-black shadow-2xl tracking-[0.3em] uppercase">
            FECAFinho
          </div>
        </div>

        <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tighter italic">
          <span className="text-fecaf-blue">BEM-</span>
          <span className="text-fecaf-green">VINDO(A)</span>
        </h1>
        <p className="text-slate-400 font-black tracking-[0.3em] uppercase mb-16 text-sm">
          Toque para iniciar o atendimento inteligente
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={activateTotem}
          className="bg-fecaf-green hover:bg-[#008f4c] text-white px-16 py-7 rounded-[32px] text-2xl font-black shadow-2xl shadow-fecaf-green/30 flex items-center gap-4 transition-all uppercase tracking-widest border-b-8 border-[#008f4c]"
        >
          <Power className="w-8 h-8" />
          Ativar Totem
        </motion.button>
      </motion.div>

      {/* Decorative footer text to match design */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
        Integração IA Local • v2.0
      </div>
    </div>
  );
};
