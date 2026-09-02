import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import AtmosphericBackground from './components/AtmosphericBackground';
import HeaderControls from './components/HeaderControls';
import ModeSelectorBar from './components/ModeSelectorBar';
import ChatArea from './components/ChatArea';
import ChatInputBar from './components/ChatInputBar';
import ChatHistoryDrawer from './components/ChatHistoryDrawer';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import AdvancedConvModal from './components/AdvancedConvModal';
import ModesModal from './components/ModesModal';
import LanguageModal from './components/LanguageModal';
import PromptLibraryModal from './components/PromptLibraryModal';
import ShortcutsModal from './components/ShortcutsModal';
import CommandPaletteModal from './components/CommandPaletteModal';
import MemoryModal from './components/MemoryModal';
import ProjectsModal from './components/ProjectsModal';
import ImageGalleryModal from './components/ImageGalleryModal';
import LearningModal from './components/LearningModal';
import NotesModal from './components/NotesModal';
import ImageLightboxModal from './components/ImageLightboxModal';
import ThemeStudioModal from './components/ThemeStudioModal';
import SearchInChatModal from './components/SearchInChatModal';
import ReadingModeModal from './components/ReadingModeModal';
import CodeDiffModal from './components/CodeDiffModal';
import { getApiUrl, parseJsonResponse } from './utils/apiClient';
import { WifiOff, Maximize2, Minimize2, Search, Sparkles } from 'lucide-react';

