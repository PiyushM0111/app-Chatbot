import React from 'react';
import { X, Globe, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English (Global)',
    sample: 'Hi! How can I assist you with your tasks today?'
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी (Devanagari)',
    sample: 'नमस्ते! मैं आज आपकी किस प्रकार सहायता कर सकता हूँ?'
  },
  {
    id: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish (Conversational)',
    sample: 'Hello bhai! Batao aaj kya explore karna hai?'
  },
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    sample: '¡Hola! ¿En qué puedo ayudarte hoy?'
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    sample: 'Bonjour! Comment puis-je vous aider aujourd\'hui?'
  }
];

const LanguageModal = ({ isOpen, onClose, currentLanguage, onSelectLanguage }) => {
  const { accentColor } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-black/5 dark:border-white/10 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ backgroundColor: accentColor, color: '#33223B' }}
          >
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Language Preference
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select your primary AI conversational language
            </p>
          </div>
        </div>

        {/* Language Options */}
        <div className="mt-3 sm:mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-chat-scroller">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.id;

            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                      {lang.nativeName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      ({lang.name})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 italic">
                    "{lang.sample}"
                  </p>
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
    </div>
  );
};

export default LanguageModal;
