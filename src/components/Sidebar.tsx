import React from 'react';
import { motion } from 'motion/react';
import { Map, MessageSquare, Power, Settings, Sun, Moon } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const { view, setView, isDarkMode, toggleDarkMode } = useCampusStore();

  const items = [
    { id: 'map', icon: Map, label: 'Mapa' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <div className={cn(
      "w-28 flex flex-col items-center py-12 gap-12 overflow-y-auto shadow-2xl relative z-40 h-full transition-all duration-500",
      isDarkMode ? "bg-slate-950 border-r border-slate-900" : "bg-fecaf-blue"
    )}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setView('welcome')}
        className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-100 flex items-center justify-center border border-rose-500/30 shadow-lg mb-8"
      >
        <Power className="w-8 h-8" />
      </motion.button>

      <div className="flex-1 flex flex-col gap-10">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id as any)}
            className={cn(
              "p-5 rounded-3xl transition-all duration-300 group flex flex-col items-center gap-2",
              view === id 
                ? "bg-fecaf-green text-white shadow-xl shadow-fecaf-green/30" 
                : "text-white/40 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-8 h-8" />
            <span className="text-[10px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Dark/Light Mode Switcher in the highlighted slot */}
      <div className="flex-grow-0 flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.1, rotate: isDarkMode ? -20 : 20 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={cn(
            "p-5 rounded-[24px] border flex flex-col items-center gap-1.5 group select-none shadow-md animate-pulse-border-sync",
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
          {isDarkMode ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
          <span className="text-[10px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isDarkMode ? 'Claro' : 'Escuro'}
          </span>
        </motion.button>
      </div>

      <button 
        onClick={() => setView('admin')}
        className="p-6 rounded-3xl text-white/20 hover:text-white/60 hover:border-white/20 hover:bg-white/5 border border-transparent transition-all mt-12"
      >
        <Settings className="w-7 h-7" />
      </button>
    </div>
  );
};
