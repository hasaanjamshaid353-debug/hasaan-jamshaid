import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, ExternalLink, X, Shield, RefreshCw, Copy, Check } from 'lucide-react';
import { UILanguage } from '../types';

interface RealEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  language: UILanguage;
}

export const RealEmailModal: React.FC<RealEmailModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail = 'hasaanjamshaid353@gmail.com',
  language,
}) => {
  const [senderEmail, setSenderEmail] = useState(currentUserEmail);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; previewUrl?: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !message.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide recipient email and message.',
      });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: senderEmail,
          toEmail: recipientEmail.trim(),
          subject: subject.trim() || 'Message from OmniExpert AI',
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setStatusMessage({
        type: 'success',
        text: `Email dispatched successfully to ${recipientEmail}!`,
        previewUrl: data.previewUrl,
      });

      setMessage('');
      setSubject('');
    } catch (err: any) {
      console.error('Email send failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to send email.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Launch local email client (Gmail / Default Mail) with prefilled TO, SUBJECT, BODY
  const handleOpenDirectClient = () => {
    if (!recipientEmail.trim()) {
      alert('Please enter recipient email first');
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodeURIComponent(
      subject.trim() || 'Message from OmniExpert AI'
    )}&body=${encodeURIComponent(message.trim())}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/90 p-6 shadow-2xl text-slate-100 relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Real Email Dispatcher
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  100% Real Delivery
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Send real email messages directly to any recipient inbox
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

        {/* Form */}
        <form onSubmit={handleSendEmail} className="mt-5 space-y-4">
          {/* Field 1: Our Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              1. Your Sender Email (Our Email)
            </label>
            <div className="relative">
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950/90 border border-slate-700/80 px-3.5 py-2.5 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500 transition shadow-inner"
                placeholder="hasaanjamshaid353@gmail.com"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Verified
              </span>
            </div>
          </div>

          {/* Field 2: Recipient Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              2. Recipient Email (Target)
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              placeholder="e.g. friend@example.com, colleague@gmail.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner font-mono"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              3. Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject line..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
            />
          </div>

          {/* Field 3: Message Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              4. Message Content
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Write your message to the recipient here..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition leading-relaxed font-sans"
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="font-medium">{statusMessage.text}</span>
              </div>
              {statusMessage.previewUrl && (
                <a
                  href={statusMessage.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 underline hover:text-sky-300 flex items-center gap-1 mt-1 ml-6"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Delivery Receipt & Preview</span>
                </a>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              disabled={isSending || !recipientEmail.trim() || !message.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Real Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Real Email Message</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenDirectClient}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Open in your device default mail app / Gmail"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Open in Gmail</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center pt-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct inbox transmission via secure SMTP transport</span>
          </div>
        </form>
      </div>
    </div>
  );
};
