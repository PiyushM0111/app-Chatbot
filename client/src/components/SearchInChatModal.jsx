import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, X, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SearchInChatModal = ({ isOpen, onClose, messages = [], onJumpToMessage }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { accentColor } = useTheme();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setCurrentIndex(0);
      return;
    }

    const matches = [];
    const qLower = query.toLowerCase();

    messages.forEach((msg, mIdx) => {
      const content = msg.content || '';
      if (content.toLowerCase().includes(qLower)) {
        matches.push({
          messageIndex: mIdx,
          role: msg.role,
          content: content,
          timestamp: msg.created_at
        });
      }
    });

    setResults(matches);
    setCurrentIndex(0);
  }, [query, messages]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (results.length === 0) return;
    const nextIdx = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIdx);
    if (onJumpToMessage) {
      onJumpToMessage(results[nextIdx].messageIndex);
    }
  };

  const handlePrev = () => {
    if (results.length === 0) return;
    const prevIdx = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIdx);
    if (onJumpToMessage) {
      onJumpToMessage(results[prevIdx].messageIndex);
    }
  };

  return (
    <div className="fixed top-16 right-4 sm:right-8 z-50 w-full max-w-md animate-scaleUp">
      <div className="bg-zinc-950/95 text-white rounded-2xl border border-white/15 shadow-2xl p-3 backdrop-blur-2xl flex flex-col gap-2">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find in conversation..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Results count & match navigators */}
          {results.length > 0 && (
            <span className="text-[11px] font-mono text-zinc-400 flex-shrink-0">
              {currentIndex + 1}/{results.length}
            </span>
          )}

          <button
            type="button"
            onClick={handlePrev}
            disabled={results.length === 0}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 active:scale-95"
            title="Previous match"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={results.length === 0}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 active:scale-95"
            title="Next match"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            title="Close find in chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snippet previews */}
        {results.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-chat-scroller text-left pt-1 border-t border-white/10">
            {results.map((res, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (onJumpToMessage) onJumpToMessage(res.messageIndex);
                  }}
                  className={`p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                    isCurrent
                      ? 'bg-purple-950/40 border-purple-400 text-white'
                      : 'bg-zinc-900/60 border-transparent text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                    <span className="font-bold uppercase tracking-wider text-purple-400">
                      {res.role === 'user' ? 'You' : 'Nexus AI'}
                    </span>
                    <span>#{idx + 1}</span>
                  </div>
                  <p className="line-clamp-2 leading-relaxed text-zinc-300">
                    {res.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInChatModal;
