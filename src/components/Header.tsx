import React from 'react';
import { motion } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';

export const Header: React.FC = () => {
  const { isDarkMode } = useCampusStore();

  return (
    <header className={`px-4 md:px-8 py-3 md:py-4 flex justify-between items-center shrink-0 z-50 transition-all duration-500 border-b ${
      isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
    }`}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-fecaf-blue rounded-xl flex items-center justify-center p-2 md:p-2.5 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top-Left Bracket */}
            <path d="M 74,18 L 32,18 L 18,32 L 18,74 L 29,63 L 29,36.5 L 36.5,29 L 63,29 Z" fill="white" />
            {/* Bottom-Right Bracket */}
            <path d="M 26,82 L 68,82 L 82,68 L 82,26 L 71,37 L 71,63.5 L 63.5,71 L 37,71 Z" fill="white" />
            {/* Inner Green Square */}
            <rect x="38" y="38" width="24" height="24" fill="#00a859" rx="1.5" />
          </svg>
        </div>
        <div>
          <h1 className={`text-base md:text-xl font-bold leading-tight uppercase tracking-tight transition-colors duration-500 ${
            isDarkMode ? "text-white" : "text-fecaf-blue"
          }`}>Totem FECAF</h1>
          <p className={`text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-black transition-colors duration-500 ${
            isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}>
            <span className="hidden sm:inline">Campus Virtual | </span>Unidade Taboão
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex flex-col items-end">
          <span className={`hidden sm:inline text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
            isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}>Status do Sistema</span>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-fecaf-green rounded-full animate-pulse"></span>
            <span className="text-[9px] md:text-xs font-black text-fecaf-green uppercase tracking-wider">IA Ativa</span>
          </div>
        </div>
        
        {/* Date and time hidden on extra small/mobile devices to optimize visual density */}
        <div className={`hidden md:block h-10 w-px transition-colors duration-500 ${
          isDarkMode ? "bg-slate-800" : "bg-slate-100"
        }`}></div>
        
        <div className="hidden md:block text-right">
          <span className={`text-xl md:text-2xl font-light tabular-nums transition-colors duration-500 ${
            isDarkMode ? "text-slate-100" : "text-slate-800"
          }`}>
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${
            isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </header>
  );
};
