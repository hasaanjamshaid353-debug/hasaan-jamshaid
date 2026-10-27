import React, { useState } from 'react';
import { X, Calculator as CalcIcon, Delete, Equal } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (display === '0' && digit !== '.') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOp = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleCalculate = () => {
    try {
      const full = `${equation}${display}`.replace(/×/g, '*').replace(/÷/g, '/');
      // Safe math evaluation
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${full})`)();
      setDisplay(String(res));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-[#161922] border border-cyan-500/30 rounded-3xl shadow-2xl p-5 space-y-4 text-white">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <CalcIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">Fast Calculator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-3.5 rounded-2xl bg-[#0b0d14] border border-white/5 text-right font-mono">
          <div className="text-[11px] text-slate-500 h-4">{equation}</div>
          <div className="text-2xl font-bold tracking-tight text-cyan-200 truncate">{display}</div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 text-sm font-bold">
          <button
            onClick={handleClear}
            className="py-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 active:scale-95 transition"
          >
            C
          </button>
          <button
            onClick={() => handleOp('÷')}
            className="py-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 active:scale-95 transition"
          >
            ÷
          </button>
          <button
            onClick={() => handleOp('×')}
            className="py-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 active:scale-95 transition"
          >
            ×
          </button>
          <button
            onClick={() => handleOp('-')}
            className="py-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 active:scale-95 transition"
          >
            -
          </button>

          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className="py-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 active:scale-95 transition"
          >
            +
          </button>

          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleCalculate}
            className="row-span-2 py-3 rounded-xl bg-gradient-to-b from-cyan-500 to-indigo-600 text-white flex items-center justify-center active:scale-95 transition shadow-lg shadow-cyan-500/20"
          >
            <Equal className="w-5 h-5" />
          </button>

          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};
