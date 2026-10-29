import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';
import { APP } from './config';

document.title = `${APP.name} — ${APP.tagline.toLowerCase().replace(/\.$/, '')}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
