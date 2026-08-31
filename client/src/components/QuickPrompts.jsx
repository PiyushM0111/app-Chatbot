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
    description: 'Design full-stack APIs, database schemas, and microservices.',
    prompt: 'Show me how to build a scalable, production-grade REST API in Node.js with Server-Sent Events (SSE) and SQLite database.'
  },
  {
    id: 'learn',
    icon: Brain,
    color: '#A855F7',
    category: 'STUDY & TUTOR',
    title: 'Learn Something',
    description: 'Master cybersecurity, network security principles, and defense.',
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
    description: 'Explore quantum computing and physics in intuitive terms.',
    prompt: 'Can you explain Quantum Computing in simple, friendly terms with real everyday examples?'
  }
];

const QuickPrompts = ({ onSelectPrompt, onOpenPrompts }) => {
  const { user } = useAuth();
  const { accentColor } = useTheme();

  const getGreeting = () => {
    if (user?.name) {
      const firstName = user.name.split(' ')[0];
      return `Hey ${firstName}, what can we explore?`;
    }
    return 'What can we explore today?';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-3 sm:px-6 py-2 sm:py-6 text-center animate-fadeIn">
      {/* Responsive AI Brand Identity with Ambient Aura */}
      <div className="relative mb-2.5 sm:mb-4 group">
        <div 
          className="absolute -inset-2.5 sm:-inset-4 rounded-full blur-xl opacity-35 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor}, #38BDF8)` }}
        />
        <div
          className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${accentColor}dd, #F3E8FF)`,
            color: '#1C1028'
          }}
        >
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.2]" />
        </div>
      </div>

      {/* Responsive Heading */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-1 px-2 leading-tight">
        {getGreeting()}
      </h1>

      {/* Short Subtitle */}
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6 max-w-md leading-relaxed px-3">
        Full-stack software architecture, deep reasoning, creative studio & personal tutor.
      </p>

      {/* Responsive Quick Action Cards (1 Column on Mobile, 2 Columns on Tablet/Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full text-left max-w-2xl mb-4">
        {ACTION_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 group text-left flex items-center sm:items-start gap-3 backdrop-blur-md hover:-translate-y-0.5 active:scale-[0.98] min-h-[58px] sm:min-h-[72px]"
            >
              <div
                className="p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor: `${card.color}18`,
                  color: card.color
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {card.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0 hidden sm:block" />
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1 sm:line-clamp-2">
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
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-1.5 active:scale-95"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Browse 20+ Prompt Templates</span>
        </button>
      )}
    </div>
  );
};

export default QuickPrompts;
