import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getUserMemories, saveUserMemory, deleteUserMemory, clearAllUserMemories } from '../ai/memoryManager.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/memory - List all stored user memories
router.get('/', async (req, res) => {
  try {
    const memories = await getUserMemories(req.user.id);
    res.json({ memories });
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ error: 'Failed to retrieve memories.' });
  }
});

// POST /api/memory - Explicitly save a memory
router.post('/', async (req, res) => {
  try {
    const { keyFact, category = 'general' } = req.body;
    if (!keyFact || !keyFact.trim()) {
      return res.status(400).json({ error: 'Memory fact cannot be empty.' });
    }
    const memory = await saveUserMemory(req.user.id, keyFact, category);
    res.status(201).json({ memory });
  } catch (err) {
    console.error('Error saving memory:', err);
    res.status(500).json({ error: 'Failed to save memory.' });
  }
});

// DELETE /api/memory/:id - Delete an individual memory
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteUserMemory(req.user.id, req.params.id);
    if (success) {
      res.json({ message: 'Memory deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Memory not found or unauthorized.' });
    }
  } catch (err) {
    console.error('Error deleting memory:', err);
    res.status(500).json({ error: 'Failed to delete memory.' });
  }
});

// DELETE /api/memory - Clear all memories for the user
router.delete('/', async (req, res) => {
  try {
    await clearAllUserMemories(req.user.id);
    res.json({ message: 'All memories cleared successfully.' });
  } catch (err) {
    console.error('Error clearing memories:', err);
    res.status(500).json({ error: 'Failed to clear memories.' });
  }
});

export default router;
