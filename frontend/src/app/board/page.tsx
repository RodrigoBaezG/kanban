'use client';

import { useState, useEffect } from 'react';
import Board from '@/components/Board';
import Sidebar from '@/components/Sidebar';
import { Project } from '@/types/kanban';
import { getProjects, saveProjects, PROJECT_COLORS } from '@/lib/storage';

export default function BoardPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('kanban_user');
    if (!user) { window.location.replace('/'); return; }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('projectId');
    const projs = getProjects(user);
    const exists = projs.some(p => p.id === id);

    if (!id || !exists) { window.location.replace('/'); return; }

    setCurrentUser(user);
    setProjectId(id);
    setProjects(projs);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kanban_user');
    window.location.replace('/');
  };

  const addProject = (name: string) => {
    if (!currentUser) return;
    const newProject: Project = {
      id: `p_${Date.now()}`,
      name,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveProjects(currentUser, updated);
  };

  const deleteProject = (id: string) => {
    if (!currentUser) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(currentUser, updated);
    if (id === projectId) window.location.replace('/');
  };

  const selectedProject = projects.find(p => p.id === projectId) ?? null;

  if (!currentUser || !projectId || !selectedProject) return null;

  return (
    <div className={`app-layout${sidebarOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      <Sidebar
        userName={currentUser}
        projects={projects}
        selectedProjectId={projectId}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <header className="app-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
            ☰
          </button>
          <a href="/" className="back-btn" title="All Projects">←</a>
          <h1 className="app-title">
            <span className="project-dot-lg" style={{ background: selectedProject.color }} />
            {selectedProject.name}
          </h1>
        </header>
        <Board
          key={projectId}
          projectId={projectId}
          userName={currentUser}
        />
      </div>
    </div>
  );
}
