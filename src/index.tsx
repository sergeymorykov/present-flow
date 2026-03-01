import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
  }
});

createRoot(document.getElementById('app')!).render(<App />);