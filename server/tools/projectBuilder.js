// Natural Language Software Project Scaffolder & Architecture Generator

export const buildSoftwareProject = (projectDescription) => {
  const desc = projectDescription.trim();
  const lower = desc.toLowerCase();

  let name = 'Modern Full-Stack App';
  if (lower.includes('attendance')) name = 'Smart Attendance Management System';
  else if (lower.includes('e-commerce') || lower.includes('shop')) name = 'Scalable E-Commerce Platform';
  else if (lower.includes('chat') || lower.includes('messaging')) name = 'Real-Time Chat & Collab Workspace';
  else if (lower.includes('task') || lower.includes('todo') || lower.includes('kanban')) name = 'Intelligent Task & Project Board';
  else if (lower.includes('portfolio') || lower.includes('blog')) name = 'Modern Developer Portfolio & CMS';

  const techStack = [
    'React 18 + Vite (Frontend)',
    'TailwindCSS + Lucide Icons (Styling & Design Tokens)',
    'Node.js + Express.js (High-Performance Backend API)',
    'SQLite / PostgreSQL with WAL mode (Persistent Database)',
    'JWT + bcrypt (Secure Authentication & Session Management)',
    'Server-Sent Events (SSE) / WebSockets (Real-Time Updates)'
  ];

  const folderStructure = `
project-root/
├── client/
│   ├── src/
│   │   ├── components/      # UI Components & Design Tokens
│   │   ├── context/         # Auth, Theme, & Global State
│   │   ├── hooks/           # Custom React Lifecycle Hooks
│   │   ├── services/        # API Client & SSE Stream Readers
│   │   ├── App.jsx          # Main Router & Layout Orchestrator
│   │   └── main.jsx         # DOM Entry Point
│   └── vite.config.js       # Chunk Splitting & Build Pipeline
├── server/
│   ├── routes/              # Modular REST Controllers
│   ├── middleware/          # JWT Auth, Rate Limiting & Error Handler
│   ├── db.js                # SQLite Schema & Connection Pool
│   └── server.js            # Express Server Gateway
├── .env.example             # Safe Environment Variables
└── package.json             # Root Orchestration Scripts
`;

  const databaseSchema = `
-- 1. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resources Table
CREATE TABLE resources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    metadata TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

  const tasks = [
    { title: 'Initialize Repository & Dependencies', status: 'completed' },
    { title: 'Database Schema Design & Safe Migrations', status: 'completed' },
    { title: 'JWT Authentication & Authorization Middleware', status: 'in_progress' },
    { title: 'Modular REST API Route Handlers', status: 'pending' },
    { title: 'Responsive Frontend UI & State Management', status: 'pending' },
    { title: 'Automated Unit & Integration Testing', status: 'pending' },
    { title: 'Production Deployment (Netlify + Render)', status: 'pending' }
  ];

  const architecture = `Modular Clean Architecture (Presentation Layer -> Business Logic Controller -> Data Access Layer -> SQLite WAL DB)`;

  return {
    name,
    description: desc,
    techStack,
    folderStructure,
    databaseSchema,
    architecture,
    tasks,
    formattedMarkdown: `## 🏗️ Project Architecture Plan: **${name}**\n\n` +
      `**Description:** ${desc}\n\n` +
      `### ⚡ Technology Stack:\n${techStack.map(t => `- ${t}`).join('\n')}\n\n` +
      `### 📁 Recommended Folder Structure:\n\`\`\`text${folderStructure}\`\`\`\n\n` +
      `### 🗄️ Database Schema (SQLite / PostgreSQL):\n\`\`\`sql${databaseSchema}\`\`\`\n\n` +
      `### 📋 Implementation Roadmap & Tasks:\n` +
      tasks.map((t, idx) => `${idx + 1}. [${t.status === 'completed' ? 'x' : ' '}] **${t.title}** (${t.status})`).join('\n') +
      `\n\n*This project plan has been saved to your Project Workspace. You can continue development step-by-step anytime!*`
  };
};
