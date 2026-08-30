import React, { useState } from 'react';
import { X, Search, MessageSquare, Trash2, Edit2, Check, Plus, AlertCircle, Pin, Download, Clock, Calendar, BookmarkCheck, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const ChatHistoryDrawer = ({
  isOpen,
  onClose,
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onTogglePinConversation,
  onDeleteConversation,
  onClearAllConversations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.last_message && c.last_message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group conversations by section
  const pinnedConvs = filteredConversations.filter(c => !!c.is_pinned);
  const unpinnedConvs = filteredConversations.filter(c => !c.is_pinned);

  const now = new Date();
  const todayConvs = [];
  const weekConvs = [];
  const olderConvs = [];

  unpinnedConvs.forEach(c => {
    const d = new Date(c.updated_at || c.created_at);
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) todayConvs.push(c);
    else if (diffDays <= 7) weekConvs.push(c);
    else olderConvs.push(c);
  });

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (convId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const confirmDelete = (convId, e) => {
    e.stopPropagation();
    setDeletingId(convId);
  };

  const executeDelete = (convId, e) => {
    e.stopPropagation();
    onDeleteConversation(convId);
    setDeletingId(null);
  };

  const handleExport = async (convId, title, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('chatbot_token');
      const res = await fetch(`/api/conversations/${convId}/export?format=markdown`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[/\\?%*:|"<>]/g, '_')}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Chat exported as Markdown!', 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export conversation', 'error');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderConvItem = (conv) => {
    const isActive = conv.id === currentConversationId;
    const isBeingEdited = editingId === conv.id;
    const isBeingDeleted = deletingId === conv.id;
    const isPinned = !!conv.is_pinned;

    return (
      <div
        key={conv.id}
        onClick={() => {
          if (!isBeingEdited && !isBeingDeleted) {
            onSelectConversation(conv.id);
            onClose();
          }
        }}
        className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between border ${
          isActive
            ? 'bg-purple-100/90 dark:bg-purple-950/60 border-purple-400 dark:border-purple-600 shadow-md scale-[1.01]'
            : isPinned
            ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/50 hover:shadow-md'
            : 'bg-zinc-50/80 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md'
        }`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {isBeingEdited ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRename(conv.id, e);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-purple-400 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
              <button onClick={(e) => saveRename(conv.id, e)} className="p-1 text-green-600 hover:scale-110">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button onClick={() => setEditingId(null)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : isBeingDeleted ? (
            <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/50 p-2 rounded-xl" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Delete chat?</span>
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => executeDelete(conv.id, e)}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                  className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                <h3 className="text-xs md:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {conv.title || 'New Conversation'}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
                  {conv.language || 'en'}
                </span>
                <span>{formatTime(conv.updated_at || conv.created_at)}</span>
                {conv.message_count !== undefined && (
                  <span>• {conv.message_count} msgs</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action icons */}
        {!isBeingEdited && !isBeingDeleted && (
          <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinConversation(conv.id, !isPinned);
              }}
              className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                isPinned ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title={isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => handleExport(conv.id, conv.title, e)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Export as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => startEditing(conv, e)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Rename"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => confirmDelete(conv.id, e)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col z-10 border-r border-black/5 dark:border-white/10">
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-zinc-900 dark:text-white">Conversation History</h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{conversations.length} total sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat & Search Bar */}
        <div className="p-4 space-y-3 border-b border-zinc-200/60 dark:border-zinc-800">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-md transition-all hover:brightness-105 active:scale-98"
            style={{
              backgroundColor: accentColor,
              color: '#33223B'
            }}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Start Fresh New Chat</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Categorized List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner opacity-70"
                style={{ backgroundColor: `${accentColor}33`, color: '#33223B' }}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {searchTerm ? 'No matching chats found.' : 'No conversations yet.'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">Start chatting to build your history!</p>
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedConvs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Pinned Favorites</span>
                  </div>
                  {pinnedConvs.map(renderConvItem)}
                </div>
              )}

              {/* Today Section */}
              {todayConvs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Today</span>
                  </div>
                  {todayConvs.map(renderConvItem)}
                </div>
              )}

              {/* Previous 7 Days Section */}
              {weekConvs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Previous 7 Days</span>
                  </div>
                  {weekConvs.map(renderConvItem)}
                </div>
              )}

              {/* Older Section */}
              {olderConvs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>Older Chats</span>
                  </div>
                  {olderConvs.map(renderConvItem)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Footer Actions */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {showClearConfirm ? (
              <div className="bg-red-50 dark:bg-red-950/50 p-2.5 rounded-2xl flex items-center justify-between border border-red-200 dark:border-red-900/40">
                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Clear everything?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearAllConversations();
                      setShowClearConfirm(false);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl font-bold"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat History</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryDrawer;
