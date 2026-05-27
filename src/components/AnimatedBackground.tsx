import React from 'react';
import { motion } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';

export const AnimatedBackground: React.FC = () => {
  const isDarkMode = useCampusStore((state) => state.isDarkMode);

  // High-performance abstract technical/blueprint images with low opacity and standard aspect ratio
  const bgImage = isDarkMode
    ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop" // Glowing deep gradient mesh
    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"; // White elegant visual wave mesh

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Base Image Layer with Ken Burns (slow zoom/drift) effect */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1.02, 1],
          x: [0, -10, 10, 0],
          y: [0, 10, -5, 0],
          rotate: [0, 1, -1, 0]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={bgImage}
          alt="Abstract tech background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-1000"
          style={{
            opacity: isDarkMode ? 0.08 : 0.045,
            filter: "contrast(1.1) brightness(1.0)",
          }}
        />
      </motion.div>

      {/* Grid Pattern overlaying */}
      <div className={`absolute inset-0 bg-pattern transition-opacity duration-1000 ${
        isDarkMode ? "opacity-[0.02]" : "opacity-[0.04]"
      }`} />

      {/* Floating Brand Glow Orbs (Fluid Ambient Lights) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blue Orb */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -120, -50, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(0,74,128,0.2) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,74,128,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Green Orb */}
        <motion.div
          animate={{
            x: [0, -100, 60, 0],
            y: [0, 110, -40, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full blur-[140px] transition-colors duration-1000"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(0,168,89,0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,168,89,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Center glowing vector lines of connection */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004a80" />
              <stop offset="100%" stopColor="#00a859" />
            </linearGradient>
          </defs>
          
          <motion.path
            d="M 100,200 L 300,150 L 500,300 L 800,220 L 1100,380"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            strokeDasharray="10 15"
            animate={{
              strokeDashoffset: [1000, 0],
            }}
            transition={{
              duration: 50,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <motion.path
            d="M 1200,800 L 900,650 L 700,750 L 400,600 L 100,850"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="1.5"
            strokeDasharray="8 12"
            animate={{
              strokeDashoffset: [0, 1000],
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </svg>
      </div>

      {/* Top light source highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};
