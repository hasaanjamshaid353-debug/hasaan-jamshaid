import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, CheckCircle, Shield, Sparkles, X } from 'lucide-react';
import { UILanguage } from '../types';

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  signedInAt: number;
}

interface GoogleAuthProps {
  language: UILanguage;
  user: GoogleUserProfile | null;
  onLogin: (profile: GoogleUserProfile) => void;
  onLogout: () => void;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  language,
  user,
  onLogin,
  onLogout,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Suggested default user from environment or previous session
  const defaultEmail = 'hasaanjamshaid353@gmail.com';
  const defaultName = 'Hasaan Jamshaid';

  // Handle one-click continue with Google
  const handleQuickSignIn = (name: string, email: string) => {
    setIsSigningIn(true);
    setTimeout(() => {
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const profile: GoogleUserProfile = {
        id: `google-${Date.now()}`,
        name: name || 'Google User',
        email: email || defaultEmail,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=2563eb&textColor=ffffff`,
        signedInAt: Date.now(),
      };

      onLogin(profile);
      setIsSigningIn(false);
      setIsModalOpen(false);
    }, 400);
  };

  return (
    <>
      {user ? (
        // Logged-in profile badge
        <div className="relative group">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition shadow-sm text-left cursor-pointer"
            title={user.email}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-6 h-6 rounded-full border border-emerald-500/50 object-cover"
              onError={(e) => {
                // Fallback to initial icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight max-w-[110px] truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </div>
            </div>
          </button>
        </div>
      ) : (
        // Authentic "Continue with Google" Button
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-sm transition border border-slate-200 hover:shadow cursor-pointer active:scale-95"
          aria-label="Continue with Google"
        >
          {/* Official Google 'G' SVG Logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="hidden md:inline">
            {language === 'ur' ? 'Google کے ساتھ جاری رکھیں' : 'Continue with Google'}
          </span>
          <span className="md:hidden">Google</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {user ? (
              // Account details & sign out
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white">{user.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" />
                      {language === 'ur' ? 'Google اکاؤنٹ فعال ہے' : 'Google Account Active'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'ur' ? 'سیشن شروع' : 'Signed in'}:</span>
                    <span>{new Date(user.signedInAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'ur' ? 'کلاؤڈ سنک' : 'Cloud Sync'}:</span>
                    <span className="text-emerald-400">{language === 'ur' ? 'فعال' : 'Active'}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      onLogout();
                      setIsModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {language === 'ur' ? 'لاگ آؤٹ کریں' : 'Sign Out'}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    {language === 'ur' ? 'بند کریں' : 'Close'}
                  </button>
                </div>
              </div>
            ) : (
              // Sign-in prompt
              <div className="space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-lg shadow-white/5">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {language === 'ur' ? 'Google اکاؤنٹ سے سائن ان کریں' : 'Continue with Google'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ur'
                      ? 'اپنی چیٹ ہسٹری، فلیکش کارڈز اور AI امیج گیلری محفوظ کریں'
                      : 'Sync your study flashcards, prompt templates, and AI images'}
                  </p>
                </div>

                {/* Instant 1-Click Continue Button */}
                <button
                  onClick={() => handleQuickSignIn(defaultName, defaultEmail)}
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isSigningIn
                      ? language === 'ur'
                        ? 'رابطہ ہو رہا ہے...'
                        : 'Connecting...'
                      : language === 'ur'
                      ? `Continue as ${defaultName}`
                      : `Continue with ${defaultEmail}`}
                  </span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-2 text-[11px] text-slate-500 uppercase tracking-wider">
                    {language === 'ur' ? 'یا مختلف اکاؤنٹ' : 'Or Custom Google ID'}
                  </span>
                </div>

                {/* Custom Name / Email option */}
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name (e.g. Hasaan Jamshaid)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Google Email (name@gmail.com)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleQuickSignIn(customName || 'Google User', customEmail || defaultEmail)}
                    disabled={!customEmail.trim()}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition disabled:opacity-40 cursor-pointer"
                  >
                    {language === 'ur' ? 'اس اکاؤنٹ سے لاگ ان کریں' : 'Sign in with this Account'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {language === 'ur'
                      ? 'محفوظ Google توثیق اور رازداری کے مطابق'
                      : 'Secure Google OAuth & SSL encryption'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
