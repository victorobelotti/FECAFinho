import React from 'react';
import { motion } from 'motion/react';
import { Map, MessageSquare, Power, Settings, Sun, Moon } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const { view, setView, deactivateTotem, isDarkMode, toggleDarkMode } = useCampusStore();

  const items = [
    { id: 'map', icon: Map, label: 'Mapa' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <div className={cn(
      "w-full md:w-24 h-auto md:h-full flex flex-row md:flex-col items-center justify-between md:justify-start py-3 md:py-10 px-4 md:px-0 gap-3 md:gap-10 overflow-y-visible shadow-2xl relative z-40 transition-all duration-500 shrink-0",
      "order-last md:order-first", // Bottom navigation bar on mobile, left sidebar on desktop
      view === 'admin' && "md:hidden lg:flex",
      isDarkMode 
        ? "bg-slate-950 border-t md:border-t-0 md:border-r border-slate-900" 
        : "bg-fecaf-blue border-t md:border-t-0 border-white/10"
    )}>
      {/* Power Off button - Compact on mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={deactivateTotem}
        className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-rose-500/20 text-rose-100 flex items-center justify-center border border-rose-500/30 shadow-lg md:mb-4 shrink-0"
        title="Encerrar Sessão"
      >
        <Power className="w-5 h-5 md:w-6 md:h-6" />
      </motion.button>

      {/* Navigation pages - Map and Chat */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-6 flex-1 md:flex-initial justify-center md:justify-start">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id as any)}
            className={cn(
              "p-3.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 group flex items-center justify-center gap-1.5 md:flex-col md:gap-1.5 min-w-[55px] md:min-w-0 touch-manipulation",
              view === id 
                ? "bg-fecaf-green text-white shadow-lg shadow-fecaf-green/30" 
                : "text-white/40 hover:bg-white/10 hover:text-white"
            )}
            title={label}
          >
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden md:block text-[9px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Dark/Light Mode Switcher */}
      <div className="flex-grow-0 flex flex-col items-center shrink-0">
        <motion.button
          whileHover={{ scale: 1.1, rotate: isDarkMode ? -20 : 20 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={cn(
            "p-3 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center select-none shadow-md animate-pulse-border-sync touch-manipulation",
            isDarkMode 
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
          )}
          style={{
            '--pulse-glow': isDarkMode ? 'rgba(245, 158, 11, 0.5)' : 'rgba(14, 165, 233, 0.5)',
            '--pulse-border-start': isDarkMode ? 'rgba(245, 158, 11, 0.7)' : 'rgba(14, 165, 233, 0.7)',
            '--pulse-border-mid': isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(14, 165, 233, 0.3)',
            '--pulse-border-end': isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
          } as React.CSSProperties}
          title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          id="dark-mode-toggle"
        >
          {isDarkMode ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
        </motion.button>
      </div>

      {/* Settings / Admin gear button */}
      <button 
        onClick={() => setView('admin')}
        className="p-3 md:p-4 rounded-xl md:rounded-2xl text-white/25 hover:text-white/60 hover:border-white/10 hover:bg-white/5 border border-transparent transition-all shrink-0 touch-manipulation md:mt-auto"
        title="Configurações"
      >
        <Settings className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
};
