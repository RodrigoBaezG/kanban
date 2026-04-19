'use client';

import { useState, useEffect } from 'react';
import Board from '@/components/Board';
import Sidebar from '@/components/Sidebar';
import { Project, User } from '@/types/kanban';

const PROJECT_COLORS = ['#209dd7', '#753991', '#ecad0a', '#27ae60', '#e74c3c'];
export const DEMO_USER = 'Demo';
export const DEMO_PROJECT_ID = 'demo_p1';

function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('kanban_users');
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem('kanban_users', JSON.stringify(users));
}

function seedDemoData() {
  const key = `kanban_projects_${DEMO_USER}`;
  if (localStorage.getItem(key)) return;

  localStorage.setItem(key, JSON.stringify([
    { id: DEMO_PROJECT_ID, name: 'My Project', color: '#209dd7' },
  ]));
  localStorage.setItem(`kanban_cols_${DEMO_USER}_${DEMO_PROJECT_ID}`, JSON.stringify([
    { id: 'demo_col_0', title: 'To Do' },
    { id: 'demo_col_1', title: 'In Progress' },
    { id: 'demo_col_2', title: 'Review' },
    { id: 'demo_col_3', title: 'Testing' },
    { id: 'demo_col_4', title: 'Done' },
  ]));
  localStorage.setItem(`kanban_cards_${DEMO_USER}_${DEMO_PROJECT_ID}`, JSON.stringify([
    { id: 'd1', columnId: 'demo_col_0', title: 'Database Migration', details: 'Migrate users to new schema.' },
    { id: 'd2', columnId: 'demo_col_0', title: 'Setup CI/CD', details: 'Configure GitHub Actions for deployment.' },
    { id: 'd3', columnId: 'demo_col_1', title: 'Kanban Board components', details: 'Create Board, Column, Card UI.' },
    { id: 'd4', columnId: 'demo_col_4', title: 'Project Scaffolding', details: 'Initialize Next.js project and setup tests.' },
  ]));
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kanban_user');
    if (stored) {
      setCurrentUser(stored);
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

  const login = (user: string) => {
    localStorage.setItem('kanban_user', user);
    setCurrentUser(user);
    loadProjects(user);
    setNameInput('');
    setPasswordInput('');
    setConfirmInput('');
    setAuthError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const name = nameInput.trim();
    if (!name || !passwordInput) return;

    const users = getUsers();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) {
      setAuthError('User not found. Please sign up first.');
      return;
    }
    if (user.password !== passwordInput) {
      setAuthError('Incorrect password.');
      return;
    }
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
    if (passwordInput !== confirmInput) {
      setAuthError('Passwords do not match.');
      return;
    }
    const users = getUsers();
    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
      setAuthError('That name is already taken.');
      return;
    }
    saveUsers([...users, { name, password: passwordInput }]);
    login(name);
  };

  const handleDemo = () => {
    seedDemoData();
    login(DEMO_USER);
  };

  const handleLogout = () => {
    localStorage.removeItem('kanban_user');
    setCurrentUser(null);
    setProjects([]);
    setSelectedProjectId(null);
    setNameInput('');
    setPasswordInput('');
    setConfirmInput('');
    setAuthError('');
    setAuthMode('login');
    setSidebarOpen(false);
  };

  const saveProjects = (user: string, projs: Project[]) => {
    localStorage.setItem(`kanban_projects_${user}`, JSON.stringify(projs));
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
    setSelectedProjectId(newProject.id as string);
  };

  const deleteProject = (id: string) => {
    if (!currentUser) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(currentUser, updated);
    setSelectedProjectId(updated.length > 0 ? (updated[0].id as string) : null);
  };

  const switchProject = (id: string) => {
    setSelectedProjectId(id);
    setSidebarOpen(false); // close on mobile after selection
  };

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
                <input
                  id="login-name"
                  name="name"
                  autoFocus
                  required
                  placeholder="Your name..."
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Your password..."
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                />
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="primary auth-submit">Log In</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-name">Name</label>
                <input
                  id="signup-name"
                  name="name"
                  autoFocus
                  required
                  placeholder="Choose a name..."
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Choose a password..."
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <input
                  id="signup-confirm"
                  name="confirm"
                  type="password"
                  required
                  placeholder="Confirm password..."
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                />
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

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? null;

  return (
    <div className={`app-layout${sidebarOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      <Sidebar
        userName={currentUser}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={switchProject}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <header className="app-header">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          {selectedProject && (
            <h1 className="app-title">
              <span className="project-dot-lg" style={{ background: selectedProject.color }} />
              {selectedProject.name}
            </h1>
          )}
        </header>
        {selectedProject ? (
          <Board
            key={selectedProject.id as string}
            projectId={selectedProject.id as string}
            userName={currentUser}
          />
        ) : (
          <div className="empty-state">
            <p>Select or create a project in the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
