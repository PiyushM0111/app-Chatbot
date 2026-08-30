import React, { useState } from 'react';
import { X, BookOpen, Code, Lightbulb, Brain, Languages, Briefcase, ArrowUpRight, Search, Sparkles, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PROMPT_CATEGORIES = [
  { id: 'all', name: 'All Prompts', icon: Sparkles },
  { id: 'coding', name: 'Coding & Architecture', icon: Code },
  { id: 'creative', name: 'Creative & Writing', icon: Lightbulb },
  { id: 'analysis', name: 'Logic, Math & AI', icon: Brain },
  { id: 'wellness', name: 'Support & Wellness', icon: Heart },
  { id: 'indian', name: 'Hindi & Hinglish', icon: Languages },
  { id: 'productivity', name: 'Productivity & Career', icon: Briefcase },
];

const PROMPTS = [
  {
    category: 'coding',
    title: 'Code Refactoring & Clean Architecture',
    prompt: 'Review the following code, identify code smells, and refactor it to follow SOLID principles and clean architecture best practices with thorough comments:\n\n```[PASTE CODE HERE]```'
  },
  {
    category: 'coding',
    title: 'Design Full-Stack REST API & Database',
    prompt: 'Design a production-ready REST API architecture for a modern SaaS web app in Node.js, Express, and SQLite with authentication, error handling, database schemas, and rate limiting.'
  },
  {
    category: 'coding',
    title: 'Debug Error & Root Cause Analysis',
    prompt: 'I am getting this error in my application. Please explain the root cause and provide a step-by-step fix with corrected code:\n\n[PASTE ERROR & CODE HERE]'
  },
  {
    category: 'coding',
    title: 'Write Comprehensive Unit & Integration Tests',
    prompt: 'Write comprehensive unit tests with edge cases, mocking, and assertions for the following JavaScript/TypeScript function using Vitest/Jest:\n\n```[PASTE FUNCTION HERE]```'
  },
  {
    category: 'creative',
    title: 'Sci-Fi Cyberpunk Story & Dialogue',
    prompt: 'Write an intriguing sci-fi scene between an AI researcher and a sentient AI exploring the concept of consciousness in a neon-lit cyberpunk metropolis.'
  },
  {
    category: 'creative',
    title: 'Viral Social Media Hooks & Posts',
    prompt: 'Write 3 catchy, high-engagement LinkedIn & Twitter post drafts about the latest breakthroughs in AI agentic workflows and developer productivity.'
  },
  {
    category: 'creative',
    title: 'Creative Brand Slogan & Pitch Deck',
    prompt: 'Generate 5 memorable brand names, catchphrases, and an elevator pitch for an innovative AI-powered automation platform.'
  },
  {
    category: 'analysis',
    title: 'Step-by-Step Mathematical Proof with LaTeX',
    prompt: 'Explain Bayes Theorem and derive its mathematical formula step by step with clear LaTeX notation ($...$) and an intuitive real-world medical diagnostic example.'
  },
  {
    category: 'analysis',
    title: 'Transformer Attention Mechanism Breakdown',
    prompt: 'Explain the Transformer Attention Mechanism (Self-Attention & Multi-Head Attention) from first principles using clear analogies, matrix dimensions, and mathematical formulations.'
  },
  {
    category: 'analysis',
    title: 'System Design & High-Throughput Scaling',
    prompt: 'How would you architect a global real-time notification system handling 100M+ active users? Cover caching, message queues, database partitioning, and fault tolerance.'
  },
  {
    category: 'wellness',
    title: 'Comforting Perspective & Stress Relief',
    prompt: 'I am feeling quite stressed and overwhelmed with work and life lately. Can you offer a calming perspective and practical steps to regain focus and peace of mind?'
  },
  {
    category: 'wellness',
    title: 'Daily Mindfulness & Routine Builder',
    prompt: 'Help me design a balanced, realistic daily morning and evening routine focused on deep work, physical energy, and restful sleep.'
  },
  {
    category: 'indian',
    title: 'Hinglish Tech Explanation (Microservices)',
    prompt: 'Microservices architecture vs Monolith ko bilkul simple Hinglish mein real-life Swiggy/Zomato examples ke saath samjhao.'
  },
  {
    category: 'indian',
    title: 'हिंदी में तकनीकी ज्ञान (Cloud Computing)',
    prompt: 'क्लाउड कंप्यूटिंग, वर्चुअलाइजेशन और साइबर सुरक्षा के मूल सिद्धांतों को सरल हिंदी में समझाएं।'
  },
  {
    category: 'productivity',
    title: 'Executive Meeting Summary & Action Items',
    prompt: 'Summarize the following meeting transcript into: Key Decisions, Action Items with Owners, Open Questions, and Next Steps:\n\n[PASTE TRANSCRIPT HERE]'
  },
  {
    category: 'productivity',
    title: 'Resume & Cover Letter Metrics Polish',
    prompt: 'Enhance my professional summary and bullet points for a Senior Full Stack Engineer role to make them high-impact, STAR-formatted, and metrics-driven:\n\n[PASTE SUMMARY HERE]'
  },
  {
    category: 'productivity',
    title: 'Technical Interview Preparation & Mock Q&A',
    prompt: 'Act as a Senior Principal Engineer conducting a technical interview. Ask me a challenging data structures or system design question, and guide me through the solution.'
  }
];

const PromptLibraryModal = ({ isOpen, onClose, onSelectPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { accentColor } = useTheme();

  if (!isOpen) return null;

  const filteredPrompts = PROMPTS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.prompt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[85vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">Prompt Template Library</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Select curated prompt templates for coding, reasoning, and creativity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="py-3 space-y-3 flex-shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {PROMPT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isSelected
                      ? 'shadow-sm text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800'
                  }`}
                  style={{
                    backgroundColor: isSelected ? accentColor : undefined
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 custom-chat-scroller">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs sm:text-sm">
              No matching prompt templates found. Try a different search keyword!
            </div>
          ) : (
            filteredPrompts.map((p, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectPrompt(p.prompt);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <span>{p.title}</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {p.prompt}
                  </p>
                </div>
                <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptLibraryModal;
