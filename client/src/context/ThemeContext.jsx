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
    tagline: 'Cosmic Intelligence',
    subtitle: 'Flagship Deep Space AI',
    description: 'Deep cosmic canvas with soft purple-blue nebula fields, floating stars, cosmic dust, and constellation dots.',
    bgBase: '#0B0E17',
    bgSurface: 'rgba(16, 24, 39, 0.85)',
    border: 'rgba(99, 102, 241, 0.28)',
    glow: 'rgba(139, 92, 246, 0.35)',
    paletteGradient: 'linear-gradient(135deg, #0B0E17 0%, #1E1035 50%, #0F172A 100%)',
    previewBadge: 'Cosmic Stars & Dust',
    primaryColor: '#8B5CF6',
    secondaryColor: '#38BDF8'
  },
  {
    id: 'cryon',
    name: 'CRYON',
    tagline: 'Frozen Digital World',
    subtitle: 'Crystalline Ice World',
    description: 'Deep glacial obsidian with floating translucent ice shards, crystalline diamond fragments, and cold blue refractions.',
    bgBase: '#030C16',
    bgSurface: 'rgba(7, 26, 44, 0.85)',
    border: 'rgba(56, 189, 248, 0.32)',
    glow: 'rgba(14, 165, 233, 0.38)',
    paletteGradient: 'linear-gradient(135deg, #030C16 0%, #082F49 50%, #0C4A6E 100%)',
    previewBadge: 'Ice Crystals & Shards',
    primaryColor: '#38BDF8',
    secondaryColor: '#E0F2FE'
  },
  {
    id: 'verdant',
    name: 'VERDANT',
    tagline: 'Living Intelligence',
    subtitle: 'Organic Bioluminescent Core',
    description: 'Deep forest canvas with floating organic leaves, glowing golden pollen spores, and gentle flowing biomorphic currents.',
    bgBase: '#04120A',
    bgSurface: 'rgba(6, 32, 18, 0.85)',
    border: 'rgba(16, 185, 129, 0.32)',
    glow: 'rgba(52, 211, 153, 0.35)',
    paletteGradient: 'linear-gradient(135deg, #04120A 0%, #064E3B 50%, #022C22 100%)',
    previewBadge: 'Organic Leaves & Spores',
    primaryColor: '#10B981',
    secondaryColor: '#F59E0B'
  },
  {
    id: 'inferno',
    name: 'INFERNO',
    tagline: 'Controlled Energy',
    subtitle: 'Kinetic Magma & Embers',
    description: 'Obsidian charcoal base with upward floating fiery embers, warm magma sparks, and subtle heat haze gradients.',
    bgBase: '#0C0605',
    bgSurface: 'rgba(36, 12, 10, 0.85)',
    border: 'rgba(239, 68, 68, 0.32)',
    glow: 'rgba(249, 115, 22, 0.38)',
    paletteGradient: 'linear-gradient(135deg, #0C0605 0%, #450A0A 50%, #7C2D12 100%)',
    previewBadge: 'Rising Embers & Sparks',
    primaryColor: '#F97316',
    secondaryColor: '#EF4444'
  },
  {
    id: 'eclipse',
    name: 'ECLIPSE',
    tagline: 'Celestial Contrast',
    subtitle: 'Orbital Rings & Gold Arcs',
    description: 'Pitch obsidian void illuminated by a subtle celestial eclipse corona, thin planetary orbital rings, and golden light arcs.',
    bgBase: '#050508',
    bgSurface: 'rgba(18, 16, 26, 0.90)',
    border: 'rgba(217, 119, 6, 0.30)',
    glow: 'rgba(234, 179, 8, 0.30)',
    paletteGradient: 'linear-gradient(135deg, #050508 0%, #18181B 50%, #27272A 100%)',
    previewBadge: 'Orbital Rings & Halo',
    primaryColor: '#EAB308',
    secondaryColor: '#A855F7'
  },
  {
    id: 'ethereal',
    name: 'ETHEREAL',
    tagline: 'Dreamlike Digital Space',
    subtitle: 'Floating Clouds & Light Orbs',
    description: 'Dreamy midnight indigo with translucent atmospheric clouds, glowing light orbs, pearl reflections, and soft luminous ribbons.',
    bgBase: '#080A18',
    bgSurface: 'rgba(23, 21, 46, 0.85)',
    border: 'rgba(192, 132, 252, 0.30)',
    glow: 'rgba(232, 121, 249, 0.35)',
    paletteGradient: 'linear-gradient(135deg, #080A18 0%, #2E1065 50%, #3B0764 100%)',
    previewBadge: 'Luminous Clouds & Orbs',
    primaryColor: '#C084FC',
    secondaryColor: '#F472B6'
  }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('nexus_theme_preset');
    if (saved && THEME_PRESETS.some(t => t.id === saved)) return saved;
    // Map legacy names to new visual identities
    if (saved === 'midnight') return 'nebula';
    if (saved === 'daylight' || saved === 'light') return 'cryon';
    if (saved === 'aurora') return 'ethereal';
    if (saved === 'void' || saved === 'amoled') return 'eclipse';
    return 'nebula';
  });

  const [intensity, setIntensityState] = useState(() => {
    return localStorage.getItem('nexus_atmosphere_intensity') || 'balanced';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem('nexus_accent_color') || '#A855F7';
  });

  const currentThemePreset = THEME_PRESETS.find(t => t.id === theme) || THEME_PRESETS[0];

  const setTheme = (newThemeId) => {
    setThemeState(newThemeId);
    localStorage.setItem('nexus_theme_preset', newThemeId);
  };

  const setIntensity = (newIntensity) => {
    setIntensityState(newIntensity);
    localStorage.setItem('nexus_atmosphere_intensity', newIntensity);
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
      'theme-cryon',
      'theme-verdant',
      'theme-inferno',
      'theme-eclipse',
      'theme-ethereal',
      'theme-daylight',
      'theme-aurora',
      'theme-void',
      'theme-midnight',
      'theme-light',
      'theme-amoled'
    );

    // Apply active theme class & dark mode
    root.classList.add(`theme-${theme}`);
    root.classList.add('dark');

    // Set CSS custom properties
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--theme-bg-base', currentThemePreset.bgBase);
    root.style.setProperty('--theme-bg-surface', currentThemePreset.bgSurface);
    root.style.setProperty('--theme-border', currentThemePreset.border);
    root.style.setProperty('--theme-glow', currentThemePreset.glow);
    root.style.setProperty('--theme-primary', currentThemePreset.primaryColor);
    root.style.setProperty('--theme-secondary', currentThemePreset.secondaryColor);

  }, [theme, accentColor, currentThemePreset]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        intensity,
        setIntensity,
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
