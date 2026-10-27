import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { UILanguage } from '../types';

interface OfflineIndicatorProps {
  isOnline: boolean;
  forceOffline: boolean;
  onToggleForceOffline: () => void;
  language: UILanguage;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  forceOffline,
  onToggleForceOffline,
  language,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Network Status Pill */}
      <button
        onClick={onToggleForceOffline}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
        }`}
        title={
          language === 'ur'
            ? 'کلک کر کے آف لائن موڈ آزمائیں یا آن لائن موڈ میں تبدیل کریں'
            : 'Click to toggle Offline Mode testing (No WiFi/Internet)'
        }
      >
        {isOnline ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'ur' ? 'آن لائن (جیمنی کلاؤڈ)' : 'Online (Gemini 3.8)'}
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <WifiOff className="w-3.5 h-3.5" />
            <span>
              {language === 'ur' ? '100% آف لائن موڈ فعال' : 'Offline Engine Active'}
            </span>
          </>
        )}
      </button>

      {/* Discrete offline warning banner if offline */}
      {!isOnline && (
        <div className="fixed top-18 right-4 z-40 max-w-sm rounded-xl bg-amber-950/90 border border-amber-600/40 p-3 shadow-xl backdrop-blur text-amber-100 text-xs animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className={language === 'ur' ? 'font-urdu text-right' : ''}>
              <div className="font-bold text-amber-300">
                {language === 'ur'
                  ? 'بغیر وائی فائی اور انٹرنیٹ کے مکمل فعال'
                  : 'Zero-WiFi Mode Active'}
              </div>
              <div className="text-amber-200/80 text-[11px] mt-0.5 leading-snug">
                {language === 'ur'
                  ? 'تمام کہانیاں، کوڈنگ، پرامپٹس اور جدولیں آپ کے ڈیوائس پر مقامی طور پر تیار ہو رہی ہیں۔'
                  : 'All scripts, code, 3D prompts, and tables run locally on your device without internet.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
