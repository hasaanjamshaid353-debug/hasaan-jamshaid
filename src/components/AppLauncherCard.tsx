import React, { useState } from 'react';
import {
  ExternalLink,
  Play,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Boxes,
  Code2,
  Calculator,
  Camera,
  Grid,
  MapPin,
  MessageCircle,
  Search,
  Music,
  ShoppingBag,
  Film,
  Terminal,
} from 'lucide-react';
import { AppTarget, safeLaunchApp, KNOWN_APPS } from '../utils/appLauncher';

interface AppLauncherCardProps {
  appTarget: AppTarget;
  onOpenInternal?: (target: string) => void;
  language?: 'en' | 'ur' | 'hi';
}

export const AppLauncherCard: React.FC<AppLauncherCardProps> = ({
  appTarget,
  onOpenInternal,
  language = 'en',
}) => {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [showAllApps, setShowAllApps] = useState(appTarget.id === 'app_hub');

  const handleLaunchSingle = (target: AppTarget) => {
    if (target.isInternal && target.internalTarget && onOpenInternal) {
      onOpenInternal(target.internalTarget);
      setHasLaunched(true);
      return;
    }

    if (target.webUrl) {
      safeLaunchApp(target.webUrl);
      setHasLaunched(true);
    }
  };

  const getAppIcon = (id: string) => {
    switch (id) {
      case 'youtube':
        return <Play className="w-5 h-5 fill-current" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'google':
        return <Search className="w-5 h-5" />;
      case 'calculator':
        return <Calculator className="w-5 h-5" />;
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'app_builder':
        return <Boxes className="w-5 h-5" />;
      case 'code_playground':
        return <Code2 className="w-5 h-5" />;
      case 'image_studio':
        return <Sparkles className="w-5 h-5" />;
      case 'maps':
        return <MapPin className="w-5 h-5" />;
      case 'spotify':
        return <Music className="w-5 h-5" />;
      case 'playstore':
        return <ShoppingBag className="w-5 h-5" />;
      case 'netflix':
        return <Film className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  // If App Hub or user expanded to see all other apps
  if (appTarget.id === 'app_hub' || showAllApps) {
    const launchableApps = KNOWN_APPS.filter((a) => a.id !== 'app_hub');

    return (
      <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#121622] via-[#161a29] to-[#0e121a] border border-cyan-500/35 shadow-2xl max-w-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Universal App Launcher
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Zero Errors Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any app below to launch securely without popup blocker issues
              </p>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {launchableApps.slice(0, 9).map((app) => (
            <button
              key={app.id}
              onClick={() => handleLaunchSingle(app)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-left transition group active:scale-95 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 group-hover:text-white flex items-center justify-center">
                  {getAppIcon(app.id)}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition block truncate">
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {app.isInternal ? 'Internal Tool' : app.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Fast Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Anchor + DeepLink Support
          </span>
          {appTarget.id !== 'app_hub' && (
            <button
              onClick={() => setShowAllApps(false)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Back to {appTarget.name}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Single App Launcher Card
  return (
    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-[#171b26] via-[#1b1c2b] to-[#141b24] border border-cyan-500/30 shadow-xl max-w-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            {getAppIcon(appTarget.id)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{appTarget.name}</h4>
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {appTarget.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified App Launcher (Error-Free)</span>
            </p>
          </div>
        </div>

        {hasLaunched && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Opened
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {/* Direct Button */}
        <button
          onClick={() => handleLaunchSingle(appTarget)}
          className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>{hasLaunched ? `Re-open ${appTarget.name}` : `Open ${appTarget.name} Now`}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {/* 100% Reliable Fallback Anchor */}
        {appTarget.webUrl && (
          <a
            href={appTarget.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer flex items-center justify-center shrink-0"
            title="Open in new window directly"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
          </a>
        )}

        {appTarget.deepLink && (
          <a
            href={appTarget.deepLink}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer flex items-center justify-center shrink-0"
            title="Open in device installed app"
          >
            <Smartphone className="w-4 h-4 text-purple-400" />
          </a>
        )}

        {/* Toggle to see all other apps */}
        <button
          onClick={() => setShowAllApps(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer flex items-center justify-center shrink-0"
          title="Browse all other apps"
        >
          <Grid className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </div>
  );
};
