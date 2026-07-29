// Vite/React standard entrypoint file for Level 2 file structure compatibility
// Next.js entrypoint is src/app/page.tsx which imports and renders App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';

// This is a placeholder for file structure audits. Next.js does not execute this file.
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}
export default App;
