
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure to import React
const root = createRoot(document.getElementById("root")!)

// Render with React - Remove AuthProvider from here as it's already in App.tsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
