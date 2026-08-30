import React, { useState, useEffect } from 'react';
import { Image, Sparkles, X, Download, Trash2, Maximize2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)' },
  { id: '16:9', label: 'Landscape (16:9)' },
  { id: '9:16', label: 'Portrait (9:16)' },
  { id: '4:3', label: 'Standard (4:3)' },
];

const STYLE_PRESETS = [
  'Cinematic Photorealistic',
  'Cyberpunk Sci-Fi 3D',
  'Studio Ghibli Anime',
  'Digital Oil Painting',
  'Octane 3D Render',
  'Clean Minimalist Vector'
];

const ImageGalleryModal = ({ isOpen, onClose, onInsertImagePrompt }) => {
  const { token } = useAuth();
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Photorealistic');
  const [generating, setGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchImages = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/images', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (e) {
      console.error('Error fetching image gallery:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchImages();
  }, [isOpen, token]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: `${prompt.trim()} in ${selectedStyle} style, ${aspectRatio} aspect ratio`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setImages(prev => [data.image, ...prev]);
        showToast('Image generated successfully!', 'success');
        setPrompt('');
      }
    } catch (err) {
      showToast('Failed to generate image.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
        if (previewImage?.id === id) setPreviewImage(null);
        showToast('Image deleted.', 'info');
      }
    } catch (e) {
      showToast('Failed to delete image.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[88vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">AI Image Studio & Gallery</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate, view, and iterate on multimodal visual concepts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generator Controls */}
        <form onSubmit={handleGenerate} className="py-3 space-y-2.5 flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Describe your visual concept (e.g. A cybernetic owl perching in a neon Tokyo skyline)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-900 shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Rendering...' : 'Generate'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Aspect Ratio */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all ${
                    aspectRatio === ar.id ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  {ar.id}
                </button>
              ))}
            </div>

            {/* Style selector */}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 focus:outline-none"
            >
              {STYLE_PRESETS.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </form>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1 custom-chat-scroller">
          {loading ? (
            <div className="text-center py-16 text-xs text-zinc-400">Loading image gallery...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-400">
              No generated images yet. Type a prompt above or ask in chat!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 shadow-sm hover:shadow-xl transition-all">
                  <div className="aspect-square w-full overflow-hidden cursor-pointer" onClick={() => setPreviewImage(img)}>
                    <img src={img.image_url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate" title={img.prompt}>
                      {img.prompt}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span>{new Date(img.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="p-1 hover:text-red-500 rounded transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen Lightbox Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full flex flex-col items-center">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-zinc-300 p-2"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={previewImage.image_url} alt={previewImage.prompt} className="max-h-[70vh] rounded-2xl shadow-2xl object-contain" />
              <p className="text-xs text-white/90 text-center mt-3 max-w-md">{previewImage.prompt}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;
