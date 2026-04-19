'use client';

import { useState, useEffect } from 'react';
import Board from '@/components/Board';
import Sidebar from '@/components/Sidebar';
import { Project } from '@/types/kanban';

const PROJECT_COLORS = ['#209dd7', '#753991', '#ecad0a', '#27ae60', '#e74c3c'];

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('kanban_user');
    if (stored) {
      setUserName(stored);
      loadProjects(stored);
    }
  }, []);

  const loadProjects = (user: string) => {
    const stored = localStorage.getItem(`kanban_projects_${user}`);
    if (stored) {
      const projs: Project[] = JSON.parse(stored);
      setProjects(projs);
      if (projs.length > 0) setSelectedProjectId(projs[0].id as string);
    } else {
      const defaultProject: Project = {
        id: `p_${Date.now()}`,
        name: 'My First Project',
        color: PROJECT_COLORS[0],
      };
      const projs = [defaultProject];
      setProjects(projs);
      setSelectedProjectId(defaultProject.id as string);
      localStorage.setItem(`kanban_projects_${user}`, JSON.stringify(projs));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    localStorage.setItem('kanban_user', name);
    setUserName(name);
    loadProjects(name);
  };

  const saveProjects = (user: string, projs: Project[]) => {
    localStorage.setItem(`kanban_projects_${user}`, JSON.stringify(projs));
  };

  const addProject = (name: string) => {
    if (!userName) return;
    const newProject: Project = {
      id: `p_${Date.now()}`,
      name,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveProjects(userName, updated);
    setSelectedProjectId(newProject.id as string);
  };

  const deleteProject = (id: string) => {
    if (!userName) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(userName, updated);
    if (selectedProjectId === id) {
      setSelectedProjectId(updated.length > 0 ? (updated[0].id as string) : null);
    }
  };

  const handleLogout = () => {
    setUserName(null);
    setProjects([]);
    setSelectedProjectId(null);
    setNameInput('');
  };

  if (!userName) {
    return (
      <div className="login-overlay">
        <div className="login-card glass">
          <div className="login-logo">⊞</div>
          <h1 className="login-title">Kanban Board</h1>
          <p className="login-subtitle">Enter your name to access your workspace</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              autoFocus
              placeholder="Your name..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              required
            />
            <button type="submit" className="primary">Get Started →</button>
          </form>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? null;

  return (
    <div className="app-layout">
      <Sidebar
        userName={userName}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onLogout={handleLogout}
      />
      <div className="app-main">
        {selectedProject ? (
          <>
            <header className="app-header">
              <h1 className="app-title">
                <span className="project-dot-lg" style={{ background: selectedProject.color }} />
                {selectedProject.name}
              </h1>
            </header>
            <Board
              key={selectedProject.id as string}
              projectId={selectedProject.id as string}
              userName={userName}
            />
          </>
        ) : (
          <div className="empty-state">
            <p>No project selected. Create one in the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
