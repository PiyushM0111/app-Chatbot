import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, X, Trash2, CheckCircle2, Circle, Layers, Code, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getApiUrl, parseJsonResponse } from '../utils/apiClient';

const ProjectsModal = ({ isOpen, onClose, onStartProjectChat }) => {
  const { token } = useAuth();
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchProjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/projects'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0 && !activeProject) {
          setActiveProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchProjects();
  }, [isOpen, token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch(getApiUrl('/api/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim()
        })
      });

      if (res.ok) {
        const data = await parseJsonResponse(res);
        showToast('Project created successfully!', 'success');
        setNewProjectName('');
        setNewProjectDesc('');
        setIsCreating(false);
        fetchProjects();
        setActiveProject(data.project);
      }
    } catch (err) {
      showToast('Failed to create project.', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const res = await fetch(getApiUrl(`/api/projects/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProject?.id === id) setActiveProject(null);
        showToast('Project deleted.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete project.', 'error');
    }
  };

  const toggleTask = async (taskIndex) => {
    if (!activeProject) return;
    const updatedTasks = [...(activeProject.tasks || [])];
    const current = updatedTasks[taskIndex];
    updatedTasks[taskIndex] = {
      ...current,
      status: current.status === 'completed' ? 'pending' : 'completed'
    };

    try {
      const res = await fetch(getApiUrl(`/api/projects/${activeProject.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tasks: updatedTasks })
      });

      if (res.ok) {
        setActiveProject(prev => ({ ...prev, tasks: updatedTasks }));
        setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, tasks: updatedTasks } : p));
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[88vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">Software Projects Workspace</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Scaffold, track, and architect full-stack applications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="py-3 flex justify-between items-center flex-shrink-0">
          <button
            onClick={() => setIsCreating(prev => !prev)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-transform hover:scale-105 text-zinc-900 flex items-center gap-1.5"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isCreating ? 'Cancel' : 'New Project'}</span>
          </button>

          {activeProject && (
            <button
              onClick={() => {
                if (onStartProjectChat) onStartProjectChat(`Let's work on the project "${activeProject.name}". Here is the description: ${activeProject.description}`);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discuss in Chat</span>
            </button>
          )}
        </div>

        {/* Create Project Form */}
        {isCreating && (
          <form onSubmit={handleCreateProject} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3 mb-3 flex-shrink-0 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Create Software Project</h3>
            <input
              type="text"
              required
              placeholder="Project Name (e.g. Smart Attendance App, E-Commerce API)..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <textarea
              rows={2}
              placeholder="Describe requirements, goals, and desired tech stack in natural language..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-900 shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                Generate Architecture
              </button>
            </div>
          </form>
        )}

        {/* Content Body: Left Project List & Right Project Details */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
          {/* Projects Sidebar List */}
          <div className="w-full md:w-1/3 overflow-y-auto space-y-2 pr-1 custom-chat-scroller border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 pb-3 md:pb-0">
            {loading ? (
              <div className="text-xs text-zinc-400 text-center py-8">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-xs text-zinc-400 text-center py-8">No projects created yet. Click "New Project" above!</div>
            ) : (
              projects.map((p) => {
                const isSelected = activeProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-400 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">{p.name}</span>
                      <span className="text-[10px] text-zinc-400 block truncate mt-0.5">{p.description || 'No description'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Project Details Panel */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-chat-scroller">
            {activeProject ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">{activeProject.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{activeProject.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(activeProject.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tech Stack Chips */}
                {activeProject.tech_stack && activeProject.tech_stack.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Technology Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.tech_stack.map((tech, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks Checklist */}
                {activeProject.tasks && activeProject.tasks.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      <span>Implementation Tasks</span>
                    </div>
                    <div className="space-y-1.5">
                      {activeProject.tasks.map((task, idx) => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleTask(idx)}
                            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                              )}
                              <span className={`text-xs font-medium truncate ${isDone ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {task.title}
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${isDone ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'}`}>
                              {task.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-zinc-400">
                Select a project from the left or create a new one to view architecture and roadmap.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsModal;
