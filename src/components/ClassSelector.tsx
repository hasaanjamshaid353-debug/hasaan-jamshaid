import React from 'react';
import {
  GraduationCap,
  BookOpen,
  MessageCircle,
  Sparkles,
  Zap,
  CheckCircle,
  X,
  Lock,
} from 'lucide-react';
import { UILanguage } from '../types';

export interface ClassTierInfo {
  classNum: number;
  titleEn: string;
  titleUr: string;
  tier: 1 | 2 | 3 | 4;
  descEn: string;
  descUr: string;
  badgeColor: string;
}

export const CLASS_TIERS: ClassTierInfo[] = Array.from({ length: 16 }, (_, i) => {
  const c = i + 1;
  if (c === 1) {
    return {
      classNum: 1,
      titleEn: 'Class 1 (Grade 1)',
      titleUr: 'پہلی جماعت (کلاس 1)',
      tier: 1,
      descEn: 'Reading Mode: simple phonics, alphabet, easy words, read-aloud voice',
      descUr: 'صرف پڑھنے کے لیے: آسان الفاظ، حروف اور بلند آواز میں سننا',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  }
  if (c === 2) {
    return {
      classNum: 2,
      titleEn: 'Class 2 (Grade 2)',
      titleUr: 'دوسری جماعت (کلاس 2)',
      tier: 2,
      descEn: 'Talking & Conversation Mode: interactive dialogues, friendly voice Q&A',
      descUr: 'بات چیت اور مکالمہ: سوال جواب اور دوستانہ گفتگو',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
  }
  if (c === 3) {
    return {
      classNum: 3,
      titleEn: 'Class 3 (Grade 3)',
      titleUr: 'تیسری جماعت (کلاس 3)',
      tier: 3,
      descEn: 'Best Kid Features: interactive flashcards, science curiosities, fun quizzes',
      descUr: 'بہترین تدریسی فیچرز: اسٹڈی فلیش کارڈز، سائنسی معلومات اور کوئز',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
  }
  return {
    classNum: c,
    titleEn: c <= 10 ? `Class ${c} (Grade ${c})` : c <= 12 ? `Class ${c} (Inter/FSc/FA)` : `Class ${c} (BS/Masters Year ${c - 12})`,
    titleUr: c <= 10 ? `جماعت ${c} (کلاس ${c})` : c <= 12 ? `کلاس ${c} (انٹرمیڈیٹ/کالج)` : `کلاس ${c} (بی ایس / ماسٹرز)`,
    tier: 4,
    descEn: 'All Features Unlocked: coding, 3D visual studio, academic RAG advisor, tables',
    descUr: 'تمام جدید فیچرز: کوڈنگ، ویژول اسٹوڈیو، تحقیقی مشیر، جدول سازی',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };
});

interface ClassSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: number;
  onSelectClass: (classNum: number) => void;
  language: UILanguage;
}

export const ClassSelectorModal: React.FC<ClassSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  onSelectClass,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {language === 'ur' ? 'تعلیمی کلاس منتخب کریں (1 تا 16)' : 'Select Educational Class (Grade 1 to 16)'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ur'
                  ? 'آپ جس کلاس میں ہیں اسے منتخب کریں، AI اسی سطح کے مطابق آپ سے بات کرے گا'
                  : 'Select your grade level to personalize AI responses and available features'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Badges Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-[11px]">
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex flex-col">
            <span className="font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {language === 'ur' ? 'کلاس 1' : 'Class 1'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ur' ? 'صرف پڑھنے کے لیے' : 'Reading Only'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 flex flex-col">
            <span className="font-bold flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {language === 'ur' ? 'کلاس 2' : 'Class 2'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ur' ? 'بات چیت و مکالمہ' : 'Interactive Talk'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 flex flex-col">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'ur' ? 'کلاس 3' : 'Class 3'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ur' ? 'بہترین کڈز فیچرز' : 'Best Kid Features'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 flex flex-col">
            <span className="font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {language === 'ur' ? 'کلاس 4 تا 16' : 'Classes 4 - 16'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ur' ? 'تمام فیچرز انلاک' : 'All Features Active'}
            </span>
          </div>
        </div>

        {/* Classes 1-16 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {CLASS_TIERS.map((tier) => {
            const isSelected = selectedClass === tier.classNum;
            return (
              <button
                key={tier.classNum}
                onClick={() => {
                  onSelectClass(tier.classNum);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer relative ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500 text-white shadow-md shadow-teal-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {language === 'ur' ? `جماعت ${tier.classNum}` : `Class ${tier.classNum}`}
                  </span>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-teal-400" />}
                </div>

                <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {language === 'ur' ? tier.descUr : tier.descEn}
                </div>

                <div className="mt-2 text-[9px] font-mono font-medium">
                  {tier.classNum === 1 && <span className="text-emerald-400">📖 Reading</span>}
                  {tier.classNum === 2 && <span className="text-blue-400">🗣️ Talking</span>}
                  {tier.classNum === 3 && <span className="text-amber-400">🌟 Best Features</span>}
                  {tier.classNum >= 4 && <span className="text-purple-400">⚡ All Unlocked</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {language === 'ur'
              ? `موجودہ منتخب کلاس: جماعت ${selectedClass}`
              : `Current Active: Class ${selectedClass}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition cursor-pointer"
          >
            {language === 'ur' ? 'محفوظ کریں' : 'Save Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};
