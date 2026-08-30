import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ACCENT_PALETTES = [
  { name: 'Lavender Neon', value: '#A855F7', glow: 'rgba(168, 85, 247, 0.25)', label: 'Lavender' },
  { name: 'Cyberpunk Sky', value: '#38BDF8', glow: 'rgba(56, 189, 248, 0.25)', label: 'Cyberpunk' },
  { name: 'Emerald Matrix', value: '#10B981', glow: 'rgba(16, 185, 129, 0.25)', label: 'Emerald' },
  { name: 'Sunset Rose', value: '#F43F5E', glow: 'rgba(244, 63, 94, 0.25)', label: 'Sunset' },
  { name: 'Amber Gold', value: '#F59E0B', glow: 'rgba(245, 158, 11, 0.25)', label: 'Amber' },
  { name: 'Neon Pink', value: '#EC4899', glow: 'rgba(236, 72, 153, 0.25)', label: 'Neon' },
];

export const THEME_PRESETS = [
  {
    id: 'nebula',
    name: 'NEBULA',
    tagline: 'Futuristic Deep-Space AI',
    description: 'Deep cosmic canvas with soft purple-blue atmospheric lighting and starry particle depth.',
    bgBase: '#0B0E17',
    bgSurface: 'rgba(16, 24, 39, 0.85)',
    border: 'rgba(99, 102, 241, 0.25)',
    glow: 'rgba(139, 92, 246, 0.3)',
    type: 'dark',
    paletteGradient: 'linear-gradient(135deg, #0B0E17 0%, #1E1035 50%, #0F172A 100%)',
    chipGradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
  },
  {
    id: 'daylight',
    name: 'DAYLIGHT',
    tagline: 'Clean & Calm Productivity',
    description: 'Warm white and soft neutral canvas with crisp readable typography and delicate shadows.',
    bgBase: '#F8FAFC',
    bgSurface: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(226, 232, 240, 0.9)',
    glow: 'rgba(56, 189, 248, 0.1)',
    type: 'light',
    paletteGradient: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
    chipGradient: 'linear-gradient(135deg, #0284C7, #38BDF8)'
  },
  {
    id: 'aurora',
    name: 'AURORA',
    tagline: 'Luminous Glassmorphism',
    description: 'Deep emerald, cyan, and violet atmospheric aurora fields with translucent glass panels.',
    bgBase: '#06131A',
    bgSurface: 'rgba(12, 27, 36, 0.75)',
    border: 'rgba(45, 212, 191, 0.3)',
    glow: 'rgba(16, 185, 129, 0.35)',
    type: 'dark',
    paletteGradient: 'linear-gradient(135deg, #06131A 0%, #0D282E 50%, #161F38 100%)',
    chipGradient: 'linear-gradient(135deg, #10B981, #06B6D4)'
  },
  {
    id: 'void',
    name: 'VOID',
    tagline: 'Ultra-Black OLED Minimal',
    description: 'Pure pitch-black zero-distraction workspace with high contrast and sharp minimal contours.',
    bgBase: '#000000',
    bgSurface: 'rgba(10, 10, 10, 0.95)',
    border: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(255, 255, 255, 0.08)',
    type: 'dark',
    paletteGradient: 'linear-gradient(135deg, #000000 0%, #080808 50%, #121212 100%)',
    chipGradient: 'linear-gradient(135deg, #F59E0B, #EF4444)'
  }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('nexus_theme_preset');
    if (saved && THEME_PRESETS.some(t => t.id === saved)) return saved;
    // Map legacy names to new identities
    if (saved === 'midnight') return 'nebula';
    if (saved === 'light') return 'daylight';
    if (saved === 'aurora') return 'aurora';
    if (saved === 'amoled') return 'void';
    return 'nebula';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem('nexus_accent_color') || '#A855F7';
  });

  const currentThemePreset = THEME_PRESETS.find(t => t.id === theme) || THEME_PRESETS[0];

  const setTheme = (newThemeId) => {
    setThemeState(newThemeId);
    localStorage.setItem('nexus_theme_preset', newThemeId);
  };

  const setAccentColor = (newColor) => {
    setAccentColorState(newColor);
    localStorage.setItem('nexus_accent_color', newColor);
  };

  // Sync theme classes & CSS variables on root HTML element
  useEffect(() => {
    const root = document.documentElement;

    // Remove old classes
    root.classList.remove(
      'theme-nebula',
      'theme-daylight',
      'theme-aurora',
      'theme-void',
      'theme-midnight',
      'theme-light',
      'theme-amoled',
      'dark'
    );

    // Apply active theme class
    root.classList.add(`theme-${theme}`);

    if (currentThemePreset.type === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    // Set CSS custom properties
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--theme-bg-base', currentThemePreset.bgBase);
    root.style.setProperty('--theme-bg-surface', currentThemePreset.bgSurface);
    root.style.setProperty('--theme-border', currentThemePreset.border);
    root.style.setProperty('--theme-glow', currentThemePreset.glow);

  }, [theme, accentColor, currentThemePreset]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemePreset,
        accentColor,
        setAccentColor,
        ACCENT_PALETTES,
        THEME_PRESETS
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
