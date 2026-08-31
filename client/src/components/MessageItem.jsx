import React, { useState } from 'react';
import { 
  Copy, Check, RotateCcw, User, Bot, Volume2, VolumeX, Download, 
  FileText, Bookmark, Sparkles, BookOpen, GitCompare, Play, ThumbsUp, ThumbsDown, ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import GeneratedImageCard from './GeneratedImageCard';

const MessageItem = ({
  message,
  isLastAiMessage,
  onRegenerate,
  isRegenerating,
  onOpenLightbox,
  onEditImage,
  onRegenerateImage,
  onSelectSuggestion,
  onOpenReadingMode,
  onOpenCodeDiff,
  onContinueResponse
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSavedToNotes, setIsSavedToNotes] = useState(false);
  const [reaction, setReaction] = useState(null); // 'like' | 'dislike' | null

  const { token } = useAuth();
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const isUser = message.role === 'user';
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : (typeof message.attachments === 'string' ? JSON.parse(message.attachments || '[]') : []);

  const imageAttachments = attachments.filter(a => a.type === 'image' || a.url);
  const fileAttachments = attachments.filter(a => a.type !== 'image' && !a.url);

  // Clean redundant image markdown and parameter text if present
  let displayContent = message.content || '';
  if (imageAttachments.length > 0 && !isUser) {
    displayContent = displayContent
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/###\s*🎨\s*Generated Image:.*?\n+/gi, '')
      .replace(/\*\*Visual Parameters:\*\*[\s\S]*?(?=(?:\n\n[^\-\*]|$))/gi, '')
      .replace(/\*You can ask to modify[\s\S]*?\*/gi, '')
      .trim();
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      showToast('Message copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleCopyCode = async (codeText, index) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      showToast('Code snippet copied!', 'success');
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadCode = (codeText, lang = 'txt') => {
    const extMap = { javascript: 'js', python: 'py', html: 'html', css: 'css', json: 'json', markdown: 'md', typescript: 'ts', sql: 'sql' };
    const ext = extMap[lang.toLowerCase()] || 'txt';
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded as .${ext}`, 'info');
  };

  const handleSaveToNotes = async (content, title = 'AI Note', tag = 'Ideas') => {
    if (!token) {
      showToast('Please log in to save notes.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.slice(0, 45),
          content,
          tags: [tag]
        })
      });
      if (res.ok) {
        setIsSavedToNotes(true);
        showToast('Saved to AI Notes!', 'success');
        setTimeout(() => setIsSavedToNotes(false), 3000);
      }
    } catch (e) {
      showToast('Failed to save note.', 'error');
    }
  };

  const handleSpeakText = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported by your browser.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = (displayContent || message.content).replace(/[*#`_$[\]]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex w-full my-2 sm:my-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Badge */}
        <div
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md text-xs font-bold select-none transition-transform hover:scale-105"
          style={{
            background: isUser ? '#4D4D52' : `linear-gradient(135deg, ${accentColor}, #38BDF8)`,
            color: isUser ? '#FFFFFF' : '#1E142B'
          }}
        >
          {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>

        {/* Message Container */}
        <div className="flex flex-col min-w-0">
          <div
            className={`px-3.5 py-2.5 sm:px-5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-md transition-all ${
              isUser
                ? 'bg-[#4D4D52] hover:bg-[#525258] text-white rounded-tr-none border border-white/10'
                : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-black/5 dark:border-white/10 backdrop-blur-xl hover:shadow-lg'
            }`}
          >
            {/* File Attachments */}
            {fileAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {fileAttachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-xs text-white">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">{att.name || 'document'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Image Cards */}
            {imageAttachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {imageAttachments.map((imgAtt, idx) => (
                  <GeneratedImageCard
                    key={idx}
                    attachment={imgAtt}
                    onOpenLightbox={onOpenLightbox}
                    onEditImage={onEditImage}
                    onRegenerateImage={onRegenerateImage}
                  />
                ))}
              </div>
            )}

            {/* Text Message Content */}
            {displayContent && (
              isUser ? (
                <p className="whitespace-pre-wrap break-words text-xs sm:text-sm md:text-base leading-relaxed font-normal">
                  {displayContent}
                </p>
              ) : (
                <div className="markdown-content text-xs sm:text-sm md:text-base leading-relaxed break-words space-y-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                      h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold mt-2.5 mb-1 border-b pb-1 border-zinc-200 dark:border-zinc-700 text-purple-700 dark:text-purple-300">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold mt-2 mb-1 text-purple-600 dark:text-purple-400">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs sm:text-sm font-bold mt-1.5 mb-0.5">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc pl-4 sm:pl-5 my-1 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 sm:pl-5 my-1 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li className="my-0.5">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold text-zinc-950 dark:text-white">{children}</strong>,
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-xs sm:text-sm">{children}</table>
                        </div>
                      ),
                      th: ({ children }) => <th className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 font-bold text-left">{children}</th>,
                      td: ({ children }) => <td className="px-2.5 py-1.5 border-t border-zinc-200 dark:border-zinc-700">{children}</td>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-purple-400 dark:border-purple-500 pl-2.5 italic my-1.5 text-zinc-600 dark:text-zinc-300 bg-purple-50/50 dark:bg-purple-950/30 py-1 rounded-r-xl">
                          {children}
                        </blockquote>
                      ),
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');

                        if (inline) {
                          return (
                            <code className="bg-zinc-200/90 dark:bg-zinc-800 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono font-medium border border-black/5 dark:border-white/5">
                              {children}
                            </code>
                          );
                        }

                        const lang = match ? match[1] : 'text';
                        const codeId = Math.random();

                        return (
                          <div className="relative my-2.5 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700/80 bg-zinc-950 text-zinc-100 text-xs sm:text-sm font-mono shadow-lg">
                            <div className="flex justify-between items-center px-3 py-1.5 bg-zinc-900 text-zinc-400 text-[11px] border-b border-zinc-800">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                                <span className="w-2 h-2 rounded-full bg-green-500/80" />
                                <span className="uppercase font-bold tracking-wider text-purple-400 ml-1">{lang}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {onOpenCodeDiff && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenCodeDiff(codeString, codeString, lang)}
                                    className="flex items-center gap-1 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                    title="View Code Revision & Diff"
                                  >
                                    <GitCompare className="w-3 h-3 text-sky-400" />
                                    <span className="hidden sm:inline">Diff</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSaveToNotes(codeString, `${lang.toUpperCase()} Snippet`, 'Code')}
                                  className="flex items-center gap-1 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                  title="Save snippet to AI Notes"
                                >
                                  <Bookmark className="w-3 h-3 text-amber-400" />
                                  <span className="hidden sm:inline">Note</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadCode(codeString, lang)}
                                  className="flex items-center gap-1 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                  title="Save snippet to file"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="hidden sm:inline">Save</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(codeString, codeId)}
                                  className="flex items-center gap-1 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                  title="Copy code"
                                >
                                  {copiedCodeIndex === codeId ? (
                                    <>
                                      <Check className="w-3 h-3 text-green-400" />
                                      <span className="text-green-400 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                            <pre className="p-3 overflow-x-auto leading-relaxed">
                              <code>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
                </div>
              )
            )}
          </div>

          {/* Action Bar */}
          <div className={`flex items-center gap-1.5 sm:gap-2 mt-1 px-1 text-[11px] text-zinc-500 dark:text-zinc-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span>{formatTimestamp(message.created_at)}</span>

            {!isUser && (
              <>
                {/* Reading Mode Button */}
                {displayContent.length > 250 && onOpenReadingMode && (
                  <button
                    type="button"
                    onClick={() => onOpenReadingMode(displayContent, 'Reading Mode')}
                    className="flex items-center gap-1 hover:text-purple-400 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                    title="Open in Distraction-Free Reading Mode"
                  >
                    <BookOpen className="w-3 h-3 text-purple-400" />
                    <span>Read</span>
                  </button>
                )}

                {/* Bookmark/Note */}
                <button
                  type="button"
                  onClick={() => handleSaveToNotes(displayContent || message.content, 'AI Content', 'Learning')}
                  className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                  title="Save response to Notes"
                >
                  <Bookmark className={`w-3 h-3 ${isSavedToNotes ? 'text-amber-500 fill-amber-500' : ''}`} />
                  <span>{isSavedToNotes ? 'Saved' : 'Note'}</span>
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                  title="Copy response"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Listen */}
                <button
                  type="button"
                  onClick={handleSpeakText}
                  className={`flex items-center gap-1 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${
                    isSpeaking ? 'text-purple-600 dark:text-purple-400 font-bold animate-pulse' : 'hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title={isSpeaking ? "Stop reading" : "Read aloud (Text-to-Speech)"}
                >
                  {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>

                {/* Like / Dislike Reactions */}
                <button
                  type="button"
                  onClick={() => setReaction(prev => prev === 'like' ? null : 'like')}
                  className={`p-1 rounded transition-colors ${reaction === 'like' ? 'text-green-500 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'}`}
                  title="Good response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setReaction(prev => prev === 'dislike' ? null : 'dislike')}
                  className={`p-1 rounded transition-colors ${reaction === 'dislike' ? 'text-red-500 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'}`}
                  title="Needs improvement"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>

                {/* Continue Response (Requirement 23) */}
                {isLastAiMessage && onContinueResponse && (
                  <button
                    type="button"
                    onClick={onContinueResponse}
                    disabled={isRegenerating}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold transition-colors p-1 rounded hover:bg-purple-500/10"
                    title="Continue generating more details"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Continue</span>
                  </button>
                )}

                {/* Regenerate */}
                {isLastAiMessage && onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                    title="Regenerate response"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? '...' : 'Regenerate'}</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Contextual Follow-Up Suggestions */}
          {isLastAiMessage && message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1 animate-fadeIn">
              {message.suggestions.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
