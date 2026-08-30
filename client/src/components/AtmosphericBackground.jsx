import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const AtmosphericBackground = () => {
  const { theme, accentColor } = useTheme();

  // Generate lightweight static stars/particles
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 17 + 23) % 100}%`,
      top: `${(i * 29 + 11) % 100}%`,
      size: (i % 3) + 1.5,
      delay: `${(i % 5) * 1.5}s`,
      duration: `${6 + (i % 4) * 2}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700">
      {/* LAYER 1 & 2: THEME-SPECIFIC AMBIENT LIGHT FIELDS */}
      {theme === 'nebula' && (
        <>
          <div
            className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[140px] opacity-40 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #6366F1 0%, rgba(139, 92, 246, 0.4) 60%, transparent 100%)' }}
          />
          <div
            className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-35 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #A855F7 0%, rgba(59, 130, 246, 0.3) 70%, transparent 100%)', animationDelay: '3s' }}
          />
          <div
            className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, rgba(168, 85, 247, 0.2) 60%, transparent 100%)', animationDelay: '5s' }}
          />
        </>
      )}

      {theme === 'aurora' && (
        <>
          <div
            className="absolute -top-40 left-10 w-[700px] h-[500px] rounded-full blur-[150px] opacity-45 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #10B981 0%, rgba(6, 182, 212, 0.4) 50%, transparent 100%)' }}
          />
          <div
            className="absolute top-1/2 -right-40 w-[650px] h-[650px] rounded-full blur-[170px] opacity-40 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #06B6D4 0%, rgba(139, 92, 246, 0.35) 60%, transparent 100%)', animationDelay: '4s' }}
          />
          <div
            className="absolute -bottom-40 left-1/3 w-[600px] h-[500px] rounded-full blur-[160px] opacity-35 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #8B5CF6 0%, rgba(16, 185, 129, 0.25) 60%, transparent 100%)', animationDelay: '2s' }}
          />
        </>
      )}

      {theme === 'daylight' && (
        <>
          <div
            className="absolute -top-32 right-10 w-[500px] h-[500px] rounded-full blur-[140px] opacity-60"
            style={{ background: 'radial-gradient(circle, #E0F2FE 0%, #F0F9FF 60%, transparent 100%)' }}
          />
          <div
            className="absolute bottom-10 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] opacity-50"
            style={{ background: 'radial-gradient(circle, #F1F5F9 0%, #E2E8F0 60%, transparent 100%)' }}
          />
        </>
      )}

      {theme === 'void' && (
        <>
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] opacity-10"
            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 80%)` }}
          />
        </>
      )}

      {/* LAYER 3: FLOATING MICRO-PARTICLES (Cosmic Stars / Aurora Specs) */}
      {(theme === 'nebula' || theme === 'aurora') && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-float-slow"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: theme === 'aurora' ? '#2DD4BF' : '#C084FC',
                opacity: (p.size / 4) * 0.6,
                boxShadow: `0 0 6px ${theme === 'aurora' ? '#2DD4BF' : '#A855F7'}`,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AtmosphericBackground;
