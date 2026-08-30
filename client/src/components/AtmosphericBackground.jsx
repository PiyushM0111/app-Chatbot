import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AtmosphericBackground = () => {
  const { theme, intensity, accentColor } = useTheme();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const animFrameRef = useRef(null);

  // Track mouse coordinates smoothly
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouseRef.current.targetX = e.touches[0].clientX;
        mouseRef.current.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Theme Canvas Particle & Entity Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle multiplier based on intensity
    let countMultiplier = 1;
    if (intensity === 'calm') countMultiplier = 0.5;
    if (intensity === 'immersive') countMultiplier = 1.6;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize Theme-Specific Entities
    const entities = [];

    if (theme === 'nebula') {
      // 1. NEBULA: Cosmic Stars, Dust, Constellations
      const count = Math.floor(48 * countMultiplier);
      for (let i = 0; i < count; i++) {
        entities.push({
          type: 'star',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleDir: 1,
          color: i % 4 === 0 ? '#38BDF8' : i % 3 === 0 ? '#A855F7' : '#FFFFFF'
        });
      }
    } else if (theme === 'cryon') {
      // 2. CRYON: Translucent Ice Crystals & Shards
      const count = Math.floor(32 * countMultiplier);
      for (let i = 0; i < count; i++) {
        entities.push({
          type: 'crystal',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2 + 0.1,
          size: Math.random() * 12 + 6,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.015,
          alpha: Math.random() * 0.4 + 0.2,
          points: 4 + (i % 3) * 2 // diamond / hex ice shards
        });
      }
    } else if (theme === 'verdant') {
      // 3. VERDANT: Floating Leaves & Glowing Pollen Spores
      const count = Math.floor(40 * countMultiplier);
      for (let i = 0; i < count; i++) {
        const isLeaf = i % 3 === 0;
        entities.push({
          type: isLeaf ? 'leaf' : 'spore',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 + 0.15,
          size: isLeaf ? Math.random() * 7 + 4 : Math.random() * 3 + 1.5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          alpha: Math.random() * 0.6 + 0.2,
          color: isLeaf ? '#10B981' : '#F59E0B'
        });
      }
    } else if (theme === 'inferno') {
      // 4. INFERNO: Upward Rising Embers & Sparks
      const count = Math.floor(45 * countMultiplier);
      for (let i = 0; i < count; i++) {
        entities.push({
          type: 'ember',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(Math.random() * 0.8 + 0.4), // Upward float
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.005 + 0.002,
          color: i % 2 === 0 ? '#F97316' : '#EF4444'
        });
      }
    } else if (theme === 'eclipse') {
      // 5. ECLIPSE: Orbital Particles & Rings
      const count = Math.floor(36 * countMultiplier);
      const centerX = width / 2;
      const centerY = height / 2;
      for (let i = 0; i < count; i++) {
        const orbitRadius = 120 + (i % 6) * 70 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        entities.push({
          type: 'orbit_particle',
          orbitRadius,
          angle,
          speed: (0.002 + (i % 4) * 0.001) * (i % 2 === 0 ? 1 : -1),
          size: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.7 + 0.2,
          color: i % 3 === 0 ? '#EAB308' : '#FFFFFF'
        });
      }
    } else if (theme === 'ethereal') {
      // 6. ETHEREAL: Floating Translucent Spheres & Clouds
      const count = Math.floor(24 * countMultiplier);
      for (let i = 0; i < count; i++) {
        entities.push({
          type: 'sphere',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 35 + 15,
          alpha: Math.random() * 0.18 + 0.06,
          color: i % 2 === 0 ? '#C084FC' : '#F472B6'
        });
      }
    }

    // Main Canvas Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. NEBULA RENDER
      if (theme === 'nebula') {
        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          if (!prefersReducedMotion) {
            e.x += e.vx;
            e.y += e.vy;
            if (e.x < 0) e.x = width;
            if (e.x > width) e.x = 0;
            if (e.y < 0) e.y = height;
            if (e.y > height) e.y = 0;

            // Twinkle
            e.alpha += e.twinkleSpeed * e.twinkleDir;
            if (e.alpha > 0.95) e.twinkleDir = -1;
            if (e.alpha < 0.25) e.twinkleDir = 1;

            // Pointer Repel
            const dx = e.x - mx;
            const dy = e.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
              const force = (120 - dist) / 120;
              e.x += (dx / dist) * force * 3;
              e.y += (dy / dist) * force * 3;
            }
          }

          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.globalAlpha = e.alpha;
          ctx.fill();
        }
      }

      // 2. CRYON RENDER (Crystalline Diamond Shards)
      else if (theme === 'cryon') {
        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          if (!prefersReducedMotion) {
            e.x += e.vx;
            e.y += e.vy;
            e.rotation += e.rotSpeed;
            if (e.x < -20) e.x = width + 20;
            if (e.x > width + 20) e.x = -20;
            if (e.y < -20) e.y = height + 20;
            if (e.y > height + 20) e.y = -20;

            // Pointer Crystal Separation & Spin
            const dx = e.x - mx;
            const dy = e.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140 && dist > 0) {
              const force = (140 - dist) / 140;
              e.x += (dx / dist) * force * 2.5;
              e.y += (dy / dist) * force * 2.5;
              e.rotation += force * 0.04;
            }
          }

          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(e.rotation);
          ctx.beginPath();
          // Draw diamond shard
          ctx.moveTo(0, -e.size);
          ctx.lineTo(e.size * 0.6, 0);
          ctx.lineTo(0, e.size);
          ctx.lineTo(-e.size * 0.6, 0);
          ctx.closePath();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
          ctx.lineWidth = 1;
          ctx.globalAlpha = e.alpha;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      // 3. VERDANT RENDER (Leaves & Pollen Spores)
      else if (theme === 'verdant') {
        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          if (!prefersReducedMotion) {
            e.x += e.vx;
            e.y += e.vy;
            e.rotation += e.rotSpeed;
            if (e.x < 0) e.x = width;
            if (e.x > width) e.x = 0;
            if (e.y < 0) e.y = height;
            if (e.y > height) e.y = 0;

            // Pointer Organic Swirl
            const dx = e.x - mx;
            const dy = e.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130 && dist > 0) {
              const force = (130 - dist) / 130;
              e.x += -dy * force * 0.05;
              e.y += dx * force * 0.05;
            }
          }

          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(e.rotation);
          ctx.globalAlpha = e.alpha;

          if (e.type === 'leaf') {
            // Draw organic curved leaf
            ctx.beginPath();
            ctx.ellipse(0, 0, e.size, e.size * 0.45, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();
          } else {
            // Spore
            ctx.beginPath();
            ctx.arc(0, 0, e.size, 0, Math.PI * 2);
            ctx.fillStyle = '#F59E0B';
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 6;
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 4. INFERNO RENDER (Upward Rising Embers)
      else if (theme === 'inferno') {
        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          if (!prefersReducedMotion) {
            e.x += e.vx;
            e.y += e.vy;
            if (e.y < 0) {
              e.y = height;
              e.x = Math.random() * width;
            }
            if (e.x < 0) e.x = width;
            if (e.x > width) e.x = 0;

            // Pointer Scatter
            const dx = e.x - mx;
            const dy = e.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
              const force = (120 - dist) / 120;
              e.x += (dx / dist) * force * 3;
              e.y += (dy / dist) * force * 3;
            }
          }

          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = e.alpha;
          ctx.fill();
        }
      }

      // 5. ECLIPSE RENDER (Orbital Halo & Planetary Rings)
      else if (theme === 'eclipse') {
        const cx = width / 2;
        const cy = height / 2;

        // Draw Center Corona Glow
        const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 260);
        grad.addColorStop(0, 'rgba(234, 179, 8, 0.15)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 260, cy - 260, 520, 520);

        // Draw Thin Orbital Rings
        const rings = [140, 220, 310, 420];
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        for (const r of rings) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Orbiting Celestial Dots
        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          if (!prefersReducedMotion) {
            e.angle += e.speed;
          }
          const px = cx + Math.cos(e.angle) * e.orbitRadius;
          const py = cy + Math.sin(e.angle) * e.orbitRadius;

          ctx.beginPath();
          ctx.arc(px, py, e.size, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 5;
          ctx.globalAlpha = e.alpha;
          ctx.fill();
        }
      }

      // 6. ETHEREAL RENDER (Luminous Floating Spheres)
      else if (theme === 'ethereal') {
        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          if (!prefersReducedMotion) {
            e.x += e.vx;
            e.y += e.vy;
            if (e.x < -e.size) e.x = width + e.size;
            if (e.x > width + e.size) e.x = -e.size;
            if (e.y < -e.size) e.y = height + e.size;
            if (e.y > height + e.size) e.y = -e.size;

            // Pointer Soft Shift
            const dx = e.x - mx;
            const dy = e.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160 && dist > 0) {
              const force = (160 - dist) / 160;
              e.x += (dx / dist) * force * 1.5;
              e.y += (dy / dist) * force * 1.5;
            }
          }

          const sphereGrad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size);
          sphereGrad.addColorStop(0, e.color);
          sphereGrad.addColorStop(0.7, 'rgba(192, 132, 252, 0.2)');
          sphereGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.globalAlpha = e.alpha;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700">
      {/* LAYER 1: CSS RADIAL AMBIENT LIGHT FIELDS (Theme-Aware Atmosphere) */}
      {theme === 'nebula' && (
        <>
          <div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-45 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #6366F1 0%, rgba(139, 92, 246, 0.4) 60%, transparent 100%)' }}
          />
          <div
            className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full blur-[160px] opacity-40 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #A855F7 0%, rgba(59, 130, 246, 0.3) 70%, transparent 100%)', animationDelay: '3s' }}
          />
        </>
      )}

      {theme === 'cryon' && (
        <>
          <div
            className="absolute -top-40 left-10 w-[700px] h-[550px] rounded-full blur-[150px] opacity-45 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #0284C7 0%, rgba(56, 189, 248, 0.35) 50%, transparent 100%)' }}
          />
          <div
            className="absolute bottom-10 -right-32 w-[650px] h-[650px] rounded-full blur-[160px] opacity-35 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #0EA5E9 0%, rgba(224, 242, 254, 0.2) 60%, transparent 100%)', animationDelay: '4s' }}
          />
        </>
      )}

      {theme === 'verdant' && (
        <>
          <div
            className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] opacity-40 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #059669 0%, rgba(16, 185, 129, 0.3) 60%, transparent 100%)' }}
          />
          <div
            className="absolute top-1/2 -right-40 w-[650px] h-[650px] rounded-full blur-[170px] opacity-35 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #10B981 0%, rgba(245, 158, 11, 0.2) 60%, transparent 100%)', animationDelay: '3s' }}
          />
        </>
      )}

      {theme === 'inferno' && (
        <>
          <div
            className="absolute -top-32 right-10 w-[600px] h-[600px] rounded-full blur-[150px] opacity-40 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(circle, #DC2626 0%, rgba(249, 115, 22, 0.35) 60%, transparent 100%)' }}
          />
          <div
            className="absolute bottom-0 -left-20 w-[700px] h-[500px] rounded-full blur-[160px] opacity-45 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #EA580C 0%, rgba(239, 68, 68, 0.25) 70%, transparent 100%)', animationDelay: '2s' }}
          />
        </>
      )}

      {theme === 'eclipse' && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[180px] opacity-25"
            style={{ background: 'radial-gradient(circle, #EAB308 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%)' }}
          />
        </>
      )}

      {theme === 'ethereal' && (
        <>
          <div
            className="absolute -top-40 -left-20 w-[700px] h-[600px] rounded-full blur-[160px] opacity-40 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #9333EA 0%, rgba(232, 121, 249, 0.35) 55%, transparent 100%)' }}
          />
          <div
            className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[150px] opacity-45 animate-pulse-atmosphere"
            style={{ background: 'radial-gradient(ellipse, #C084FC 0%, rgba(244, 114, 182, 0.3) 60%, transparent 100%)', animationDelay: '3s' }}
          />
        </>
      )}

      {/* LAYER 2: HIGH-PERFORMANCE INTERACTIVE CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default AtmosphericBackground;
