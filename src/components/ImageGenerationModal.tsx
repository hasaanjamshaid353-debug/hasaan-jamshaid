import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  X,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  Wand2,
  Upload,
  RotateCcw,
  Layers,
  ArrowRight,
  Eye,
  Zap,
  Play,
  Pause,
  Send,
  SplitSquareVertical,
  Maximize2,
  Trash2,
  History,
  Grid,
  Filter,
  Plus,
  Film,
} from 'lucide-react';
import { UILanguage } from '../types';
import { VideoPromptUtility } from './VideoPromptUtility';

export interface StudioImageItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  createdAt: number;
  source: 'generated' | 'edited' | 'uploaded';
  model?: string;
  parentImageUrl?: string;
}

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialImageForEdit?: string | null;
  isOnline: boolean;
  language: UILanguage;
  onInsertToChat?: (imageUrl: string, prompt: string, aspectRatio: string) => void;
  existingImages?: Array<{ url: string; prompt: string; aspectRatio?: string }>;
}

type TabType = 'create' | 'edit' | 'video_director';
type GalleryFilter = 'all' | 'generated' | 'edited';

const STYLE_PRESETS = [
  { label: '3D Pixar Animation', value: '3D Pixar Animation, cute character styling, warm soft subsurface scattering, Octane render 8K' },
  { label: 'Photorealistic 8K DSLR', value: 'Photorealistic 8K, Hasselblad 100MP, crisp texture detail, raw photo, studio lighting' },
  { label: 'Cyberpunk Tokyo Neon', value: 'Cyberpunk 2077 aesthetic, volumetric neon pink and cyan fog, wet reflective streets, cinematic rim light' },
  { label: 'Anime Studio Ghibli', value: 'Makoto Shinkai and Studio Ghibli anime aesthetic, rich watercolor skies, nostalgic emotional lighting' },
  { label: 'Mughal / Folk Art', value: 'Traditional Pakistani truck art & Mughal miniature ornamentation, vibrant intricate floral patterns, royal gold filigree' },
  { label: 'Cinematic Film Noir 35mm', value: 'Cinematic 35mm film grain, high contrast chiaroscuro shadows, moody atmospheric haze, anamorphic lens flare' },
];

const LOCAL_STORAGE_KEY = 'fastgpt_image_studio_history_v2';

