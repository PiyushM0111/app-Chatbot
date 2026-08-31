import React, { useState } from 'react';
import { X, GitCompare, Copy, Check, FileCode, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CodeDiffModal = ({ isOpen, onClose, originalCode = '', modifiedCode = '', language = 'javascript' }) => {
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' | 'before' | 'after'
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCopyFinal = async () => {
    try {
      await navigator.clipboard.writeText(modifiedCode || originalCode);
      setCopied(true);
      showToast('Modified code copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  // Simple line-by-line diff computation
  const origLines = (originalCode || '').split('\n');
  const modLines = (modifiedCode || '').split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 text-white rounded-3xl border border-white/15 shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Code Revision & Diff View</h3>
              <p className="text-[10px] text-zinc-400 uppercase font-mono">{language}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${activeTab === 'diff' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Diff
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('before')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${activeTab === 'before' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Before
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('after')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${activeTab === 'after' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                After
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyFinal}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Final</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Content View */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-chat-scroller bg-zinc-950">
          {activeTab === 'before' && (
            <pre className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 overflow-x-auto text-red-300">
              <code>{originalCode}</code>
            </pre>
          )}

          {activeTab === 'after' && (
            <pre className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 overflow-x-auto text-emerald-300">
              <code>{modifiedCode}</code>
            </pre>
          )}

          {activeTab === 'diff' && (
            <div className="space-y-1">
              {origLines.map((line, idx) => {
                const isChanged = modLines[idx] !== line;
                return (
                  <div key={`orig-${idx}`} className={`px-2 py-0.5 rounded ${isChanged ? 'bg-red-950/40 text-red-400' : 'text-zinc-400'}`}>
                    <span className="inline-block w-8 text-zinc-600 select-none">{idx + 1}</span>
                    <span>{isChanged ? '- ' : '  '}{line}</span>
                  </div>
                );
              })}
              {modLines.slice(origLines.length).map((line, idx) => (
                <div key={`mod-add-${idx}`} className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400">
                  <span className="inline-block w-8 text-zinc-600 select-none">{origLines.length + idx + 1}</span>
                  <span>+ {line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeDiffModal;
