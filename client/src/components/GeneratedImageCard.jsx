import React, { useState } from 'react';
import { Download, Maximize2, RotateCcw, Edit3, Info, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const GeneratedImageCard = ({
  attachment,
  onOpenLightbox,
  onEditImage,
  onRegenerateImage
}) => {
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const imageUrl = attachment.url || attachment.data;
  const subject = attachment.subject || attachment.alt || 'AI Generated Image';
  const altText = attachment.alt || `Generated image of ${subject}`;
  const parameters = attachment.parameters || {};
  const aspectRatio = attachment.aspectRatio || parameters.aspectRatio || '1:1';

  // Get aspect ratio CSS class
  const getAspectClass = (ar) => {
    switch (ar) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      default: return 'aspect-square';
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!imageUrl) return;

    setIsDownloading(true);
    const ext = attachment.mimeType === 'image/jpeg' ? 'jpg' : attachment.mimeType === 'image/webp' ? 'webp' : 'png';
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const cleanSlug = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const filename = `nexus-ai-${cleanSlug || 'image'}-${Date.now()}.${ext}`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showToast('Image downloaded successfully!', 'success');
    } catch (err) {
      // Direct anchor download fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `nexus-ai-${Date.now()}.${ext}`;
      link.click();
      showToast('Opening image download...', 'info');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoading(true);
  };

  if (!imageUrl) return null;

  return (
    <div className="relative my-2.5 w-full max-w-[480px] rounded-3xl overflow-hidden bg-zinc-900/90 border border-black/10 dark:border-white/15 shadow-xl transition-all duration-300 group">
      {/* Visual Image Container */}
      <div
        onClick={() => onOpenLightbox && onOpenLightbox(imageUrl, altText)}
        className={`relative w-full ${getAspectClass(aspectRatio)} overflow-hidden bg-zinc-950 cursor-pointer flex items-center justify-center`}
      >
        {/* Loading Shimmer */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 animate-spin text-purple-400 opacity-60" />
            <span className="text-xs text-zinc-400 font-medium">Rendering visual...</span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900/95 text-zinc-400 gap-3">
            <AlertCircle className="w-8 h-8 text-amber-500 opacity-80" />
            <div>
              <p className="text-xs font-semibold text-zinc-300">Image couldn't be loaded</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Network connection issue or provider timeout</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={altText}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Desktop Floating Action Bar on Hover */}
        {!hasError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 pointer-events-none">
            <div className="flex justify-end">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                {aspectRatio}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox && onOpenLightbox(imageUrl, altText);
                }}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-transform hover:scale-110 shadow-lg border border-white/15"
                title="Fullscreen Preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-transform hover:scale-110 shadow-lg border border-white/15 disabled:opacity-50"
                title="Download High-Res Image"
              >
                <Download className="w-4 h-4" />
              </button>

              {onEditImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditImage(subject);
                  }}
                  className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-transform hover:scale-110 shadow-lg border border-white/15"
                  title="Modify / Edit Image"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              {onRegenerateImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerateImage(subject);
                  }}
                  className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-transform hover:scale-110 shadow-lg border border-white/15"
                  title="Generate Variation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Controls (Touch-Friendly for Mobile & Desktop) */}
      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="truncate flex-1">
          <p className="text-xs font-semibold text-zinc-200 truncate" title={subject}>
            {subject}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[11px] font-semibold text-zinc-200 flex items-center gap-1 transition-all border border-white/10"
            title="Download Image"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>

          {onEditImage && (
            <button
              type="button"
              onClick={() => onEditImage(subject)}
              className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[11px] font-semibold text-zinc-200 flex items-center gap-1 transition-all border border-white/10"
              title="Edit Image"
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {onRegenerateImage && (
            <button
              type="button"
              onClick={() => onRegenerateImage(subject)}
              className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[11px] font-semibold text-zinc-200 flex items-center gap-1 transition-all border border-white/10"
              title="Variation"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Variation</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className={`p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors ${
              showDetails ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'hover:bg-zinc-800'
            }`}
            title="Technical Info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Technical Details (Hidden by Default) */}
      {showDetails && (
        <div className="px-3.5 py-3 bg-zinc-950 border-t border-white/10 text-[11px] text-zinc-400 space-y-1.5 animate-fadeIn">
          {attachment.generationId && (
            <div className="flex justify-between">
              <span className="text-zinc-500">ID:</span>
              <span className="text-zinc-400 font-mono text-[10px]">{attachment.generationId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">Style:</span>
            <span className="text-zinc-300 font-medium">{attachment.style || parameters.style || 'Photorealistic'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Lighting:</span>
            <span className="text-zinc-300 font-medium truncate max-w-[240px]">{attachment.lighting || parameters.lighting || 'Cinematic'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Aspect Ratio:</span>
            <span className="text-zinc-300 font-medium">{aspectRatio}</span>
          </div>
          {parameters.resolution && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Resolution:</span>
              <span className="text-zinc-300 font-medium">{parameters.resolution}</span>
            </div>
          )}
          {attachment.prompt && (
            <div className="pt-1 border-t border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">Prompt:</span>
              <p className="text-[10px] text-zinc-300 font-mono bg-zinc-900/80 p-2 rounded-lg border border-white/5 whitespace-pre-wrap">
                {attachment.prompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratedImageCard;
