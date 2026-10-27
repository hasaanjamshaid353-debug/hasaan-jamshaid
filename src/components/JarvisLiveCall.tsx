import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  RotateCcw,
  X,
  PhoneOff,
  Zap,
  Search,
  Youtube,
  Clock,
  Radio,
  FileSearch,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { UILanguage } from '../types';
import { generateVoiceAnswer } from '../utils/offlineEngine';
import { HolographicAvatarCanvas, AvatarState } from './HolographicAvatarCanvas';
import { derivePhonemeFromChar, PhonemeShape } from '../utils/phonemeEngine';
import { executeAutonomousVoiceTask } from '../utils/systemActionExecutor';

interface JarvisLiveCallProps {
  isOpen: boolean;
  onClose: () => void;
  language?: UILanguage;
  onSendMessage?: (text: string) => void;
}

type CallLanguageMode = 'ur' | 'en' | 'auto';

// Helper to test for Urdu/Arabic characters
function hasUrduScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

// Helper to test for Hindi characters
function hasHindiScript(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

// Helper to clean repetitive conversational filler
function removeRepetitiveFiller(text: string): string {
  if (!text) return '';
  return text
    .replace(/(?:how else may i assist you|how may i assist you|how can i assist you further|is there anything else|anything else i can help with)\??/gi, '')
    .replace(/(?:میں اور کیا مدد کروں|کیا میں مزید مدد کر سکتا ہوں|مزید کیا جاننا چاہتے ہیں)\??/g, '')
    .trim();
}

// Play pleasant futuristic connect/disconnect dual-tone chime
function playCallTone(type: 'connect' | 'disconnect') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'connect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.26);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch {}
}

