import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Camera,
  Layers,
  ShieldCheck,
  Eye,
  Send,
  Zap,
  Download,
  Sliders,
  ChevronRight,
  Info,
  Volume2,
  Wand2,
  RotateCcw,
  SlidersHorizontal,
  Video,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  TimelinePhase,
  VideoPromptAnalysisResult,
  generateLocalVideoPromptAnalysis,
} from '../utils/videoPromptAnalyzer';
import { UILanguage } from '../types';

interface VideoPromptUtilityProps {
  initialConcept?: string;
  currentImageForContext?: string | null;
  onApplyToImageStudio?: (prompt: string, aspectRatio: string) => void;
  onInsertToChat?: (text: string) => void;
  language?: UILanguage;
  isOnline?: boolean;
}

const PRESET_CONCEPTS = [
  {
    label: 'Cyberpunk Tokyo Rain',
    concept: 'A lone detective in a wet obsidian trenchcoat standing under holographic neon signs in futuristic Tokyo, gentle rain dripping from the brim of his hat into glowing puddles reflecting violet and amber lights',
  },
  {
    label: 'Sci-Fi Quantum Portal',
    concept: 'An astronaut standing before a swirling blue gravitational singularity inside a colossal derelict orbital station, atmospheric ice crystals floating in zero-gravity across the lens',
  },
  {
    label: 'Macro Butterfly & Dew',
    concept: 'Extreme macro shot of an iridescent emerald butterfly resting on a dew-drenched flower petal at sunrise, microscopic water droplets trembling in the morning breeze with prism rainbow refractions',
  },
  {
    label: 'Golden Hour Mountain Flight',
    concept: 'Majestic cinematic low-altitude aerial glide through misty Alpine mountain peaks during golden hour sunset, warm sunlight piercing through snow dust clouds onto jagged granite ridges',
  },
  {
    label: '3D Cute Character Smile',
    concept: 'Charming 3D animated young apprentice holding a magical glowing orb in an ancient library, wide expressive eyes blinking in wonder, warm subsurface scattering on rosy cheeks, soft Pixar style',
  },
];

