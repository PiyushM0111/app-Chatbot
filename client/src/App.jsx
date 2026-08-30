import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import AnimatedBackground from './components/AnimatedBackground';
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

function App() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const { showToast, playSound } = useToast();

  // Chat & Conversation state
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);

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

  // New Workspaces Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, url: '', alt: '' });

  const abortControllerRef = useRef(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
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
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, [token]);

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
        const res = await fetch(`/api/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
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

  // Send message
  const handleSendMessage = async (textToSend = null) => {
    const rawContent = textToSend !== null ? textToSend : inputMessage;
    if ((!rawContent || !rawContent.trim()) && attachments.length === 0) return;
    if (isLoading) return;

    if (!token) {
      setIsAuthOpen(true);
      showToast('Please log in or sign up to chat', 'info');
      return;
    }

    const content = rawContent.trim();
    const currentAttachments = [...attachments];

    // Optimistic user message
    const tempUserMsgId = `temp-${Date.now()}`;
    const optimisticUserMsg = {
      id: tempUserMsgId,
      role: 'user',
      content: content,
      attachments: currentAttachments,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);
    setError(null);
    playSound('send');

    let targetConvId = currentConversationId;

    try {
      // 1. Create conversation if first message
      if (!targetConvId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: content.slice(0, 30) || 'New Chat',
            language: currentLanguage,
            mode: currentMode,
            system_prompt: systemPrompt
          })
        });

        if (!createRes.ok) throw new Error('Failed to create conversation session');
        const createData = await createRes.json();
        targetConvId = createData.conversation.id;
        setCurrentConversationId(targetConvId);
        fetchConversations();
      }

      // 2. Prepare streaming request
      abortControllerRef.current = new AbortController();

      const response = await fetch(`/api/conversations/${targetConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          model: selectedModel,
          attachments: currentAttachments,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate response');
      }

      // Add temporary model placeholder
      const tempAiMsgId = `temp-ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempAiMsgId,
          role: 'model',
          content: '',
          attachments: [],
          created_at: new Date().toISOString()
        }
      ]);

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
              } else if (data.done) {
                // Finalize messages with persistent database IDs
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id === tempUserMsgId && data.userMessage) return data.userMessage;
                    if (msg.id === tempAiMsgId && data.aiMessage) return data.aiMessage;
                    return msg;
                  })
                );
                if (data.conversationTitle) {
                  setConversations((prev) =>
                    prev.map((c) => (c.id === targetConvId ? { ...c, title: data.conversationTitle } : c))
                  );
                }
              }
            } catch (e) {}
          }
        }
      }

      playSound('receive');
      fetchConversations();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Send message error:', err);
        setError(err.message || 'Failed to send message');
        showToast(err.message || 'Error communicating with AI', 'error');
        playSound('error');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!currentConversationId || isLoading || isRegenerating) return;
    if (!token) return;

    setIsRegenerating(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(`/api/conversations/${currentConversationId}/regenerate`, {
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

      if (!response.ok) throw new Error('Failed to regenerate response');

      // Pop last model message and add placeholder
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
      const res = await fetch(`/api/conversations/${id}`, {
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

  // Clear all chats
  const handleClearAllChats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/conversations', {
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

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col select-text font-sans bg-[#0c0d12] text-zinc-100 transition-colors duration-300">
      {/* Dynamic Ambient Background Canvas */}
      <AnimatedBackground />

      {/* Top Header Controls Bar */}
      <HeaderControls
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewChat={handleNewChat}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        onOpenAdvConv={() => setIsAdvConvOpen(true)}
        onOpenLanguage={() => setIsLanguageOpen(true)}
        onOpenNotes={() => setIsNotesOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenImageGallery={() => setIsImageGalleryOpen(true)}
        onOpenLearning={() => setIsLearningOpen(true)}
        currentLanguage={currentLanguage}
        currentMode={currentMode}
      />

      {/* Persona Mode Switcher Bar */}
      <ModeSelectorBar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          showToast(`Mode switched to: ${mode.toUpperCase()}`, 'info');
        }}
      />

      {/* Central Messages & Chat Area */}
      <div className="flex-1 min-h-0 relative z-10 overflow-hidden flex flex-col">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          isRegenerating={isRegenerating}
          error={error}
          onSelectPrompt={(p) => handleSendMessage(p)}
          onOpenPrompts={() => setIsPromptLibraryOpen(true)}
          onRegenerate={handleRegenerate}
          onOpenLightbox={(url, alt) => setLightboxData({ isOpen: true, url, alt })}
          onEditImage={(subj) => setInputMessage(`Modify this image of ${subj}: make it `)}
          onRegenerateImage={(subj) => handleSendMessage(`Create another variation of ${subj}`)}
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
        onDeleteConversation={handleDeleteConversation}
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
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenImageGallery={() => setIsImageGalleryOpen(true)}
        onOpenLearning={() => setIsLearningOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        conversations={conversations}
        onSelectConversation={(id) => loadConversation(id)}
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
        onClearAllChats={handleClearAllChats}
        onOpenMemory={() => setIsMemoryOpen(true)}
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
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
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
        onSelectLanguage={(lang) => setCurrentLanguage(lang)}
      />

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={(p) => {
          setInputMessage(p);
          setIsPromptLibraryOpen(false);
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ isOpen: false, url: '', alt: '' })}
        imageUrl={lightboxData.url}
        altText={lightboxData.alt}
      />
    </div>
  );
}

export default App;
