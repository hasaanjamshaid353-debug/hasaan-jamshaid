import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Star,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Search,
  MessageSquare,
  Edit2,
  X,
  Copy,
  Check,
  RotateCcw,
  Square,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Image as ImageIcon,
  Code,
  FileDown,
  Mail,
  GraduationCap,
  Globe,
  Sliders,
  CheckCircle2,
  Send,
  Pin,
  PinOff,
  Sun,
  Calendar,
  Bell,
  Headphones,
  Brain,
  Download,
  Settings,
  FileText,
  SlidersHorizontal,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Command,
  Keyboard,
  Share2,
  BarChart3,
  Activity,
  Languages,
  Lightbulb,
  Maximize2,
  ZoomIn,
  Boxes,
} from 'lucide-react';
import { FastGptLogo } from './components/FastGptLogo';
import { ChatMessage, ChatSession, UILanguage } from './types';
import { MarkdownView } from './components/MarkdownView';
import { ImageGenerationModal } from './components/ImageGenerationModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { CodePlaygroundModal } from './components/CodePlaygroundModal';
import { CustomPromptModal } from './components/CustomPromptModal';
import { FlashcardGeneratorModal } from './components/FlashcardGeneratorModal';
import { RealEmailModal } from './components/RealEmailModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { ShareModal } from './components/ShareModal';
import { AppBuilderModal } from './components/AppBuilderModal';
import { AppLauncherCard } from './components/AppLauncherCard';
import { CalculatorModal } from './components/CalculatorModal';
import { CameraModal } from './components/CameraModal';
import { detectAppLaunchIntent, safeLaunchApp, AppTarget } from './utils/appLauncher';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useVoiceInput, deduplicateSpokenText } from './hooks/useVoiceInput';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { generateOfflineResponse, isUrduText } from './utils/offlineEngine';
import { getClassroomDueDatesFromMemory } from './utils/memoryStore';

// Model definitions for Fast GPT Native Engines
const AI_MODELS = [
  {
    id: 'fast-ultra',
    name: 'Fast Ultra',
    desc: 'Lightning-fast multimodal intelligence with live web grounding',
    badge: 'Ultra',
  },
  {
    id: 'fast-pro',
    name: 'Fast Pro',
    desc: 'Advanced reasoning, creative writing, analysis & mathematics',
    badge: 'Pro',
  },
  {
    id: 'deep-thinker',
    name: 'Deep Thinker',
    desc: 'Step-by-step logic, complex science & deep reasoning blocks',
    badge: 'Reasoning',
  },
  {
    id: 'code-architect',
    name: 'Code Architect',
    desc: 'Full-stack software engineering, debugging & technical architecture',
    badge: 'Coder',
  },
];

// Staggered entrance animation variants for chat messages
const messageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

const messageItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: {
      duration: 0.2,
    },
  },
};

// Fast GPT suggestion prompt cards (برین سٹارم, رائٹ اور فیکٹس اور فکس کوڈ, کریٹ این امیج, ہیلپ می ان سٹڈیز)
const SUGGESTIONS = [
  {
    icon: Sparkles,
    label: 'برین سٹارم',
    englishLabel: 'Brainstorm',
    prompt: 'Brainstorm 5 innovative, high-potential tech startup ideas with unique value propositions.',
  },
  {
    icon: Code,
    label: 'رائٹ اور فیکٹس اور فکس کوڈ',
    englishLabel: 'Write, Facts or Fix Code',
    prompt: 'Write clean code, verify key technical facts, or debug and fix errors in my script.',
  },
  {
    icon: ImageIcon,
    label: 'کریٹ این امیج',
    englishLabel: 'Create an Image',
    prompt: 'Generate a stunning 3D cinematic visual of a futuristic neon city at sunset with volumetric lighting.',
  },
  {
    icon: GraduationCap,
    label: 'ہیلپ می ان سٹڈیز',
    englishLabel: 'Help Me in Studies',
    prompt: 'Help me study: Explain quantum physics and superposition in a simple, intuitive way with real-world examples.',
  },
];

