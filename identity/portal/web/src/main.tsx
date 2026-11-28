import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const appNode = (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  if (rootElement.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootElement, appNode);
  } else {
    ReactDOM.createRoot(rootElement).render(appNode);
  }
}
