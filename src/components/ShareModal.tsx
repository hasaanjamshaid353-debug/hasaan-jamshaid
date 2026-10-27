import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Link2,
  FileText,
  Download,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { ChatSession, UILanguage } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  language: UILanguage;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  session,
  language,
}) => {
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  // Generate formatted markdown document of the current session
  const generateFormattedDocument = (): string => {
    const sessionDate = new Date(session.updatedAt || session.createdAt).toLocaleString();
    const divider = '─'.repeat(48);

    let doc = `# ${session.title}\n`;
    doc += `*Generated via Fast GPT • ${sessionDate}*\n\n`;
    doc += `${divider}\n\n`;

    if (!session.messages || session.messages.length === 0) {
      doc += `_No messages in this chat session yet._\n`;
      return doc;
    }

    session.messages.forEach((msg, idx) => {
      const author = msg.role === 'user' ? '👤 User' : '⚡ Fast GPT';
      const time = new Date(msg.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      doc += `### ${author}  \`[${time}]\`\n\n`;
      doc += `${msg.content.trim()}\n\n`;

      if (msg.generatedImage) {
        doc += `> **Generated Image Prompt:** ${msg.generatedImage.prompt}\n`;
        doc += `> **Image URL:** ${msg.generatedImage.url}\n\n`;
      }

      if (idx < session.messages.length - 1) {
        doc += `---\n\n`;
      }
    });

    doc += `\n${divider}\n`;
    doc += `*Shared from Fast GPT — High Performance AI Assistant*\n`;

    return doc;
  };

  const formattedDoc = generateFormattedDocument();

  // Generate a unique shareable public link
  // Uses hash query with session id and title for deep linking
  const generateShareableLink = (): string => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#share=${encodeURIComponent(session.id)}&t=${encodeURIComponent(
        session.title.slice(0, 30)
      )}`;
    } catch {
      return `https://fastgpt.ai/share/${session.id}`;
    }
  };

  const shareableUrl = generateShareableLink();

  // Copy document to clipboard
  const handleCopyDoc = async () => {
    try {
      await navigator.clipboard.writeText(formattedDoc);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2200);
    } catch {
      // Fallback
    }
  };

  // Copy shareable link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback
    }
  };

  // Download formatted markdown file
  const handleDownloadDoc = () => {
    const blob = new Blob([formattedDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = session.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `${safeTitle || 'fast-gpt-chat'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const messageCount = session.messages?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#1c1c1c] border border-[#333333] shadow-2xl text-slate-100 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d] bg-[#222222]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Share Chat Session
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {session.title} • {messageCount} message{messageCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Option 1: Unique Public Share Link */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#2b2b2b] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Unique Public Link
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Direct Access
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Anyone with this link can instantly open and review this conversation.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono truncate focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 active:scale-95 shadow-xs ${
                  copiedLink
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white text-black hover:bg-slate-200'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Formatted Document Copy (Markdown / Text) */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#2b2b2b] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Formatted Document
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Markdown / Text
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Copy the full conversation with timestamps, code blocks, and structured headings to paste into Docs, Notes, or Email.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyDoc}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 shadow-md ${
                  copiedDoc
                    ? 'bg-emerald-500 text-black'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20'
                }`}
              >
                {copiedDoc ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Document Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Formatted Document</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadDoc}
                className="p-2.5 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-slate-300 hover:text-white border border-[#333] transition cursor-pointer active:scale-95"
                title="Download as Markdown file (.md)"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toggle Live Preview */}
          <div className="border border-[#2b2b2b] rounded-xl overflow-hidden bg-[#141414]">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-between p-3 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Document Preview</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {showPreview ? 'Hide preview ▲' : 'Show preview ▼'}
              </span>
            </button>

            {showPreview && (
              <div className="p-3 border-t border-[#252525] bg-[#0f0f0f] max-h-52 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                {formattedDoc}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2d2d2d] bg-[#191919] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#282828] hover:bg-[#333] text-slate-300 hover:text-white font-medium transition cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
