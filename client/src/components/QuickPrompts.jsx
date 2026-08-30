import React from 'react';
import { Sparkles, Code, Brain, Image, HelpCircle, ArrowRight, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ACTION_CARDS = [
  {
    id: 'build',
    icon: Code,
    color: '#10B981',
    category: 'CODE & ARCHITECTURE',
    title: 'Build Something',
    description: 'Design a full-stack REST API with authentication and database schemas.',
    prompt: 'Show me how to build a scalable, production-grade REST API in Node.js with Server-Sent Events (SSE) and SQLite database.'
  },
  {
    id: 'learn',
    icon: Brain,
    color: '#A855F7',
    category: 'STUDY & TUTOR',
    title: 'Learn Something',
    description: 'Master cybersecurity, network security principles, and defensive practices.',
    prompt: 'Can you tell me about cybersecurity and explain its core pillars, threat types, and best practices?'
  },
  {
    id: 'visuals',
    icon: Image,
    color: '#38BDF8',
    category: 'CREATIVE STUDIO',
    title: 'Create Visuals',
    description: 'Generate photorealistic 3D concept renders with custom lighting.',
    prompt: 'Create an image of a futuristic neon cybernetic city in cyberpunk style with 16:9 aspect ratio.'
  },
  {
    id: 'ask',
    icon: HelpCircle,
    color: '#F59E0B',
    category: 'DEEP REASONING',
    title: 'Ask Anything',
    description: 'Understand quantum computing and superposition in simple, intuitive terms.',
    prompt: 'Can you explain Quantum Computing in simple, friendly terms with real everyday examples?'
  }
];

const QuickPrompts = ({ onSelectPrompt, onOpenPrompts }) => {
  const { user } = useAuth();
  const { accentColor } = useTheme();

  const getGreeting = () => {
    if (user?.name) {
      const firstName = user.name.split(' ')[0];
      return `Hey ${firstName}, what are we building today?`;
    }
    return 'What can we explore today?';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Minimal AI Brand Identity with Breathing Ambient Aura */}
      <div className="relative mb-3 sm:mb-4 group">
        <div 
          className="absolute -inset-2.5 sm:-inset-3.5 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor}, #38BDF8)` }}
        />
        <div
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-md"
          style={{
            background: `linear-gradient(135deg, ${accentColor}cc, #E9D5FF)`,
            color: '#1C1028'
          }}
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
        </div>
      </div>

      {/* Dynamic Personalized Greeting */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-1.5 px-2">
        {getGreeting()}
      </h1>

      {/* Short Capability Statement */}
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md leading-relaxed px-3">
        Full-stack software architecture, deep reasoning, creative studio & personal tutor.
      </p>

      {/* 4 High-Value Action Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left max-w-2xl mb-4">
        {ACTION_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm hover:shadow-md transition-all duration-200 group text-left flex items-start gap-3 backdrop-blur-sm hover:-translate-y-0.5 active:scale-98"
            >
              <div
                className="p-2.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0"
                style={{
                  backgroundColor: `${card.color}18`,
                  color: card.color
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {card.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Browse More Templates Button */}
      {onOpenPrompts && (
        <button
          onClick={onOpenPrompts}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-1.5"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Browse 20+ Prompt Templates</span>
        </button>
      )}
    </div>
  );
};

export default QuickPrompts;
