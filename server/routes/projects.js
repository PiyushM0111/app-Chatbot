import express from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { query, get, run } from '../db.js';
import { buildSoftwareProject } from '../tools/projectBuilder.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/projects - List user's software projects
router.get('/', async (req, res) => {
  try {
    const projects = await query('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
    const parsed = projects.map(p => ({
      ...p,
      tech_stack: typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack || '[]') : p.tech_stack,
      tasks: typeof p.tasks === 'string' ? JSON.parse(p.tasks || '[]') : p.tasks
    }));
    res.json({ projects: parsed });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
});

// POST /api/projects - Create a new project from natural language
router.post('/', async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name or description required.' });
    }

    const scaffolding = buildSoftwareProject(description || name);
    const id = randomUUID();

    await run(
      'INSERT INTO projects (id, user_id, name, description, tech_stack, architecture, tasks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [
        id,
        req.user.id,
        name || scaffolding.name,
        description || scaffolding.description,
        JSON.stringify(scaffolding.techStack),
        scaffolding.architecture,
        JSON.stringify(scaffolding.tasks)
      ]
    );

    const created = await get('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json({
      project: {
        ...created,
        tech_stack: scaffolding.techStack,
        tasks: scaffolding.tasks,
        folder_structure: scaffolding.folderStructure,
        database_schema: scaffolding.databaseSchema
      }
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

// PATCH /api/projects/:id - Update tasks or project metadata
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tasks, tech_stack } = req.body;

    const project = await get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const newName = name || project.name;
    const newDesc = description !== undefined ? description : project.description;
    const newTasks = tasks ? JSON.stringify(tasks) : project.tasks;
    const newStack = tech_stack ? JSON.stringify(tech_stack) : project.tech_stack;

    await run(
      'UPDATE projects SET name = ?, description = ?, tasks = ?, tech_stack = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [newName, newDesc, newTasks, newStack, id, req.user.id]
    );

    const updated = await get('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({
      project: {
        ...updated,
        tech_stack: typeof updated.tech_stack === 'string' ? JSON.parse(updated.tech_stack) : updated.tech_stack,
        tasks: typeof updated.tasks === 'string' ? JSON.parse(updated.tasks) : updated.tasks
      }
    });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes > 0) {
      res.json({ message: 'Project deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Project not found or unauthorized.' });
    }
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

export default router;
