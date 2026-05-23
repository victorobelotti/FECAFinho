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

export default function App() {
  const { view, isTotemActive, isDarkMode } = useCampusStore();

  if (!isTotemActive && view === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans transition-colors duration-500 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-fecaf-bg text-slate-900"
    }`}>
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
          {view === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex overflow-hidden"
            >
              <MapContainer />
              <ChatInterface />
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex justify-center items-stretch bg-white"
            >
               <ChatInterface />
               <div className="flex-1 bg-slate-50/50 flex items-center justify-center p-20">
                  <div className="max-w-md text-center">
                    <div className="w-40 h-40 mx-auto rounded-full flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 bg-fecaf-blue/10 blur-2xl rounded-full" />
                      <MascotIllustration className="w-40 h-40 drop-shadow-2xl relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Deseja navegar pelo Mapa?</h2>
                    <p className="text-slate-500 font-medium mb-8">
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
    </div>
  );
}

