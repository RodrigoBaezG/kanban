'use client';

import { useState, useEffect } from 'react';
import Board from '@/components/Board';
import { Project } from '@/types/kanban';
import { getProjects } from '@/lib/storage';

export default function BoardPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('kanban_user');
    if (!user) { window.location.replace('/'); return; }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('projectId');
    const projs = getProjects(user);
    const project = projs.find(p => p.id === id);

    if (!id || !project) { window.location.replace('/'); return; }

    setCurrentUser(user);
    setProjectId(id);
    setSelectedProject(project);
  }, []);

  if (!currentUser || !projectId || !selectedProject) return null;

  return (
    <div className="board-page-layout">
      <header className="board-page-header">
        <a href="/" className="back-btn">← Projects</a>
        <span className="header-sep" />
        <span className="project-dot-lg" style={{ background: selectedProject.color }} />
        <h1 className="board-page-title">{selectedProject.name}</h1>
        <div className="header-user">
          <span className="header-user-avatar">{currentUser[0].toUpperCase()}</span>
          <span className="header-user-name">{currentUser}</span>
          <button className="header-logout-btn" onClick={() => {
            localStorage.removeItem('kanban_user');
            window.location.replace('/');
          }}>
            Log out
          </button>
        </div>
      </header>
      <Board
        key={projectId}
        projectId={projectId}
        userName={currentUser}
      />
    </div>
  );
}
