import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import VoiceContext from './context/VoiceContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VoiceContext>
      <App />
    </VoiceContext>
  </React.StrictMode>
);
