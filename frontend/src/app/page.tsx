'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/kanban';
import {
  getUsers, saveUsers, getProjects, saveProjects,
  getColumns, getCards, seedDemoData,
  DEMO_USER, PROJECT_COLORS,
} from '@/lib/storage';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('kanban_user');
    if (user) {
      setCurrentUser(user);
      setProjects(loadOrInitProjects(user));
    }
  }, []);

  function loadOrInitProjects(user: string): Project[] {
    const existing = getProjects(user);
    if (existing.length > 0) return existing;
    const defaultProject: Project = {
      id: `p_${Date.now()}`,
      name: 'My First Project',
      color: PROJECT_COLORS[0],
    };
    saveProjects(user, [defaultProject]);
    return [defaultProject];
  }

  const login = (user: string) => {
    localStorage.setItem('kanban_user', user);
    setCurrentUser(user);
    setProjects(loadOrInitProjects(user));
    setNameInput(''); setPasswordInput(''); setConfirmInput(''); setAuthError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const name = nameInput.trim();
    if (!name || !passwordInput) return;
    const users = getUsers();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) { setAuthError('User not found. Please sign up first.'); return; }
    if (user.password !== passwordInput) { setAuthError('Incorrect password.'); return; }
    login(user.name);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const name = nameInput.trim();
    if (!name || !passwordInput) return;
    if (name.toLowerCase() === DEMO_USER.toLowerCase()) {
      setAuthError('"Demo" is a reserved name.');
      return;
    }
    if (passwordInput !== confirmInput) { setAuthError('Passwords do not match.'); return; }
    const users = getUsers();
    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
      setAuthError('That name is already taken.');
      return;
    }
    saveUsers([...users, { name, password: passwordInput }]);
    login(name);
  };

  const handleDemo = () => { seedDemoData(); login(DEMO_USER); };

  const handleLogout = () => {
    localStorage.removeItem('kanban_user');
    setCurrentUser(null);
    setProjects([]);
    setAuthMode('login');
    setAuthError('');
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
  };

  // ── Auth screen ────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="auth-overlay">
        <div className="auth-card glass">
          <div className="auth-logo">⊞</div>
          <h1 className="auth-title">Kanban Board</h1>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${authMode === 'login' ? ' active' : ''}`}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab${authMode === 'signup' ? ' active' : ''}`}
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-name">Name</label>
                <input id="login-name" name="name" autoFocus required
                  placeholder="Your name..." value={nameInput}
                  onChange={e => setNameInput(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input id="login-password" name="password" type="password" required
                  placeholder="Your password..." value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)} />
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="primary auth-submit">Log In</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-name">Name</label>
                <input id="signup-name" name="name" autoFocus required
                  placeholder="Choose a name..." value={nameInput}
                  onChange={e => setNameInput(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input id="signup-password" name="password" type="password" required
                  placeholder="Choose a password..." value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <input id="signup-confirm" name="confirm" type="password" required
                  placeholder="Confirm password..." value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)} />
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="primary auth-submit">Create Account</button>
            </form>
          )}

          <div className="auth-divider"><span>or</span></div>
          <button type="button" className="demo-btn" onClick={handleDemo}>
            Continue as Demo
          </button>
        </div>
      </div>
    );
  }

  // ── Projects overview ──────────────────────────────────────────────────────
  return (
    <div className="board-page-layout">
      <header className="board-page-header">
        <span className="brand-icon" style={{ fontSize: '1.3rem', color: 'var(--blue)' }}>⊞</span>
        <span className="header-sep" />
        <h1 className="board-page-title">My Projects</h1>
        <div className="header-user">
          <span className="header-user-avatar">{currentUser[0].toUpperCase()}</span>
          <span className="header-user-name">{currentUser}</span>
          <button className="header-logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <div className="projects-page">
        <div className="projects-grid">
          {projects.map(project => {
            const colCount = getColumns(currentUser, project.id as string).length;
            const cardCount = getCards(currentUser, project.id as string).length;
            return (
              <div key={project.id as string} className="project-card-wrapper">
                <a
                  href={`/board?projectId=${project.id}`}
                  className="project-card"
                >
                  <div className="project-card-bar" style={{ background: project.color }} />
                  <div className="project-card-body">
                    <h2 className="project-card-name">{project.name}</h2>
                    <p className="project-card-stats">
                      {colCount} column{colCount !== 1 ? 's' : ''} · {cardCount} card{cardCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="project-card-footer">
                    <span className="project-card-open">Open Board →</span>
                  </div>
                </a>
                {projects.length > 1 && (
                  <button
                    className="project-card-delete"
                    onClick={() => deleteProject(project.id as string)}
                    title="Delete project"
                  >×</button>
                )}
              </div>
            );
          })}

            {isAddingProject ? (
              <form
                className="project-card project-card-new project-card-form"
                onSubmit={e => {
                  e.preventDefault();
                  const name = newProjectName.trim();
                  if (name) { addProject(name); setNewProjectName(''); setIsAddingProject(false); }
                }}
              >
                <input
                  autoFocus
                  className="new-project-input"
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="submit" className="primary" style={{ flex: 1, padding: '0.45rem' }}>Create</button>
                  <button
                    type="button"
                    style={{ background: 'var(--gray)', flex: 1, padding: '0.45rem' }}
                    onClick={() => { setIsAddingProject(false); setNewProjectName(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button className="project-card project-card-new" onClick={() => setIsAddingProject(true)}>
                <span className="new-project-plus">+</span>
                <span className="new-project-label">New Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
  );
}

