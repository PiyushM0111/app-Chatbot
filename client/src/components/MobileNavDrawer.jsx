import React from 'react';
import { 
  X, Plus, History, StickyNote, Palette, Globe, Sliders, 
  FolderGit2, Image, Brain, Sparkles, BookOpen, User, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MobileNavDrawer = ({
  isOpen,
  onClose,
  onNewChat,
  onToggleHistory,
  onOpenNotes,
  onOpenThemeStudio,
  onOpenProjects,
  onOpenImageGallery,
  onOpenLearning,
  onOpenMemory,
  onOpenPromptLibrary,
  onOpenLanguage,
  onOpenSettings,
  onOpenAuth,
  currentLanguage = 'en',
  currentMode = 'general'
}) => {
  const { user, logout } = useAuth();
  const { accentColor, currentThemePreset } = useTheme();

  if (!isOpen) return null;

  const handleAction = (callback) => {
    onClose();
    if (callback) callback();
  };

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'hi': return 'हिंदी (Hindi)';
      case 'hinglish': return 'Hinglish (Hindi-English)';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      default: return 'English (US)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-Over Drawer */}
      <div className="relative w-[85%] max-w-sm h-full bg-zinc-950 text-white border-l border-white/10 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slideLeft custom-chat-scroller">
        {/* Drawer Header: User Profile / Brand */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div 
            onClick={() => handleAction(user ? onOpenSettings : onOpenAuth)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#20112A' }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-white block truncate">
                {user?.name || 'Sign In / Account'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate">
                {user?.email || 'Guest Workspace'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 active:scale-95"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body: Navigation Sections */}
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Quick Chat Section */}
          <div className="space-y-1.5">
            <button
              onClick={() => handleAction(onNewChat)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-between shadow-md active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Start New Conversation</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/20">Ctrl+N</span>
            </button>

            <button
              onClick={() => handleAction(onToggleHistory)}
              className="w-full p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-between border border-white/5 active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-purple-400" />
                <span>Chat History & Search</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            <button
              onClick={() => handleAction(onOpenNotes)}
              className="w-full p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-between border border-white/5 active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <StickyNote className="w-4 h-4 text-amber-400" />
                <span>Saved AI Notes & Snippets</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Workspaces & Creative Tools */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-2 px-1">
              Workspaces & AI Studio
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleAction(onOpenThemeStudio)}
                className="w-full p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-between border border-purple-500/25 active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Theme Studio</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-extrabold">
                  {currentThemePreset.name}
                </span>
              </button>

              <button
                onClick={() => handleAction(onOpenProjects)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <span>Software Projects</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAction(onOpenImageGallery)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Image className="w-4 h-4 text-sky-400" />
                  <span>AI Image Studio & Gallery</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAction(onOpenLearning)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span>Interactive AI Tutor & Quiz</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAction(onOpenMemory)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Personal AI Memories</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAction(onOpenPromptLibrary)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Prompt Templates</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Preferences & Settings */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-2 px-1">
              Preferences & Configuration
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleAction(onOpenLanguage)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span>Language</span>
                </div>
                <span className="text-[11px] text-zinc-400">{getLanguageLabel(currentLanguage)}</span>
              </button>

              <button
                onClick={() => handleAction(onOpenSettings)}
                className="w-full p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-zinc-400" />
                  <span>Settings & System Status</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer: Logout or Sign In */}
        <div className="p-4 border-t border-white/10 bg-zinc-950">
          {user ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-bold flex items-center justify-center gap-2 border border-white/5 active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out ({user.name})</span>
            </button>
          ) : (
            <button
              onClick={() => handleAction(onOpenAuth)}
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98"
              style={{ backgroundColor: accentColor, color: '#20112A' }}
            >
              <User className="w-4 h-4" />
              <span>Sign In to Save Chats</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
