import React from 'react';
import { Heart, Brain, Code, Sparkles, Languages, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MODES = [
  { id: 'general', label: 'All-Rounder', icon: Zap, color: '#38BDF8', desc: 'Fast & Versatile AI' },
  { id: 'companion', label: 'Motivator', icon: Heart, color: '#F43F5E', desc: 'Empathetic & Caring' },
  { id: 'deep', label: 'Deep Reasoner', icon: Brain, color: '#A855F7', desc: 'Logic & First Principles' },
  { id: 'code', label: 'Code Architect', icon: Code, color: '#10B981', desc: 'Full-Stack Software Engineer' },
  { id: 'creative', label: 'Creative', icon: Sparkles, color: '#F59E0B', desc: 'Imaginative Writer & Visuals' },
  { id: 'hinglish', label: 'Hinglish Buddy', icon: Languages, color: '#EC4899', desc: 'Chill Indian Slang Assistant' },
];

const ModeSelectorBar = ({ currentMode, onSelectMode }) => {
  const { accentColor } = useTheme();

  return (
    <div className="w-full flex justify-center px-3 sm:px-6 py-1 z-20 pointer-events-auto">
      {/* Horizontally scrollable container with hidden scrollbar and touch pan */}
      <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm max-w-full overflow-x-auto no-scrollbar touch-pan-x flex-nowrap scroll-smooth">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMode === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95 ${
                isSelected
                  ? 'shadow-md font-bold text-zinc-900 scale-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? accentColor : 'transparent',
              }}
              title={m.desc}
              aria-label={`Select ${m.label} persona mode`}
            >
              <Icon
                className="w-3.5 h-3.5 flex-shrink-0"
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
