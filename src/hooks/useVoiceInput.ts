import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Deduplicates repeated consecutive words and repeated phrases from speech recognition.
 * Works across English, Urdu, Hindi, Arabic, and all Unicode languages.
 * "Koi bhi shabd do dafa na likha jaye. Hum jo bole wahi bas likha jaye."
 */
export function deduplicateSpokenText(text: string): string {
  if (!text) return '';

  const rawTokens = text.trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length <= 1) return text.trim();

  // Helper to normalize a word for comparison (strip punctuation and lowercase)
  const norm = (w: string) =>
    w.toLowerCase().replace(/[.,!?;:،؟۔"'\(\)\[\]\{\}\-_]/g, '').trim();

  // 1. Remove immediate consecutive duplicate words: e.g. "shabd shabd" -> "shabd"
  const singleDeduped: string[] = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const current = rawTokens[i];
    const prev = singleDeduped[singleDeduped.length - 1];

    if (!prev) {
      singleDeduped.push(current);
      continue;
    }

    const normCurrent = norm(current);
    const normPrev = norm(prev);

    // If words are identical (and not empty after stripping punctuation), skip duplicate
    if (normCurrent.length > 0 && normCurrent === normPrev) {
      continue;
    }

    singleDeduped.push(current);
  }

  // 2. Remove immediate consecutive duplicate phrases (2, 3, 4 words)
  // e.g. "kya haal hai kya haal hai" -> "kya haal hai"
  let tokens = [...singleDeduped];
  for (let phraseLen = 4; phraseLen >= 2; phraseLen--) {
    let changed = true;
    while (changed && tokens.length >= phraseLen * 2) {
      changed = false;
      for (let i = 0; i <= tokens.length - phraseLen * 2; i++) {
        const p1 = tokens.slice(i, i + phraseLen).map(norm).join(' ');
        const p2 = tokens.slice(i + phraseLen, i + phraseLen * 2).map(norm).join(' ');

        if (p1.length > 0 && p1 === p2) {
          tokens.splice(i + phraseLen, phraseLen);
          changed = true;
          break;
        }
      }
    }
  }

  return tokens.join(' ');
}

interface UseVoiceInputOptions {
  onResult?: (cleanSpokenText: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useVoiceInput(
  optionsOrOnResult?: ((text: string) => void) | UseVoiceInputOptions
) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const onResultCallback =
    typeof optionsOrOnResult === 'function'
      ? optionsOrOnResult
      : optionsOrOnResult?.onResult;
  const onStartCallback =
    typeof optionsOrOnResult === 'object' ? optionsOrOnResult?.onStart : undefined;
  const onEndCallback =
    typeof optionsOrOnResult === 'object' ? optionsOrOnResult?.onEnd : undefined;

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition
    );

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort?.();
      }
    };
  }, []);

  const startListening = useCallback(
    (lang: string = 'en-US') => {
      if (!isSupported) {
        setError('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      setError(null);
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort?.();
        }

        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          onStartCallback?.();
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            const transcript = res[0]?.transcript || '';
            if (res.isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript + ' ';
            }
          }

          // Combine and strictly deduplicate any duplicate words or repeated chunks
          const rawFull = `${finalTranscript} ${interimTranscript}`.trim();
          const cleanText = deduplicateSpokenText(rawFull);

          if (cleanText && onResultCallback) {
            onResultCallback(cleanText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please enable mic access.');
          } else if (event.error !== 'no-speech') {
            setError(`Mic: ${event.error}`);
          }
          setIsListening(false);
          onEndCallback?.();
        };

        recognition.onend = () => {
          setIsListening(false);
          onEndCallback?.();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setError(err.message || 'Microphone activation failed');
        setIsListening(false);
        onEndCallback?.();
      }
    },
    [isSupported, onResultCallback, onStartCallback, onEndCallback]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop?.();
      setIsListening(false);
      onEndCallback?.();
    }
  }, [onEndCallback]);

  const toggleListening = useCallback(
    (lang?: string) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(lang);
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
