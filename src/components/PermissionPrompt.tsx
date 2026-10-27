import React, { useState, useEffect } from 'react';
import { Mic, MicOff, ShieldCheck, AlertCircle, X, Check } from 'lucide-react';
import { UILanguage } from '../types';

interface PermissionPromptProps {
  language: UILanguage;
  onPermissionChange?: (granted: boolean) => void;
}

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({
  language,
  onPermissionChange,
}) => {
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicStatus(result.state as 'prompt' | 'granted' | 'denied');
        if (result.state === 'prompt') {
          // Show prompt banner if user hasn't made a choice yet
          setIsBannerVisible(true);
        }
        result.onchange = () => {
          setMicStatus(result.state as 'prompt' | 'granted' | 'denied');
          if (onPermissionChange) {
            onPermissionChange(result.state === 'granted');
          }
        };
      }
    } catch {
      // Fallback
    }
  };

  const handleRequestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately after granting
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus('granted');
      setIsBannerVisible(false);
      if (onPermissionChange) onPermissionChange(true);
    } catch (err) {
      console.warn('Microphone permission denied:', err);
      setMicStatus('denied');
    }
  };

  return (
    <>
      {/* Small Status Indicator in Header/Toolbar */}
      <button
        onClick={() => {
          if (micStatus !== 'granted') {
            handleRequestMic();
          }
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
          micStatus === 'granted'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : micStatus === 'denied'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
        }`}
        title={
          micStatus === 'granted'
            ? 'Microphone Permission: Granted'
            : micStatus === 'denied'
            ? 'Microphone Permission: Blocked'
            : 'Click to grant Microphone Permission'
        }
      >
        {micStatus === 'granted' ? (
          <>
            <Mic className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">
              {language === 'ur' ? 'مائیک فعال' : 'Mic Active'}
            </span>
          </>
        ) : micStatus === 'denied' ? (
          <>
            <MicOff className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">
              Mic Blocked
            </span>
          </>
        ) : (
          <>
            <Mic className="w-3 h-3 text-amber-400" />
            <span>
              Allow Mic
            </span>
          </>
        )}
      </button>

      {/* Permission Request Banner (First visit) */}
      {isBannerVisible && micStatus === 'prompt' && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl text-slate-100 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">
                Microphone Permission Required
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Allow microphone access for voice input, real-time speech, and interactive conversations.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleRequestMic}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition cursor-pointer"
                >
                  Grant Permission
                </button>
                <button
                  onClick={() => setIsBannerVisible(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] transition cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
