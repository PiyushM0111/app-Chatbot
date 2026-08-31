import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

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

const isServerless = !!(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const dbPath = isServerless ? path.resolve('/tmp', 'chatbot.db') : path.resolve(__dirname, 'chatbot.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Enable WAL mode & foreign keys for high concurrency & data integrity
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA foreign_keys = ON;');

// Helper methods for promise-based query execution
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize schema with safe automatic migrations
export const initDB = async () => {
  try {
    // 1. Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        theme_preference TEXT DEFAULT 'midnight',
        accent_color TEXT DEFAULT '#A855F7',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Conversations table
    await run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT 'New Conversation',
        language TEXT DEFAULT 'en',
        mode TEXT DEFAULT 'general',
        system_prompt TEXT DEFAULT '',
        is_pinned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Messages table
    await run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        attachments TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // 4. Multi-Tier User Memories
    await run(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        key_fact TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 5. Software Projects Workspace
    await run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        tech_stack TEXT DEFAULT '[]',
        architecture TEXT,
        tasks TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 6. Learning Progress & Quiz Mastery
    await run(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        level TEXT DEFAULT 'Beginner',
        status TEXT DEFAULT 'In Progress',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 7. Multimodal Generated Images History
    await run(`
      CREATE TABLE IF NOT EXISTS generated_images (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        conversation_id TEXT,
        prompt TEXT NOT NULL,
        image_url TEXT NOT NULL,
        parameters TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 8. User AI Notes & Snippets
    await run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Safe column additions for existing databases
    try {
      await run(`ALTER TABLE conversations ADD COLUMN is_pinned INTEGER DEFAULT 0`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE messages ADD COLUMN attachments TEXT DEFAULT '[]'`);
    } catch (e) {}

    // Indexes for fast querying
    await run(`CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_learning_user ON learning_progress(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_images_user ON generated_images(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id)`);

    console.log('Database tables & indexes initialized successfully.');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
};

let dbInitPromise = null;

export const ensureDatabaseInitialized = () => {
  if (!dbInitPromise) {
    dbInitPromise = initDB().catch((err) => {
      console.error('Database initialization failed:', err);
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
};

export default db;
