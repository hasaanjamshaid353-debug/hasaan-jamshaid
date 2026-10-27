import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shuffle,
  Volume2,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  hint?: string;
  formula?: string;
}

interface StudyFlashcardDeckProps {
  title?: string;
  subject?: string;
  cards: Flashcard[];
  isUrdu?: boolean;
}

export const StudyFlashcardDeck: React.FC<StudyFlashcardDeckProps> = ({
  title = 'Academic Study Flashcards',
  subject = 'Study Deck',
  cards: initialCards,
  isUrdu = false,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      setCards(initialCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [initialCards]);

  if (!cards || cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex] || cards[0];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const masteryPercent = Math.round((masteredIds.size / cards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMastered = new Set(masteredIds);
    const newReview = new Set(reviewIds);
    newMastered.add(currentCard.id);
    newReview.delete(currentCard.id);
    setMasteredIds(newMastered);
    setReviewIds(newReview);
    handleNext();
  };

  const markNeedsReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMastered = new Set(masteredIds);
    const newReview = new Set(reviewIds);
    newReview.add(currentCard.id);
    newMastered.delete(currentCard.id);
    setMasteredIds(newMastered);
    setReviewIds(newReview);
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = isUrdu ? 'ur-PK' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const isCurrentMastered = masteredIds.has(currentCard.id);
  const isCurrentReview = reviewIds.has(currentCard.id);

  return (
    <div className="my-5 rounded-2xl border border-indigo-500/30 bg-slate-900/95 overflow-hidden shadow-2xl font-sans">
      {/* Deck Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">{title}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {subject}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Click card to flip between question and answer
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
            title="Shuffle Deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Progress & Mastery Bar */}
      <div className="px-5 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>
          Card <strong className="text-white">{currentIndex + 1}</strong> of{' '}
          <strong className="text-white">{cards.length}</strong>
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-semibold">{masteryPercent}% Mastered</span>
          </div>
          <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Flip Card Body */}
      <div className="p-5 flex justify-center">
        <div
          onClick={handleFlip}
          className={`w-full max-w-xl min-h-[220px] sm:min-h-[250px] p-6 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border relative select-none shadow-xl ${
            isFlipped
              ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-cyan-500/40 text-slate-100 ring-1 ring-cyan-500/20'
              : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-700/80 hover:border-indigo-500/50 text-slate-100'
          }`}
        >
          {/* Top metadata of card */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
              {isFlipped ? (
                <span className="text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Answer & Concept Explanation
                </span>
              ) : (
                <span className="text-indigo-400 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  Study Prompt / Question
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              {currentCard.difficulty && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    currentCard.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : currentCard.difficulty === 'Medium'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {currentCard.difficulty}
                </span>
              )}
              <button
                onClick={(e) => handleSpeak(e, isFlipped ? currentCard.answer : currentCard.question)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Read card aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card Main Content */}
          <div className="my-auto py-2">
            {!isFlipped ? (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentCard.question}
                </h3>
                {currentCard.hint && (
                  <p className="text-xs text-indigo-300/80 mt-3 italic flex items-center gap-1.5">
                    <span>💡 Hint:</span> {currentCard.hint}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  {currentCard.answer}
                </p>
                {currentCard.formula && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 font-mono text-xs text-cyan-300">
                    <code>{currentCard.formula}</code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip Guidance & Status */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-400 hover:text-slate-300">
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>{isFlipped ? 'Click to view question' : 'Click card to reveal answer'}</span>
            </span>

            <div className="flex items-center gap-2">
              {isCurrentMastered && (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mastered
                </span>
              )}
              {isCurrentReview && (
                <span className="text-amber-400 flex items-center gap-1 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  Review Needed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Navigation & Mastery Rating Bar */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Self-Testing Feedback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={markNeedsReview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition cursor-pointer"
            title="Mark as needing review"
          >
            <XCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Still Learning</span>
          </button>
          <button
            onClick={markMastered}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
            title="Mark as understood"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Got It!</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
