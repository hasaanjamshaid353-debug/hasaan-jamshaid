import { useState, useEffect, useRef, useCallback } from 'react';
import { isUrduText } from '../utils/offlineEngine';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
}

/**
 * Clean markdown symbols, code blocks, and formatting so the Web Speech API
 * reads aloud fluent, clear sentences without stuttering over markdown syntax.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' [Code snippet omitted for audio] ')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove image and link markdowns
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headers, bold, italics, strikethrough, blockquotes
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/^>\s+/gm, '')
      // Remove bullet lists and numbered list markers
      .replace(/^[\*\-\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove horizontal rules
      .replace(/^[-\*_]{3,}\s*$/gm, '')
      // Remove raw HTML tags
      .replace(/<[^>]+>/g, '')
      // Collapse multiple whitespace/newlines
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function useTextToSpeech() {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('export_tts_speed');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.5 && val <= 2.0) {
          return val;
        }
      }
    } catch {}
    return 1.0;
  });

  const setRate = useCallback((newRate: number | ((prev: number) => number)) => {
    setRateState((prev) => {
      const next = typeof newRate === 'function' ? newRate(prev) : newRate;
      const clamped = Math.max(0.5, Math.min(2.0, parseFloat(next.toFixed(2))));
      try {
        localStorage.setItem('export_tts_speed', String(clamped));
      } catch {}
      return clamped;
    });
  }, []);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const keepAliveTimerRef = useRef<number | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices when available
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      } catch (err) {
        console.warn('Could not load speech voices:', err);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (keepAliveTimerRef.current) {
        window.clearInterval(keepAliveTimerRef.current);
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    if (keepAliveTimerRef.current) {
      window.clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    setCurrentId(null);
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } catch (err) {
      console.warn('Speech pause error:', err);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } catch (err) {
      console.warn('Speech resume error:', err);
    }
  }, [isSupported]);

  const speak = useCallback(
    (id: string, rawText: string, options?: TTSOptions) => {
      if (!isSupported) {
        console.warn('Web Speech API is not supported in this browser.');
        return;
      }

      // If user clicks the currently playing message:
      if (currentId === id) {
        if (isPlaying) {
          stop();
          return;
        } else if (isPaused) {
          resume();
          return;
        }
      }

      // Stop previous utterance
      stop();

      const cleaned = cleanTextForSpeech(rawText);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const speechRate = options?.rate ?? rate;
      utterance.rate = speechRate;
      utterance.pitch = options?.pitch ?? 1.0;

      // Determine language
      const isUrdu = isUrduText(cleaned);
      const targetLang = options?.lang || (isUrdu ? 'ur-PK' : 'en-US');
      utterance.lang = targetLang;

      // Pick best matching voice
      if (availableVoices.length > 0) {
        if (isUrdu) {
          // Try ur-PK, ur, hi-IN (similar phonetics for subcontinent Urdu)
          const matchedVoice =
            availableVoices.find((v) => v.lang.toLowerCase().startsWith('ur')) ||
            availableVoices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
            availableVoices.find((v) => v.name.toLowerCase().includes('urdu') || v.name.toLowerCase().includes('hindi'));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        } else {
          // Prefer natural English voice
          const matchedVoice =
            availableVoices.find(
              (v) =>
                v.lang.toLowerCase().startsWith('en') &&
                (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
            ) || availableVoices.find((v) => v.lang.toLowerCase().startsWith('en'));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }
      }

      utterance.onstart = () => {
        setCurrentId(id);
        setIsPlaying(true);
        setIsPaused(false);

        // Chrome keep-alive hack: periodically resume to prevent browser dropping long speech
        if (keepAliveTimerRef.current) {
          window.clearInterval(keepAliveTimerRef.current);
        }
        keepAliveTimerRef.current = window.setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 12000);
      };

      utterance.onend = () => {
        if (keepAliveTimerRef.current) {
          window.clearInterval(keepAliveTimerRef.current);
          keepAliveTimerRef.current = null;
        }
        setCurrentId(null);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('TTS playback error:', event.error);
        }
        if (keepAliveTimerRef.current) {
          window.clearInterval(keepAliveTimerRef.current);
          keepAliveTimerRef.current = null;
        }
        setCurrentId(null);
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, currentId, isPaused, isPlaying, isSupported, rate, resume, stop]
  );

  return {
    isSupported,
    currentId,
    isPlaying,
    isPaused,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
  };
}
