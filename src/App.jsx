import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Play, Pause, Check, Plus, X, Edit3, Sprout, Sun, Moon, ZoomIn, ZoomOut,
  Compass, Sparkles, AlertTriangle, Calendar, Clock, Layers, RotateCcw,
  Users, UserPlus, Copy, LogIn, LogOut, User
} from 'lucide-react';

// ============================================================================
// 1. НАСТРОЙКИ БАЗЫ ДАННЫХ SUPABASE
// ============================================================================
const FALLBACK_SUPABASE_URL = ""; 
const FALLBACK_SUPABASE_KEY = ""; 

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// ============================================================================
// 2. ЭВОЛЮЦИЯ РАСТЕНИЙ (6 БОТАНИЧЕСКИХ СТУПЕНЕЙ ОТ РОСТКА ДО ВЕКОВОГО ДУБА)
// ============================================================================
const PLANT_STAGES = [
  { id: 'sprout', name: 'Росток росы', thresholdLabel: '< 5 мин', minSeconds: 0, color: '#6ee7b7', scale: 0.72, interactRadius: 36 },
  { id: 'clover', name: 'Четырёхлистный клевер', thresholdLabel: '5 – 30 мин', minSeconds: 5 * 60, color: '#34d399', scale: 0.85, interactRadius: 40 },
  { id: 'buttercup', name: 'Полевой лютик', thresholdLabel: '30 мин – 2 ч', minSeconds: 30 * 60, color: '#fbbf24', scale: 0.98, interactRadius: 44 },
  { id: 'lotus', name: 'Сияющий лотос', thresholdLabel: '2 – 20 ч', minSeconds: 2 * 3600, color: '#f472b6', scale: 1.15, interactRadius: 50 },
  { id: 'pine', name: 'Северная сосна', thresholdLabel: '20 – 100 ч', minSeconds: 20 * 3600, color: '#10b981', scale: 1.5, interactRadius: 60 },
  { id: 'oak', name: 'Вековой дуб', thresholdLabel: '100+ ч', minSeconds: 100 * 3600, color: '#fde047', scale: 1.95, interactRadius: 78 }
];

const getPlantStage = (totalSeconds) => {
  for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
    if (totalSeconds >= PLANT_STAGES[i].minSeconds) return PLANT_STAGES[i];
  }
  return PLANT_STAGES[0];
};

