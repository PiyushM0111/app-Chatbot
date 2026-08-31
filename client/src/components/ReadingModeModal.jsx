import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, List, Type, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useToast } from '../context/ToastContext';

const ReadingModeModal = ({ isOpen, onClose, content = '', title = 'Reading Mode' }) => {
  const [fontSize, setFontSize] = useState('text-base');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  // Extract headings for Table of Contents
  const headings = [];
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/[*_`]/g, '').trim(),
        lineIndex: index
      });
    }
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('Article copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      {/* Dark Ambient Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity" onClick={onClose} />

      {/* Main Reader View */}
      <div className="relative w-full max-w-4xl h-[92vh] bg-zinc-950 text-white rounded-3xl border border-white/15 shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Reader Toolbar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
              <p className="text-[10px] text-zinc-400 font-mono">Distraction-Free Reading Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size toggles */}
            <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-xl border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setFontSize('text-sm')}
                className={`px-2 py-0.5 rounded-lg ${fontSize === 'text-sm' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('text-base')}
                className={`px-2 py-0.5 rounded-lg ${fontSize === 'text-base' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('text-lg')}
                className={`px-2 py-0.5 rounded-lg ${fontSize === 'text-lg' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Copy entire text"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reader Layout: Content + Section Navigator */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Prose Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-chat-scroller">
            <div className={`max-w-2xl mx-auto ${fontSize} leading-relaxed text-zinc-200 markdown-content space-y-4`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-extrabold text-white border-b border-white/10 pb-2 mt-6 mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-purple-300 mt-5 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold text-purple-400 mt-4 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="leading-relaxed mb-3 text-zinc-300">{children}</p>,
                  code: ({ inline, children }) => inline
                    ? <code className="bg-zinc-800 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>
                    : <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-200 overflow-x-auto text-xs font-mono border border-white/10 my-4"><code>{children}</code></pre>
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Optional Table of Contents Sidebar (Desktop) */}
          {headings.length > 2 && (
            <div className="w-64 border-l border-white/10 p-5 overflow-y-auto hidden md:block bg-zinc-900/40">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-3">
                <List className="w-3.5 h-3.5" />
                <span>Table of Contents</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {headings.map((h, i) => (
                  <div
                    key={i}
                    className={`text-zinc-400 hover:text-white transition-colors cursor-pointer truncate ${h.level === 1 ? 'font-bold text-zinc-200' : h.level === 2 ? 'pl-2' : 'pl-4'}`}
                  >
                    {h.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingModeModal;