function App() {
  const { user, token, loading } = useAuth();
  const { theme, accentColor } = useTheme();
  const { showToast, playSound } = useToast();

  // Chat & Conversation state
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('Thinking...');
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Settings & Parameters
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentMode, setCurrentMode] = useState('general');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState('');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAdvConvOpen, setIsAdvConvOpen] = useState(false);
  const [isModesOpen, setIsModesOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [isSearchInChatOpen, setIsSearchInChatOpen] = useState(false);

  // Reader, Diff & Lightbox Modal Data
  const [lightboxData, setLightboxData] = useState({ isOpen: false, url: '', alt: '' });
  const [readingModeData, setReadingModeData] = useState({ isOpen: false, content: '', title: '' });
  const [codeDiffData, setCodeDiffData] = useState({ isOpen: false, originalCode: '', modifiedCode: '', language: 'javascript' });

  const abortControllerRef = useRef(null);

  // Network Offline / Online Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Connection restored! Back online.', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast("You're offline. Drafts are safely preserved.", 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchInChatOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPromptLibraryOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsAuthOpen(false);
        setIsSettingsOpen(false);
        setIsHistoryOpen(false);
        setIsAdvConvOpen(false);
        setIsModesOpen(false);
        setIsLanguageOpen(false);
        setIsPromptLibraryOpen(false);
        setIsShortcutsOpen(false);
        setIsCommandPaletteOpen(false);
        setIsMemoryOpen(false);
        setIsProjectsOpen(false);
        setIsImageGalleryOpen(false);
        setIsLearningOpen(false);
        setIsSearchInChatOpen(false);
        setLightboxData({ isOpen: false, url: '', alt: '' });
        setReadingModeData({ isOpen: false, content: '', title: '' });
        setCodeDiffData({ isOpen: false, originalCode: '', modifiedCode: '', language: 'javascript' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all conversations for user
  const fetchConversations = useCallback(async () => {
    if (!token) {
      setConversations([]);
      return;
    }

    try {
      const res = await fetch(getApiUrl('/api/conversations'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        setConversations(data.conversations || []);
      } else if (res.status === 401) {
        showToast('Your session has expired. Please log in again.', 'error');
        setIsAuthOpen(true);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load specific conversation messages
  const loadConversation = useCallback(
    async (id) => {
      if (!token || !id) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(getApiUrl(`/api/conversations/${id}`), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await parseJsonResponse(res);
          setCurrentConversationId(id);
          setMessages(
            (data.messages || []).map((m) => ({
              ...m,
              attachments: typeof m.attachments === 'string' ? JSON.parse(m.attachments || '[]') : m.attachments || []
            }))
          );
          if (data.conversation) {
            setCurrentLanguage(data.conversation.language || 'en');
            setCurrentMode(data.conversation.mode || 'general');
            setSystemPrompt(data.conversation.system_prompt || '');
          }
        } else if (res.status === 401) {
          showToast('Your session has expired. Please log in again.', 'error');
          setIsAuthOpen(true);
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        showToast('Failed to load conversation history', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [token, showToast]
  );

  // Start fresh chat
  const handleNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setCurrentConversationId(null);
    setMessages([]);
    setInputMessage('');
    setAttachments([]);
    setError(null);
    setIsLoading(false);
    setIsRegenerating(false);
  }, []);

  // Handle Drag & Drop Files
  const handleDropFiles = (filesList) => {
    const files = Array.from(filesList);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              type: 'image',
              data: e.target.result,
              mimeType: file.type,
              size: file.size
            }
          ]);
          showToast(`Attached image: ${file.name}`, 'info');
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              type: 'file',
              content: e.target.result,
              size: file.size
            }
          ]);
          showToast(`Attached file: ${file.name}`, 'info');
        };
        reader.readAsText(file);
      }
    });
  };

  // Send message to AI
  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend !== null ? textToSend : inputMessage;
    if (!text.trim() && attachments.length === 0) return;
    if (isLoading || isRegenerating) return;

    if (!token) {
      setIsAuthOpen(true);
      showToast('Please sign in or create an account to start chatting.', 'info');
      return;
    }

    // Determine generation status label based on text
    const lower = text.toLowerCase();
    if (lower.startsWith('/image') || lower.includes('generate image') || lower.includes('create an image')) {
      setGenerationStatus('Creating image in Studio...');
    } else if (lower.startsWith('/search') || lower.includes('search web')) {
      setGenerationStatus('Searching live web & synthesizing...');
    } else if (lower.includes('def ') || lower.includes('function ') || lower.includes('build code') || lower.includes('api')) {
      setGenerationStatus('Architecting code & logic...');
    } else if (lower.includes('why') || lower.includes('explain') || lower.includes('compare')) {
      setGenerationStatus('Reasoning through fundamentals...');
    } else {
      setGenerationStatus('Thinking...');
    }

    const currentAttachments = [...attachments];
    setInputMessage('');
    setAttachments([]);
    setError(null);
    setIsLoading(true);

    const tempUserMsgId = `temp-user-${Date.now()}`;
    const tempAiMsgId = `temp-ai-${Date.now()}`;

    const userMessageObj = {
      id: tempUserMsgId,
      role: 'user',
      content: text,
      attachments: currentAttachments,
      created_at: new Date().toISOString()
    };

    const aiPlaceholderObj = {
      id: tempAiMsgId,
      role: 'model',
      content: '',
      attachments: [],
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessageObj, aiPlaceholderObj]);
    playSound('send');

    try {
      abortControllerRef.current = new AbortController();

      let targetConvId = currentConversationId;
      if (!targetConvId) {
        const createConvRes = await fetch(getApiUrl('/api/conversations'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: text.slice(0, 30) || 'New Chat',
            language: currentLanguage,
            mode: currentMode,
            system_prompt: systemPrompt
          })
        });

        const convData = await parseJsonResponse(createConvRes);
        if (!createConvRes.ok) throw new Error(convData.error || 'Failed to create conversation session');
        targetConvId = convData.conversation.id;
        setCurrentConversationId(targetConvId);
      }

      const response = await fetch(getApiUrl(`/api/conversations/${targetConvId}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: text,
          attachments: currentAttachments,
          model: selectedModel,
          temperature: temperature,
          language: currentLanguage,
          mode: currentMode,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errData = await parseJsonResponse(response).catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status) {
                setGenerationStatus(data.status);
              }

              if (data.chunk) {
                streamedText += data.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAiMsgId ? { ...msg, content: streamedText } : msg
                  )
                );
              }

              if (data.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAiMsgId
                      ? {
                          ...data.aiMessage,
                          content: data.aiMessage?.content || streamedText,
                          attachments: data.aiMessage?.attachments || []
                        }
                      : msg
                  )
                );

                if (data.conversationTitle) {
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === targetConvId ? { ...c, title: data.conversationTitle } : c
                    )
                  );
                }
              }
            } catch (e) {}
          }
        }
      }

      playSound('receive');
    } catch (err) {
      // Remove empty placeholder on failure so no blank bubble appears
      setMessages((prev) => prev.filter((msg) => msg.id !== tempAiMsgId && msg.id !== tempUserMsgId || msg.id === tempUserMsgId));
      setInputMessage(text);

      if (err.name === 'AbortError') {
        showToast('Generation cancelled', 'info');
      } else {
        console.error('Chat error:', err);
        const errMsg = err.message || 'Failed to send message';
        setError(errMsg);
        if (errMsg.includes('expired') || errMsg.includes('user not found') || errMsg.includes('token')) {
          showToast('Your session has expired. Please log in again.', 'error');
          setIsAuthOpen(true);
        } else {
          showToast(errMsg, 'error');
        }
      }
    } finally {
      setIsLoading(false);
      setGenerationStatus('Thinking...');
      abortControllerRef.current = null;
    }
  };

  // Regenerate last AI response with streaming
  const handleRegenerate = async () => {
    if (!token || !currentConversationId || isLoading || isRegenerating) return;

    setIsRegenerating(true);
    setError(null);
    setGenerationStatus('Regenerating comprehensive response...');

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(getApiUrl(`/api/conversations/${currentConversationId}/regenerate`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          model: selectedModel,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errData = await parseJsonResponse(response).catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to regenerate response');
      }

      const tempAiMsgId = `temp-regen-${Date.now()}`;
      setMessages((prev) => {
        const filtered = prev.filter((msg, idx) => idx !== prev.length - 1 || msg.role === 'user');
        return [
          ...filtered,
          {
            id: tempAiMsgId,
            role: 'model',
            content: '',
            attachments: [],
            created_at: new Date().toISOString()
          }
        ];
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', '').trim());
              if (data.chunk) {
                streamedText += data.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAiMsgId ? { ...msg, content: streamedText } : msg
                  )
                );
              } else if (data.done && data.aiMessage) {
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === tempAiMsgId ? data.aiMessage : msg))
                );
              }
            } catch (e) {}
          }
        }
      }

      playSound('receive');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Regenerate error:', err);
        showToast('Failed to regenerate response', 'error');
      }
    } finally {
      setIsRegenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Continue Response action
  const handleContinueResponse = () => {
    handleSendMessage('Please continue from where you left off in full detail.');
  };

  // Stop response generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsRegenerating(false);
      showToast('Generation stopped', 'info');
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/conversations/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConversationId === id) {
          handleNewChat();
        }
        showToast('Chat deleted', 'info');
      }
    } catch (e) {
      showToast('Failed to delete chat', 'error');
    }
  };

  // Rename conversation
  const handleRenameConversation = async (id, newTitle) => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/conversations/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
        showToast('Conversation renamed', 'success');
      }
    } catch (e) {
      showToast('Failed to rename conversation', 'error');
    }
  };

  // Toggle Pin Conversation
  const handleTogglePinConversation = async (id, isPinned) => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/conversations/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_pinned: isPinned ? 1 : 0 })
      });
      if (res.ok) {
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, is_pinned: isPinned ? 1 : 0 } : c)));
        showToast(isPinned ? 'Chat pinned to top' : 'Chat unpinned', 'info');
      }
    } catch (e) {
      showToast('Failed to update pin', 'error');
    }
  };

  // Clear all conversations
  const handleClearAllConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl('/api/conversations'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConversations([]);
        handleNewChat();
        showToast('All chat history cleared', 'info');
      }
    } catch (e) {
      showToast('Failed to clear chats', 'error');
    }
  };

  // Compute conversation token usage estimate
  const contextLength = messages.reduce((acc, m) => acc + (m.content || '').length, 0);
  const contextPercent = Math.min(100, Math.round((contextLength / 16000) * 100));

  // Startup session verification screen (Prevents initial flash & session loop)
  if (loading && token && !user) {
    return (
      <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#0c0d12] text-zinc-100 font-sans select-none">
        <AtmosphericBackground />
        <div className="relative z-10 flex flex-col items-center gap-3.5 p-6 rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-scaleUp">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
            style={{ backgroundColor: accentColor || '#E5B6F2', color: '#33223B' }}
          >
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="text-center">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Checking session...</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Restoring your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col select-text font-sans bg-[#0c0d12] text-zinc-100 transition-colors duration-300">
      {/* Dynamic Multi-Atmosphere Background Canvas */}
      <AtmosphericBackground />

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="w-full bg-amber-500/90 text-black px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 z-40 animate-fadeIn shadow-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are currently offline. Your drafts are saved and will sync once reconnected.</span>
        </div>
      )}

      {/* Top Header Controls Bar (Hidden in Focus Mode) */}
      {!isFocusMode && (
        <>
          <HeaderControls
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
            onNewChat={handleNewChat}
            onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
            onOpenAdvConv={() => setIsAdvConvOpen(true)}
            onOpenLanguage={() => setIsLanguageOpen(true)}
            onOpenNotes={() => setIsNotesOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenProjects={() => setIsProjectsOpen(true)}
            onOpenImageGallery={() => setIsImageGalleryOpen(true)}
            onOpenLearning={() => setIsLearningOpen(true)}
            onOpenMemory={() => setIsMemoryOpen(true)}
            onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
            onOpenSearchInChat={() => setIsSearchInChatOpen(true)}
            currentLanguage={currentLanguage}
            currentMode={currentMode}
          />

          <ModeSelectorBar
            currentMode={currentMode}
            onSelectMode={(mode) => {
              setCurrentMode(mode);
              showToast(`Mode switched to: ${mode.toUpperCase()}`, 'info');
            }}
          />
        </>
      )}

      {/* Focus Mode Indicator & Exit Button */}
      {isFocusMode && (
        <div className="w-full px-4 py-2 flex items-center justify-between z-30 bg-zinc-950/60 backdrop-blur-md border-b border-white/5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
            🎯 Focus Workspace Active
          </span>
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 flex items-center gap-1.5 border border-white/10"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus</span>
          </button>
        </div>
      )}

      {/* Central Messages & Chat Area */}
      <div className="flex-1 min-h-0 relative z-10 overflow-hidden flex flex-col">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          isRegenerating={isRegenerating}
          generationStatus={generationStatus}
          error={error}
          onSelectPrompt={(p) => handleSendMessage(p)}
          onOpenPrompts={() => setIsPromptLibraryOpen(true)}
          onRegenerate={handleRegenerate}
          onContinueResponse={handleContinueResponse}
          onOpenLightbox={(url, alt) => setLightboxData({ isOpen: true, url, alt })}
          onOpenReadingMode={(content, title) => setReadingModeData({ isOpen: true, content, title })}
          onOpenCodeDiff={(originalCode, modifiedCode, language) => setCodeDiffData({ isOpen: true, originalCode, modifiedCode, language })}
          onEditImage={(subj) => setInputMessage(`Modify this image of ${subj}: make it `)}
          onRegenerateImage={(subj) => handleSendMessage(`Create another variation of ${subj}`)}
          onSelectSuggestion={(s) => handleSendMessage(s)}
          onDropFiles={handleDropFiles}
        />
      </div>

      {/* Bottom Floating Glass Input Capsule */}
      <div className="w-full relative z-20 pb-3 pt-1 pointer-events-auto">
        <ChatInputBar
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          attachments={attachments}
          setAttachments={setAttachments}
          onSendMessage={() => handleSendMessage()}
          onStopGeneration={handleStopGeneration}
          isLoading={isLoading || isRegenerating}
          onOpenPrompts={() => setIsPromptLibraryOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onNewChat={handleNewChat}
          currentMode={currentMode}
        />
      </div>

      {/* Modals & Drawers */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={(id) => {
          loadConversation(id);
          setIsHistoryOpen(false);
        }}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearAllConversations={handleClearAllConversations}
        onNewChat={() => {
          handleNewChat();
          setIsHistoryOpen(false);
        }}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={handleNewChat}
        onOpenNotes={() => setIsNotesOpen(true)}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenImageGallery={() => setIsImageGalleryOpen(true)}
        onOpenLearning={() => setIsLearningOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
        onOpenSearchInChat={() => setIsSearchInChatOpen(true)}
        conversations={conversations}
        onSelectConversation={(id) => loadConversation(id)}
      />

      <SearchInChatModal
        isOpen={isSearchInChatOpen}
        onClose={() => setIsSearchInChatOpen(false)}
        messages={messages}
      />

      <ReadingModeModal
        isOpen={readingModeData.isOpen}
        onClose={() => setReadingModeData({ isOpen: false, content: '', title: '' })}
        content={readingModeData.content}
        title={readingModeData.title}
      />

      <CodeDiffModal
        isOpen={codeDiffData.isOpen}
        onClose={() => setCodeDiffData({ isOpen: false, originalCode: '', modifiedCode: '', language: 'javascript' })}
        originalCode={codeDiffData.originalCode}
        modifiedCode={codeDiffData.modifiedCode}
        language={codeDiffData.language}
      />

      <NotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onInsertNoteToChat={(text) => handleSendMessage(text)}
      />

      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        onStartProjectChat={(text) => handleSendMessage(text)}
      />

      <ImageGalleryModal
        isOpen={isImageGalleryOpen}
        onClose={() => setIsImageGalleryOpen(false)}
        onInsertImagePrompt={(prompt) => handleSendMessage(prompt)}
      />

      <LearningModal
        isOpen={isLearningOpen}
        onClose={() => setIsLearningOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        temperature={temperature}
        setTemperature={setTemperature}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        onOpenThemeStudio={() => {
          setIsSettingsOpen(false);
          setIsThemeStudioOpen(true);
        }}
        onOpenMemory={() => {
          setIsSettingsOpen(false);
          setIsMemoryOpen(true);
        }}
      />

      <AdvancedConvModal
        isOpen={isAdvConvOpen}
        onClose={() => setIsAdvConvOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        temperature={temperature}
        setTemperature={setTemperature}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />

      <ModesModal
        isOpen={isModesOpen}
        onClose={() => setIsModesOpen(false)}
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
      />

      <LanguageModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => {
          setCurrentLanguage(lang);
          showToast(`Language set to ${lang.toUpperCase()}`, 'info');
        }}
      />

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ThemeStudioModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
      />

      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ isOpen: false, url: '', alt: '' })}
        imageUrl={lightboxData.url}
        alt={lightboxData.alt}
      />
    </div>
  );
}

export default App;
