import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const { accentColor } = useTheme();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Premium Floating Celestial Nebulae (Soft, calming, organic aura gradients)
    const nebulae = [
      { x: width * 0.2, y: height * 0.25, baseRadius: 360, vx: 0.18, vy: 0.12, color: accentColor, pulse: 0 },
      { x: width * 0.8, y: height * 0.35, baseRadius: 400, vx: -0.15, vy: -0.14, color: '#38BDF8', pulse: 2.3 },
      { x: width * 0.45, y: height * 0.75, baseRadius: 440, vx: 0.12, vy: -0.12, color: '#A855F7', pulse: 4.1 },
      { x: width * 0.85, y: height * 0.85, baseRadius: 320, vx: -0.14, vy: 0.16, color: '#F472B6', pulse: 1.2 },
    ];

    // Gentle Drifting Cosmic Starlight Embers
    const starCount = Math.min(Math.floor((width * height) / 32000), 28);
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.8,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.02,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.12 - Math.random() * 0.18, // gentle upward drift
        color: i % 3 === 0 ? accentColor : (i % 3 === 1 ? '#38BDF8' : '#C084FC')
      });
    }

    let time = 0;

    const render = () => {
      time += 0.007; // Serene, relaxing speed

      // Smooth lag-free mouse/touch interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Deep Ethereal Breathing Aurora Clouds
      nebulae.forEach((n) => {
        n.pulse += 0.008;
        n.x += n.vx;
        n.y += n.vy;

        // Smooth boundary wrapping
        if (n.x < -120) n.x = width + 120;
        if (n.x > width + 120) n.x = -120;
        if (n.y < -120) n.y = height + 120;
        if (n.y > height + 120) n.y = -120;

        const currentRadius = n.baseRadius + Math.sin(n.pulse) * 35;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, currentRadius);
        grad.addColorStop(0, `${n.color}22`); // ~13% soft glow
        grad.addColorStop(0.45, `${n.color}0c`); // ~5% aura
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Interactive Soft Ambient Cursor/Touch Halo
      const haloRadius = Math.min(width * 0.4, 280);
      const haloGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, haloRadius);
      haloGrad.addColorStop(0, `${accentColor}1c`);
      haloGrad.addColorStop(0.5, `${accentColor}06`);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Gentle Floating Cosmic Sparks
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.twinkle += star.twinkleSpeed;

        if (star.y < -10) star.y = height + 10;
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;

        const opacity = 0.25 + Math.sin(star.twinkle) * 0.25;

        // Star core
        ctx.fillStyle = `${star.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle star glow
        if (opacity > 0.35) {
          ctx.fillStyle = `${star.color}33`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [accentColor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle modern cybernetic dot matrix grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #8b5cf6 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default AnimatedBackground;