// ============================================================================
// 3. ВЫСОКОДЕТАЛИЗИРОВАННАЯ БОТАНИЧЕСКАЯ SVG-ИЛЛЮСТРАЦИЯ
// ============================================================================
const DetailedPlantSVG = ({ stageKey = 'sprout', isFocusing = false, isPaused = false, size = 'md' }) => {
  const stageObj = PLANT_STAGES.find((s) => s.id === stageKey) || PLANT_STAGES[0];
  const isWithered = stageKey === 'withered';
  const isTree = stageKey === 'pine' || stageKey === 'oak';

  const sizeMap = {
    xs: 'w-11 h-11',
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
    xl: 'w-80 h-80'
  };

  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  return (
    <div
      className={`relative flex items-center justify-center select-none transition-all duration-700 ${sizeMap[size] || sizeMap.md}`}
      style={{
        filter: isWithered ? 'saturate(15%) brightness(65%) contrast(95%)' : isPaused ? 'saturate(40%) brightness(75%)' : 'none',
        transform: isWithered ? 'rotate(8deg) scale(0.92)' : isPaused ? 'rotate(4deg) scale(0.96)' : 'scale(1)'
      }}
    >
      <div
        className={`absolute inset-4 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${isFocusing && !isPaused ? 'opacity-30 scale-110' : 'opacity-15 scale-95'}`}
        style={{ backgroundColor: isWithered ? '#52525b' : isPaused ? '#f59e0b' : stageObj.color }}
      />
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`soil-${uid}`} x1="120" y1="194" x2="120" y2="225" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="55%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#06090e" />
          </linearGradient>
          <linearGradient id={`moss-${uid}`} x1="70" y1="192" x2="170" y2="212" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id={`stem-${uid}`} x1="120" y1="205" x2="120" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id={`leaf-lit-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="45%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id={`leaf-deep-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <radialGradient id={`dew-${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.65" />
          </radialGradient>
          <radialGradient id={`buttercup-petal-${uid}`} cx="50%" cy="65%" r="65%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#fef9c3" />
          </radialGradient>
          <linearGradient id={`lotus-outer-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="28%" stopColor="#f472b6" />
            <stop offset="75%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#831843" />
          </linearGradient>
          <linearGradient id={`lotus-inner-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fbcfe8" />
            <stop offset="70%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#9d174d" />
          </linearGradient>
          <radialGradient id={`lotus-core-${uid}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <linearGradient id={`lilypad-${uid}`} x1="60" y1="190" x2="180" y2="215" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="55%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id={`bark-${uid}`} x1="95" y1="100" x2="145" y2="205" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="45%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#3b1908" />
          </linearGradient>
          <linearGradient id={`oak-bark-${uid}`} x1="85" y1="90" x2="155" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="35%" stopColor="#713f12" />
            <stop offset="75%" stopColor="#422006" />
            <stop offset="100%" stopColor="#271203" />
          </linearGradient>
          <linearGradient id={`pine-top-${uid}`} x1="120" y1="26" x2="120" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id={`pine-mid-${uid}`} x1="120" y1="65" x2="120" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="55%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id={`pine-low-${uid}`} x1="120" y1="110" x2="120" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <radialGradient id={`oak-canopy-sun-${uid}`} cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="35%" stopColor="#34d399" />
            <stop offset="75%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>
          <radialGradient id={`oak-canopy-mid-${uid}`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="85%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </radialGradient>
          <radialGradient id={`oak-canopy-shade-${uid}`} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="65%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </radialGradient>
          <radialGradient id={`hollow-glow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
        </defs>

        <g>
          <ellipse cx="120" cy="212" rx={isTree ? 72 : 54} ry={isTree ? 13 : 10} fill="#05080c" opacity="0.75" />
          {stageKey === 'lotus' ? (
            <g>
              <ellipse cx="120" cy="206" rx="68" ry="14" fill="#083344" opacity="0.65" />
              <ellipse cx="120" cy="206" rx="62" ry="11.5" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.35" className={isFocusing && !isPaused ? 'animate-ripple-pulse' : ''} />
              <ellipse cx="120" cy="206" rx="48" ry="8.5" stroke="#67e8f9" strokeWidth="1" strokeOpacity="0.45" />
              <path d="M120 205 L168 199 C180 203, 174 214, 146 216 C115 218, 72 216, 64 206 C58 197, 86 193, 120 194 C138 194, 154 196, 162 197 Z" fill={`url(#lilypad-${uid})`} stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />
              <path d="M120 204 L82 201 M120 204 L94 211 M120 204 L132 213 M120 204 L152 206 M120 204 L102 196" stroke="#6ee7b7" strokeWidth="0.9" strokeOpacity="0.35" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d={isTree ? 'M52 210 C58 192, 92 188, 120 188 C148 188, 182 192, 188 210 C172 218, 68 218, 52 210 Z' : 'M68 209 C74 195, 96 192, 120 192 C144 192, 166 195, 172 209 C156 216, 84 216, 68 209 Z'} fill={`url(#soil-${uid})`} stroke="#1e293b" strokeWidth="1.2" />
              <path d={isTree ? 'M64 205 C78 193, 104 191, 125 192 C148 193, 168 196, 176 205 C158 209, 82 209, 64 205 Z' : 'M78 205 C88 196, 108 195, 124 195 C140 195, 154 198, 162 205 C146 208, 94 208, 78 205 Z'} fill={`url(#moss-${uid})`} opacity={isWithered ? 0.35 : 0.9} />
              <ellipse cx={isTree ? 74 : 84} cy="207" rx="6.5" ry="3.8" fill="#334155" />
              <ellipse cx={isTree ? 73 : 83} cy="206" rx="4.5" ry="2.2" fill="#64748b" opacity="0.6" />
              <ellipse cx={isTree ? 164 : 154} cy="208" rx="5.5" ry="3.2" fill="#1e293b" />
              <ellipse cx="144" cy="209" rx="3.5" ry="2" fill="#475569" />
              {!isWithered && (
                <g stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.75">
                  <path d="M88 203 Q84 195 81 192" />
                  <path d="M91 204 Q90 196 93 193" />
                  <path d="M150 204 Q154 196 158 193" />
                  <path d="M147 205 Q148 198 145 194" />
                </g>
              )}
            </g>
          )}
        </g>

        {isWithered && (
          <g className="transition-all duration-700">
            <path d="M120 202 C120 175, 126 145, 148 135 C162 128, 170 138, 166 148" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
            <path d="M126 168 C108 164, 96 172, 102 180 C108 184, 120 176, 126 168 Z" fill="#57534e" />
            <path d="M138 148 C154 146, 164 156, 156 163 C149 167, 141 156, 138 148 Z" fill="#78716c" />
            <ellipse cx="166" cy="152" rx="7" ry="10" transform="rotate(35 166 152)" fill="#a8a29e" />
            <ellipse cx="105" cy="207" rx="5" ry="2.2" transform="rotate(-15 105 207)" fill="#a8a29e" opacity="0.7" />
            <ellipse cx="136" cy="208" rx="4.5" ry="2" transform="rotate(20 136 208)" fill="#78716c" opacity="0.7" />
          </g>
        )}

        {stageKey === 'sprout' && (
          <g className="origin-[120px_202px] animate-sway-stem">
            <path d="M120 202 C119 178, 114 152, 120 124" stroke={`url(#stem-${uid})`} strokeWidth="4.2" strokeLinecap="round" />
            <path d="M120 126 C117 116, 120 109, 122 106 C124 110, 124 118, 120 126 Z" fill="#a7f3d0" />
            <g className="origin-[119px_136px] animate-sway-leaf">
              <path d="M119 136 C102 132, 82 120, 86 106 C90 94, 112 106, 119 132 Z" fill={`url(#leaf-deep-${uid})`} />
              <path d="M118 134 C106 124, 96 116, 89 108" stroke="#a7f3d0" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.75" />
              <path d="M107 125 L99 124 M101 119 L94 117 M105 121 L106 114" stroke="#6ee7b7" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.6" />
            </g>
            <g className="origin-[120px_126px] animate-sway-branch">
              <path d="M120 126 C136 118, 162 108, 162 124 C162 138, 136 138, 120 126 Z" fill={`url(#leaf-lit-${uid})`} />
              <path d="M121 126 C135 123, 148 122, 159 124" stroke="#ecfdf5" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.8" />
              <path d="M134 124 L139 119 M144 123 L149 119 M138 124 L143 129" stroke="#d1fae5" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.65" />
              <g className="origin-[161px_126px] animate-dew-shimmer">
                <path d="M161 124 C161 124, 166 130, 166 134 C166 137.2, 163.8 139.5, 161 139.5 C158.2 139.5, 156 137.2, 156 134 C156 130, 161 124, 161 124 Z" fill={`url(#dew-${uid})`} />
                <ellipse cx="159.5" cy="132.5" rx="1.4" ry="2.2" transform="rotate(-15 159.5 132.5)" fill="#ffffff" opacity="0.9" />
                <circle cx="162.5" cy="136.5" r="0.9" fill="#e0f2fe" opacity="0.8" />
              </g>
            </g>
          </g>
        )}

        {stageKey === 'clover' && (
          <g className="origin-[120px_202px] animate-sway-stem">
            <g className="origin-[98px_200px] animate-sway-leaf">
              <path d="M104 201 C98 182, 86 164, 82 144" stroke="#059669" strokeWidth="3.2" strokeLinecap="round" />
              {[0, 120, 240].map((deg) => (
                <g key={deg} transform={`translate(82, 144) rotate(${deg})`}>
                  <path d="M0 0 C-10 -6, -15 -18, -6 -21 C-2 -22, 0 -18, 0 -15 C0 -18, 2 -22, 6 -21 C15 -18, 10 -6, 0 0 Z" fill={`url(#leaf-deep-${uid})`} />
                  <path d="M-4 -11 L0 -7 L4 -11" stroke="#a7f3d0" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
                </g>
              ))}
              <circle cx="82" cy="144" r="2.2" fill="#d1fae5" />
            </g>
            <g className="origin-[138px_200px] animate-sway-branch">
              <path d="M134 201 C142 184, 152 168, 158 150" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
              {[30, 150, 270].map((deg) => (
                <g key={deg} transform={`translate(158, 150) rotate(${deg})`}>
                  <path d="M0 0 C-9 -5, -13 -16, -5 -19 C-1.5 -20, 0 -16, 0 -13.5 C0 -16, 1.5 -20, 5 -19 C13 -16, 9 -5, 0 0 Z" fill={`url(#leaf-lit-${uid})`} />
                  <path d="M-3.5 -10 L0 -6.5 L3.5 -10" stroke="#ecfdf5" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
                </g>
              ))}
              <circle cx="158" cy="150" r="2" fill="#ecfdf5" />
            </g>
            <g className="origin-[120px_202px] animate-sway-canopy-slow">
              <path d="M120 202 C118 170, 115 138, 120 105" stroke={`url(#stem-${uid})`} strokeWidth="4.2" strokeLinecap="round" />
              {[0, 90, 180, 270].map((deg, idx) => (
                <g key={deg} transform={`translate(120, 105) rotate(${deg})`}>
                  <path d="M0 0 C-15 -8, -24 -26, -9 -31 C-3 -33, 0 -27, 0 -23 C0 -27, 3 -33, 9 -31 C24 -26, 15 -8, 0 0 Z" fill={idx % 2 === 0 ? `url(#leaf-lit-${uid})` : `url(#leaf-deep-${uid})`} stroke="#6ee7b7" strokeWidth="0.6" strokeOpacity="0.4" />
                  <path d="M0 -2 L0 -22" stroke="#064e3b" strokeWidth="1" strokeOpacity="0.35" />
                  <path d="M-7 -15 L0 -9 L7 -15" stroke="#d1fae5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </g>
              ))}
              <circle cx="120" cy="105" r="3.2" fill="#ecfdf5" />
              <circle cx="128" cy="86" r="3" fill={`url(#dew-${uid})`} />
              <circle cx="127" cy="85" r="1" fill="#ffffff" />
            </g>
          </g>
        )}

        {stageKey === 'buttercup' && (
          <g className="origin-[120px_202px] animate-sway-stem">
            <g className="origin-[120px_195px] animate-sway-leaf">
              <path d="M118 196 C96 188, 72 176, 68 158 C78 158, 86 164, 90 160 C86 150, 94 144, 102 154 C106 162, 114 178, 118 196 Z" fill={`url(#leaf-deep-${uid})`} />
              <path d="M122 196 C144 188, 168 176, 172 158 C162 158, 154 164, 150 160 C154 150, 146 144, 138 154 C134 162, 126 178, 122 196 Z" fill={`url(#leaf-lit-${uid})`} />
            </g>
            <g className="origin-[120px_168px] animate-sway-branch">
              <path d="M120 168 C138 154, 154 134, 162 108" stroke="#10b981" strokeWidth="3.2" strokeLinecap="round" />
              <g transform="translate(162, 108) rotate(22)">
                <path d="M0 2 C-10 -4, -12 -18, 0 -24 C12 -18, 10 -4, 0 2 Z" fill={`url(#buttercup-petal-${uid})`} />
                <path d="M-5 -2 C-9 -10, -4 -20, 0 -23 C4 -20, 9 -10, 5 -2 Z" fill="#fef08a" opacity="0.85" />
                <path d="M0 3 C-9 1, -11 -7, -6 -11 C-3 -5, -2 0, 0 3 Z" fill="#059669" />
                <path d="M0 3 C9 1, 11 -7, 6 -11 C3 -5, 2 0, 0 3 Z" fill="#10b981" />
              </g>
            </g>
            <g className="origin-[120px_202px] animate-sway-canopy-slow">
              <path d="M120 202 C116 164, 112 126, 114 84" stroke={`url(#stem-${uid})`} strokeWidth="4.5" strokeLinecap="round" />
              <path d="M115 142 C96 134, 84 120, 90 110 C98 112, 106 122, 115 136 Z" fill={`url(#leaf-lit-${uid})`} />
              <g transform="translate(114, 80)">
                <circle cx="0" cy="0" r="32" fill="#fbbf24" opacity="0.16" />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <path key={`outer-${deg}`} d="M0 0 C-14 -8, -19 -28, 0 -30 C19 -28, 14 -8, 0 0 Z" transform={`rotate(${deg})`} fill={`url(#buttercup-petal-${uid})`} stroke="#fde047" strokeWidth="0.6" />
                ))}
                {[30, 90, 150, 210, 270, 330].map((deg) => (
                  <path key={`inner-${deg}`} d="M0 0 C-11 -6, -15 -22, 0 -24 C15 -22, 11 -6, 0 0 Z" transform={`rotate(${deg})`} fill={`url(#buttercup-petal-${uid})`} opacity="0.95" />
                ))}
                <circle cx="0" cy="0" r="8" fill="#d97706" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <g key={`stamen-${deg}`} transform={`rotate(${deg})`}>
                    <line x1="0" y1="-6" x2="0" y2="-12" stroke="#fef08a" strokeWidth="1.2" />
                    <circle cx="0" cy="-12.5" r="1.8" fill="#fef9c3" />
                  </g>
                ))}
                <circle cx="0" cy="0" r="4.5" fill="#84cc16" />
              </g>
            </g>
          </g>
        )}

        {stageKey === 'lotus' && (
          <g className="origin-[120px_200px] animate-sway-stem">
            <circle cx="120" cy="148" r="54" fill="#f472b6" opacity="0.14" />
            {[-62, -36, 0, 36, 62].map((deg) => (
              <g key={`back-${deg}`} transform={`translate(120, 188) rotate(${deg})`}>
                <path d="M0 0 C-24 -22, -28 -68, 0 -92 C28 -68, 24 -22, 0 0 Z" fill={`url(#lotus-outer-${uid})`} stroke="#fbcfe8" strokeWidth="0.7" strokeOpacity="0.6" />
                <path d="M0 -8 L0 -84" stroke="#fdf2f8" strokeWidth="0.9" strokeOpacity="0.45" />
                <path d="M0 -35 Q-10 -55 -8 -72 M0 -35 Q10 -55 8 -72" stroke="#fdf2f8" strokeWidth="0.6" strokeOpacity="0.35" />
              </g>
            ))}
            {[-46, -20, 20, 46].map((deg) => (
              <g key={`mid-${deg}`} transform={`translate(120, 190) rotate(${deg})`}>
                <path d="M0 0 C-20 -18, -24 -58, 0 -78 C24 -58, 20 -18, 0 0 Z" fill={`url(#lotus-inner-${uid})`} stroke="#ffffff" strokeWidth="0.7" strokeOpacity="0.75" />
                <path d="M0 -10 L0 -70" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.5" />
              </g>
            ))}
            <g transform="translate(120, 152)">
              <ellipse cx="0" cy="0" rx="18" ry="12" fill={`url(#lotus-core-${uid})`} />
              {[-28, -18, -9, 0, 9, 18, 28].map((xOff, i) => (
                <g key={i}>
                  <line x1={xOff * 0.6} y1="2" x2={xOff * 0.85} y2={-12 - (i % 2) * 4} stroke="#fef08a" strokeWidth="1.3" />
                  <circle cx={xOff * 0.85} cy={-13 - (i % 2) * 4} r="2" fill="#ffffff" />
                </g>
              ))}
            </g>
            {[-26, 0, 26].map((deg) => (
              <g key={`front-${deg}`} transform={`translate(120, 194) rotate(${deg})`}>
                <path d="M0 0 C-18 -14, -20 -44, 0 -62 C20 -44, 18 -14, 0 0 Z" fill={`url(#lotus-inner-${uid})`} stroke="#ffffff" strokeWidth="0.8" />
              </g>
            ))}
            <path d="M120 196 C95 198, 76 190, 70 180 C88 182, 105 188, 120 196 Z" fill="#10b981" />
            <path d="M120 196 C145 198, 164 190, 170 180 C152 182, 135 188, 120 196 Z" fill="#059669" />
            {!isWithered && (
              <g className="animate-float-pollen">
                <circle cx="96" cy="112" r="2.2" fill="#a5f3fc" opacity="0.85" />
                <circle cx="144" cy="104" r="2.5" fill="#fef08a" opacity="0.9" />
                <circle cx="120" cy="86" r="1.8" fill="#fbcfe8" opacity="0.8" />
              </g>
            )}
          </g>
        )}

        {stageKey === 'pine' && (
          <g className="origin-[120px_202px] animate-sway-stem">
            <path d="M96 205 C106 196, 110 175, 113 90 L127 90 C130 175, 134 196, 144 205 C132 203, 126 198, 120 202 C114 198, 108 203, 96 205 Z" fill={`url(#bark-${uid})`} />
            <path d="M117 115 L115 192 M122 128 L124 188 M119 155 L118 198" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <g className="origin-[120px_140px] animate-sway-leaf">
              <path d="M120 112 C94 136, 68 154, 48 166 C66 170, 82 164, 92 172 C104 166, 114 168, 120 174 C126 168, 136 166, 148 172 C158 164, 174 170, 192 166 C172 154, 146 136, 120 112 Z" fill={`url(#pine-low-${uid})`} />
              <ellipse cx="82" cy="168" rx="4.5" ry="7" transform="rotate(12 82 168)" fill="#78350f" stroke="#b45309" strokeWidth="0.8" />
              <ellipse cx="158" cy="167" rx="4.5" ry="7" transform="rotate(-12 158 167)" fill="#78350f" stroke="#b45309" strokeWidth="0.8" />
            </g>
            <g className="origin-[120px_115px] animate-sway-branch">
              <path d="M120 88 C96 112, 74 128, 56 140 C74 144, 88 138, 98 146 C108 140, 114 142, 120 148 C126 142, 132 140, 142 146 C152 138, 166 144, 184 140 C166 128, 144 112, 120 88 Z" fill={`url(#pine-mid-${uid})`} />
              <path d="M72 136 L62 139 M88 138 L82 142 M152 138 L158 142 M168 136 L178 139" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
            </g>
            <g className="origin-[120px_90px] animate-sway-canopy-slow">
              <path d="M120 64 C100 86, 82 102, 66 114 C82 117, 94 112, 102 119 C110 114, 115 116, 120 120 C125 116, 130 114, 138 119 C146 112, 158 117, 174 114 C158 102, 140 86, 120 64 Z" fill={`url(#pine-mid-${uid})`} />
              <ellipse cx="144" cy="117" rx="3.8" ry="6" transform="rotate(-8 144 117)" fill="#78350f" stroke="#d97706" strokeWidth="0.7" />
            </g>
            <g className="origin-[120px_65px] animate-sway-canopy-fast">
              <path d="M120 42 C104 62, 90 76, 78 88 C90 90, 100 86, 108 92 C114 88, 117 90, 120 94 C123 90, 126 88, 132 92 C140 86, 150 90, 162 88 C150 76, 136 62, 120 42 Z" fill={`url(#pine-top-${uid})`} />
            </g>
            <g className="origin-[120px_45px] animate-sway-canopy-fast">
              <path d="M120 20 C110 38, 100 52, 90 62 C102 64, 112 60, 120 66 C128 60, 138 64, 150 62 C140 52, 130 38, 120 20 Z" fill={`url(#pine-top-${uid})`} />
              <path d="M120 22 L106 48 M120 22 L134 48 M120 22 L120 52" stroke="#d1fae5" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
            </g>
          </g>
        )}

        {stageKey === 'oak' && (
          <g className="origin-[120px_204px] animate-sway-stem">
            <circle cx="120" cy="96" r="78" fill="#fbbf24" opacity="0.11" />
            <g className="origin-[120px_110px] animate-sway-canopy-slow">
              <circle cx="62" cy="112" r="34" fill={`url(#oak-canopy-shade-${uid})`} />
              <circle cx="178" cy="112" r="34" fill={`url(#oak-canopy-shade-${uid})`} />
              <circle cx="120" cy="64" r="42" fill={`url(#oak-canopy-shade-${uid})`} />
            </g>
            <path d="M72 206 C90 200, 98 184, 100 154 C101 134, 96 122, 74 106 L84 98 C104 112, 109 122, 112 110 L128 110 C131 122, 138 112, 158 96 L166 104 C144 120, 139 134, 140 154 C142 184, 150 200, 168 206 C152 205, 142 198, 134 204 C126 198, 114 198, 106 204 C98 198, 88 205, 72 206 Z" fill={`url(#oak-bark-${uid})`} />
            <path d="M108 122 C106 148, 102 174, 92 198 M132 124 C134 150, 138 176, 148 198 M118 118 L116 144 M124 168 L122 198" stroke="#271203" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            <ellipse cx="120" cy="156" rx="7.5" ry="11" fill="#271203" />
            <ellipse cx="120" cy="157" rx="5.5" ry="8.5" fill={`url(#hollow-glow-${uid})`} />
            <g transform="translate(88, 198)">
              <rect x="-1.5" y="0" width="3" height="5" rx="1" fill="#fde68a" />
              <path d="M-5 1 C-5 -4, 5 -4, 5 1 Z" fill="#f59e0b" />
              <circle cx="-1.5" cy="-1" r="0.8" fill="#fef3c7" />
              <circle cx="2" cy="-0.5" r="0.7" fill="#fef3c7" />
            </g>
            <g transform="translate(154, 200) scale(0.85)">
              <rect x="-1.5" y="0" width="3" height="5" rx="1" fill="#fde68a" />
              <path d="M-5 1 C-5 -4, 5 -4, 5 1 Z" fill="#ea580c" />
            </g>
            <g className="origin-[120px_95px] animate-sway-branch">
              <circle cx="76" cy="92" r="35" fill={`url(#oak-canopy-mid-${uid})`} />
              <circle cx="164" cy="92" r="35" fill={`url(#oak-canopy-mid-${uid})`} />
              <circle cx="96" cy="64" r="37" fill={`url(#oak-canopy-mid-${uid})`} />
              <circle cx="144" cy="64" r="37" fill={`url(#oak-canopy-mid-${uid})`} />
              <circle cx="120" cy="52" r="40" fill={`url(#oak-canopy-sun-${uid})`} />
              <circle cx="92" cy="98" r="31" fill={`url(#oak-canopy-sun-${uid})`} />
              <circle cx="148" cy="98" r="31" fill={`url(#oak-canopy-mid-${uid})`} />
              <circle cx="120" cy="88" r="36" fill={`url(#oak-canopy-sun-${uid})`} />
              <path d="M62 84 Q70 76 80 82 M154 78 Q166 72 174 82 M104 42 Q120 34 136 42 M84 108 Q96 102 108 108" stroke="#bef264" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
              {[
                { x: 74, y: 108 }, { x: 162, y: 106 }, { x: 102, y: 74 }, { x: 142, y: 78 }, { x: 120, y: 56 }
              ].map((ac, idx) => (
                <g key={idx} transform={`translate(${ac.x}, ${ac.y})`}>
                  <ellipse cx="0" cy="3" rx="3.8" ry="5" fill="#fbbf24" />
                  <ellipse cx="-1" cy="2.5" rx="1.2" ry="2.5" fill="#fef08a" opacity="0.8" />
                  <path d="M-4.5 1 C-4.5 -2.5, 4.5 -2.5, 4.5 1 Z" fill="#78350f" />
                  <line x1="0" y1="-2" x2="0" y2="-4.5" stroke="#78350f" strokeWidth="1.2" />
                </g>
              ))}
            </g>
            {!isWithered && (
              <g className="animate-float-pollen">
                <ellipse cx="52" cy="138" rx="4" ry="2" transform="rotate(-25 52 138)" fill="#a3e635" opacity="0.85" />
                <ellipse cx="186" cy="132" rx="4" ry="2" transform="rotate(30 186 132)" fill="#34d399" opacity="0.85" />
                <circle cx="84" cy="44" r="2.2" fill="#fef08a" opacity="0.9" />
                <circle cx="158" cy="48" r="2" fill="#fef08a" opacity="0.85" />
              </g>
            )}
          </g>
        )}

        {isFocusing && !isPaused && !isWithered && (
          <g className="animate-float-pollen">
            <circle cx="76" cy="146" r="1.8" fill="#a7f3d0" opacity="0.75" />
            <circle cx="164" cy="138" r="2.2" fill="#fde047" opacity="0.8" />
            <circle cx="112" cy="68" r="1.6" fill="#ffffff" opacity="0.7" />
            <circle cx="136" cy="92" r="2" fill="#6ee7b7" opacity="0.75" />
          </g>
        )}
      </svg>
    </div>
  );
};

