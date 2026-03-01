import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isPresentationMode = location.pathname.startsWith('/presentation/');

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          📊 Present Flow
        </Link>

        {!isPresentationMode && (
          <div style={styles.menu}>
            <Link to="/editor" style={styles.editorLink}>
              Редактор
            </Link>
            <Link to="/" style={styles.link}>
              Все презентации
            </Link>
          </div>
        )}

        {isPresentationMode && (
          <Link to="/" style={styles.backButton}>
            ← Все презентации
          </Link>
        )}
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    backgroundColor: '#1a1a2e',
    padding: '1rem 2rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  menu: {
    display: 'flex',
    gap: '2rem'
  },
  link: {
    color: '#e0e0e0',
    textDecoration: 'none',
    transition: 'color 0.3s',
    cursor: 'pointer'
  },
  backButton: {
    color: '#4ecdc4',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  editorLink: {
    color: '#00d9ff',
    textDecoration: 'none',
    fontWeight: 'bold',
    borderBottom: '2px solid #00d9ff',
    paddingBottom: '2px'
  }
};