import React, { useRef, useEffect, useState } from 'react';
import { Plus, Mic, MicOff, Square, Sparkles, Image, BookOpen, Command } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AttachmentPreview from './AttachmentPreview';

const SMART_PLACEHOLDERS = [
  'Ask me anything...',
  'Build something...',
  'Explain a concept...',
  'Debug your code...',
  'Create an image...',
  'Tell me about cybersecurity...'
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
  onOpenPromptLibrary,
  onOpenShortcuts,
  currentMode = 'general',
  disabled = false
}) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const recognitionRef = useRef(null);

  const { accentColor } = useTheme();
  const { showToast } = useToast();

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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

  // Click outside to close plus menu
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
        console.error('Speech recognition error:', event.error);
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
    <div className="fixed bottom-0 left-0 right-0 z-30 pb-2 sm:pb-3.5 pt-2 px-2 sm:px-4 bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-zinc-950/95 dark:via-zinc-950/80 dark:to-transparent backdrop-blur-md pointer-events-none">
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center pointer-events-auto">
        {/* Live Attachment Thumbnails Preview */}
        {attachments.length > 0 && (
          <div className="w-full mb-2">
            <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
          </div>
        )}

        {/* Elongated Dark Capsule Input Bar */}
        <div className="w-full relative group">
          <div
            className="w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-2xl transition-all duration-300 border border-white/15 backdrop-blur-2xl"
            style={{
              backgroundColor: '#3E3E43',
            }}
          >
            {/* Plus (+) Menu Trigger */}
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                title="Add Attachment, Prompt Templates, Shortcuts"
                aria-label="Add options menu"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isMenuOpen
                    ? 'bg-white/20 text-white rotate-45'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Popup Menu */}
              {isMenuOpen && (
                <div className="absolute bottom-11 left-0 w-48 sm:w-56 bg-zinc-900/95 dark:bg-zinc-800/95 rounded-2xl p-1 shadow-2xl border border-white/10 backdrop-blur-2xl z-50 animate-scaleUp">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Image className="w-4 h-4 text-purple-400" />
                    <span>Upload Image / Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onOpenPromptLibrary) onOpenPromptLibrary();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Prompt Library</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onOpenShortcuts) onOpenShortcuts();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Command className="w-4 h-4 text-sky-400" />
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
              className="flex-1 bg-transparent text-white placeholder-zinc-400 text-xs sm:text-sm md:text-base px-2 py-1 resize-none focus:outline-none max-h-36 leading-relaxed"
            />

            {/* Right Action Icons Container */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Voice Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? "Stop listening" : "Voice input (Speech-to-Text)"}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {/* Modes Button */}
              <button
                type="button"
                onClick={onOpenModes}
                title={`Current Mode: ${currentMode}. Click to change.`}
                aria-label="Change AI Mode"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full orb-gradient transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center shadow-md group relative flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Send / Stop Pill Button */}
              <button
                type="button"
                onClick={handleActionClick}
                disabled={(!inputMessage.trim() && attachments.length === 0 && !isLoading) || disabled}
                title={isLoading ? "Stop Generating" : "Send Message"}
                aria-label={isLoading ? "Stop generating AI response" : "Send message"}
                className={`h-7 sm:h-8 px-3 sm:px-3.5 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md flex-shrink-0 ${
                  isLoading
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : inputMessage.trim() || attachments.length > 0
                    ? 'bg-[#FF3B30] hover:bg-[#E02F24] text-white hover:scale-105'
                    : 'bg-[#FF3B30]/60 text-white/60 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                ) : (
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInputBar;