// Procedural placeholder generator for initial demo gallery items
const createDemoPlaceholder = (title: string, color1: string, color2: string, ratio = '16:9'): string => {
  const canvas = document.createElement('canvas');
  const w = ratio === '16:9' ? 640 : 480;
  const h = ratio === '16:9' ? 360 : 480;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle geometric grid
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Glow orb
  const glow = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2.5);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, w / 2, h / 2 - 8);

  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('gemini-nano-banana-2.1 Visual Studio', w / 2, h / 2 + 20);

  return canvas.toDataURL('image/png');
};

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialImageForEdit = null,
  isOnline,
  language,
  onInsertToChat,
  existingImages = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialImageForEdit ? 'edit' : 'create');

  // Gallery History State (Core feature: store all results in grid layout)
  const [imageHistory, setImageHistory] = useState<StudioImageItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse image history from localStorage:', e);
    }
    return [];
  });

  // Selected Image ID for active view & re-edit
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>('all');

  // Create Mode States
  const [createPrompt, setCreatePrompt] = useState(
    initialPrompt ||
      '3D cute animated scholar character in a futuristic high-tech library, golden hour ambient lighting, Pixar style, Octane Render 8K, ultra sharp detail'
  );
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0].value);

  // Edit Mode States
  const [editPrompt, setEditPrompt] = useState(
    'Add volumetric glowing neon accents, dramatic atmospheric fog, and cinematic rim lighting'
  );
  const [sourceImageForEdit, setSourceImageForEdit] = useState<string | null>(initialImageForEdit || null);
  const [showComparison, setShowComparison] = useState(false);
  const [videoDirectorConcept, setVideoDirectorConcept] = useState<string>(initialPrompt || '');

  // Live Canvas Filters for Editing
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);

  // Magic Live FX / Cinematic Animator
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationMode, setAnimationMode] = useState<'drift' | 'pulse' | 'cinematic'>('cinematic');

  // Common States
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-nano-banana-2.1');
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const editPromptInputRef = useRef<HTMLTextAreaElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (imageHistory.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(imageHistory.slice(0, 30)));
      }
    } catch (e) {
      console.warn('Failed to save image history to localStorage:', e);
    }
  }, [imageHistory]);

  // Merge any existing images from chat into history on mount
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setImageHistory((prev) => {
        const existingUrls = new Set(prev.map((i) => i.url));
        const newItems: StudioImageItem[] = [];
        existingImages.forEach((img, idx) => {
          if (!existingUrls.has(img.url)) {
            newItems.push({
              id: `chat-img-${Date.now()}-${idx}`,
              url: img.url,
              prompt: img.prompt || 'Generated in chat',
              aspectRatio: img.aspectRatio || '1:1',
              createdAt: Date.now() - idx * 60000,
              source: 'generated',
              model: 'gemini-nano-banana-2.1',
            });
            existingUrls.add(img.url);
          }
        });
        if (newItems.length > 0) {
          return [...newItems, ...prev];
        }
        return prev;
      });
    }
  }, [existingImages]);

  // If initialImageForEdit is supplied, set up edit state
  useEffect(() => {
    if (initialImageForEdit) {
      setSourceImageForEdit(initialImageForEdit);
      setActiveTab('edit');
      // Also register into history if not already there
      const existing = imageHistory.find((i) => i.url === initialImageForEdit);
      if (existing) {
        setSelectedImageId(existing.id);
      } else {
        const newItem: StudioImageItem = {
          id: `input-${Date.now()}`,
          url: initialImageForEdit,
          prompt: initialPrompt || 'Uploaded / Selected for editing',
          aspectRatio: '16:9',
          createdAt: Date.now(),
          source: 'uploaded',
          model: 'gemini-nano-banana-2.1',
        };
        setImageHistory((prev) => [newItem, ...prev]);
        setSelectedImageId(newItem.id);
      }
    }
  }, [initialImageForEdit]);

  useEffect(() => {
    if (initialPrompt && !createPrompt) {
      setCreatePrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Set default selected image if none selected and history exists
  useEffect(() => {
    if (!selectedImageId && imageHistory.length > 0) {
      setSelectedImageId(imageHistory[0].id);
      setGeneratedImageUrl(imageHistory[0].url);
    }
  }, [imageHistory, selectedImageId]);

  // Identify current selected item
  const selectedItem = imageHistory.find((i) => i.id === selectedImageId) || imageHistory[0] || null;
  const currentActiveImage =
    activeTab === 'edit'
      ? editedImageUrl || sourceImageForEdit || selectedItem?.url || null
      : generatedImageUrl || selectedItem?.url || null;

  // Magic Cinematic Motion Canvas Loop
  useEffect(() => {
    if (!isAnimating) {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      return;
    }

    if (!currentActiveImage || !animationCanvasRef.current) return;

    const canvas = animationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentActiveImage;

    const startTime = performance.now();

    // Floating light particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      radius: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: -Math.random() * 0.8 - 0.2,
      alpha: Math.random() * 0.7 + 0.3,
      color: ['#38bdf8', '#c084fc', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)],
    }));

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Camera drift & zoom calculation
      let scale = 1.0;
      let offsetX = 0;
      let offsetY = 0;

      if (animationMode === 'cinematic') {
        scale = 1.05 + Math.sin(elapsed * 0.6) * 0.05;
        offsetX = Math.sin(elapsed * 0.4) * 12;
        offsetY = Math.cos(elapsed * 0.5) * 8;
      } else if (animationMode === 'pulse') {
        scale = 1.02 + Math.abs(Math.sin(elapsed * 1.5)) * 0.06;
      } else {
        scale = 1.08;
        offsetX = Math.sin(elapsed * 0.3) * 16;
        offsetY = Math.cos(elapsed * 0.2) * 10;
      }

      ctx.save();
      ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();

      // Vignette & Lighting Rim
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.3,
        width / 2,
        height / 2,
        width * 0.75
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Atmospheric Embers / Light Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(elapsed * 3 + p.radius) * 0.4);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    img.onload = () => {
      canvas.width = 800;
      canvas.height = aspectRatio === '16:9' ? 450 : aspectRatio === '9:16' ? 800 : 600;
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isAnimating, animationMode, currentActiveImage, aspectRatio]);

  if (!isOpen) return null;

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // 1-Click Supercharge Prompt with AI
  const handleEnhancePrompt = async () => {
    const targetPrompt = activeTab === 'create' ? createPrompt : editPrompt;
    if (!targetPrompt.trim() || isEnhancingPrompt) return;

    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        if (activeTab === 'create') {
          setCreatePrompt(data.enhancedPrompt);
        } else {
          setEditPrompt(data.enhancedPrompt);
        }
      }
    } catch (e) {
      console.warn('Enhancement error:', e);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Helper to add image to history and select it
  const addImageToHistory = (
    url: string,
    promptText: string,
    srcType: 'generated' | 'edited' | 'uploaded',
    ratio = aspectRatio,
    parentId?: string
  ) => {
    const newItem: StudioImageItem = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url,
      prompt: promptText,
      aspectRatio: ratio,
      createdAt: Date.now(),
      source: srcType,
      model: modelUsed,
      parentImageUrl: parentId,
    };

    setImageHistory((prev) => [newItem, ...prev]);
    setSelectedImageId(newItem.id);
    return newItem;
  };

  // Generate Image handler using gemini-nano-banana-2.1
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setIsAnimating(false);

    const fullPrompt = selectedStyle
      ? `${createPrompt.trim()}, style: ${selectedStyle}`
      : createPrompt.trim();

    if (isOnline) {
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: fullPrompt,
            aspectRatio,
            imageSize,
            model: 'gemini-nano-banana-2.1',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate image');
        }

        setGeneratedImageUrl(data.imageUrl);
        setModelUsed(data.model || 'gemini-nano-banana-2.1');
        addImageToHistory(data.imageUrl, fullPrompt, 'generated', aspectRatio);
      } catch (err: any) {
        console.warn('Online generation failed, falling back to local procedural canvas:', err);
        const fallbackUrl = generateOfflineVisualCanvas(fullPrompt);
        addImageToHistory(fallbackUrl, fullPrompt, 'generated', aspectRatio);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        const fallbackUrl = generateOfflineVisualCanvas(fullPrompt);
        addImageToHistory(fallbackUrl, fullPrompt, 'generated', aspectRatio);
        setIsLoading(false);
      }, 500);
    }
  };

  // Edit Image handler using gemini-nano-banana-2.1
  const handleEdit = async () => {
    const targetImage = sourceImageForEdit || currentActiveImage;
    if (!targetImage) {
      setError('Please select an image from the gallery to edit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsAnimating(false);

    if (isOnline) {
      try {
        const res = await fetch('/api/edit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: editPrompt,
            image: targetImage,
            aspectRatio,
            model: 'gemini-nano-banana-2.1',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to edit image');
        }

        setEditedImageUrl(data.imageUrl);
        setModelUsed(data.model || 'gemini-nano-banana-2.1');
        addImageToHistory(data.imageUrl, editPrompt, 'edited', aspectRatio, targetImage);
      } catch (err: any) {
        console.warn('AI editing fallback to local canvas filters:', err);
        applyClientFiltersToCanvas(targetImage, editPrompt);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        applyClientFiltersToCanvas(targetImage, editPrompt);
        setIsLoading(false);
      }, 400);
    }
  };

  // Render client-side canvas filters
  const applyClientFiltersToCanvas = (baseImgSrc: string, promptText: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0);

      // Watermark indicator
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('Fast GPT • gemini-nano-banana-2.1 Remix', 20, img.height - 24);

      const url = canvas.toDataURL('image/png');
      setEditedImageUrl(url);
      addImageToHistory(url, promptText, 'edited', aspectRatio, baseImgSrc);
    };
    img.src = baseImgSrc;
  };

  // Generate an offline visual render
  const generateOfflineVisualCanvas = (promptText: string) => {
    const canvas = document.createElement('canvas');
    const width = aspectRatio === '16:9' ? 960 : aspectRatio === '9:16' ? 540 : 640;
    const height = aspectRatio === '16:9' ? 540 : aspectRatio === '9:16' ? 960 : 640;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.filter = 'blur(40px)';
    const glow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 2);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('gemini-nano-banana-2.1 AI Visual Rendering', width / 2, height / 2 - 10);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(promptText.slice(0, 48) + '...', width / 2, height / 2 + 25);

    const url = canvas.toDataURL('image/png');
    setGeneratedImageUrl(url);
    return url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const uploadedUrl = event.target.result as string;
          const newItem = addImageToHistory(
            uploadedUrl,
            `Uploaded file: ${file.name}`,
            'uploaded',
            '1:1'
          );
          setSourceImageForEdit(uploadedUrl);
          setSelectedImageId(newItem.id);
          setActiveTab('edit');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Re-edit selected image: loads the image into edit tab and prepares prompt
  const handleSelectAndReEdit = (item: StudioImageItem) => {
    setSelectedImageId(item.id);
    setSourceImageForEdit(item.url);
    setEditedImageUrl(null);
    setActiveTab('edit');

    // Prepopulate contextual prompt
    if (item.prompt && item.source === 'generated') {
      setEditPrompt(`Modify this artwork: add cinematic neon lighting, rich atmosphere, and ultra-sharp 8K details`);
    }

    setTimeout(() => {
      editPromptInputRef.current?.focus();
    }, 100);
  };

  const handleDownload = (imgUrl: string | null) => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `fastgpt-studio-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleInsertChat = (item?: StudioImageItem) => {
    const target = item || selectedItem;
    if (target && onInsertToChat) {
      onInsertToChat(target.url, target.prompt, target.aspectRatio || aspectRatio);
      onClose();
    }
  };

  const handleDeleteImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageHistory((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm(language === 'ur' ? 'کیا آپ تمام محفوظ تصاویر صاف کرنا چاہتے ہیں؟' : 'Clear all image history in Studio?')) {
      setImageHistory([]);
      setSelectedImageId(null);
      setGeneratedImageUrl(null);
      setEditedImageUrl(null);
      setSourceImageForEdit(null);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
  };

  // Filter gallery items
  const filteredGallery = imageHistory.filter((item) => {
    if (galleryFilter === 'generated') return item.source === 'generated';
    if (galleryFilter === 'edited') return item.source === 'edited';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl rounded-3xl bg-[#12151e] border border-white/10 shadow-2xl text-slate-100 relative my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/10 shrink-0 bg-[#161a25]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {language === 'ur' ? 'اے آئی امیج اسٹوڈیو و گیلری' : 'Image Studio & Gallery Grid'}
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  gemini-nano-banana-2.1
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono hidden sm:inline-flex items-center gap-1">
                  <Grid className="w-3 h-3 text-cyan-400" />
                  {imageHistory.length} creations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                {language === 'ur'
                  ? 'ٹیکسٹ پرامپٹ سے نئی تصاویر بنائیں یا گیلری گرڈ سے کسی بھی پرانی تصویر کو منتخب کر کے دوبارہ ایڈیٹ کریں۔'
                  : 'Generate new artwork or select any previous result from the grid to re-edit & remix.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {imageHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer flex items-center gap-1"
                title="Clear gallery history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear Gallery</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Mode Switcher */}
        <div className="flex items-center justify-between gap-2 px-5 sm:px-7 py-3 border-b border-white/10 shrink-0 bg-[#0f121a] flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-white border border-purple-500/50 shadow-md shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>1. Create New Image</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('edit');
                if (!sourceImageForEdit && selectedItem) {
                  setSourceImageForEdit(selectedItem.url);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 ${
                activeTab === 'edit'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-500/50 shadow-md shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. Re-edit & Remix Previous</span>
              {sourceImageForEdit && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>

            <button
              onClick={() => {
                if (!videoDirectorConcept) {
                  setVideoDirectorConcept(selectedItem?.prompt || createPrompt);
                }
                setActiveTab('video_director');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 ${
                activeTab === 'video_director'
                  ? 'bg-gradient-to-r from-cyan-600/30 via-indigo-600/30 to-purple-600/30 text-white border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. 10s Video Prompt Director</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                Pacing & Consistency
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer transition active:scale-95 shadow-xs">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Custom</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6">
          
          {/* Main Top Studio Area: Split Canvas & Editor Controls OR 10s Video Prompt Director */}
          {activeTab === 'video_director' ? (
            <VideoPromptUtility
              initialConcept={videoDirectorConcept || selectedItem?.prompt || createPrompt}
              currentImageForContext={currentActiveImage}
              language={language}
              isOnline={isOnline}
              onApplyToImageStudio={(videoPrompt, newRatio) => {
                setCreatePrompt(videoPrompt);
                if (newRatio === '16:9' || newRatio === '1:1' || newRatio === '9:16' || newRatio === '4:3' || newRatio === '3:4') {
                  setAspectRatio(newRatio);
                }
                setActiveTab('create');
              }}
              onInsertToChat={(text) => {
                if (onInsertToChat) {
                  onInsertToChat(currentActiveImage || '', text, aspectRatio);
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Generator or Re-editor Parameters */}
            <div className="lg:col-span-6 space-y-4">
              {activeTab === 'create' ? (
                // CREATE MODE
                <div className="space-y-4 bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Prompt (gemini-nano-banana-2.1)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleEnhancePrompt}
                          disabled={isEnhancingPrompt || !createPrompt.trim()}
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-500/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
                          title="Auto-expand into an ultra-detailed 8K prompt"
                        >
                          <Zap className={`w-3 h-3 ${isEnhancingPrompt ? 'animate-bounce text-amber-400' : ''}`} />
                          <span>{isEnhancingPrompt ? 'Refining...' : 'Supercharge Prompt'}</span>
                        </button>

                        <button
                          onClick={() => handleCopyPrompt(createPrompt)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
                          title="Copy prompt"
                        >
                          {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={createPrompt}
                      onChange={(e) => setCreatePrompt(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl bg-[#0b0e14] border border-white/10 p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 leading-relaxed font-sans"
                      placeholder="Describe what image to generate in detail..."
                    />
                  </div>

                  {/* Quick Style Chips */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Curated Visual Styles:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {STYLE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setSelectedStyle(preset.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border active:scale-95 ${
                            selectedStyle === preset.value
                              ? 'bg-purple-500/25 text-purple-200 border-purple-500/50 shadow-xs'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution & Aspect Ratio Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Aspect Ratio
                      </label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as any)}
                        className="w-full rounded-xl bg-[#0b0e14] border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="9:16">9:16 (Vertical Story)</option>
                        <option value="4:3">4:3 (Standard)</option>
                        <option value="3:4">3:4 (Portrait)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Resolution Tier
                      </label>
                      <select
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value as any)}
                        className="w-full rounded-xl bg-[#0b0e14] border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="1K">1K (Standard HD)</option>
                        <option value="2K">2K (Crisp Ultra HD)</option>
                        <option value="4K">4K (Maximum Masterpiece)</option>
                      </select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !createPrompt.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Rendering with gemini-nano-banana-2.1...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate & Add to Gallery Grid</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // RE-EDIT MODE
                <div className="space-y-4 bg-[#161a24] p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-sm">
                  {/* Selected Source Image Indicator */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0e14] border border-white/10">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        {sourceImageForEdit ? (
                          <img
                            src={sourceImageForEdit}
                            alt="Selected for edit"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                          <span>Re-editing Previous Result:</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {selectedItem?.source === 'edited' ? '(Previously edited)' : '(Original creation)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate max-w-xs">
                          {selectedItem?.prompt || 'Selected from grid gallery'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // Switch active image or prompt to pick from grid
                        const el = document.getElementById('studio-gallery-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-cyan-300 font-medium shrink-0 cursor-pointer"
                    >
                      Change Source
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        AI Re-edit Prompt (gemini-nano-banana-2.1)
                      </label>
                      <button
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancingPrompt || !editPrompt.trim()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-500/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Supercharge your edit prompt"
                      >
                        <Zap className={`w-3 h-3 ${isEnhancingPrompt ? 'animate-bounce text-amber-400' : ''}`} />
                        <span>{isEnhancingPrompt ? 'Refining...' : 'Enhance Edit Prompt'}</span>
                      </button>
                    </div>

                    <textarea
                      ref={editPromptInputRef}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl bg-[#0b0e14] border border-indigo-500/40 p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 leading-relaxed font-sans"
                      placeholder="Describe changes (e.g. 'Add glowing purple cyberpunk neon lighting, rain ripples, and lens flares')..."
                    />
                  </div>

                  {/* Quick Edit Ideas */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Add glowing neon cyberpunk highlights and rain',
                      'Transform background to starry cosmic galaxy',
                      'Turn into dramatic golden hour sunlight',
                      'Convert style to vibrant oil painting texture',
                    ].map((idea) => (
                      <button
                        key={idea}
                        onClick={() => setEditPrompt(idea)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 text-[11px] border border-indigo-800/50 cursor-pointer transition active:scale-95"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>

                  {/* Live Canvas Color & Lighting Sliders */}
                  <div className="bg-[#0b0e14] rounded-xl p-3 border border-white/5 space-y-2">
                    <div className="font-semibold text-slate-300 text-xs flex items-center justify-between">
                      <span>Live Color & Mood Tuning</span>
                      <button
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setSepia(0);
                          setBlur(0);
                        }}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span>Brightness</span>
                          <span>{brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span>Contrast</span>
                          <span>{contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apply Edit Action Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      disabled={isLoading || (!sourceImageForEdit && !selectedItem)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Remixing with gemini-nano-banana-2.1...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>Apply AI Edit & Save to Gallery</span>
                        </>
                      )}
                    </button>

                    {sourceImageForEdit && editedImageUrl && (
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`px-3 py-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          showComparison
                            ? 'bg-purple-500/25 text-purple-200 border-purple-500'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                        title="Compare Before vs After"
                      >
                        <SplitSquareVertical className="w-4 h-4" />
                        <span className="hidden sm:inline">Compare</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Active Preview Canvas & Motion FX Studio */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-2xl bg-[#161a24] border border-white/10 p-4 min-h-[340px] relative overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 text-slate-400 py-12">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-7 h-7 text-purple-400" />
                    </div>
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin absolute -bottom-1 -right-1" />
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5 font-mono">
                      <span>gemini-nano-banana-2.1</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {language === 'ur'
                        ? 'اعلیٰ کوالٹی اے آئی وژول تخلیق ہو رہا ہے...'
                        : 'Rendering visual artwork with neural precision...'}
                    </p>
                  </div>
                </div>
              ) : currentActiveImage ? (
                <div className="w-full flex flex-col items-center gap-3">
                  {/* Viewport Canvas */}
                  <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group bg-black/60 flex items-center justify-center min-h-[240px] max-h-[360px]">
                    {isAnimating ? (
                      <canvas
                        ref={animationCanvasRef}
                        className="w-full h-auto object-contain max-h-[350px] mx-auto rounded-xl shadow-2xl"
                      />
                    ) : showComparison && sourceImageForEdit && editedImageUrl ? (
                      <div className="grid grid-cols-2 w-full h-full divide-x divide-white/20">
                        <div className="relative p-1">
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-slate-300 z-10 border border-white/10">
                            Original
                          </span>
                          <img
                            src={sourceImageForEdit}
                            alt="Original"
                            className="w-full h-full object-contain max-h-[330px]"
                          />
                        </div>
                        <div className="relative p-1">
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 text-[10px] font-bold text-white z-10 border border-purple-400/40">
                            AI Edited
                          </span>
                          <img
                            src={editedImageUrl}
                            alt="Edited"
                            className="w-full h-full object-contain max-h-[330px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentActiveImage}
                        alt="Active Visual"
                        style={{
                          filter:
                            activeTab === 'edit' && !editedImageUrl
                              ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) blur(${blur}px)`
                              : undefined,
                        }}
                        className="w-full h-auto object-contain max-h-[350px] mx-auto transition"
                      />
                    )}

                    {/* Quick Hover Action Floating Bar */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 backdrop-blur-xs flex-wrap">
                      <button
                        onClick={() => handleDownload(currentActiveImage)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/20 shadow-xl cursor-pointer active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>

                      {onInsertToChat && (
                        <button
                          onClick={() => handleInsertChat()}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xl cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Insert to Chat
                        </button>
                      )}

                      {activeTab === 'create' && (
                        <button
                          onClick={() => {
                            if (selectedItem) {
                              handleSelectAndReEdit(selectedItem);
                            } else if (generatedImageUrl) {
                              setSourceImageForEdit(generatedImageUrl);
                              setActiveTab('edit');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xl cursor-pointer active:scale-95"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Re-edit this Image
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setVideoDirectorConcept(selectedItem?.prompt || createPrompt);
                          setActiveTab('video_director');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xl cursor-pointer active:scale-95"
                        title="Direct 10-second cinematic video prompt from this visual concept"
                      >
                        <Film className="w-3.5 h-3.5" />
                        10s Video Director
                      </button>
                    </div>
                  </div>

                  {/* Motion FX Bar */}
                  <div className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAnimating(!isAnimating)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                          isAnimating
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                            : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40'
                        }`}
                        title="Animate static image into cinematic motion"
                      >
                        {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{isAnimating ? 'Stop' : '🎥 Magic Animate FX'}</span>
                      </button>

                      {isAnimating && (
                        <select
                          value={animationMode}
                          onChange={(e) => setAnimationMode(e.target.value as any)}
                          className="bg-black/60 border border-white/10 rounded-lg px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none"
                        >
                          <option value="cinematic">Cinematic Drift</option>
                          <option value="pulse">Atmospheric Pulse</option>
                          <option value="drift">Ken Burns Pan</option>
                        </select>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onInsertToChat && (
                        <button
                          onClick={() => handleInsertChat()}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-xs cursor-pointer active:scale-95"
                        >
                          <Send className="w-3 h-3" />
                          <span>Insert into Chat</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Image Prompt Snippet & Details */}
                  {selectedItem && (
                    <div className="w-full bg-[#0b0e14] rounded-xl p-2.5 border border-white/5 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          {selectedItem.source === 'edited' ? 'AI Remix / Edited' : 'AI Generated Result'}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(selectedItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                        "{selectedItem.prompt}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-500 text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-1">
                      {activeTab === 'create' ? 'Ready to Generate Visuals' : 'No Image Selected'}
                    </h4>
                    <p className="text-xs max-w-xs text-slate-400 leading-relaxed">
                      {language === 'ur'
                        ? 'پرامپٹ ٹائپ کریں یا نیچے گیلری سے کوئی تصویر منتخب کریں۔'
                        : 'Enter a prompt to create new images, or select any image from the gallery below to re-edit.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* =========================================================================
              CREATIONS GALLERY GRID (The requested feature!)
              Displays all generated images in a responsive grid layout,
              allowing users to select and re-edit previous results.
          ========================================================================== */}
          <div id="studio-gallery-grid" className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {language === 'ur' ? 'محفوظ تصاویر کی گیلری' : 'Image History & Gallery Grid'}
                    </span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {imageHistory.length}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ur'
                      ? 'کسی بھی تصویر پر کلک کر کے اسے منتخب کریں یا "Re-edit" دبا کر نئے پرامپٹ کے ساتھ دوبارہ ایڈیٹ کریں۔'
                      : 'Click any card to select, view in full preview, or click "Re-edit" to remix with natural language.'}
                  </p>
                </div>
              </div>

              {/* Gallery Filter Chips */}
              <div className="flex items-center gap-1.5 bg-[#0b0e14] p-1 rounded-xl border border-white/10 text-[11px]">
                <button
                  onClick={() => setGalleryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    galleryFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({imageHistory.length})
                </button>
                <button
                  onClick={() => setGalleryFilter('generated')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    galleryFilter === 'generated'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Generated ({imageHistory.filter((i) => i.source === 'generated').length})
                </button>
                <button
                  onClick={() => setGalleryFilter('edited')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    galleryFilter === 'edited'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Edited ({imageHistory.filter((i) => i.source === 'edited').length})
                </button>
              </div>
            </div>

            {/* Grid Layout Cards */}
            {filteredGallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredGallery.map((item) => {
                  const isSelected = item.id === selectedImageId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedImageId(item.id);
                        if (activeTab === 'create') {
                          setGeneratedImageUrl(item.url);
                        } else {
                          setSourceImageForEdit(item.url);
                        }
                      }}
                      className={`group relative rounded-2xl overflow-hidden bg-[#0e121a] border transition-all duration-200 cursor-pointer flex flex-col ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/20 scale-[1.02]'
                          : 'border-white/10 hover:border-white/25 hover:shadow-md'
                      }`}
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                        <img
                          src={item.url}
                          alt={item.prompt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Badges Top Left & Right */}
                        <div className="absolute top-1.5 left-1.5 z-10">
                          {item.source === 'edited' ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-600/90 text-white border border-indigo-400/40 shadow-xs">
                              Remix
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-600/90 text-white border border-purple-400/40 shadow-xs">
                              AI
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Hover Overlay with Action Buttons */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 backdrop-blur-2xs">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={(e) => handleDeleteImage(item.id, e)}
                              className="p-1 rounded-md bg-black/60 hover:bg-rose-600/80 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.url);
                              }}
                              className="p-1 rounded-md bg-black/60 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Download PNG"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Quick 1-Click Re-edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAndReEdit(item);
                            }}
                            className="w-full py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Re-edit</span>
                          </button>

                          {/* Quick 1-Click 10s Video Prompt Director */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVideoDirectorConcept(item.prompt);
                              setActiveTab('video_director');
                            }}
                            className="w-full mt-1 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 font-semibold text-[10px] flex items-center justify-center gap-1 border border-cyan-700/50 cursor-pointer active:scale-95 transition"
                            title="Direct 10s video prompt from this concept"
                          >
                            <Film className="w-3 h-3 text-cyan-300" />
                            <span>10s Video</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Info Bottom */}
                      <div className="p-2 space-y-1">
                        <p className="text-[11px] font-medium text-slate-200 line-clamp-1 group-hover:text-purple-300 transition-colors">
                          {item.prompt}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{item.aspectRatio || '16:9'}</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty State with Quick Inspiration Triggers
              <div className="rounded-2xl bg-[#0e121a] border border-dashed border-white/10 p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                  <Grid className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-200">
                    {language === 'ur' ? 'گیلری ابھی خالی ہے' : 'No images in history yet'}
                  </h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                    {language === 'ur'
                      ? 'اوپر سے کوئی بھی وژول بنائیں، آپ کے تمام نتائج یہاں گرڈ میں محفوظ ہوں گے جنہیں آپ جب چاہیں دوبارہ ایڈیٹ کر سکیں گے۔'
                      : 'Generate your first visual above. All generated images will be saved in this grid so you can review and re-edit them anytime.'}
                  </p>
                </div>

                {/* Quick Inspirations */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 mb-2">
                    Try generating an instant idea:
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                    {[
                      {
                        title: 'Cyberpunk Tokyo Rain',
                        prompt: 'Cyberpunk Tokyo streets at night in pouring rain with neon holograms and reflective puddles, 8K Octane render',
                      },
                      {
                        title: '3D Pixar Scholar',
                        prompt: 'Cute 3D animated scholar owl reading a glowing magical book inside a cosmic library, Pixar Disney style',
                      },
                      {
                        title: 'Ethereal Cosmic Nebula',
                        prompt: 'Hyper-detailed nebula galaxy swirling with gold and violet stardust, James Webb telescope aesthetic 8K',
                      },
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          setCreatePrompt(item.prompt);
                          setActiveTab('create');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-purple-300 border border-white/10 transition cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
