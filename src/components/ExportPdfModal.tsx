import React, { useState } from 'react';
import {
  FileDown,
  X,
  CheckCircle2,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  Sparkles,
  Printer,
  Download,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { exportChatToPdf, PdfExportOptions } from '../utils/exportPdf';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  activeModeName?: string;
  categoryName?: string;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  messages,
  activeModeName = 'Study & Homework Solver',
  categoryName = 'Education & Revision',
}) => {
  const [docTitle, setDocTitle] = useState('Study Notes & Chat History');
  const [studentName, setStudentName] = useState('Student');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeWorksheet, setIncludeWorksheet] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      setIsExporting(true);
      setExportSuccess(false);

      const options: PdfExportOptions = {
        title: docTitle.trim() || 'Study Notes & Chat History',
        subject: activeModeName,
        categoryName,
        studentName: studentName.trim() || 'Student',
        includeTimestamps,
        includeStudyWorksheet: includeWorksheet,
      };

      // Slight timeout to give UI feedback
      setTimeout(() => {
        exportChatToPdf(messages, options);
        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => {
          setExportSuccess(false);
        }, 4000);
      }, 300);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setIsExporting(false);
    }
  };

  const userCount = messages.filter((m) => m.role === 'user').length;
  const assistantCount = messages.filter((m) => m.role === 'assistant').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Export Formatted Study PDF
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Offline Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Save complete chat history with formatted solutions for offline study
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

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="p-2">
              <div className="text-[11px] text-slate-400 font-medium">Total Messages</div>
              <div className="text-lg font-bold text-white mt-0.5">{messages.length}</div>
            </div>
            <div className="p-2 border-x border-slate-800/60">
              <div className="text-[11px] text-slate-400 font-medium">Student Queries</div>
              <div className="text-lg font-bold text-indigo-400 mt-0.5">{userCount}</div>
            </div>
            <div className="p-2">
              <div className="text-[11px] text-slate-400 font-medium">AI Solutions</div>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{assistantCount}</div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Document / Study Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Physics Chapter 4 Revision Notes"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Name (Optional)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Hasan"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject / Mode
                </label>
                <input
                  type="text"
                  disabled
                  value={activeModeName}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="pt-2 space-y-2.5">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeWorksheet}
                  onChange={(e) => setIncludeWorksheet(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    Include Offline Revision Checklist & Notebook Worksheet
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Adds actionable exam review checkboxes and ruled lines for handwritten student revision notes.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Include Exact Timestamps on Exchanges
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Records the time each prompt was asked and answered.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Success Notification */}
          {exportSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>PDF generated and downloaded successfully! Ready for offline study.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || messages.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Formatted PDF...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Downloaded! Export Again</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Formatted PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
