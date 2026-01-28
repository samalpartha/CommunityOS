import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- HOTFIX: GEMINI SDK URL PATCH ---
// The @google/genai SDK (v1.38.0) seems to construct WebSocket URLs with a double slash (//ws/)
// which causes a 1007 error. We intercept and sanitize the URL here.
const OriginalWebSocket = window.WebSocket;
const PatchedWebSocket = function (url: string | URL, protocols?: string | string[]) {
  let urlString = url.toString();
  if (urlString.includes('generativelanguage.googleapis.com//ws/')) {
    console.warn('⚠️ Patching malformed Gemini WebSocket URL:', urlString);
    urlString = urlString.replace('//ws/', '/ws/');
  }
  return new OriginalWebSocket(urlString, protocols);
} as any;

PatchedWebSocket.prototype = OriginalWebSocket.prototype;
PatchedWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
PatchedWebSocket.OPEN = OriginalWebSocket.OPEN;
PatchedWebSocket.CLOSING = OriginalWebSocket.CLOSING;
PatchedWebSocket.CLOSED = OriginalWebSocket.CLOSED;

window.WebSocket = PatchedWebSocket;
// ------------------------------------


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);