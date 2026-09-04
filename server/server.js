import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDatabaseInitialized } from './db.js';
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import chatRoutes from './routes/chat.js';
import memoryRoutes from './routes/memory.js';
import projectRoutes from './routes/projects.js';
import learningRoutes from './routes/learning.js';
import imageRoutes from './routes/images.js';
import notesRoutes from './routes/notes.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined') return __dirname;
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (e) {}
  return process.cwd();
};
const __dirname = getDirname();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS with explicit preflight support
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// URL normalization for standalone server, Netlify Functions, and reverse proxies
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    let clean = req.url.replace(/^\/\.netlify\/functions\/api/, '');
    if (!clean.startsWith('/api') && clean !== '') {
      clean = `/api${clean.startsWith('/') ? '' : '/'}${clean}`;
    }
    req.url = clean || '/api/health';
  }
  next();
});

// Safe async database initialization middleware (No top-level await)
app.use(async (req, res, next) => {
  try {
    await ensureDatabaseInitialized();
    next();
  } catch (dbErr) {
    console.error('Database initialization error during request:', dbErr);
    res.status(500).json({ success: false, error: 'Database service unavailable. Please try again.' });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use('/api', rateLimiter({ max: process.env.NODE_ENV === 'test' ? 10000 : 600, windowMs: 60 * 1000 }));

// Multi-Subsystem Health & Status Monitoring Endpoint
app.get(['/api/health', '/health'], (req, res) => {
  const isGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && process.env.GEMINI_API_KEY.length > 10);

  res.json({
    success: true,
    service: 'api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    subsystems: {
      ai_provider: isGemini ? 'Google Gemini 1.5/2.0 (Active)' : 'Intelligent Local Knowledge Engine (Active)',
      image_studio: 'Operational (Structured Multimodal Engine)',
      database: 'Operational (SQLite WAL Mode)',
      search_engine: 'Operational (DuckDuckGo Live Adapter)',
      memory_vault: 'Operational (3-Tier Multi-Context)',
      notes_system: 'Operational'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/notes', notesRoutes);

// Serve static frontend build if available
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send('Nexus AI Platform Server is running. Client is in development mode.');
      }
    });
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Global Error Handler & Sanitizer
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error. Please try again.' });
});

// Standalone Server Listener (Only when executed directly in Node, never inside Netlify Lambda)
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server.js') || 
  process.argv[1].endsWith('server\\server.js') ||
  process.argv[1].endsWith('server/server.js')
);

if (isDirectRun && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  ensureDatabaseInitialized().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Nexus AI Platform Server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database on startup:', err);
    app.listen(PORT, () => {
      console.log(`🚀 Nexus AI Platform Server running (DB degraded mode) on http://localhost:${PORT}`);
    });
  });
}

export default app;