const PlantArtwork = ({ totalSeconds = 0, stageKey, isPaused = false, size = 'md', animate = false }) => {
  const resolvedKey = stageKey || getPlantStage(totalSeconds).id;
  return <DetailedPlantSVG stageKey={resolvedKey} isFocusing={animate} isPaused={isPaused} size={size} />;
};

// ============================================================================
// 4. НАЧАЛЬНЫЕ ДАННЫЕ И УТИЛИТЫ ФОРМАТИРОВАНИЯ
// ============================================================================
const INITIAL_MEADOWS = [
  { id: 'meadow-science', name: 'Учёба и Наука', x: 0, y: 0, radius: 235, themeColor: '#10b981' },
  { id: 'meadow-code', name: 'Проекты и Код', x: 560, y: -90, radius: 220, themeColor: '#8b5cf6' },
  { id: 'meadow-life', name: 'Дом и Гармония', x: -540, y: 110, radius: 210, themeColor: '#f59e0b' }
];

const INITIAL_TASKS = [
  {
    id: 'goal-active-1',
    title: 'Домашнее задание по матану (листок №5)',
    meadowId: 'meadow-science',
    status: 'active',
    totalSeconds: 48 * 60,
    sessionsCount: 2,
    createdAt: '2026-11-11T09:30:00.000Z',
    completedAt: null,
    contributions: []
  },
  {
    id: 'goal-done-oak',
    title: 'Ежедневное чтение научных статей',
    meadowId: 'meadow-science',
    status: 'completed',
    totalSeconds: 115 * 3600,
    sessionsCount: 347,
    createdAt: '2025-09-12T08:00:00.000Z',
    completedAt: '2026-11-10T20:15:00.000Z',
    offsetX: -60,
    offsetY: -35,
    contributions: []
  }
];

const formatClock = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDurationRu = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hours > 0) return `${hours} ч ${mins > 0 ? `${mins} мин` : ''}`.trim();
  if (mins > 0) return `${mins} мин ${secs > 0 && mins < 10 ? `${secs} с` : ''}`.trim();
  return `${secs} сек`;
};

