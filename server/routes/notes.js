import express from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { query, get, run } from '../db.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/notes - List user's saved notes and code snippets
router.get('/', async (req, res) => {
  try {
    const { search = '', tag = '' } = req.query;
    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [req.user.id];

    if (search.trim()) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const notes = await query(sql, params);
    const parsed = notes.map(n => ({
      ...n,
      tags: typeof n.tags === 'string' ? JSON.parse(n.tags || '[]') : n.tags
    }));

    // Filter by tag if provided
    const filtered = tag.trim()
      ? parsed.filter(n => Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase() === tag.trim().toLowerCase()))
      : parsed;

    res.json({ notes: filtered });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to retrieve notes.' });
  }
});

// POST /api/notes - Save a new note or code snippet
router.post('/', async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content cannot be empty.' });
    }

    const id = randomUUID();
    const cleanTitle = (title && title.trim()) ? title.trim() : (content.trim().slice(0, 30) + '...');
    const tagsArray = Array.isArray(tags) ? tags : [];

    await run(
      'INSERT INTO notes (id, user_id, title, content, tags, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [id, req.user.id, cleanTitle, content.trim(), JSON.stringify(tagsArray)]
    );

    const created = await get('SELECT * FROM notes WHERE id = ?', [id]);
    res.status(201).json({
      note: {
        ...created,
        tags: tagsArray
      }
    });
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to save note.' });
  }
});

// PATCH /api/notes/:id - Update note title, content, or tags
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const existing = await get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Note not found.' });

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newContent = content !== undefined ? content.trim() : existing.content;
    const newTags = tags !== undefined ? JSON.stringify(Array.isArray(tags) ? tags : []) : existing.tags;

    await run(
      'UPDATE notes SET title = ?, content = ?, tags = ? WHERE id = ? AND user_id = ?',
      [newTitle, newContent, newTags, id, req.user.id]
    );

    const updated = await get('SELECT * FROM notes WHERE id = ?', [id]);
    res.json({
      note: {
        ...updated,
        tags: typeof updated.tags === 'string' ? JSON.parse(updated.tags) : updated.tags
      }
    });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: 'Failed to update note.' });
  }
});

// PUT /api/notes/:id (Alias for PATCH)
router.put('/:id', async (req, res, next) => {
  req.method = 'PATCH';
  router.handle(req, res, next);
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes > 0) {
      res.json({ message: 'Note deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Note not found or unauthorized.' });
    }
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

export default router;
