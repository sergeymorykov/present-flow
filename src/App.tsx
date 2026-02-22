import React, { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useParams,
} from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { presentations } from './presentations';
import { Footer } from './components/Footer';

const EditorPageLazy = lazy(() =>
  import('./pages/EditorPage').then((m) => ({ default: m.EditorPage }))
);

const styles: { [key: string]: React.CSSProperties } = {
  app: { minHeight: '100vh', backgroundColor: '#0f0f1a' },
  main: {
    paddingTop: '80px',
    paddingBottom: '60px',
    flex: 1,
    width: '100%',
  },
  home: { padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#fff', textAlign: 'center', marginBottom: '3rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#1a1a2e',
    padding: '2rem',
    borderRadius: '10px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'transform 0.3s',
    display: 'block',
    cursor: 'pointer',
  },
  startBtn: {
    color: '#4ecdc4',
    fontWeight: 'bold',
    marginTop: '1rem',
    display: 'inline-block',
  },
  loader: {
    color: '#fff',
    textAlign: 'center',
    marginTop: '4rem',
    fontSize: '1.5rem',
  },
  error: {
    color: '#fff',
    textAlign: 'center',
    marginTop: '4rem',
    padding: '2rem',
  },
  backLink: {
    color: '#4ecdc4',
    marginTop: '2rem',
    display: 'inline-block',
  },
};

const Home: React.FC = () => (
  <div style={styles.home}>
    <h1 style={styles.title}>Выберите презентацию</h1>
    <div style={styles.grid}>
      {presentations.map((p) => (
        <a key={p.id} href={`/presentation/${p.id}`} style={styles.card}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <span style={styles.startBtn}>Начать →</span>
        </a>
      ))}
    </div>
  </div>
);

const PresentationRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div style={styles.error}>ID презентации не указан</div>;
  }

  const presentation = presentations.find((p) => p.id === id);

  if (!presentation) {
    return (
      <div style={styles.error}>
        <h2>Презентация не найдена</h2>
        <p>ID: {id}</p>
        <p>Доступные презентации:</p>
        <ul>
          {presentations.map((p) => (
            <li key={p.id}>{p.id} - {p.title}</li>
          ))}
        </ul>
        <a href="/" style={styles.backLink}>← На главную</a>
      </div>
    );
  }

  const PresentationComponent = presentation.component;

  return (
    <Suspense fallback={<div style={styles.loader}>Загрузка презентации...</div>}>
      <PresentationComponent />
    </Suspense>
  );
};

const RootLayout: React.FC = () => (
  <div style={styles.app}>
    <Navbar />
    <main style={styles.main}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/editor',
        element: (
          <Suspense fallback={<div style={styles.loader}>Загрузка редактора...</div>}>
            <EditorPageLazy />
          </Suspense>
        ),
      },
      { path: '/presentation/:id', element: <PresentationRoute /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export const App: React.FC = () => <RouterProvider router={router} />;