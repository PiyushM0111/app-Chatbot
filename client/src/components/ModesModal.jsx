import React from 'react';
import { X, Sparkles, Code, Brain, Heart, Languages, Check, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AI_MODES = [
  {
    id: 'general',
    name: 'All-Rounder',
    desc: 'Fast, balanced, and versatile intelligence for everyday questions and tasks',
    icon: Zap,
    color: '#38BDF8'
  },
  {
    id: 'companion',
    name: 'Motivator & Companion',
    desc: 'Empathetic, compassionate listener offering comforting advice and encouragement',
    icon: Heart,
    color: '#F43F5E'
  },
  {
    id: 'deep',
    name: 'Deep Reasoner',
    desc: 'Rigorous step-by-step logic, analytical explanations, and first-principles breakdown',
    icon: Brain,
    color: '#A855F7'
  },
  {
    id: 'code',
    name: 'Code Architect',
    desc: 'Full-stack software engineering, clean architecture, refactoring, and debugging',
    icon: Code,
    color: '#10B981'
  },
  {
    id: 'creative',
    name: 'Creative Genius',
    desc: 'Imaginative storytelling, brand copy, viral social posts, and novel brainstorming',
    icon: Sparkles,
    color: '#F59E0B'
  },
  {
    id: 'hinglish',
    name: 'Hinglish Buddy 🇮🇳',
    desc: 'Chill, friendly everyday Indian Hinglish conversation with relatable examples',
    icon: Languages,
    color: '#EC4899'
  }
];

const ModesModal = ({ isOpen, onClose, currentMode, onSelectMode }) => {
  const { accentColor } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-black/5 dark:border-white/10 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Orb Visual */}
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-2xl orb-gradient flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              AI Persona Modes
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select the optimal persona specialized for your task
            </p>
          </div>
        </div>

        {/* Mode List */}
        <div className="mt-3 sm:mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-chat-scroller">
          {AI_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  onSelectMode(mode.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all duration-150 flex items-start justify-between ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-xl mt-0.5 flex-shrink-0"
                    style={{
                      backgroundColor: `${mode.color}22`,
                      color: mode.color
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      {mode.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug block mt-0.5">
                      {mode.desc}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 shadow-sm"
                    style={{ backgroundColor: accentColor, color: '#33223B' }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModesModal;
