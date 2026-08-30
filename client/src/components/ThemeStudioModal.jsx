import React from 'react';
import { X, Sparkles, Check, Palette, Eye, Sun, Moon, Layers, Zap } from 'lucide-react';
import { useTheme, THEME_PRESETS, ACCENT_PALETTES } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const ThemeStudioModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSelectTheme = (themeId, name) => {
    setTheme(themeId);
    showToast(`Atmosphere switched to ${name}`, 'success');
  };

  const handleSelectAccent = (color, name) => {
    setAccentColor(color);
    showToast(`Accent highlight: ${name}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      {/* Dark Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Main Studio Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950/95 text-white rounded-3xl border border-white/15 shadow-2xl p-5 sm:p-8 z-10 custom-chat-scroller">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Studio Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Identity System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Theme Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Choose the atmosphere that feels right for you. Entire lighting, surfaces, and particles transform dynamically.
          </p>
        </div>

        {/* 4 VISUAL IDENTITY THEME CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {THEME_PRESETS.map((t) => {
            const isSelected = theme === t.id;

            return (
              <div
                key={t.id}
                onClick={() => handleSelectTheme(t.id, t.name)}
                className={`relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-400/80 bg-zinc-900/90 shadow-2xl shadow-purple-500/15 ring-2 ring-purple-500/40'
                    : 'border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/20'
                }`}
              >
                {/* Active Atmosphere Badge */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Active Atmosphere</span>
                  </div>
                )}

                {/* MINIATURE LIVE UI PREVIEW WINDOW */}
                <div
                  className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden mb-4 p-3 relative flex flex-col justify-between border border-white/10 shadow-inner"
                  style={{ background: t.paletteGradient }}
                >
                  {/* Mini Navbar */}
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[7px] font-bold text-black" style={{ background: accentColor }}>
                        N
                      </div>
                      <span className={`text-[10px] font-bold ${t.type === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                        Nexus AI
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                  </div>

                  {/* Mini Chat Bubbles */}
                  <div className="space-y-1.5 my-auto">
                    <div className="flex justify-end">
                      <div className="px-2.5 py-1 rounded-xl text-[9px] font-medium bg-zinc-800 text-zinc-200 border border-white/10 shadow-sm max-w-[70%]">
                        Explain quantum computing
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div
                        className="px-2.5 py-1 rounded-xl text-[9px] font-medium shadow-sm max-w-[80%]"
                        style={{
                          background: t.bgSurface,
                          color: t.type === 'light' ? '#0F172A' : '#F8FAFC',
                          borderColor: t.border,
                          borderWidth: '1px'
                        }}
                      >
                        Quantum bits leverage superposition...
                      </div>
                    </div>
                  </div>

                  {/* Mini Action Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[8px] font-semibold opacity-60 uppercase tracking-wider" style={{ color: t.type === 'light' ? '#0F172A' : '#F8FAFC' }}>
                      {t.name} Atmosphere
                    </span>
                    <div className="w-12 h-2 rounded-full opacity-60" style={{ background: t.chipGradient }} />
                  </div>
                </div>

                {/* Theme Info & Action */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      {t.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {t.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {t.description}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTheme(t.id, t.name);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Apply Atmosphere</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACCENT PALETTE CUSTOMIZATION SECTION */}
        <div className="pt-6 border-t border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-left">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Interactive Accent Highlight</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Customizes interactive buttons, badge highlights, and active glowing borders across any atmosphere.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500 uppercase">
              Selected: <strong className="text-purple-300">{accentColor}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {ACCENT_PALETTES.map((acc) => {
              const isAccSelected = accentColor.toLowerCase() === acc.value.toLowerCase();

              return (
                <button
                  key={acc.value}
                  type="button"
                  onClick={() => handleSelectAccent(acc.value, acc.label)}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-2.5 ${
                    isAccSelected
                      ? 'border-purple-400 bg-zinc-900 shadow-md ring-2 ring-purple-500/30'
                      : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-900 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: acc.value, boxShadow: `0 0 10px ${acc.value}` }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">
                      {acc.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeStudioModal;
