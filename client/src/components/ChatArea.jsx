import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import QuickPrompts from './QuickPrompts';
import { AlertCircle, RotateCcw, Bot, ArrowDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ChatArea = ({
  messages = [],
  isLoading,
  error,
  onRetry,
  onRegenerate,
  onSelectPrompt,
  onOpenPrompts,
  isRegenerating,
  onOpenLightbox,
  onEditImage,
  onRegenerateImage,
  onSelectSuggestion
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const { accentColor } = useTheme();

  // Scroll detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Auto-scroll when messages update
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages, isLoading, isRegenerating]);

  return (
    <div className="relative flex-1 flex flex-col w-full h-full overflow-hidden">
      {/* Full-Width Scrollable Container -> Places Scrollbar at the far right edge of the screen */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto relative z-10 custom-chat-scroller"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(168, 85, 247, 0.5) transparent'
        }}
      >
        {/* Centered Content Wrapper for readable messages max width */}
        <div className="max-w-4xl mx-auto w-full px-2.5 sm:px-4 md:px-8 pt-24 sm:pt-28 pb-28 sm:pb-36 min-h-full flex flex-col justify-start">
          {messages.length === 0 ? (
            <QuickPrompts onSelectPrompt={onSelectPrompt} onOpenPrompts={onOpenPrompts} />
          ) : (
            <div className="space-y-1">
              {messages.map((msg, index) => {
                const isLastAi = !isLoading && index === messages.length - 1 && msg.role === 'model';

                return (
                  <MessageItem
                    key={msg.id || index}
                    message={msg}
                    isLastAiMessage={isLastAi}
                    onRegenerate={onRegenerate}
                    isRegenerating={isRegenerating}
                    onOpenLightbox={onOpenLightbox}
                    onEditImage={onEditImage}
                    onRegenerateImage={onRegenerateImage}
                    onSelectSuggestion={onSelectSuggestion}
                  />
                );
              })}

              {/* Live Generation Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 my-4 animate-fadeIn">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md text-xs"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, #38BDF8)`,
                      color: '#1E142B'
                    }}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white/90 dark:bg-zinc-900/90 px-4 py-3 rounded-3xl rounded-tl-none border border-black/5 dark:border-white/10 backdrop-blur-xl flex items-center gap-2 shadow-sm">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Processing response...
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Banner with Retry */}
              {error && (
                <div className="my-4 p-4 rounded-2xl bg-red-50/95 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 flex items-center justify-between gap-3 backdrop-blur-xl animate-fadeIn shadow-md">
                  <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex-shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-28 right-8 z-30 p-2.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xl border border-black/10 dark:border-white/10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center animate-bounce"
          title="Scroll to bottom"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatArea;
