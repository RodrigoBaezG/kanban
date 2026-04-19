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
        <a href="/" className="back-btn" title="All Projects">← Projects</a>
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
  );
}
