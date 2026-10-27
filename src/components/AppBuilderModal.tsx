import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Database,
  Code2,
  Play,
  Copy,
  Check,
  Download,
  Send,
  Wand2,
  RefreshCw,
  Rocket,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Server,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Flame,
  ArrowRight,
  Boxes,
  HelpCircle,
  FolderGit2,
} from 'lucide-react';
import {
  AppBlueprint,
  APP_TEMPLATES,
  generateLocalAppBlueprint,
} from '../utils/appBuilderEngine';
import { UILanguage } from '../types';

interface AppBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: UILanguage;
  isOnline?: boolean;
  onOpenPlayground?: (code: string, lang: string) => void;
  onSendToChat?: (prompt: string) => void;
}

export const AppBuilderModal: React.FC<AppBuilderModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
  isOnline = true,
  onOpenPlayground,
  onSendToChat,
}) => {
  const [concept, setConcept] = useState(
    'A modern high-conversion online marketplace with real-time inventory, user reviews, instant cart checkout via Stripe, and an admin analytics dashboard'
  );
  const [appName, setAppName] = useState('ShopPulse Pro');
  const [platform, setPlatform] = useState<'web' | 'mobile' | 'fullstack'>('fullstack');
  const [category, setCategory] = useState('E-Commerce / Shopping');

  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'code' | 'roadmap'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pre-generate initial blueprint so there is zero empty state
  const [blueprint, setBlueprint] = useState<AppBlueprint>(() =>
    generateLocalAppBlueprint(
      'A modern high-conversion online marketplace with real-time inventory',
      'E-Commerce / Shopping',
      'fullstack',
      'ShopPulse Pro'
    )
  );

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleApplyTemplate = (tmpl: (typeof APP_TEMPLATES)[0]) => {
    setCategory(tmpl.category);
    setPlatform(tmpl.defaultPlatform);
    setConcept(tmpl.description);
    setAppName(tmpl.name.replace(/[^a-zA-Z0-9]/g, ''));
  };

  const handleGenerateBlueprint = async () => {
    if (!concept.trim()) return;
    setIsGenerating(true);

    try {
      if (isOnline) {
        const res = await fetch('/api/generate-app-blueprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept: concept.trim(),
            category,
            platform,
            appName: appName.trim(),
            language,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.appName && data.screens && data.starterCode) {
            setBlueprint(data);
            setIsGenerating(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Online blueprint generation failed, using local engine fallback:', e);
    }

    // High quality local fallback generator
    const localData = generateLocalAppBlueprint(
      concept.trim(),
      category,
      platform,
      appName.trim()
    );
    setBlueprint(localData);
    setIsGenerating(false);
  };

  const handleDownloadBlueprint = () => {
    if (!blueprint) return;
    const markdownContent = `# 🚀 ${blueprint.appName} - Complete Application Blueprint
**Tagline:** ${blueprint.tagline}
**Category:** ${blueprint.category} | **Target Platform:** ${blueprint.platform.toUpperCase()}
**Target Audience:** ${blueprint.targetAudience}

---

## 📌 Executive Summary
${blueprint.summary}

---

## 🛠️ Recommended Tech Stack
- **Frontend:** ${blueprint.techStack.frontend}
- **Backend:** ${blueprint.techStack.backend}
- **Database:** ${blueprint.techStack.database}
- **Authentication:** ${blueprint.techStack.auth}
- **Styling:** ${blueprint.techStack.styling}
- **Deployment:** ${blueprint.techStack.deployment}

---

## 📱 Screen-by-Screen Architecture
${blueprint.screens
  .map(
    (s, i) => `### ${i + 1}. ${s.name} (\`${s.route}\`)
${s.description}
- **Components:** ${s.components.join(', ')}
- **User Actions:** ${s.userActions.join(' → ')}
`
  )
  .join('\n')}

---

## 🗄️ Database Schema & Data Models
${blueprint.databaseSchema
  .map(
    (t) => `### Table: \`${t.table}\`
*${t.description}*
\`\`\`sql
${t.fields.join('\n')}
\`\`\`
`
  )
  .join('\n')}

---

## ⚡ Core API Endpoints
${blueprint.apiEndpoints
  .map(
    (api) => `- \`${api.method} ${api.endpoint}\`: ${api.description}${
      api.body ? `\n  Payload:\n\`\`\`json\n${api.body}\n\`\`\`` : ''
    }`
  )
  .join('\n')}

---

## 🗺️ Execution Roadmap
${blueprint.roadmap
  .map(
    (r) => `### ${r.phase}: ${r.title} (${r.timeline})
${r.tasks.map((t) => `- [ ] ${t}`).join('\n')}
`
  )
  .join('\n')}

---

## 💡 Best Practices to Build the Best App
${blueprint.bestPractices.map((bp) => `- ${bp}`).join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprint.appName.toLowerCase().replace(/\s+/g, '_')}_blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLaunchInChat = () => {
    if (!onSendToChat || !blueprint) return;
    const promptMessage = `I want to build my application "${blueprint.appName}" (${blueprint.category} - ${blueprint.platform.toUpperCase()}).\n\nExecutive Summary:\n"${blueprint.summary}"\n\nPlease help me engineer and build this application step-by-step with complete, production-ready code. What should our first step be?`;
    onSendToChat(promptMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] bg-[#12151e] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Glow Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-[#161a26] shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>AI App Builder Studio</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-400/40 hidden sm:inline">
                  Production Architect
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate complete technical blueprints, relational schemas, screen flows, and runnable code in one unified workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBlueprint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition cursor-pointer active:scale-95"
              title="Download Full Blueprint as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Blueprint</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close App Builder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Top Generator Box: Concept & Controls */}
          <div className="bg-[#181d2a] p-4 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Side: Idea & Prompt Input */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Describe Your App Idea</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    What should this app do & who is it for?
                  </span>
                </div>

                <textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl bg-[#0d1017] border border-white/10 p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 leading-relaxed font-sans"
                  placeholder="e.g. Build an on-demand medical consultation app with video calls, medicine delivery, and appointment calendar..."
                />

                {/* Quick Templates */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Popular App Templates:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {APP_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer border active:scale-95 ${
                          category === tmpl.category
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-xs'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5'
                        }`}
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Category, Platform, and Name */}
              <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    App Brand Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. SwiftServe"
                    className="w-full rounded-xl bg-[#0d1017] border border-white/10 px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Platform Target
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as any)}
                      className="w-full rounded-xl bg-[#0d1017] border border-white/10 px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="fullstack">Full-Stack Master</option>
                      <option value="web">Web (React / Next)</option>
                      <option value="mobile">Mobile (iOS & Android)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-[#0d1017] border border-white/10 px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="SaaS / AI Tools">SaaS & AI Tools</option>
                      <option value="E-Commerce / Shopping">E-Commerce & Store</option>
                      <option value="Social / Community">Social Community</option>
                      <option value="Delivery / Marketplace">Delivery / Logistics</option>
                      <option value="Health / Fitness">Health & Fitness</option>
                      <option value="Education / EdTech">Education LMS</option>
                      <option value="FinTech / Banking">FinTech / Finance</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateBlueprint}
                  disabled={isGenerating || !concept.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Architecting Best App...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-cyan-300" />
                      <span>Build Best App Architecture</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Blueprint Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Overview & Screen Flow</span>
              </button>

              <button
                onClick={() => setActiveTab('schema')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'schema'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Database Schema</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Production Code</span>
              </button>

              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'roadmap'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rocket className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Roadmap & Pro Tips</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLaunchInChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95"
                title="Send this app blueprint to Jarvis to build it in chat"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Build with Jarvis in Chat</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & SCREEN FLOW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* App Identity Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171b26] to-[#141822] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{blueprint.appName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {blueprint.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">{blueprint.tagline}</p>
                  <p className="text-xs text-slate-400 mt-1">{blueprint.summary}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 text-[11px] text-slate-400">
                  <span>Target: <strong className="text-white">{blueprint.platform.toUpperCase()}</strong></span>
                  <span>Audience: <strong className="text-cyan-300">{blueprint.targetAudience.slice(0, 30)}...</strong></span>
                </div>
              </div>

              {/* Recommended Tech Stack Grid */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recommended Production Tech Stack</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#161a25] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Frontend</span>
                    <span className="text-xs font-semibold text-white block truncate" title={blueprint.techStack.frontend}>
                      {blueprint.techStack.frontend.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">{blueprint.techStack.frontend}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161a25] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Backend</span>
                    <span className="text-xs font-semibold text-white block truncate">Node / Express</span>
                    <span className="text-[10px] text-slate-400 truncate block">{blueprint.techStack.backend}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161a25] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Database</span>
                    <span className="text-xs font-semibold text-cyan-300 block truncate">PostgreSQL</span>
                    <span className="text-[10px] text-slate-400 truncate block">{blueprint.techStack.database}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161a25] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Auth</span>
                    <span className="text-xs font-semibold text-emerald-300 block truncate">OAuth / JWT</span>
                    <span className="text-[10px] text-slate-400 truncate block">{blueprint.techStack.auth}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161a25] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Styling</span>
                    <span className="text-xs font-semibold text-purple-300 block truncate">Tailwind CSS</span>
                    <span className="text-[10px] text-slate-400 truncate block">{blueprint.techStack.styling}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161a25] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Hosting</span>
                    <span className="text-xs font-semibold text-amber-300 block truncate">Cloud Run / App</span>
                    <span className="text-[10px] text-slate-400 truncate block">{blueprint.techStack.deployment}</span>
                  </div>
                </div>
              </div>

              {/* Screen Architecture Wireframe Flow */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Screen-by-Screen User Flow & Components ({blueprint.screens.length} Screens)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {blueprint.screens.map((screen, idx) => (
                    <div
                      key={screen.route}
                      className="p-4 rounded-2xl bg-[#161a25] border border-white/5 space-y-2.5 hover:border-cyan-500/30 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {screen.name}
                          </span>
                        </div>
                        <code className="px-2 py-0.5 rounded-md bg-black/40 text-[11px] font-mono text-cyan-300 border border-white/5">
                          {screen.route}
                        </code>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {screen.description}
                      </p>

                      <div className="space-y-1.5 pt-1 border-t border-white/5">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] font-semibold text-slate-400 mr-1">UI Blocks:</span>
                          {screen.components.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-slate-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                          <span className="text-[10px] font-semibold text-slate-400 mr-1">Actions:</span>
                          {screen.userActions.join(' → ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DATABASE SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>PostgreSQL & Relational Data Architecture</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Optimized relational schemas with primary keys, indexes, and foreign key relations
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      blueprint.databaseSchema
                        .map(
                          (t) =>
                            `-- Table: ${t.table}\nCREATE TABLE ${t.table} (\n  ${t.fields.join(
                              ',\n  '
                            )}\n);`
                        )
                        .join('\n\n'),
                      'sql_schema'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  {copiedKey === 'sql_schema' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'sql_schema' ? 'Copied SQL' : 'Copy All SQL Schemas'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.databaseSchema.map((t) => (
                  <div
                    key={t.table}
                    className="p-4 rounded-2xl bg-[#161a25] border border-white/5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                        <h5 className="font-mono font-bold text-sm text-white">
                          table: <span className="text-purple-300">{t.table}</span>
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.fields.length} columns
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{t.description}</p>

                    <div className="bg-[#0b0e14] rounded-xl p-3 border border-white/5 font-mono text-[11px] text-slate-300 space-y-1">
                      {t.fields.map((f, i) => (
                        <div key={i} className="flex items-center justify-between hover:text-white">
                          <span>{f}</span>
                          {f.includes('PK') && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              PK
                            </span>
                          )}
                          {f.includes('FK') && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                              FK
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* API Endpoints Table */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Core Backend API Routes</span>
                </h5>
                <div className="space-y-2">
                  {blueprint.apiEndpoints.map((api, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#161a25] border border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            api.method === 'GET'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                              : api.method === 'POST'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : api.method === 'PUT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          }`}
                        >
                          {api.method}
                        </span>
                        <code className="font-mono text-slate-200">{api.endpoint}</code>
                      </div>
                      <span className="text-slate-400">{api.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STARTER CODE & PLAYGROUND */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Production-Ready React & Tailwind TypeScript Code</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete, runnable component for the app's core dashboard view
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenPlayground && (
                    <button
                      onClick={() => onOpenPlayground(blueprint.starterCode, 'typescript')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer active:scale-95"
                      title="Run and edit in live Code Playground"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Test in Code Playground</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(blueprint.starterCode, 'starter_code')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    {copiedKey === 'starter_code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'starter_code' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer Container */}
              <div className="rounded-2xl bg-[#0b0e14] border border-white/10 p-4 font-mono text-xs text-slate-200 leading-relaxed max-h-[460px] overflow-y-auto select-all shadow-inner">
                <pre>{blueprint.starterCode}</pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    This code is ready to run directly. You can test it in the Code Playground or ask Jarvis to modify it!
                  </span>
                </div>
                {onOpenPlayground && (
                  <button
                    onClick={() => onOpenPlayground(blueprint.starterCode, 'typescript')}
                    className="underline hover:text-emerald-100 font-bold shrink-0 cursor-pointer"
                  >
                    Launch Playground →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ROADMAP & PRO TIPS */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              
              {/* Sprint Roadmap */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-amber-400" />
                  <span>4-Sprint Launch Roadmap (MVP to Production)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {blueprint.roadmap.map((milestone) => (
                    <div
                      key={milestone.phase}
                      className="p-4 rounded-2xl bg-[#161a25] border border-white/5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {milestone.phase}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{milestone.timeline}</span>
                      </div>
                      <h5 className="text-sm font-bold text-white">{milestone.title}</h5>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {milestone.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best App Recommendations */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#181d2a] border border-cyan-500/25 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Golden Rules to Make This the Best App in the Market</span>
                </h4>
                <div className="space-y-2">
                  {blueprint.bestPractices.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0e121a] border border-white/5 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-[#161a26] shrink-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Architecture Engine: Ready to execute your vision</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchInChat}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start Building with Jarvis</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
