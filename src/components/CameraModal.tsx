import React, { useState, useRef, useEffect } from 'react';
import { X, Camera as CameraIcon, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      setPhoto(null);
      setError(null);
      return;
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.warn('Camera error:', err);
        setError('Camera permission denied or camera not found on this device.');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPhoto(dataUrl);
  };

  const handleConfirm = () => {
    if (photo && onCapture) {
      onCapture(photo);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#161922] border border-cyan-500/30 rounded-3xl shadow-2xl p-5 space-y-4 text-white">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <CameraIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">Device Camera</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : photo ? (
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
              <img src={photo} alt="Captured" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPhoto(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold cursor-pointer active:scale-95"
              >
                Retake Photo
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleCapturePhoto}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CameraIcon className="w-4 h-4" />
              <span>Capture Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
