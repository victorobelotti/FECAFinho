import React from 'react';
import { motion } from 'motion/react';

export const MascotIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-label="FECAFinho Mascot"
  >
    <defs>
      {/* Background Forest Clip */}
      <clipPath id="circleClip">
        <circle cx="100" cy="100" r="100" />
      </clipPath>

      {/* Forest Gradient with Depth */}
      <linearGradient id="forestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3F2B1B" />
        <stop offset="100%" stopColor="#1A0F08" />
      </linearGradient>

      {/* Golden Hour Bloom */}
      <radialGradient id="sunBloom" cx="30" cy="30" r="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>

      {/* Rim Light / Glow Filter */}
      <filter id="rimGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feOffset dx="0" dy="0" result="offsetBlur" />
        <feFlood floodColor="#FBBF24" floodOpacity="0.8" result="amber" />
        <feComposite in="amber" in2="offsetBlur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* T-Shirt Gradient */}
      <linearGradient id="shirtGrad" x1="100" y1="85" x2="100" y2="190">
        <stop offset="0%" stopColor="#004A8D" />
        <stop offset="100%" stopColor="#003366" />
      </linearGradient>

      {/* Face Volume Gradient */}
      <radialGradient id="faceVolume" cx="100" cy="70" r="60" fx="110" fy="50">
        <stop offset="0%" stopColor="#F3F4F6" />
        <stop offset="100%" stopColor="#9CA3AF" />
      </radialGradient>
    </defs>

    {/* Cinematic Circular Frame Content */}
    <g clipPath="url(#circleClip)">
      {/* Background Forest */}
      <rect width="200" height="200" fill="url(#forestGrad)" />
      
      {/* Trees (Layered for Depth) */}
      <g opacity="0.4" filter="blur(3px)">
        <path d="M40 200 Q50 100 60 200" fill="#0D0704" />
        <path d="M120 200 Q140 80 160 200" fill="#0D0704" />
        <path d="M10 200 Q25 150 40 200" fill="#0D0704" />
      </g>

      {/* Sunlight Bloom */}
      <circle cx="30" cy="30" r="100" fill="url(#sunBloom)" />

      {/* Character Head Group - Centered for Bot Icon */}
      <motion.g 
        filter="url(#rimGlow)"
        transform="translate(0, 35)"
        animate={{ y: [35, 33, 35] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Wolf Head */}
        <g>
          {/* Ears with Rim Highlights */}
          <g>
            <path d="M45 45 L30 -10 L85 30 Z" fill="#4B5563" />
            <path d="M155 45 L170 -10 L115 30 Z" fill="#4B5563" />
            <path d="M48 42 L35 5 L80 30 Z" fill="#9CA3AF" />
            <path d="M152 42 L165 5 L120 30 Z" fill="#9CA3AF" />
            <path d="M38 -5 Q33 5 36 15" stroke="#FBBF24" strokeWidth="1" opacity="0.4" fill="none" />
          </g>

          {/* Main Face Shape */}
          <path 
            d="M100 15 
               C125 15, 150 30, 160 55 
               C165 80, 155 100, 135 110 
               Q100 125, 65 110 
               C45 100, 35 80, 40 55 
               C50 30, 75 15, 100 15 Z" 
            fill="url(#faceVolume)" 
          />
          
          {/* Cheek Fur Tufts */}
          <path d="M40 65 L25 78 L42 80 Z" fill="#9CA3AF" />
          <path d="M38 85 L22 98 L44 98 Z" fill="#9CA3AF" />
          <path d="M160 65 L175 78 L158 80 Z" fill="#9CA3AF" />
          <path d="M162 85 L178 98 L156 98 Z" fill="#9CA3AF" />

          {/* Eyes (Glassy Collectible Detail) */}
          <g>
            <circle cx="75" cy="70" r="13" fill="white" />
            <circle cx="125" cy="70" r="13" fill="white" />
            
            {/* Iris */}
            <circle cx="75" cy="70" r="8.5" fill="#B45309" />
            <circle cx="125" cy="70" r="8.5" fill="#B45309" />
            
            {/* Pupil */}
            <circle cx="75" cy="70" r="5" fill="#111827" />
            <circle cx="125" cy="70" r="5" fill="#111827" />
            
            {/* Professional Reflection */}
            <circle cx="72" cy="67" r="3.5" fill="white" opacity="0.8" />
            <circle cx="122" cy="67" r="3.5" fill="white" opacity="0.8" />
          </g>

          {/* Brows */}
          <path d="M55 52 C60 42 85 45 92 60" stroke="#111827" strokeWidth="9" strokeLinecap="round" />
          <path d="M145 52 C140 42 115 45 108 60" stroke="#111827" strokeWidth="9" strokeLinecap="round" />

          {/* Muzzle */}
          <g transform="translate(100, 88)">
            <path d="M-30 0 C-30 20, 30 20, 30 0 Q0 -10, -30 0 Z" fill="#D1D5DB" />
            {/* Nose */}
            <path d="M-10 4 C-10 -1, 10 -1, 10 4 Q0 13, -10 4 Z" fill="#0F172A" />
            <circle cx="-3" cy="2" r="1" fill="white" opacity="0.2" />
            {/* Smirk */}
            <path d="M-20 12 Q0 18, 24 8 Q27 6, 26 2" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </motion.g>

      {/* Dust particles for atmosphere */}
      <g opacity="0.2">
        <circle cx="40" cy="50" r="0.5" fill="white" />
        <circle cx="160" cy="120" r="0.7" fill="#FBBF24" />
        <circle cx="30" cy="140" r="0.4" fill="white" />
        <circle cx="180" cy="80" r="1.2" fill="white" />
      </g>
    </g>

    {/* Frame Rim Light (Outer) */}
    <circle cx="100" cy="100" r="98" stroke="white" strokeWidth="2" strokeOpacity="0.2" fill="none" />
    <circle cx="100" cy="100" r="95" stroke="#FBBF24" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
  </svg>
);