const formatDateRu = (isoString) => {
  if (!isoString) return 'В процессе';
  return new Date(isoString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getPlantCoordinatesOnMeadow = (plant, indexOnMeadow, totalOnMeadow, meadow) => {
  if (typeof plant.offsetX === 'number' && typeof plant.offsetY === 'number') {
    return { x: meadow.x + plant.offsetX, y: meadow.y + plant.offsetY };
  }
  const goldenAngle = 2.399963229728653;
  const angle = indexOnMeadow * goldenAngle + 0.5;
  const maxR = (meadow.radius || 210) - 65;
  const r = Math.min(maxR, 52 + Math.sqrt(indexOnMeadow + 1) * 44);
  return { x: meadow.x + Math.cos(angle) * r, y: meadow.y + Math.sin(angle) * r * 0.78 };
};

// ============================================================================
// 5. БАРАБАН ВРЕМЕНИ И ВВОД ЦИФРАМИ
// ============================================================================
const DrumWheelColumn = ({ values, selectedValue, onChange, unitLabel, accent = 'emerald' }) => {
  const scrollRef = useRef(null);
  const ITEM_HEIGHT = 36;
  const timeoutRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = values.indexOf(selectedValue);
    if (idx !== -1) {
      const targetTop = idx * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - targetTop) > 2) {
        isProgrammaticScroll.current = true;
        el.scrollTo({ top: targetTop, behavior: 'smooth' });
        setTimeout(() => { isProgrammaticScroll.current = false; }, 180);
      }
    }
  }, [selectedValue, values]);

  const handleScroll = (e) => {
    if (isProgrammaticScroll.current) return;
    const top = e.currentTarget.scrollTop;
    const idx = Math.min(values.length - 1, Math.max(0, Math.round(top / ITEM_HEIGHT)));
    const val = values[idx];
    if (val !== undefined && val !== selectedValue) onChange(val);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    }, 120);
  };

  const handleWheelStep = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    const curIdx = values.indexOf(selectedValue);
    const nextIdx = Math.min(values.length - 1, Math.max(0, curIdx + dir));
    onChange(values[nextIdx]);
  };

  const activeTextClass = accent === 'amber' ? 'text-amber-100' : 'text-zinc-100';
  const unitTextClass = accent === 'amber' ? 'text-amber-300/60' : 'text-emerald-400/70';

  return (
    <div className="relative h-[108px] w-24 select-none overflow-hidden" onWheel={handleWheelStep}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ scrollSnapType: 'y mandatory', paddingTop: `${ITEM_HEIGHT}px`, paddingBottom: `${ITEM_HEIGHT}px` }}
        className="h-full overflow-y-scroll no-scrollbar"
      >
        {values.map((v) => {
          const isSelected = v === selectedValue;
          return (
            <div
              key={v}
              onClick={() => onChange(v)}
              style={{ height: `${ITEM_HEIGHT}px`, scrollSnapAlign: 'center' }}
              className={`flex items-center justify-center gap-1 font-mono cursor-pointer transition-all duration-150 ${
                isSelected ? `${activeTextClass} text-xl font-medium scale-105 opacity-100` : 'text-zinc-600 text-sm scale-90 opacity-45 hover:opacity-75'
              }`}
            >
              <span>{String(v).padStart(2, '0')}</span>
              <span className={`text-[10px] font-sans font-normal ${isSelected ? unitTextClass : 'text-zinc-700'}`}>{unitLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimerDurationPicker = ({ totalMinutes, onChangeMinutes, accent = 'emerald' }) => {
  const [inputMode, setInputMode] = useState('drum'); 
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const [hoursStr, setHoursStr] = useState(String(hours).padStart(2, '0'));
  const [minsStr, setMinsStr] = useState(String(minutes).padStart(2, '0'));

  useEffect(() => {
    setHoursStr(String(Math.floor(totalMinutes / 60)).padStart(2, '0'));
    setMinsStr(String(totalMinutes % 60).padStart(2, '0'));
  }, [totalMinutes]);

  const hourValues = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []);
  const minuteValues = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const applyHoursAndMinutes = (h, m) => {
    const cleanH = Math.min(12, Math.max(0, Number.isNaN(h) ? 0 : h));
    const cleanM = Math.min(59, Math.max(0, Number.isNaN(m) ? 0 : m));
    onChangeMinutes(Math.max(1, cleanH * 60 + cleanM));
  };

  const commitDigitsInput = () => {
    applyHoursAndMinutes(parseInt(hoursStr, 10) || 0, parseInt(minsStr, 10) || 0);
  };

  const borderFocusClass = accent === 'amber' ? 'focus:border-amber-400/60' : 'focus:border-emerald-500/60';
  const badgeTextClass = accent === 'amber' ? 'text-amber-200/90' : 'text-emerald-300/90';

  return (
    <div className="flex flex-col items-center gap-2.5 my-1">
      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        <button
          type="button"
          onClick={() => setInputMode('drum')}
          className={`px-2.5 py-0.5 rounded-lg transition-colors ${inputMode === 'drum' ? 'bg-zinc-800/90 text-zinc-200' : 'hover:text-zinc-300'}`}
        >
          Барабан
        </button>
        <span className="text-zinc-700">•</span>
        <button
          type="button"
          onClick={() => setInputMode('digits')}
          className={`px-2.5 py-0.5 rounded-lg transition-colors ${inputMode === 'digits' ? 'bg-zinc-800/90 text-zinc-200' : 'hover:text-zinc-300'}`}
        >
          Ввод цифрами
        </button>
      </div>

      {inputMode === 'drum' ? (
        <div className="relative flex items-center justify-center px-5 py-1 rounded-2xl bg-[#0b0e13] border border-zinc-800/80 shadow-inner">
          <div className="pointer-events-none absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 h-[36px] rounded-xl bg-zinc-800/40 border border-zinc-700/40" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-2xl bg-gradient-to-b from-[#08090c] via-[#08090c]/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-2xl bg-gradient-to-t from-[#08090c] via-[#08090c]/80 to-transparent z-10" />

          <DrumWheelColumn values={hourValues} selectedValue={hours} onChange={(newH) => applyHoursAndMinutes(newH, minutes)} unitLabel="ч" accent={accent} />
          <div className="text-zinc-500 font-mono text-lg pb-0.5 px-1 z-20">:</div>
          <DrumWheelColumn values={minuteValues} selectedValue={minutes} onChange={(newM) => applyHoursAndMinutes(hours, newM)} unitLabel="мин" accent={accent} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 bg-[#0b0e13] border border-zinc-800/80 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-2 font-mono">
            <div className="flex flex-col items-center">
              <input
                type="number" min="0" max="12" value={hoursStr}
                onChange={(e) => { setHoursStr(e.target.value); applyHoursAndMinutes(parseInt(e.target.value, 10) || 0, parseInt(minsStr, 10) || 0); }}
                onBlur={commitDigitsInput}
                className={`w-16 bg-zinc-950 border border-zinc-800 ${borderFocusClass} rounded-xl py-2 text-center text-2xl text-zinc-100 focus:outline-none`}
              />
              <span className="text-[10px] text-zinc-500 font-sans mt-1">часы</span>
            </div>
            <span className="text-2xl text-zinc-600 -mt-4">:</span>
            <div className="flex flex-col items-center">
              <input
                type="number" min="0" max="59" value={minsStr}
                onChange={(e) => { setMinsStr(e.target.value); applyHoursAndMinutes(parseInt(hoursStr, 10) || 0, parseInt(e.target.value, 10) || 0); }}
                onBlur={commitDigitsInput}
                className={`w-16 bg-zinc-950 border border-zinc-800 ${borderFocusClass} rounded-xl py-2 text-center text-2xl text-zinc-100 focus:outline-none`}
              />
              <span className="text-[10px] text-zinc-500 font-sans mt-1">минуты</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
        {[15, 25, 45, 60, 90].map((preset) => (
          <button
            key={preset} type="button" onClick={() => onChangeMinutes(preset)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              totalMinutes === preset ? `bg-zinc-800/90 border-zinc-700 ${badgeTextClass}` : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/70 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {preset >= 60 ? `${Math.floor(preset / 60)}ч${preset % 60 ? ` ${preset % 60}м` : ''}` : `${preset}м`}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 6. ИНТЕРАКТИВНЫЙ 2.5D МУЛЬТЯШНЫЙ САД С REALTIME-МУЛЬТИПЛЕЕРОМ
// ============================================================================
const CartoonGardenWorld = ({
  meadows,
  plants,
  onSelectPlant,
  onOpenNewMeadowModal,
  onDeleteMeadow,
  showGrowingPlants,
  setShowGrowingPlants,
  roomCode,
  currentProfile
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isNight, setIsNight] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [nearbyPlant, setNearbyPlant] = useState(null);
  const [hoveredPlant, setHoveredPlant] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);

  const worldStateRef = useRef({
    player: { x: 0, y: 95, vx: 0, vy: 0, speed: 235, facing: 1, walkPhase: 0, targetX: null, targetY: null },
    peers: {}, // Другие люди, гуляющие в этом же саду в реальном времени
    camera: { x: 0, y: 60 },
    keys: {},
    mouseScreen: { x: -9999, y: -9999 },
    clickRipples: [],
    particles: Array.from({ length: 40 }, () => ({
      x: (Math.random() - 0.5) * 1800,
      y: (Math.random() - 0.5) * 1000,
      size: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 18,
      speedY: -8 - Math.random() * 15,
      phase: Math.random() * Math.PI * 2
    }))
  });

  // REALTIME-СИНХРОНИЗАЦИЯ ИГРОКОВ В ОДНОМ САДУ
  useEffect(() => {
    if (!supabase || !roomCode || !currentProfile?.id) return;

    worldStateRef.current.peers = {};
    const channelName = `garden-room-${roomCode.toLowerCase()}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentProfile.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const activeIds = Object.keys(presenceState);
        setOnlineCount(Math.max(1, activeIds.length));

        // Удаляем отключившихся гостей
        Object.keys(worldStateRef.current.peers).forEach((pid) => {
          if (!activeIds.includes(pid)) {
            delete worldStateRef.current.peers[pid];
          }
        });

        // Добавляем новых гостей
        activeIds.forEach((pid) => {
          if (pid === currentProfile.id) return;
          const info = presenceState[pid]?.[0];
          if (info && !worldStateRef.current.peers[pid]) {
            worldStateRef.current.peers[pid] = {
              id: pid,
              username: info.username || 'Гость',
              x: info.x ?? 35,
              y: info.y ?? 105,
              targetX: info.x ?? 35,
              targetY: info.y ?? 105,
              facing: info.facing ?? 1,
              walkPhase: 0,
              coatColor: info.coatColor || '#7c3aed'
            };
          }
        });
      })
      .on('broadcast', { event: 'player-move' }, ({ payload }) => {
        if (!payload || payload.id === currentProfile.id) return;
        const existing = worldStateRef.current.peers[payload.id];
        if (!existing) {
          worldStateRef.current.peers[payload.id] = {
            id: payload.id,
            username: payload.username || 'Гость',
            x: payload.x,
            y: payload.y,
            targetX: payload.x,
            targetY: payload.y,
            facing: payload.facing || 1,
            walkPhase: 0,
            coatColor: payload.coatColor || '#7c3aed'
          };
        } else {
          existing.targetX = payload.x;
          existing.targetY = payload.y;
          existing.facing = payload.facing;
          existing.username = payload.username || existing.username;
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const p = worldStateRef.current.player;
          await channel.track({
            id: currentProfile.id,
            username: currentProfile.username || 'Хранитель',
            x: Math.round(p.x),
            y: Math.round(p.y),
            facing: p.facing,
            coatColor: '#6366f1'
          });
        }
      });

    // Отправляем свои координаты 12 раз в секунду при движении
    let lastSentX = null;
    let lastSentY = null;
    const broadcastTimer = setInterval(() => {
      const p = worldStateRef.current.player;
      if (lastSentX === null || Math.hypot(p.x - lastSentX, p.y - lastSentY) > 2) {
        lastSentX = p.x;
        lastSentY = p.y;
        channel.send({
          type: 'broadcast',
          event: 'player-move',
          payload: {
            id: currentProfile.id,
            username: currentProfile.username || 'Хранитель',
            x: Math.round(p.x),
            y: Math.round(p.y),
            facing: p.facing,
            coatColor: '#6366f1'
          }
        });
      }
    }, 80);

    return () => {
      clearInterval(broadcastTimer);
      supabase.removeChannel(channel);
    };
  }, [roomCode, currentProfile?.id, currentProfile?.username]);

  const placedPlants = useMemo(() => {
    const list = [];
    meadows.forEach((meadow) => {
      const mPlants = plants.filter((p) => (p.meadowId || meadows[0]?.id) === meadow.id);
      mPlants.forEach((p, idx) => {
        const coords = getPlantCoordinatesOnMeadow(p, idx, mPlants.length, meadow);
        const stage = getPlantStage(p.totalSeconds);
        list.push({ ...p, worldX: coords.x, worldY: coords.y, stage, meadowName: meadow.name });
      });
    });
    return list;
  }, [meadows, plants]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      const code = e.code;
      worldStateRef.current.keys[code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) e.preventDefault();
      if ((code === 'KeyE' || code === 'Space' || code === 'Enter') && nearbyPlant) onSelectPlant(nearbyPlant.id);
    };
    const handleKeyUp = (e) => { worldStateRef.current.keys[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyPlant, onSelectPlant]);

  const screenToWorld = useCallback((screenX, screenY, canvas) => {
    const cam = worldStateRef.current.camera;
    const cx = canvas.width / (window.devicePixelRatio || 1) / 2;
    const cy = canvas.height / (window.devicePixelRatio || 1) / 2;
    return { x: (screenX - cx) / zoom + cam.x, y: (screenY - cy) / zoom + cam.y };
  }, [zoom]);

  const handleCanvasPointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const worldPt = screenToWorld(sx, sy, canvas);

    let clickedPlant = null;
    let bestDist = Infinity;
    for (const p of placedPlants) {
      const dx = worldPt.x - p.worldX;
      const dy = worldPt.y - (p.worldY - 26 * p.stage.scale);
      const dist = Math.hypot(dx, dy);
      if (dist < p.stage.interactRadius && dist < bestDist) {
        bestDist = dist;
        clickedPlant = p;
      }
    }

    if (clickedPlant) {
      onSelectPlant(clickedPlant.id);
      return;
    }

    worldStateRef.current.player.targetX = worldPt.x;
    worldStateRef.current.player.targetY = worldPt.y;
    worldStateRef.current.clickRipples.push({ x: worldPt.x, y: worldPt.y, age: 0 });
  };

  const handleCanvasPointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    worldStateRef.current.mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const drawCanvasPlant = (ctx, plant, time, isHighlighted, isNightMode) => {
    const { worldX: x, worldY: y, stage, status } = plant;
    const s = stage.scale;
    const seed = (x * 0.13 + y * 0.07) % (Math.PI * 2);
    const sway = Math.sin(time * 2.0 + seed) * 3.2 * s;
    const secondarySway = Math.cos(time * 2.7 + seed * 1.7) * 2.2 * s;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = isNightMode ? 'rgba(3, 7, 14, 0.62)' : 'rgba(10, 36, 22, 0.34)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 25 * s, 9.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (stage.id !== 'lotus') {
      ctx.fillStyle = isNightMode ? '#064e3b' : '#047857';
      ctx.beginPath();
      ctx.ellipse(0, 2, 16 * s, 5.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(-10 * s, 4, 3 * s, 1.8 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(11 * s, 3, 2.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isHighlighted) {
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(0, 3, 30 * s, 12.5 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (status === 'active') {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 3, 27 * s, 10.5 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isNightMode || stage.id === 'lotus' || stage.id === 'oak') {
      const glowRadius = (isNightMode ? 56 : 36) * s;
      const glowGrad = ctx.createRadialGradient(0, -28 * s, 2, 0, -28 * s, glowRadius);
      glowGrad.addColorStop(0, isNightMode ? `${stage.color}55` : `${stage.color}26`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, -28 * s, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (stage.id === 'sprout') {
      const tipX = sway * 0.45;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(-3, -13, tipX, -26);
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(-8 + tipX, -23, 8.5, 4.5, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.ellipse(8 + tipX, -26, 9.5, 4.8, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (stage.id === 'clover') {
      const stems = [{ dx: -11, dy: 2, h: 20, leaves: 3 }, { dx: 11, dy: 2, h: 19, leaves: 3 }, { dx: 0, dy: -1, h: 29, leaves: 4 }];
      stems.forEach((st, idx) => {
        const topX = st.dx + sway * (0.35 + idx * 0.12);
        const topY = st.dy - st.h;
        ctx.strokeStyle = idx === 2 ? '#10b981' : '#059669';
        ctx.lineWidth = idx === 2 ? 3 : 2.3;
        ctx.beginPath();
        ctx.moveTo(st.dx * 0.5, st.dy);
        ctx.quadraticCurveTo(st.dx, st.dy - st.h * 0.5, topX, topY);
        ctx.stroke();

        const r = idx === 2 ? 6.8 : 5;
        for (let i = 0; i < st.leaves; i++) {
          const ang = (i * Math.PI * 2) / st.leaves + 0.2;
          ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#10b981';
          ctx.beginPath();
          ctx.arc(topX + Math.cos(ang) * (r * 0.88), topY + Math.sin(ang) * (r * 0.88), r * 0.72, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (stage.id === 'buttercup') {
      const topX = sway * 0.65;
      const topY = -44;
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(-12, -6, 11, 5, -0.35, 0, Math.PI * 2);
      ctx.ellipse(12, -6, 11, 5, 0.35, 0, Math.PI * 2);
      ctx.fill();

      const budX = 16 + secondarySway * 0.5;
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(10, -18, budX, -29);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(budX, -32, 4.5, 6.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(-3, -22, topX, topY);
      ctx.stroke();

      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3 + time * 0.25;
        ctx.fillStyle = a % 2 === 0 ? '#f59e0b' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(topX + Math.cos(ang) * 10, topY + Math.sin(ang) * 10, 6.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (stage.id === 'lotus') {
      const rippleR = 28 + Math.sin(time * 2.4 + seed) * 2.5;
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.4)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 3, rippleR, rippleR * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(0, 2, 23, 9, 0, 0.2, Math.PI * 1.9);
      ctx.lineTo(0, 2);
      ctx.fill();

      const lotusSway = sway * 0.35;
      [-0.95, -0.5, 0, 0.5, 0.95].forEach((ang) => {
        ctx.save();
        ctx.translate(lotusSway, -2);
        ctx.rotate(ang);
        ctx.fillStyle = '#db2777';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-11, -18, 0, -34);
        ctx.quadraticCurveTo(11, -18, 0, 0);
        ctx.fill();
        ctx.restore();
      });

      [-0.65, -0.22, 0.22, 0.65].forEach((ang) => {
        ctx.save();
        ctx.translate(lotusSway, -1);
        ctx.rotate(ang);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-9, -14, 0, -27);
        ctx.quadraticCurveTo(9, -14, 0, 0);
        ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(lotusSway, -14, 7, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (stage.id === 'pine') {
      ctx.fillStyle = '#5c2d16';
      ctx.beginPath();
      ctx.moveTo(-9, 4);
      ctx.lineTo(-4, -55);
      ctx.lineTo(4, -55);
      ctx.lineTo(9, 4);
      ctx.fill();

      const tiers = [
        { y: -18, w: 40, h: 28, color: '#064e3b' },
        { y: -35, w: 34, h: 26, color: '#047857' },
        { y: -52, w: 28, h: 25, color: '#059669' },
        { y: -68, w: 21, h: 22, color: '#10b981' },
        { y: -82, w: 14, h: 19, color: '#34d399' }
      ];

      tiers.forEach((t, idx) => {
        const layerSway = sway * (0.2 + idx * 0.2) + (idx % 2 === 0 ? secondarySway * 0.15 : 0);
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.moveTo(layerSway, t.y - t.h);
        ctx.quadraticCurveTo(-t.w * 0.5, t.y - t.h * 0.35, -t.w + layerSway * 0.4, t.y);
        ctx.quadraticCurveTo(-t.w * 0.45, t.y + 5, 0 + layerSway * 0.5, t.y + 2);
        ctx.quadraticCurveTo(t.w * 0.45, t.y + 5, t.w + layerSway * 0.4, t.y);
        ctx.quadraticCurveTo(t.w * 0.5, t.y - t.h * 0.35, layerSway, t.y - t.h);
        ctx.fill();
      });
    } else {
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(-38 + sway * 0.45, -72, 26, 0, Math.PI * 2);
      ctx.arc(38 + sway * 0.45, -72, 26, 0, Math.PI * 2);
      ctx.arc(0 + sway * 0.55, -104, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5c2d16';
      ctx.beginPath();
      ctx.moveTo(-20, 5);
      ctx.quadraticCurveTo(-11, -18, -11, -56);
      ctx.lineTo(11, -56);
      ctx.quadraticCurveTo(11, -18, 20, 5);
      ctx.fill();

      ctx.fillStyle = '#271203';
      ctx.beginPath();
      ctx.ellipse(0, -24, 4.8, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const canopyClusters = [
        { cx: -32, cy: -74, r: 25, color: '#047857', sFactor: 0.5 },
        { cx: 32, cy: -74, r: 25, color: '#047857', sFactor: 0.5 },
        { cx: -20, cy: -95, r: 27, color: '#059669', sFactor: 0.65 },
        { cx: 20, cy: -95, r: 27, color: '#059669', sFactor: 0.65 },
        { cx: -16, cy: -72, r: 22, color: '#10b981', sFactor: 0.55 },
        { cx: 16, cy: -72, r: 22, color: '#059669', sFactor: 0.55 },
        { cx: 0, cy: -108, r: 30, color: '#10b981', sFactor: 0.75 },
        { cx: 0, cy: -82, r: 26, color: '#34d399', sFactor: 0.6 }
      ];
      canopyClusters.forEach((c, i) => {
        const clusterOffset = sway * c.sFactor + (i % 2 === 0 ? secondarySway * 0.25 : -secondarySway * 0.25);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.cx + clusterOffset, c.cy, c.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Золотая метка совместного (Co-op) дерева
    if (plant.shareInviteCode || (plant.contributions && plant.contributions.length > 1)) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -45 * s, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Отрисовка как своего персонажа, так и гостей сада
  const drawPlayerCharacter = (ctx, charObj, time, isNightMode, label, isRemote = false) => {
    const { x, y, facing = 1, walkPhase = 0 } = charObj;
    const isMoving = isRemote
      ? Math.hypot((charObj.targetX || x) - x, (charObj.targetY || y) - y) > 2
      : Math.hypot(charObj.vx || 0, charObj.vy || 0) > 5;
    const bob = isMoving ? Math.abs(Math.sin(walkPhase)) * 5 : Math.sin(time * 2.5) * 1.5;

    ctx.save();
    ctx.translate(x, y);

    if (isNightMode) {
      const lanternGrad = ctx.createRadialGradient(0, -18, 4, 0, -18, 95);
      lanternGrad.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
      lanternGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = lanternGrad;
      ctx.beginPath();
      ctx.arc(0, -18, 95, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(0, -bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = isRemote ? (charObj.coatColor || '#6366f1') : '#0f766e';
    ctx.beginPath();
    ctx.moveTo(-11, -5);
    ctx.quadraticCurveTo(-9, -24, 0, -28);
    ctx.quadraticCurveTo(9, -24, 11, -5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, -33, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isRemote ? '#8b5cf6' : '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, -39, 15, 4.5, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Имя над персонажем
    if (label) {
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      const tw = ctx.measureText(label).width + 14;
      ctx.fillStyle = isRemote ? 'rgba(49, 46, 129, 0.88)' : 'rgba(6, 78, 59, 0.88)';
      ctx.strokeStyle = isRemote ? 'rgba(165, 180, 252, 0.5)' : 'rgba(110, 231, 183, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-tw / 2, -64 - bob, tw, 18, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, -51 - bob);
    }

    ctx.restore();
  };

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const renderLoop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const time = now / 1000;

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);

      const state = worldStateRef.current;
      const { player, camera, keys, peers } = state;

      let moveX = 0;
      let moveY = 0;
      if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        player.targetX = null;
        player.targetY = null;
        const len = Math.hypot(moveX, moveY);
        player.vx = (moveX / len) * player.speed;
        player.vy = (moveY / len) * player.speed;
      } else if (player.targetX !== null && player.targetY !== null) {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 6) {
          player.vx = (dx / dist) * player.speed;
          player.vy = (dy / dist) * player.speed;
        } else {
          player.targetX = null;
          player.targetY = null;
          player.vx = 0;
          player.vy = 0;
        }
      } else {
        player.vx *= 0.8;
        player.vy *= 0.8;
      }

      player.x += player.vx * dt;
      player.y += player.vy * dt;

      if (Math.abs(player.vx) > 4) player.facing = player.vx > 0 ? 1 : -1;
      if (Math.hypot(player.vx, player.vy) > 10) player.walkPhase += dt * 11;

      // Плавная интерполяция координат других игроков
      Object.values(peers).forEach((peer) => {
        const dx = (peer.targetX ?? peer.x) - peer.x;
        const dy = (peer.targetY ?? peer.y) - peer.y;
        if (Math.hypot(dx, dy) > 1.5) {
          peer.x += dx * Math.min(1, dt * 10);
          peer.y += dy * Math.min(1, dt * 10);
          peer.walkPhase = (peer.walkPhase || 0) + dt * 11;
        }
      });

      camera.x += (player.x - camera.x) * Math.min(1, dt * 6.5);
      camera.y += (player.y - camera.y) * Math.min(1, dt * 6.5);

      let closestP = null;
      let minPlayerDist = 85;
      for (const p of placedPlants) {
        const d = Math.hypot(player.x - p.worldX, player.y - p.worldY);
        if (d < minPlayerDist) {
          minPlayerDist = d;
          closestP = p;
        }
      }
      setNearbyPlant((prev) => (prev?.id !== closestP?.id ? closestP : prev));

      const mouseWorld = {
        x: (state.mouseScreen.x - width / 2) / zoom + camera.x,
        y: (state.mouseScreen.y - height / 2) / zoom + camera.y
      };
      let hovP = null;
      for (const p of placedPlants) {
        if (Math.hypot(mouseWorld.x - p.worldX, mouseWorld.y - (p.worldY - 24 * p.stage.scale)) < p.stage.interactRadius) {
          hovP = p;
          break;
        }
      }
      setHoveredPlant((prev) => (prev?.id !== hovP?.id ? hovP : prev));

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isNight) {
        bgGrad.addColorStop(0, '#060d18');
        bgGrad.addColorStop(1, '#0b192c');
      } else {
        bgGrad.addColorStop(0, '#0f293a');
        bgGrad.addColorStop(1, '#13384c');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-camera.x, -camera.y);

      if (meadows.length > 1) {
        const mainMeadow = meadows[0];
        for (let i = 1; i < meadows.length; i++) {
          const targetM = meadows[i];
          ctx.strokeStyle = isNight ? '#3f2e21' : '#78350f';
          ctx.lineWidth = 34;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(mainMeadow.x, mainMeadow.y);
          ctx.lineTo(targetM.x, targetM.y);
          ctx.stroke();
        }
      }

      meadows.forEach((meadow) => {
        const r = meadow.radius || 215;
        const ry = r * 0.78;
        ctx.fillStyle = isNight ? '#1e293b' : '#d6d3d1';
        ctx.beginPath();
        ctx.ellipse(meadow.x, meadow.y + 8, r + 10, ry + 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const grassGrad = ctx.createRadialGradient(meadow.x, meadow.y - 20, 20, meadow.x, meadow.y, r);
        if (isNight) {
          grassGrad.addColorStop(0, '#0f2e26');
          grassGrad.addColorStop(1, '#081c17');
        } else {
          grassGrad.addColorStop(0, '#1f513b');
          grassGrad.addColorStop(1, '#133828');
        }
        ctx.fillStyle = grassGrad;
        ctx.beginPath();
        ctx.ellipse(meadow.x, meadow.y, r, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      state.clickRipples = state.clickRipples.filter((rp) => rp.age < 1.0);
      state.clickRipples.forEach((rp) => {
        rp.age += dt * 1.8;
        ctx.strokeStyle = `rgba(110, 231, 183, ${1 - rp.age})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, 18 * rp.age, 9 * rp.age, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      const renderables = [];
      meadows.forEach((meadow) => {
        const count = placedPlants.filter((p) => p.meadowId === meadow.id).length;
        renderables.push({
          y: meadow.y - (meadow.radius || 215) * 0.72,
          draw: () => {
            ctx.save();
            ctx.translate(meadow.x, meadow.y - (meadow.radius || 215) * 0.72);
            ctx.fillStyle = '#5c2d16';
            ctx.fillRect(-3, -22, 6, 24);
            ctx.fillStyle = isNight ? '#1e293b' : '#292524';
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-88, -46, 176, 28, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#f8fafc';
            ctx.font = '600 12px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${meadow.name} (${count})`, 0, -28);
            ctx.restore();
          }
        });
      });

      placedPlants.forEach((p) => {
        const isHighlighted = nearbyPlant?.id === p.id || hoveredPlant?.id === p.id;
        renderables.push({
          y: p.worldY,
          draw: () => drawCanvasPlant(ctx, p, time, isHighlighted, isNight)
        });
      });

      // Добавляем гостей сада в общий список рендера
      Object.values(peers).forEach((peer) => {
        renderables.push({
          y: peer.y,
          draw: () => drawPlayerCharacter(ctx, peer, time, isNight, peer.username, true)
        });
      });

      // Добавляем самого игрока
      renderables.push({
        y: player.y,
        draw: () => drawPlayerCharacter(ctx, player, time, isNight, currentProfile?.username || 'Вы', false)
      });

      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((item) => item.draw());

      const activePromptPlant = hoveredPlant || nearbyPlant;
      if (activePromptPlant) {
        const px = activePromptPlant.worldX;
        const py = activePromptPlant.worldY - 68 * activePromptPlant.stage.scale - 14;
        ctx.save();
        ctx.translate(px, py);
        const titleText = activePromptPlant.title.length > 28 ? activePromptPlant.title.slice(0, 26) + '…' : activePromptPlant.title;
        const subText = `${activePromptPlant.stage.name} • ${formatDurationRu(activePromptPlant.totalSeconds)} [Клик]`;
        ctx.font = '500 12px Inter, system-ui, sans-serif';
        const w = Math.max(ctx.measureText(titleText).width, ctx.measureText(subText).width) + 28;
        ctx.fillStyle = 'rgba(11, 15, 20, 0.92)';
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -42, w, 40, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(titleText, 0, -25);
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '500 10.5px JetBrains Mono, monospace';
        ctx.fillText(subText, 0, -10);
        ctx.restore();
      }

      state.particles.forEach((pt) => {
        pt.x += pt.speedX * dt;
        pt.y += pt.speedY * dt;
        if (pt.y < camera.y - 500) pt.y = camera.y + 500;
        if (pt.x < camera.x - 900) pt.x = camera.x + 900;
        if (pt.x > camera.x + 900) pt.x = camera.x - 900;
        const alpha = 0.35 + Math.sin(time * 3 + pt.phase) * 0.3;
        ctx.fillStyle = isNight ? `rgba(253, 224, 71, ${alpha})` : `rgba(167, 243, 208, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      ctx.restore();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [meadows, placedPlants, isNight, zoom, nearbyPlant, hoveredPlant, currentProfile?.username]);

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-6rem)] min-h-[540px] rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl bg-[#08121a] select-none">
      <canvas ref={canvasRef} onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} className="w-full h-full block cursor-default" />
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 p-1.5 rounded-2xl pointer-events-auto">
          {meadows.map((m) => (
            <div key={m.id} className="inline-flex items-center rounded-xl hover:bg-zinc-800/80 transition-colors">
              <button
                onClick={() => {
                  worldStateRef.current.player.x = m.x;
                  worldStateRef.current.player.y = m.y + 55;
                  worldStateRef.current.player.targetX = null;
                  worldStateRef.current.player.targetY = null;
                }}
                className="px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>{m.name}</span>
              </button>
              {onDeleteMeadow && meadows.length > 1 && (
                <button
                  onClick={() => onDeleteMeadow(m.id)}
                  title={`Удалить поляну «${m.name}»`}
                  className="pr-2 pl-0.5 py-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button onClick={onOpenNewMeadowModal} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>Новая поляна</span>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 p-1.5 rounded-2xl pointer-events-auto">
          <div className="px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>В саду: {onlineCount}</span>
          </div>
          <button onClick={() => setShowGrowingPlants((v) => !v)} className={`px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${showGrowingPlants ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}>
            <Sprout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Растущие цели</span>
          </button>
          <button onClick={() => setIsNight((n) => !n)} className="p-2 rounded-xl text-zinc-300 hover:text-amber-300 hover:bg-zinc-800/80 transition-colors">
            {isNight ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="h-4 w-[1px] bg-zinc-800 mx-0.5" />
          <button onClick={() => setZoom((z) => Math.max(0.65, +(z - 0.15).toFixed(2)))} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 px-4 py-2 rounded-2xl text-xs text-zinc-400 flex items-center gap-3">
          <span>Ходьба: <strong className="text-zinc-200 font-mono">WASD / Стрелки</strong> или <strong className="text-zinc-200">Клик по карте</strong></span>
        </div>
        {nearbyPlant && (
          <button onClick={() => onSelectPlant(nearbyPlant.id)} className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>Осмотреть «{nearbyPlant.title.slice(0, 24)}»</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 7. ОСНОВНОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ (С АККАУНТАМИ И CO-OP ЦЕЛЯМИ)
// ============================================================================
const App = () => {
  const [activeTab, setActiveTab] = useState('work');
  const [meadows, setMeadows] = useState(INITIAL_MEADOWS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [dbStatus, setDbStatus] = useState(supabase ? 'connecting' : 'local');

  // Авторизация Supabase Auth (Google OAuth)
  const [authUser, setAuthUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

// В гостевом режиме (без входа в Google) профиль локальный и не хранит чужой keeper-код
  const [profile, setProfile] = useState({
    id: 'local-guest',
    username: 'Гость',
    garden_code: ''
  });

  // Гостевой режим сада
  const [gardenMode, setGardenMode] = useState('personal'); 
  const [guestCodeInput, setGuestCodeInput] = useState('');
  const [guestGardenData, setGuestGardenData] = useState(null);

  // Отслеживание сессии входа Supabase Auth и очистка старого кэша
  useEffect(() => {
    localStorage.removeItem('lockin_profile_v4');
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Функция загрузки личного профиля, полян и как личных, так и совместных целей
  const loadUserGardenAndGoals = useCallback(async (targetUserId, preferredUsername) => {
    if (!supabase || !targetUserId) return;
    try {
      // 1. Загружаем или создаём профиль
      const { data: existingProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      let activeProf = existingProf;
      if (!existingProf) {
        const code = `keeper-${targetUserId.slice(0, 4).toLowerCase()}`;
        const { data: inserted } = await supabase
          .from('profiles')
          .upsert({
            id: targetUserId,
            garden_code: code,
            username: preferredUsername || profile.username || 'Хранитель'
          }, { onConflict: 'id' })
          .select()
          .single();
        activeProf = inserted || { id: targetUserId, garden_code: code, username: preferredUsername || 'Хранитель' };
      }
      setProfile(activeProf);

      // 2. Загружаем поляны пользователя
      let { data: myMeadows } = await supabase
        .from('meadows')
        .select('*')
        .eq('owner_id', targetUserId)
        .order('created_at', { ascending: true });

      if (!myMeadows || myMeadows.length === 0) {
        const defaultMeadows = INITIAL_MEADOWS.map((m) => ({
          id: `${m.id}-${targetUserId.slice(0, 4)}`,
          owner_id: targetUserId,
          name: m.name,
          x: m.x,
          y: m.y,
          radius: m.radius
        }));
        await supabase.from('meadows').upsert(defaultMeadows);
        myMeadows = defaultMeadows;
      }

      setMeadows(
        myMeadows.map((m) => ({
          id: m.id,
          name: m.name,
          x: m.x ?? 0,
          y: m.y ?? 0,
          radius: m.radius ?? 215
        }))
      );

      // 3. Ищем совместные цели, в которых участвует пользователь
      const { data: myContribRows } = await supabase
        .from('goal_contributions')
        .select('goal_id')
        .eq('user_id', targetUserId);

      const coopGoalIds = (myContribRows || []).map((r) => r.goal_id);

      // Загружаем свои цели + совместные цели
      const { data: allGoals } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      const userGoals = (allGoals || []).filter(
        (g) => g.owner_id === targetUserId || coopGoalIds.includes(g.id)
      );

      // Подгружаем вклады всех участников для этих целей
      const goalIds = userGoals.map((g) => g.id);
      let allContribs = [];
      if (goalIds.length > 0) {
        const { data: cData } = await supabase
          .from('goal_contributions')
          .select('*')
          .in('goal_id', goalIds);
        allContribs = cData || [];
      }

      if (userGoals.length > 0) {
        setTasks(
          userGoals.map((g) => ({
            id: g.id,
            ownerId: g.owner_id,
            title: g.title,
            meadowId: myMeadows.some((m) => m.id === g.meadow_id) ? g.meadow_id : myMeadows[0]?.id,
            status: g.status,
            totalSeconds: g.total_seconds || 0,
            sessionsCount: 1,
            createdAt: g.created_at,
            completedAt: g.completed_at,
            shareInviteCode: g.share_invite_code,
            contributions: allContribs.filter((c) => c.goal_id === g.id)
          }))
        );
      } else {
        setTasks([]);
      }

      setDbStatus('online');
    } catch (e) {
      console.error('Ошибка синхронизации с Supabase:', e);
      setDbStatus('local');
    }
  }, [profile.username]);

// Загружаем облачный сад ТОЛЬКО когда пользователь вошёл через Google
  const effectiveUserId = authUser?.id || null;
  const googleDisplayName =
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    authUser?.email?.split('@')[0] ||
    'Хранитель';

  useEffect(() => {
    if (effectiveUserId) {
      loadUserGardenAndGoals(effectiveUserId, googleDisplayName);
    }
  }, [effectiveUserId, googleDisplayName, loadUserGardenAndGoals]);

  // Realtime-подписка на изменения целей и вкладов участников (для Co-op)
  useEffect(() => {
    if (!supabase || !effectiveUserId) return;
    const ch = supabase
      .channel('realtime-goals-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        loadUserGardenAndGoals(effectiveUserId, googleDisplayName);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_contributions' }, () => {
        loadUserGardenAndGoals(effectiveUserId, googleDisplayName);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [effectiveUserId, googleDisplayName, loadUserGardenAndGoals]);

  // Обработчик входа через Google
  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setAuthError('');
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  };

  // Полный выход из аккаунта со сбросом keeper-кода и возвратом к начальному локальному саду
  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('lockin_profile_v4');
    setAuthUser(null);
    setProfile({ id: 'local-guest', username: 'Гость', garden_code: '' });
    setMeadows(INITIAL_MEADOWS);
    setTasks(INITIAL_TASKS);
    setGardenMode('personal');
    setGuestGardenData(null);
  };


  const activeTasks = useMemo(() => tasks.filter((t) => t.status === 'active'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'completed'), [tasks]);
  
  const [selectedTaskId, setSelectedTaskId] = useState(() => activeTasks[0]?.id || '');
  useEffect(() => { if (!activeTasks.some((t) => t.id === selectedTaskId)) setSelectedTaskId(activeTasks[0]?.id || ''); }, [activeTasks, selectedTaskId]);
  const currentTask = useMemo(() => activeTasks.find((t) => t.id === selectedTaskId) || null, [activeTasks, selectedTaskId]);

  // Состояния фокуса (Работа)
  const [workMode, setWorkMode] = useState('stopwatch');
  const [workTimerMinutes, setWorkTimerMinutes] = useState(25);
  const [workStatus, setWorkStatus] = useState('idle');
  const [workElapsed, setWorkElapsed] = useState(0);
  const [workTargetSeconds, setWorkTargetSeconds] = useState(25 * 60);
  const [isEditingWorkClockDirect, setIsEditingWorkClockDirect] = useState(false);
  const [directWorkClockInput, setDirectWorkClockInput] = useState('25');
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [showSwitchGoalList, setShowSwitchGoalList] = useState(false);

  // Состояния отдыха
  const [restMode, setRestMode] = useState('stopwatch');
  const [restTimerMinutes, setRestTimerMinutes] = useState(15);
  const [restStatus, setRestStatus] = useState('idle');
  const [restElapsed, setRestElapsed] = useState(0);
  const [isEditingRestClockDirect, setIsEditingRestClockDirect] = useState(false);
  const [directRestClockInput, setDirectRestClockInput] = useState('15');

  // Состояния целей и Co-op
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMeadowId, setNewTaskMeadowId] = useState(() => meadows[0]?.id || 'meadow-science');
  const [newTaskIsCoop, setNewTaskIsCoop] = useState(false);
  const [meadowFilterId, setMeadowFilterId] = useState('all');
  const [isEditingWeekly, setIsEditingWeekly] = useState(false);
  const [weeklyInput, setWeeklyInput] = useState('');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(() => { try { const s = localStorage.getItem('lockin_v4_weekly'); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [weeklyLoggedSeconds, setWeeklyLoggedSeconds] = useState(14 * 3600);
  
  useEffect(() => { localStorage.setItem('lockin_v4_weekly', JSON.stringify(weeklyGoalHours)); }, [weeklyGoalHours]);
  useEffect(() => { if (meadows.length > 0 && !meadows.some(m => m.id === newTaskMeadowId)) setNewTaskMeadowId(meadows[0].id); }, [meadows, newTaskMeadowId]);

  // Состояния модалок
  const [inspectedPlantId, setInspectedPlantId] = useState(null);
  const inspectedPlant = useMemo(() => tasks.find((t) => t.id === inspectedPlantId) || null, [tasks, inspectedPlantId]);
  const [showGrowingInGarden, setShowGrowingInGarden] = useState(true);
  const [isNewMeadowModalOpen, setIsNewMeadowModalOpen] = useState(false);
  const [newMeadowName, setNewMeadowName] = useState('');
  const [showCoopJoin, setShowCoopJoin] = useState(false);
  const [coopJoinCode, setCoopJoinCode] = useState('');

  const isImmersiveSession = (activeTab === 'work' && workStatus !== 'idle') || (activeTab === 'rest' && restStatus !== 'idle');

  // Запись накопленных секунд в общую цель и персональный вклад участника
  const flushFocusProgressToDb = useCallback(async (goalObj, addedSec) => {
    if (!supabase || !effectiveUserId || !goalObj || addedSec <= 0) return;
    const newTotal = (goalObj.totalSeconds || 0);
    await supabase.from('goals').update({ total_seconds: newTotal }).eq('id', goalObj.id);

    const { data: existingContrib } = await supabase
      .from('goal_contributions')
      .select('seconds_contributed')
      .eq('goal_id', goalObj.id)
      .eq('user_id', effectiveUserId)
      .maybeSingle();

    const nextUserSec = (existingContrib?.seconds_contributed || 0) + addedSec;
    await supabase.from('goal_contributions').upsert({
      goal_id: goalObj.id,
      user_id: effectiveUserId,
      username: profile.username || 'Хранитель',
      seconds_contributed: nextUserSec
    }, { onConflict: 'goal_id,user_id' });
  }, [effectiveUserId, profile.username]);

  // Таймер фокуса
  useEffect(() => {
    let interval = null;
    if (workStatus === 'running' && currentTask) {
      interval = setInterval(() => {
        setWorkElapsed((prev) => {
          const next = prev + 1;
          if (workMode === 'timer' && next >= workTargetSeconds) {
            setWorkStatus('idle');
            flushFocusProgressToDb({ ...currentTask, totalSeconds: currentTask.totalSeconds + 1 }, next);
            return 0;
          }
          return next;
        });
        setTasks((prev) => prev.map((t) => t.id === currentTask.id ? { ...t, totalSeconds: t.totalSeconds + 1 } : t));
        setWeeklyLoggedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workStatus, currentTask, workMode, workTargetSeconds, flushFocusProgressToDb]);

  // Таймер отдыха
  useEffect(() => {
    let interval = null;
    if (restStatus === 'running') {
      interval = setInterval(() => {
        setRestElapsed((prev) => {
          const next = prev + 1;
          if (restMode === 'timer' && next >= restTimerMinutes * 60) {
            setRestStatus('idle');
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restStatus, restMode, restTimerMinutes]);

  const handlePauseWork = () => {
    setWorkStatus('paused');
    if (currentTask && workElapsed > 0) {
      flushFocusProgressToDb(currentTask, workElapsed);
      setWorkElapsed(0);
    }
  };

  const handleStartWork = () => {
    if (!currentTask) { setActiveTab('goals'); return; }
    setWorkTargetSeconds(Math.max(1, workTimerMinutes) * 60);
    setWorkElapsed(0);
    setConfirmAbandon(false);
    setShowSwitchGoalList(false);
    setWorkStatus('running');
  };

  const handleCompleteGoal = async (taskId) => {
    const nowIso = new Date().toISOString();
    if (currentTask?.id === taskId && workElapsed > 0) {
      await flushFocusProgressToDb(currentTask, workElapsed);
    }
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'completed', completedAt: nowIso } : t));
    if (currentTask?.id === taskId) { setWorkStatus('idle'); setWorkElapsed(0); }
    if (supabase) await supabase.from('goals').update({ status: 'completed', completed_at: nowIso }).eq('id', taskId);
  };

  const parseDirectClockString = (raw, fallbackMinutes) => {
    const clean = raw.trim();
    if (!clean) return fallbackMinutes;
    if (clean.includes(':')) {
      const [hPart, mPart] = clean.split(':');
      return Math.min(720, Math.max(1, (parseInt(hPart, 10) || 0) * 60 + (parseInt(mPart, 10) || 0)));
    }
    const mins = parseInt(clean, 10);
    return !Number.isNaN(mins) && mins > 0 ? Math.min(720, Math.max(1, mins)) : fallbackMinutes;
  };

  const handleCreateMeadow = async (e) => {
    e.preventDefault();
    if (!newMeadowName.trim()) return;
    const idx = meadows.length;
    const angle = idx * 1.15 + 0.4;
    const dist = 540 + Math.floor((idx - 1) / 3) * 420;
    const created = { id: `meadow-${Date.now()}`, name: newMeadowName.trim(), x: Math.round(Math.cos(angle) * dist), y: Math.round(Math.sin(angle) * dist * 0.72), radius: 210 };
    setMeadows((prev) => [...prev, created]);
    setNewTaskMeadowId(created.id);
    setNewMeadowName('');
    setIsNewMeadowModalOpen(false);
    if (supabase && effectiveUserId) {
      await supabase.from('meadows').insert({
        id: created.id,
        owner_id: effectiveUserId,
        name: created.name,
        x: created.x,
        y: created.y,
        radius: created.radius
      });
    }
  };

  // Удаление поляны (растения с неё переносятся на первую оставшуюся поляну)
  const handleDeleteMeadow = async (meadowId) => {
    if (meadows.length <= 1) {
      alert('В саду должна оставаться хотя бы одна поляна.');
      return;
    }
    const targetMeadow = meadows.find((m) => m.id === meadowId);
    if (!window.confirm(`Удалить поляну «${targetMeadow?.name || ''}»? Растения с неё переедут на главную поляну.`)) {
      return;
    }

    const remainingMeadows = meadows.filter((m) => m.id !== meadowId);
    const fallbackMeadowId = remainingMeadows[0].id;

    setMeadows(remainingMeadows);
    setTasks((prev) =>
      prev.map((t) => (t.meadowId === meadowId ? { ...t, meadowId: fallbackMeadowId } : t))
    );
    if (meadowFilterId === meadowId) setMeadowFilterId('all');
    if (newTaskMeadowId === meadowId) setNewTaskMeadowId(fallbackMeadowId);

    if (supabase && effectiveUserId) {
      await supabase
        .from('goals')
        .update({ meadow_id: fallbackMeadowId })
        .eq('meadow_id', meadowId)
        .eq('owner_id', effectiveUserId);
      await supabase
        .from('meadows')
        .delete()
        .eq('id', meadowId)
        .eq('owner_id', effectiveUserId);
    }
  };

  // Создание новой цели (личной или совместной Co-op)
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const inviteCode = newTaskIsCoop
      ? `COOP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    const created = {
      id: `goal-${Date.now()}`,
      ownerId: effectiveUserId,
      title: newTaskTitle.trim(),
      meadowId: newTaskMeadowId || meadows[0]?.id || 'meadow-science',
      status: 'active',
      totalSeconds: 0,
      sessionsCount: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      shareInviteCode: inviteCode,
      contributions: [{ user_id: effectiveUserId, username: profile.username, seconds_contributed: 0 }]
    };
    setTasks((prev) => [created, ...prev]);
    setSelectedTaskId(created.id);
    setNewTaskTitle('');
    setNewTaskIsCoop(false);

    if (supabase && effectiveUserId) {
      await supabase.from('goals').insert({
        id: created.id,
        owner_id: effectiveUserId,
        meadow_id: created.meadowId,
        title: created.title,
        status: 'active',
        total_seconds: 0,
        share_invite_code: inviteCode
      });
      await supabase.from('goal_contributions').upsert({
        goal_id: created.id,
        user_id: effectiveUserId,
        username: profile.username || 'Хранитель',
        seconds_contributed: 0
      }, { onConflict: 'goal_id,user_id' });
    }
  };

  // Присоединение к совместной цели по инвайт-коду
  const handleJoinCoopGoal = async (e) => {
    e.preventDefault();
    const code = coopJoinCode.trim().toUpperCase();
    if (!code || !supabase) return;

    const { data: foundGoal, error } = await supabase
      .from('goals')
      .select('*')
      .ilike('share_invite_code', code)
      .maybeSingle();

    if (error || !foundGoal) {
      alert(`Совместная цель с кодом "${code}" не найдена.`);
      return;
    }

    await supabase.from('goal_contributions').upsert({
      goal_id: foundGoal.id,
      user_id: effectiveUserId,
      username: profile.username || 'Хранитель',
      seconds_contributed: 0
    }, { onConflict: 'goal_id,user_id' });

    await loadUserGardenAndGoals(effectiveUserId);
    setSelectedTaskId(foundGoal.id);
    setCoopJoinCode('');
    setShowCoopJoin(false);
  };

  const handleVisitGuestGarden = async (e) => {
    e.preventDefault();
    const cleanCode = guestCodeInput.trim().toLowerCase();
    if (!cleanCode || !supabase) return;
    const { data: friendProfile } = await supabase.from('profiles').select('*').ilike('garden_code', cleanCode).maybeSingle();
    if (!friendProfile) return alert(`Сад с кодом "${cleanCode}" не найден.`);
    const { data: friendMeadows } = await supabase.from('meadows').select('*').eq('owner_id', friendProfile.id);
    const { data: friendGoals } = await supabase.from('goals').select('*').eq('owner_id', friendProfile.id);
    
    setGuestGardenData({
      profile: friendProfile,
      meadows: friendMeadows?.length ? friendMeadows.map(m => ({ id: m.id, name: m.name, x: m.x || 0, y: m.y || 0, radius: m.radius || 215 })) : [{ id: 'guest-m', name: 'Главная поляна', x: 0, y: 0, radius: 215 }],
      goals: friendGoals ? friendGoals.map(g => ({ id: g.id, title: g.title, meadowId: g.meadow_id, status: g.status, totalSeconds: g.total_seconds || 0, createdAt: g.created_at, completedAt: g.completed_at, shareInviteCode: g.share_invite_code })) : []
    });
    setGardenMode('guest');
  };

  const displayedMeadows = gardenMode === 'guest' && guestGardenData ? guestGardenData.meadows : meadows;
  const displayedPlants = gardenMode === 'guest' && guestGardenData ? guestGardenData.goals : (showGrowingInGarden ? tasks.filter(t => t.status === 'completed' || t.status === 'active') : completedTasks);
  const filteredActiveTasks = meadowFilterId === 'all' ? activeTasks : activeTasks.filter((t) => (t.meadowId || meadows[0]?.id) === meadowFilterId);
  const activeGardenRoomCode = gardenMode === 'guest' && guestGardenData?.profile?.garden_code
    ? guestGardenData.profile.garden_code
    : profile.garden_code;

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100 font-sans selection:bg-emerald-500/20 flex flex-col justify-between">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <style>{`
        @keyframes swayStem { 0%, 100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
        @keyframes swayBranch { 0%, 100% { transform: rotate(-2.2deg) scale(1); } 50% { transform: rotate(2.2deg) scale(1.015); } }
        @keyframes swayLeaf { 0%, 100% { transform: rotate(1.8deg); } 50% { transform: rotate(-2.4deg); } }
        @keyframes swayCanopySlow { 0%, 100% { transform: translateX(-1.5px) rotate(-1.2deg); } 50% { transform: translateX(1.5px) rotate(1.2deg); } }
        @keyframes swayCanopyFast { 0%, 100% { transform: translateY(0px) rotate(1.6deg); } 50% { transform: translateY(-2px) rotate(-1.8deg); } }
        @keyframes dewShimmer { 0%, 100% { transform: translateY(0px) scale(1); opacity: 0.92; } 50% { transform: translateY(1.8px) scale(1.06); opacity: 1; } }
        @keyframes floatPollen { 0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.45; } 50% { transform: translateY(-10px) translateX(3px); opacity: 0.95; } }
        @keyframes ripplePulse { 0%, 100% { transform: scale(0.97); opacity: 0.3; } 50% { transform: scale(1.04); opacity: 0.65; } }
        @keyframes starOscillate { 0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); } 50% { transform: translateY(-12px) scale(1.06) rotate(5deg); } }
        @keyframes auroraPulse { 0%, 100% { transform: scale(1); opacity: 0.22; } 50% { transform: scale(1.28); opacity: 0.48; } }
        .animate-sway-stem { animation: swayStem 5.6s ease-in-out infinite; }
        .animate-sway-branch { animation: swayBranch 4.4s ease-in-out infinite; }
        .animate-sway-leaf { animation: swayLeaf 3.8s ease-in-out infinite; }
        .animate-sway-canopy-slow { animation: swayCanopySlow 6.2s ease-in-out infinite; }
        .animate-sway-canopy-fast { animation: swayCanopyFast 4.8s ease-in-out infinite; }
        .animate-dew-shimmer { animation: dewShimmer 3.2s ease-in-out infinite; }
        .animate-float-pollen { animation: floatPollen 4.5s ease-in-out infinite; }
        .animate-ripple-pulse { transform-origin: 120px 206px; animation: ripplePulse 4s ease-in-out infinite; }
        .animate-star-oscillate { animation: starOscillate 6s ease-in-out infinite; }
        .animate-aurora-pulse { animation: auroraPulse 5.2s ease-in-out infinite; }
      `}</style>

      {/* Шапка с навигацией, ID сада и кнопкой Аккаунта */}
      {!isImmersiveSession && (
        <header className="pt-6 pb-2 px-4 flex flex-wrap justify-between items-center gap-3 z-20 max-w-[1440px] w-full mx-auto">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${dbStatus === 'online' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-amber-950 text-amber-400 border-amber-500/30'}`}>
              {dbStatus === 'online' ? 'Supabase ✓' : 'Локальный'}
            </span>
            {authUser && profile.garden_code ? (
              <span
                onClick={() => navigator.clipboard.writeText(profile.garden_code)}
                className="text-xs text-zinc-400 font-mono cursor-pointer hover:text-emerald-300 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                title="Нажмите, чтобы скопировать ID своего сада"
              >
                <span>ID: <strong className="text-emerald-400">{profile.garden_code}</strong></span>
                <Copy className="w-3 h-3 text-zinc-500" />
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-mono bg-zinc-900/50 border border-zinc-800/70 px-2.5 py-1 rounded-lg">
                Гостевой режим
              </span>
            )}
          </div>

          <nav className="inline-flex items-center gap-1 bg-zinc-900/70 border border-zinc-800/80 p-1.5 rounded-2xl backdrop-blur-md shadow-lg">
            {[{ id: 'work', label: 'Работа' }, { id: 'rest', label: 'Отдых' }, { id: 'garden', label: 'Сад достижений' }, { id: 'goals', label: 'Цели' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Блок аккаунта (Вход / Регистрация) */}
          <div className="flex items-center gap-2">
            {authUser ? (
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-200">{profile.username}</span>
                <button onClick={handleSignOut} className="text-zinc-500 hover:text-red-400 ml-1" title="Выйти из аккаунта">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти / Аккаунт</span>
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 flex flex-col justify-center w-full mx-auto ${activeTab === 'garden' ? 'max-w-[1440px] px-3 sm:px-6 py-2' : 'max-w-3xl px-6 py-6'}`}>
        
        {/* ==================================================================
            ВКЛАДКА 1: РАБОТА
           ================================================================== */}
        {activeTab === 'work' && (
          <div className="flex flex-col items-center justify-center text-center my-auto">
            {!currentTask ? (
              <div className="space-y-5 py-16">
                <Sprout className="w-11 h-11 text-zinc-600 mx-auto stroke-[1.4]" />
                <p className="text-zinc-400 text-sm">Выберите цель или создайте новую во вкладке «Цели»</p>
                <button onClick={() => setActiveTab('goals')} className="px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm text-zinc-200 transition-colors">
                  Перейти к целям →
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 space-y-1">
                  <div className="text-base sm:text-lg font-normal text-zinc-200 tracking-tight flex items-center justify-center gap-2">
                    <span>{currentTask.title}</span>
                    {currentTask.shareInviteCode && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                        Co-op: {currentTask.shareInviteCode}
                      </span>
                    )}
                  </div>
                  {workStatus === 'idle' && (
                    <button onClick={() => setActiveTab('goals')} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">
                      {getPlantStage(currentTask.totalSeconds).name} • {formatDurationRu(currentTask.totalSeconds)} в фокусе (сменить)
                    </button>
                  )}
                </div>

                <div className="my-2">
                  <PlantArtwork totalSeconds={currentTask.totalSeconds} stageKey={confirmAbandon ? 'withered' : undefined} isPaused={workStatus === 'paused'} size="lg" animate={workStatus === 'running'} />
                </div>

                {workStatus === 'idle' && (
                  <div className="mt-2 mb-3 flex flex-col items-center gap-3">
                    <div className="inline-flex bg-zinc-900/70 border border-zinc-800/80 p-1 rounded-xl">
                      <button onClick={() => setWorkMode('stopwatch')} className={`px-3.5 py-1 rounded-lg text-xs transition-colors ${workMode === 'stopwatch' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>Секундомер</button>
                      <button onClick={() => setWorkMode('timer')} className={`px-3.5 py-1 rounded-lg text-xs transition-colors ${workMode === 'timer' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>Таймер</button>
                    </div>
                    {workMode === 'timer' && <TimerDurationPicker totalMinutes={workTimerMinutes} onChangeMinutes={(m) => setWorkTimerMinutes(m)} accent="emerald" />}
                  </div>
                )}

                <div className="my-2">
                  {workStatus === 'idle' && workMode === 'timer' && isEditingWorkClockDirect ? (
                    <form onSubmit={(e) => { e.preventDefault(); setWorkTimerMinutes(parseDirectClockString(directWorkClockInput, workTimerMinutes)); setIsEditingWorkClockDirect(false); }} className="flex flex-col items-center gap-1">
                      <input type="text" value={directWorkClockInput} onChange={(e) => setDirectWorkClockInput(e.target.value)} onBlur={() => { setWorkTimerMinutes(parseDirectClockString(directWorkClockInput, workTimerMinutes)); setIsEditingWorkClockDirect(false); }} placeholder="ЧЧ:ММ или ММ" autoFocus className="w-56 bg-zinc-900/90 border border-emerald-500/50 rounded-2xl px-4 py-2 text-center text-5xl sm:text-6xl font-mono font-extralight text-zinc-100 focus:outline-none" />
                      <span className="text-[11px] text-zinc-500">Введите минуты (напр. 45) или ЧЧ:ММ (напр. 1:30) и нажмите Enter</span>
                    </form>
                  ) : (
                    <div onClick={() => { if (workStatus === 'idle' && workMode === 'timer') { const h = Math.floor(workTimerMinutes / 60); const m = workTimerMinutes % 60; setDirectWorkClockInput(h > 0 ? `${h}:${String(m).padStart(2, '0')}` : String(m)); setIsEditingWorkClockDirect(true); } }} title={workStatus === 'idle' && workMode === 'timer' ? 'Нажмите, чтобы ввести время цифрами с клавиатуры' : undefined} className={`text-6xl sm:text-7xl font-mono font-extralight tracking-tight text-zinc-100 transition-colors ${workStatus === 'idle' && workMode === 'timer' ? 'cursor-pointer hover:text-emerald-300' : ''}`}>
                      {workStatus === 'idle' ? (workMode === 'timer' ? formatClock(workTimerMinutes * 60) : '00:00') : (workMode === 'timer' ? formatClock(Math.max(0, workTargetSeconds - workElapsed)) : formatClock(workElapsed))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-md">
                  {workStatus === 'idle' && (
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={handleStartWork} className="px-10 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium tracking-wide transition-all shadow-lg shadow-emerald-950/50">Начать фокус</button>
                      <button onClick={() => handleCompleteGoal(currentTask.id)} className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors py-1">Отметить выполненной и посадить в сад ✓</button>
                    </div>
                  )}
                  {workStatus === 'running' && (
                    <button onClick={handlePauseWork} className="px-8 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs tracking-wider uppercase transition-all">Пауза</button>
                  )}
                  {workStatus === 'paused' && (
                    <div className="w-full space-y-4">
                      {!confirmAbandon && !showSwitchGoalList && (
                        <div className="flex flex-col items-center gap-2.5">
                          <div className="flex flex-wrap items-center justify-center gap-2.5">
                            <button onClick={() => setWorkStatus('running')} className="px-7 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium transition-all">Продолжить</button>
                            <button onClick={() => { setWorkStatus('idle'); setWorkElapsed(0); }} className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs sm:text-sm transition-all">Завершить сессию</button>
                            <button onClick={() => handleCompleteGoal(currentTask.id)} className="px-5 py-2.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm transition-all">В сад ✓</button>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                            <button onClick={() => setShowSwitchGoalList(true)} className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-900 transition-colors">Выбрать другую цель</button>
                            <button onClick={() => setConfirmAbandon(true)} className="text-xs text-zinc-500 hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-950/20 transition-colors">Бросить цель</button>
                          </div>
                        </div>
                      )}
                      {showSwitchGoalList && (
                        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-3 text-left">
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>Выберите другую активную цель:</span>
                            <button onClick={() => setShowSwitchGoalList(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {activeTasks.map((t) => (
                              <button key={t.id} onClick={() => { setSelectedTaskId(t.id); setWorkStatus('idle'); setWorkElapsed(0); setShowSwitchGoalList(false); }} className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${t.id === currentTask.id ? 'bg-zinc-800 text-emerald-400' : 'hover:bg-zinc-800/60 text-zinc-300'}`}>
                                <span className="truncate pr-2">{t.title}</span>
                                <span className="font-mono text-[11px] text-zinc-500 shrink-0">{formatDurationRu(t.totalSeconds)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {confirmAbandon && (
                        <div className="bg-zinc-900/95 border border-red-900/50 rounded-2xl p-5 space-y-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-red-400 text-xs sm:text-sm font-medium">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Вы уверены? Цветок погибнет.</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setConfirmAbandon(false)} className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors">Отмена</button>
                            <button onClick={() => { setTasks((prev) => prev.filter((t) => t.id !== currentTask.id)); setWorkStatus('idle'); setWorkElapsed(0); setConfirmAbandon(false); if (supabase) supabase.from('goals').delete().eq('id', currentTask.id).then(); }} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors">Да, бросить</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================================================================
            ВКЛАДКА 2: ОТДЫХ
           ================================================================== */}
        {activeTab === 'rest' && (
          <div className="flex flex-col items-center justify-center text-center my-auto">
            <div className="relative h-56 w-56 flex items-center justify-center my-2 select-none">
              <div className="absolute w-48 h-48 rounded-full bg-amber-400/15 blur-3xl animate-aurora-pulse pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full bg-indigo-400/15 blur-2xl animate-aurora-pulse pointer-events-none" style={{ animationDelay: '1.6s' }} />
              <div className="relative z-10 animate-star-oscillate" style={{ opacity: restStatus === 'paused' ? 0.45 : 1, transition: 'opacity 0.5s ease' }}>
                <svg width="104" height="104" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_28px_rgba(251,191,36,0.55)]">
                  <path d="M60 14 C62 45, 75 58, 106 60 C75 62, 62 75, 60 106 C58 75, 45 62, 14 60 C45 58, 58 45, 60 14 Z" fill="#fef3c7" />
                  <path d="M60 34 C61 51, 69 59, 86 60 C69 61, 61 69, 60 86 C59 69, 51 61, 34 60 C51 59, 59 51, 60 34 Z" fill="#ffffff" transform="rotate(45 60 60)" opacity="0.75" />
                </svg>
              </div>
            </div>

            {restStatus === 'idle' && (
              <div className="mt-2 mb-3 flex flex-col items-center gap-3">
                <div className="inline-flex bg-zinc-900/70 border border-zinc-800/80 p-1 rounded-xl">
                  <button onClick={() => setRestMode('stopwatch')} className={`px-3.5 py-1 rounded-lg text-xs transition-colors ${restMode === 'stopwatch' ? 'bg-zinc-800 text-amber-200' : 'text-zinc-500 hover:text-zinc-300'}`}>Секундомер</button>
                  <button onClick={() => setRestMode('timer')} className={`px-3.5 py-1 rounded-lg text-xs transition-colors ${restMode === 'timer' ? 'bg-zinc-800 text-amber-200' : 'text-zinc-500 hover:text-zinc-300'}`}>Таймер</button>
                </div>
                {restMode === 'timer' && <TimerDurationPicker totalMinutes={restTimerMinutes} onChangeMinutes={(m) => setRestTimerMinutes(m)} accent="amber" />}
              </div>
            )}

            <div className="my-2">
              {restStatus === 'idle' && restMode === 'timer' && isEditingRestClockDirect ? (
                <form onSubmit={(e) => { e.preventDefault(); setRestTimerMinutes(parseDirectClockString(directRestClockInput, restTimerMinutes)); setIsEditingRestClockDirect(false); }} className="flex flex-col items-center gap-1">
                  <input type="text" value={directRestClockInput} onChange={(e) => setDirectRestClockInput(e.target.value)} onBlur={() => { setRestTimerMinutes(parseDirectClockString(directRestClockInput, restTimerMinutes)); setIsEditingRestClockDirect(false); }} placeholder="ЧЧ:ММ или ММ" autoFocus className="w-56 bg-zinc-900/90 border border-amber-400/50 rounded-2xl px-4 py-2 text-center text-5xl sm:text-6xl font-mono font-extralight text-amber-100 focus:outline-none" />
                  <span className="text-[11px] text-zinc-500">Введите минуты или ЧЧ:ММ и нажмите Enter</span>
                </form>
              ) : (
                <div onClick={() => { if (restStatus === 'idle' && restMode === 'timer') { const h = Math.floor(restTimerMinutes / 60); const m = restTimerMinutes % 60; setDirectRestClockInput(h > 0 ? `${h}:${String(m).padStart(2, '0')}` : String(m)); setIsEditingRestClockDirect(true); } }} title={restStatus === 'idle' && restMode === 'timer' ? 'Нажмите, чтобы ввести время цифрами' : undefined} className={`text-6xl sm:text-7xl font-mono font-extralight tracking-tight text-amber-100/90 transition-colors ${restStatus === 'idle' && restMode === 'timer' ? 'cursor-pointer hover:text-amber-300' : ''}`}>
                  {restStatus === 'idle' ? (restMode === 'timer' ? formatClock(restTimerMinutes * 60) : '00:00') : (restMode === 'timer' ? formatClock(Math.max(0, restTimerMinutes * 60 - restElapsed)) : formatClock(restElapsed))}
                </div>
              )}
            </div>

            <div className="mt-6">
              {restStatus === 'idle' && (
                <button onClick={() => { setRestElapsed(0); setRestStatus('running'); }} className="px-10 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-100 text-sm font-medium transition-all">Начать отдых</button>
              )}
              {restStatus === 'running' && (
                <div className="flex items-center gap-3">
                  <button onClick={() => setRestStatus('paused')} className="px-7 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs tracking-wider uppercase transition-all">Пауза</button>
                  <button onClick={() => { setRestStatus('idle'); setRestElapsed(0); }} className="px-6 py-2.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/70 text-zinc-500 hover:text-zinc-300 text-xs transition-all">Завершить отдых</button>
                </div>
              )}
              {restStatus === 'paused' && (
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setRestStatus('running')} className="px-7 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-100 text-xs sm:text-sm transition-all">Продолжить</button>
                  <button onClick={() => { setRestStatus('idle'); setRestElapsed(0); }} className="px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs sm:text-sm transition-all">Завершить отдых</button>
                </div>
              )}
            </div>

            <div className={`mt-12 flex flex-col items-center gap-2.5 select-none transition-opacity duration-1000 ${restStatus === 'running' ? 'opacity-55 animate-pulse' : 'opacity-75'}`}>
              <div className="flex items-center gap-2.5 text-amber-300/40">
                <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-300/30" />
                <Sun className="w-3.5 h-3.5 stroke-[1.4]" />
                <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-300/30" />
              </div>
              <p className="text-[11px] sm:text-xs font-light tracking-[0.14em] uppercase text-amber-100/50 max-w-md leading-relaxed">
                Растения не могут без солнца, человек не может без отдыха
              </p>
            </div>
          </div>
        )}

        {/* ==================================================================
            ВКЛАДКА 3: САД ДОСТИЖЕНИЙ (С ОНЛАЙН-МУЛЬТИПЛЕЕРОМ)
           ================================================================== */}
        {activeTab === 'garden' && (
          <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c0e14] p-4 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-emerald-300 uppercase tracking-widest">
                  {gardenMode === 'personal'
                    ? (profile.garden_code ? `Мой сад (${profile.garden_code})` : 'Мой сад (локальный)')
                    : `В гостях у: ${guestGardenData?.profile?.username || 'Друга'} (${activeGardenRoomCode})`}
                </span>
              </div>
              <form onSubmit={handleVisitGuestGarden} className="flex items-center gap-2">
                <input type="text" placeholder="ID сада друга (напр. keeper-7f9a)" value={guestCodeInput} onChange={(e) => setGuestCodeInput(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 w-56" />
                <button type="submit" className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-600/30">В гости</button>
                {gardenMode === 'guest' && (
                  <button type="button" onClick={() => { setGardenMode('personal'); setGuestGardenData(null); setGuestCodeInput(''); }} className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs hover:bg-zinc-700">Домой</button>
                )}
              </form>
            </div>

            <CartoonGardenWorld
              meadows={displayedMeadows}
              plants={displayedPlants}
              onSelectPlant={(id) => setInspectedPlantId(id)}
              onOpenNewMeadowModal={() => setIsNewMeadowModalOpen(true)}
              onDeleteMeadow={gardenMode === 'personal' ? handleDeleteMeadow : null}
              showGrowingPlants={showGrowingInGarden}
              setShowGrowingPlants={setShowGrowingInGarden}
              roomCode={activeGardenRoomCode}
              currentProfile={profile}
            />
          </div>
        )}

        {/* ==================================================================
            ВКЛАДКА 4: ЦЕЛИ И СОВМЕСТНЫЕ CO-OP РАСТЕНИЯ
           ================================================================== */}
        {activeTab === 'goals' && (
          <div className="space-y-6 my-auto py-2">
            
            {/* Кликабельная цель на неделю */}
            <div onClick={() => { if (!isEditingWeekly) { setWeeklyInput(weeklyGoalHours ? String(weeklyGoalHours) : ''); setIsEditingWeekly(true); } }} title={!isEditingWeekly ? 'Нажмите, чтобы задать или изменить цель часов на неделю' : undefined} className={`bg-zinc-900/45 border border-zinc-800/80 rounded-2xl px-5 py-3.5 flex flex-col gap-2.5 transition-all ${!isEditingWeekly ? 'cursor-pointer hover:border-emerald-500/40 hover:bg-zinc-900/75 group' : 'border-emerald-500/50 bg-zinc-900/80'}`}>
              {!isEditingWeekly ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                      <span className="text-zinc-500">Цель на неделю:</span>
                      {weeklyGoalHours ? (
                        <span className="font-mono text-emerald-400 font-medium group-hover:underline decoration-emerald-500/50 underline-offset-4">{(weeklyLoggedSeconds / 3600).toFixed(1)} / {weeklyGoalHours} ч</span>
                      ) : (
                        <span className="font-mono text-zinc-300 group-hover:text-emerald-300 transition-colors">{(weeklyLoggedSeconds / 3600).toFixed(1)} ч <span className="text-zinc-500 font-sans">(нажмите, чтобы задать лимит)</span></span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 group-hover:text-emerald-400 flex items-center gap-1.5 transition-colors"><Edit3 className="w-3.5 h-3.5" /><span>{weeklyGoalHours ? 'Изменить' : 'Задать'}</span></div>
                  </div>
                  {weeklyGoalHours && (
                    <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/80 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((weeklyLoggedSeconds / 3600) / weeklyGoalHours) * 100)}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); const num = parseFloat(weeklyInput); setWeeklyGoalHours(isNaN(num) || num <= 0 ? null : num); setIsEditingWeekly(false); }} onClick={(e) => e.stopPropagation()} className="w-full flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-400">Цель часов:</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setWeeklyInput((v) => String(Math.max(1, (parseFloat(v) || 15) - 5)))} className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white">-5ч</button>
                      <input type="number" step="0.5" min="0" max="168" placeholder="25" value={weeklyInput} onChange={(e) => setWeeklyInput(e.target.value)} className="w-24 bg-zinc-950 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs font-mono text-white text-center focus:outline-none" autoFocus />
                      <button type="button" onClick={() => setWeeklyInput((v) => String(Math.min(168, (parseFloat(v) || 15) + 5)))} className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white">+5ч</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setWeeklyGoalHours(null); setIsEditingWeekly(false); }} className="text-xs text-zinc-500 hover:text-amber-300 px-2.5 py-1 rounded-lg hover:bg-zinc-800/60">Без лимита</button>
                    <button type="submit" className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium">Сохранить</button>
                  </div>
                </form>
              )}
            </div>

            {/* Фильтр полян */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/30 border border-zinc-800/70 rounded-2xl px-4 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-zinc-500 mr-1 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-emerald-400" /><span>Поляны:</span></span>
                <button type="button" onClick={() => setMeadowFilterId('all')} className={`px-3 py-1 rounded-xl text-xs transition-colors ${meadowFilterId === 'all' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'}`}>Все ({activeTasks.length})</button>
                {meadows.map((m) => {
                  const count = activeTasks.filter((t) => (t.meadowId || meadows[0]?.id) === m.id).length;
                  return (
                    <div
                      key={m.id}
                      className={`inline-flex items-center rounded-xl text-xs transition-colors ${
                        meadowFilterId === m.id
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium'
                          : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/40 hover:bg-zinc-900/80 border border-transparent'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setMeadowFilterId(m.id)}
                        className="px-2.5 py-1 cursor-pointer"
                      >
                        {m.name} ({count})
                      </button>
                      {meadows.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeadow(m.id);
                          }}
                          title={`Удалить поляну «${m.name}»`}
                          className="pr-2 pl-0.5 py-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => setIsNewMeadowModalOpen(true)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 transition-colors shrink-0"><Plus className="w-3.5 h-3.5" /><span>Новая поляна</span></button>
            </div>

            {/* ФОРМА СОЗДАНИЯ ЦЕЛИ И СОВМЕСТНОГО CO-OP */}
            <div className="rounded-2xl bg-zinc-900/35 border border-zinc-800/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Посадить новое растение</span>
                <button type="button" onClick={() => setShowCoopJoin(!showCoopJoin)} className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Присоединиться к совместной цели по коду</span>
                </button>
              </div>

              {showCoopJoin && (
                <form onSubmit={handleJoinCoopGoal} className="flex gap-2 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <input
                    type="text"
                    placeholder="Введите код цели друга (напр. COOP-8F2A)..."
                    value={coopJoinCode}
                    onChange={(e) => setCoopJoinCode(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono uppercase text-amber-200 focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium hover:bg-amber-500/30">
                    Присоединиться
                  </button>
                </form>
              )}

              <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 relative z-10">
                <input type="text" placeholder="Название цели (напр. Сдать матан)..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="sm:col-span-5 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50" />
                <select value={newTaskMeadowId} onChange={(e) => { if (e.target.value === '__create_new__') setIsNewMeadowModalOpen(true); else setNewTaskMeadowId(e.target.value); }} className="sm:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none">
                  {meadows.map((m) => ( <option key={m.id} value={m.id}>Поляна: {m.name}</option> ))}
                  <option value="__create_new__">+ Создать новую поляну...</option>
                </select>
                <button
                  type="button"
                  onClick={() => setNewTaskIsCoop(!newTaskIsCoop)}
                  className={`sm:col-span-2 flex items-center justify-center gap-1.5 rounded-xl border text-xs px-3 py-2.5 transition-all ${
                    newTaskIsCoop
                      ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Сделать цель совместной и получить код приглашения для друга"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Co-op</span>
                </button>
                <button type="submit" className="sm:col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs uppercase tracking-wider py-2.5 transition-colors cursor-pointer w-full relative z-20">Создать</button>
              </form>
            </div>

            {/* СПИСОК АКТИВНЫХ ЦЕЛЕЙ */}
            <div className="space-y-3">
              {filteredActiveTasks.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-sm">В этой категории пока нет активных целей. Создайте новую задачу выше.</div>
              ) : (
                filteredActiveTasks.map((task) => {
                  const isCurrent = task.id === selectedTaskId;
                  const stage = getPlantStage(task.totalSeconds);
                  const meadow = meadows.find((m) => m.id === task.meadowId) || meadows[0];

                  return (
                    <div key={task.id} className={`group rounded-2xl p-4 border transition-all flex flex-col gap-3 ${isCurrent ? 'bg-zinc-900/80 border-emerald-500/40' : 'bg-zinc-900/30 border-zinc-800/70 hover:border-zinc-700/80'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <PlantArtwork totalSeconds={task.totalSeconds} size="sm" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-normal text-zinc-100">{task.title}</h3>
                              {isCurrent && <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-400 border border-emerald-500/20">выбрана</span>}
                              {task.shareInviteCode && (
                                <span
                                  onClick={() => navigator.clipboard.writeText(task.shareInviteCode)}
                                  className="cursor-pointer text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 flex items-center gap-1"
                                  title="Нажмите, чтобы скопировать код совместной цели для друга"
                                >
                                  <span>Код Co-op: {task.shareInviteCode}</span>
                                  <Copy className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2 font-mono">
                              <span className="text-emerald-400/90">{stage.name}</span><span>•</span>
                              <span className="text-zinc-300">{formatDurationRu(task.totalSeconds)}</span><span>•</span>
                              <span className="text-zinc-500">{meadow?.name}</span>
                            </div>
                            {task.contributions && task.contributions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-amber-300/80 font-mono">
                                {task.contributions.map((c, idx) => (
                                  <span key={idx} className="bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 rounded">
                                    {c.username}: {formatDurationRu(c.seconds_contributed)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                          <button onClick={() => { setSelectedTaskId(task.id); setActiveTab('work'); }} className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium transition-colors">Работать →</button>
                          <button onClick={() => handleCompleteGoal(task.id)} className="px-3.5 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors">В сад ✓</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* МОДАЛЬНОЕ ОКНО ВХОДА И РЕГИСТРАЦИИ АККАУНТА */}
{/* МОДАЛЬНОЕ ОКНО ВХОДА ЧЕРЕЗ GOOGLE */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f151d] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl text-center"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-100">Вход в сад Lock In</h3>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Войдите через Google, чтобы синхронизировать ваш сад, поляны и совместные цели на всех устройствах.
            </p>

            {authError && <p className="text-xs text-red-400">{authError}</p>}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{authLoading ? 'Переход в Google...' : 'Продолжить через Google'}</span>
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛКА ОСМОТРА РАСТЕНИЯ В САДУ */}
      {inspectedPlant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInspectedPlantId(null)}>
          <div className="bg-[#0f151d] border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setInspectedPlantId(null)} className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 p-1 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            <div className="flex flex-col items-center text-center pt-1">
              <PlantArtwork totalSeconds={inspectedPlant.totalSeconds} size="md" animate />
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <span>{getPlantStage(inspectedPlant.totalSeconds).name}</span>
              </div>
              <h3 className="text-lg font-medium text-white mt-2.5 leading-snug">{inspectedPlant.title}</h3>
            </div>
            <div className="space-y-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
                <span className="text-zinc-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-400" /><span>Время в фокусе:</span></span>
                <span className="font-mono text-emerald-300 font-semibold text-sm">{formatDurationRu(inspectedPlant.totalSeconds)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
                <span className="text-zinc-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /><span>Дата посадки:</span></span>
                <span className="font-mono text-zinc-200">{formatDateRu(inspectedPlant.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-500" /><span>Выращено:</span></span>
                <span className="font-mono text-zinc-200">{formatDateRu(inspectedPlant.completedAt)}</span>
              </div>
              {inspectedPlant.contributions && inspectedPlant.contributions.length > 0 && (
                <div className="pt-2 border-t border-zinc-900 space-y-1">
                  <span className="text-zinc-500 block">Вклад участников:</span>
                  {inspectedPlant.contributions.map((c, idx) => (
                    <div key={idx} className="flex justify-between font-mono text-zinc-300">
                      <span>{c.username}</span>
                      <span className="text-emerald-400">{formatDurationRu(c.seconds_contributed)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isNewMeadowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsNewMeadowModalOpen(false)}>
          <form onSubmit={handleCreateMeadow} onClick={(e) => e.stopPropagation()} className="bg-[#0f151d] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-100">Новая поляна в саду</h3>
              <button type="button" onClick={() => setIsNewMeadowModalOpen(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-zinc-400">В саду появится новый островок с деревянным мостиком.</p>
            <input type="text" placeholder="Например: Иностранные языки" value={newMeadowName} onChange={(e) => setNewMeadowName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" autoFocus />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsNewMeadowModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200">Отмена</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium">Создать</button>
            </div>
          </form>
        </div>
      )}

      <footer className="py-2" />
    </div>
  );
};

export default App;