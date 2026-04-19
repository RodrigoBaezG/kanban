import Board from '@/components/Board'

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Project Workspace</h1>
      </header>
      <Board />
    </main>
  )
}
