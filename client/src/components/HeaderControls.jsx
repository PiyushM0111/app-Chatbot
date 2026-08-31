import React, { useState } from 'react';
import { User, Plus, History, Sparkles, Globe, Palette, StickyNote, Sliders, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MobileNavDrawer from './MobileNavDrawer';

const HeaderControls = ({
  onOpenAuth,
  onOpenSettings,
  onOpenThemeStudio,
  onNewChat,
  onToggleHistory,
  onOpenAdvConv,
  onOpenLanguage,
  onOpenNotes,
  onOpenProjects,
  onOpenImageGallery,
  onOpenLearning,
  onOpenMemory,
  onOpenPromptLibrary,
  currentLanguage = 'en',
  currentMode = 'general'
}) => {
  const { user } = useAuth();
  const { accentColor, currentThemePreset } = useTheme();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
    <>
      <header className="w-full px-3 py-2.5 sm:px-6 sm:py-3 flex justify-between items-center z-30 pointer-events-auto border-b border-black/5 dark:border-white/5 backdrop-blur-md">
        {/* ========================================================================= */}
        {/* TOP LEFT: AI Brand Mark + Desktop Action Icons */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Brand Mark */}
          <div 
            className="flex items-center gap-2.5 group cursor-pointer" 
            onClick={onNewChat}
            title="Start Fresh Conversation"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #F3DBFB)`,
                color: '#20112A'
              }}
            >
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-left">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-900 dark:text-white block leading-none">
                Nexus AI
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
                Personal Platform
              </span>
            </div>
          </div>

          {/* Desktop Only Navigation Links */}
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-zinc-200 dark:border-zinc-800">
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
              title="Chat History & Search (Ctrl+H)"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60"
            >
              <History className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* AI Notes Button */}
            <button
              onClick={onOpenNotes}
              title="Saved Notes & Code Snippets"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60"
            >
              <StickyNote className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP RIGHT: Desktop Full Controls vs Mobile Clean Minimal Header */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Studio Button (Visible on both mobile & desktop) */}
          <button
            onClick={onOpenThemeStudio}
            title={`Theme Studio: ${currentThemePreset.name} World`}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 border border-purple-500/25 transition-all shadow-sm active:scale-95 min-w-[36px]"
          >
            <Palette className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
            <span className="hidden sm:inline">{currentThemePreset.name}</span>
          </button>

          {/* Desktop-Only Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Persona Mode Indicator */}
            <button
              onClick={onOpenAdvConv}
              title="AI Persona & Model Settings"
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span className="capitalize hidden lg:inline">{currentMode !== 'general' ? currentMode : 'All-Rounder'}</span>
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

            {/* General Settings */}
            <button
              onClick={onOpenSettings}
              title="Settings & System Status"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all active:scale-95 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              <Sliders className="w-4 h-4" />
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

          {/* Mobile-Only Menu Drawer Trigger Button (Replaces crowded icons) */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60 active:scale-95 shadow-sm"
            aria-label="Open navigation menu"
          >
            {user ? (
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shadow-sm"
                style={{ backgroundColor: accentColor, color: '#20112A' }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <Menu className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Sheet */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onNewChat={onNewChat}
        onToggleHistory={onToggleHistory}
        onOpenNotes={onOpenNotes}
        onOpenThemeStudio={onOpenThemeStudio}
        onOpenProjects={onOpenProjects}
        onOpenImageGallery={onOpenImageGallery}
        onOpenLearning={onOpenLearning}
        onOpenMemory={onOpenMemory}
        onOpenPromptLibrary={onOpenPromptLibrary}
        onOpenLanguage={onOpenLanguage}
        onOpenSettings={onOpenSettings}
        onOpenAuth={onOpenAuth}
        currentLanguage={currentLanguage}
        currentMode={currentMode}
      />
    </>
  );
};

export default HeaderControls;
