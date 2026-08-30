import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Copy, Check, X, Search, Tag, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_TAGS = ['All', 'Code', 'Architecture', 'Security', 'Learning', 'Ideas'];

const NotesModal = ({ isOpen, onClose, onInsertNoteToChat }) => {
  const { token } = useAuth();
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Code');
  const [copiedId, setCopiedId] = useState(null);

  const fetchNotes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotes();
  }, [isOpen, token]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: [newTag]
        })
      });

      if (res.ok) {
        showToast('Note saved successfully!', 'success');
        setNewTitle('');
        setNewContent('');
        setIsCreating(false);
        fetchNotes();
      }
    } catch (e) {
      showToast('Failed to save note.', 'error');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
        showToast('Note deleted.', 'info');
      }
    } catch (e) {
      showToast('Failed to delete note.', 'error');
    }
  };

  const handleCopy = async (note) => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopiedId(note.id);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {}
  };

  if (!isOpen) return null;

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || (Array.isArray(n.tags) && n.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[88vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">AI Notes & Snippets</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Saved explanations, code solutions & custom notes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsCreating(prev => !prev)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-transform hover:scale-105 text-zinc-900 flex items-center gap-1.5"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isCreating ? 'Cancel' : 'New Note'}</span>
          </button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 flex-shrink-0 custom-chat-scroller">
          {DEFAULT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Create Note Form */}
        {isCreating && (
          <form onSubmit={handleCreateNote} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5 mb-3 flex-shrink-0 animate-fadeIn">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Note Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 focus:outline-none"
              >
                {DEFAULT_TAGS.filter(t => t !== 'All').map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <textarea
              rows={3}
              required
              placeholder="Paste code snippet, architecture outline, or AI explanation..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none font-mono resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-900 shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                Save Note
              </button>
            </div>
          </form>
        )}

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-chat-scroller">
          {loading ? (
            <div className="text-center py-12 text-xs text-zinc-400">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-400">
              No notes found. Save any AI response by clicking the bookmark icon in chat!
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm hover:shadow-md transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {note.title}
                      </span>
                      {Array.isArray(note.tags) && note.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-[9px] font-bold text-purple-700 dark:text-purple-300">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(note)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Copy content"
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {onInsertNoteToChat && (
                      <button
                        onClick={() => {
                          onInsertNoteToChat(note.content);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                        title="Discuss in chat"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap line-clamp-4 bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
