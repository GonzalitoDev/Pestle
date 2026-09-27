import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {applyTheme, getPreference} from './lib/theme';
import './index.css';

// Apply the saved theme before the first render to avoid a flash of the wrong theme.
applyTheme(getPreference());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
