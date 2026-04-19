import { User, Project, Column, CardItem } from '@/types/kanban';

export const DEMO_USER = 'Demo';
export const DEMO_PROJECT_ID = 'demo_p1';
export const PROJECT_COLORS = ['#209dd7', '#753991', '#ecad0a', '#27ae60', '#e74c3c'];

export function getUsers(): User[] {
  const stored = localStorage.getItem('kanban_users');
  return stored ? JSON.parse(stored) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem('kanban_users', JSON.stringify(users));
}

export function getProjects(user: string): Project[] {
  const stored = localStorage.getItem(`kanban_projects_${user}`);
  return stored ? JSON.parse(stored) : [];
}

export function saveProjects(user: string, projects: Project[]) {
  localStorage.setItem(`kanban_projects_${user}`, JSON.stringify(projects));
}

export function getColumns(user: string, projectId: string): Column[] {
  const stored = localStorage.getItem(`kanban_cols_${user}_${projectId}`);
  return stored ? JSON.parse(stored) : [];
}

export function getCards(user: string, projectId: string): CardItem[] {
  const stored = localStorage.getItem(`kanban_cards_${user}_${projectId}`);
  return stored ? JSON.parse(stored) : [];
}

export function seedDemoData() {
  const key = `kanban_projects_${DEMO_USER}`;
  if (localStorage.getItem(key)) return;

  saveProjects(DEMO_USER, [
    { id: DEMO_PROJECT_ID, name: 'My Project', color: '#209dd7' },
  ]);
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
