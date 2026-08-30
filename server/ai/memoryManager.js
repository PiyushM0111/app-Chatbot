// Memory Scopes & User Controls (Session, Long-Term User, Project Memory)
import { randomUUID } from 'crypto';
import { query, run } from '../db.js';

export const getUserMemories = async (userId) => {
  if (!userId) return [];
  try {
    return await query('SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  } catch (err) {
    console.error('Error fetching user memories:', err);
    return [];
  }
};

export const saveUserMemory = async (userId, keyFact, category = 'general') => {
  if (!userId || !keyFact) return null;
  const id = randomUUID();
  try {
    await run(
      'INSERT INTO memories (id, user_id, category, key_fact, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [id, userId, category, keyFact.trim()]
    );
    return { id, userId, category, keyFact: keyFact.trim() };
  } catch (err) {
    console.error('Error saving user memory:', err);
    return null;
  }
};

export const deleteUserMemory = async (userId, memoryId) => {
  if (!userId || !memoryId) return false;
  try {
    await run('DELETE FROM memories WHERE id = ? AND user_id = ?', [memoryId, userId]);
    return true;
  } catch (err) {
    console.error('Error deleting memory:', err);
    return false;
  }
};

export const clearAllUserMemories = async (userId) => {
  if (!userId) return false;
  try {
    await run('DELETE FROM memories WHERE user_id = ?', [userId]);
    return true;
  } catch (err) {
    console.error('Error clearing memories:', err);
    return false;
  }
};
