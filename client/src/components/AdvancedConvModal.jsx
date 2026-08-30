import React, { useState } from 'react';
import { X, Sparkles, Sliders, Cpu, MessageSquareQuote, Check, Wand2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Recommended', desc: 'Next-gen multimodal model with superior reasoning speed & real-time responsiveness' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Logic', desc: 'Complex reasoning, multi-file code architectures, mathematics, and comprehensive analysis' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'Ultra Fast', desc: 'High-throughput lightweight model tailored for instant chat, translation, and summaries' },
];

const PRESET_PROMPTS = [
  { label: 'Senior Code Architect', prompt: 'You are a Senior Principal Software Architect. Always provide clean, modular, production-ready code with SOLID principles, error handling, and performance considerations.' },
  { label: 'Empathetic Companion', prompt: 'You are a warm, compassionate, and attentive companion. Listen deeply, acknowledge emotions with genuine empathy, and offer thoughtful, uplifting support.' },
  { label: 'Concise & Direct', prompt: 'Be extremely direct, concise, and factual. Omit conversational filler. Prioritize bullet points and direct answers without unnecessary preamble.' },
  { label: 'Hinglish Tech Mentor', prompt: 'Bhai style friendly tech mentor. Explain complex computer science and coding topics in clear, natural Hinglish with real-world analogies.' },
];

const AdvancedConvModal = ({
  isOpen,
  onClose,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  systemPrompt,
  setSystemPrompt,
  onSave
}) => {
  const { accentColor } = useTheme();
  const [localModel, setLocalModel] = useState(selectedModel || 'gemini-2.0-flash');
  const [localTemp, setLocalTemp] = useState(temperature || 0.7);
  const [localPrompt, setLocalPrompt] = useState(systemPrompt || '');

  if (!isOpen) return null;

  const handleSave = () => {
    setSelectedModel(localModel);
    setTemperature(localTemp);
    setSystemPrompt(localPrompt);
    if (onSave) onSave({ model: localModel, temperature: localTemp, systemPrompt: localPrompt });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[88vh] overflow-y-auto animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ backgroundColor: accentColor, color: '#33223B' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Advanced AI Parameters
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize model engine, response temperature, and persona instructions
            </p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span>AI Model Engine</span>
          </label>
          <div className="space-y-2">
            {MODELS.map((m) => {
              const isSelected = localModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLocalModel(m.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        {m.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        {m.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {m.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 shadow-sm"
                      style={{ backgroundColor: accentColor, color: '#33223B' }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-500" />
              <span>Creativity (Temperature: {localTemp})</span>
            </label>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {localTemp < 0.4 ? 'Precise & Deterministic' : localTemp > 0.8 ? 'Creative & Imaginative' : 'Balanced'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={localTemp}
            onChange={(e) => setLocalTemp(parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>0.0 (Strict Logic)</span>
            <span>0.7 (Standard)</span>
            <span>1.5 (High Entropy)</span>
          </div>
        </div>

        {/* System Prompt & Persona Presets */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-purple-500" />
            <span>Custom System Persona</span>
          </label>

          {/* Quick Persona Pills */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLocalPrompt(preset.prompt)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 transition-colors flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-700/60"
              >
                <Wand2 className="w-3 h-3 text-purple-500" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="e.g. Always respond in step-by-step bullet points with clear code examples..."
            className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none leading-relaxed"
          />
        </div>

        {/* Save CTA */}
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105 active:scale-95 text-zinc-900"
            style={{ backgroundColor: accentColor }}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConvModal;
