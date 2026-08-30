import React, { useEffect, useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ImageLightboxModal = ({ isOpen, onClose, imageUrl, altText = 'Image Preview' }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      setZoomLevel(1);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nexus-ai-lightbox-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      showToast('Image downloaded!', 'success');
    } catch (e) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `nexus-ai-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 select-none animate-fadeIn">
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Floating Top Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
          className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
          className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleDownload}
          className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-lg"
          title="Download Image"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-lg"
          title="Close (ESC)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Image */}
      <div className="relative z-10 max-w-full max-h-full flex items-center justify-center p-2">
        <img
          src={imageUrl}
          alt={altText}
          style={{ transform: `scale(${zoomLevel})` }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-transform duration-200 border border-white/10 cursor-zoom-in"
          onClick={() => setZoomLevel(prev => prev === 1 ? 1.5 : 1)}
        />
      </div>
    </div>
  );
};

export default ImageLightboxModal;
