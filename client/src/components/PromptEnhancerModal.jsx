import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, X, Edit3, Wand2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const enhancePromptText = (original) => {
  const clean = (original || '').trim();
  if (!clean) return '';
  const lower = clean.toLowerCase();

  if (lower.startsWith('build') || lower.includes('create an api') || lower.includes('app')) {
    return `Act as a Principal Software Engineer. ${clean}\n\nPlease provide:\n1. Architectural overview & system components\n2. Production-ready, syntactically complete code with error handling\n3. Step-by-step setup and execution instructions\n4. Security & scalability best practices.`;
  }
  if (lower.startsWith('explain') || lower.startsWith('what is') || lower.startsWith('teach me')) {
    return `Explain the following topic thoroughly with intuitive analogies, core fundamentals, practical real-world examples, and common pitfalls to avoid:\n"${clean}"`;
  }
  if (lower.startsWith('fix') || lower.startsWith('debug') || lower.includes('error')) {
    return `Analyze and debug this code systematically:\n1. Identify the root cause of the bug\n2. Provide the corrected, fully-working code\n3. Explain the mechanical reason for the fix and how to prevent similar regressions.`;
  }
  if (lower.includes('image') || lower.includes('photo') || lower.includes('render')) {
    return `${clean}, highly detailed, cinematic lighting, 8k resolution, photorealistic textures, master composition, unreal engine 5 render.`;
  }
  return `Act as an expert AI specialist. ${clean}\n\nPlease provide a clear, comprehensive, and well-structured response with practical examples, clear sections, and actionable insights.`;
};

const PromptEnhancerModal = ({ isOpen, onClose, originalPrompt, onApplyEnhanced }) => {
  const { accentColor } = useTheme();
  const { showToast } = useToast();
  const [enhancedText, setEnhancedText] = useState(() => enhancePromptText(originalPrompt));
  const [isEditing, setIsEditing] = useState(false);

  // Update whenever modal opens or original changes
  React.useEffect(() => {
    if (isOpen) {
      setEnhancedText(enhancePromptText(originalPrompt));
      setIsEditing(false);
    }
  }, [isOpen, originalPrompt]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyEnhanced(enhancedText);
    showToast('Enhanced prompt applied!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-zinc-950 text-white rounded-3xl border border-white/15 shadow-2xl p-5 sm:p-7 z-10 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 active:scale-95 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 text-left">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #F472B6)`, color: '#20112A' }}
          >
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Prompt Enhancer</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Transform simple prompts into clear, highly-detailed, expert-level instructions.
            </p>
          </div>
        </div>

        {/* Comparison Layout */}
        <div className="space-y-4 text-left">
          {/* Original Prompt */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1.5 px-1">
              Original Prompt
            </span>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {originalPrompt || '(Empty prompt)'}
            </div>
          </div>

          {/* Enhanced Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enhanced & Structured Prompt</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(prev => !prev)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Preview' : 'Edit Text'}</span>
              </button>
            </div>

            {isEditing ? (
              <textarea
                rows={5}
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-purple-500/50 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 leading-relaxed custom-chat-scroller"
              />
            ) : (
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-xs sm:text-sm text-purple-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                {enhancedText}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors border border-white/5 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Use Enhanced Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptEnhancerModal;
