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
        x: 60,
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
      {/* Top Header - Unified Label & Floor Control - Responsive Flow */}
      <div className={cn(
        "shrink-0 z-40 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 p-4 md:p-6 border-b pointer-events-auto transition-all duration-500",
        isDarkMode ? "bg-slate-950/40 border-slate-800/80" : "bg-white/40 border-slate-100"
      )}>
        {/* Title and Badge Column */}
        <div className="flex flex-col gap-1 md:gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-fecaf-green animate-ping animate-duration-1000" />
            <h3 className={`text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-colors duration-500 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Smart Building Live</h3>
          </div>
          <h4 className={`text-xl md:text-3xl lg:text-4xl font-black tracking-tight italic transition-colors duration-500 leading-tight ${
            isDarkMode ? "text-slate-100" : "text-slate-800"
          }`}>
            {currentFloor === 0 ? 'Pavimento Térreo' : `Planta Subsolo -0${currentFloor}`}
          </h4>
        </div>

        {/* Floor Control (Níveis) - Integrated in flow to never collide! */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${
            isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}>Pavimentos Campus</span>
          
          <div className={cn(
            "flex items-center gap-1.5 p-1 rounded-2xl transition-all duration-500 border flex-wrap",
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-100/50 border-slate-200"
          )}>
            {[2, 1, 0].map((f) => (
              <button
                key={f}
                onClick={() => setFloor(f)}
                className={cn(
                  "px-3.5 py-2 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center min-w-[50px] shadow-sm select-none",
                  currentFloor === f 
                    ? (isDarkMode ? "bg-fecaf-green text-white shadow-md scale-105" : "bg-fecaf-blue text-white shadow-md scale-105") 
                    : (isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-white hover:text-slate-800")
                )}
              >
                {f === 0 ? 'Térreo' : `S${f}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Node Info Panel - Responsive Flow */}
      <AnimatePresence>
        {selectedNodeId && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-slate-100 dark:border-slate-800/50"
          >
            <div className={cn(
              "p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between transition-all duration-500",
              isDarkMode ? "bg-slate-950/20 text-white" : "bg-white/50 text-slate-800"
            )}>
              {/* Identity Section */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-1 h-8 bg-fecaf-green rounded-full shrink-0" />
                <div className="flex flex-col text-left">
                  <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Nível {currentFloor === 0 ? 'Térreo' : `S${currentFloor}`}</span>
                  <h4 className="text-base md:text-lg font-black tracking-tight leading-tight">
                    {CAMPUS_NODES.find(n => n.id === selectedNodeId)?.name}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className={`text-[11px] font-bold italic line-clamp-2 md:flex-1 md:mx-6 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                "{CAMPUS_NODES.find(n => n.id === selectedNodeId)?.description || 'Espaço de alta performance.'}"
              </p>

              {/* Metrics and Actions */}
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-fecaf-blue" />
                    <span className="text-[11px] font-black uppercase italic">~2 MIN</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-fecaf-green" />
                    <span className="text-[11px] font-black uppercase italic">~150</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <button 
                    onClick={() => setView?.('chat' as any)}
                    className="justify-center bg-fecaf-blue text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-1.5 shadow-md shadow-fecaf-blue/20 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap animation-pulse"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Guia Assistido
                  </button>
                  
                  <button 
                    onClick={() => {
                      selectNode(null);
                      setNavigationPath(null);
                    }}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all border shrink-0",
                      isDarkMode 
                        ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400 hover:bg-slate-700" 
                        : "bg-slate-50 text-slate-400 border-slate-100 hover:text-rose-500 hover:bg-rose-50"
                    )}
                    aria-label="Fechar detalhes"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Content - Freed from absolute overlays - Responsive Flex & Overflow Scrolling */}
      <div className="flex-1 relative flex items-center justify-start sm:justify-center p-3 sm:p-6 pb-6 sm:pb-8 overflow-x-auto sm:overflow-hidden transition-all duration-700 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none bg-pattern ${
          isDarkMode ? "opacity-[0.01]" : "opacity-[0.03]"
        }`} />
        
        {/* Mobile Swipe Assist badge */}
        <div className="absolute right-4 bottom-4 z-40 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-2 text-[10px] font-black uppercase text-white shadow-lg pointer-events-none sm:hidden">
          <span className="animate-pulse">Deslize ↔</span>
        </div>

        <motion.div 
          animate={{ 
            scale: mapScaleFactor,
            opacity: 1
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative max-w-full max-h-full aspect-[16/10] w-[625px] sm:w-full md:w-auto md:h-full md:max-h-[72%] lg:w-full lg:h-auto shrink-0 md:shrink lg:shrink-0 rounded-[32px] sm:rounded-[64px] border-2 border-dashed overflow-hidden flex items-center justify-center transition-all duration-500 group/map",
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
                   "rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-all duration-500",
                   mapScaleFactor < 0.9 ? "w-12 h-12 sm:w-16 sm:h-16" : "w-14 h-14 sm:w-20 sm:h-20",
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
                      className="mb-0.5 sm:mb-1"
                    >
                      <Navigation className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-white rotate-45" />
                    </motion.div>
                  )}

                  <div className={cn(
                    "text-[6.5px] sm:text-[7px] uppercase font-black mb-0.5 sm:mb-1 tracking-widest",
                    isTotem || isDestination ? "text-white/50" : (isDarkMode ? "text-slate-500" : "text-slate-400")
                  )}>
                    {isTotem ? "Totem" : node.type}
                  </div>
                  <div className={cn(
                    "text-[7px] sm:text-[9px] font-black break-words w-full leading-tight uppercase",
                    isTotem || isDestination ? "text-white" : (isDarkMode ? "text-slate-100" : "text-slate-800")
                  )}>
                    {node.name}
                  </div>
                  
                  {(isDestination || isTotem) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-1 sm:mt-1.5 px-1 sm:px-2 py-0.5 rounded-full text-[5px] sm:text-[7px] font-black uppercase tracking-tighter",
                        isTotem ? "bg-white text-fecaf-green" : "bg-fecaf-green text-white"
                      )}
                    >
                      <span className="hidden sm:inline">{isTotem ? "Ponto de Partida" : "Destino Final"}</span>
                      <span className="inline sm:hidden">{isTotem ? "Partida" : "Destino"}</span>
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
      </div>
    </div>
  );
};
