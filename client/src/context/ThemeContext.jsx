import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ACCENT_PALETTES = [
  { name: 'Lavender Neon', value: '#A855F7', bgGlow: 'rgba(168, 85, 247, 0.15)' },
  { name: 'Cyberpunk Sky', value: '#38BDF8', bgGlow: 'rgba(56, 189, 248, 0.15)' },
  { name: 'Emerald Matrix', value: '#10B981', bgGlow: 'rgba(16, 185, 129, 0.15)' },
  { name: 'Sunset Rose', value: '#F43F5E', bgGlow: 'rgba(244, 63, 94, 0.15)' },
  { name: 'Amber Gold', value: '#F59E0B', bgGlow: 'rgba(245, 158, 11, 0.15)' },
  { name: 'Neon Pink', value: '#EC4899', bgGlow: 'rgba(236, 72, 153, 0.15)' },
];

export const THEME_PRESETS = [
  { id: 'midnight', label: 'Midnight Dark', desc: 'Deep obsidian panels with soft contrast and subtle lighting' },
  { id: 'light', label: 'Clean Light', desc: 'Soft off-white canvas with dark readable typography' },
  { id: 'aurora', label: 'Aurora Glass', desc: 'Futuristic glass-like panels with cosmic ambient glow' },
  { id: 'amoled', label: 'AMOLED Black', desc: 'True pitch-black background optimized for OLED displays' },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('nexus_theme_preset') || 'midnight';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem('nexus_accent_color') || '#A855F7';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('nexus_theme_preset', newTheme);
  };

  const setAccentColor = (newColor) => {
    setAccentColorState(newColor);
    localStorage.setItem('nexus_accent_color', newColor);
  };

  // Sync theme classes & CSS variables on root HTML element
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('theme-midnight', 'theme-light', 'theme-aurora', 'theme-amoled', 'dark');

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('theme-light');
    } else {
      root.classList.add('dark');
      root.classList.add(`theme-${theme}`);
    }

    // Set accent color CSS variable
    root.style.setProperty('--accent-color', accentColor);
  }, [theme, accentColor]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
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
