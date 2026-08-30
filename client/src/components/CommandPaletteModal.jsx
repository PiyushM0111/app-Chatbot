import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare, FolderGit2, Image, Brain, Sparkles, BookOpen, Settings, Palette, Command, X, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CommandPaletteModal = ({
  isOpen,
  onClose,
  onNewChat,
  onOpenProjects,
  onOpenImageGallery,
  onOpenLearning,
  onOpenMemory,
  onOpenPromptLibrary,
  onOpenSettings,
  conversations = [],
  onSelectConversation
}) => {
  const [query, setQuery] = useState('');
  const { accentColor, setTheme, THEME_PRESETS } = useTheme();

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const ACTIONS = [
    { id: 'new_chat', title: 'Start a Fresh New Chat', category: 'Chat', icon: Plus, action: () => { onNewChat(); onClose(); } },
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
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3 custom-chat-scroller">
          {/* Quick Actions Group */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5">
              Quick Commands & Workspaces
            </div>
            <div className="space-y-1">
              {filteredActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-zinc-400">{act.category}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversations Group */}
          {filteredConvs.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5">
                Matching Chats
              </div>
              <div className="space-y-1">
                {filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        {conv.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 flex-shrink-0">
                      {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
