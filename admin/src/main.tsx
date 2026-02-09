import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <App />
        <Toaster position="top-right" />
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
