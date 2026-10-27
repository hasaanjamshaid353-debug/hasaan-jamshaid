import React, { useState } from 'react';
import { BookOpen, X, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { UILanguage } from '../types';

interface FlashcardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  language: UILanguage;
}

const SAMPLE_SUBJECTS = [
  'Physics: Electromagnetism & Optics',
  'Mathematics: Calculus & Linear Algebra',
  'Biology: Cellular Respiration & Genetics',
  'Chemistry: Organic Reactions & Thermochemistry',
  'Computer Science: Data Structures & Algorithms',
  'Neuroscience: Synaptic Plasticity & Memory',
  'History: World War II & Cold War Era',
  'Economics: Macroeconomic Policy & Inflation',
];

export const FlashcardGeneratorModal: React.FC<FlashcardGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  language,
}) => {
  const [topic, setTopic] = useState('Physics: Quantum Mechanics & Wave-Particle Duality');
  const [cardCount, setCardCount] = useState(6);
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('Medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const promptText = `Generate an interactive study deck of ${cardCount} flashcards for academic revision on the topic: "${topic}".
Difficulty level: ${difficulty}.
Include essential theoretical principles, formulas, definitions, and key exam insights.
Format the output inside a \`\`\`flashcards code block with Q: (Question), A: (Answer), Hint: (Key mnemonic or hint), Formula: (if applicable), and Difficulty: (Easy/Medium/Hard).`;

    onGenerate(promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95 duration-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Academic Study Flashcard Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate interactive flip-cards for exam revision directly in chat
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Study Subject or Topic:
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="e.g. Organic Chemistry Reactions, Calculus Derivations, Photosynthesis..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans"
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">
              Suggested Academic Disciplines:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {SAMPLE_SUBJECTS.map((sub, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(sub)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                >
                  {sub.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Number of Cards:
              </label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={4}>4 Cards (Quick Review)</option>
                <option value={6}>6 Cards (Standard Deck)</option>
                <option value={8}>8 Cards (Deep Dive)</option>
                <option value={10}>10 Cards (Exam Prep)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Difficulty Target:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Medium">Medium (Balanced)</option>
                <option value="Easy">Easy (Foundations)</option>
                <option value="Hard">Hard (Graduate Level)</option>
                <option value="All">All Levels Mixed</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              Generate & Review Flashcard Deck in Chat
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
