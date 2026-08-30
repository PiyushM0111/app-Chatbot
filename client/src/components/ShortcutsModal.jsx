import React from 'react';
import { X, Command } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SHORTCUTS = [
  { key: 'Ctrl/Cmd + K', desc: 'Open Chat History & Search' },
  { key: 'Ctrl/Cmd + N', desc: 'Start a Fresh New Chat' },
  { key: 'Ctrl/Cmd + P', desc: 'Open Prompt Template Library' },
  { key: 'Enter', desc: 'Send Message' },
  { key: 'Shift + Enter', desc: 'Insert New Line in Text Box' },
  { key: 'Esc', desc: 'Dismiss Active Modal / Drawer' },
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  const { accentColor } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl z-10 border border-black/5 dark:border-white/10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: accentColor, color: '#33223B' }}
          >
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Keyboard Shortcuts</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Power user keyboard shortcuts</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {SHORTCUTS.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs"
            >
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.desc}</span>
              <kbd className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-bold shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
