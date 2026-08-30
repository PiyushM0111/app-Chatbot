import express from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { query, get, run } from '../db.js';
import { getCurriculumTopics, generateQuiz, evaluateQuizAnswers } from '../tools/learningTutor.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/learning/topics - Get curriculum tracks and user mastery scores
router.get('/topics', async (req, res) => {
  try {
    const curriculum = getCurriculumTopics();
    const userProgress = await query('SELECT * FROM learning_progress WHERE user_id = ?', [req.user.id]);

    res.json({
      curriculum,
      progress: userProgress
    });
  } catch (err) {
    console.error('Error fetching learning topics:', err);
    res.status(500).json({ error: 'Failed to retrieve learning topics.' });
  }
});

// POST /api/learning/quiz - Generate quiz questions for a topic
router.post('/quiz', async (req, res) => {
  try {
    const { topic = 'python' } = req.body;
    const quiz = generateQuiz(topic);
    res.json({ quiz });
  } catch (err) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// POST /api/learning/evaluate - Evaluate quiz answers and save progress
router.post('/evaluate', async (req, res) => {
  try {
    const { topic = 'python', answers = [] } = req.body;
    const evaluation = evaluateQuizAnswers(topic, answers);

    // Update progress in database
    const existing = await get(
      'SELECT * FROM learning_progress WHERE user_id = ? AND topic = ?',
      [req.user.id, topic]
    );

    const level = evaluation.percentage >= 80 ? 'Mastered' : evaluation.percentage >= 60 ? 'Intermediate' : 'Beginner';
    const status = evaluation.passed ? 'Passed' : 'Needs Review';

    if (existing) {
      await run(
        'UPDATE learning_progress SET score = ?, level = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [evaluation.percentage, level, status, existing.id]
      );
    } else {
      await run(
        'INSERT INTO learning_progress (id, user_id, topic, score, level, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [randomUUID(), req.user.id, topic, evaluation.percentage, level, status]
      );
    }

    res.json({ evaluation });
  } catch (err) {
    console.error('Error evaluating quiz:', err);
    res.status(500).json({ error: 'Failed to evaluate quiz.' });
  }
});

export default router;
