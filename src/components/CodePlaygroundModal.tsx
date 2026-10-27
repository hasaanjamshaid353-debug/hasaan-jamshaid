import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, X, Copy, Check, Code, Maximize2 } from 'lucide-react';
import { UILanguage } from '../types';

interface CodePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language: string;
  uiLanguage: UILanguage;
}

export const CodePlaygroundModal: React.FC<CodePlaygroundModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  language,
  uiLanguage,
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-6xl h-[88vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {uiLanguage === 'ur' ? 'لائیو کوڈ رنر و پریویو سینڈ باکس' : 'Interactive Code Sandbox'}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {language.toUpperCase()}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              title="Reload sandbox"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor and Live Preview Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
          {/* Source Code Column */}
          <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Source Code</span>
              <span className="text-[11px] text-slate-500 font-normal">Editable</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 bg-transparent font-code text-xs sm:text-sm text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-cyan-500/30"
              spellCheck={false}
            />
          </div>

          {/* Sandboxed Iframe Preview Column */}
          <div className="flex flex-col h-full bg-white overflow-hidden relative">
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Live Render Output
              </span>
              <span className="text-[11px] text-slate-500 font-normal">Sandbox Frame</span>
            </div>
            <iframe
              key={key}
              srcDoc={code}
              title="Sandbox Preview"
              sandbox="allow-scripts"
              className="w-full flex-1 border-none bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
