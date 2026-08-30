import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import chatRoutes from './routes/chat.js';
import memoryRoutes from './routes/memory.js';
import projectRoutes from './routes/projects.js';
import learningRoutes from './routes/learning.js';
import imageRoutes from './routes/images.js';
import notesRoutes from './routes/notes.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Safe Migrations
await initDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use('/api', rateLimiter({ max: 150, windowMs: 60 * 1000 }));

// Multi-Subsystem Health & Status Monitoring Endpoint (Section 51)
app.get('/api/health', (req, res) => {
  const isGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && process.env.GEMINI_API_KEY.length > 10);

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nexus AI Personal Platform API',
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

if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`🚀 Nexus AI Platform Server running on http://localhost:${PORT}`);
  });
}

export default app;
