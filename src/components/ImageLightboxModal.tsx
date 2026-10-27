import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Sliders,
  Sparkles,
  Copy,
  Check,
  Move,
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  prompt?: string;
  aspectRatio?: string;
  onEditInStudio?: (imageUrl: string, prompt: string) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt = '',
  aspectRatio = '16:9',
  onEditInStudio,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset scale and position when opened or image changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageUrl]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.35, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.35, 0.5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  // Double click toggles zoom between 1x and 2.5x
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + zoomFactor, 0.5), 5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Dragging / Pan implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Toggle true screen fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  // Keyboard controls: Escape, +, -, 0, f
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `fastgpt-artwork-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/92 backdrop-blur-xl select-none animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 max-w-[70vw] sm:max-w-[80vw]">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/40">
                gemini-nano-banana-2.1
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                {aspectRatio}
              </span>
            </div>
            {prompt && (
              <p className="text-xs text-slate-300 truncate mt-0.5 max-w-md sm:max-w-xl" title={prompt}>
                "{prompt}"
              </p>
            )}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {prompt && (
            <button
              onClick={handleCopyPrompt}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer border border-white/10"
              title="Copy prompt"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer border border-white/10 hidden sm:flex"
            title={isFullscreen ? 'Exit full screen (F)' : 'Full screen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-slate-200 hover:text-white transition cursor-pointer border border-white/10 shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport Area */}
      <div
        className="flex-1 w-full flex items-center justify-center relative overflow-hidden p-2 sm:p-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center touch-none origin-center"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleDoubleClick}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={prompt || 'Artwork Lightbox View'}
            className="max-w-[92vw] max-h-[76vh] object-contain rounded-xl shadow-2xl pointer-events-none select-none ring-1 ring-white/10"
            draggable={false}
          />
        </div>

        {/* Pan Helper Badge if Zoomed */}
        {scale > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-none shadow-xl">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drag to pan around details</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Toolbar */}
      <div
        className="w-full flex flex-col items-center pb-5 pt-3 px-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-20 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#12151e]/90 backdrop-blur-xl border border-white/15 px-3 py-2 rounded-2xl shadow-2xl">
          {/* Zoom Out Button */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition disabled:opacity-40 cursor-pointer active:scale-95"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Scale Percentage Pill */}
          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono font-semibold text-purple-300 border border-purple-500/30 transition cursor-pointer"
            title="Reset to 100% (0)"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In Button */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= 5}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition disabled:opacity-40 cursor-pointer active:scale-95"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset Zoom Button */}
          <button
            onClick={handleResetZoom}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Reset Zoom (0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Re-edit in Studio Button */}
          {onEditInStudio && (
            <button
              onClick={() => {
                onEditInStudio(imageUrl, prompt);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
              title="Open in Image Studio to remix with text prompts"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit with AI</span>
            </button>
          )}

          {/* Download PNG Button */}
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/15 transition cursor-pointer active:scale-95"
            title="Download full resolution image"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Save Image</span>
          </button>
        </div>

        {/* Subtle navigation tips */}
        <p className="text-[10px] text-slate-500 mt-2 hidden sm:block">
          Double-click to toggle 250% zoom • Mouse wheel to zoom • Drag to pan • Press Esc to close
        </p>
      </div>
    </div>
  );
};
