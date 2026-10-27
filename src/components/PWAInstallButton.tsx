import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { UILanguage } from '../types';

interface PWAInstallButtonProps {
  language: UILanguage;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, do not render install button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        <span>{language === 'ur' ? 'انسٹال شدہ ایپ' : 'Installed App'}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-cyan-500/10 transition-all cursor-pointer"
        title={language === 'ur' ? 'موبائل پر انسٹال کریں (آف لائن استعمال)' : 'Install PWA for 100% Offline Access'}
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>{language === 'ur' ? 'موبائل ایپ انسٹال کریں' : 'Install App (Offline)'}</span>
      </button>

      {/* Guided installation modal for iOS or manual install */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ur' ? 'موبائل پر آف لائن انسٹال کریں' : 'Install on Mobile (Offline Ready)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ur' ? 'بغیر وائی فائی اور بغیر انٹرنیٹ کے چلائیں' : 'Works with Zero Internet & No WiFi Needed'}
                </p>
              </div>
            </div>

            <div className={`space-y-3 text-xs sm:text-sm text-slate-300 ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  {language === 'ur'
                    ? 'اپنے موبائل براؤزر (Chrome یا Safari) کے شیئر یا 3-ڈوٹس مینو کو کھولیں۔'
                    : 'Tap the browser menu button (Share icon in Safari, or 3-dots in Chrome).'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  {language === 'ur'
                    ? 'آپشن منتخب کریں: "Add to Home Screen" یا "ہوم اسکرین میں شامل کریں"۔'
                    : 'Select "Add to Home Screen" (یا انسٹال ایپ).'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  {language === 'ur'
                    ? 'اب ایپ آپ کے موبائل کی اسکرین پر آ جائے گی اور بغیر کسی وائی فائی یا ڈیٹا کے خودکار چلے گی!'
                    : 'The app icon will appear on your home screen and run completely offline without WiFi!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm transition cursor-pointer"
            >
              {language === 'ur' ? 'ٹھیک ہے، سمجھ آ گیا' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
