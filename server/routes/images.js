import express from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { query, run } from '../db.js';
import { interpretImageRequest } from '../tools/imageGen.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/images - List user generated images
router.get('/', async (req, res) => {
  try {
    const images = await query(
      'SELECT * FROM generated_images WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const parsed = images.map(img => ({
      ...img,
      parameters: typeof img.parameters === 'string' ? JSON.parse(img.parameters || '{}') : img.parameters
    }));
    res.json({ success: true, images: parsed });
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to retrieve image gallery.' });
  }
});

// GET /api/images/gallery - Alias for listing user generated images
router.get('/gallery', async (req, res) => {
  try {
    const images = await query(
      'SELECT * FROM generated_images WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const parsed = images.map(img => ({
      ...img,
      parameters: typeof img.parameters === 'string' ? JSON.parse(img.parameters || '{}') : img.parameters
    }));
    res.json({ success: true, images: parsed });
  } catch (err) {
    console.error('Error fetching image gallery:', err);
    res.status(500).json({ error: 'Failed to retrieve image gallery.' });
  }
});

// POST /api/images/generate - Generate image with structured parameters
router.post('/generate', async (req, res) => {
  try {
    const { prompt, conversationId = null, previousParams = null } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Image prompt cannot be empty.' });
    }

    const generated = interpretImageRequest(prompt, previousParams);
    const id = randomUUID();

    await run(
      'INSERT INTO generated_images (id, user_id, conversation_id, prompt, image_url, parameters, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [id, req.user.id, conversationId, generated.prompt, generated.imageUrl, JSON.stringify(generated.parameters)]
    );

    res.status(201).json({
      image: {
        id,
        generationId: generated.generationId,
        user_id: req.user.id,
        conversation_id: conversationId,
        prompt: generated.prompt,
        image_url: generated.imageUrl,
        mimeType: generated.mimeType || 'image/png',
        parameters: generated.parameters,
        formattedResponse: generated.formattedResponse
      }
    });
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).json({ error: 'Failed to generate image.' });
  }
});

// DELETE /api/images/:id - Delete an image from gallery
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM generated_images WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes > 0) {
      res.json({ message: 'Image deleted from gallery.' });
    } else {
      res.status(404).json({ error: 'Image not found or unauthorized.' });
    }
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image.' });
  }
});

export default router;
