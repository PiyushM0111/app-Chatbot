import React from 'react';
import { Heart, Brain, Code, Sparkles, Languages, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MODES = [
  { id: 'general', label: 'All-Rounder', icon: Zap, color: '#38BDF8', desc: 'Fast & Versatile' },
  { id: 'companion', label: 'Motivator', icon: Heart, color: '#F43F5E', desc: 'Empathetic & Caring' },
  { id: 'deep', label: 'Deep Reasoner', icon: Brain, color: '#A855F7', desc: 'Logic & First Principles' },
  { id: 'code', label: 'Code Architect', icon: Code, color: '#10B981', desc: 'Full-Stack Developer' },
  { id: 'creative', label: 'Creative', icon: Sparkles, color: '#F59E0B', desc: 'Imaginative Writer' },
  { id: 'hinglish', label: 'Hinglish Buddy', icon: Languages, color: '#EC4899', desc: 'Chill Indian Slang' },
];

const ModeSelectorBar = ({ currentMode, onSelectMode }) => {
  const { accentColor } = useTheme();

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 z-20 pointer-events-auto">
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm max-w-full overflow-x-auto scrollbar-none touch-pan-x">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMode === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isSelected
                  ? 'shadow-md scale-105 text-zinc-900 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? accentColor : 'transparent',
              }}
              title={m.desc}
            >
              <Icon
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
                style={{ color: isSelected ? '#1E1E24' : m.color }}
              />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelectorBar;
