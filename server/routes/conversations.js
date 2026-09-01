import express from 'express';
import { randomUUID } from 'crypto';
import { query, get, run } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/conversations - List all conversations for the user (Pinned first)
router.get('/', async (req, res) => {
  try {
    const conversations = await query(
      `SELECT c.*, 
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY rowid DESC LIMIT 1) as last_message,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
       FROM conversations c
       WHERE c.user_id = ?
       ORDER BY c.is_pinned DESC, c.updated_at DESC, c.rowid DESC`,
      [req.user.id]
    );

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
  }
});

// POST /api/conversations - Create a new conversation
router.post('/', async (req, res) => {
  try {
    const { title, language = 'en', mode = 'general', system_prompt = '' } = req.body || {};
    const conversationId = randomUUID();
    const defaultTitle = title?.trim() || 'New Chat';

    await run(
      `INSERT INTO conversations (id, user_id, title, language, mode, system_prompt, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [conversationId, req.user.id, defaultTitle, language, mode, system_prompt]
    );

    const newConversation = await get(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    res.status(201).json({
      success: true,
      conversation: newConversation,
      messages: []
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create conversation.' });
  }
});

// GET /api/conversations/:id - Get conversation details & messages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const messages = await query(
      'SELECT id, conversation_id, role, content, attachments, created_at FROM messages WHERE conversation_id = ? ORDER BY rowid ASC',
      [id]
    );

    const parsedMessages = messages.map(m => ({
      ...m,
      attachments: typeof m.attachments === 'string' ? JSON.parse(m.attachments || '[]') : m.attachments
    }));

    res.json({ conversation, messages: parsedMessages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation.' });
  }
});

// PATCH /api/conversations/:id - Rename, pin, or update conversation
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, language, mode, system_prompt, is_pinned } = req.body;

    const conversation = await get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const updates = [];
    const params = [];

    if (typeof title === 'string' && title.trim()) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (typeof language === 'string') {
      updates.push('language = ?');
      params.push(language);
    }
    if (typeof mode === 'string') {
      updates.push('mode = ?');
      params.push(mode);
    }
    if (typeof system_prompt === 'string') {
      updates.push('system_prompt = ?');
      params.push(system_prompt);
    }
    if (typeof is_pinned === 'boolean' || typeof is_pinned === 'number') {
      updates.push('is_pinned = ?');
      params.push(is_pinned ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      await run(`UPDATE conversations SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await get('SELECT * FROM conversations WHERE id = ?', [id]);
    res.json({ conversation: updated });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation.' });
  }
});

// GET /api/conversations/:id/export - Export conversation as Markdown or JSON
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'markdown' } = req.query;

    const conversation = await get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const messages = await query(
      'SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY rowid ASC',
      [id]
    );

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(conversation.title)}.json"`);
      return res.json({ conversation, messages });
    }

    if (format === 'txt') {
      let txt = `${conversation.title.toUpperCase()}\n`;
      txt += `Exported: ${new Date().toLocaleString()}\n`;
      txt += `Mode: ${conversation.mode} | Language: ${conversation.language}\n`;
      txt += `========================================================\n\n`;

      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'USER' : 'AI';
        txt += `[${sender} - ${new Date(msg.created_at).toLocaleTimeString()}]\n${msg.content}\n\n--------------------------------------------------------\n\n`;
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(conversation.title)}.txt"`);
      return res.send(txt);
    }

    // Markdown export
    let md = `# ${conversation.title}\n\n`;
    md += `*Exported on: ${new Date().toLocaleString()}*\n`;
    md += `*Mode: ${conversation.mode} | Language: ${conversation.language}*\n\n---\n\n`;

    messages.forEach((msg) => {
      const sender = msg.role === 'user' ? '👤 User' : '🤖 AI Assistant';
      md += `### ${sender} (${new Date(msg.created_at).toLocaleTimeString()})\n\n${msg.content}\n\n---\n\n`;
    });

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(conversation.title)}.md"`);
    res.send(md);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export conversation.' });
  }
});

// DELETE /api/conversations/:id - Delete a conversation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    await run('DELETE FROM messages WHERE conversation_id = ?', [id]);
    await run('DELETE FROM conversations WHERE id = ?', [id]);

    res.json({ message: 'Conversation deleted successfully.', id });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
});

// DELETE /api/conversations - Clear all conversations for user
router.delete('/', async (req, res) => {
  try {
    const userConvs = await query('SELECT id FROM conversations WHERE user_id = ?', [req.user.id]);
    for (const c of userConvs) {
      await run('DELETE FROM messages WHERE conversation_id = ?', [c.id]);
    }
    await run('DELETE FROM conversations WHERE user_id = ?', [req.user.id]);

    res.json({ message: 'All conversations cleared successfully.' });
  } catch (error) {
    console.error('Clear conversations error:', error);
    res.status(500).json({ error: 'Failed to clear conversations.' });
  }
});

export default router;
