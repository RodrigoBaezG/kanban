'use client';

import { useState } from 'react';
import { Project } from '@/types/kanban';

interface Props {
  userName: string;
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  userName,
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  onLogout,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onAddProject(name);
    setNewName('');
    setIsAdding(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⊞</span>
        <span className="brand-name">Kanban</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{userName[0].toUpperCase()}</div>
        <span className="user-name">{userName}</span>
        <button className="logout-btn" onClick={onLogout} title="Switch user">↩</button>
      </div>

      <div className="sidebar-label">Projects</div>

      <nav className="sidebar-nav">
        {projects.map(project => (
          <div
            key={project.id as string}
            className={`project-item${selectedProjectId === project.id ? ' active' : ''}`}
          >
            <button
              className="project-item-btn"
              onClick={() => onSelectProject(project.id as string)}
            >
              <span className="project-dot" style={{ background: project.color }} />
              <span className="project-name">{project.name}</span>
            </button>
            {projects.length > 1 && (
              <button
                className="project-delete-btn"
                onClick={() => onDeleteProject(project.id as string)}
                title="Delete project"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </nav>

      {isAdding ? (
        <form onSubmit={handleAdd} className="add-project-form">
          <input
            autoFocus
            placeholder="Project name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            className="sidebar-input"
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className="primary sidebar-btn" style={{ flex: 1 }}>Add</button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setNewName(''); }}
              className="sidebar-btn"
              style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="add-project-btn" onClick={() => setIsAdding(true)}>
          + New Project
        </button>
      )}
    </aside>
  );
}
