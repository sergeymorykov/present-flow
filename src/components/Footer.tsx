import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          Разработка приложений на C++ © {currentYear}
        </p>
      </div>
    </footer>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: '#1a1a2e',
    padding: '1.5rem 2rem',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 'auto',
    borderTop: '1px solid #2a2a4e',
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center'
  },
  text: {
    color: '#8888aa',
    fontSize: '0.9rem',
    margin: 0
  }
};