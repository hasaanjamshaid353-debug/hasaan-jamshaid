import React from 'react';
import { Volume2, VolumeX, Pause, Play, Square, Sparkles, HelpCircle } from 'lucide-react';
import { isUrduText } from '../utils/offlineEngine';

interface AudioVoiceReaderProps {
  messageId: string;
  content: string;
  uiLanguage: 'ur' | 'en';
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onChangeRate: (newRate: number) => void;
  onExplainSimpler?: (prompt: string) => void;
}

export const AudioVoiceReader: React.FC<AudioVoiceReaderProps> = ({
  messageId,
  content,
  uiLanguage,
  isPlaying,
  isPaused,
  rate,
  onPlay,
  onPause,
  onResume,
  onStop,
  onChangeRate,
  onExplainSimpler,
}) => {
  const isContentUrdu = isUrduText(content);

  const handleSimplerClick = () => {
    if (!onExplainSimpler) return;
    const prompt =
      uiLanguage === 'ur' || isContentUrdu
        ? 'برائے مہربانی پچھلے جواب کو مزید آسان ترین عام فہم الفاظ اور روزمرہ زندگی کی سادہ مثال سے سمجھائیں تاکہ کوئی بھی آسانی سے سمجھ سکے۔'
        : 'Please explain the previous response in much simpler, everyday terms with a clear real-life analogy so anyone can easily understand it.';
    onExplainSimpler(prompt);
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
      {/* Left: Audio Voice Playback Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isPlaying && !isPaused ? (
          <button
            onClick={onPlay}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition active:scale-95 cursor-pointer shadow-sm shadow-cyan-500/10 group"
            title="Read aloud using Web Speech API"
          >
            <Volume2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>{uiLanguage === 'ur' ? '🔊 آواز سنیں (Play Audio)' : '🔊 Play Audio'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-cyan-950/40 p-1 rounded-xl border border-cyan-500/30">
            {/* Animated Soundwave indicator */}
            <div className="flex items-center gap-0.5 px-2 py-1 text-cyan-400">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-4.5 bg-cyan-300 rounded-full animate-bounce"></span>
              <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce"></span>
              <span className="text-[11px] font-medium text-cyan-300 ml-1">
                {isPlaying ? (uiLanguage === 'ur' ? 'آواز جاری ہے...' : 'Speaking...') : (uiLanguage === 'ur' ? 'روکا گیا' : 'Paused')}
              </span>
            </div>

            {/* Pause / Resume Button */}
            {isPlaying ? (
              <button
                onClick={onPause}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition"
                title="Pause audio"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onResume}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition"
                title="Resume audio"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            {/* Stop Button */}
            <button
              onClick={onStop}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs transition"
              title="Stop audio playback"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{uiLanguage === 'ur' ? 'بند کریں' : 'Stop'}</span>
            </button>
          </div>
        )}

        {/* Speed / Rate control when audio is active or hovering */}
        {(isPlaying || isPaused) && (
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 text-[11px] text-slate-300">
            <span>Speed:</span>
            <button
              onClick={() => onChangeRate(0.85)}
              className={`px-1.5 py-0.5 rounded ${
                rate === 0.85 ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
              title="Slow speed (0.85x)"
            >
              0.85x
            </button>
            <button
              onClick={() => onChangeRate(1.0)}
              className={`px-1.5 py-0.5 rounded ${
                rate === 1.0 ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
              title="Normal speed (1x)"
            >
              1.0x
            </button>
            <button
              onClick={() => onChangeRate(1.25)}
              className={`px-1.5 py-0.5 rounded ${
                rate === 1.25 ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'
              }`}
              title="Fast speed (1.25x)"
            >
              1.25x
            </button>
          </div>
        )}
      </div>

      {/* Right: "Explain Simpler" button for when user says "agar samajh na aati ho" */}
      {onExplainSimpler && (
        <button
          onClick={handleSimplerClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition active:scale-95 cursor-pointer ml-auto"
          title="Ask AI to re-explain in simpler terms"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {uiLanguage === 'ur' ? '💡 آسان الفاظ میں سمجھائیں' : '💡 Explain Simpler'}
          </span>
        </button>
      )}
    </div>
  );
};