export const VideoPromptUtility: React.FC<VideoPromptUtilityProps> = ({
  initialConcept = '',
  currentImageForContext = null,
  onApplyToImageStudio,
  onInsertToChat,
  language = 'en',
  isOnline = true,
}) => {
  const [concept, setConcept] = useState(
    initialConcept ||
      'A cybernetic ronin warrior standing in falling cherry blossoms at dusk, katana glowing with soft turquoise energy, cinematic 35mm film grain'
  );
  const [frameRate, setFrameRate] = useState<'24fps' | '30fps' | '60fps' | '120fps'>('24fps');
  const [pacingStyle, setPacingStyle] = useState<'cinematic' | 'kinetic' | 'orbit' | 'macro'>('cinematic');
  const [targetEngine, setTargetEngine] = useState<string>('Runway Gen-3');
  const [visualStyle, setVisualStyle] = useState<string>('Arri Alexa 35mm');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VideoPromptAnalysisResult | null>(() => {
    // Initial pre-generated analysis
    return generateLocalVideoPromptAnalysis(
      initialConcept || 'A cybernetic ronin warrior in falling cherry blossoms at dusk',
      '24fps',
      'cinematic',
      'Runway Gen-3',
      'Arri Alexa 35mm',
      '16:9'
    );
  });

  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'master' | 'timeline' | 'consistency' | 'audio'>('master');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 10-second interactive playback simulation
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(false);
  const [simulationSeconds, setSimulationSeconds] = useState<number>(0);
  const simulationTimerRef = useRef<number | null>(null);

  // Sync initial concept if changed externally
  useEffect(() => {
    if (initialConcept && initialConcept !== concept) {
      setConcept(initialConcept);
    }
  }, [initialConcept]);

  // Handle Play/Pause of the 10-second pacing simulation
  useEffect(() => {
    if (isPlayingSimulation) {
      const stepMs = 50;
      simulationTimerRef.current = window.setInterval(() => {
        setSimulationSeconds((prev) => {
          const next = prev + 0.05;
          if (next >= 10.0) {
            setIsPlayingSimulation(false);
            return 10.0;
          }
          // Sync active phase according to timeline
          if (next < 2.5) setActivePhaseIndex(0);
          else if (next < 5.5) setActivePhaseIndex(1);
          else if (next < 8.0) setActivePhaseIndex(2);
          else setActivePhaseIndex(3);

          return next;
        });
      }, stepMs);
    } else {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    }
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isPlayingSimulation]);

  const handleTogglePlaySimulation = () => {
    if (simulationSeconds >= 10.0) {
      setSimulationSeconds(0);
      setActivePhaseIndex(0);
      setIsPlayingSimulation(true);
    } else {
      setIsPlayingSimulation(!isPlayingSimulation);
    }
  };

  const handleResetSimulation = () => {
    setIsPlayingSimulation(false);
    setSimulationSeconds(0);
    setActivePhaseIndex(0);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Run Concept Analysis & Generate 10-Second Prompt
  const handleAnalyzeConcept = async () => {
    if (!concept.trim()) return;
    setIsAnalyzing(true);
    handleResetSimulation();

    try {
      if (isOnline) {
        const res = await fetch('/api/analyze-video-concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept: concept.trim(),
            frameRate,
            pacingStyle,
            targetEngine,
            visualStyle,
            aspectRatio,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.timelinePhases && data.masterPrompt) {
            setResult({
              ...data,
              concept: concept.trim(),
              frameRate,
              pacingStyle,
              targetEngine,
              visualStyle,
              aspectRatio,
            });
            setIsAnalyzing(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Online analysis failed, using high-fidelity local engine fallback:', e);
    }

    // High-fidelity fallback / offline generator
    const localRes = generateLocalVideoPromptAnalysis(
      concept.trim(),
      frameRate,
      pacingStyle,
      targetEngine,
      visualStyle,
      aspectRatio
    );
    setResult(localRes);
    setIsAnalyzing(false);
  };

  // Download entire director specification as a formatted text file
  const handleDownloadSpec = () => {
    if (!result) return;
    const specContent = `========================================================================
10-SECOND CINEMATIC VIDEO PROMPT SPECIFICATION
Model Target: ${result.targetEngine}
Frame-Rate Cadence: ${result.frameRate}
Pacing Style: ${result.pacingStyle}
Visual Style: ${result.visualStyle}
Aspect Ratio: ${result.aspectRatio}
========================================================================

CONCEPT:
${result.concept}

------------------------------------------------------------------------
MASTER 10-SECOND VIDEO PROMPT:
------------------------------------------------------------------------
${result.masterPrompt}

------------------------------------------------------------------------
CONCISE DIRECT PROMPT:
------------------------------------------------------------------------
${result.concisePrompt}

------------------------------------------------------------------------
NEGATIVE PROMPT (TEMPORAL CONSISTENCY & ARTIFACT REJECTION):
------------------------------------------------------------------------
${result.negativePrompt}

------------------------------------------------------------------------
TEMPORAL CONSISTENCY TOKENS:
------------------------------------------------------------------------
${result.consistencyTokens.map((t) => `- ${t}`).join('\n')}

------------------------------------------------------------------------
10-SECOND FRAME-RATE PACING & CAMERA TIMELINE:
------------------------------------------------------------------------
${result.timelinePhases
  .map(
    (p, i) => `[${p.timeRange}] ${p.phaseTitle}
- Cadence: ${p.fpsCadence}
- Camera Choreography: ${p.cameraChoreography}
- Subject Action: ${p.subjectAction}
- Consistency Anchor: ${p.consistencyAnchor}
- Lighting: ${p.lightingAndAtmosphere}
`
  )
  .join('\n')}

------------------------------------------------------------------------
AUDIO & FOLEY DESIGN (00:00 - 00:10):
------------------------------------------------------------------------
Ambient Score: ${result.audioDesign.ambientScore}
Foley Cues:
${result.audioDesign.foleyCues.map((f) => `- ${f}`).join('\n')}
`;

    const blob = new Blob([specContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `10s_video_prompt_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = result?.masterPrompt ? result.masterPrompt.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner / Utility Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a27] via-[#1b172a] to-[#122228] border border-cyan-500/25 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-24 bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>10s Cinematic Video Prompt Director</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Temporal Engine
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzes your concept to synthesize 10-second video prompts strictly optimized for temporal consistency, optical detail, and frame-rate pacing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {currentImageForContext && (
              <button
                onClick={() => {
                  if (initialConcept) setConcept(initialConcept);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Adopt concept from current Image Studio canvas"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Sync with Active Image</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Director Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Concept Input & Cinematic Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Concept or Narrative Idea</span>
                </label>
                <span className="text-[11px] text-slate-400">10-Second Continuous Scene</span>
              </div>

              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-[#0b0e14] border border-white/10 p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 leading-relaxed font-sans"
                placeholder="Describe the subject, mood, actions, and atmosphere to turn into a 10s cinematic video..."
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Director Concept Presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CONCEPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setConcept(p.concept)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/5 transition cursor-pointer active:scale-95 hover:text-white"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Frame-Rate Cadence */}
                <div>
                  <label className="block text-[11px] font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Frame-Rate Pacing</span>
                  </label>
                  <select
                    value={frameRate}
                    onChange={(e) => setFrameRate(e.target.value as any)}
                    className="w-full rounded-xl bg-[#0b0e14] border border-white/10 px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="24fps">24 FPS (Cinematic 180° Shutter)</option>
                    <option value="30fps">30 FPS (Crisp Digital Standard)</option>
                    <option value="60fps">60 FPS (Ultra-Fluid Fast Action)</option>
                    <option value="120fps">120 FPS (Phantom Slow-Mo 4K)</option>
                  </select>
                </div>

                {/* Pacing Cadence */}
                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 mb-1 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-purple-400" />
                    <span>Pacing Cadence</span>
                  </label>
                  <select
                    value={pacingStyle}
                    onChange={(e) => setPacingStyle(e.target.value as any)}
                    className="w-full rounded-xl bg-[#0b0e14] border border-white/10 px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                  >
                    <option value="cinematic">Cinematic Slow-Burn Dolly</option>
                    <option value="kinetic">Dynamic Kinetic Speed-Ramp</option>
                    <option value="orbit">Continuous 360° Parallax Orbit</option>
                    <option value="macro">Extreme Macro Depth-Rack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Target AI Video Engine */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Video className="w-3 h-3 text-emerald-400" />
                    <span>Target Video Generator</span>
                  </label>
                  <select
                    value={targetEngine}
                    onChange={(e) => setTargetEngine(e.target.value)}
                    className="w-full rounded-xl bg-[#0b0e14] border border-white/10 px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Runway Gen-3">Runway Gen-3 Alpha</option>
                    <option value="OpenAI Sora">OpenAI Sora</option>
                    <option value="Kling AI 1.5">Kling AI 1.5 HD</option>
                    <option value="Luma Dream Machine">Luma Dream Machine</option>
                    <option value="Google Veo 2">Google Veo 2</option>
                  </select>
                </div>

                {/* Visual / Film Style */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-amber-400" />
                    <span>Optics & Film Stock</span>
                  </label>
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full rounded-xl bg-[#0b0e14] border border-white/10 px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Arri Alexa 35mm">Arri Alexa 35mm (Kodak 5219)</option>
                    <option value="IMAX 70mm">IMAX 70mm Photorealistic</option>
                    <option value="Cyberpunk Neon">Cyberpunk Volumetric Neon</option>
                    <option value="Anime Studio Ghibli">Anime Studio Ghibli</option>
                    <option value="Vintage 16mm">Vintage 16mm Bolex Celluloid</option>
                  </select>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                        aspectRatio === ratio
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                      }`}
                    >
                      {ratio === '16:9' ? '16:9 Landscape' : ratio === '9:16' ? '9:16 Vertical' : '1:1 Square'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Analyze & Generate Button */}
            <button
              onClick={handleAnalyzeConcept}
              disabled={isAnalyzing || !concept.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing Concept Pacing & Optics...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-300" />
                  <span>Synthesize 10s Cinematic Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Consistency Tips Card */}
          <div className="bg-[#121622] p-4 rounded-xl border border-white/5 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Temporal Consistency Architecture</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              This engine calculates fixed subject geometry, locked 3-point illumination coordinates, and continuous longitudinal camera vectors to guarantee your 10-second render does not warp, morph, or drop frames.
            </p>
          </div>
        </div>

        {/* Right Column: 10-Second Timeline & Pacing Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              
              {/* Interactive 10-Second Scrubbing Timeline Bar */}
              <div className="bg-[#161a24] p-4 rounded-2xl border border-white/10 space-y-3 shadow-md">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>10-Second Pacing Timeline</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[11px] text-cyan-300 font-bold">
                      {simulationSeconds.toFixed(2)}s / 10.00s
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePlaySimulation}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isPlayingSimulation
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                      }`}
                      title="Play simulated 10-second pacing preview"
                    >
                      {isPlayingSimulation ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingSimulation ? 'Pause Simulation' : 'Preview 10s Pacing'}</span>
                    </button>

                    <button
                      onClick={handleResetSimulation}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Reset timeline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar with 4 distinct phase segments */}
                <div className="relative w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 flex">
                  {/* Phase 1: 0 - 2.5s (25%) */}
                  <div
                    onClick={() => {
                      setSimulationSeconds(1.25);
                      setActivePhaseIndex(0);
                    }}
                    className={`h-full w-[25%] border-r border-white/20 transition cursor-pointer relative group ${
                      simulationSeconds >= 2.5 ? 'bg-cyan-500' : 'bg-cyan-500/30'
                    }`}
                    title="00:00 - 00:02.50 (Phase 1)"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      P1
                    </span>
                  </div>

                  {/* Phase 2: 2.5 - 5.5s (30%) */}
                  <div
                    onClick={() => {
                      setSimulationSeconds(4.0);
                      setActivePhaseIndex(1);
                    }}
                    className={`h-full w-[30%] border-r border-white/20 transition cursor-pointer relative group ${
                      simulationSeconds >= 5.5
                        ? 'bg-indigo-500'
                        : simulationSeconds > 2.5
                        ? 'bg-indigo-500/70'
                        : 'bg-indigo-500/30'
                    }`}
                    title="00:02.50 - 00:05.50 (Phase 2)"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      P2
                    </span>
                  </div>

                  {/* Phase 3: 5.5 - 8.0s (25%) */}
                  <div
                    onClick={() => {
                      setSimulationSeconds(6.75);
                      setActivePhaseIndex(2);
                    }}
                    className={`h-full w-[25%] border-r border-white/20 transition cursor-pointer relative group ${
                      simulationSeconds >= 8.0
                        ? 'bg-purple-500'
                        : simulationSeconds > 5.5
                        ? 'bg-purple-500/70'
                        : 'bg-purple-500/30'
                    }`}
                    title="00:05.50 - 00:08.00 (Phase 3)"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      P3
                    </span>
                  </div>

                  {/* Phase 4: 8.0 - 10.0s (20%) */}
                  <div
                    onClick={() => {
                      setSimulationSeconds(9.0);
                      setActivePhaseIndex(3);
                    }}
                    className={`h-full w-[20%] transition cursor-pointer relative group ${
                      simulationSeconds >= 10.0
                        ? 'bg-emerald-500'
                        : simulationSeconds > 8.0
                        ? 'bg-emerald-500/70'
                        : 'bg-emerald-500/30'
                    }`}
                    title="00:08.00 - 00:10.00 (Phase 4)"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      P4
                    </span>
                  </div>

                  {/* Live Needle Head */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all pointer-events-none"
                    style={{ left: `${(simulationSeconds / 10.0) * 100}%` }}
                  />
                </div>

                {/* 4 Phase Selectable Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {result.timelinePhases.map((phase, idx) => {
                    const isSelected = activePhaseIndex === idx;
                    return (
                      <button
                        key={phase.id}
                        type="button"
                        onClick={() => {
                          setActivePhaseIndex(idx);
                          setSimulationSeconds(phase.startSec);
                        }}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer active:scale-95 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400/60 shadow-md shadow-cyan-500/10'
                            : 'bg-[#0b0e14] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isSelected ? 'text-cyan-300' : 'text-slate-400'
                            }`}
                          >
                            {phase.timeRange.split(' - ')[0]}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'bg-slate-600'
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          <p
                            className={`text-[11px] font-semibold truncate ${
                              isSelected ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {phase.phaseTitle.split(': ')[1] || phase.phaseTitle}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {phase.cameraChoreography}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                  onClick={() => setActiveInspectorTab('master')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeInspectorTab === 'master'
                      ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 text-white border border-cyan-400/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Master Prompt ({wordCount} words)</span>
                </button>

                <button
                  onClick={() => setActiveInspectorTab('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeInspectorTab === 'timeline'
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-400/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pacing & Camera Choreography</span>
                </button>

                <button
                  onClick={() => setActiveInspectorTab('consistency')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeInspectorTab === 'consistency'
                      ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-white border border-emerald-400/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consistency Spec</span>
                </button>

                <button
                  onClick={() => setActiveInspectorTab('audio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeInspectorTab === 'audio'
                      ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-white border border-amber-400/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>10s Audio & Foley</span>
                </button>
              </div>

              {/* Tab 1: Master Cinematic Prompt */}
              {activeInspectorTab === 'master' && (
                <div className="space-y-4 bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-cyan-400" />
                        <span>Ready-to-Paste Master Video Prompt</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {result.targetEngine}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {result.frameRate}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(result.masterPrompt, 'master')}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      {copiedKey === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'master' ? 'Copied Prompt' : 'Copy Master Prompt'}</span>
                    </button>
                  </div>

                  {/* Code-style display */}
                  <div className="relative rounded-xl bg-[#0b0e14] border border-white/10 p-4 font-mono text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
                    {result.masterPrompt}
                  </div>

                  {/* Concise Prompt Alternative */}
                  <div className="bg-[#0e121c] p-3 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Concise 1-Sentence Fast Prompt:</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.concisePrompt, 'concise')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'concise' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'concise' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      "{result.concisePrompt}"
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    {onApplyToImageStudio && (
                      <button
                        onClick={() => onApplyToImageStudio(result.masterPrompt, result.aspectRatio)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-98"
                        title="Render this prompt as an initial keyframe in Image Studio"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Render Initial Keyframe in Studio</span>
                      </button>
                    )}

                    {onInsertToChat && (
                      <button
                        onClick={() => onInsertToChat(result.masterPrompt)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98"
                        title="Send this 10s video prompt into chat for Jarvis"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Insert to Chat</span>
                      </button>
                    )}

                    <button
                      onClick={handleDownloadSpec}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-white/10 active:scale-98"
                      title="Export complete specification as .txt"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Director Spec</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Pacing & Camera Choreography */}
              {activeInspectorTab === 'timeline' && (
                <div className="space-y-4 bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span>Selected Phase Details: {result.timelinePhases[activePhaseIndex]?.phaseTitle}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300">
                      {result.timelinePhases[activePhaseIndex]?.timeRange}
                    </span>
                  </div>

                  {(() => {
                    const phase = result.timelinePhases[activePhaseIndex];
                    if (!phase) return null;
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                              <Camera className="w-3 h-3 text-cyan-400" />
                              Camera Movement & Vector
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {phase.cameraChoreography}
                            </p>
                          </div>

                          <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-400" />
                              Cadence & Shutter Spec
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {phase.fpsCadence}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Subject Physical Action (During this 2.5s window)
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {phase.subjectAction}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Consistency Anchor Lock
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {phase.consistencyAnchor}
                            </p>
                          </div>

                          <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-indigo-400" />
                              Lighting & Atmospheric Physics
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {phase.lightingAndAtmosphere}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab 3: Consistency Specification */}
              {activeInspectorTab === 'consistency' && (
                <div className="space-y-4 bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Temporal & Character Consistency Spec</span>
                    </span>
                    <button
                      onClick={() => handleCopy(result.consistencyTokens.join(', '), 'tokens')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'tokens' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'tokens' ? 'Copied' : 'Copy Consistency Tokens'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">Core Subject Anchor (No Morphing)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {result.conceptAnalysis.coreSubjectAnchor}
                      </p>
                    </div>

                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">Spatial Depth Architecture</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {result.conceptAnalysis.spatialDepth}
                      </p>
                    </div>

                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">Cinematic Optics & Lens</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {result.conceptAnalysis.cinematicOptics}
                      </p>
                    </div>

                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">Lighting & Film Grade LUT</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {result.conceptAnalysis.lightingColorGrade}
                      </p>
                    </div>
                  </div>

                  {/* Seed Tokens */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 mb-1.5 block">
                      Seed Consistency Tokens:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.consistencyTokens.map((token) => (
                        <span
                          key={token}
                          className="px-2.5 py-1 rounded-lg bg-[#0b0e14] border border-white/10 font-mono text-[11px] text-emerald-300"
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div className="bg-[#0b0e14] p-3 rounded-xl border border-rose-500/20 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-400">Negative Prompt (Artifact Rejection):</span>
                      <button
                        onClick={() => handleCopy(result.negativePrompt, 'negative')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'negative' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'negative' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      {result.negativePrompt}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Audio & Foley Design */}
              {activeInspectorTab === 'audio' && (
                <div className="space-y-4 bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>10-Second Soundtrack & Foley Progression</span>
                    </span>
                  </div>

                  <div className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300">Ambient Musical Arc:</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {result.audioDesign.ambientScore}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Chronological Foley Cues (00:00 - 00:10):
                    </span>
                    <div className="space-y-1.5">
                      {result.audioDesign.foleyCues.map((cue, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[#0b0e14] border border-white/5 text-xs text-slate-300 font-mono"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                          <span>{cue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-[#161a24] rounded-2xl border border-white/10 text-center text-slate-500">
              <Film className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Ready to Direct Your 10s Video</p>
              <p className="text-xs max-w-sm text-slate-500 mt-1">
                Enter your concept on the left and click "Synthesize 10s Cinematic Prompt" to calculate consistency and pacing.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
