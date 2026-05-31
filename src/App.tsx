/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCampusStore } from './store/useCampusStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/MapContainer';
import { ChatInterface } from './components/ChatInterface';
import { AdminPortal } from './components/AdminPortal';
import { AnimatePresence, motion } from 'motion/react';

import { Header } from './components/Header';
import { MascotIllustration } from './components/MascotIllustration';
import { AnimatedBackground } from './components/AnimatedBackground';

export default function App() {
  const { view, isTotemActive, isDarkMode } = useCampusStore();
  const [showWarning, setShowWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(10);

  React.useEffect(() => {
    if (!isTotemActive || view === 'admin') {
      setShowWarning(false);
      return;
    }

    let warningTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const resetTimer = () => {
      setShowWarning(false);
      setCountdown(10);

      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      // 30 seconds of quiet inactivity followed by a 10-second warning countdown (total 40 seconds)
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setCountdown(10);

        let timeLeft = 10;
        countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            useCampusStore.getState().deactivateTotem();
          }
        }, 1000);
      }, 30000);
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isTotemActive, view]);

  if (!isTotemActive && view === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className={`flex flex-col h-screen h-[100dvh] overflow-hidden font-sans transition-colors duration-500 relative ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-fecaf-bg text-slate-900"
    }`}>
      <AnimatedBackground />
      <Header />
      
      {/* Responsive layout: stacks on mobile (flex-col), row on desktop (md:flex-row) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
          {view === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full w-full"
            >
              <div className="col-span-1 lg:col-span-8 flex flex-col overflow-hidden h-full relative">
                <MapContainer />
              </div>
              <div className="hidden lg:block lg:col-span-4 overflow-hidden h-full">
                <ChatInterface />
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-12 items-stretch bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden h-full w-full"
            >
               <div className="col-span-1 lg:col-span-5 xl:col-span-4 h-full overflow-hidden flex flex-col">
                 <ChatInterface />
               </div>
               
               {/* Hidden on mobile/tablets to avoid crouched lists or double panels */}
               <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 bg-slate-50/50 dark:bg-slate-900/10 flex-col items-center justify-center p-20">
                  <div className="max-w-md text-center">
                    <div className="w-40 h-40 mx-auto rounded-full flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 bg-fecaf-blue/10 blur-2xl rounded-full" />
                      <MascotIllustration className="w-40 h-40 drop-shadow-2xl relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Deseja navegar pelo Mapa?</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                      O Fecafinho pode te guiar para qualquer sala ou laboratório. Clique no ícone do mapa no menu lateral para visualizar o campus.
                    </p>
                    <button 
                      onClick={() => useCampusStore.getState().setView('map')}
                      className="bg-fecaf-blue text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-fecaf-blue/20"
                    >
                      ABRIR MAPA INTERATIVO
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <AdminPortal />
            </motion.div>
          )}

          {view === 'welcome' && (
             <motion.div
              key="welcome-back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
             >
               <WelcomeScreen />
             </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Elegant Warning Overlay for Inactivity */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-colors duration-300"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 text-slate-100 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Pulsing ring around countdown number */}
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-fecaf-green/30 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-fecaf-green border-t-transparent animate-spin" />
                <span className="text-3xl font-black text-fecaf-green font-mono">{countdown}</span>
              </div>
              
              <h3 className="text-xl font-black tracking-tight mb-2 uppercase italic text-white font-sans">Você ainda está aí?</h3>
              <p className="text-slate-400 text-sm font-medium mb-6 font-sans">
                O totem será reiniciado após o término do cronômetro devido à inatividade.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowWarning(false);
                  setCountdown(10);
                }}
                className="w-full bg-fecaf-green hover:bg-[#008f4c] text-white py-4 px-6 rounded-2xl font-black tracking-wider uppercase transition-colors text-sm shadow-md cursor-pointer shadow-fecaf-green/20 font-sans"
              >
                Continuar usando
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