export default function App() {
  const { isOnline, forceOffline, toggleForceOffline } = useOnlineStatus();

  // Selected AI Model (Fast Ultra default)
  const [selectedModelId, setSelectedModelId] = useState('fast-ultra');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const currentModel = useMemo(
    () => AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[0],
    [selectedModelId]
  );

  // ChatGPT-grade capabilities (Web Grounding & Deep Thinking)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isDeepThinkingEnabled, setIsDeepThinkingEnabled] = useState(false);

  // UI Language Interface (Pure English UI)
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('en');
  const isUrdu = false;

  useEffect(() => {
    try {
      localStorage.setItem('omni_ui_lang', 'en');
    } catch {}
  }, []);

  // Auto-speak toggle
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('omni_auto_speak');
      return saved === 'true';
    } catch {}
    return false;
  });

  // Assistant Response Rendering: Rendered Markdown vs Raw Text toggle
  const [renderMarkdown, setRenderMarkdown] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fast_gpt_render_markdown');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleRenderMarkdown = () => {
    setRenderMarkdown((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fast_gpt_render_markdown', String(next));
      } catch {}
      return next;
    });
  };

  // Per-message raw view override map
  const [rawViewMessageIds, setRawViewMessageIds] = useState<{ [id: string]: boolean }>({});
  const toggleMessageRawView = (id: string) => {
    setRawViewMessageIds((prev) => {
      const currentVal = prev[id] !== undefined ? prev[id] : !renderMarkdown;
      return {
        ...prev,
        [id]: !currentVal,
      };
    });
  };

  const isMessageRaw = (id: string) => {
    if (rawViewMessageIds[id] !== undefined) {
      return rawViewMessageIds[id];
    }
    return !renderMarkdown;
  };

  // UI Settings Dropdown & Tab ('display' | 'usage')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'display' | 'usage'>('display');
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Search keyword for chat sessions filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-session chat history state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('omni_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      const legacy = localStorage.getItem('omni_chat_history');
      if (legacy) {
        const legacyMsgs = JSON.parse(legacy);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          const firstTitle = legacyMsgs[0]?.content?.slice(0, 30) || 'Previous Chat';
          return [
            {
              id: `session-${Date.now()}`,
              title: firstTitle,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: legacyMsgs,
            },
          ];
        }
      }
    } catch (e) {
      console.warn('Failed to initialize sessions:', e);
    }

    return [
      {
        id: `session-${Date.now()}`,
        title: 'New chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      },
    ];
  });

  // Active session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('omni_active_session_id');
      if (saved && sessions.some((s) => s.id === saved)) return saved;
    } catch {}
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  // Editing session title in sidebar
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>('');

  // Editing user message in conversation
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState<string>('');

  // Ratings feedback state (thumbs up/down)
  const [messageRatings, setMessageRatings] = useState<{ [id: string]: 'up' | 'down' }>({});

  // Input prompt
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modals state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalPrompt, setImageModalPrompt] = useState('');
  const [initialImageForEdit, setInitialImageForEdit] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    prompt: string;
    aspectRatio: string;
  } | null>(null);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [playgroundCode, setPlaygroundCode] = useState('');
  const [playgroundLang, setPlaygroundLang] = useState('html');
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [isRealEmailModalOpen, setIsRealEmailModalOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAppBuilderOpen, setIsAppBuilderOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isTtsSpeedOpen, setIsTtsSpeedOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const voiceBasePromptRef = useRef<string>('');

  // Google Classroom Morning Briefing alert state
  const [morningAlert, setMorningAlert] = useState<{
    title: string;
    subtitle: string;
    dueDates: string[];
    formattedDate: string;
  } | null>(null);

  // Microphone Voice Input: strictly controlled with word deduplication
  const {
    isListening,
    toggleListening,
    stopListening,
  } = useVoiceInput({
    onStart: () => {
      // Snapshot baseline input text before speech starts
      voiceBasePromptRef.current = inputPrompt.trim();
    },
    onResult: (cleanSpokenText) => {
      const base = voiceBasePromptRef.current;
      if (!cleanSpokenText) {
        setInputPrompt(base);
      } else if (!base) {
        setInputPrompt(cleanSpokenText);
      } else {
        const combined = `${base} ${cleanSpokenText}`;
        setInputPrompt(deduplicateSpokenText(combined));
      }
    },
    onEnd: () => {
      // Final pass to guarantee absolutely zero duplicate words or stutter
      setInputPrompt((prev) => deduplicateSpokenText(prev));
      voiceBasePromptRef.current = '';
    },
  });

  // Text-To-Speech (Web Speech API)
  const tts = useTextToSpeech();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const ttsMenuRef = useRef<HTMLDivElement>(null);

  // Get current session
  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = currentSession?.messages || [];

  // Last assistant message for Quick Actions
  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant' && m.content && m.content.trim()) {
        return m;
      }
    }
    return null;
  }, [messages]);

  const isLastAssistantUrdu = useMemo(() => {
    if (!lastAssistantMessage) return false;
    return isUrduText(lastAssistantMessage.content);
  }, [lastAssistantMessage]);

  // Aggregate all generated images across all sessions for Image Studio Gallery Grid
  const allChatGeneratedImages = useMemo(() => {
    const images: Array<{ url: string; prompt: string; aspectRatio?: string }> = [];
    sessions.forEach((s) => {
      s.messages.forEach((m) => {
        if (m.generatedImage) {
          images.push(m.generatedImage);
        }
      });
    });
    return images;
  }, [sessions]);

  // Pinned messages state & helpers
  const [isPinnedExpanded, setIsPinnedExpanded] = useState<boolean>(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Toast feedback state for locks & protected actions
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'lock' | 'unlock' | 'warning' | 'info';
  } | null>(null);
  const toastTimerRef = useRef<any>(null);

  const showToast = (
    text: string,
    type: 'lock' | 'unlock' | 'warning' | 'info' = 'info'
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => m.isPinned);
  }, [messages]);

  const lockedMessagesCount = useMemo(() => {
    return messages.filter((m) => m.isLocked).length;
  }, [messages]);

  // Usage Dashboard metrics for the current session
  const sessionUsageStats = useMemo(() => {
    const msgs = currentSession?.messages || [];
    const totalMessages = msgs.length;
    const userMessages = msgs.filter((m) => m.role === 'user').length;
    const assistantMessages = msgs.filter((m) => m.role === 'assistant').length;

    const userChars = msgs
      .filter((m) => m.role === 'user')
      .reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const assistantChars = msgs
      .filter((m) => m.role === 'assistant')
      .reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const totalChars = userChars + assistantChars;

    // Standard LLM estimation: ~4 characters per token
    const promptTokens = Math.ceil(userChars / 4);
    const responseTokens = Math.ceil(assistantChars / 4);
    const totalTokens = promptTokens + responseTokens;

    // Word counts
    const assistantWords = msgs
      .filter((m) => m.role === 'assistant')
      .reduce((sum, m) => sum + (m.content ? m.content.trim().split(/\s+/).filter(Boolean).length : 0), 0);
    const avgWordsPerReply = assistantMessages > 0 ? Math.round(assistantWords / assistantMessages) : 0;

    const promptPercent = totalTokens > 0 ? Math.max(10, Math.min(90, Math.round((promptTokens / totalTokens) * 100))) : 50;
    const responsePercent = 100 - promptPercent;

    return {
      totalMessages,
      userMessages,
      assistantMessages,
      promptTokens,
      responseTokens,
      totalTokens,
      totalChars,
      avgWordsPerReply,
      promptPercent,
      responsePercent,
    };
  }, [currentSession]);

  // Group consecutive messages by author to reduce whitespace and improve readability
  const messageGroups = useMemo(() => {
    const groups: {
      id: string;
      role: 'user' | 'assistant';
      messages: ChatMessage[];
    }[] = [];

    for (const msg of messages) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.role === msg.role) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({
          id: `group-${msg.id}`,
          role: msg.role,
          messages: [msg],
        });
      }
    }
    return groups;
  }, [messages]);

  // Read-only Lock Toggle
  const handleToggleLockMessage = (messageId: string) => {
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;
    const nextLocked = !target.isLocked;

    updateActiveMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            // Locking automatically pins the message as well so it's safely anchored
            isPinned: nextLocked ? true : msg.isPinned,
            isLocked: nextLocked,
          };
        }
        return msg;
      })
    );

    showToast(
      nextLocked
        ? '🔒 Message locked (read-only). Editing and deletion are disabled.'
        : '🔓 Message unlocked. Editing and deletion are now enabled.',
      nextLocked ? 'lock' : 'unlock'
    );
  };

  // Pin Toggle (protects locked messages)
  const handleTogglePinMessage = (messageId: string) => {
    const target = messages.find((m) => m.id === messageId);
    if (target?.isLocked) {
      showToast('⚠️ Locked message: Unlock read-only lock before unpinning.', 'warning');
      return;
    }
    updateActiveMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
      )
    );
  };

  // Unpin all messages (preserves locked ones)
  const handleUnpinAllMessages = () => {
    const lockedCount = pinnedMessages.filter((m) => m.isLocked).length;
    updateActiveMessages((prev) =>
      prev.map((m) => (m.isLocked ? m : { ...m, isPinned: false }))
    );
    if (lockedCount > 0) {
      showToast(
        `Preserved ${lockedCount} locked pinned message${lockedCount > 1 ? 's' : ''}.`,
        'info'
      );
    } else {
      showToast('All messages unpinned.', 'info');
    }
  };

  // Delete individual message (protects locked messages)
  const handleDeleteMessage = (messageId: string) => {
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;
    if (target.isLocked) {
      showToast('🔒 Cannot delete: This message is read-only locked. Unlock it first.', 'warning');
      return;
    }
    updateActiveMessages((prev) => prev.filter((m) => m.id !== messageId));
    showToast('Message deleted.', 'info');
  };

  // Start edit user message (protects locked messages)
  const handleStartEditUserMessage = (message: ChatMessage) => {
    if (message.isLocked) {
      showToast('🔒 Cannot edit: Message is read-only locked. Unlock it first.', 'warning');
      return;
    }
    setEditingMessageId(message.id);
    setEditingMessageText(message.content);
  };

  // Session deletion confirmation when session contains locked messages
  const [sessionToDeleteWithLocks, setSessionToDeleteWithLocks] = useState<{
    id: string;
    title: string;
    lockedCount: number;
  } | null>(null);

  const handleJumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId((curr) => (curr === messageId ? null : curr));
      }, 2500);
    }
  };

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('omni_chat_sessions', JSON.stringify(sessions));
      localStorage.setItem('omni_active_session_id', activeSessionId);
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [sessions, activeSessionId]);

  // Persist auto-speak
  useEffect(() => {
    try {
      localStorage.setItem('omni_auto_speak', String(autoSpeak));
    } catch {}
  }, [autoSpeak]);

  // Google Classroom Morning Briefing: check Persistent Memory on first open of the day
  useEffect(() => {
    try {
      const todayKey = new Date().toDateString();
      const lastBriefingDate = localStorage.getItem('export_ai_last_briefing_date');
      const classroomDueDates = getClassroomDueDatesFromMemory();

      // Only pop up conversational alert if user opens the app for the first time today
      if (lastBriefingDate !== todayKey) {
        if (classroomDueDates.length > 0) {
          setMorningAlert({
            title: 'Daily Morning Briefing',
            subtitle: 'Synced Google Classroom deadlines & coursework from your persistent memory:',
            dueDates: classroomDueDates.map((m) => m.fact),
            formattedDate: new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            }),
          });
        }
        localStorage.setItem('export_ai_last_briefing_date', todayKey);
      }
    } catch (e) {
      console.warn('Morning briefing check error:', e);
    }
  }, []);

  const handleTriggerMorningBriefing = () => {
    const classroomDueDates = getClassroomDueDatesFromMemory();
    setMorningAlert({
      title: 'Daily Morning Briefing',
      subtitle: 'Synced Google Classroom deadlines & coursework from your persistent memory:',
      dueDates: classroomDueDates.length > 0
        ? classroomDueDates.map((m) => m.fact)
        : ['No immediate Google Classroom deadlines due today.'],
      formattedDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    });
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (ttsMenuRef.current && !ttsMenuRef.current.contains(e.target as Node)) {
        setIsTtsSpeedOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter sessions using keywords
  const filteredSessions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return sessions;

    return sessions.filter((session) => {
      const matchTitle = session.title.toLowerCase().includes(term);
      const matchMessages = session.messages.some((m) =>
        m.content.toLowerCase().includes(term)
      );
      return matchTitle || matchMessages;
    });
  }, [sessions, searchQuery]);

  // Group filtered sessions by timeline, with a dedicated Starred section at the top
  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: ChatSession[] } = {
      Starred: [],
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 86400000 * 7;

    for (const session of filteredSessions) {
      if (session.isStarred) {
        groups.Starred.push(session);
        continue;
      }
      const time = session.updatedAt || session.createdAt;
      if (time >= todayStart) {
        groups.Today.push(session);
      } else if (time >= yesterdayStart) {
        groups.Yesterday.push(session);
      } else if (time >= weekStart) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups.Older.push(session);
      }
    }

    return groups;
  }, [filteredSessions]);

  const scrollToBottomSmooth = (immediate = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: immediate ? 'auto' : 'smooth',
      });
    } else {
      messagesEndRef.current?.scrollIntoView({
        behavior: immediate ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    scrollToBottomSmooth(false);
  }, [messages, isSubmitting]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  const toggleLanguage = () => {
    const next = uiLanguage === 'ur' ? 'en' : 'ur';
    setUiLanguage(next);
    try {
      localStorage.setItem('omni_ui_lang', next);
    } catch {}
  };

  // Create new chat
  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSearchQuery('');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Global Keyboard Shortcuts
  // - 'Ctrl+N' / 'Cmd+N': New chat
  // - 'Ctrl+K' / 'Cmd+K': Focus the input bar
  // - 'Ctrl+Shift+L' / 'Cmd+Shift+L': Open UI settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;

      // 1. 'Ctrl+Shift+L' -> Open/Toggle UI settings
      if (isModifier && e.shiftKey && (e.key === 'l' || e.key === 'L' || e.code === 'KeyL')) {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        showToast('⚙️ UI Settings (Ctrl+Shift+L)', 'info');
        return;
      }

      // 2. 'Ctrl+N' -> New chat (only when Shift is not pressed)
      if (isModifier && !e.shiftKey && (e.key === 'n' || e.key === 'N' || e.code === 'KeyN')) {
        e.preventDefault();
        handleCreateNewChat();
        showToast('✨ New chat started (Ctrl+N)', 'info');
        return;
      }

      // 3. 'Ctrl+K' -> Focus the input bar
      if (isModifier && !e.shiftKey && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
        showToast('⌨️ Input bar focused (Ctrl+K)', 'info');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Delete chat (protects sessions with locked messages)
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = sessions.find((s) => s.id === sessionId);
    const lockedCount = target?.messages.filter((m) => m.isLocked).length || 0;

    if (lockedCount > 0) {
      setSessionToDeleteWithLocks({
        id: sessionId,
        title: target?.title || 'this chat',
        lockedCount,
      });
      return;
    }

    executeDeleteSession(sessionId);
  };

  const executeDeleteSession = (sessionId: string) => {
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      const fallback: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'New chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setSessions([fallback]);
      setActiveSessionId(fallback.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
    }
    setSessionToDeleteWithLocks(null);
    showToast('Chat deleted.', 'info');
  };

  // Rename session
  const handleSaveRename = (sessionId: string) => {
    if (!editingTitleText.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s))
    );
    setEditingSessionId(null);
  };

  // Toggle star / favorite chat session
  const handleToggleStarSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let nextStarredState = false;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          nextStarredState = !s.isStarred;
          return { ...s, isStarred: nextStarredState };
        }
        return s;
      })
    );
    showToast(
      nextStarredState
        ? '⭐ Chat pinned to Starred section'
        : 'Chat removed from Starred section',
      'info'
    );
  };

  // Update messages in active session
  const updateActiveMessages = (
    updater: (prevMsgs: ChatMessage[]) => ChatMessage[],
    newTitle?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const newMsgs = updater(s.messages);
          return {
            ...s,
            messages: newMsgs,
            updatedAt: Date.now(),
            title: newTitle || s.title,
          };
        }
        return s;
      })
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamingMsgId(null);
    setIsSubmitting(false);
  };

  // Send Message
  const handleSendMessage = async (customText?: string) => {
    const query = (customText !== undefined ? customText : inputPrompt).trim();
    if (!query || isSubmitting) return;

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
      mode: 'general',
    };

    let titleToSet: string | undefined = undefined;
    if (
      currentSession.messages.length === 0 ||
      currentSession.title === 'New chat' ||
      currentSession.title === 'نئی گفتگو'
    ) {
      titleToSet = query.slice(0, 32).trim() + (query.length > 32 ? '...' : '');
    }

    const newHistory = [...messages, userMessage];
    updateActiveMessages(() => newHistory, titleToSet);
    setIsSubmitting(true);

    const assistantMsgId = `assistant-${Date.now()}`;

    // App Launch Intent Handling (YouTube, WhatsApp, Calculator, Camera, Google, Maps, App Hub, etc.)
    const detectedAppTarget = detectAppLaunchIntent(query);
    if (detectedAppTarget) {
      if (detectedAppTarget.isInternal && detectedAppTarget.internalTarget) {
        if (detectedAppTarget.internalTarget === 'calculator') setIsCalculatorOpen(true);
        else if (detectedAppTarget.internalTarget === 'camera') setIsCameraOpen(true);
        else if (detectedAppTarget.internalTarget === 'app_builder') setIsAppBuilderOpen(true);
        else if (detectedAppTarget.internalTarget === 'image_studio') setIsImageModalOpen(true);
        else if (detectedAppTarget.internalTarget === 'code_playground') setIsPlaygroundOpen(true);
      } else if (detectedAppTarget.webUrl) {
        safeLaunchApp(detectedAppTarget.webUrl);
      }

      const isDevanagari = /[\u0900-\u097F]/.test(query);
      const isUrdu = isUrduText(query);
      let replyText = '';
      let spokenText = '';

      if (detectedAppTarget.id === 'app_hub') {
        if (isDevanagari) {
          replyText = `जी सर! कोई भी अन्य ऐप (YouTube, WhatsApp, Calculator, Camera, Google, Maps आदि) बिना किसी एरर के खोलने के लिए **यूनिवर्सल ऐप लॉन्चर** तैयार कर दिया गया है। पॉप-अप ब्लॉकर और आईफ्रेम की सभी समस्याएं पूरी तरह फिक्स कर दी गई हैं। आप नीचे दिए गए किसी भी ऐप पर क्लिक करके उसे तुरंत खोल सकते हैं।\n\nमुझे हसान ने बनाया है।`;
          spokenText = 'जी सर, सभी ऐप्स खोलने के एरर फिक्स कर दिए गए हैं। यूनिवर्सल लॉन्चर तैयार है!';
        } else if (isUrdu) {
          replyText = `یس سر! دوسری تمام ایپس (یوٹیوب، واٹس ایپ، کیلکولیٹر، کیمرہ، گوگل، میپس وغیرہ) کھولنے کے تمام ایررز 100 فیصد فکس کر دیے گئے ہیں۔ نیچے دیے گئے یونیورسل لانچر سے آپ کسی بھی ایپ کو فوری طور پر کھول سکتے ہیں۔\n\nمجھے حسان نے بنایا ہے۔`;
          spokenText = 'یس سر! تمام ایپس کھولنے کے ایررز فکس کر دیے گئے ہیں۔';
        } else {
          replyText = `Yes Sir! Universal App Launcher is ready with all popup-blocker and sandbox errors resolved. You can now launch any app (YouTube, WhatsApp, Calculator, Camera, Google, Maps, etc.) with zero errors below.\n\nCreated by Hasaan.`;
          spokenText = 'Yes Sir! All app launcher errors have been fixed. Launching app hub.';
        }
      } else {
        if (isDevanagari) {
          replyText = `जी सर! **${detectedAppTarget.name}** सफलतापूर्वक खोल दिया गया है। यदि ब्राउज़र की सुरक्षा सेटिंग या पॉप-अप ब्लॉकर की वजह से स्वतः न खुले, तो नीचे दिए गए वेरिफाइड बटन पर क्लिक करके इसे तुरंत खोलें।\n\nमुझे हसान ने बनाया है।`;
          spokenText = `जी सर, ${detectedAppTarget.name} खोल दिया गया है!`;
        } else if (isUrdu) {
          replyText = `یس سر! **${detectedAppTarget.name}** کامیابی سے کھول دیا گیا ہے۔ اگر براؤزر سیکیورٹی کی وجہ سے خودکار طور پر نہ کھلے تو نیچے دیے گئے بٹن پر کلک کر کے فوری طور پر کھولیں۔\n\nمجھے حسان نے بنایا ہے۔`;
          spokenText = `یس سر، ${detectedAppTarget.name} کھول دیا گیا ہے!`;
        } else {
          replyText = `Yes Sir! **${detectedAppTarget.name}** has been launched. If your browser blocks popups, use the verified one-click button below.\n\nCreated by Hasaan.`;
          spokenText = `Yes Sir, opening ${detectedAppTarget.name} now!`;
        }
      }

      updateActiveMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: replyText,
          timestamp: Date.now(),
          mode: 'general',
          appTarget: detectedAppTarget,
        },
      ]);
      setIsSubmitting(false);
      if (autoSpeak) {
        setTimeout(() => tts.speak(assistantMsgId, spokenText), 200);
      }
      return;
    }

    // Direct Image Creation with gemini-nano-banana-2.1 (only if user explicitly asks to create image)
    const isImageIntent =
      /^(create image|generate image|make image|draw |paint |\bimage of\b|\bpicture of\b|تصویر بناؤ|تصویر بنا کر دو|\/image)/i.test(
        query.trim()
      );

    if (isImageIntent && isOnline) {
      const cleanPrompt =
        query
          .replace(
            /^(create image|generate image|make image|draw|paint|تصویر بناؤ|تصویر بنا کر دو|\/image)[:\s]+/i,
            ''
          )
          .trim() || query;

      updateActiveMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: isUrduText(query)
            ? `آپ کے پرامپٹ کے مطابق **gemini-nano-banana-2.1** سے تصویر تیار کی جا رہی ہے...`
            : `Generating visual artwork with **gemini-nano-banana-2.1** for: *"${cleanPrompt}"*...`,
          timestamp: Date.now(),
          mode: 'general',
        },
      ]);

      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: cleanPrompt,
            aspectRatio: '16:9',
            imageSize: '2K',
            model: 'gemini-nano-banana-2.1',
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          updateActiveMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: isUrduText(query)
                      ? `یہ رہی **gemini-nano-banana-2.1** سے تیار کردہ تصویر برائے: *"${cleanPrompt}"*\n\nآپ نیچے دیے گئے ایکشن سے اس تصویر میں ٹیکسٹ پرامپٹ کے ذریعے مزید ترمیم بھی کر سکتے ہیں۔`
                      : `Here is the visual artwork generated using **gemini-nano-banana-2.1** for *"${cleanPrompt}"*:\n\nYou can click **Edit with AI** below to edit this image using text prompts.`,
                    generatedImage: {
                      url: data.imageUrl,
                      prompt: cleanPrompt,
                      aspectRatio: data.aspectRatio || '16:9',
                    },
                  }
                : m
            )
          );
          setIsSubmitting(false);
          return;
        }
      } catch (imgErr) {
        console.warn('Direct chat image generation error, proceeding with conversational assistant:', imgErr);
      }
    }

    // If Offline: use local intelligence engine with smooth typewriter pacing
    if (!isOnline) {
      setTimeout(() => {
        const offlineReply = generateOfflineResponse({
          prompt: query,
          mode: 'general',
          language: isUrduText(query) ? 'ur' : 'auto',
        });

        let typedLen = 0;
        setStreamingMsgId(assistantMsgId);
        updateActiveMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            mode: 'general',
          },
        ]);

        const offTimer = setInterval(() => {
          typedLen = Math.min(offlineReply.length, typedLen + 3);
          const slice = offlineReply.slice(0, typedLen);
          updateActiveMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: slice } : m))
          );
          scrollToBottomSmooth(false);

          if (typedLen >= offlineReply.length) {
            clearInterval(offTimer);
            setStreamingMsgId(null);
            setIsSubmitting(false);
            if (autoSpeak) {
              setTimeout(() => tts.speak(assistantMsgId, offlineReply), 200);
            }
          }
        }, 18);
      }, 200);
      return;
    }

    // If Online: Call Fast GPT streaming API with ChatGPT-style smooth typewriter streaming
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setStreamingMsgId(assistantMsgId);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          mode: 'general',
          modelId: selectedModelId,
          webSearch: isWebSearchEnabled,
          deepThink: isDeepThinkingEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      updateActiveMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          mode: 'general',
        },
      ]);
      scrollToBottomSmooth(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let incomingFullText = '';
      let displayedChars = 0;
      let streamEnded = false;
      let hasError = false;

      // ChatGPT-style smooth typewriter pump loop
      const typingPromise = new Promise<string>((resolve) => {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
        }

        typingTimerRef.current = setInterval(() => {
          if (controller.signal.aborted) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
            resolve(incomingFullText);
            return;
          }

          if (displayedChars < incomingFullText.length) {
            const backlog = incomingFullText.length - displayedChars;
            // Adaptive ChatGPT pacing:
            // 2-3 chars per 18ms for natural human reading cadence, scaling gently if large backlog buffered
            let step = 2;
            if (backlog > 400) step = 14;
            else if (backlog > 180) step = 8;
            else if (backlog > 70) step = 5;
            else if (backlog > 25) step = 3;

            displayedChars = Math.min(incomingFullText.length, displayedChars + step);
            const currentSlice = incomingFullText.slice(0, displayedChars);

            updateActiveMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, content: currentSlice } : msg
              )
            );

            // Follow along smoothly with the newly typed words ("اور جیسے جیسے یہ لکھے نا اور ساتھ ساتھ ہی ہم جائیں")
            scrollToBottomSmooth(false);
          } else if (streamEnded && displayedChars >= incomingFullText.length) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
            resolve(incomingFullText);
          }
        }, 18);
      });

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.text) {
                  incomingFullText += data.text;
                } else if (data.done) {
                  streamEnded = true;
                } else if (data.error) {
                  hasError = true;
                }
              } catch {}
            }
          }
        }
      }
      streamEnded = true;

      // Wait for smooth typewriter pump to finish presenting all words
      const finalCompletedText = await typingPromise;
      setStreamingMsgId(null);

      if (!finalCompletedText.trim() || hasError) {
        const fallbackReply = generateOfflineResponse({
          prompt: query,
          mode: 'general',
          language: isUrduText(query) ? 'ur' : 'auto',
        });
        updateActiveMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: fallbackReply } : msg
          )
        );
        scrollToBottomSmooth(true);
      } else if (autoSpeak && finalCompletedText) {
        setTimeout(() => tts.speak(assistantMsgId, finalCompletedText), 300);
      }
    } catch (err: any) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setStreamingMsgId(null);

      if (err.name === 'AbortError') {
        // User stopped generation manually
        return;
      }
      const offlineReply = generateOfflineResponse({
        prompt: query,
        mode: 'general',
        language: isUrduText(query) ? 'ur' : 'auto',
      });

      updateActiveMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== assistantMsgId);
        return [
          ...filtered,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: offlineReply,
            timestamp: Date.now(),
            mode: 'general',
          },
        ];
      });
      scrollToBottomSmooth(true);

      if (autoSpeak && offlineReply) {
        setTimeout(() => tts.speak(assistantMsgId, offlineReply), 300);
      }
    } finally {
      setIsSubmitting(false);
      setStreamingMsgId(null);
      abortControllerRef.current = null;
    }
  };

  // Quick Action based on last assistant message
  const handleQuickAction = (action: 'summarize' | 'explain' | 'translate') => {
    if (!lastAssistantMessage || isSubmitting) return;
    const isUrdu = isUrduText(lastAssistantMessage.content);

    if (action === 'summarize') {
      handleSendMessage(
        isUrdu
          ? 'براہ کرم اپنے پچھلے جواب کا مختصر اور جامع خلاصہ اہم نکات کی صورت میں بیان کریں۔'
          : 'Please summarize your previous response into clear, concise key points with actionable takeaways.'
      );
    } else if (action === 'explain') {
      handleSendMessage(
        isUrdu
          ? 'اپنے پچھلے جواب کی آسان فہم الفاظ اور واضح مثال کے ساتھ وضاحت کریں۔'
          : 'Please explain your previous response in simpler terms with practical examples.'
      );
    } else if (action === 'translate') {
      handleSendMessage(
        isUrdu
          ? 'Please translate your previous response into clear, articulate English.'
          : 'براہ کرم اپنے پچھلے جواب کا با محاورہ اور معیاری اردو میں ترجمہ کریں۔'
      );
    }
  };

  // Insert generated or edited visual into current chat session
  const handleInsertImageToChat = (imageUrl: string, prompt: string, aspectRatio: string) => {
    const assistantMsgId = `assistant-${Date.now()}`;
    updateActiveMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: `Visual artwork created via **gemini-nano-banana-2.1** for *"${prompt}"*:`,
        timestamp: Date.now(),
        mode: 'general',
        generatedImage: {
          url: imageUrl,
          prompt,
          aspectRatio,
        },
      },
    ]);
    showToast('Visual artwork added to chat session!', 'info');
  };

  // Download active chat in multiple formats (Markdown, PDF, Plaintext, JSON)
  const handleDownloadChat = (format: 'md' | 'txt' | 'json' | 'pdf') => {
    setIsDownloadMenuOpen(false);

    if (format === 'pdf') {
      setIsExportPdfOpen(true);
      return;
    }

    if (!messages.length) {
      showToast(
        uiLanguage === 'ur'
          ? 'ڈاؤن لوڈ کرنے کے لیے کوئی پیغامات موجود نہیں ہیں۔'
          : 'No chat messages to download yet.',
        'warning'
      );
      return;
    }

    const title = currentSession?.title || 'FastGPT-Conversation';
    const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_').slice(0, 45);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `${cleanTitle}-${dateStamp}.${format}`;
    let content = '';
    let mimeType = 'text/plain';

    if (format === 'md') {
      mimeType = 'text/markdown;charset=utf-8';
      content = `# ${title}\n\n`;
      content += `> **Model**: ${currentModel.name} (${currentModel.badge})\n`;
      content += `> **Export Date**: ${new Date().toLocaleString()}\n`;
      content += `> **Messages**: ${messages.length}\n\n---\n\n`;

      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? '👤 **User**' : '🤖 **Fast GPT**';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        content += `### ${sender} - *${time}*\n\n`;
        content += `${msg.content}\n\n`;
        if (msg.generatedImage) {
          content += `\n![${msg.generatedImage.prompt}](${msg.generatedImage.url})\n`;
          content += `*Visual artwork generated by gemini-nano-banana-2.1: "${msg.generatedImage.prompt}"*\n\n`;
        }
        content += `---\n\n`;
      });
    } else if (format === 'txt') {
      mimeType = 'text/plain;charset=utf-8';
      content = `=========================================================\n`;
      content += `${title.toUpperCase()}\n`;
      content += `Engine: ${currentModel.name} | Date: ${new Date().toLocaleString()}\n`;
      content += `=========================================================\n\n`;

      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'USER' : 'FAST GPT';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        content += `[${time}] ${sender}:\n${msg.content}\n\n---------------------------------------------------------\n\n`;
      });
    } else if (format === 'json') {
      mimeType = 'application/json;charset=utf-8';
      content = JSON.stringify(currentSession || { title, messages }, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      uiLanguage === 'ur'
        ? `چیٹ (${format.toUpperCase()}) ڈاؤن لوڈ ہو گئی ہے!`
        : `Chat conversation saved as ${format.toUpperCase()}!`,
      'info'
    );
  };

  // Edit user message in place and resend (blocked if message is locked)
  const handleSaveEditUserMessage = (msgId: string) => {
    if (!editingMessageText.trim()) {
      setEditingMessageId(null);
      return;
    }
    const target = messages.find((m) => m.id === msgId);
    if (target?.isLocked) {
      showToast('🔒 Cannot edit: Message is read-only locked. Unlock it first.', 'warning');
      setEditingMessageId(null);
      return;
    }
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx !== -1) {
      // Truncate messages after this point and resend
      const trimmedHistory = messages.slice(0, idx);
      updateActiveMessages(() => trimmedHistory);
      setEditingMessageId(null);
      handleSendMessage(editingMessageText.trim());
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-[#212121] text-white overflow-hidden font-sans select-none antialiased touch-pan-y">
      {/* =========================================================================
          AUTHENTIC CHATGPT SIDEBAR (Dark #171717 with touch-optimized mobile drawer)
      ========================================================================== */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-[84vw] max-w-[320px] md:w-[260px] bg-[#171717] border-r border-[#2f2f2f] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl md:shadow-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header: New Chat & Collapse */}
        <div className="p-3 sm:p-3.5 border-b border-[#2f2f2f] flex items-center justify-between gap-2.5">
          <button
            onClick={handleCreateNewChat}
            className="flex-1 flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#212121] hover:bg-[#282828] active:scale-[0.98] text-white text-sm font-semibold transition cursor-pointer border border-[#2f2f2f] shadow-xs touch-manipulation group"
            title="New chat (Ctrl+N)"
          >
            <div className="flex items-center gap-2.5">
              <FastGptLogo size="sm" showText={false} glow={false} darkText={false} />
              <span className="font-semibold text-slate-100">New chat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
                Ctrl+N
              </kbd>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-[#212121] active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0 border border-transparent hover:border-[#2f2f2f] touch-manipulation"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated App Builder Studio Button */}
        <div className="px-3 pt-2.5 pb-1">
          <button
            onClick={() => {
              setIsAppBuilderOpen(true);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/70 via-indigo-950/70 to-purple-950/70 hover:from-cyan-900/80 hover:to-indigo-900/80 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            title="AI App Builder Studio: Architect and Build Complete Applications"
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>AI App Builder Studio</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              New
            </span>
          </button>
        </div>

        {/* Search Past Chats Input */}
        <div className="px-3 pt-2 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-[#212121] border border-[#2f2f2f] focus:border-white/30 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-7 h-7 absolute right-1.5 top-1.5 flex items-center justify-center text-slate-400 hover:text-white rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Past Sessions List with Enhanced Touch Spacing */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-3.5 scrollbar-thin">
          {filteredSessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-slate-500 text-xs">
              No chats found
            </div>
          ) : (
            Object.entries(groupedSessions).map(([groupTitle, list]) => {
              if (list.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 tracking-wide flex items-center gap-1.5">
                    {groupTitle === 'Starred' ? (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-amber-300 font-bold">Starred</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono ml-auto">
                          {list.length}
                        </span>
                      </>
                    ) : (
                      <span>{groupTitle}</span>
                    )}
                  </div>
                  {list.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEditing = editingSessionId === session.id;
                    const isStarred = Boolean(session.isStarred);

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          if (!isEditing) {
                            setActiveSessionId(session.id);
                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                          }
                        }}
                        className={`group relative flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl cursor-pointer text-xs sm:text-xs transition active:scale-[0.99] touch-manipulation ${
                          isActive
                            ? 'bg-[#262626] text-white font-medium shadow-xs border border-white/5'
                            : 'text-slate-300 hover:bg-[#212121] active:bg-[#252525] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {isStarred ? (
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTitleText}
                              onChange={(e) => setEditingTitleText(e.target.value)}
                              onBlur={() => handleSaveRename(session.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(session.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              autoFocus
                              className="w-full bg-[#171717] border border-cyan-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="truncate text-[13px]">{session.title}</span>
                          )}
                        </div>

                        {!isEditing && (
                          <div
                            className={`flex items-center gap-0.5 transition-opacity ${
                              isActive || isStarred
                                ? 'opacity-100'
                                : 'opacity-90 md:opacity-0 md:group-hover:opacity-100'
                            }`}
                          >
                            <button
                              onClick={(e) => handleToggleStarSession(session.id, e)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition touch-manipulation cursor-pointer ${
                                isStarred
                                  ? 'text-amber-400'
                                  : 'text-slate-400 hover:text-amber-300'
                              }`}
                              title={isStarred ? 'Unstar chat (Remove from Starred)' : 'Star chat (Pin to Starred)'}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                                }`}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(session.id);
                                setEditingTitleText(session.title);
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:text-white text-slate-400 rounded-lg hover:bg-white/10 active:scale-95 transition touch-manipulation cursor-pointer"
                              title="Rename chat"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="w-8 h-8 flex items-center justify-center hover:text-rose-400 text-slate-400 rounded-lg hover:bg-white/10 active:scale-95 transition touch-manipulation cursor-pointer"
                              title="Delete chat"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer with Mobile Safe Area */}
        <div className="p-3.5 border-t border-[#2f2f2f]">
          {/* User profile row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <FastGptLogo size="sm" showText={false} glow={false} darkText={false} />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">Fast GPT</div>
                <div className="text-[10px] text-cyan-400 truncate">Hasaan (حسان)</div>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#212121] text-emerald-400 font-semibold border border-[#2f2f2f] shadow-xs">
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay with Smooth Fade Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-30 md:hidden touch-manipulation"
          />
        )}
      </AnimatePresence>

      {/* =========================================================================
          MAIN CHAT CANVAS (Real ChatGPT #212121 canvas layout)
      ========================================================================== */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#212121] relative">
        {/* Top Header Navbar - Clean Minimalist ChatGPT Style */}
        <header className="h-14 flex items-center justify-between px-3 sm:px-5 bg-[#212121] z-10 shrink-0 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3 min-w-0">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-[#2f2f2f] active:scale-95 transition cursor-pointer shrink-0 flex items-center justify-center touch-manipulation"
                title="Open sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {/* Fast GPT Branding */}
            <div className="pr-1.5 sm:pr-2 shrink-0">
              <FastGptLogo size="sm" showText={true} darkText={false} />
            </div>

            {/* Model Selector Dropdown (Fast GPT Engines) */}
            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl hover:bg-[#2f2f2f] text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer border border-[#333]/60 bg-[#1a1a1a] active:scale-95 touch-manipulation"
              >
                <span className="truncate max-w-[130px] sm:max-w-none">{currentModel.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Model Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl bg-[#171717] border border-[#2f2f2f] p-1.5 shadow-2xl z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Model
                  </div>
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className="w-full flex items-start justify-between p-2.5 rounded-xl hover:bg-[#212121] transition text-left cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{model.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
                            {model.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{model.desc}</p>
                      </div>
                      {selectedModelId === model.id && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Star / Pin Active Chat Session */}
            {currentSession && (
              <button
                onClick={() => handleToggleStarSession(currentSession.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-xl text-xs font-medium transition cursor-pointer border active:scale-95 touch-manipulation ${
                  currentSession.isStarred
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-xs'
                    : 'bg-[#1a1a1a] text-slate-400 hover:text-white border-[#333]/60 hover:bg-[#2f2f2f]'
                }`}
                title={
                  currentSession.isStarred
                    ? 'Starred chat (Click to remove from Starred)'
                    : 'Star chat (Pin to Starred section)'
                }
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    currentSession.isStarred
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {currentSession.isStarred ? 'Starred' : 'Star'}
                </span>
              </button>
            )}

            {/* Share Current Chat Session */}
            {currentSession && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition cursor-pointer border border-[#333]/60 bg-[#1a1a1a] hover:bg-[#2f2f2f] text-slate-200 hover:text-white active:scale-95 touch-manipulation shadow-xs"
                title="Share chat (Generate public link or copy formatted document)"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            {/* Download Chat Conversation Dropdown */}
            {currentSession && (
              <div className="relative" ref={downloadMenuRef}>
                <button
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition cursor-pointer border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 hover:text-white active:scale-95 touch-manipulation shadow-xs"
                  title={uiLanguage === 'ur' ? 'چیٹ ڈاؤن لوڈ کریں' : 'Download Chat Conversation'}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{uiLanguage === 'ur' ? 'ڈاؤن لوڈ' : 'Download'}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-400/80" />
                </button>

                {/* Download Menu Popover */}
                {isDownloadMenuOpen && (
                  <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 rounded-2xl bg-[#1c1c1c] border border-[#333333] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{uiLanguage === 'ur' ? 'ڈاؤن لوڈ فارمیٹ' : 'Download As'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{messages.length} msgs</span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleDownloadChat('md')}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Markdown (.md)</div>
                          <div className="text-[10px] text-slate-400">Formatted with headers & code</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDownloadChat('pdf')}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                          <FileDown className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">PDF Document (.pdf)</div>
                          <div className="text-[10px] text-slate-400">Printable notes & review</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDownloadChat('txt')}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Plain Text (.txt)</div>
                          <div className="text-[10px] text-slate-400">Clean text transcript</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDownloadChat('json')}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                          <Code className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">JSON Archive (.json)</div>
                          <div className="text-[10px] text-slate-400">Full session backup data</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI App Builder Studio */}
            <button
              onClick={() => setIsAppBuilderOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition cursor-pointer border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-indigo-950/60 to-purple-950/60 hover:from-cyan-900/80 hover:to-indigo-900/80 text-cyan-200 hover:text-white active:scale-95 touch-manipulation shadow-xs"
              title="AI App Builder Studio: Architect and Build Complete Applications"
            >
              <Boxes className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>App Builder</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 hidden md:inline">
                Studio
              </span>
            </button>

            {/* Create & Edit Images Studio (gemini-nano-banana-2.1) */}
            <button
              onClick={() => {
                setImageModalPrompt(inputPrompt || '');
                setInitialImageForEdit(null);
                setIsImageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition cursor-pointer border border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-cyan-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 text-purple-200 hover:text-white active:scale-95 touch-manipulation shadow-xs"
              title="Create & Edit Images with gemini-nano-banana-2.1"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Image Studio</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 hidden md:inline">
                nano-banana 2.1
              </span>
            </button>
          </div>

          {/* Right Header Controls: TTS Speed & UI Settings */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Auto-Speak Read Aloud Toggle & Discreet Speech Speed Configuration */}
            <div
              className="relative flex items-center bg-[#282828] p-0.5 rounded-lg border border-white/10"
              ref={ttsMenuRef}
            >
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                  autoSpeak
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={autoSpeak ? 'Auto Read Aloud ON' : 'Auto Read Aloud OFF'}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Discreet Speed Button */}
              <button
                onClick={() => setIsTtsSpeedOpen(!isTtsSpeedOpen)}
                className="px-1.5 py-1 text-[11px] font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer flex items-center gap-0.5"
                title="Adjust speech playback speed"
              >
                <span>{tts.rate.toFixed(1)}x</span>
                <Sliders className="w-3 h-3 text-slate-400" />
              </button>

              {/* Discreet TTS Speed Popover */}
              {isTtsSpeedOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-[#1c1c1c] border border-[#333333] p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Speech Speed
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {tts.rate.toFixed(1)}x
                    </span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={tts.rate}
                      onChange={(e) => tts.setRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>1.5x</span>
                      <span>2.0x</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                      {[0.8, 1.0, 1.2, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => tts.setRate(speed)}
                          className={`py-1 text-[11px] font-mono rounded-lg transition cursor-pointer ${
                            tts.rate === speed
                              ? 'bg-emerald-500 text-black font-bold'
                              : 'bg-[#282828] text-slate-300 hover:bg-[#333] hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* UI Settings Dropdown (Markdown vs Raw text toggle, display modes) */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                  isSettingsOpen
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-[#282828] border border-white/10'
                }`}
                title="UI Settings (Ctrl+Shift+L)"
              >
                <Settings className={`w-4 h-4 ${isSettingsOpen ? 'text-black' : 'text-slate-300'}`} />
              </button>

              {/* UI Settings Popover */}
              {isSettingsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#1c1c1c] border border-[#333333] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        UI Settings
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                        Ctrl+Shift+L
                      </kbd>
                      <button
                        onClick={() => setIsSettingsOpen(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Settings Tab Selector: Preferences vs Usage Dashboard */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#141414] rounded-xl border border-[#2b2b2b] my-3">
                    <button
                      onClick={() => setSettingsTab('display')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        settingsTab === 'display'
                          ? 'bg-cyan-500 text-black font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-[#202020]'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Preferences</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab('usage')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        settingsTab === 'usage'
                          ? 'bg-cyan-500 text-black font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-[#202020]'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Usage</span>
                    </button>
                  </div>

                  {settingsTab === 'usage' ? (
                    /* Dedicated Session Usage Dashboard */
                    <div className="space-y-3 pt-1">
                      {/* Estimated Tokens Card */}
                      <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2e2e2e]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            Estimated Tokens
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            ~{sessionUsageStats.totalTokens.toLocaleString()}
                          </span>
                        </div>

                        {/* Token Distribution Progress Bar */}
                        <div className="w-full bg-[#252525] h-2 rounded-full overflow-hidden flex my-2">
                          <div
                            style={{ width: `${sessionUsageStats.promptPercent}%` }}
                            className="bg-indigo-500 h-full transition-all duration-300"
                            title={`Prompt: ~${sessionUsageStats.promptTokens} tokens`}
                          />
                          <div
                            style={{ width: `${sessionUsageStats.responsePercent}%` }}
                            className="bg-cyan-400 h-full transition-all duration-300"
                            title={`Response: ~${sessionUsageStats.responseTokens} tokens`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              User Prompt
                            </span>
                            <span className="font-mono font-medium">~{sessionUsageStats.promptTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              AI Output
                            </span>
                            <span className="font-mono font-medium">~{sessionUsageStats.responseTokens.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Message Count Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e]">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">
                            Messages
                          </div>
                          <div className="text-xl font-bold text-white mt-0.5 font-mono">
                            {sessionUsageStats.totalMessages}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {sessionUsageStats.userMessages} user • {sessionUsageStats.assistantMessages} AI
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e]">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">
                            Avg Response
                          </div>
                          <div className="text-xl font-bold text-white mt-0.5 font-mono">
                            {sessionUsageStats.avgWordsPerReply}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            words / response
                          </div>
                        </div>
                      </div>

                      {/* Engine Details */}
                      <div className="p-3 rounded-xl bg-[#141414] border border-[#2e2e2e] space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Current Model</span>
                          <span className="text-white font-semibold">{currentModel.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Context Window</span>
                          <span className="text-emerald-400 font-mono text-[10px]">1M Tokens</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Characters in Chat</span>
                          <span className="text-slate-300 font-mono text-[10px]">
                            {sessionUsageStats.totalChars.toLocaleString()} chars
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-center text-slate-500 pt-0.5">
                        Usage calculated locally in real-time (~4 chars / token).
                      </div>
                    </div>
                  ) : (
                    /* Display Preferences */
                    <div className="space-y-3 pt-1">
                      {/* Setting: Markdown vs Raw Text */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-200">
                            Assistant Responses
                          </label>
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {renderMarkdown ? 'Markdown' : 'Raw Text'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          Switch between rendered Markdown formatting and unrendered raw plain text.
                        </p>

                        {/* Interactive 2-Way Pill Switch */}
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#141414] rounded-xl border border-[#2b2b2b]">
                          <button
                            onClick={() => {
                              if (!renderMarkdown) toggleRenderMarkdown();
                            }}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                              renderMarkdown
                                ? 'bg-cyan-500 text-black font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white hover:bg-[#202020]'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Rendered</span>
                          </button>

                          <button
                            onClick={() => {
                              if (renderMarkdown) toggleRenderMarkdown();
                            }}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                              !renderMarkdown
                                ? 'bg-cyan-500 text-black font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white hover:bg-[#202020]'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Raw Text</span>
                          </button>
                        </div>
                      </div>

                      {/* Speech & Audio Settings */}
                      <div className="pt-2.5 border-t border-[#2e2e2e] space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Auto Read Aloud (TTS)</span>
                          <button
                            onClick={() => setAutoSpeak(!autoSpeak)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                              autoSpeak ? 'bg-emerald-500' : 'bg-[#333]'
                            }`}
                            title="Toggle Auto Read Aloud"
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition ${
                                autoSpeak ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Keyboard Shortcuts Guide */}
                      <div className="pt-2.5 border-t border-[#2e2e2e] space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Keyboard Shortcuts</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-400 py-0.5">
                            <span>New Chat</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-cyan-300 font-semibold">
                              Ctrl + N
                            </kbd>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 py-0.5">
                            <span>Focus Input</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-cyan-300 font-semibold">
                              Ctrl + K
                            </kbd>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 py-0.5">
                            <span>Open UI Settings</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-cyan-300 font-semibold">
                              Ctrl + Shift + L
                            </kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New chat icon */}
            <button
              onClick={handleCreateNewChat}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer"
              title="New Chat (Ctrl+N)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
            <span>
              ⚡ Offline Mode Active — Powered by local AI engine.
            </span>
            <button
              onClick={() => toggleForceOffline()}
              className="underline hover:text-amber-100 font-medium ml-2 cursor-pointer"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* =========================================================================
            DEDICATED PINNED MESSAGES SECTION AT TOP OF CHAT SESSION
        ========================================================================== */}
        <AnimatePresence>
          {pinnedMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-[#2f2f2f] bg-[#1a1a1a]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 z-10 shrink-0"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 flex-wrap">
                    <Pin className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      Pinned Messages ({pinnedMessages.length})
                    </span>
                    {lockedMessagesCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{lockedMessagesCount} Locked</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleUnpinAllMessages}
                      className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                      title={lockedMessagesCount > 0 ? "Unpins all except locked messages" : "Unpin all messages"}
                    >
                      <PinOff className="w-3 h-3" />
                      <span>{lockedMessagesCount > 0 ? 'Unpin unlocked' : 'Unpin all'}</span>
                    </button>

                    <button
                      onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{isPinnedExpanded ? 'Collapse' : 'Expand'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isPinnedExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isPinnedExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {pinnedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleJumpToMessage(msg.id)}
                        className={`group flex items-start justify-between gap-2 p-2.5 rounded-xl transition cursor-pointer text-xs ${
                          msg.isLocked
                            ? 'bg-[#292218] hover:bg-[#342a1e] border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                            : 'bg-[#262626] hover:bg-[#2e2e2e] border border-[#383838] hover:border-amber-500/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                                msg.role === 'user'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {msg.role === 'user' ? 'You' : 'Fast GPT'}
                            </span>
                            {msg.isLocked && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Read-Only</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-200 line-clamp-2 text-[11px] leading-relaxed break-words">
                            {msg.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                          {/* Lock / Unlock Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLockMessage(msg.id);
                            }}
                            className={`p-1 rounded transition cursor-pointer ${
                              msg.isLocked
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : 'hover:bg-white/10 text-slate-400 hover:text-amber-400'
                            }`}
                            title={
                              msg.isLocked
                                ? 'Read-Only Locked (Click to Unlock)'
                                : 'Lock as Read-Only (Prevent edit & delete)'
                            }
                          >
                            {msg.isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete message button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(msg.id);
                            }}
                            className={`p-1 rounded transition cursor-pointer ${
                              msg.isLocked
                                ? 'text-slate-600 hover:text-amber-400/80 cursor-not-allowed'
                                : 'hover:bg-white/10 text-slate-400 hover:text-rose-400'
                            }`}
                            title={
                              msg.isLocked
                                ? 'Cannot delete: Protected by Read-Only Lock (Unlock first)'
                                : 'Delete message'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Unpin button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePinMessage(msg.id);
                            }}
                            className={`p-1 rounded transition cursor-pointer ${
                              msg.isLocked
                                ? 'text-slate-600 hover:text-amber-400/80 cursor-not-allowed'
                                : 'hover:bg-white/10 text-slate-400 hover:text-amber-400'
                            }`}
                            title={
                              msg.isLocked
                                ? 'Protected by Read-Only Lock (Unlock before unpinning)'
                                : 'Unpin message'
                            }
                          >
                            <PinOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            MESSAGES CONTAINER
        ========================================================================== */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-7 select-text scrollbar-thin"
        >
          {/* Daily Morning Briefing Conversational Alert (Google Classroom Due Dates from Persistent Memory) */}
          <AnimatePresence>
            {morningAlert && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-3xl mx-auto mb-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#1f2937]/80 to-[#1e1e1e] border border-emerald-500/30 shadow-xl shadow-black/40 text-white relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center text-slate-900 shrink-0 shadow-md shadow-emerald-500/20 mt-0.5">
                      <Sun className="w-5 h-5 text-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {morningAlert.title}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          {morningAlert.formattedDate}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                          Google Classroom Sync
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {morningAlert.subtitle}
                      </p>

                      <ul className="mt-3 space-y-1.5">
                        {morningAlert.dueDates.map((factText, idx) => (
                          <li
                            key={idx}
                            className="text-xs flex items-center gap-2.5 text-slate-200 bg-black/40 rounded-xl px-3 py-2 border border-white/5"
                          >
                            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-normal flex-1 leading-snug">{factText}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            tts.speak(
                              'morning-briefing-alert',
                              `${morningAlert.title}. ${morningAlert.subtitle}. ${morningAlert.dueDates.join('. ')}`
                            );
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Read Aloud</span>
                        </button>

                        <button
                          onClick={() => setMorningAlert(null)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition cursor-pointer font-medium"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMorningAlert(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                    title="Dismiss briefing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length === 0 ? (
            /* Fast GPT Front Welcome Canvas */
            <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="flex flex-col items-center">
                <FastGptLogo size="xl" showText={true} glow={true} darkText={false} />
              </div>
            </div>
          ) : (
            /* ChatGPT Conversation Flow with Grouped Consecutive Messages */
            <motion.div
              variants={messageContainerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl mx-auto space-y-6 sm:space-y-7"
            >
              {/* In-Chat Session Banner with Direct Download Action */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs flex-wrap gap-2 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-300 truncate max-w-[220px] sm:max-w-md">
                    {currentSession?.title || 'Chat Conversation'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 shrink-0">
                    {messages.length} messages
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadChat('md')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
                    title={uiLanguage === 'ur' ? 'چیٹ مارک ڈاؤن فائل میں ڈاؤن لوڈ کریں' : 'Download chat transcript as Markdown (.md)'}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{uiLanguage === 'ur' ? 'ڈاؤن لوڈ چیٹ' : 'Download Chat'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadChat('pdf')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
                    title={uiLanguage === 'ur' ? 'پی ڈی ایف فارمیٹ میں ڈاؤن لوڈ کریں' : 'Download chat as PDF'}
                  >
                    <FileDown className="w-3.5 h-3.5 text-purple-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false} mode="popLayout">
                {messageGroups.map((group) => {
                  const isUser = group.role === 'user';

                  return (
                    <motion.div
                      key={group.id}
                      variants={messageItemVariants}
                      layout="position"
                      className={`flex flex-col transition-all duration-300 ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {isUser ? (
                        /* User Message Cluster (Right-aligned, bundled with tight vertical gap) */
                        <div className="flex flex-col items-end gap-1.5 w-full">
                          {group.messages.map((message, msgIdx) => {
                            const isFirst = msgIdx === 0;
                            const isLast = msgIdx === group.messages.length - 1;
                            const isSingle = group.messages.length === 1;
                            const isHighlighted = highlightedMessageId === message.id;

                            // Dynamic corner rounding for consecutive user bubbles
                            const bubbleRounding = isSingle
                              ? 'rounded-[22px]'
                              : isFirst
                              ? 'rounded-[22px] rounded-br-[7px]'
                              : isLast
                              ? 'rounded-[22px] rounded-tr-[7px]'
                              : 'rounded-[22px] rounded-r-[7px]';

                            return (
                              <div
                                id={`msg-${message.id}`}
                                key={message.id}
                                className={`group relative max-w-[85%] sm:max-w-[75%] transition-all duration-300 ${
                                  isHighlighted
                                    ? 'ring-2 ring-amber-400/90 shadow-xl shadow-amber-500/20 bg-amber-500/10 rounded-2xl p-1.5'
                                    : ''
                                }`}
                              >
                                {editingMessageId === message.id ? (
                                  <div className="bg-[#2f2f2f] rounded-2xl p-3 border border-white/20 w-full min-w-[280px]">
                                    <textarea
                                      value={editingMessageText}
                                      onChange={(e) => setEditingMessageText(e.target.value)}
                                      className="w-full bg-transparent text-sm text-white focus:outline-none resize-none"
                                      rows={2}
                                    />
                                    <div className="flex items-center justify-end gap-2 mt-2">
                                      <button
                                        onClick={() => setEditingMessageId(null)}
                                        className="px-3 py-1 rounded-lg text-xs text-slate-300 hover:bg-[#212121] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveEditUserMessage(message.id)}
                                        className="px-3 py-1 rounded-lg text-xs bg-white text-black font-semibold hover:bg-slate-200 cursor-pointer"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    {/* Read-Only Lock toggle button */}
                                    <button
                                      onClick={() => handleToggleLockMessage(message.id)}
                                      className={`p-1.5 rounded-full hover:bg-[#2f2f2f] transition cursor-pointer ${
                                        message.isLocked
                                          ? 'opacity-100 text-amber-400 bg-amber-500/15 border border-amber-500/30'
                                          : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Read-Only Locked (Click to Unlock)'
                                          : 'Lock as Read-Only (Prevents accidental editing or deletion)'
                                      }
                                    >
                                      {message.isLocked ? (
                                        <Lock className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                                      ) : (
                                        <Unlock className="w-3.5 h-3.5" />
                                      )}
                                    </button>

                                    {/* Pin button for user message */}
                                    <button
                                      onClick={() => handleTogglePinMessage(message.id)}
                                      className={`p-1.5 rounded-full hover:bg-[#2f2f2f] transition cursor-pointer ${
                                        message.isPinned
                                          ? 'opacity-100 text-amber-400'
                                          : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Locked: Unlock before unpinning'
                                          : message.isPinned
                                          ? 'Unpin message'
                                          : 'Pin message'
                                      }
                                    >
                                      {message.isPinned ? (
                                        <Pin className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      ) : (
                                        <Pin className="w-3.5 h-3.5" />
                                      )}
                                    </button>

                                    {/* Edit pencil on hover (protected when locked) */}
                                    <button
                                      onClick={() => handleStartEditUserMessage(message)}
                                      className={`p-1.5 rounded-full transition cursor-pointer ${
                                        message.isLocked
                                          ? 'opacity-40 text-slate-600 hover:text-amber-400/80 cursor-not-allowed'
                                          : 'opacity-0 group-hover:opacity-100 hover:bg-[#2f2f2f] text-slate-400 hover:text-white'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Cannot edit: Message is read-only locked. Unlock first.'
                                          : 'Edit message'
                                      }
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete message button (protected when locked) */}
                                    <button
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className={`p-1.5 rounded-full transition cursor-pointer ${
                                        message.isLocked
                                          ? 'opacity-40 text-slate-600 hover:text-amber-400/80 cursor-not-allowed'
                                          : 'opacity-0 group-hover:opacity-100 hover:bg-[#2f2f2f] text-slate-400 hover:text-rose-400'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Cannot delete: Message is read-only locked. Unlock first.'
                                          : 'Delete message'
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <div
                                      className={`px-5 py-2.5 text-[15px] leading-relaxed break-words relative transition-all ${bubbleRounding} ${
                                        message.isLocked
                                          ? 'bg-[#2a241b] text-white border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                                          : 'bg-[#2f2f2f] text-white'
                                      }`}
                                    >
                                      {message.isLocked ? (
                                        <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-semibold mb-1 justify-end select-none">
                                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                                            <span>Read-Only Locked</span>
                                          </span>
                                        </div>
                                      ) : message.isPinned ? (
                                        <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-1 font-semibold justify-end select-none">
                                          <Pin className="w-2.5 h-2.5 fill-amber-400" />
                                          <span>Pinned</span>
                                        </div>
                                      ) : null}
                                      {message.content}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Assistant Message Group (Unified under single ✦ avatar, bundled vertically) */
                        <div className="w-full flex items-start gap-3 sm:gap-4">
                          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs select-none">
                            ✦
                          </div>

                          <div className="flex-1 min-w-0 space-y-4">
                            {group.messages.map((message, msgIdx) => {
                              const isCurrentSpeaking = tts.currentId === message.id && tts.isPlaying;
                              const rating = messageRatings[message.id];
                              const isHighlighted = highlightedMessageId === message.id;

                              return (
                                <motion.div
                                  id={`msg-${message.id}`}
                                  key={message.id}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeOut' }}
                                  className={`text-[15px] leading-relaxed text-slate-100 transition-all duration-300 ${
                                    msgIdx > 0 ? 'pt-3.5 border-t border-white/5' : ''
                                  } ${
                                    isHighlighted
                                      ? 'ring-2 ring-amber-400/90 shadow-xl shadow-amber-500/20 bg-amber-500/10 rounded-2xl p-3'
                                      : ''
                                  }`}
                                >
                                  {/* Read-Only Locked Milestone Banner */}
                                  {message.isLocked && (
                                    <div className="inline-flex items-center gap-2 text-[11px] font-medium text-amber-300 bg-amber-500/15 border border-amber-500/35 px-3 py-1 rounded-full mb-3 select-none shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span>Read-Only Locked Milestone</span>
                                      <button
                                        onClick={() => handleToggleLockMessage(message.id)}
                                        className="text-[10px] text-amber-400 hover:text-white underline cursor-pointer ml-1"
                                        title="Unlock this response"
                                      >
                                        Unlock
                                      </button>
                                    </div>
                                  )}

                                  {isMessageRaw(message.id) ? (
                                    <div className="relative my-2 rounded-xl border border-white/10 bg-[#161616] p-3.5 sm:p-4 text-xs sm:text-sm font-mono text-zinc-200 shadow-inner">
                                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-zinc-400">
                                        <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                          Raw Text View
                                        </span>
                                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono">
                                          {message.content.length.toLocaleString()} chars
                                        </span>
                                      </div>
                                      <pre className="whitespace-pre-wrap break-words font-mono select-text overflow-x-auto leading-relaxed">
                                        {message.content}
                                      </pre>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <MarkdownView content={message.content} />
                                      {streamingMsgId === message.id && (
                                        <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 rounded-[1px] animate-pulse align-middle" />
                                      )}
                                    </div>
                                  )}

                                  {/* App Launcher Action Card (YouTube, WhatsApp, Calculator, Camera, App Hub, etc.) */}
                                  {message.appTarget && (
                                    <AppLauncherCard
                                      appTarget={message.appTarget}
                                      onOpenInternal={(target) => {
                                        if (target === 'calculator') setIsCalculatorOpen(true);
                                        else if (target === 'camera') setIsCameraOpen(true);
                                        else if (target === 'app_builder') setIsAppBuilderOpen(true);
                                        else if (target === 'image_studio') setIsImageModalOpen(true);
                                        else if (target === 'code_playground') setIsPlaygroundOpen(true);
                                      }}
                                    />
                                  )}

                                  {/* AI Generated / Edited Image Artwork Card */}
                                  {message.generatedImage && (
                                    <div className="mt-3 rounded-2xl overflow-hidden border border-purple-500/35 bg-[#14151b] shadow-2xl max-w-lg">
                                      <div
                                        onClick={() => {
                                          setLightboxImage({
                                            url: message.generatedImage!.url,
                                            prompt: message.generatedImage!.prompt,
                                            aspectRatio: message.generatedImage!.aspectRatio || '16:9',
                                          });
                                        }}
                                        className="relative group overflow-hidden bg-black/60 cursor-zoom-in"
                                      >
                                        <img
                                          src={message.generatedImage.url}
                                          alt={message.generatedImage.prompt}
                                          className="w-full h-auto object-contain max-h-[380px] mx-auto transition-transform duration-300 group-hover:scale-[1.03]"
                                        />

                                        {/* Hover Zoom Overlay Badge */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none p-3 backdrop-blur-2xs">
                                          <div className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-2 shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <ZoomIn className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                            <span>Click to View Fullscreen Zoom</span>
                                          </div>
                                        </div>

                                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-900/90 text-purple-200 border border-purple-500/50 backdrop-blur-md shadow-md flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                            gemini-nano-banana-2.1
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/75 text-slate-300 border border-white/10 backdrop-blur-md">
                                            {message.generatedImage.aspectRatio || '16:9'}
                                          </span>
                                        </div>

                                        <div className="absolute top-2.5 right-2.5 z-10">
                                          <span className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 border border-white/10 group-hover:bg-purple-600 group-hover:text-white transition flex items-center shadow-md">
                                            <Maximize2 className="w-3.5 h-3.5" />
                                          </span>
                                        </div>
                                      </div>

                                      <div className="p-3 bg-[#101116] border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
                                        <div className="min-w-0 flex-1">
                                          <p className="text-xs text-slate-300 truncate" title={message.generatedImage.prompt}>
                                            "{message.generatedImage.prompt}"
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {/* Zoom & Lightbox View */}
                                          <button
                                            onClick={() => {
                                              setLightboxImage({
                                                url: message.generatedImage!.url,
                                                prompt: message.generatedImage!.prompt,
                                                aspectRatio: message.generatedImage!.aspectRatio || '16:9',
                                              });
                                            }}
                                            className="px-2 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer flex items-center gap-1 active:scale-95"
                                            title="View Fullscreen & Zoom Details"
                                          >
                                            <ZoomIn className="w-3 h-3 text-cyan-400" />
                                            <span className="hidden sm:inline">Zoom</span>
                                          </button>

                                          {/* Edit with AI Text Prompt */}
                                          <button
                                            onClick={() => {
                                              setInitialImageForEdit(message.generatedImage!.url);
                                              setImageModalPrompt(message.generatedImage!.prompt);
                                              setIsImageModalOpen(true);
                                            }}
                                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white border border-purple-500/40 transition cursor-pointer flex items-center gap-1.5 active:scale-95 touch-manipulation shadow-xs"
                                            title="Edit this image using text prompts with gemini-nano-banana-2.1"
                                          >
                                            <Sliders className="w-3 h-3 text-purple-400" />
                                            <span>Edit with AI</span>
                                          </button>

                                          {/* Download PNG */}
                                          <button
                                            onClick={() => {
                                              const a = document.createElement('a');
                                              a.href = message.generatedImage!.url;
                                              a.download = `fastgpt-artwork-${Date.now()}.png`;
                                              document.body.appendChild(a);
                                              a.click();
                                              document.body.removeChild(a);
                                            }}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                                            title="Download PNG"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Streaming subtle pulsating indicator */}
                                  {isSubmitting && message.id === messages[messages.length - 1]?.id && (
                                    <motion.span
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: [0.2, 1, 0.2] }}
                                      transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut' }}
                                      className="inline-block w-2 h-4 ml-1.5 bg-emerald-400 rounded-xs align-middle shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                                    />
                                  )}

                                  {/* Action Toolbar */}
                                  <div className="mt-3 flex items-center gap-1 sm:gap-2 text-slate-400 text-xs flex-wrap">
                                    {/* Read Aloud Button */}
                                    <button
                                      onClick={() => tts.speak(message.id, message.content)}
                                      className={`p-1.5 rounded-lg hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer ${
                                        isCurrentSpeaking ? 'text-emerald-400' : ''
                                      }`}
                                      title={isCurrentSpeaking ? 'Stop speech' : 'Read aloud'}
                                    >
                                      {isCurrentSpeaking ? (
                                        <Square className="w-4 h-4 fill-current animate-pulse text-emerald-400" />
                                      ) : (
                                        <Volume2 className="w-4 h-4" />
                                      )}
                                    </button>

                                    {/* Copy button */}
                                    <button
                                      onClick={() => navigator.clipboard.writeText(message.content)}
                                      className="p-1.5 rounded-lg hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer"
                                      title="Copy response"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>

                                    {/* Per-message Raw Text / Markdown Toggle Button */}
                                    <button
                                      onClick={() => toggleMessageRawView(message.id)}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                        isMessageRaw(message.id)
                                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                          : 'text-slate-400 hover:text-white hover:bg-[#2f2f2f]'
                                      }`}
                                      title={isMessageRaw(message.id) ? 'Switch to rendered Markdown' : 'Switch to raw text'}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{isMessageRaw(message.id) ? 'Raw' : 'Markdown'}</span>
                                    </button>

                                    {/* Read-Only Lock / Unlock button */}
                                    <button
                                      onClick={() => handleToggleLockMessage(message.id)}
                                      className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                        message.isLocked
                                          ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                                          : 'text-slate-400 hover:text-amber-400 hover:bg-[#2f2f2f]'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Read-Only Locked (Click to Unlock)'
                                          : 'Lock response as Read-Only (Prevents deletion)'
                                      }
                                    >
                                      {message.isLocked ? (
                                        <>
                                          <Lock className="w-4 h-4 fill-amber-400 text-amber-400" />
                                          <span className="text-[11px] font-semibold text-amber-400">
                                            Locked
                                          </span>
                                        </>
                                      ) : (
                                        <Unlock className="w-4 h-4" />
                                      )}
                                    </button>

                                    {/* Pin / Unpin response button */}
                                    <button
                                      onClick={() => handleTogglePinMessage(message.id)}
                                      className={`p-1.5 rounded-lg hover:bg-[#2f2f2f] transition cursor-pointer flex items-center gap-1.5 ${
                                        message.isPinned
                                          ? 'text-amber-400 bg-amber-500/10'
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Locked: Unlock before unpinning'
                                          : message.isPinned
                                          ? 'Unpin response'
                                          : 'Pin response'
                                      }
                                    >
                                      {message.isPinned ? (
                                        <Pin className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      ) : (
                                        <Pin className="w-4 h-4" />
                                      )}
                                      {message.isPinned && (
                                        <span className="text-[11px] font-medium text-amber-400">
                                          Pinned
                                        </span>
                                      )}
                                    </button>

                                    {/* Delete message button */}
                                    <button
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                                        message.isLocked
                                          ? 'text-slate-600 hover:text-amber-400/80 cursor-not-allowed'
                                          : 'text-slate-400 hover:text-rose-400 hover:bg-[#2f2f2f]'
                                      }`}
                                      title={
                                        message.isLocked
                                          ? 'Cannot delete: Protected by Read-Only Lock (Unlock first)'
                                          : 'Delete message'
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Thumbs up */}
                                    <button
                                      onClick={() =>
                                        setMessageRatings((prev) => ({
                                          ...prev,
                                          [message.id]: rating === 'up' ? undefined! : 'up',
                                        }))
                                      }
                                      className={`p-1.5 rounded-lg hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer ${
                                        rating === 'up' ? 'text-emerald-400' : ''
                                      }`}
                                      title="Good response"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </button>

                                    {/* Thumbs down */}
                                    <button
                                      onClick={() =>
                                        setMessageRatings((prev) => ({
                                          ...prev,
                                          [message.id]: rating === 'down' ? undefined! : 'down',
                                        }))
                                      }
                                      className={`p-1.5 rounded-lg hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer ${
                                        rating === 'down' ? 'text-rose-400' : ''
                                      }`}
                                      title="Bad response"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                    </button>

                                    {/* Regenerate */}
                                    <button
                                      onClick={() => {
                                        const lastUser = [...messages]
                                          .reverse()
                                          .find((m) => m.role === 'user');
                                        if (lastUser) handleSendMessage(lastUser.content);
                                      }}
                                      className="p-1.5 rounded-lg hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer"
                                      title="Regenerate response"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>

                                    {/* Export to PDF */}
                                    <button
                                      onClick={() => setIsExportPdfOpen(true)}
                                      className="p-1.5 rounded-lg hover:text-white hover:bg-[#2f2f2f] transition cursor-pointer"
                                      title="Export to PDF"
                                    >
                                      <FileDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Streaming loading indicator with fluid fade-in */}
              <AnimatePresence>
                {isSubmitting &&
                  (!messages.length ||
                    messages[messages.length - 1]?.role === 'user' ||
                    !messages[messages.length - 1]?.content) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 mt-1 animate-pulse shadow-xs">
                        ✦
                      </div>
                      <div className="flex items-center gap-1.5 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </div>

        {/* =========================================================================
            AUTHENTIC CHATGPT FLOATING INPUT CAPSULE (Touch-Optimized for Mobile)
        ========================================================================== */}
        <div className="px-2.5 sm:px-4 md:px-5 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#212121] via-[#212121] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Input Capsule */}
            <div className="relative rounded-[24px] sm:rounded-[26px] bg-[#292929] sm:bg-[#2f2f2f] border border-white/10 focus-within:border-white/25 focus-within:ring-2 focus-within:ring-white/10 shadow-xl p-2 sm:p-2.5 flex flex-col gap-1 transition-all">
              {/* Quick Action Chips Based on Last Assistant Message */}
              {lastAssistantMessage && !isSubmitting && (
                <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5 overflow-x-auto no-scrollbar border-b border-white/5">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0 select-none mr-0.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span className="hidden xs:inline">Quick Action:</span>
                  </div>

                  {/* Summarize Chip */}
                  <button
                    type="button"
                    onClick={() => handleQuickAction('summarize')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 hover:text-white border border-white/10 hover:border-sky-400/40 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 shadow-xs"
                    title="Summarize the previous response into key points"
                  >
                    <FileText className="w-3 h-3 text-sky-400" />
                    <span>Summarize</span>
                  </button>

                  {/* Explain Chip */}
                  <button
                    type="button"
                    onClick={() => handleQuickAction('explain')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 hover:text-white border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 shadow-xs"
                    title="Explain the previous response in simpler terms"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>Explain</span>
                  </button>

                  {/* Translate Chip */}
                  <button
                    type="button"
                    onClick={() => handleQuickAction('translate')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 hover:text-white border border-white/10 hover:border-emerald-400/40 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 shadow-xs"
                    title={
                      isLastAssistantUrdu
                        ? 'Translate previous response to English'
                        : 'Translate previous response to Urdu'
                    }
                  >
                    <Languages className="w-3 h-3 text-emerald-400" />
                    <span>Translate</span>
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white/10 text-emerald-300">
                      {isLastAssistantUrdu ? 'EN' : 'UR'}
                    </span>
                  </button>

                  {/* Create & Edit Image Studio Chip (gemini-nano-banana-2.1) */}
                  <button
                    type="button"
                    onClick={() => {
                      setImageModalPrompt(lastAssistantMessage?.content.slice(0, 180) || '');
                      setInitialImageForEdit(null);
                      setIsImageModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 hover:bg-purple-500/25 active:bg-purple-500/35 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400/60 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 shadow-xs"
                    title="Open Image Studio (Create or edit images with gemini-nano-banana-2.1)"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Image Studio</span>
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  isListening
                    ? 'Listening... Speak now'
                    : 'Ask Fast GPT anything... (Ctrl+K)'
                }
                className="w-full bg-transparent px-3 py-1.5 text-base sm:text-[15px] text-white placeholder-slate-400 resize-none focus:outline-none max-h-40 min-h-[40px] leading-relaxed touch-manipulation"
              />

              {/* Inside Capsule Control Bar */}
              <div className="flex items-center justify-between px-1 pt-0.5 gap-1.5">
                {/* Left indicators & Quick actions on keyboard bar */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {isListening ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-full animate-pulse select-none">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-semibold text-[11px]">Listening...</span>
                    </div>
                  ) : inputPrompt.trim() ? (
                    <button
                      onClick={() => setInputPrompt('')}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition active:scale-95 touch-manipulation flex items-center gap-1 cursor-pointer"
                      title="Clear input"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 select-none px-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">Ctrl+K</kbd>
                      <span>to focus</span>
                    </span>
                  )}
                </div>

                {/* Right controls: Mic and Send buttons (Enlarged 40px touch targets for mobile) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Microphone Voice Input (Duplicate-free accurate speech transcription) */}
                  <button
                    onClick={() => {
                      const voiceLang = uiLanguage === 'ur' ? 'ur-PK' : 'en-US';
                      toggleListening(voiceLang);
                    }}
                    className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition active:scale-90 touch-manipulation cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15'
                    }`}
                    title={
                      isListening
                        ? uiLanguage === 'ur'
                          ? 'مائیکروفون بند کریں'
                          : 'Turn mic OFF'
                        : uiLanguage === 'ur'
                        ? 'صوتی ان پٹ (صرف وہی جو آپ بولیں گے)'
                        : 'Voice input (clean duplicate-free speech)'
                    }
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send / Stop Button */}
                  {isSubmitting ? (
                    <button
                      onClick={handleStopGeneration}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 active:scale-90 transition cursor-pointer shadow-md touch-manipulation"
                      title="Stop generating"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputPrompt.trim()}
                      className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition active:scale-90 touch-manipulation cursor-pointer shadow-md ${
                        inputPrompt.trim()
                          ? 'bg-white text-black hover:bg-slate-200 font-bold'
                          : 'bg-[#3c3c3c] text-[#7c7c7c] cursor-not-allowed'
                      }`}
                      title="Send prompt"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fast GPT Disclaimer */}
            <div className="mt-1.5 sm:mt-2 text-center text-[10px] sm:text-[11px] text-slate-500 select-none">
              Fast GPT can make mistakes. Verify important info.
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODALS & OVERLAYS
      ========================================================================== */}
      {/* Create & Edit Images Studio (gemini-nano-banana-2.1) */}
      <ImageGenerationModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setInitialImageForEdit(null);
        }}
        language={uiLanguage}
        initialPrompt={imageModalPrompt}
        initialImageForEdit={initialImageForEdit}
        isOnline={isOnline}
        onInsertToChat={handleInsertImageToChat}
        existingImages={allChatGeneratedImages}
      />

      {/* AI App Builder Studio Modal */}
      <AppBuilderModal
        isOpen={isAppBuilderOpen}
        onClose={() => setIsAppBuilderOpen(false)}
        language={uiLanguage}
        isOnline={isOnline}
        onOpenPlayground={(code, lang) => {
          setPlaygroundCode(code);
          setPlaygroundLang(lang || 'typescript');
          setIsPlaygroundOpen(true);
        }}
        onSendToChat={(prompt) => {
          handleSendMessage(prompt);
        }}
      />

      {/* Built-in Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Built-in Camera & Vision Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photoDataUrl) => {
          setIsCameraOpen(false);
          setInitialImageForEdit(photoDataUrl);
          setIsImageModalOpen(true);
          showToast('📷 Photo captured! Opened in Image Studio.', 'info');
        }}
      />

      {/* Lightbox Zoom Modal for Chat Generated Images */}
      <ImageLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage?.url || null}
        prompt={lightboxImage?.prompt || ''}
        aspectRatio={lightboxImage?.aspectRatio || '16:9'}
        onEditInStudio={(url, prompt) => {
          setInitialImageForEdit(url);
          setImageModalPrompt(prompt);
          setIsImageModalOpen(true);
        }}
      />

      {/* Code Playground Modal */}
      <CodePlaygroundModal
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        initialCode={playgroundCode}
        language={playgroundLang}
        uiLanguage={uiLanguage}
      />

      {/* Custom Prompt Modal */}
      <CustomPromptModal
        isOpen={isCustomPromptOpen}
        onClose={() => setIsCustomPromptOpen(false)}
        language={uiLanguage}
      />

      {/* Flashcard Generator Modal */}
      <FlashcardGeneratorModal
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        language={uiLanguage}
        onGenerate={(prompt) => {
          setIsFlashcardModalOpen(false);
          handleSendMessage(prompt);
        }}
      />

      {/* Real Email Dispatcher Modal */}
      <RealEmailModal
        isOpen={isRealEmailModalOpen}
        onClose={() => setIsRealEmailModalOpen(false)}
        language={uiLanguage}
      />

      {/* Export to PDF Modal */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        messages={messages}
        activeModeName="Expert AI Conversation"
        categoryName="AI Chat Session"
      />

      {/* Share Chat Modal */}
      {currentSession && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          session={currentSession}
          language={uiLanguage}
        />
      )}

      {/* =========================================================================
          READ-ONLY LOCK TOAST NOTIFICATION
      ========================================================================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[90vw]"
          >
            <div
              className={`px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium flex items-center gap-2.5 border ${
                toastMessage.type === 'lock'
                  ? 'bg-[#291e0f]/95 text-amber-200 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : toastMessage.type === 'unlock'
                  ? 'bg-[#0f2918]/95 text-emerald-200 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : toastMessage.type === 'warning'
                  ? 'bg-[#2a0e14]/95 text-rose-200 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                  : 'bg-[#1b1c22]/95 text-zinc-100 border-white/15 shadow-black/60'
              }`}
            >
              {toastMessage.type === 'lock' && (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              {toastMessage.type === 'unlock' && (
                <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {toastMessage.type === 'warning' && (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {toastMessage.type === 'info' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="leading-tight">{toastMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          PROTECTED SESSION DELETION MODAL (FOR SESSIONS WITH LOCKED MESSAGES)
      ========================================================================== */}
      <AnimatePresence>
        {sessionToDeleteWithLocks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1e1e1e] border border-amber-500/35 rounded-2xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 mb-4 text-amber-400">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Protected Chat with Locked Milestones
                  </h3>
                  <p className="text-xs text-amber-300/80">Read-Only Safety Lock Active</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                "<span className="font-semibold text-white">{sessionToDeleteWithLocks.title}</span>" contains{' '}
                <span className="font-bold text-amber-400">
                  {sessionToDeleteWithLocks.lockedCount}
                </span>{' '}
                read-only locked message{sessionToDeleteWithLocks.lockedCount > 1 ? 's' : ''}. Deleting this chat will permanently remove all locked milestones.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setSessionToDeleteWithLocks(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Keep Chat
                </button>
                <button
                  onClick={() => executeDeleteSession(sessionToDeleteWithLocks.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete & Remove Locks</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