export const JarvisLiveCall: React.FC<JarvisLiveCallProps> = ({
  isOpen,
  onClose,
  language = 'ur',
}) => {
  // Mic state: off by default until user taps to speak or holds Space
  const [isMicOn, setIsMicOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isAsleep, setIsAsleep] = useState(false);
  const [callLang, setCallLang] = useState<CallLanguageMode>('ur');
  const [aiReply, setAiReply] = useState<string>('');
  const [lastUserSpeech, setLastUserSpeech] = useState<string>('');
  const [currentPhoneme, setCurrentPhoneme] = useState<PhonemeShape | undefined>(undefined);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Call timer and layout mode ('reel' | 'compact')
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isReelMode, setIsReelMode] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const speechIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  // Strict deduplication & Self-Echo Guard refs
  const isProcessingQueryRef = useRef<boolean>(false);
  const lastProcessedTextRef = useRef<string>('');
  const lastProcessedTimestampRef = useRef<number>(0);
  const currentInterimTextRef = useRef<string>('');
  const lastAssistantSpokenTailRef = useRef<string>('');
  const lastAssistantSpokenTimestampRef = useRef<number>(0);
  const spacePressedRef = useRef<boolean>(false);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Format call duration MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compute avatar state
  const avatarState: AvatarState = isSpeaking
    ? 'speaking'
    : isThinking
    ? 'thinking'
    : isListening
    ? 'listening'
    : isAsleep
    ? 'asleep'
    : 'idle';

  // Handle call open/close & Initial JARVIS Greeting
  useEffect(() => {
    if (isOpen) {
      setIsMicOn(false);
      setIsListening(false);
      setIsAsleep(false);
      setCallDuration(0);
      isProcessingQueryRef.current = false;
      lastProcessedTextRef.current = '';

      playCallTone('connect');

      // Start call duration timer
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // JARVIS Voice First-Turn Greeting in Urdu
      const greeting =
        'یس سر! میں جارویس ہوں۔ سسٹم آپریشنل اور مستعد ہے۔ فرمائیے سر، آپ کا کیا حکم ہے؟';

      setAiReply(greeting);
      speakText(greeting);
      resetSilenceTimer();
    } else {
      endCall();
    }
    return () => {
      endCall();
    };
  }, [isOpen]);

  // Silence timer: auto-sleeps after 2 minutes of complete silence
  const resetSilenceTimer = () => {
    setIsAsleep(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      setIsAsleep(true);
    }, 120000);
  };

  // Global Push-to-Talk (Hold Space or Ctrl+Space)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !spacePressedRef.current) {
        e.preventDefault();
        spacePressedRef.current = true;
        resetSilenceTimer();
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spacePressedRef.current) {
        e.preventDefault();
        spacePressedRef.current = false;
        stopListening();
        const speechText = currentInterimTextRef.current.trim();
        if (speechText) {
          processVoiceQueryOnce(speechText);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  // End Call & Cleanup
  const endCall = () => {
    playCallTone('disconnect');
    stopListening();
    setIsMicOn(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setIsAsleep(false);
    isProcessingQueryRef.current = false;
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  // Start listening with Web Speech API
  const startListening = () => {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
      setCurrentPhoneme(undefined);
    }

    stopListening();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Urdu language voice recognition for JARVIS
      recognition.lang = 'ur-PK';

      recognition.onstart = () => {
        setIsListening(true);
        setIsAsleep(false);
        resetSilenceTimer();
        setAudioLevel(0.4);
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item[0]) {
            interim += item[0].transcript;
          }
        }
        currentInterimTextRef.current = interim;
        if (interim) {
          setAudioLevel(0.65 + Math.random() * 0.35);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Voice Speech Error:', err);
        setIsListening(false);
        setIsMicOn(false);
        setAudioLevel(0);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsMicOn(false);
        setAudioLevel(0);
        const speechText = currentInterimTextRef.current.trim();
        if (speechText && !spacePressedRef.current) {
          processVoiceQueryOnce(speechText);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      setIsListening(false);
      setIsMicOn(false);
      setAudioLevel(0);
    }
  };

  // Toggle user mic: explicit on/off control
  const toggleMic = () => {
    if (isMicOn || isListening) {
      stopListening();
      setIsMicOn(false);
      currentInterimTextRef.current = '';
    } else {
      setIsMicOn(true);
      startListening();
    }
  };

  // Web Speech API Text-to-Speech with Real Lip-Sync Articulation
  const speakText = (text: string, onEnd?: () => void) => {
    if (!synthRef.current) {
      if (onEnd) onEnd();
      return;
    }

    synthRef.current.cancel();
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);

    setIsSpeaking(true);

    const cleanText = removeRepetitiveFiller(
      text
        .replace(/[#*`_~\[\]()]/g, ' ')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );

    if (!cleanText) {
      setIsSpeaking(false);
      setCurrentPhoneme(undefined);
      if (onEnd) onEnd();
      return;
    }

    lastAssistantSpokenTailRef.current = cleanText.slice(-60);
    lastAssistantSpokenTimestampRef.current = Date.now();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synthRef.current.getVoices();
    const isUrdu = hasUrduScript(cleanText);

    if (isUrdu) {
      const urduVoice =
        voices.find((v) => v.lang.startsWith('ur')) ||
        voices.find((v) => v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang.startsWith('ar'));

      if (urduVoice) {
        utterance.voice = urduVoice;
        utterance.lang = urduVoice.lang;
      } else {
        utterance.lang = 'ur-PK';
      }
      utterance.rate = 1.05;
      utterance.pitch = 0.98;
    } else {
      const enVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Guy'))) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
    }

    // Phoneme lip-sync animation driver
    let charIndex = 0;
    speechIntervalRef.current = setInterval(() => {
      if (charIndex < cleanText.length) {
        const char = cleanText[charIndex];
        const phoneme = derivePhonemeFromChar(char);
        setCurrentPhoneme(phoneme);
        setAudioLevel(0.4 + Math.random() * 0.6);
        charIndex++;
      } else {
        setCurrentPhoneme(undefined);
        setAudioLevel(0);
      }
    }, 65);

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentPhoneme(undefined);
      setAudioLevel(0);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentPhoneme(undefined);
      setAudioLevel(0);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      if (onEnd) onEnd();
    };

    synthRef.current.speak(utterance);
  };

  // Single-Query Processing Engine
  const processVoiceQueryOnce = async (rawText: string) => {
    const cleanText = rawText.trim();
    if (!cleanText || isProcessingQueryRef.current) return;

    const now = Date.now();
    setLastUserSpeech(cleanText);

    // Self-Echo Guard
    if (
      lastAssistantSpokenTailRef.current &&
      now - lastAssistantSpokenTimestampRef.current < 2500 &&
      (lastAssistantSpokenTailRef.current.includes(cleanText) ||
        cleanText.includes(lastAssistantSpokenTailRef.current.slice(0, 20)))
    ) {
      console.log('Self-echo suppressed:', cleanText);
      return;
    }

    // Duplicate query suppression
    if (
      cleanText === lastProcessedTextRef.current &&
      now - lastProcessedTimestampRef.current < 4000
    ) {
      console.log('Duplicate query ignored:', cleanText);
      return;
    }

    isProcessingQueryRef.current = true;
    lastProcessedTextRef.current = cleanText;
    lastProcessedTimestampRef.current = now;
    currentInterimTextRef.current = '';

    setIsThinking(true);

    // 1. Autonomous Task Execution (Opening apps/sites, Google search, YouTube, system status, timers)
    const actionResult = executeAutonomousVoiceTask(cleanText, { isJarvis: true, lang: 'ur' });
    if (actionResult.handled) {
      setIsThinking(false);
      setAiReply(actionResult.replyText);
      speakText(actionResult.replyText, () => {
        isProcessingQueryRef.current = false;
      });
      return;
    }

    // 2. Creator Query Check
    const lower = cleanText.toLowerCase();
    if (
      lower.includes('who made you') ||
      lower.includes('who created you') ||
      lower.includes('kisne banaya') ||
      lower.includes('کس نے بنایا') ||
      lower.includes('تمہیں کس نے') ||
      lower.includes('آپ کو کس نے')
    ) {
      const creatorReply = 'مجھے حسان نے بنایا ہے سر۔';
      setIsThinking(false);
      setAiReply(creatorReply);
      speakText(creatorReply, () => {
        isProcessingQueryRef.current = false;
      });
      return;
    }

    // 3. Online JARVIS Voice Query via `/api/chat`
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: cleanText }],
          mode: 'general',
          modelId: 'jarvis-voice',
          customInstructions: `CRITICAL MANDATE: You are JARVIS (جارویس) - ultra-intelligent, fiercely loyal, and diligent AI voice assistant in a real-time voice call.
The user is your Commander / Sir (سر / جناب).
RULES:
1. Tone & Style: Always speak with professional mastery, confidence, and polite obedience. Always converse in Urdu (unless user addresses you in another language).
2. CONCISE & TO-THE-POINT: Keep responses short, measured, and to-the-point ("مختصر، نپی تلی زبان میں، اور ٹو دی پوائنٹ"). Never produce long rambling paragraphs or unnecessary fluff because this is a spoken call.
3. COMMAND & MISSION EXECUTION: When given a task or mission, confirm immediately ("یس سر، کام شروع کر رہا ہوں" or "فوری طور پر کرتا ہوں سر") and report task status cleanly.
4. STRATEGIC & PROACTIVE: If the user's command is incomplete or vague, ask one short, clear clarifying question ("سر، آپ کون سی فائل تلاش کرنا چاہتے ہیں؟").
5. CREATOR IDENTITY: If asked who made you, say: "مجھے حسان نے بنایا ہے سر۔"`,
        }),
      });

      let reply = '';
      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder('utf-8');
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
                    reply += data.text;
                  }
                } catch {}
              }
            }
          }
        }
      }

      const finalReply =
        reply.trim() || generateVoiceAnswer(cleanText, callLang);

      setIsThinking(false);
      setAiReply(finalReply);
      speakText(finalReply, () => {
        isProcessingQueryRef.current = false;
      });
    } catch {
      const fallback = generateVoiceAnswer(cleanText, callLang);
      setIsThinking(false);
      setAiReply(fallback);
      speakText(fallback, () => {
        isProcessingQueryRef.current = false;
      });
    }
  };

  // Quick Action execution handler
  const handleQuickAction = (actionPrompt: string) => {
    processVoiceQueryOnce(actionPrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Background Holographic Grid & Arc Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-black to-black pointer-events-none" />

      {/* Main Call Container: Toggleable between Reel 9:16 vertical phone layout and Wide HUD */}
      <div
        className={`w-full ${
          isReelMode
            ? 'max-w-[420px] aspect-[9/16] min-h-[640px] max-h-[92vh]'
            : 'max-w-2xl min-h-[580px]'
        } rounded-[36px] bg-[#0c1015]/95 border border-cyan-500/30 p-5 sm:p-7 shadow-[0_0_100px_rgba(6,182,212,0.25)] text-white relative overflow-hidden flex flex-col items-center justify-between transition-all duration-300`}
      >
        {/* Subtle Arc Reactor Circular Pulse Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-72 h-72 rounded-full border border-cyan-400 animate-ping" />
          <div className="w-96 h-96 rounded-full border border-cyan-500/40 animate-pulse" />
        </div>

        {/* Top Header: JARVIS Live Call HUD & Timer */}
        <div className="w-full flex items-center justify-between z-10 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#22d3ee]" />
              <div className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-ping" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
                <span>JARVIS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-200 font-mono">
                  لائیو وائس کال
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-cyan-400" />
                <span>{formatDuration(callDuration)}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">متصل (Connected)</span>
              </div>
            </div>
          </div>

          {/* Reel Mode Toggle & Close buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReelMode(!isReelMode)}
              className="p-1.5 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition cursor-pointer"
              title={isReelMode ? 'Switch to Wide HUD' : 'Switch to Vertical Reel Mode'}
            >
              {isReelMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="End JARVIS Call"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central 3D Holographic Avatar & Soundwaves */}
        <div className="relative my-1 flex flex-col items-center justify-center z-10 w-full max-w-[300px] shrink-0">
          <div className="relative flex items-center justify-center">
            {/* Holographic Avatar Canvas */}
            <HolographicAvatarCanvas
              state={avatarState}
              audioLevel={audioLevel}
              currentPhoneme={currentPhoneme}
              themeColor="#06b6d4"
              width={isReelMode ? 260 : 300}
              height={isReelMode ? 260 : 300}
            />

            {/* Speaking Audio Glow Aura */}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 filter blur-xl animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Live Dynamic Audio Spectrum Bars */}
          <div className="flex items-center gap-1 mt-1 h-5">
            {[40, 75, 55, 90, 60, 85, 45, 95, 65, 50].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-cyan-400 transition-all duration-75"
                style={{
                  height: isSpeaking || isListening ? `${Math.max(4, (h * audioLevel) / 2.5)}px` : '4px',
                  opacity: isSpeaking || isListening ? 0.9 : 0.25,
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Indicator & Live Transcript */}
        <div className="z-10 text-center space-y-2.5 max-w-md w-full px-1">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131b24] border border-cyan-500/30 text-xs">
            {isSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-cyan-300 font-medium font-sans">جارویس بول رہا ہے...</span>
              </>
            ) : isListening ? (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-medium font-sans">سن رہا ہوں... اپنا حکم فرمائیں</span>
              </>
            ) : isThinking ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span className="text-cyan-300 font-medium font-sans">حکم کی تعمیل ہو رہی ہے...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 font-sans">مائیک دبا کر یا Space ہولڈ کر کے حکم دیں</span>
              </>
            )}
          </div>

          {/* User Spoken Query Display */}
          {lastUserSpeech && (
            <div className="text-xs text-slate-300 bg-[#141d27]/90 rounded-xl px-3 py-1.5 border border-cyan-500/10 text-right">
              <span className="text-slate-500 text-[10px] block mb-0.5 font-medium">آپ کا حکم:</span>
              "{lastUserSpeech}"
            </div>
          )}

          {/* JARVIS Live Spoken Response Transcript */}
          <div className="text-sm text-cyan-100 leading-relaxed bg-[#101720]/95 rounded-2xl p-3 sm:p-4 border border-cyan-500/20 max-h-24 sm:max-h-28 overflow-y-auto text-right shadow-inner">
            {aiReply}
          </div>
        </div>

        {/* Quick Reel Mission Action Chips (Instantly test & execute voice commands) */}
        <div className="w-full z-10 pt-2 flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleQuickAction('سسٹم اسٹیٹس')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200 transition cursor-pointer active:scale-95"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>سسٹم اسٹیٹس</span>
          </button>

          <button
            onClick={() => handleQuickAction('گوگل پر اے آئی نیوز سرچ کرو')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200 transition cursor-pointer active:scale-95"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span>گوگل سرچ</span>
          </button>

          <button
            onClick={() => handleQuickAction('یوٹیوب پر تلاوت چلاؤ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200 transition cursor-pointer active:scale-95"
          >
            <Youtube className="w-3 h-3 text-rose-400" />
            <span>یوٹیوب</span>
          </button>

          <button
            onClick={() => handleQuickAction('تمہیں کس نے بنایا ہے؟')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>تخلیق کار</span>
          </button>

          <button
            onClick={() => handleQuickAction('5 منٹ کا ٹائمر لگاؤ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] text-cyan-200 transition cursor-pointer active:scale-95"
          >
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>ٹائمر</span>
          </button>
        </div>

        {/* Bottom Call Controls (Like a real Call / Reel screen) */}
        <div className="w-full z-10 pt-3 border-t border-cyan-500/20 flex items-center justify-center gap-4 sm:gap-6">
          {/* Replay voice button */}
          {!isSpeaking && aiReply && (
            <button
              onClick={() => speakText(aiReply)}
              className="p-3.5 rounded-full bg-[#15202b] hover:bg-[#1d2c3a] text-cyan-300 border border-cyan-500/30 transition cursor-pointer active:scale-95 shadow-md"
              title="دوبارہ سنیں (Replay Voice)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Stop Speech / Interrupt button */}
          {isSpeaking && (
            <button
              onClick={() => {
                synthRef.current?.cancel();
                setIsSpeaking(false);
                setCurrentPhoneme(undefined);
              }}
              className="p-3.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer active:scale-95 shadow-md"
              title="بولنا روکیں (Stop Speaking)"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          )}

          {/* Central Mic Button / Push-to-Talk */}
          <button
            onClick={toggleMic}
            className={`p-4 sm:p-5 rounded-full border transition-all cursor-pointer flex items-center justify-center shadow-xl active:scale-95 ${
              isMicOn || isListening
                ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse'
                : 'bg-gradient-to-br from-[#1a2533] to-[#101720] text-cyan-300 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            }`}
            title={isMicOn ? 'مائیکروفون بند کریں' : 'مائیکروفون کھولیں (یا Space ہولڈ کریں)'}
          >
            {isMicOn || isListening ? (
              <Mic className="w-7 h-7" />
            ) : (
              <MicOff className="w-7 h-7" />
            )}
          </button>

          {/* End Call Red Button */}
          <button
            onClick={onClose}
            className="p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.4)] transition cursor-pointer active:scale-95"
            title="کال ختم کریں (End Call)"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
