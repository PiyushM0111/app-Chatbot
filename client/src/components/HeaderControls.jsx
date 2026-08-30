import React from 'react';
import { User, Plus, History, Sparkles, Globe, Settings, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const HeaderControls = ({
  onOpenAuth,
  onOpenSettings,
  onNewChat,
  onToggleHistory,
  onOpenAdvConv,
  onOpenLanguage,
  currentLanguage = 'en',
  currentMode = 'general'
}) => {
  const { user } = useAuth();
  const { accentColor } = useTheme();

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'hi': return 'हिंदी';
      case 'hinglish': return 'Hinglish';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      default: return 'English';
    }
  };

  return (
    <header className="w-full px-3 py-2 sm:px-6 sm:py-2.5 flex justify-between items-center z-30 pointer-events-auto">
      {/* TOP LEFT: AI Brand Identity + New Chat + History */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Brand Mark */}
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={onNewChat}>
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #F3DBFB)`,
              color: '#20112A'
            }}
          >
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white block leading-none">
              Nexus AI
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              Personal Platform
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 sm:mx-1" />

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          title="New Conversation (Ctrl+N)"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Chat History Button */}
        <button
          onClick={onToggleHistory}
          title="Chat History (Ctrl+H)"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <History className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* TOP RIGHT: Theme/Accent + Language + Settings/Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Persona Mode Indicator */}
        <button
          onClick={onOpenAdvConv}
          title="AI Persona & Model Settings"
          className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="capitalize hidden md:inline">{currentMode !== 'general' ? currentMode : 'All-Rounder'}</span>
        </button>

        {/* Language Selector */}
        <button
          onClick={onOpenLanguage}
          title="Switch Language"
          className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">{getLanguageLabel(currentLanguage)}</span>
        </button>

        {/* Settings & Appearance */}
        <button
          onClick={onOpenSettings}
          title="Settings & Appearance"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* User Account / Profile */}
        <button
          onClick={user ? onOpenSettings : onOpenAuth}
          title={user ? `Account: ${user.name}` : 'Sign In'}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: accentColor, color: '#33223B' }}
        >
          {user ? (
            <span className="font-bold text-xs">{user.name.slice(0, 2).toUpperCase()}</span>
          ) : (
            <User className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};

export default HeaderControls;
