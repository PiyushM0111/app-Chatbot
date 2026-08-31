import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ImageLightboxModal = ({ isOpen, onClose, imageUrl, alt = 'Generated Image' }) => {
  const [zoom, setZoom] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = async () => {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `nexus_art_${Date.now()}.png`;
      a.target = '_blank';
      a.click();
      showToast('Image download started!', 'success');
    } catch {
      showToast('Download failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity" onClick={onClose} />

      {/* Lightbox Container */}
      <div className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center z-10">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between p-3 mb-2 bg-zinc-950/80 rounded-2xl border border-white/10 backdrop-blur-md text-white">
          <span className="text-xs font-bold text-zinc-300 truncate max-w-xs sm:max-w-md">{alt}</span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 active:scale-95"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 active:scale-95"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 active:scale-95"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white active:scale-95 flex items-center gap-1 text-xs font-bold px-2.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scalable Image Canvas */}
        <div className="relative overflow-auto max-h-[80vh] w-full flex items-center justify-center p-2 rounded-3xl bg-zinc-950/60 border border-white/10 custom-chat-scroller">
          <img
            src={imageUrl}
            alt={alt}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageLightboxModal;
