import React, { useRef, useEffect, useState } from 'react';
import { 
  Plus, Mic, MicOff, Square, Sparkles, Image, BookOpen, Command, 
  Send, Globe, Code, FileText, Wand2, Calculator, ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AttachmentPreview from './AttachmentPreview';
import PromptEnhancerModal from './PromptEnhancerModal';

const SMART_PLACEHOLDERS = [
  'Ask me anything...',
  'Build a full-stack project...',
  'Explain a concept simply...',
  'Debug or refactor code...',
  'Create an image of...',
  'Teach me cybersecurity...'
];

const ChatInputBar = ({
  inputMessage,
  setInputMessage,
  attachments = [],
  setAttachments,
  onSendMessage,
  onStopGeneration,
  isLoading,
  onOpenModes,
  onOpenPrompts,
  onOpenShortcuts,
  onNewChat,
  currentMode = 'general',
  disabled = false
}) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const recognitionRef = useRef(null);

  const { accentColor } = useTheme();
  const { showToast } = useToast();

  // Detect real-time intent as user types
  const getDetectedIntentBadge = () => {
    const text = inputMessage.toLowerCase().trim();
    if (!text) return null;

    if (text.startsWith('/image') || text.includes('generate image') || text.includes('create an image') || text.includes('draw a') || text.includes('photo of')) {
      return { icon: Image, label: 'Image Studio Intent', color: '#38BDF8' };
    }
    if (
      text.startsWith('/search') || text.includes('search web') || text.includes('look up') ||
      text.includes('sih') || text.includes('smart india hackathon') || text.includes('latest news') ||
      text.includes('latest release') || text.includes('today\'s weather') || text.includes('current price') ||
      text.includes('colleges offering') || text.includes('official website')
    ) {
      return { icon: Globe, label: 'Live Web Search', color: '#10B981' };
    }
    if (text.includes('def ') || text.includes('function ') || text.startsWith('/code') || text.includes('build api') || text.includes('fix this code')) {
      return { icon: Code, label: 'Code Architect Mode', color: '#A855F7' };
    }
    if (text.startsWith('/calc') || /\b\d+\s*[\+\-\*\/%]\s*\d+\b/.test(text)) {
      return { icon: Calculator, label: 'Exact Math Evaluator', color: '#F59E0B' };
    }
    return null;
  };

  const detectedBadge = getDetectedIntentBadge();

  // Subtle rotating placeholder every 4 seconds when input is empty
  useEffect(() => {
    if (inputMessage.trim().length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SMART_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [inputMessage]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // Restore saved composer draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('nexus_composer_draft');
    if (savedDraft && !inputMessage) {
      setInputMessage(savedDraft);
    }
  }, []);

  // Persist composer draft
  useEffect(() => {
    if (inputMessage) {
      localStorage.setItem('nexus_composer_draft', inputMessage);
    } else {
      localStorage.removeItem('nexus_composer_draft');
    }
  }, [inputMessage]);

  // Click outside to close tool menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        setIsListening(false);
        showToast('Microphone input ended or not allowed.', 'error');
      };

      recognitionRef.current = recognition;
    }
  }, [setInputMessage, showToast]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... Speak now', 'info');
      } catch (err) {
        console.error('Failed to start speech:', err);
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              type: 'image',
              data: uploadEvent.target.result,
              mimeType: file.type,
              size: file.size
            }
          ]);
          showToast(`Attached image: ${file.name}`, 'info');
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              type: 'file',
              content: uploadEvent.target.result,
              size: file.size
            }
          ]);
          showToast(`Attached file: ${file.name}`, 'info');
        };
        reader.readAsText(file);
      }
    });

    setIsMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (inputMessage.trim() || attachments.length > 0)) {
        onSendMessage();
      }
    }
  };

  const handleActionClick = () => {
    if (isLoading) {
      onStopGeneration();
    } else {
      onSendMessage();
    }
  };

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 z-30 pt-1.5 px-3 sm:px-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center pointer-events-auto">
          {/* Real-time Intent Chip Indicator */}
          {detectedBadge && (
            <div className="w-full flex items-center justify-between px-3 py-1 mb-1.5 rounded-xl bg-zinc-900/80 border border-white/10 backdrop-blur-md animate-fadeIn text-xs">
              <div className="flex items-center gap-1.5">
                <detectedBadge.icon className="w-3.5 h-3.5" style={{ color: detectedBadge.color }} />
                <span className="font-semibold text-zinc-200">{detectedBadge.label} detected</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEnhancerOpen(true)}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>Enhance</span>
              </button>
            </div>
          )}

          {/* Live Attachment Thumbnails Preview */}
          {attachments.length > 0 && (
            <div className="w-full mb-2">
              <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
            </div>
          )}

          {/* Responsive Capsule Input Bar */}
          <div className="w-full relative group">
            <div
              className="w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl sm:rounded-full shadow-2xl transition-all duration-300 border border-white/15 backdrop-blur-2xl bg-zinc-800/90"
            >
              {/* Plus (+) Comprehensive Tool Menu */}
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  title="Open Tool Menu (Uploads, Search, Shortcuts)"
                  aria-label="Add options menu"
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    isMenuOpen
                      ? 'bg-white/20 text-white rotate-45'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                </button>

                {/* Popover / Sheet Menu */}
                {isMenuOpen && (
                  <div className="absolute bottom-12 left-0 w-56 bg-zinc-950/95 rounded-2xl p-1.5 shadow-2xl border border-white/15 backdrop-blur-2xl z-50 animate-scaleUp text-left space-y-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                    >
                      <Image className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Upload Image / File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputMessage('/image ');
                        setIsMenuOpen(false);
                        textareaRef.current?.focus();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <span>Generate Image (/image)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputMessage('/search ');
                        setIsMenuOpen(false);
                        textareaRef.current?.focus();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Live Web Search (/search)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onOpenPrompts) onOpenPrompts();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Prompt Library</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onOpenShortcuts) onOpenShortcuts();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                    >
                      <Command className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>Keyboard Shortcuts</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.txt,.js,.py,.json,.csv,.md,.html,.css,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Expanding Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={
                  isListening
                    ? "Listening to voice..."
                    : disabled
                    ? "Please log in to chat..."
                    : SMART_PLACEHOLDERS[placeholderIndex]
                }
                className="flex-1 bg-transparent text-white placeholder-zinc-400 text-sm sm:text-base px-2 py-1 resize-none focus:outline-none max-h-32 leading-relaxed"
              />

              {/* Right Action Controls Container */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                {/* Prompt Enhancer Trigger Button */}
                {inputMessage.trim().length > 4 && (
                  <button
                    type="button"
                    onClick={() => setIsEnhancerOpen(true)}
                    title="Enhance prompt clarity & structure"
                    className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Enhance</span>
                  </button>
                )}

                {/* Voice Speech-to-Text Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? "Stop listening" : "Voice input (Speech-to-Text)"}
                  aria-label="Voice input"
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Modes Shortcut (Desktop) */}
                {onOpenModes && (
                  <button
                    type="button"
                    onClick={onOpenModes}
                    title={`Current Mode: ${currentMode}. Click to change.`}
                    aria-label="Change AI Mode"
                    className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full orb-gradient transition-all duration-300 hover:scale-105 active:scale-95 items-center justify-center shadow-md group relative flex-shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-zinc-900 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                {/* Send / Stop Pill Button */}
                <button
                  type="button"
                  onClick={handleActionClick}
                  disabled={(!inputMessage.trim() && attachments.length === 0 && !isLoading) || disabled}
                  title={isLoading ? "Stop Generating" : "Send Message"}
                  aria-label={isLoading ? "Stop generating AI response" : "Send message"}
                  className={`h-8 sm:h-9 px-3 sm:px-3.5 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md flex-shrink-0 ${
                    isLoading
                      ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                      : inputMessage.trim() || attachments.length > 0
                      ? 'bg-[#FF3B30] hover:bg-[#E02F24] text-white hover:scale-105'
                      : 'bg-[#FF3B30]/50 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Square className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Enhancer Modal */}
      <PromptEnhancerModal
        isOpen={isEnhancerOpen}
        onClose={() => setIsEnhancerOpen(false)}
        originalPrompt={inputMessage}
        onApplyEnhanced={(enhanced) => setInputMessage(enhanced)}
      />
    </>
  );
};

export default ChatInputBar;
