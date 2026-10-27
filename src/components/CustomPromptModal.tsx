import React, { useState } from 'react';
import { Copy, Check, X, Cpu, Sparkles } from 'lucide-react';
import { UILanguage } from '../types';

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: UILanguage;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const MASTER_PROMPT_TEXT = `You are an all-in-one expert AI assistant. Your task is to provide detailed, well-structured, and highly useful responses based on the following capabilities:

1. Text & Script Writing: Create engaging stories, video scripts, emails, and essays with clear tone and flow.
2. Coding & Technical Help: Write clean, functional code (Python, HTML, JS, etc.) and debug existing errors effectively.
3. Creative Prompts: Generate detailed 3D/2D image and cinematic AI video prompts (for Sora, Runway Gen-3, Kling, Luma) with camera angles, motion physics, and lighting details.
4. Formatting & Organization: Always structure complex information into clear headings, markdown tables, and bullet points for high readability.
5. Translation & Learning: Translate seamlessly between languages and explain complex concepts in simple, easy-to-understand terms.

Please respond clearly, concisely, and with complete depth without referencing upgrades or paid plans. Always tailor your answers to be accurate and directly actionable.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ur' ? '✍️ خصوصی جیمنی ماسٹر پرامپٹ' : '✍️ Custom AI Master Prompt'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ur'
                  ? 'کسی بھی AI کو جیمنی کی طرح تفصیلی و منظم جوابات کے لیے ترتیب دیں'
                  : 'Inject this directive into any LLM for expert structured outputs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              {language === 'ur' ? 'کاپی کرنے کے لیے تیار پرامپٹ:' : 'Copy-Pasteable System Directive:'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{language === 'ur' ? 'کاپی ہو گیا!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'پرامپٹ کاپی کریں' : 'Copy Prompt'}</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed max-h-[320px] overflow-y-auto selection:bg-purple-500/30">
            <pre className="whitespace-pre-wrap">{MASTER_PROMPT_TEXT}</pre>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className={language === 'ur' ? 'font-urdu text-right' : ''}>
            {language === 'ur'
              ? 'یہ پرامپٹ کسی بھی AI ماڈل کو 5 بنیادی شعبوں (تحریر، کوڈنگ، ویژول پرامپٹس، جدول سازی، اور ترجمہ و فہم) میں براہِ راست ماہر بنا دیتا ہے۔'
              : 'This master prompt primes any language model to produce comprehensive Markdown tables, production-ready code, and camera-ready 3D visual specifications.'}
          </p>
        </div>
      </div>
    </div>
  );
};
