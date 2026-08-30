import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus, X, Search, Check, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const MemoryModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFact, setNewFact] = useState('');
  const [search, setSearch] = useState('');

  const fetchMemories = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/memory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (err) {
      console.error('Error loading memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMemories();
  }, [isOpen, token]);

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ keyFact: newFact.trim() })
      });

      if (res.ok) {
        showToast('Memory saved successfully!', 'success');
        setNewFact('');
        fetchMemories();
      }
    } catch (err) {
      showToast('Failed to save memory.', 'error');
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      const res = await fetch(`/api/memory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
        showToast('Memory removed.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete memory.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all stored memories?')) return;
    try {
      const res = await fetch('/api/memory', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMemories([]);
        showToast('All memories cleared.', 'info');
      }
    } catch (err) {
      showToast('Failed to clear memories.', 'error');
    }
  };

  if (!isOpen) return null;

  const filtered = memories.filter(m => m.key_fact.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[85vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">AI Memory Management</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">View and control long-term knowledge remembered by AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAddMemory} className="py-3 flex gap-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Tell AI to remember something (e.g. I prefer Python)..."
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105 active:scale-95 text-zinc-900 flex items-center gap-1.5 flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>

        {/* Search */}
        <div className="relative mb-2 flex-shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-chat-scroller">
          {loading ? (
            <div className="text-center py-10 text-xs text-zinc-400">Loading stored memories...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-400">
              No memories found. Add a fact above or tell AI "*Remember that...*" in chat!
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-start justify-between gap-3 group"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
                    {m.key_fact}
                  </p>
                  <span className="text-[10px] text-zinc-400">
                    Saved on {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteMemory(m.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {memories.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center flex-shrink-0">
            <span className="text-xs text-zinc-400">{memories.length} memories stored</span>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryModal;
