import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isPresentationMode = location.pathname.startsWith('/presentation/');
  const isEditor = location.pathname === '/editor';
  const isHome = location.pathname === '/';

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🖥️ Present Flow
        </Link>

        {!isPresentationMode && (
          <div style={styles.menu}>
            <Link
              to="/calls"
              style={{ ...styles.link, ...(location.pathname === '/calls' ? styles.linkActive : {}) }}
            >
              Звонки
            </Link>
            <Link
              to="/editor"
              style={{ ...styles.link, ...(isEditor ? styles.linkActive : {}) }}
            >
              Редактор
            </Link>
            <Link
              to="/"
              style={{ ...styles.link, ...(isHome ? styles.linkActive : {}) }}
            >
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
    flexShrink: 0,
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
    transition: 'color 0.2s, border-color 0.2s',
    cursor: 'pointer',
    paddingBottom: '2px',
    borderBottom: '2px solid transparent'
  },
  linkActive: {
    color: '#00d9ff',
    fontWeight: 'bold',
    borderBottom: '2px solid #00d9ff'
  },
  backButton: {
    color: '#4ecdc4',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};