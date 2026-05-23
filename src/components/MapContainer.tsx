import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';
import { CAMPUS_NODES, findPath } from '../lib/campus-data';
import { Layers, Navigation, Clock, Footprints, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const MapContainer: React.FC = () => {
  const { currentFloor, setFloor, selectedNodeId, selectNode, navigationPath, setNavigationPath, setView, isDarkMode } = useCampusStore();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const floorNodes = React.useMemo(() => {
    const nodes = CAMPUS_NODES.filter(n => n.floor === currentFloor);
    
    // Configuration for containment and relative scaling
    const cardSizePercent = 12; // Base card size in %
    const safePadding = 8; // Margin from container edges
    const minDistance = 18; // Optimized for 3D relative positioning
    
    let adjustedNodes = [...nodes];
    
    // Iterative force-directed relaxation with strict bounding box
    for (let i = 0; i < 200; i++) {
      for (let j = 0; j < adjustedNodes.length; j++) {
        for (let k = j + 1; k < adjustedNodes.length; k++) {
          const n1 = adjustedNodes[j];
          const n2 = adjustedNodes[k];
          
          let dx = n1.x - n2.x;
          let dy = n1.y - n2.y;
          
          if (dx === 0 && dy === 0) {
            dx = Math.random() * 0.1;
            dy = Math.random() * 0.1;
          }
          
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < minDistance) {
            const force = (minDistance - dist) / dist * 0.6;
            const moveX = dx * force;
            const moveY = dy * force;
            
            // Apply relaxation while enforcing strict bounding box (considering node radius)
            // Limit = 100 - padding - (cardSize/2)
            const limitMax = 100 - safePadding - (cardSizePercent / 2);
            const limitMin = safePadding + (cardSizePercent / 2);
            
            // Skip relaxation for nodes on Floor 0 or waypoints to maintain strict grid alignment
            if (!n1.isHidden && n1.id !== 'totem-base' && n1.floor !== 0) {
              adjustedNodes[j] = { 
                ...n1, 
                x: Math.min(limitMax, Math.max(limitMin, n1.x + moveX)), 
                y: Math.min(limitMax, Math.max(limitMin, n1.y + moveY)) 
              };
            }
            if (!n2.isHidden && n2.id !== 'totem-base' && n2.floor !== 0) {
              adjustedNodes[k] = { 
                ...n2, 
                x: Math.min(limitMax, Math.max(limitMin, n2.x - moveX)), 
                y: Math.min(limitMax, Math.max(limitMin, n2.y - moveY)) 
              };
            }
          }
        }
        
        // Final pass for single nodes that might have been spawned outside safe zone
        const limitMax = 100 - safePadding - (cardSizePercent / 2);
        const limitMin = safePadding + (cardSizePercent / 2);
        const n = adjustedNodes[j];
        if (n.floor !== 0) {
          adjustedNodes[j] = {
            ...n,
            x: Math.min(limitMax, Math.max(limitMin, n.x)),
            y: Math.min(limitMax, Math.max(limitMin, n.y))
          };
        }
      }
    }

    // Fix "You Are Here" position at the specific bottom-center safety zone
    const totemIndex = adjustedNodes.findIndex(n => n.id === 'totem-base');
    if (totemIndex !== -1) {
      adjustedNodes[totemIndex] = {
        ...adjustedNodes[totemIndex],
        x: 50,
        y: 100 - safePadding - (cardSizePercent / 2) // Pinned to bottom safety margin
      };
    }

    return adjustedNodes;
  }, [currentFloor]);

  // Task 2: Esconamento Automático logic
  const mapScaleFactor = React.useMemo(() => {
    const nodeCount = floorNodes.length;
    if (nodeCount > 12) return 0.85;
    if (nodeCount > 8) return 0.92;
    return 1;
  }, [floorNodes]);

  const handleNodeClick = (nodeId: string) => {
    if (selectedNodeId === nodeId) {
      selectNode(null);
      setNavigationPath(null);
    } else {
      selectNode(nodeId);
      // Fixed origin point as requested (You Are Here)
      const path = findPath('totem-base', nodeId);
      setNavigationPath(path);
    }
  };

  // Helper to get coordinates for SVG path using adjusted positions
  const getPathCoords = () => {
    if (!navigationPath) return "";
    
    // Create a lookup for adjusted positions of nodes on screen
    const adjustedPosMap = new Map<string, { x: number; y: number }>(floorNodes.map(n => [n.id, { x: n.x, y: n.y }]));
    
    const pathNodes = navigationPath.map(id => {
      const adjusted = adjustedPosMap.get(id);
      if (adjusted) return { x: adjusted.x, y: adjusted.y, floor: currentFloor };
      
      const original = CAMPUS_NODES.find(n => n.id === id);
      return original ? { x: original.x, y: original.y, floor: original.floor } : null;
    });

    return pathNodes
      .filter((n): n is { x: number; y: number, floor: number } => 
        n !== null && (n.floor === currentFloor)
      )
      .map(n => `${n.x},${n.y}`)
      .join(" L ");
  };

  return (
    <div ref={containerRef} className={cn(
      "flex-1 relative overflow-hidden flex flex-col transition-all duration-500",
      isDarkMode ? "bg-slate-900" : "bg-slate-50"
    )}>
      {/* Top Header - Unified Label & Info Panel */}
      <div className="absolute top-10 left-10 right-10 z-50 flex justify-between items-center pointer-events-none">
        <div className="space-y-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-fecaf-green animate-ping" />
            <h3 className={`text-sm font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Smart Building Live</h3>
          </div>
          <h4 className={`text-4xl font-black tracking-tight italic transition-colors duration-500 ${
            isDarkMode ? "text-slate-100" : "text-slate-800"
          }`}>
            {currentFloor === 0 ? 'Pavimento Térreo' : `Planta Subsolo -0${currentFloor}`}
          </h4>
        </div>

        {/* Info Panel - Compact Header Style */}
        <AnimatePresence>
          {selectedNodeId && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className={cn(
                "flex-1 max-w-4xl h-24 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[32px] p-4 flex items-center gap-8 pointer-events-auto ml-12 transition-all duration-500 border",
                isDarkMode ? "bg-slate-950/90 border-slate-800 text-white" : "bg-white/90 border-slate-100 text-slate-800"
              )}
            >
              {/* Identity Section */}
              <div className={`flex items-center gap-4 min-w-[200px] border-r pr-4 transition-colors duration-500 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                <div className="w-1.5 h-10 bg-fecaf-green rounded-full shrink-0" />
                <div className="flex flex-col text-left">
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isDarkMode ? "text-slate-500" : "text-slate-300"}`}>Nível {currentFloor === 0 ? 'Térreo' : `S${currentFloor}`}</span>
                  <h4 className={`text-lg font-black tracking-tight leading-tight truncate max-w-[160px] transition-colors duration-500 ${isDarkMode ? "text-slate-100" : "text-fecaf-blue"}`}>
                    {CAMPUS_NODES.find(n => n.id === selectedNodeId)?.name}
                  </h4>
                </div>
              </div>

              {/* Description & Metrics */}
              <div className="flex-1 flex items-center gap-6">
                <p className={`text-[10px] font-bold italic line-clamp-2 flex-1 border-r pr-6 transition-all duration-500 ${
                  isDarkMode ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-100"
                }`}>
                  "{CAMPUS_NODES.find(n => n.id === selectedNodeId)?.description || 'Espaço de alta performance.'}"
                </p>

                <div className={`flex items-center gap-6 shrink-0 border-r pr-6 transition-all duration-500 ${
                  isDarkMode ? "border-slate-800" : "border-slate-100"
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-fecaf-blue" />
                    <span className={`text-xs font-black uppercase italic transition-colors duration-500 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>~2 MIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-fecaf-green" />
                    <span className={`text-xs font-black uppercase italic transition-colors duration-500 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>~150</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 shrink-0 relative pr-2">
                <button 
                  onClick={() => setView?.('chat' as any)}
                  className="bg-fecaf-blue text-white px-6 h-12 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-lg shadow-fecaf-blue/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  Guia Assistido
                </button>
                
                <button 
                  onClick={() => {
                    selectNode(null);
                    setNavigationPath(null);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                    isDarkMode 
                      ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400 hover:bg-slate-700" 
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:text-rose-500 hover:bg-rose-50"
                  }`}
                  aria-label="Fechar detalhes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative flex items-center justify-center p-6 pt-24 pb-8 overflow-hidden transition-all duration-700">
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none bg-pattern ${
          isDarkMode ? "opacity-[0.01]" : "opacity-[0.03]"
        }`} />
        
        <motion.div 
          animate={{ 
            scale: mapScaleFactor,
            opacity: 1
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative max-w-full max-h-full aspect-[16/10] w-full h-auto rounded-[64px] border-2 border-dashed overflow-hidden flex items-center justify-center transition-all duration-500 group/map",
            isDarkMode 
              ? "bg-slate-950 border-slate-800 shadow-[inset_0_4px_30px_rgba(0,0,0,0.5),0_40px_100px_rgba(0,0,0,0.7)]" 
              : "bg-white border-slate-200 shadow-[inset_0_4px_30px_rgba(0,0,0,0.02),0_40px_100px_rgba(0,0,0,0.05)]"
          )}
        >
          {/* Inner Safety Padding Border (Visual hint) */}
          <div className={cn(
            "absolute inset-8 rounded-[48px] border pointer-events-none transition-colors duration-500",
            isDarkMode ? "border-slate-800/50" : "border-slate-100/50"
          )} />
          {/* Technical Blueprint Background - Refined for viewport density */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {currentFloor === 0 ? (
                <>
                  {/* Main Building Shell - Floor 0 */}
                  <path 
                    d="M10,12 L90,12 L90,65 L35,65 L35,88 L10,88 Z" 
                    fill="none" 
                    stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} 
                    strokeWidth="0.15" 
                  />
                  {/* Internal Corridors Grid (Orthogonal) */}
                  <line x1="10" y1="30" x2="90" y2="30" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />
                  <line x1="10" y1="48" x2="90" y2="48" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />
                  <line x1="30" y1="78" x2="50" y2="78" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />
                  
                  {/* Main Vertical Spine */}
                  <line x1="50" y1="12" x2="50" y2="92" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />
                  
                  {/* Lab Connector Verticals */}
                  <line x1="22" y1="15" x2="22" y2="30" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />
                  <line x1="78" y1="15" x2="78" y2="30" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />
                  <line x1="35" y1="48" x2="35" y2="65" stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} strokeWidth="0.08" strokeDasharray="1 1" />

                  {/* Specialized Room Areas */}
                  <rect x="15" y="15" width="20" height="12" fill={isDarkMode ? "#38bdf8" : "var(--color-fecaf-blue)"} opacity="0.03" />
                  <rect x="42" y="15" width="20" height="12" fill={isDarkMode ? "#38bdf8" : "var(--color-fecaf-blue)"} opacity="0.03" />
                  <rect x="70" y="15" width="15" height="12" fill={isDarkMode ? "#38bdf8" : "var(--color-fecaf-blue)"} opacity="0.03" />
                </>
              ) : (
                <path 
                  d="M15,15 L85,15 L85,85 L15,85 Z" 
                  fill="none" 
                  stroke={isDarkMode ? "rgba(56, 189, 248, 0.4)" : "var(--color-fecaf-blue)"} 
                  strokeWidth="0.15" 
                />
              )}
            </svg>
          </div>

          {/* Map Grid Pattern background */}
          <div className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-500",
            isDarkMode ? "opacity-[0.04]" : "opacity-[0.02]"
          )}>
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {Array.from({ length: 20 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={i * 5} y1="0" x2={i * 5} y2="100" stroke={isDarkMode ? "#38bdf8" : "#000"} strokeWidth="0.05" />
                  <line x1="0" y1={i * 5} x2="100" y2={i * 5} stroke={isDarkMode ? "#38bdf8" : "#000"} strokeWidth="0.05" />
                </React.Fragment>
              ))}
            </svg>
          </div>

          {/* Navigation Path SVG */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <AnimatePresence>
                {navigationPath && (
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={`M ${getPathCoords()}`}
                    fill="none"
                    stroke="var(--color-fecaf-green)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_15px_rgba(0,168,89,0.5)]"
                  />
                )}
              </AnimatePresence>
            </svg>
          </div>

          {/* Nodes */}
          {floorNodes.map((node) => {
            if (node.isHidden) return null;
            const isTotem = node.id === 'totem-base';
            const isDestination = selectedNodeId === node.id;

            return (
              <motion.button
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                   scale: isTotem ? 1.1 : (isDestination ? 1.1 : 1),
                   opacity: 1,
                   zIndex: isDestination || isTotem ? 50 : 30
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNodeClick(node.id)}
                style={{ 
                   left: `${node.x}%`, 
                   top: `${node.y}%`,
                }}
                className={cn(
                   "absolute -translate-x-1/2 -translate-y-1/2 group transition-all",
                   isTotem ? "pointer-events-none" : ""
                )}
              >
                {/* Hit Area - Minimum 48px for reachability */}
                <div className="absolute -inset-6 rounded-full pointer-events-auto" />
                
                <div className={cn(
                   "rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all duration-500",
                   mapScaleFactor < 0.9 ? "w-16 h-16" : "w-20 h-20",
                   isTotem 
                     ? "bg-fecaf-green border-white shadow-[0_15px_40px_rgba(0,168,89,0.4)] ring-4 ring-white/30"
                     : (isDestination 
                         ? "bg-fecaf-blue border-fecaf-green shadow-[0_25px_60px_rgba(0,168,89,0.3)] ring-4 ring-fecaf-green/20" 
                         : (isDarkMode 
                             ? "bg-slate-900 border-slate-800 text-slate-100 hover:border-fecaf-green/50 hover:shadow-2xl" 
                             : "bg-white border-slate-100 text-slate-800 shadow-sleek hover:border-fecaf-green/20 hover:shadow-2xl"))
                )}>
                  {/* Visual Feedback Ripple - Stronger for destination */}
                  {isDestination && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute inset-0 bg-fecaf-green rounded-xl pointer-events-none"
                    />
                  )}

                  {/* Icon or Marker for Totem */}
                  {isTotem && (
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="mb-1"
                    >
                      <Navigation className="w-6 h-6 text-white fill-white rotate-45" />
                    </motion.div>
                  )}

                  <div className={cn(
                    "text-[7px] uppercase font-black mb-1 tracking-widest",
                    isTotem || isDestination ? "text-white/50" : (isDarkMode ? "text-slate-500" : "text-slate-400")
                  )}>
                    {isTotem ? "Totem" : node.type}
                  </div>
                  <div className={cn(
                    "text-[9px] font-black break-words w-full leading-tight uppercase",
                    isTotem || isDestination ? "text-white" : (isDarkMode ? "text-slate-100" : "text-slate-800")
                  )}>
                    {node.name}
                  </div>
                  
                  {(isDestination || isTotem) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-1.5 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter",
                        isTotem ? "bg-white text-fecaf-green" : "bg-fecaf-green text-white"
                      )}
                    >
                      {isTotem ? "Ponto de Partida" : "Destino Final"}
                    </motion.div>
                  )}
                </div>
                
                {isDestination && (
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <motion.div 
                      animate={{ height: [0, 48] }}
                      className="w-0.5 bg-gradient-to-b from-fecaf-green to-transparent" 
                    />
                    <div className="text-[10px] font-black text-fecaf-green whitespace-nowrap uppercase tracking-[0.2em] mt-2">
                      Roteamento Ativo
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Floor Control */}
        <div className={cn(
          "absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-3 rounded-full transition-all duration-500 border",
          isDarkMode ? "bg-slate-900/90 border-slate-800 shadow-xl text-white" : "glass-panel"
        )}>
          <div className={`text-[9px] font-black uppercase text-center mb-2 px-2 ${
            isDarkMode ? "text-slate-500" : "text-slate-300"
          }`}>Level</div>
          {[2, 1, 0].map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={cn(
                "w-12 h-12 rounded-full font-black text-sm transition-all duration-300 flex items-center justify-center",
                currentFloor === f 
                  ? (isDarkMode ? "bg-fecaf-green text-white shadow-xl scale-110" : "bg-fecaf-blue text-white shadow-xl scale-110") 
                  : (isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-400 hover:bg-slate-50")
              )}
            >
              {f === 0 ? 'T' : `S${f}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
