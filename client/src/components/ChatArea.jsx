import React, { useRef, useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import QuickPrompts from './QuickPrompts';
import { AlertCircle, RotateCcw, Bot, ArrowDown, UploadCloud } from 'lucide-react';
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
  onSelectSuggestion,
  onOpenReadingMode,
  onOpenCodeDiff,
  onContinueResponse,
  onDropFiles,
  generationStatus = 'Thinking...'
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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

  // Auto-scroll when messages update, but only if user hasn't scrolled up
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages, isLoading, isRegenerating]);

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onDropFiles) onDropFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col w-full h-full overflow-hidden"
    >
      {/* Desktop Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-40 bg-purple-950/80 backdrop-blur-md border-2 border-dashed border-purple-400 rounded-3xl m-4 flex flex-col items-center justify-center text-white animate-fadeIn pointer-events-none">
          <UploadCloud className="w-16 h-16 text-purple-400 mb-3 animate-bounce" />
          <h3 className="text-xl font-bold">Drop files here to attach</h3>
          <p className="text-xs text-zinc-300 mt-1">Upload code, images, or documents to conversation</p>
        </div>
      )}

      {/* Full-Width Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto overflow-x-hidden relative z-10 custom-chat-scroller"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(168, 85, 247, 0.4) transparent'
        }}
      >
        {/* Responsive Centered Content Wrapper */}
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 md:px-8 pt-3 sm:pt-6 pb-28 sm:pb-36 min-h-full flex flex-col justify-start">
          {messages.length === 0 ? (
            <div className="my-auto py-4">
              <QuickPrompts onSelectPrompt={onSelectPrompt} onOpenPrompts={onOpenPrompts} />
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 w-full">
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
                    onOpenReadingMode={onOpenReadingMode}
                    onOpenCodeDiff={onOpenCodeDiff}
                    onContinueResponse={onContinueResponse}
                  />
                );
              })}

              {/* Contextual Generation Status Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 sm:gap-3 my-3 animate-fadeIn">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md text-xs"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, #38BDF8)`,
                      color: '#1E142B'
                    }}
                  >
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="bg-white/90 dark:bg-zinc-900/90 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/10 backdrop-blur-xl flex items-center gap-2 shadow-sm">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {generationStatus || 'Generating response...'}
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
                <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-red-50/95 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 flex items-center justify-between gap-3 backdrop-blur-xl animate-fadeIn shadow-md">
                  <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex-shrink-0 active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Floating Jump to Latest Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-24 sm:bottom-28 right-4 sm:right-8 z-30 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-xl border border-white/15 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold animate-bounce"
          title="Scroll to latest messages"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown className="w-4 h-4" />
          <span>{isLoading ? 'New response' : 'Jump to latest'}</span>
        </button>
      )}
    </div>
  );
};

export default ChatArea;
