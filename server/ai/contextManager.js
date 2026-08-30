// Smart Context Manager: Windowing, Token Budgeting, and Pronoun/Reference Resolution
import { getUserMemories } from './memoryManager.js';
import { query } from '../db.js';

export const buildSmartContext = async (userId, conversationId, currentPrompt, rawHistory = []) => {
  // 1. Fetch relevant user long-term memories
  const memories = await getUserMemories(userId);
  const memorySnippets = memories.slice(0, 5).map(m => `- ${m.key_fact}`).join('\n');

  // 2. Fetch active projects if any
  let projectSnippets = '';
  try {
    const projects = await query('SELECT name, tech_stack FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 2', [userId]);
    if (projects.length > 0) {
      projectSnippets = projects.map(p => `- Project: ${p.name} (Tech Stack: ${p.tech_stack})`).join('\n');
    }
  } catch (e) {}

  // 3. Smart sliding window: pick the most recent 12 messages to fit within model bounds
  const windowedHistory = rawHistory.slice(-12);

  // 4. Reference Resolution: Check for requests like "kal wale code se continue", "previous image edit"
  const isContinuation = /kal wale|pehle wale|previous|last solution|last image|same code/i.test(currentPrompt);

  return {
    windowedHistory,
    memoryContext: memorySnippets ? `### 🧠 User Long-Term Stored Preferences & Knowledge:\n${memorySnippets}\n` : '',
    projectContext: projectSnippets ? `### 📁 User Active Software Projects:\n${projectSnippets}\n` : '',
    isContinuation
  };
};
