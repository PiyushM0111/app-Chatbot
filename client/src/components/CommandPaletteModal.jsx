import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare, FolderGit2, Image, Brain, Sparkles, BookOpen, Settings, StickyNote, Palette, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CommandPaletteModal = ({
  isOpen,
  onClose,
  onNewChat,
  onOpenProjects,
  onOpenImageGallery,
  onOpenLearning,
  onOpenMemory,
  onOpenNotes,
  onOpenThemeStudio,
  onOpenPromptLibrary,
  onOpenSettings,
  onToggleFocusMode,
  onOpenSearchInChat,
  conversations = [],
  onSelectConversation
}) => {
  const [query, setQuery] = useState('');
  const { accentColor } = useTheme();

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const ACTIONS = [
    { id: 'new_chat', title: 'Start a Fresh New Chat', category: 'Chat', icon: Plus, action: () => { onNewChat(); onClose(); } },
    { id: 'search_chat', title: 'Find / Search in Conversation (Ctrl+F)', category: 'Chat', icon: Search, action: () => { onOpenSearchInChat && onOpenSearchInChat(); onClose(); } },
    { id: 'theme_studio', title: 'Open Theme Studio & Visual Atmospheres', category: 'Design', icon: Palette, action: () => { onOpenThemeStudio && onOpenThemeStudio(); onClose(); } },
    { id: 'focus_mode', title: 'Toggle Focus Mode Workspace', category: 'View', icon: Sparkles, action: () => { onToggleFocusMode && onToggleFocusMode(); onClose(); } },
    { id: 'notes', title: 'Open AI Notes & Code Snippets', category: 'Notes', icon: StickyNote, action: () => { onOpenNotes(); onClose(); } },
    { id: 'projects', title: 'Open Software Projects Workspace', category: 'Workspace', icon: FolderGit2, action: () => { onOpenProjects(); onClose(); } },
    { id: 'images', title: 'Open AI Image Studio & Gallery', category: 'Studio', icon: Image, action: () => { onOpenImageGallery(); onClose(); } },
    { id: 'learning', title: 'Open Interactive AI Tutor & Quizzes', category: 'Learning', icon: Brain, action: () => { onOpenLearning(); onClose(); } },
    { id: 'memory', title: 'Manage Long-Term Memories & Preferences', category: 'Memory', icon: Sparkles, action: () => { onOpenMemory(); onClose(); } },
    { id: 'prompts', title: 'Browse Prompt Templates Library', category: 'Prompts', icon: BookOpen, action: () => { onOpenPromptLibrary(); onClose(); } },
    { id: 'settings', title: 'Open Settings & AI Configuration', category: 'Preferences', icon: Settings, action: () => { onOpenSettings(); onClose(); } },
  ];

  // Search filtered actions and conversations
  const q = query.toLowerCase().trim();
  const filteredActions = ACTIONS.filter(a => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  const filteredConvs = conversations.filter(c => c.title.toLowerCase().includes(q)).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-10 border border-black/10 dark:border-white/10 overflow-hidden animate-scaleUp flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, tool, or search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md border border-zinc-300 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Workspaces & Controls
              </div>
              <div className="space-y-1">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="w-full px-3 py-2.5 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 block group-hover:text-purple-700 dark:group-hover:text-purple-300">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {act.category}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversations */}
          {filteredConvs.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Recent Conversations
              </div>
              <div className="space-y-1">
                {filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {conv.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 capitalize">
                      {conv.mode || 'Chat'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredConvs.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching commands or conversations found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
